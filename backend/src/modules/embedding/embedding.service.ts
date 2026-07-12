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
}
