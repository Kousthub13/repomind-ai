import { Module } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { HttpModule } from '@nestjs/axios';
import { RepositoryController } from './repository.controller';

@Module({
  imports: [HttpModule],
  controllers: [RepositoryController],
  providers: [RepositoryService]
})
export class RepositoryModule {}
