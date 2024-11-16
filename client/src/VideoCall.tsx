import { useSocket } from "./hooks/SocketContext";
import { RemoteVideos } from "./RemoteVideos";

const VideoCall = () => {
  const { joinRoom, localVideoRef } = useSocket();

  return (
    <div>
      {localVideoRef && <video ref={localVideoRef} autoPlay muted></video>}

      <RemoteVideos />
      <button onClick={() => joinRoom('room123')}>Join Room</button>
    </div>
  );
};

export default VideoCall;
