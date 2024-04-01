import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { default as Strategy } from 'passport-42';
import { Profile } from 'passport';

@Injectable()
export class FortytwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow('CLIENT_ID'),
      clientSecret: configService.getOrThrow('CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('CALLBACK_URI'),
      profileFields: {
        username: 'login',
        id: 'id',
        'photos.0.value': 'image.link',
      },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const user = this.userService.findOrCreate(profile);
    if (!user) {
      return null;
    }
    return user;
  }
}
