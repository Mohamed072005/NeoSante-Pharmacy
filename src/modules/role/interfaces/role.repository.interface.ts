import { Role, RoleDocument } from "../entities/role.entity";

export interface RoleRepositoryInterface {
  findRoleByName(roleName: string): Promise<RoleDocument>
}