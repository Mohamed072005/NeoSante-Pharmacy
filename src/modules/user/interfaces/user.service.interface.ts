import { Types } from "mongoose";

export interface UserServiceInterface {
  changeUserRoles(user_id: Types.ObjectId, roleName: string): Promise<boolean>;
}