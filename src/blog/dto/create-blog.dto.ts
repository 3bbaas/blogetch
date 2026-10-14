import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BlogCategory } from '../enums/blog-category.enum';

export class CreateBlogDto {
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
  @IsEnum(BlogCategory, {
    message: `category must be one of: ${Object.values(BlogCategory).join(', ')}`,
  })
  category!: BlogCategory;

  @IsNotEmpty()
  authorId: number;

  @IsNotEmpty()
  createdAt: Date;

  @IsNotEmpty()
  updatedAt: Date;
}
