// mediasoup.gateway.ts

import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MediasoupService } from './mediasoup.service';

@WebSocketGateway()
export class MediasoupGateway {
  @WebSocketServer() server;

  constructor(private readonly mediasoupService: MediasoupService) { }

  @SubscribeMessage('create-transport')
  async handleCreateTransport(@MessageBody() peerId: string) {
    const transportOptions = await this.mediasoupService.createWebRtcTransport(peerId);
    return { event: 'transport-created', data: transportOptions };
  }

  @SubscribeMessage('connect-transport')
  async handleConnectTransport(@MessageBody() { peerId, dtlsParameters }) {
    await this.mediasoupService.connectTransport(peerId, dtlsParameters);
    return { event: 'transport-connected' };
  }
}
