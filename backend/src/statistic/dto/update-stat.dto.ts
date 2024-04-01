import { PartialType } from '@nestjs/mapped-types';
import { CreateStatDto } from './create-stat.dto';
import { IsOptional } from 'class-validator';

export class UpdateStatDto {
  id: number;
  userId?: number;
  nbWin?: number;
  nbLoss?: number;
  totalScore?: number;
  totalGames?: number;
}
