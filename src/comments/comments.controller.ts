import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { createCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { CommentResponse } from './entities/comment.entity';

@Controller('blogs/:blogId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() dto: createCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CommentResponse> {
    return this.commentsService.create(dto, blogId, user.id);
  }
  @Get()
  findByBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
  ): Promise<CommentResponse[]> {
    return this.commentsService.findByBlog(blogId);
  }
}
