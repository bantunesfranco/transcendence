import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "src/user/user.entity";
import { UserService } from "src/user/user.service";
import { parseJwtTokens } from "src/utilities/parse-jwt-cookie";

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'wsjwt') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                WsJwtStrategy.extractWsJwt,
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

  private static extractWsJwt(req) {
    const tokenMap = parseJwtTokens(req?.cookie);
    const access_token = tokenMap.get('access_token');
    if (!access_token) {
        console.log('Returning null when extractWsJwt');
        throw new WsException('Unauthorized JWT socket connection!');
        return null;
    }
    return access_token;
  }


  async validate(payload: any): Promise<User> {
    const user = await this.userService.findById(+payload.id);
    // console.log('validate:', user); // ? debug
    if (
      !user ||
      (user.isTwoFactorAuthEnabled && !payload.second_factor_authenticated)
    ) {
      console.log(`The validation function for WS JWT failed`);
      console.log(`This is my payload `, payload);
      console.log(`This is my user `, user);
      throw new WsException('Unauthorized JWT socket connection!');
    }
    console.log('JWT socket validation successfull!');
    return user;
  }
}