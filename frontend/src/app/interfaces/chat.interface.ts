import { BaseEntity } from './base-entity.interface';
import { Message } from './message.interface';
import { User } from './user.interface';
import { ChatType } from 'src/app/enums/chat-type.enum';

export interface Chat extends BaseEntity {
  type: ChatType;
  ownerId: number;
  password?: string;
  memberList: number[];
  adminList: number[];
  banList: number[];
  mutedList: number[];

  messages: Message[];

  admins: User[];
  bans: User[];
  muted: User[];
  members: User[];
}
