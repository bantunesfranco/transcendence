import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/user/user.service";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwtrefresh') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          JwtRefreshTokenStrategy.extractJwt
        ]),
        ignoreExpiration: false,
        secretOrKey: configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        passReqToCallback: true
      }
    )
  }

  private static extractJwt(req: Request) {
    if (req.cookies && 'refresh_token' in req.cookies) {
      return req?.cookies?.refresh_token;
    }
    console.log("Returning null when extractRefreshJwt");
    return null;
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req?.cookies?.refresh_token;
    return this.authService.getUserIfRefreshTokenMatches(refreshToken, payload.id);
  }
}
