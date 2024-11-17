// // CORE-SDK
import AgoraUIKit from 'agora-react-uikit';

const App = () => {
  const rtcProps = {
    appId: 'e7f6e9aeecf14b2ba10e3f40be9f56e7',
    channel: 'metaverse-sandbox',
    token: '007eJxTYOhQWiPQ/Mk/Obtz7sq37Meqm+4cvty4+oxNwVTus0ySjKoKDJaJKRZJpiamZgaJJiZGaSlJpsZpRmZpJgYploYGBqaJDTMs0xsCGRlebONnYIRCEF+QITe1JLEstag4Vbc4MS8lKb+CgQEA9v0kEA==', // enter your channel token as a string 
  };
  return (
    <AgoraUIKit rtcProps={rtcProps} />
  )
};

export default App;


// import React from 'react'
// import Basics from './agora-components/Basics'

// const App = () => {
//   return (
//     <Basics />
//   )
// }

// export default App
