import { BlogCategory } from '../enums/blog-category.enum';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryBlogsDto {
  @ApiPropertyOptional({
    description: '1-based page number.',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Page size (max 50).',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Only return stories in this category.',
    enum: BlogCategory,
  })
  @IsOptional()
  @IsEnum(BlogCategory)
  category?: BlogCategory;

  @ApiPropertyOptional({
    description: 'Only return stories by this author id.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  author?: number;

  @ApiPropertyOptional({
    description: 'Inclusive lower bound on `createdAt` (ISO 8601 date).',
    example: '2026-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({
    description:
      'Inclusive upper bound on `createdAt`, covering the whole UTC day.',
    example: '2026-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @ApiPropertyOptional({
    description:
      'Case-insensitive search over title, category and author name.',
    example: 'postgres',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;
}
