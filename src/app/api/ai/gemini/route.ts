import { NextRequest, NextResponse } from 'next/server';
import { gemini } from '@/lib/gemini';
import { trackApiRequest } from '@/lib/trackAnalytics';

export async function POST(req: NextRequest) {
    const startTime = Date.now();
    try {
        const { message, instruction, sessionId } = await req.json();
        
        const result = await gemini({ message, instruction, sessionId });
        
        trackApiRequest({
            path: '/api/ai/gemini',
            method: 'POST',
            statusCode: 200,
            ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
            userAgent: req.headers.get('user-agent') || '',
            responseTime: Date.now() - startTime,
        });
        
        return NextResponse.json({ success: true, ...result });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        
        trackApiRequest({
            path: '/api/ai/gemini',
            method: 'POST',
            statusCode: 500,
            ip: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
            responseTime: Date.now() - startTime,
        });
        
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
