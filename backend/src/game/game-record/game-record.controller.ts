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
import { GameRecordService } from './game-record.service';
import { GameRecord } from './game-record.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserAuth } from 'src/utilities/user.decorator';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';

@Controller('game-record')
export class GameRecordController {
  constructor(private readonly gameRecordService: GameRecordService) {}

  @Get()
  async findAll(): Promise<GameRecord[]> {
    return this.gameRecordService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findWithMeta(@UserAuth() user: IUserJwt): Promise<GameRecord[]> {
    return this.gameRecordService.findWithMeta(user.id);
  }
}
