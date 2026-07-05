import { Module } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { HttpModule } from '@nestjs/axios';
import { RepositoryController } from './repository.controller';
import { ChunkingModule } from '../chunking/chunking.module';

@Module({
  imports: [HttpModule, ChunkingModule],
  controllers: [RepositoryController],
  providers: [RepositoryService],
  exports: [RepositoryService],
})
export class RepositoryModule {}
