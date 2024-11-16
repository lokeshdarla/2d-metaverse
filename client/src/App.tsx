import React from 'react';
import { VideoCallProvider } from './VideoCallContext';
import VideoCall from './VideoCall';

const App: React.FC = () => {
  return (
    <VideoCallProvider>
      <VideoCall />
    </VideoCallProvider>
  );
};

export default App;
