import { Injectable } from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { CommentResponse } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '../generated/prisma/client';

type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: { user: { select: { id: true; name: true } } };
}>;

@Injectable()
export class CommentsService {
  constructor(
    private readonly blogService: BlogService,
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateCommentDto,
    blogId: number,
    userId: number,
  ): Promise<CommentResponse> {
    // Throws 404 when the blog does not exist (including after deletion).
    await this.blogService.findOne(blogId);
    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        blogId,
        userId,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    return CommentsService.toResponse(comment);
  }

  async findByBlog(blogId: number): Promise<CommentResponse[]> {
    // Throws 404 when the blog does not exist (including after deletion,
    // since comments cascade away with their blog).
    await this.blogService.findOne(blogId);
    const rows = await this.prisma.comment.findMany({
      where: { blogId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: { user: { select: { id: true, name: true } } },
    });
    return rows.map((row) => CommentsService.toResponse(row));
  }

  private static toResponse(comment: CommentWithAuthor): CommentResponse {
    return {
      id: comment.id,
      content: comment.content,
      blogId: comment.blogId,
      userId: comment.userId,
      createdAt: comment.createdAt,
      author: comment.user
        ? { id: comment.user.id, name: comment.user.name }
        : null,
    };
  }
}
