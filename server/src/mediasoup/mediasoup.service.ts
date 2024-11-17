// mediasoup.service.ts

import { Injectable } from '@nestjs/common';
import * as mediasoup from 'mediasoup';

@Injectable()
export class MediasoupService {
  private worker;
  private router;
  private transports = new Map<string, mediasoup.types.WebRtcTransport>();

  constructor() {
    this.createWorker();
  }

  async createWorker() {
    this.worker = await mediasoup.createWorker({
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
      logLevel: 'warn',
    });

    this.worker.on('died', () => {
      console.error('Mediasoup Worker has died');
      process.exit(1);
    });

    this.router = await this.worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
        },
      ],
    });
  }

  async createWebRtcTransport(peerId: string) {
    const transport = await this.router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: null }],
      enableUdp: true,
      enableTcp: true,
    });

    this.transports.set(peerId, transport);

    return {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    };
  }

  async connectTransport(peerId: string, dtlsParameters) {
    const transport = this.transports.get(peerId);
    if (transport) {
      await transport.connect({ dtlsParameters });
    }
  }
}
