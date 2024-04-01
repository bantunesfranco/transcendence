import { BaseEntity } from './base-entity.interface';

export interface Statistic extends BaseEntity {
  nbWin: number;
  nbLoss: number;
  totalScore: number;
  totalGames: number;
	ratio: number;
	averageScore: number;
}
