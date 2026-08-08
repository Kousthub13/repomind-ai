import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { EmbeddingModule } from '../embedding/embedding.module';
import {AiModule} from '../ai/ai.module';
import {PrismaModule} from '../../prisma/prisma.module';
@Module({
  imports: [
    EmbeddingModule,
    PrismaModule,
    AiModule
  ],
  providers: [SearchService],
  controllers: [SearchController]
})
export class SearchModule {}
