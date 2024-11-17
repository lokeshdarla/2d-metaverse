import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

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
  const [roomId, setRoomId] = useState<string>('');
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };


  const [socket, setSocket] = useState<any | null>(null);
  let socketInstance: any;
  // const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);


  const peerConnectionsRef = useRef<{ [id: string]: RTCPeerConnection }>({});

  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    console.log(`Creating peer connection ${peerId}`)
    const peerConnection = new RTCPeerConnection(iceServers);

    // Add local stream
    if (localVideoRef.current?.srcObject) {
      const localStream = localVideoRef.current.srcObject as MediaStream;
      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setRemoteStreams((prev) => ({ ...prev, [peerId]: remoteStream }));
      console.log(remoteStream);
      console.log('PEERCONNECTION ON TRACK');
      console.log(remoteStreams);
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
      }
    };

    // Save peer connection in ref (to avoid stale state)
    peerConnectionsRef.current[peerId] = peerConnection;

    // Optionally, trigger a state update to re-render the component
    setPeerConnections((prev) => ({ ...prev, [peerId]: peerConnection }));

    return peerConnection;
  };



  // Initialize socket connection
  useEffect(() => {
    socketInstance = io('http://localhost:3002', {
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to signaling server');
    });

    // When a new peer joins
    socketInstance.on('peerJoined', async ({ userId }: { userId: string }) => {
      console.log(`New peer joined: ${userId}`);
      console.log(!peerConnections[userId]);
      if (!peerConnections[userId]) {
        console.log("Into if universe")
        const peerConnection = createPeerConnection(userId);

        // Create an offer and send it to the new peer
        const offer = await peerConnection.createOffer();
        console.log("waiting to set LocalDescription in  if universe")
        await peerConnection.setLocalDescription(offer);
        console.log("Finally remote description has been set");
        sendOffer('room123', offer);
      }
    });

    // Handle incoming offer
    socketInstance.on('offer', async ({ peerId, offer }: { peerId: string; offer: RTCSessionDescriptionInit }) => {
      console.log(`[OFFER] Received offer from ${peerId} in room ${'room123'}`);
      if (!peerConnections[peerId]) {
        console.log('creating a peerConnection')
        const peerConnection = createPeerConnection(peerId);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        sendAnswer('room123', answer);
      }
    });

    // Handle incoming answer
    socketInstance.on('answer', async ({ peerId, answer }: { peerId: string; answer: RTCSessionDescriptionInit }) => {
      console.log(peerConnections);
      console.log(peerId);
      const peerConnection = peerConnections[peerId];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Answer set for peer: ${peerId}`);
      }
    });

    // Handle ICE candidates
    socketInstance.on('candidate', async ({ peerId, candidate }: { peerId: string; candidate: RTCIceCandidate }) => {
      const peerConnection = peerConnections[peerId];
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`ICE candidate added for peer: ${peerId}`);
      }
    });

    // Handle peer disconnection
    socketInstance.on('peerLeft', ({ peerId }: { peerId: string }) => {
      console.log(`Peer left: ${peerId}`);
      const peerConnection = peerConnections[peerId];
      if (peerConnection) {
        peerConnection.close();

        // Clean up state
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

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
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
    setRoomId(roomId);
  };

  const sendOffer = (roomId: string, offer: RTCSessionDescriptionInit) => {

    if (socketInstance) {
      console.log(`Sending the offer to the room: ${roomId}`);
      socketInstance.emit('offer', { roomId, offer });
    }
  };

  const sendAnswer = (roomId: string, answer: RTCSessionDescriptionInit) => {
    if (socketInstance) {
      console.log(`[ANSWER] sending answer to the room`);
      socketInstance.emit('answer', { roomId, answer });
    }
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
