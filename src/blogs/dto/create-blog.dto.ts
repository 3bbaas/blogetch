import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BlogCategory } from '../enums/blog-category.enum';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(BlogCategory, {
    message: `category must be one of: ${Object.values(BlogCategory).join(', ')}`,
  })
  category!: BlogCategory;
}
