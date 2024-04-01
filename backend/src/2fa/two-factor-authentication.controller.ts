import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  HttpCode,
  UnauthorizedException,
  Body,
  Get,
} from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-authentication.service';
import { Request, Response } from 'express';
import { JwtAuthGuard, JwtTwoFactorGuard } from '../auth/guards';
import RequestWithUser from '../auth/request-with-user.interface';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { UserAuth } from 'src/utilities/user.decorator';
import { User } from 'src/user/user.entity';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) { }

  @Get('test')
  @UseGuards(JwtTwoFactorGuard)
  test() {
    console.log('2fa guard working!');
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() res: Response, @Req() req: RequestWithUser) {
    const { otp_auth_url } =
      await this.twoFactorAuthService.generateTwoFactorAuthSecret(req.user);
    return this.twoFactorAuthService.pipeQrCodeStream(res, otp_auth_url);
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async enableTwoFactorAuthentication(
    @Req() req: RequestWithUser,
    @Body() twoFactorAuthCode: { code: string },
  ) {
    const isCodeValid = this.twoFactorAuthService.validateCode(
      twoFactorAuthCode.code,
      req.user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const authenticatedJwtCookie = this.authService.getJwtCookieAccessToken(req.user, true);
    req.res.cookie('access_token', authenticatedJwtCookie.token, authenticatedJwtCookie.cookieOption);
    return await this.userService.enableTwoFactorAuth(req.user.id);
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async disableTwoFactorAuthentication(@Req() req: Request, @UserAuth() user: User) {
    return await this.userService.disableTwoFactorAuth(user.id);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validate(@Req() req: Request, @UserAuth() user: any) {
    if (user) {
      return {
        isAuthenticated: true,
      };
    } else {
      return {
        isAuthenticated: false,
      };
    }
  }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  authenticate(
    @Req() request: Request,
    @Body() twoFactorAuthCode: { code: string }, // TODO: make a dto for this that validates all requirements
    @UserAuth() user: any,
  ) {
    const isCodeValid = this.twoFactorAuthService.validateCode(
      twoFactorAuthCode.code,
      user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    const accessTokenCookie = this.authService.getJwtCookieAccessToken(
      user,
      true,
    );
    request.res.cookie(
      'access_token',
      accessTokenCookie.token,
      accessTokenCookie.cookieOption,
    );
    return request.user;
  }
}
