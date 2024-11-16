import React, { useRef, useEffect, useState } from "react";
import io, { Socket } from 'socket.io-client';

interface IRemoteStream {
  id: string,
  stream: MediaStream,
  isMicOn: boolean;
}

const VideoCall: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [remoteStreams, setRemoteStreams] = useState<IRemoteStream[]>([]);

  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleToggleMic = (data: { isMicOn: boolean, userId: string }) => {
    setRemoteStreams((prevStreams) =>
      prevStreams.map((stream) =>
        stream.id == data.userId ? { ...stream, isMicOn: data.isMicOn } : stream
      )
    );
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit, userId: string) => {
    console.log('Received offer from user: ', userId, offer);
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    if (localStreamRef.current) {
      console.log('Adding local tracks to peer connection...');
      // @ts-ignore
      if (localStreamRef.current) {
        // @ts-ignore
        localStreamRef.current.getTracks().forEach((track) => peerConnection.addTrack(track, localStreamRef.current))
      }
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    console.log('Remote description set.');

    const answer = await peerConnection.createAnswer();
    console.log('Created answer: ', answer);
    await peerConnection.setLocalDescription(answer);
    console.log('Local description set.');

    socketRef.current?.emit('answer', answer);
    console.log('Answer sent to server.');

    peerConnection.ontrack = (event: RTCTrackEvent) => {
      console.log('Received remote track from user:', userId);
      setRemoteStreams((prevStreams) => [
        ...prevStreams,
        { id: userId, stream: event.streams[0], isMicOn: true }, // Default mic is on
      ]);
    };
  }


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

  return (
    <>
    </>
  )
}
