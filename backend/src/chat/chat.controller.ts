import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from './chat.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserAuth } from 'src/utilities/user.decorator';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { CreateChatDto } from './dto/create-chat.dto';
import { leaveMode } from './enums/leave-mode.enum';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /***************************************
   * GET
   ***************************************/

  @UseGuards(JwtAuthGuard)
  @Get('public')
  getPublicChats(@UserAuth() user: IUserJwt) {
    // console.log('[public] user:', user); // ?  debug
    return this.chatService.findPublicChats(user.id);
  }

  /***************************************
   * POST
   ***************************************/
}
