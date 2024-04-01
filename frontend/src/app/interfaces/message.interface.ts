import { BaseEntity } from './base-entity.interface';
import { Chat } from './chat.interface';
import { User } from './user.interface';

export interface Message extends BaseEntity {
  chatId?: number;
  senderId: number;
  content: string;
  isLink: boolean;

  chat?: Chat;
  sender: User;
}
