import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogResponse } from './entities/blog.entity';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { BlogService, PaginatedBlogs } from './blog.service';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogsService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateBlogDto,
    @CurrentUser() user: AuthenticatedUser,
  ): BlogResponse {
    return this.blogsService.create(dto, user.id);
  }

  @Public()
  @Get()
  findAll(@Query() query: QueryBlogsDto): PaginatedBlogs {
    return this.blogsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): BlogResponse {
    return this.blogsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() user: AuthenticatedUser,
  ): BlogResponse {
    return this.blogsService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): void {
    return this.blogsService.remove(id, user);
  }
}
