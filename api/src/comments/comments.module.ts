import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { BlogsModule } from '../blogs/blogs.module';

@Module({
  imports: [BlogsModule],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
