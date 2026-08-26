import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ChatGoogle } from '@langchain/google';

@Injectable()
export class LangChainAiService {
    private readonly model: ChatGoogle;

    constructor() {
        this.model = new ChatGoogle({
            model: 'gemini-3.6-flash',
            apiKey: process.env.GOOGLE_API_KEY,
            temperature: 0.2,
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

        try {
            const response = await this.model.invoke(prompt);

            if (typeof response.content === 'string') {
                return response.content;
            }

            return JSON.stringify(response.content);
        } catch (error) {
            console.error(
                'LangChain Gemini generation failed:',
                error instanceof Error ? error.message : error,
            );

            throw new ServiceUnavailableException(
                'AI service is temporarily unavailable. Please try again later.',
            );
        }
    }
}