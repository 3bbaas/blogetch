import { ApiProperty } from '@nestjs/swagger';

export class AuthorSummary {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Ada' })
  name!: string;
}
