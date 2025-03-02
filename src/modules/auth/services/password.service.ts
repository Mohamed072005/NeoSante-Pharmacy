import { Injectable } from '@nestjs/common';
import { PasswordServiceInterface } from '../interfaces/password.service.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService implements PasswordServiceInterface {
  async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
