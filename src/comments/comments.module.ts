import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [BlogModule],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
