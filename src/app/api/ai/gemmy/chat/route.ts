import { NextRequest } from 'next/server';
import { gemmy } from '@/lib/gemmy';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, history, media } = body;

        if (!prompt) {
            return apiError('Prompt is required', 400);
        }

        const result = await gemmy.chat(prompt, history || [], media);

        if (result.success) {
            return apiResponse(result);
        } else {
            return apiError(result.msg || 'Chat failed', 500);
        }
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}
