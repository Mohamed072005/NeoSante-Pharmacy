import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import { Role, RoleDocument } from "./entities/role.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class RoleRepository implements RoleRepositoryInterface {

  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>
  ) {}

  async findRoleByName(roleName: string): Promise<RoleDocument> {
    try {
      return await this.roleModel.findOne({ role_name: roleName }).exec();
    }catch (error) {
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}