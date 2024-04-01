import { ChatType } from '../enums/chat-type.enum';

export class CreateChatDto {
  ownerId: number;
  type: ChatType;
  memberList: number[];
  adminList: number[];
  mutedList: number[];
  password: string;
}
