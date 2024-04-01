import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'twofactorjwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtTwoFactorStrategy.extractTwoFactorJwt,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  private static extractTwoFactorJwt(req: Request) {
    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies.access_token;
    }
    console.log('Returning null when extractTwoFactorJwt');
    return null;
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userService.findById(+payload.id);
    // console.log('validate:', user); // ? debug
    if (
      !user ||
      (user.isTwoFactorAuthEnabled && !payload.second_factor_authenticated)
    ) {
      console.log(`The validation function for the Two Factor JWT failed`);
      console.log(`This is my payload `, payload);
      console.log(`This is my user `, user);
      throw new UnauthorizedException();
    }
    console.log('JWT two factor validation successfull!');
    return user;
  }
}
