import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';

import { Response } from 'express';
import { toFileStream } from 'qrcode';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async generateTwoFactorAuthSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otp_auth_url = authenticator.keyuri(
      user.intraName,
      this.configService.getOrThrow('TWO_FA_NAME'),
      secret,
    );
    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
    return {
      secret,
      otp_auth_url,
    };
  }

  public validateCode(code: string, user: User) {
    // console.log(`user: `, user); // ? debug
    // console.log(`code: `, code); // ? debug
    return authenticator.verify({
      token: code,
      secret: user.twoFactorAuthSecret,
    });
  }

  async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }
}
