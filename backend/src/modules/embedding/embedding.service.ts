import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";

@Injectable()
export class EmbeddingService {

    private ai : GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY || "",
        });
    }

    async generateEmbedding(text: string): Promise<number[]> {
        const response = await this.ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: text,
        });

        const values = response.embeddings?.[0]?.values;

        if (!values) {
            throw new Error('Failed to generate embedding.');
        }

        console.log(response);
        
        if (!response.embeddings || response.embeddings.length === 0) {
            throw new Error("Failed to generate embedding.");
        }

        return values;
    }
    
}
