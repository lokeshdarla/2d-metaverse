import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const VideoCall: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [remoteStreams, setRemoteStreams] = useState<{
    id: string;
    stream: MediaStream;
    isMicOn: boolean;
  }[]>([]);

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
    setRemoteStreams((prevStreams) =>
      prevStreams.map((stream) =>
        stream.id === data.userId ? { ...stream, isMicOn: data.isMicOn } : stream
      )
    );
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, userId: string) => {
    console.log("Received offer from user:", userId, offer);
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    if (localStreamRef.current) {
      console.log("Adding local tracks to peer connection...");
      // @ts-ignore
      localStreamRef.current.getTracks().forEach((track) => peerConnection.addTrack(track, localStreamRef.current));
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("Remote description set.");

    const answer = await peerConnection.createAnswer();
    console.log("Created answer:", answer);
    await peerConnection.setLocalDescription(answer);
    console.log("Local description set.");

    socketRef.current?.emit('answer', answer);
    console.log("Answer sent to server.");

    // Ensure that we don't add duplicate streams to the remoteStreams state
    peerConnection.ontrack = (event: RTCTrackEvent) => {
      console.log("Received remote track from user:", userId);

      // Check if this stream is already in the remoteStreams state
      const existingStream = remoteStreams.find(stream => stream.id === userId);

      // If the stream is not already in the state, add it
      if (!existingStream) {
        setRemoteStreams((prevStreams) => [
          ...prevStreams,
          { id: userId, stream: event.streams[0], isMicOn: true }, // Default mic is on
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
      } catch (error) {
        console.error('Failed to set remote description:', error);
      }
    }
  };

  const handleCandidate = (candidate: RTCIceCandidateInit) => {
    console.log('Received ICE candidate:', candidate);
    const iceCandidate = new RTCIceCandidate(candidate);
    peerConnectionRef.current?.addIceCandidate(iceCandidate);
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

    // Ensure that we don't add duplicate streams to the remoteStreams state
    peerConnection.ontrack = (event: RTCTrackEvent) => {
      const userId = "user_" + Date.now(); // Example: generate a unique ID
      console.log("Received remote track from user:", userId);

      // Check if this stream is already in the remoteStreams state
      const existingStream = remoteStreams.find(stream => stream.id === userId);

      // If the stream is not already in the state, add it
      if (!existingStream) {
        setRemoteStreams((prevStreams) => [
          ...prevStreams,
          { id: userId, stream: event.streams[0], isMicOn: true }, // Default mic is on
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

      // Notify server about the mic status change
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
    <div>
      {/* Local Video */}
      {/* <video ref={localVideoRef} autoPlay muted style={{ width: '200px' }} /> */}

      {/* Remote Videos */}
      <div>
        {remoteStreams.map((streamObj, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <p>User ID: {streamObj.id}</p>
            <p>Mic: {streamObj.isMicOn ? 'On' : 'Off'}</p>
            <video
              ref={(el) => {
                if (el) {
                  el.srcObject = streamObj.stream;
                }
              }}
              autoPlay
              style={{ width: '200px' }}
            />
          </div>
        ))}
      </div>

      {/* Call Controls */}
      <button onClick={handleStartCall} disabled={isCalling}>
        Start Call
      </button>

      {isCalling && (
        <div>
          <button onClick={toggleCamera}>
            {isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          </button>
          <button onClick={toggleMic}>
            {isMicOn ? 'Mute Mic' : 'Unmute Mic'}
          </button>
          <button onClick={endCall}>End Call</button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
