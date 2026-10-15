import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { BlogModule } from './blog/blog.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    UsersModule,
    AuthModule,
    BlogModule,
    CommentsModule,
  ],
})
export class AppModule {}
