import { Controller, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('methods')
  async getMethods() {
    return {
      success: true,
      data: await this.paymentsService.getPaymentMethods(),
    };
  }
}
