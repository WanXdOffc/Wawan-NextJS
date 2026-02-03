import axios from 'axios';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { scrapeGpt3 } from './scrapers/gpt3';

const CONFIG = {
    GEMINI: {
        URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
        API_KEY: process.env.GEMINI_API_KEY || "AIzaSyAKbxdxfyNoQMx9ft9xAVoQWrwpN9JnphY",
        HEADERS: {
            'User-Agent': 'okhttp/5.3.2',
            'Accept-Encoding': 'gzip',
            'x-goog-api-key': process.env.GEMINI_API_KEY || 'AIzaSyAKbxdxfyNoQMx9ft9xAVoQWrwpN9JnphY',
            'x-android-package': 'com.jetkite.gemmy',
            'x-android-cert': '037CD2976D308B4EFD63EC63C48DC6E7AB7E5AF2',
            'content-type': 'application/json; charset=UTF-8'
        }
    },
    IMAGEN: {
        URL: "https://firebasevertexai.googleapis.com/v1beta/projects/gemmy-ai-bdc03/models/imagen-4.0-fast-generate-001:predict",
        HEADERS: {
            'User-Agent': 'ktor-client',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'x-goog-api-key': process.env.IMAGEN_API_KEY || 'AIzaSyAxof8_SbpDcww38NEQRhNh0Pzvbphh-IQ',
            'x-goog-api-client': 'gl-kotlin/2.2.21-ai fire/17.7.0',
            'x-firebase-appid': '1:652803432695:android:c4341db6033e62814f33f2',
            'x-firebase-appversion': '91',
            'x-firebase-appcheck': 'eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==',
            'accept-charset': 'UTF-8'
        }
    }
};

const SYSTEM_INSTRUCTION = {
    role: "user",
    parts: [{
        text: "You are a helpful assistant. Keep your answers concise. Provide no more than 3–4 paragraphs unless the user explicitly asks for a longer explanation."
    }]
};

const uploadToCloud = async (buffer: Buffer) => {
    try {
        const filename = `gemmy-${crypto.randomUUID()}.png`;
        const { data } = await axios.post('https://api.cloudsky.biz.id/get-upload-url', {
            fileKey: filename,
            contentType: 'image/png',
            fileSize: buffer.length
        });

        await axios.put(data.uploadUrl, buffer, {
            headers: { 
                'Content-Type': 'image/png', 
                'Content-Length': buffer.length,
                'x-amz-server-side-encryption': 'AES256' 
            }
        });

        return `https://api.cloudsky.biz.id/file?key=${encodeURIComponent(filename)}`;
    } catch (error: any) {
        console.error(`[Cloud Upload Error]: ${error.message}`);
        return null;
    }
};

const toBase64 = async (input: string | Buffer) => {
    try {
        let buffer: Buffer;
        if (Buffer.isBuffer(input)) {
            buffer = input;
        } else if (input.startsWith('http')) {
            const res = await axios.get(input, { responseType: 'arraybuffer' });
            buffer = Buffer.from(res.data);
        } else if (input.startsWith('data:')) {
            const base64Content = input.split(';base64,').pop();
            if (!base64Content) return null;
            buffer = Buffer.from(base64Content, 'base64');
        } else {
            // In Next.js API routes, we might not have access to local files in the same way
            // so we assume it's a raw base64 string
            buffer = Buffer.from(input, 'base64');
        }
        return buffer.toString('base64');
    } catch (e) { return null; }
};

const getMimeType = (pathOrUrl: string) => {
    const ext = pathOrUrl.split('.').pop()?.toLowerCase();
    const mimes: Record<string, string> = { 
        'jpg': 'image/jpeg', 
        'jpeg': 'image/jpeg', 
        'png': 'image/png', 
        'webp': 'image/webp' 
    };
    return (ext && mimes[ext]) || 'application/octet-stream';
};

