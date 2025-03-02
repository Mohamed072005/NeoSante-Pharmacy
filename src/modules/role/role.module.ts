import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { Role, RoleSchema } from "./entities/role.entity";
import { RoleSeeder } from "./seeders/role.seeder";
import { RoleRepository } from "./role.repository";

@Module({
  imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])],
  providers: [
    RoleSeeder,
    {
      provide: 'RoleRepositoryInterface',
      useClass: RoleRepository,
    }
  ],
  exports: [
    'RoleRepositoryInterface',
  ]
})
export class RoleModule {}
