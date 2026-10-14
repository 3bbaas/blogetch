import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UsersService } from '../users/users.service';
import { Blog, BlogResponse } from './entities/blog.entity';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { Role } from '../common/enums/role.enum';
import { UpdateBlogDto } from './dto/update-blog.dto';

export interface PaginatedBlogs {
  data: BlogResponse[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
@Injectable()
export class BlogService {
  private blogs: Blog[] = [];
  private nextId = 1;
  constructor(private readonly usersService: UsersService) {}

  create(dto: CreateBlogDto, authorId: number): BlogResponse {
    const now = new Date();
    const blog: Blog = {
      id: this.nextId++,
      title: dto.title,
      content: dto.content,
      category: dto.category,
      authorId,
      createdAt: now,
      updatedAt: now,
    };
    this.blogs.push(blog);
    return this.toResponse(blog);
  }

  findAll(query: QueryBlogsDto): PaginatedBlogs {
    const { page, limit, category, author, from, to, search } = query;

    if (from && to && from > to) {
      throw new BadRequestException('"from" must be before or equal to "to"');
    }

    const authorIds = [...new Set(this.blogs.map((b) => b.authorId))];
    const authors = this.usersService.findByIds(authorIds);
    const names = new Map(authors.map((u) => [u.id, u.name]));

    const term = search?.trim().toLowerCase();

    const filtered = this.blogs
      .filter((b) => !category || b.category === category)
      .filter((b) => author === undefined || b.authorId === author)
      .filter((b) => !from || b.createdAt >= from)
      .filter((b) => {
        if (!term) return true;
        const authorName = (names.get(b.authorId) ?? '').toLowerCase();
        return (
          b.title.toLowerCase().includes(term) ||
          b.category.toLowerCase().includes(term) ||
          authorName.includes(term)
        );
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit).map((b) => ({
      ...b,
      author: this.pickAuthor(b.authorId, names),
    }));

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
  findOne(id: number): BlogResponse {
    return this.toResponse(this.getOrThrow(id));
  }
  update(
    id: number,
    dto: UpdateBlogDto,
    user: AuthenticatedUser,
  ): BlogResponse {
    const blog = this.getOrThrow(id);
    this.assertCanModify(blog, user);

    blog.title = dto.title ?? blog.title;
    blog.content = dto.content ?? blog.content;
    blog.category = dto.category ?? blog.category;
    blog.updatedAt = new Date();

    return this.toResponse(blog);
  }
  remove(id: number, user: AuthenticatedUser): void {
    const blog = this.getOrThrow(id);
    this.assertCanModify(blog, user);
    this.blogs = this.blogs.filter((b) => b.id !== id);
  }
  private getOrThrow(id: number): Blog {
    const blog = this.blogs.find((b) => b.id === id);
    if (!blog) throw new NotFoundException(`Blog ${id} not found`);
    return blog;
  }

  private assertCanModify(blog: Blog, user: AuthenticatedUser): void {
    const isOwner = blog.authorId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only modify your own posts');
    }
  }

  private pickAuthor(
    authorId: number,
    names: Map<number, string>,
  ): BlogResponse['author'] {
    const name = names.get(authorId);
    return name === undefined ? null : { id: authorId, name };
  }

  private toResponse(blog: Blog): BlogResponse {
    const user = this.usersService.findById(blog.authorId);
    return {
      ...blog,
      author: user ? { id: user.id, name: user.name } : null,
    };
  }
}
