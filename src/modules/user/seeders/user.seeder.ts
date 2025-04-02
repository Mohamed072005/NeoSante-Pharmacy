import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from "mongoose";
import { User, UserDocument } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async seed() {
    try {

      const users = await this.userModel.find();
      if (users.length <= 2) {
        console.log('Users already exist. Skipping seeding.');
        return;
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('Password123', saltRounds);

      // Define the users to seed
      const usersToSeed = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'yahoyep@gmail.com',
          password: hashedPassword,
          role_id: new Types.ObjectId('67b83b3f06dcd015b53415f4'),
          phone_number: '1234567890',
          city: 'New York',
          cin_number: 'A123456',
          verified_at: null,
        },
        {
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'amine072005@gmail.com',
          password: hashedPassword,
          role_id: new Types.ObjectId('67b83b3f06dcd015b53415f4'),
          phone_number: '0987654321',
          city: 'Los Angeles',
          cin_number: 'B654321',
          verified_at: null,
        },
        {
          first_name: 'cccc',
          last_name: 'gggggg',
          email: 'lousifr2005@gmail.com',
          password: hashedPassword,
          role_id: new Types.ObjectId('67b83b3f06dcd015b53415f4'),
          phone_number: '1234567893',
          city: 'New York',
          cin_number: 'A123458',
          verified_at: null,
        }
      ];

      // Insert users into the database
      await this.userModel.insertMany(usersToSeed);
      console.log('Users seeded successfully!');
    } catch (error) {
      console.error('Error seeding users:', error);
    }
  }
}