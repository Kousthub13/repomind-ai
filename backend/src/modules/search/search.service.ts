import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SearchService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly aiService: AiService,
    ) { }

    async search(
        projectId: string,
        query: string,
    ) {
        const queryEmbedding =
            await this.embeddingService.generateEmbedding(query);

        const vector = `[${queryEmbedding.join(",")}]`;

        const results = await this.prisma.$queryRaw<
            {
                id: string;
                path: string;
                chunk: string;
                chunkIndex: number;
                similarity: number;
            }[]
        >`
    SELECT
        ce.id,
        ce.path,
        ce.chunk,
        ce."chunkIndex",
        1 - (cv.embedding <=> ${vector}::vector) AS similarity
    FROM code_embedding_vectors cv
    JOIN "CodeEmbedding" ce
        ON cv.id = ce.id
    WHERE ce."projectId" = ${projectId}
      AND 1 - (cv.embedding <=> ${vector}::vector) >= 0.50
    ORDER BY cv.embedding <=> ${vector}::vector
    LIMIT 5;
`;
        if (results.length == 0){
            return{
                answer:
                    "I couldn't find relevant information in the indexed repository.",
                    sources: [],
            }
        }

        const context = results
            .map(
                (result) => `
File: ${result.path}

${result.chunk}
`,
            )
            .join('\n------------------------\n');

        const answer = await this.aiService.generateAnswer(
            query,
            context,
        );

        return {
            answer,
            sources: results.map((result) => ({
                path: result.path,
                chunkIndex: result.chunkIndex,
                similarity: result.similarity,
            })),
        };
    }
}