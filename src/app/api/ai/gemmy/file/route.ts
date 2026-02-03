import { NextRequest } from 'next/server';
import { gemmy } from '@/lib/gemmy';
import { apiResponse, apiError } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, fileContent, fileName, history } = body;

        if (!prompt) {
            return apiError('Prompt is required', 400);
        }

        if (!fileContent) {
            return apiError('File content is required', 400);
        }

        const fileContext = fileName ? `[File: ${fileName}]\n\n` : '';
        const fullPrompt = `${prompt}\n\n${fileContext}--- FILE CONTENT ---\n\n${fileContent}`;

        const result = await gemmy.chat(fullPrompt, history || []);

        if (result.success) {
            return apiResponse(result);
        } else {
            return apiError(result.msg || 'File analysis failed', 500);
        }
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}
