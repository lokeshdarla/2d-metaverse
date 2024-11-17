import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

interface RemoteStream {
  id: string;
  stream: MediaStream;
  isMicOn: boolean;
}

interface VideoCallContextProps {
  socketRef: any,
  isCalling: boolean;
  remoteStreams: RemoteStream[];
  isCameraOn: boolean;
  isMicOn: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  handleStartCall: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  endCall: () => void;
}

const VideoCallContext = createContext<VideoCallContextProps | undefined>(undefined);

interface VideoCallProviderProps {
  children: React.ReactNode;
}

export const VideoCallProvider: React.FC<VideoCallProviderProps> = ({ children }) => {
  const socketRef = useRef<any | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);


  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    socketRef.current = io('http://localhost:3002', { transports: ['websocket'] });

    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('candidate', handleCandidate);
    socketRef.current.on('toggleMic', handleToggleMic);

    const getMedia = async () => {
      console.log('Accessing user media...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      } catch (err) {
        console.error('Error accessing user media:', err);
      }
    };

    getMedia();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleToggleMic = (data: { isMicOn: boolean; userId: string }) => {
    console.log("Toggling Mic");
    setRemoteStreams((prevStreams) =>
      prevStreams.map((stream) =>
        stream.id === data.userId ? { ...stream, isMicOn: data.isMicOn } : stream
      )
    );
  };

  const handleOffer = async (data: { offer: RTCSessionDescriptionInit; userId: string }) => {
    console.log("Received offer from user:", data.userId, data.offer);
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    // peerConnection.onicecandidate = (event) => {
    //   if (event.candidate) {
    //     console.log("Sending ICE candidate:", event.candidate);
    //     socketRef.current?.emit("candidate", { candidate: event.candidate, to: data.userId });
    //   }
    // };

    if (localStreamRef.current) {
      console.log("Adding local tracks to peer connection...");
      // @ts-ignore
      localStreamRef.current.getTracks().forEach((track) => peerConnection.addTrack(track, localStreamRef.current));
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    console.log("Remote description set.");

    const answer = await peerConnection.createAnswer();
    console.log("Created answer:", answer);
    await peerConnection.setLocalDescription(answer);
    console.log("Local description set.");

    socketRef.current?.emit('answer', answer);
    console.log("Answer sent to server.");


    peerConnection.ontrack = (event: RTCTrackEvent) => {
      console.log("Received remote track from user:", data.userId);

      const existingStream = remoteStreams.find(stream => stream.id === data.userId);
      if (!existingStream && socketRef.current.id !== data.userId) {
        setRemoteStreams((prevStreams) => [
          ...prevStreams,
          { id: data.userId, stream: event.streams[0], isMicOn: true },
        ]);
      }
    };
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    console.log('Received answer:', answer);
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Remote description set.');
        return;
      } catch (error) {
        console.error('Failed to set remote description:', error);
      }
    }
  };

  const handleCandidate = (candidate: RTCIceCandidateInit) => {
    console.log('Received ICE candidate:', candidate);
    const iceCandidate = new RTCIceCandidate(candidate);
    peerConnectionRef.current?.addIceCandidate(iceCandidate);
    return;
  };

  const handleStartCall = async () => {
    console.log("Starting call...");
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    if (localStreamRef.current) {
      console.log("Adding local tracks to peer connection...");
      // @ts-ignore
      localStreamRef.current.getTracks().forEach((track) => peerConnection.addTrack(track, localStreamRef.current));
    }

    const offer = await peerConnection.createOffer();
    console.log("Created offer:", offer);
    await peerConnection.setLocalDescription(offer);
    console.log("Local description set.");

    socketRef.current?.emit('offer', offer);
    console.log("Offer sent to server.");

    peerConnection.ontrack = (event: RTCTrackEvent) => {
      const userId = socketRef.current.id; // Example: generate a unique ID
      console.log("Received remote track from user:", userId);

      const existingStream = remoteStreams.find(stream => stream.id === userId);

      if (!existingStream && socketRef.current.id != userId) {
        setRemoteStreams((prevStreams) => [
          ...prevStreams,
          { id: userId, stream: event.streams[0], isMicOn: true },
        ]);
      }
    };

    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        console.log("Sending ICE candidate...");
        socketRef.current?.emit('candidate', event.candidate);
      }
    };

    setIsCalling(true);
    console.log("Call initiated.");
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);

      socketRef.current?.emit('toggleMic', audioTrack.enabled);
    }
  };

  const endCall = () => {
    console.log('Ending call...');
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    socketRef.current?.emit('endCall');
    setIsCalling(false);
    setRemoteStreams([]);
  };

  return (
    <VideoCallContext.Provider
      value={{
        socketRef,
        isCalling,
        remoteStreams,
        isCameraOn,
        isMicOn,
        localVideoRef,
        handleStartCall,
        toggleCamera,
        toggleMic,
        endCall,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within a VideoCallProvider');
  }
  return context;
};
