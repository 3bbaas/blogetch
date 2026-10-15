import { BlogCategory } from '../enums/blog-category.enum';

export class Blog {
  id!: number;
  title!: string;
  content!: string;
  category!: BlogCategory;
  authorId!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export interface BlogResponse extends Blog {
  author: { id: number; name: string } | null;
}
