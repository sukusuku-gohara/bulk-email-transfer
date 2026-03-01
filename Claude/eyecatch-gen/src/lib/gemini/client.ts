import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables');
}

// Ensure global ai client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export interface TextGenerationOptions {
    model?: string;
    systemInstruction?: string;
    responseSchema?: any;
    image?: string; // base64 data URI
}

export async function generateTextWithRetry<T>(
    prompt: string,
    options: TextGenerationOptions,
    validator: (data: any) => { data?: T; error?: string },
    maxRetries = 1
): Promise<T> {
    let attempt = 0;
    let lastError: any = null;

    const model = options.model || 'gemini-2.5-flash';

    while (attempt <= maxRetries) {
        try {
            // Prepare contents (with image if provided)
            let contents: any = prompt;
            if (options.image) {
                // Extract base64 data and mimeType from data URI
                const matches = options.image.match(/^data:([^;]+);base64,(.+)$/);
                if (matches) {
                    const [, mimeType, base64Data] = matches;
                    contents = [
                        {
                            inlineData: {
                                mimeType,
                                data: base64Data
                            }
                        },
                        { text: prompt }
                    ];
                }
            }

            // NOTE: For true structured outputs in @google/genai, we pass responseSchema
            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    systemInstruction: options.systemInstruction,
                    responseMimeType: 'application/json',
                    // To use dynamic JSON schema from our files, we might need to map it to GenAI Type enum
                    // but passing the raw object as responseSchema sometimes works in the raw API depending on version.
                    // We will use standard json schema if possible, or fallback to plain JSON + ajv validation.
                    // Wait, the new SDK expects specific Type objects, so we just use application/json
                    // and let the LLM generate JSON, then we validate rigidly with AJV.
                }
            });

            const text = response.text || '';

            // Clean up markdown code blocks if any (e.g., ```json\n...\n```)
            const cleanJsonStr = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

            const parsed = JSON.parse(cleanJsonStr);
            const { data, error } = validator(parsed);

            if (error) {
                throw new Error(`Schema validation failed: ${error}`);
            }

            if (data) {
                return data;
            }
        } catch (err: any) {
            console.warn(`[Attempt ${attempt + 1}] Text generation or validation failed: ${err.message}`);
            lastError = err;
            attempt++;
        }
    }

    throw new Error(`Failed after ${maxRetries} retries. Last error: ${lastError?.message}`);
}

export async function generatePlainText(
    prompt: string,
    options: TextGenerationOptions = {}
): Promise<string> {
    const model = options.model || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction: options.systemInstruction,
        }
    });

    return response.text || '';
}

export interface ImageGenerationOptions {
    model?: string;
    aspectRatio?: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
    negativePrompt?: string;
    referenceImage?: string; // base64 data URI for logo/reference
}

export async function generateImage(
    prompt: string,
    options: ImageGenerationOptions = {}
): Promise<string> {
    // Using Gemini 2.5 Flash Image (Nano Banana)
    // This model uses generateContent, not generateImages
    const model = options.model || 'gemini-2.5-flash-image';

    // Build enhanced prompt with size and aspect ratio specifications
    const aspectRatio = options.aspectRatio || '16:9';
    let promptText = `Create an image with the following specifications:
- Aspect ratio: ${aspectRatio} (STRICT REQUIREMENT)
- Resolution: 1920x1080 pixels (STRICT REQUIREMENT)
- Format: Horizontal/Landscape orientation

Image description:
${prompt}

IMPORTANT: The output image MUST be exactly ${aspectRatio} aspect ratio at 1920x1080 resolution.`;

    // If reference image (logo) is provided, add instruction to incorporate it
    if (options.referenceImage) {
        promptText += `\n\nCRITICAL: A reference image (logo/brand asset) is provided. You MUST incorporate the visual elements, logo, brand colors, and design style from the reference image directly into the generated image. DO NOT just use it as a style guide - include the actual logo/design elements as they appear in the reference image.`;
    }

    // Prepare contents (with reference image if provided)
    let contents: any = promptText;
    if (options.referenceImage) {
        // Extract base64 data and mimeType from data URI
        const matches = options.referenceImage.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
            const [, mimeType, base64Data] = matches;
            contents = [
                {
                    inlineData: {
                        mimeType,
                        data: base64Data
                    }
                },
                { text: promptText }
            ];
        }
    }

    const response = await ai.models.generateContent({
        model,
        contents
    });

    console.log('Image generation response:', JSON.stringify(response, null, 2));

    // Extract inline image data from response
    // The response structure might be: response.candidates[0].content.parts[0].inlineData
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                const { mimeType, data } = part.inlineData;
                return `data:${mimeType};base64,${data}`;
            }
        }
    }

// candidates がどこにあるかはSDKで異なるため、複数候補を順に見る
const r: any = response as any;

const candidates =
  r?.candidates ??
  r?.response?.candidates ??
  r?.data?.candidates ??
  r?.result?.candidates ??
  [];

const parts =
  candidates?.[0]?.content?.parts ??
  candidates?.[0]?.content?.[0]?.parts ??
  candidates?.[0]?.parts ??
  [];

const inlinePart = (parts as any[]).find((p) => p?.inlineData);

if (inlinePart?.inlineData) {
  const imageData = inlinePart.inlineData;
  const mimeType = imageData.mimeType || "image/jpeg";
  const base64Image = imageData.data;

  // ✅ 成功時はここで return する（あなたの関数の返り値に合わせて調整）
  return base64Image;
}

// ❌ 画像が取れなかった場合だけ throw
throw new Error(
  "No image returned from generation API. Response: " + JSON.stringify(response)
);
}