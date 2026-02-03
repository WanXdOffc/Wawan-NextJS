import { scrapeGpt3 } from './gpt3';
import { gemini } from '../gemini';
import axios from 'axios';

export type AiModel = 'gpt3' | 'claude' | 'gemini' | 'auto';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function unifiedAi(messages: Message[], model: AiModel = 'auto') {
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  const fullPrompt = `${systemMessage}\n\n${userMessage}`;

  // Auto-selection logic
  let selectedModel = model;
  if (model === 'auto') {
    if (fullPrompt.length > 5000) {
      selectedModel = 'gemini'; // Gemini handles longer context
    } else {
      selectedModel = 'gpt3';
    }
  }

  try {
    switch (selectedModel) {
      case 'gpt3':
        return await scrapeGpt3(messages);
      
      case 'gemini':
        const geminiRes = await gemini({ message: userMessage, instruction: systemMessage });
        return geminiRes.text;

      case 'claude':
        // Calling the internal API endpoint for Claude since it has complex bypass logic
        const claudeRes = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/ai/claude`, {
          prompt: fullPrompt
        });
        return claudeRes.data.result;

      default:
        return await scrapeGpt3(messages);
    }
  } catch (error: any) {
    console.error(`AI Model ${selectedModel} failed:`, error.message);
    // Fallback to GPT3 if chosen model fails
    if (selectedModel !== 'gpt3') {
      console.log('Falling back to GPT3...');
      return await scrapeGpt3(messages);
    }
    throw error;
  }
}
