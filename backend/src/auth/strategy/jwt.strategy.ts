import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy as PassportJwtStrategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import JwtPayloadDto from '../dto/jwt.dto';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { Strategy } from "passport-jwt";
import { User } from "src/user/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy) {
  constructor(
    private readonly configService: ConfigService,
    protected readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJwt,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  private static extractJwt(req: Request) {
    if (req.cookies && 'access_token' in req.cookies) {
      return req?.cookies?.access_token;
    }
    console.log('Returning null when extractJwt');
    return null;
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userService.findById(+payload.id);
    if (!user) {
      console.log(`The validation function for the JWT failed`);
      console.log(`This is my payload ` + { payload });
      console.log(`This is my user ` + { user });
      throw new UnauthorizedException();
    }
    console.log("JWT validation successfull!");
    return user;
  }
}
