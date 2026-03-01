import { NextResponse } from 'next/server';
import { updateJob } from '@/lib/repository/jobStore';
import { compilePrompt } from '@/lib/prompts';
import { generateTextWithRetry } from '@/lib/gemini/client';
import { validateFinalPrompt, FinalPromptResult } from '@/lib/validator';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { jobId, customPrompt } = body;

        if (!customPrompt) {
            return NextResponse.json({ error: 'customPrompt is required' }, { status: 400 });
        }

        const schemaPath = path.join(process.cwd(), 'schemas', 'schemaD_final_prompt.json');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');

        // Compile Step D prompt
        const variables = {
            SYSTEM_PROMPT_JA: customPrompt,
            SCHEMA: schemaContent
        };

        const prompt = compilePrompt('stepD_final_json.md', variables);

        // Call Gemini with Validation
        const finalPromptJson = await generateTextWithRetry<FinalPromptResult>(
            prompt,
            {},
            (data) => {
                const isValid = validateFinalPrompt(data);
                if (!isValid) return { error: 'Invalid Final Prompt schema' };
                return { data: data as FinalPromptResult };
            }
        );

        // Update Job (best-effort for history - may fail on different container)
        if (jobId) {
            updateJob(jobId, {
                status: 'prompt_generated',
                finalPromptJson
            });
        }

        return NextResponse.json({ jobId, finalPromptJson });
    } catch (error: any) {
        console.error('Workflows finalPrompt error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
