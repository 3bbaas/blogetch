import { ApiProperty } from '@nestjs/swagger';
import { AuthorSummary } from '../../common/dto/author-summary.dto';

export class Comment {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Lovely piece — the opening really pulled me in.' })
  content!: string;

  @ApiProperty({ example: 1 })
  blogId!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}

export class CommentResponse extends Comment {
  @ApiProperty({ type: AuthorSummary, nullable: true })
  author!: AuthorSummary | null;
}
