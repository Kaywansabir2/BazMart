import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OTP_PROVIDER } from './otp-provider.interface';
import { FixedLocalOtpAdapter } from './fixed-local-otp.adapter';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: OTP_PROVIDER,
      useClass: FixedLocalOtpAdapter,
    },
  ],
  exports: [AuthService, OTP_PROVIDER],
})
export class AuthModule {}

