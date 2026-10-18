import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogResponse, PaginatedBlogs } from './entities/blog.entity';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { Role } from '../common/enums/role.enum';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { Blog, Prisma } from '../generated/prisma/client';
import { BlogCategory } from '../generated/prisma/enums';

type BlogWithAuthor = Prisma.BlogGetPayload<{
  include: { author: { select: { id: true; name: true } } };
}>;

const RECORD_NOT_FOUND = 'P2025';

function notFound(id: number): NotFoundException {
  return new NotFoundException(`Blog ${id} not found`);
}

@Injectable()
export class BlogsService {
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
    return BlogsService.toResponse(blog);
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

    const term = search?.trim().toLowerCase();
    const matchingCategories = (Object.values(BlogCategory) as string[]).filter(
      (value) => term !== undefined && value.toLowerCase().includes(term),
    );

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
              { category: { in: matchingCategories as BlogCategory[] } },
              {
                author: {
                  name: { contains: term, mode: 'insensitive' as const },
                },
              },
            ],
          }),
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.blog.count({ where }),
      this.prisma.blog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      data: rows.map((row) => BlogsService.toResponse(row)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number): Promise<BlogResponse> {
    return BlogsService.toResponse(await this.getOrThrow(id));
  }

  async update(
    id: number,
    dto: UpdateBlogDto,
    user: AuthenticatedUser,
  ): Promise<BlogResponse> {
    const blog = await this.getOrThrow(id);
    BlogsService.assertCanModify(blog, user);

    try {
      const updated = await this.prisma.blog.update({
        where: { id },
        data: {
          title: dto.title,
          content: dto.content,
          category: dto.category,
        },
        include: { author: { select: { id: true, name: true } } },
      });
      return BlogsService.toResponse(updated);
    } catch (error) {
      if (BlogsService.isRecordNotFound(error)) throw notFound(id);
      throw error;
    }
  }

  async remove(id: number, user: AuthenticatedUser): Promise<void> {
    const blog = await this.getOrThrow(id);
    BlogsService.assertCanModify(blog, user);
    try {
      await this.prisma.blog.delete({ where: { id } });
    } catch (error) {
      if (BlogsService.isRecordNotFound(error)) throw notFound(id);
      throw error;
    }
  }

  private async getOrThrow(id: number): Promise<BlogWithAuthor> {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!blog) throw notFound(id);
    return blog;
  }

  private static isRecordNotFound(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === RECORD_NOT_FOUND
    );
  }

  private static assertCanModify(
    blog: Pick<Blog, 'authorId'>,
    user: AuthenticatedUser,
  ): void {
    const isOwner = blog.authorId === user.id;
    const isAdmin = user.role === Role.admin;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only modify your own posts');
    }
  }

  private static toResponse(blog: BlogWithAuthor): BlogResponse {
    return {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      category: blog.category,
      authorId: blog.authorId,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author
        ? { id: blog.author.id, name: blog.author.name }
        : null,
    };
  }
}
