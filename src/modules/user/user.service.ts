import { Inject, Injectable } from "@nestjs/common";
import { UserServiceInterface } from "./interfaces/user.service.interface";
import { Types } from "mongoose";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";
import { RoleRepositoryInterface } from "../role/interfaces/role.repository.interface";

@Injectable()
export class UserService implements UserServiceInterface {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('RoleRepositoryInterface')
    private readonly roleRepository: RoleRepositoryInterface,
  ) {}
  async changeUserRoles(user_id: Types.ObjectId, roleName: string): Promise<boolean> {
    const role = await this.roleRepository.findRoleByName(roleName);
    const user = await this.userRepository.getUserById(user_id);
    if (role._id !== user.role_id) {
      user.role_id = role._id;
      await user.save();
    }
    return true
  }
}