typescript
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const MODEL_NAME = 'gemini-pro';

export async function generateText(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENAI_API_KEY environment variable is not set.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model: GenerativeModel = genAI.getGenerativeModel({ model: MODEL_NAME });

  const result = await model.generateContent(prompt);
  const response = result.response;
  if (!response.text()) {
    throw new Error('No text in response');
  }

  return response.text();
}

