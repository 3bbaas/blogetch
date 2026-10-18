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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogResponse, PaginatedBlogs } from './entities/blog.entity';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { BlogsService } from './blogs.service';
import { UpdateBlogDto } from './dto/update-blog.dto';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a story' })
  @ApiCreatedResponse({ type: BlogResponse })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({ description: 'Validation failed' })
  create(
    @Body() dto: CreateBlogDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BlogResponse> {
    return this.blogsService.create(dto, user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List stories (paginated, filterable, public)' })
  @ApiOkResponse({ type: PaginatedBlogs })
  @ApiBadRequestResponse({ description: '`from` is after `to`' })
  findAll(@Query() query: QueryBlogsDto): Promise<PaginatedBlogs> {
    return this.blogsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single story by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: BlogResponse })
  @ApiNotFoundResponse({ description: 'Blog not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<BlogResponse> {
    return this.blogsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a story (partial; owner or admin only)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ type: BlogResponse })
  @ApiForbiddenResponse({ description: 'Not the author and not an admin' })
  @ApiNotFoundResponse({ description: 'Blog not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({ description: 'Validation failed' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BlogResponse> {
    return this.blogsService.update(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a story (owner or admin only)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiNoContentResponse({ description: 'Deleted' })
  @ApiForbiddenResponse({ description: 'Not the author and not an admin' })
  @ApiNotFoundResponse({ description: 'Blog not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.blogsService.remove(id, user);
  }
}
