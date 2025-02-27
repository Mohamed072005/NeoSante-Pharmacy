import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from "./auth.repository";
import { UserModule } from "../user/user.module";
import { RoleModule } from "../role/role.module";
import { JwtHelper } from "../../core/helpers/jwt.helper";
import { EmailModule } from "../email/email.module";
import { AgentService } from "./services/agent.service";
import { PasswordService } from "./services/password.service";
import { OtpService } from "./services/otp.service";

@Module({
  imports: [
    UserModule,
    RoleModule,
    EmailModule
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'AuthRepositoryInterface',
      useClass: AuthRepository,
    },
    {
      provide: 'PasswordServiceInterface',
      useClass: PasswordService,
    },
    JwtHelper,
    AgentService,
    OtpService
  ],
})
export class AuthModule {}
