import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { LangChainAiService } from '../ai/langchain-ai.service';
import {
    NotFoundException,
} from '@nestjs/common';

@Injectable()
export class SearchService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly aiService: LangChainAiService,
    ) { }

    async search(
        projectId: string,
        userId: string,
        query: string,
    ) {
        const project = await this.prisma.project.findFirst({
            where: {
                id: projectId,
                userId,
            },
        });
    
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const embedding = await this.prisma.codeEmbedding.findFirst({
            where: {
                projectId,
            },
            select: {
                id: true,
            },
        });
    
        if (!embedding) {
            return {
                answer:
                    'Please index the repository before using AI code search.',
                sources: [],
            };
        }
    
        if (!query.trim()) {
            return {
                answer: 'Please enter a question about the repository.',
                sources: [],
            };
        }

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
      AND 1 - (cv.embedding <=> ${vector}::vector) >= 0.55
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