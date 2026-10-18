import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BlogCategory } from '../enums/blog-category.enum';

export class CreateBlogDto {
  @ApiProperty({
    description: 'Headline of the story.',
    example: 'Hello, Blogetch',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description:
      'Markdown body of the story (rendered with GitHub-flavoured markdown).',
    example: '## A quiet first post\n\nMarkdown is supported.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    description: 'Category the story is filed under.',
    enum: BlogCategory,
    example: BlogCategory.Technology,
  })
  @IsEnum(BlogCategory, {
    message: `category must be one of: ${Object.values(BlogCategory).join(', ')}`,
  })
  category!: BlogCategory;
}
