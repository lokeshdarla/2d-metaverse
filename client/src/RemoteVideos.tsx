import { useEffect } from "react";
import { useSocket } from "./hooks/SocketContext";

export const RemoteVideos = () => {
  const { remoteStreams } = useSocket();

  // Check if remoteStreams is an object and if it's not empty
  const remoteStreamKeys = Object.keys(remoteStreams);
  useEffect(() => {
    console.log(remoteStreams);
  }, [remoteStreams]);

  return (
    <div>
      <p>Number of remote streams: {remoteStreamKeys.length}</p>
      {remoteStreamKeys.map((peerId) => (
        <video
          style={{
            'border': '2px solid aliceblue'
          }
          }
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
