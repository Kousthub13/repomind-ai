import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class SearchService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
    ){}

    private cosineSimilarity(
        vectorA: number[],
        vectorB: number[],
    ): number {
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for(let i = 0; i<vectorA.length; i++){
            dotProduct += vectorA[i] * vectorB[i];
            magnitudeA += vectorA[i] * vectorA[i];
            magnitudeB += vectorB[i] * vectorB[i];
        }

        const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

        if(denominator === 0){ 
            return 0;
        }

        return dotProduct / denominator;
    }

    async search(
        projectId: string,
        query: string,
    ) {
        const queryEmbedding =
            await this.embeddingService.generateEmbedding(query);
        
        const codeEmbeddings =
            await this.prisma.codeEmbedding.findMany({
                where: {
                    projectId,
                },
            });
        
        const results = codeEmbeddings.map((codeEmbedding) => {

            const embedding = codeEmbedding.embedding as number[];
        
            const similarity = this.cosineSimilarity(
                queryEmbedding,
                embedding,
            );
        
            return {
                path: codeEmbedding.path,
                chunk: codeEmbedding.chunk,
                chunkIndex: codeEmbedding.chunkIndex,
                similarity,
            };
        });
    
        results.sort(
            (a, b) => b.similarity - a.similarity,
        );
    
        return results.slice(0, 5);
    }
}