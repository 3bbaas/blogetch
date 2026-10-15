import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogResponse } from './entities/blog.entity';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { Role } from '../common/enums/role.enum';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Blog, Prisma } from '../generated/prisma/client';
import { BlogCategory } from './enums/blog-category.enum';

function parseCategory(value: string): BlogCategory {
  if ((Object.values(BlogCategory) as string[]).includes(value)) {
    return value as BlogCategory;
  }
  throw new Error(`Unknown category in database: ${value}`);
}

type BlogWithAuthor = Prisma.BlogGetPayload<{
  include: { author: { select: { id: true; name: true } } };
}>;

export interface PaginatedBlogs {
  data: BlogResponse[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBlogDto, authorId: number): Promise<BlogResponse> {
    const blog = await this.prisma.blog.create({
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        authorId,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return BlogService.toResponse(blog);
  }

  async findAll(query: QueryBlogsDto): Promise<PaginatedBlogs> {
    const { page, limit, category, author, from, to, search } = query;

    if (from && to && from > to) {
      throw new BadRequestException('"from" must be before or equal to "to"');
    }

    // `to` is inclusive over the whole UTC calendar day so that
    // `?from=<today>&to=<today>` matches anything created today
    // regardless of the server's local timezone.
    let toEndOfDay: Date | undefined;
    if (to !== undefined) {
      toEndOfDay = new Date(to);
      toEndOfDay.setUTCHours(23, 59, 59, 999);
    }

    const term = search?.trim();
    const where: Prisma.BlogWhereInput = {
      category: category,
      authorId: author,
      createdAt: {
        gte: from,
        lte: toEndOfDay,
      },
      ...(term === undefined || term === ''
        ? {}
        : {
            OR: [
              { title: { contains: term, mode: 'insensitive' as const } },
              { category: { contains: term, mode: 'insensitive' as const } },
              {
                author: {
                  name: { contains: term, mode: 'insensitive' as const },
                },
              },
            ],
          }),
    };

    const total = await this.prisma.blog.count({ where });
    const rows = await this.prisma.blog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: { author: { select: { id: true, name: true } } },
    });

    return {
      data: rows.map((row) => BlogService.toResponse(row)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number): Promise<BlogResponse> {
    return BlogService.toResponse(await this.getOrThrow(id));
  }

  async update(
    id: number,
    dto: UpdateBlogDto,
    user: AuthenticatedUser,
  ): Promise<BlogResponse> {
    const blog = await this.getOrThrow(id);
    BlogService.assertCanModify(blog, user);

    const updated = await this.prisma.blog.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
      },
      include: { author: { select: { id: true, name: true } } },
    });
    return BlogService.toResponse(updated);
  }

  async remove(id: number, user: AuthenticatedUser): Promise<void> {
    const blog = await this.getOrThrow(id);
    BlogService.assertCanModify(blog, user);
    // Comments cascade at the DB level (onDelete: Cascade); the blog row
    // itself disappearing is what makes GETs return 404 afterwards.
    await this.prisma.blog.delete({ where: { id } });
  }

  private async getOrThrow(id: number): Promise<BlogWithAuthor> {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!blog) throw new NotFoundException(`Blog ${id} not found`);
    return blog;
  }

  private static assertCanModify(
    blog: Pick<Blog, 'authorId'>,
    user: AuthenticatedUser,
  ): void {
    const isOwner = blog.authorId === user.id;
    const isAdmin = user.role === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only modify your own posts');
    }
  }

  private static toResponse(blog: BlogWithAuthor): BlogResponse {
    return {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      category: parseCategory(blog.category),
      authorId: blog.authorId,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author
        ? { id: blog.author.id, name: blog.author.name }
        : null,
    };
  }
}
