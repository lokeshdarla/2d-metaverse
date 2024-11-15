import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface Ball {
  id: string;
  color: string;
  position: { x: number; y: number };
}

@WebSocketGateway(3001, { cors: '*', transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('BallGameGateway');
  private balls: Ball[] = [];

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove the disconnected client's ball
    this.balls = this.balls.filter(ball => ball.id !== client.id);
    console.log(`Updated balls after disconnect: `, this.balls);

    // Broadcast the updated list of balls
    this.server.emit('updateBalls', this.balls);
  }

  @SubscribeMessage('moveBall')
  handleBallMove(
    @MessageBody() data: { id: string; position: { x: number; y: number } },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Received moveBall event from ${client.id}:`, data);

    // Update the position of the ball associated with the client
    const ballIndex = this.balls.findIndex(ball => ball.id === data.id);
    if (ballIndex !== -1) {
      this.balls[ballIndex].position = data.position;
      console.log(`Updated ball position for ${client.id}:`, this.balls[ballIndex]);
    } else {
      console.log(`Ball with id ${data.id} not found`);
    }

    // Broadcast the updated list of balls to all clients
    this.server.emit('updateBalls', this.balls);
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() data: { color: string; position: { x: number; y: number } },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Received joinGame event from ${client.id}`);

    const newBall: Ball = { id: client.id, color: data.color, position: data.position };
    this.balls.push(newBall);

    // Log the new ball and broadcast the updated list of balls
    this.logger.log(`User ${client.id} joined with color: ${data.color}`);
    console.log(`Current balls after ${client.id} joined:`, this.balls);

    this.server.emit('updateBalls', this.balls);
  }
}
