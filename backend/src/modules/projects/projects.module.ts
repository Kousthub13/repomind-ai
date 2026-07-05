import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RepositoryModule } from '../repository/repository.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [
    PrismaModule, 
    RepositoryModule,
    EmbeddingModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController]
})
export class ProjectsModule {}
