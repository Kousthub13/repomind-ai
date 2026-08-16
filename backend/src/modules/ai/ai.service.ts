import { Injectable, ServiceUnavailableException, } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
    private readonly ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!,
        });
    }

    async generateAnswer(
        question: string,
        context: string,
    ): Promise<string> {

        const prompt = `
            You are RepoMind AI, an expert software engineering assistant.

            Answer the user's question ONLY using the provided repository context.

            If the answer cannot be found in the context, reply exactly:

            "I couldn't find that information in the indexed repository."

            Be concise and explain the code clearly.

            Repository Context:

            ${context}

            --------------------------------

            User Question:

            ${question}
        `;

        const MAX_RETRIES = 3;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: prompt,
                });

                return response.text ?? "No response generated.";

            } catch (error) {
                console.error(
                    `AI generation attempt ${attempt} failed:`,
                    error instanceof Error
                        ? error.message
                        : error,
                );

                if (attempt === MAX_RETRIES) {
                    throw new ServiceUnavailableException(
                        'AI service is temporarily unavailable. Please try again later.',
                    );
                }

                await new Promise((resolve) =>
                    setTimeout(resolve, 2000 * attempt),
                );
            }
        }

        throw new ServiceUnavailableException(
            'AI service is temporarily unavailable. Please try again later.',
        );
    }
}