import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { TwoFactorAuthService } from './two-factor-authentication.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [TwoFactorAuthenticationController],
  providers: [TwoFactorAuthService, AuthService, JwtService]
})
export class TwoFactorAuthModule { }
