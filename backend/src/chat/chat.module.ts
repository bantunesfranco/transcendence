import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { UserModule } from 'src/user/user.module';
import { ChatGateway } from './gateways/chat.gateway';
import { ActiveChat } from './active-chat/active-chat.entity';
import { Message } from 'src/message/message.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ActiveChat, Message]),
    UserModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, AuthService],
  exports: [ChatService],
})
export class ChatModule {}
