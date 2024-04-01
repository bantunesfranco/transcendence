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
import { StatisticService } from './statistic.service';
import { Statistic } from './statistic.entity';
import { UserAuth } from 'src/utilities/user.decorator';
import { IUserJwt } from 'src/user/interfaces/user-jwt.interface';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findOneWithMeta(@UserAuth() user: IUserJwt): Promise<Statistic> {
    return this.statisticService.findOneByIdWithMeta(user.statId);
  }

  @Get(':id')
  async findOneWithMetaById(@Param('id') id: number): Promise<Statistic> {
    console.log(id);
    return this.statisticService.findOneByUserIdWithMeta(+id);
  }
}
