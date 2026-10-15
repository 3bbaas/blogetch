import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class createCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  content!: string;
}
