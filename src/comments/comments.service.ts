import { Injectable } from '@nestjs/common';
import { BlogService } from '../blog/blog.service';
import { UsersService } from '../users/users.service';
import { Comment, CommentResponse } from './entities/comment.entity';
import { createCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  private comments: Comment[] = [];
  private nextId = 1;
  constructor(
    private readonly blogService: BlogService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    dto: createCommentDto,
    blogId: number,
    userId: number,
  ): Promise<CommentResponse> {
    this.blogService.findOne(blogId);
    const comment: Comment = {
      id: this.nextId++,
      content: dto.content,
      blogId,
      userId,
      createdAt: new Date(),
    };
    this.comments.push(comment);
    const user = this.usersService.findById(userId);
    return {
      ...comment,
      author: user ? { id: userId, name: user.name } : null,
    };
  }
  async findByBlog(blogId: number): Promise<CommentResponse[]> {
    this.blogService.findOne(blogId);
    const list = this.comments
      .filter((c) => c.blogId === blogId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const userIds = [...new Set(list.map((c) => c.userId))];
    const users = this.usersService.findByIds(userIds);
    const names = new Map(users.map((u) => [u.id, u.name]));
    return list.map((c) => {
      const name = names.get(c.userId);
      return {
        ...c,
        author: name === undefined ? null : { id: c.userId, name },
      };
    });
  }
}
