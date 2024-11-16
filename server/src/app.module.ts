import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { SignalingModule } from './signaling/signaling.module';

@Module({
  imports: [ChatModule, SignalingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
