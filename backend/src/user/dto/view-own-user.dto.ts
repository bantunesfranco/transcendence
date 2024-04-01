import { Expose } from 'class-transformer';
import { User } from '../user.entity';

export class ViewOwnUserDto {
  @Expose()
  intraName: string;

  @Expose()
  statId: number;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
