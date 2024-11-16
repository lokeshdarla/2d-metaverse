import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(3002, { cors: '*', transports: ['websocket'] })
export class SignalingGateway {

  // Handle incoming offer
  @SubscribeMessage('offer')
  handleOffer(@MessageBody() offer: string, @ConnectedSocket() client: Socket) {
    console.log('Received offer:', offer);
    // Send the offer to the other peer
    client.broadcast.emit('offer', offer);
    console.log('Offer sent to other peer.');

  }

  // Handle incoming answer
  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() answer: string, @ConnectedSocket() client: Socket) {
    console.log('Received answer:', answer);
    // Send the answer to the other peer
    client.broadcast.emit('answer', answer);
    console.log('Answer sent to other peer.');
  }

  // Handle incoming ICE candidate
  @SubscribeMessage('candidate')
  handleCandidate(@MessageBody() candidate: string, @ConnectedSocket() client: Socket) {
    console.log('Received ICE candidate:', candidate);
    // Send the ICE candidate to the other peer
    client.broadcast.emit('candidate', candidate);
    console.log('ICE candidate sent to other peer.');
  }

  // Handle camera toggle
  @SubscribeMessage('toggleCamera')
  handleToggleCamera(@MessageBody() isCameraOn: boolean, @ConnectedSocket() client: Socket) {
    console.log(`Camera toggled: ${isCameraOn ? 'On' : 'Off'}`);
    // Send the camera status to the other peer
    client.broadcast.emit('toggleCamera', isCameraOn);
    console.log('Camera status sent to other peer.');
  }

  // Handle microphone toggle
  @SubscribeMessage('toggleMic')
  handleToggleMic(@MessageBody() isMicOn: boolean, @ConnectedSocket() client: Socket) {
    console.log(`Mic toggled: ${isMicOn ? 'On' : 'Off'}`);
    // Send the mic status to the other peer
    client.broadcast.emit('toggleMic', { isMicOn, userId: client.id });
    console.log('Mic status sent to other peer.');
  }

  // Handle call end
  @SubscribeMessage('endCall')
  handleEndCall(@MessageBody() message: string, @ConnectedSocket() client: Socket) {
    console.log('Call ended');
    // Notify other peer that the call has ended
    client.broadcast.emit('endCall', message);
    console.log('Call end notification sent to other peer.');
  }
}
