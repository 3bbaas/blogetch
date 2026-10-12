import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
