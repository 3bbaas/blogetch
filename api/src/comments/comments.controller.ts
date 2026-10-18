import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { CommentResponse } from './entities/comment.entity';

@ApiTags('comments')
@ApiParam({ name: 'blogId', example: 1, description: 'Id of the story' })
@Controller('blogs/:blogId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Post a comment on a story' })
  @ApiCreatedResponse({ type: CommentResponse })
  @ApiNotFoundResponse({ description: 'Blog not found' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiUnprocessableEntityResponse({ description: 'Validation failed' })
  create(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CommentResponse> {
    return this.commentsService.create(dto, blogId, user.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List a story’s comments (public)' })
  @ApiOkResponse({ type: [CommentResponse] })
  @ApiNotFoundResponse({ description: 'Blog not found' })
  findByBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
  ): Promise<CommentResponse[]> {
    return this.commentsService.findByBlog(blogId);
  }
}
