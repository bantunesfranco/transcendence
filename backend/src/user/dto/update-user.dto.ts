import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  isTwoFactorAuthEnabled?: boolean;
  twoFactorAuthSecret?: string;
  userName?: string;
  status?: UserStatus;
  avatar?: string;
  refreshToken?: string;
}
