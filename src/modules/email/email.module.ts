import { Module } from '@nestjs/common';
import { EmailService } from "./email.service";

@Module({
  providers: [
    {
      provide: 'EmailServiceInterface',
      useClass: EmailService
    }
  ],
  exports: [
    'EmailServiceInterface',
  ]
})
export class EmailModule {}
