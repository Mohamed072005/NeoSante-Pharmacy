import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./entities/user.entity";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { UserSeeder } from "./seeders/user.seeder";
import { RoleModule } from "../role/role.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RoleModule
  ],
  providers: [
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
    {
      provide: 'UserServiceInterface',
      useClass: UserService,
    },
    UserSeeder
  ],
  exports: [
    'UserRepositoryInterface',
    'UserServiceInterface',
    UserSeeder
  ]
})
export class UserModule {}
