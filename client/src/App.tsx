import AgoraUIKit from 'agora-react-uikit';
import BallGame from './area/ChatComponent';

const App = () => {
  const rtcProps = {
    appId: 'e7f6e9aeecf14b2ba10e3f40be9f56e7',
    channel: 'metaverse-sandbox',
    token: '007eJxTYOhQWiPQ/Mk/Obtz7sq37Meqm+4cvty4+oxNwVTus0ySjKoKDJaJKRZJpiamZgaJJiZGaSlJpsZpRmZpJgYploYGBqaJDTMs0xsCGRlebONnYIRCEF+QITe1JLEstag4Vbc4MS8lKb+CgQEA9v0kEA==',
  };

  const styleProps = {
    // Container for the entire UIKit
    UIKitContainer: {
      backgroundColor: '#1E1E1E', // Dark background
      height: '100vh',
      padding: '20px',
    },
    // Style for individual video cells in the grid
    gridVideoCells: {
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)', // Floating shadow effect
    },
  };

  return (
    <div className="flex justify-center items-center ">
      <div className="grid grid-cols-5  w-full">
        {/* Agora Video Call Section */}
        <div className="col-span-1">
          <AgoraUIKit styleProps={styleProps} rtcProps={rtcProps} />
        </div>

        {/* Ball Game Section */}
        <div className="col-span-4">
          <BallGame />
        </div>
      </div>
    </div>
  );
};

export default App;
