import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./entities/user.entity";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
    {
      provide: 'UserServiceInterface',
      useClass: UserService,
    }
  ],
  exports: [
    'UserRepositoryInterface'
  ]
})
export class UserModule {}
