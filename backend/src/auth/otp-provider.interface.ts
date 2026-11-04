export interface IOtpProvider {
  sendOtp(phone: string): Promise<{ success: boolean; devOtpHint?: string }>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

export const OTP_PROVIDER = 'OTP_PROVIDER';

