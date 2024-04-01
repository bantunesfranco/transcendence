import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { UserAuth } from 'src/utilities/user.decorator';
import { ConfigService } from '@nestjs/config';
import {
  FortyTwoAuthGuard,
  JwtAuthGuard,
  JwtRefreshGuard,
  JwtTwoFactorGuard,
} from './guards';
import { User } from 'src/user/user.entity';
import { UserStatus } from 'src/user/enums/user-status.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('login')
  @UseGuards(FortyTwoAuthGuard)
  async login() {}

  @Get('callback')
  @UseGuards(FortyTwoAuthGuard)
  async redirect(@Req() req: Request, @UserAuth() user: User) {
    const jwtCookieAccessToken = this.authService.getJwtCookieAccessToken(user);
    const jwtCookieRefreshAccessToken =
      this.authService.getJwtRefreshCookieToken(user);

    this.authService.setUserRefreshToken(
      jwtCookieRefreshAccessToken.token,
      user.id,
    );
    req.res.cookie(
      'access_token',
      jwtCookieAccessToken.token,
      jwtCookieAccessToken.cookieOption,
    );
    req.res.cookie(
      'refresh_token',
      jwtCookieRefreshAccessToken.token,
      jwtCookieRefreshAccessToken.cookieOption,
    );
    if (user.isTwoFactorAuthEnabled) {
      req.res.redirect(
        `http://${this.configService.getOrThrow('HOST')}:4200/two-fa-auth`,
      );
    } else {
      req.res.redirect(
        `http://${this.configService.getOrThrow('HOST')}:4200/home`,
      );
    }
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() req: Request, @UserAuth() user: any) {
    console.log('refreshing this one:', req.user);
    const jwtCookieAccessToken = this.authService.getJwtCookieAccessToken(user);
    req.res.cookie(
      'access_token',
      jwtCookieAccessToken.token,
      jwtCookieAccessToken.cookieOption,
    );
  }

  @Get('validate')
  @UseGuards(JwtTwoFactorGuard)
  async validate(@Req() req: Request, @UserAuth() user: any) {
    if (user) {
      return {
        isAuthenticated: true,
        user: user,
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  @UseGuards(JwtTwoFactorGuard)
  async logout(@Req() req: Request, @UserAuth() user: any) {
    req.res.clearCookie('access_token', {
      domain: this.configService.getOrThrow('HOST'),
    });
    req.res.clearCookie('refresh_token', {
      domain: this.configService.getOrThrow('HOST'),
    });
    console.log('Logging out:', user.id);
    await this.authService.setUserRefreshToken(null, user.id);
  }
}
