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
import { Type } from 'class-transformer';

export class QueryBlogsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
  @IsOptional()
  @IsEnum(BlogCategory)
  category?: BlogCategory;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  author?: number;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;
}
