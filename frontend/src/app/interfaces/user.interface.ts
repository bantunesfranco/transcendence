import { UserStatus } from '../enums/user-status.enum';
import { BaseEntity } from './base-entity.interface';
import { Statistic } from './statistic.entity';

export interface User extends BaseEntity {
  intraName: string;
  userName: string;
  avatar: string;
  refreshToken: string;
  isTwoFactorAuthEnabled: boolean;
  twoFactorAuthSecret?: string;
  status: UserStatus;
  friendList: number[];
  blockList: number[];

  // Relations
  statId: number;
  statistics: Statistic;

  // Websockets
  activeChat: number;
}

export interface newUser extends Partial<User> {}
