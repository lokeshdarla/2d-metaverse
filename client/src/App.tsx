// import React from 'react';
// import { VideoCallProvider } from './VideoCallContext';
// import VideoCall from './VideoCall';

// const App: React.FC = () => {
//   return (
//     <VideoCallProvider>
//       <VideoCall />
//     </VideoCallProvider>
//   );
// };

// export default App;\

import { SocketProvider } from './hooks/SocketContext';
import VideoCall from './VideoCall';

const App = () => {
  return (
    <SocketProvider>
      <VideoCall />
    </SocketProvider>
  );
};

export default App;