export const gemmy = {
    chat: async (prompt: string, history: any[] = [], media: string | Buffer | null = null, mediaMimeType?: string) => {
        try {
            let parts: any[] = [];

            if (media) {
                const base64Data = await toBase64(media);
                if (base64Data) {
                    let isImage = false;
                    let mimeType = mediaMimeType || 'application/octet-stream';

                    if (typeof media === 'string') {
                        if (media.startsWith('http')) {
                            isImage = /\.(jpg|jpeg|png|webp)$/i.test(media);
                            if (isImage) mimeType = getMimeType(media);
                        } else if (media.startsWith('data:image')) {
                            isImage = true;
                            mimeType = media.split(';')[0].split(':')[1];
                        }
                    } else if (Buffer.isBuffer(media)) {
                        const type = await fileTypeFromBuffer(media);
                        if (type && type.mime.startsWith('image/')) {
                            isImage = true;
                            mimeType = type.mime;
                        }
                    }
                    
                    if (isImage) {
                        parts.push({
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        });
                        parts.push({ text: prompt });
                    } else {
                        const decodedText = Buffer.from(base64Data, 'base64').toString('utf-8');
                        parts.push({ 
                            text: `${prompt}\n\n--- DOCUMENT CONTENT ---\n\n${decodedText}` 
                        });
                    }
                } else {
                    parts.push({ text: prompt });
                }
            } else {
                parts.push({ text: prompt });
            }

            const newHistory = [
                ...history,
                {
                    role: "user",
                    parts: parts
                }
            ];

            const payload = {
                contents: newHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40
                },
                systemInstruction: SYSTEM_INSTRUCTION
            };

            try {
                const response = await axios.post(CONFIG.GEMINI.URL, payload, {
                    headers: CONFIG.GEMINI.HEADERS,
                    timeout: 20000
                });

                const result = response.data;
                
                if (result.candidates && result.candidates.length > 0) {
                    const reply = result.candidates[0].content;
                    newHistory.push(reply);
                    
                    return {
                        success: true,
                        reply: reply.parts[0].text,
                        history: newHistory,
                        usage: result.usageMetadata
                    };
                }
            } catch (err: any) {
                const errorMsg = err.response?.data?.error?.message || err.message;
                console.warn(`[Gemini Error]: ${errorMsg}. Falling back to GPT Scraper...`);
                
                // Fallback to Scraper if Gemini fails (e.g. Expired Key)
                const scraperMessages = history.map(h => ({
                    role: (h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant' | 'system',
                    content: h.parts[0].text
                }));

                // Add current prompt
                scraperMessages.push({ role: 'user', content: prompt });

                const scrapedReply = await scrapeGpt3(scraperMessages as any);
                if (scrapedReply) {
                    return {
                        success: true,
                        reply: scrapedReply,
                        history: [...newHistory, { role: 'model', parts: [{ text: scrapedReply }] }]
                    };
                }
                throw err;
            }

            return { success: false, msg: 'No response candidates found' };

        } catch (error: any) {
            console.error(`[Gemmy Chat Error]: ${error.message}`);
            return { success: false, msg: error.response?.data?.error?.message || error.message };
        }
    },

    generateImage: async (prompt: string, options: { aspectRatio?: string } = {}) => {
        try {
            const payload = {
                instances: [
                    { prompt: prompt }
                ],
                parameters: {
                    sampleCount: 1,
                    includeRaiReason: true,
                    includeSafetyAttributes: true,
                    aspectRatio: options.aspectRatio || "1:1",
                    safetySetting: "block_low_and_above",
                    personGeneration: "allow_adult",
                    imageOutputOptions: {
                        mimeType: "image/jpeg",
                        compressionQuality: 100
                    }
                }
            };

            const response = await axios.post(CONFIG.IMAGEN.URL, payload, {
                headers: CONFIG.IMAGEN.HEADERS
            });

            const predictions = response.data.predictions;
            if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
                const imgBuffer = Buffer.from(predictions[0].bytesBase64Encoded, 'base64');
                const url = await uploadToCloud(imgBuffer);
                
                if (url) {
                    return {
                        success: true,
                        url: url,
                        safetyAttributes: predictions[0].safetyAttributes
                    };
                } else {
                    return { success: false, msg: 'Failed to upload image to cloud' };
                }
            }

            return { success: false, msg: 'No image generated' };

        } catch (error: any) {
            console.error(`[Imagen Error]: ${error.message}`);
            return { success: false, msg: error.response?.data?.error?.message || error.message };
        }
    }
};

