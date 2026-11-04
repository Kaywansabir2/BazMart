import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeIraqiPhone } from '../common/iraqi-phone.util';
import { normalizeEasternNumerals } from '../common/linguistic-normalizer';
import { IOtpProvider, OTP_PROVIDER } from './otp-provider.interface';
import { generateSessionToken } from './jwt.util';

export interface RequestOtpDto {
  phone: string;
}

export interface VerifyOtpDto {
  phone: string;
  otpCode: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OTP_PROVIDER) private readonly otpProvider: IOtpProvider,
  ) {}

  /**
   * Request OTP for Iraqi phone number
   */
  async requestOtp(dto: RequestOtpDto) {
    if (!dto || !dto.phone) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'PHONE_REQUIRED',
        message: 'Phone number is required.',
        messageCkb: 'ژمارەی مۆبایل پێویستە بنووسرێت.',
        messageAr: 'رقم الهاتف مطلوب.',
      });
    }

    const normalizedPhone = normalizeIraqiPhone(dto.phone);
    const otpResult = await this.otpProvider.sendOtp(normalizedPhone);

    return {
      success: true,
      normalizedPhone,
      devOtpHint: otpResult.devOtpHint || '123456',
      expiresInSeconds: 300,
      messageEn: 'OTP code sent (Dev Fixed OTP: 123456)',
      messageCkb: 'کۆدی دڵنیابوونەوە نێردرا (کۆدی تاقیکاری: 123456)',
      messageAr: 'تم إرسال رمز التحقق (الرمز التجريبي: 123456)',
    };
  }

  /**
   * Verify OTP and issue JWT session token
   */
  async verifyOtp(dto: VerifyOtpDto) {
    if (!dto || !dto.phone || !dto.otpCode) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'PHONE_AND_OTP_REQUIRED',
        message: 'Both phone and OTP code are required.',
        messageCkb: 'هەردوو ژمارەی مۆبایل و کۆدی دڵنیابوونەوە پێویستن.',
        messageAr: 'رقم الهاتف ورمز التحقق مطلوبان معاً.',
      });
    }

    const normalizedPhone = normalizeIraqiPhone(dto.phone);
    const normalizedOtp = normalizeEasternNumerals(dto.otpCode).trim();

    const isValid = await this.otpProvider.verifyOtp(normalizedPhone, normalizedOtp);

    if (!isValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'INVALID_OTP',
        message: 'Invalid OTP code. Please use 123456.',
        messageCkb: 'کۆدی چوونەژوورەوە هەڵەیە. تکایە ١٢٣٤٥٦ بەکاربهێنە.',
        messageAr: 'رمز التحقق غير صحيح. يرجى استخدام 123456.',
      });
    }

    // Upsert customer in Prisma
    let customer = await this.prisma.customer.findUnique({
      where: { phone: normalizedPhone },
      include: { addresses: true },
    });

    if (!customer) {
      const defaultName =
        normalizedPhone === '+9647701234567' ? 'Ako Muhamad' : 'BazMart Customer';
      customer = await this.prisma.customer.create({
        data: {
          phone: normalizedPhone,
          name: defaultName,
          preferredLanguage: 'en',
        },
        include: { addresses: true },
      });
    }

    const orderCount = await this.prisma.order.count({
      where: {
        customer: { phone: normalizedPhone },
        orderStatus: { notIn: ['CANCELLED'] },
      },
    });

    const accessToken = generateSessionToken({
      sub: customer.id,
      phone: customer.phone,
      name: customer.name,
      preferredLanguage: customer.preferredLanguage,
    });

    return {
      success: true,
      accessToken,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        preferredLanguage: customer.preferredLanguage,
        orderCount,
        addresses: customer.addresses,
      },
    };
  }
}

