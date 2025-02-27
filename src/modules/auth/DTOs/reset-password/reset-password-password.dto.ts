import {
  IsString,
  IsNotEmpty,
  MinLength,
  Validate,
} from 'class-validator';
import { IsMatch } from '../../decorators/is-match.decorator';

export class ResetPasswordPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsMatch('password', {
    message: 'Password and confirm password do not match',
  })
  confirmPassword: string;
}
