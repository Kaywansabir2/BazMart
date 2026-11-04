import { Injectable } from '@nestjs/common';
import { IOtpProvider } from './otp-provider.interface';

@Injectable()
export class FixedLocalOtpAdapter implements IOtpProvider {
  async sendOtp(phone: string): Promise<{ success: boolean; devOtpHint?: string }> {
    return {
      success: true,
      devOtpHint: '123456',
    };
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    return code === '123456';
  }
}

