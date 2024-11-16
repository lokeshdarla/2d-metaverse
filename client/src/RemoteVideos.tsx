import { useSocket } from "./hooks/SocketContext";

export const RemoteVideos = () => {
  const { remoteStreams } = useSocket();

  return (
    <div>
      {remoteStreams.length}
      {Object.keys(remoteStreams).map((peerId) => (
        <video
          key={peerId}
          autoPlay
          ref={(video) => {
            if (video) video.srcObject = remoteStreams[peerId];
          }}
        ></video>
      ))}
    </div>
  );
};
