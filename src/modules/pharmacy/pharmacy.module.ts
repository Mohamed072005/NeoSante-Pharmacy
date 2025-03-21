import { Module } from '@nestjs/common';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Pharmacy, PharmacySchema } from './entities/pharmacy.schema';
import { JwtHelper } from '../../core/helpers/jwt.helper';
import { UserModule } from '../user/user.module';
import { PharmacyRepository } from "./pharmacy.repository";
import { EmailModule } from "../email/email.module";
import { RoleModule } from "../role/role.module";
import { S3Service } from "../../core/services/s3.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pharmacy.name, schema: PharmacySchema },
    ]),
    UserModule,
    EmailModule,
    RoleModule,
  ],
  controllers: [PharmacyController],
  providers: [
    {
      provide: 'PharmacyServiceInterface',
      useClass: PharmacyService,
    },
    {
      provide: 'PharmacyRepositoryInterface',
      useClass: PharmacyRepository
    },
    JwtHelper,
    S3Service
  ],
  exports: [
    'PharmacyRepositoryInterface'
  ],
})
export class PharmacyModule {}
