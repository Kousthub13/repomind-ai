import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class EmbeddingService {

    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY || "",
        });
    }

    async generateEmbedding(text: string): Promise<number[]> {
        const MAX_RETRIES = 3;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.ai.models.embedContent({
                    model: 'gemini-embedding-001',
                    contents: text,
                });

                const values = response.embeddings?.[0]?.values;

                if (!values) {
                    throw new Error('Failed to generate embedding.');
                }

                return values;
            } catch (error) {
                console.error(
                    `Embedding attempt ${attempt} failed`,
                    error,
                );

                if (attempt === MAX_RETRIES) {
                    throw error;
                }

                console.log('Retrying embedding request...');

                await new Promise((resolve) =>
                    setTimeout(resolve, 2000 * attempt),
                );
            }
        }

        throw new Error('Failed to generate embedding.');
    }

    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        if (texts.length === 0) {
            return [];
        }

        const MAX_RETRIES = 5;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.ai.models.embedContent({
                    model: 'gemini-embedding-001',
                    contents: texts,
                });

                const embeddings = response.embeddings?.map(
                    (embedding) => embedding.values,
                );

                if (
                    !embeddings ||
                    embeddings.length !== texts.length ||
                    embeddings.some((embedding) => !embedding)
                ) {
                    throw new Error('Failed to generate embeddings.');
                }

                return embeddings as number[][];
            } catch (error: any) {
                console.error(
                    `Batch embedding attempt ${attempt} failed`,
                    error,
                );

                if (attempt === MAX_RETRIES) {
                    throw error;
                }

                let delay = 5000 * attempt;

                if (error?.status === 429) {
                    delay = 60000;
                }

                console.log(
                    `Retrying batch embedding in ${delay / 1000} seconds...`,
                );

                await new Promise((resolve) =>
                    setTimeout(resolve, delay),
                );
            }
        }

        throw new Error('Failed to generate embeddings.');
    }
}
