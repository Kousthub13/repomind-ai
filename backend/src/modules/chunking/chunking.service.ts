import { Injectable } from '@nestjs/common';
import { CodeChunk } from '../repository/interfaces/code-chunk.interface';

@Injectable()
export class ChunkingService {

    private readonly CHUNK_SIZE = 100;

     chunkContent(
        path: string,
        content: string,
    ): CodeChunk[] {
        const lines = content.split('\n');
        

        const chunks: CodeChunk[] = [];

        let index = 0;

        for (let i = 0; i < lines.length; i += this.CHUNK_SIZE) {
            chunks.push({
                path,
                chunk: lines
                    .slice(i, i + this.CHUNK_SIZE)
                    .join('\n'),
                chunkIndex: index++,
            });
        }
        return chunks;
    }
}
