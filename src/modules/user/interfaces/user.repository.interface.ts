import { User, UserDocument } from "../entities/user.entity";
import { RegisterDTO } from "../../auth/DTOs/register/register.dto";
import { Types } from "mongoose";

export interface UserRepositoryInterface {
  getUserByEmailOrPhoneNumberOrCINNumber(email: string, phone_number: string, cin_number: string): Promise<User>
  createUser(registerDTO: RegisterDTO): Promise<UserDocument>
  getUserById(userId: Types.ObjectId): Promise<UserDocument>
  findUserByEmail(email: string): Promise<UserDocument>
}