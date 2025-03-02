import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";
import { User, UserDocument } from "./entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RegisterDTO } from "../auth/DTOs/register/register.dto";

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getUserByEmailOrPhoneNumberOrCINNumber(
    email: string,
    phone_number: string,
    cin_number: string,
  ): Promise<User> {
    try {
      return await this.userModel
        .findOne({
          $or: [
            { email: email },
            { phone_number: phone_number },
            { cin_number: cin_number },
          ],
        })
        .exec();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUser(registerDTO: RegisterDTO): Promise<UserDocument> {
    try {
      const user = new this.userModel({
        email: registerDTO.email,
        phone_number: registerDTO.phone_number,
        cin_number: registerDTO.cin_number,
        first_name: registerDTO.first_name,
        last_name: registerDTO.last_name,
        role_id: registerDTO.role_id,
        city: registerDTO.city,
        password: registerDTO.password,
      });
      return await user.save();
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(userId: Types.ObjectId): Promise<UserDocument> {
    try {
      return await this.userModel.findOne({ _id: userId }).exec();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    try {
      return await this.userModel.findOne({ email: email }).exec();
    }catch (error) {
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}