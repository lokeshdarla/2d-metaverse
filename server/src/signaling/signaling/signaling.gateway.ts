import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(3002, { cors: '*', transports: ['websocket'] })
export class SignalingGateway {
  // Map to store room and client relationships
  private rooms: Record<string, Set<string>> = {};

  // Handle client joining a room
  // Handle client joining a room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    console.log(`Client ${client.id} joined room: ${roomId}`);

    // Add the client to the room
    client.join(roomId);

    // Track the client in the server-side room map
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = new Set();
    }
    this.rooms[roomId].add(client.id);

    // Notify other peers in the room about the new peer
    client.to(roomId).emit('peerJoined', { userId: client.id });
    console.log(`Peer joined notification sent to room ${roomId}`);
  }


  // Handle incoming offer
  @SubscribeMessage('offer')
  handleOffer(@MessageBody() { roomId, offer }: { roomId: string; offer: string }, @ConnectedSocket() client: Socket) {
    console.log(`[OFFER] Received offer from ${client.id} in room ${roomId}`);
    // Send the offer to other peers in the room
    client.to(roomId).emit('offer', { peerId: client.id, offer });
  }

  // Handle incoming answer
  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() { roomId, answer }: { roomId: string; answer: string }, @ConnectedSocket() client: Socket) {
    console.log(`[ANSWER] Received answer from ${client.id} in room ${roomId}`);
    // Send the answer to other peers in the room
    client.to(roomId).emit('answer', { userId: client.id, answer, });
  }

  // Handle incoming ICE candidate
  @SubscribeMessage('candidate')
  handleCandidate(@MessageBody() { roomId, candidate }: { roomId: string; candidate: string }, @ConnectedSocket() client: Socket) {
    console.log(`Received ICE candidate from ${client.id} in room ${roomId}`);
    // Send the ICE candidate to other peers in the room
    client.to(roomId).emit('candidate', { candidate, userId: client.id });
  }

  // Handle camera toggle
  @SubscribeMessage('toggleCamera')
  handleToggleCamera(@MessageBody() { roomId, isCameraOn }: { roomId: string; isCameraOn: boolean }, @ConnectedSocket() client: Socket) {
    console.log(`Camera toggled in room ${roomId}: ${isCameraOn ? 'On' : 'Off'}`);
    // Send the camera status to other peers in the room
    client.to(roomId).emit('toggleCamera', { isCameraOn, userId: client.id });
  }

  // Handle microphone toggle
  @SubscribeMessage('toggleMic')
  handleToggleMic(@MessageBody() { roomId, isMicOn }: { roomId: string; isMicOn: boolean }, @ConnectedSocket() client: Socket) {
    console.log(`Mic toggled in room ${roomId}: ${isMicOn ? 'On' : 'Off'}`);
    // Send the mic status to other peers in the room
    client.to(roomId).emit('toggleMic', { isMicOn, userId: client.id });
  }

  // Handle call end
  @SubscribeMessage('endCall')
  handleEndCall(@MessageBody() { roomId }: { roomId: string }, @ConnectedSocket() client: Socket) {
    console.log(`Call ended in room ${roomId} by client ${client.id}`);
    // Notify other peers in the room that the call has ended
    client.to(roomId).emit('endCall', { userId: client.id });
  }


  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    console.log(`Client ${client.id} left room: ${roomId}`);

    if (this.rooms[roomId] && this.rooms[roomId].has(client.id)) {
      this.rooms[roomId].delete(client.id);

      // Notify other peers in the room
      client.to(roomId).emit('peerLeft', { userId: client.id });
      console.log(`Peer left notification sent to room ${roomId}`);

      // Clean up room if no clients remain
      if (this.rooms[roomId].size === 0) {
        delete this.rooms[roomId];
      }
    }

    // Leave the room on the Socket.IO side
    client.leave(roomId);
  }


  // Handle client disconnect
  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove the client from all rooms
    for (const [roomId, clients] of Object.entries(this.rooms)) {
      if (clients.has(client.id)) {
        clients.delete(client.id);

        // Notify other peers in the room that the peer left
        client.to(roomId).emit('peerLeft', { userId: client.id });
        console.log(`Peer left notification sent to room ${roomId}`);

        // Clean up room if no clients remain
        if (clients.size === 0) {
          delete this.rooms[roomId];
        }
      }
    }
  }

}
