import { HfInference } from "@huggingface/inference";

const API_KEY = "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";
const client = new HfInference(API_KEY);

const MAX_RETRIES = 3;
const MAX_CHARS = 1000;

interface ChatMessage {
    content: string;
}

export const getChatCompletion = async (prompt: string, retryCount = 0): Promise<ChatMessage> => {
    if (!API_KEY) {
        throw new Error("Please set your Hugging Face API key");
    }
    if (prompt.length > MAX_CHARS) {
        throw new Error(`Input exceeds maximum length of ${MAX_CHARS} characters`);
    }
    
    try {
        const chatCompletion = await client.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
            {
                role: "system",
                content: "You are a professional idea analyzer. Format your response as follows:\n\nRATING: X/10\nSTATUS: [REALISTIC/UNREALISTIC]\n\n### Technical Feasibility\n[Analyze technical aspects and current technology availability]\n\n### Market Analysis\n[Include relevant market statistics and adoption rates]\n\n### Implementation Challenges\n[List key challenges and requirements]\n\n### Cost Estimation\n[Provide rough cost ranges and resource requirements]\n\n### Timeline\n[Estimated implementation timeline]\n\nUse ** for highlighting key points and statistics. Be direct and data-driven in your analysis."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 500
    });

        const message = chatCompletion.choices[0].message;
        return { content: message.content || '' };
    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            return getChatCompletion(prompt, retryCount + 1);
        }
        throw error;
    }
};
