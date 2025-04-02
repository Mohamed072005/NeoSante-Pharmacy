import { Role, RoleDocument } from "../entities/role.entity";
import { Types } from "mongoose";

export interface RoleRepositoryInterface {
  findRoleByName(roleName: string): Promise<RoleDocument>
  findRoleById(roleId: Types.ObjectId): Promise<RoleDocument>
}