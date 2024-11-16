import React from 'react';
import { useVideoCall } from './VideoCallContext';

const VideoCall: React.FC = () => {
  const {
    isCalling,
    remoteStreams,
    isCameraOn,
    isMicOn,
    localVideoRef,
    handleStartCall,
    toggleCamera,
    toggleMic,
    endCall,
  } = useVideoCall();

  return (
    <div>
      {/* Local Video */}
      <video ref={localVideoRef} autoPlay muted style={{ width: '200px' }} />

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
