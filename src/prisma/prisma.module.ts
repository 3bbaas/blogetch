import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global so Users/Blog/Comments modules share one PrismaService instance
// (single connection pool) without importing it in every module.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
