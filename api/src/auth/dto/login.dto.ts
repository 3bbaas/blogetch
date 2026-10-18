import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Account email (matched case-insensitively).',
    example: 'admin@blogetch.dev',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value,
  )
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Account password.', example: 'Admin12345' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
