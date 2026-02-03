import axios from 'axios';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function scrapeGpt3(messages: Message[]) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages harus berupa array dan tidak boleh kosong');
  }

  const res = await axios.post(
    'https://chatbot-ji1z.onrender.com/chatbot-ji1z',
    { messages },
    {
      timeout: 30000,
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        origin: 'https://seoschmiede.at',
      },
    }
  );

  return res.data?.choices?.[0]?.message?.content || null;
}
