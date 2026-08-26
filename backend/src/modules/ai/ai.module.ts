import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { LangChainAiService } from './langchain-ai.service';
@Module({
  providers: [
    AiService,
    LangChainAiService,
  ],
  exports: [
    AiService,
    LangChainAiService,
  ],
})
export class AiModule {}