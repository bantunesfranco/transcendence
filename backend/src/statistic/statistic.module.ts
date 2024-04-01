import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Statistic } from './statistic.entity';
import { UserModule } from 'src/user/user.module';
import { GameModule } from 'src/game/game.module';
import { GameRecordService } from 'src/game/game-record/game-record.service';

@Module({
  imports: [TypeOrmModule.forFeature([Statistic])],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [TypeOrmModule, StatisticService],
})
export class StatisticModule {}
