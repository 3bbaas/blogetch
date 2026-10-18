import { ApiProperty } from '@nestjs/swagger';
import { BlogCategory } from '../enums/blog-category.enum';
import { AuthorSummary } from '../../common/dto/author-summary.dto';

export class Blog {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Hello, Blogetch' })
  title!: string;

  @ApiProperty({ description: 'Markdown body of the story.' })
  content!: string;

  @ApiProperty({ enum: BlogCategory, example: BlogCategory.Technology })
  category!: BlogCategory;

  @ApiProperty({ example: 1 })
  authorId!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}

export class BlogResponse extends Blog {
  @ApiProperty({ type: AuthorSummary, nullable: true })
  author!: AuthorSummary | null;
}

export class PaginationMeta {
  @ApiProperty({ example: 8 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}

export class PaginatedBlogs {
  @ApiProperty({ type: [BlogResponse] })
  data!: BlogResponse[];

  @ApiProperty({ type: PaginationMeta })
  meta!: PaginationMeta;
}
