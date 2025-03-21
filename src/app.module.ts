import { Module } from '@nestjs/common';
import { PharmacyModule } from './modules/pharmacy/pharmacy.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { EmailModule } from './modules/email/email.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PharmacyModule,
    AuthModule,
    UserModule,
    RoleModule,
    EmailModule,
    ProductModule,
    CategoryModule,
  ],
})
export class AppModule {}
