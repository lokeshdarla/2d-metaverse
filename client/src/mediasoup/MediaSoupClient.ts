// import * as mediasoupClient from 'mediasoup-client';
// import io from 'socket.io-client';

// const socket = io('http://localhost:3000');
// let device: mediasoupClient.Device;
// let sendTransport: any;

// interface TransportOptions {
//   id: string;
//   iceParameters: object;
//   iceCandidates: object[];
//   dtlsParameters: object;
// }

// export async function initializeDevice(): Promise<void> {
//   try {
//     device = new mediasoupClient.Device();

//     // Requesting RTP capabilities from the server
//     const routerRtpCapabilities: object = await new Promise((resolve, reject) => {
//       socket.emit('get-router-rtp-capabilities', (response: { capabilities: object }) => {
//         if (response && response.capabilities) {
//           resolve(response.capabilities);
//         } else {
//           reject('Failed to get RTP capabilities');
//         }
//       });
//     });

//     // Load device with RTP capabilities from server
//     await device.load({ routerRtpCapabilities });
//   } catch (error) {
//     console.error('Error initializing device:', error);
//   }
// }

// export async function createSendTransport(): Promise<void> {
//   try {
//     // Request to create transport on the server
//     const transportOptions = await new Promise<TransportOptions>((resolve, reject) => {
//       socket.emit('create-transport', (response: { data: TransportOptions }) => {
//         if (response && response.data) {
//           resolve(response.data);
//         } else {
//           reject('Failed to create transport');
//         }
//       });
//     });

//     // Access SendTransport through device.createSendTransport
//     sendTransport = device.createSendTransport(transportOptions);

//     sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
//       socket.emit('connect-transport', { dtlsParameters }, (response: { error?: string }) => {
//         if (response.error) {
//           errback(response.error);
//         } else {
//           callback();
//         }
//       });
//     });

//     // Get user media (audio and video)
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     const videoTrack = stream.getVideoTracks()[0];

//     // Produce the video track to the transport
//     await sendTransport.produce({ track: videoTrack });
//   } catch (error) {
//     console.error('Error creating send transport:', error);
//   }
// }
