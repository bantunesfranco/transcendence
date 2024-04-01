import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import JwtPayloadDto from './dto/jwt.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { CookieOptions } from 'express';
import * as crypto from 'crypto';
import { Observable, catchError, from, map, of } from 'rxjs';
import { parseJwtTokens } from 'src/utilities/parse-jwt-cookie';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public getJwtCookieAccessToken(user: User, twofa_success: boolean = false) {
    const payload: JwtPayloadDto = {
      id: user.id,
      intraName: user.intraName,
      second_factor_authenticated: twofa_success,
      // activeChatId: 0, // ? might need this later
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${+this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_TIME') * 60}s`,
    });

    const cookieOption: CookieOptions = {
      httpOnly: true,
      maxAge:
        +this.configService.getOrThrow('JWT_ACCESS_TOKEN_EXPIRATION_TIME') *
        60 *
        1000,
      path: '/',
      domain: this.configService.getOrThrow('HOST'),
      sameSite: 'lax',
    };

    return {
      token,
      cookieOption,
    };
  }

  public getJwtRefreshCookieToken(user: User) {
    const payload: JwtPayloadDto = {
      id: user.id,
      intraName: user.intraName,
      second_factor_authenticated: false,
      // activeChatId: 0,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${+this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}h`,
    });

    const cookieOption: CookieOptions = {
      httpOnly: true,
      maxAge:
        +this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_TIME') *
        10 *
        60 *
        1000,
      path: '/',
      domain: this.configService.getOrThrow('HOST'),
      sameSite: 'lax',
    };

    return {
      token,
      cookieOption,
    };
  }

  public hashRefreshToken(refreshToken: string) {
    const salt = this.configService.getOrThrow('SALT');
    const hash = crypto.createHash('sha256');
    hash.update(refreshToken + salt);
    const hash_token = hash.digest('hex');
    return hash_token;
  }

  public async setUserRefreshToken(
    refreshToken: string | null,
    userId: number,
  ) {
    // console.log('input:', { refreshToken, userId }); // ? debug
    if (refreshToken) {
      const hash = this.hashRefreshToken(refreshToken);
      // console.log('hash:', hash); // ? debug
      await this.userService.update(userId, { refreshToken: hash });
    } else {
      const res = await this.userService.update(userId, { refreshToken: null });
      // console.log(res);
    }
  }

  public async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpException(
        'User with this id does not exist!',
        HttpStatus.NOT_FOUND,
      );
    }
    if (this.hashRefreshToken(refreshToken) == user.refreshToken) {
      return user;
    }
    throw new HttpException(
      'User with this refresh_token does not exist!',
      HttpStatus.NOT_FOUND,
    );
  }

  getJwtUser(jwt: string): Observable<User | null> {
    if (!jwt) {
      throw new Error('jwt undefined');
    }
    const tokenMap = parseJwtTokens(jwt);
    const access_token = tokenMap.get('access_token');
    if (!access_token) {
      throw new Error('No access token buddy!');
    }
    // console.log('access_token:', access_token); // ? debug
    const res = from(
      this.jwtService.verifyAsync(access_token, {
        secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      }),
    );

    // console.log('getJwtUser:', res); // ? debug
    return res;
  }
}
