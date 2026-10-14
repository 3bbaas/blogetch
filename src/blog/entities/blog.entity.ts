export class Blog {
  id!: number;
  title!: string;
  content!: string;
  category!: string;
  authorId!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export interface BlogResponse extends Blog {
  author: { id: number; name: string } | null;
}
