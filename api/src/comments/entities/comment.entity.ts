export class Comment {
  id!: number;
  content!: string;
  blogId!: number;
  userId!: number;
  createdAt!: Date;
}
export interface CommentResponse extends Comment {
  author: { id: number; name: string } | null;
}
