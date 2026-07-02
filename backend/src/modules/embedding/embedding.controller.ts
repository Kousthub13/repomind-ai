import { Body, Controller, Post } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { CreateEmbeddingDto } from './dto/create-embedding.dto';

@Controller('embedding')
export class EmbeddingController {

    constructor(
        private readonly embeddingService: EmbeddingService,
    ) {}

    @Post()
    async createEmbedding(
        @Body() dto: CreateEmbeddingDto,
    ) {
        return this.embeddingService.generateEmbedding(
            dto.text,
        );
    }
}