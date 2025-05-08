import { generateText } from '@/lib/ai';


export const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await generateText(prompt);
    return response;
  } catch (error) {
    console.error('Error getting AI response:', error);
    throw error; // Re-throw the error to handle it higher up if necessary
  }
};

