import { RoleRepositoryInterface } from "./interfaces/role.repository.interface";
import { Role, RoleDocument } from "./entities/role.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class RoleRepository implements RoleRepositoryInterface {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
  ) {}

  async findRoleByName(roleName: string): Promise<RoleDocument> {
    try {
      return await this.roleModel.findOne({ role_name: roleName }).exec();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch roles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findRoleById(roleId: Types.ObjectId): Promise<RoleDocument> {
    try {
      return await this.roleModel.findOne({ _id: roleId }).exec();
    }catch(error) {
      throw new HttpException(
        'Failed to fetch roles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}