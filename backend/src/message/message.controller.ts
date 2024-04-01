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
import { MessageService } from './message.service';
import { Message } from './message.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserAuth } from 'src/utilities/user.decorator';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  /***************************************
   * GET
   ***************************************/

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMeta(@UserAuth() user: IUserJwt) {
    // return this.messageService.findAllByIdWithMeta(user.id);
  }

  /***************************************
   * POST
   ***************************************/

  @UseGuards(JwtAuthGuard)
  @Post('me')
  saveMessage(
    @UserAuth() user: IUserJwt,
    @Body() message: CreateMessageDto,
  ): Promise<Message> {
    return this.messageService.saveMessage(user, message);
  }
}
