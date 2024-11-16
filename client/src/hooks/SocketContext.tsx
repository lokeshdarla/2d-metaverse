import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import io from 'socket.io-client';

// Define types for the context value
interface SocketContextProps {
  socket: any | null;
  joinRoom: (roomId: string) => void;
  sendOffer: (roomId: string, offer: RTCSessionDescriptionInit) => void;
  sendAnswer: (roomId: string, answer: RTCSessionDescriptionInit) => void;
  sendCandidate: (roomId: string, candidate: RTCIceCandidate) => void;
  toggleCamera: (roomId: string, isCameraOn: boolean) => void;
  toggleMic: (roomId: string, isMicOn: boolean) => void;
  endCall: (roomId: string) => void;
  localVideoRef: HTMLVideoElement;
  remoteStreams: any
}

// Create context
const SocketContext = createContext<SocketContextProps | undefined>(undefined);

// Props for the provider component
interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [peerConnections, setPeerConnections] = useState<{ [id: string]: RTCPeerConnection }>({});
  const [remoteStreams, setRemoteStreams] = useState<{ [id: string]: MediaStream }>({});
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
    ],
  };

  const [socket, setSocket] = useState<any | null>(null);
  // const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);


  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(iceServers);

    // Add local stream to peer connection
    if (localVideoRef.current?.srcObject) {
      const localStream = localVideoRef.current.srcObject as MediaStream;
      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStreams((prev) => ({ ...prev, [peerId]: remoteStream }));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendCandidate(peerId, event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
        setPeerConnections((prev) => {
          const updated = { ...prev };
          delete updated[peerId];
          return updated;
        });
        console.log(`Peer ${peerId} disconnected`);
      }
    };

    // Save the peer connection
    setPeerConnections((prev) => ({ ...prev, [peerId]: peerConnection }));

    return peerConnection;
  };


  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io('http://localhost:3002', {
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to signaling server');
    });

    socketInstance.on('peerJoined', ({ userId }: { userId: string }) => {
      console.log(`Peer joined: ${userId}`);
    });

    socket?.on('offer', async ({ peerId, offer }: { peerId: string; offer: RTCSessionDescriptionInit }) => {
      const peerConnection = createPeerConnection(peerId);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      sendAnswer(peerId, answer);
    });


    socket?.on('answer', async ({ peerId, answer }: { peerId: string; answer: RTCSessionDescriptionInit }) => {
      const peerConnection = peerConnections[peerId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Answer set for peer: ${peerId}`);
      }
    });


    socket?.on('candidate', async ({ peerId, candidate }: { peerId: string; candidate: RTCIceCandidate }) => {
      const peerConnection = peerConnections[peerId];
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`ICE candidate added for peer: ${peerId}`);
      }
    });

    socket?.on('peerJoined', async ({ peerId }: { peerId: string }) => {
      console.log(`Peer joined: ${peerId}`);
      const peerConnection = createPeerConnection(peerId);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      sendOffer(peerId, offer);
    });

    socket?.on('peerLeft', ({ peerId }: { peerId: string }) => {
      console.log(`Peer left: ${peerId}`);
      const peerConnection = peerConnections[peerId];
      if (peerConnection) {
        peerConnection.close();
        setPeerConnections((prev) => {
          const updated = { ...prev };
          delete updated[peerId];
          return updated;
        });
        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[peerId];
          return updated;
        });
      }
    });

    socketInstance.on('toggleCamera', (data: any) => {
      console.log('Camera toggle status:', data);
    });

    socketInstance.on('toggleMic', (data: any) => {
      console.log('Mic toggle status:', data);
    });

    socketInstance.on('endCall', (data: any) => {
      console.log('Call ended:', data);
    });

    socketInstance.on('peerLeft', ({ userId }: { userId: string }) => {
      console.log(`Peer left: ${userId}`);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

      })
      .catch((error) => {
        console.error('Error accessing media devices.', error);
      });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinRoom = (roomId: string) => {
    socket?.emit('joinRoom', roomId);
    console.log(`Joined room: ${roomId}`);
  };

  const sendOffer = (roomId: string, offer: RTCSessionDescriptionInit) => {
    socket?.emit('offer', { roomId, offer });
  };

  const sendAnswer = (roomId: string, answer: RTCSessionDescriptionInit) => {
    socket?.emit('answer', { roomId, answer });
  };

  const sendCandidate = (roomId: string, candidate: RTCIceCandidate) => {
    socket?.emit('candidate', { roomId, candidate });
  };

  const toggleCamera = (roomId: string, isCameraOn: boolean) => {
    socket?.emit('toggleCamera', { roomId, isCameraOn });
  };

  const toggleMic = (roomId: string, isMicOn: boolean) => {
    socket?.emit('toggleMic', { roomId, isMicOn });
  };

  const endCall = (roomId: string) => {
    socket?.emit('endCall', { roomId });
  };

  const value = {
    socket,
    joinRoom,
    sendOffer,
    sendAnswer,
    sendCandidate,
    toggleCamera,
    toggleMic,
    endCall,
    localVideoRef,
    remoteStreams
  };

  // @ts-ignore
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextProps => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
