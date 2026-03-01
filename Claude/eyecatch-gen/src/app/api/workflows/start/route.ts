import { NextResponse } from 'next/server';
import { createJob, updateJob } from '@/lib/repository/jobStore';
import { compilePrompt } from '@/lib/prompts';
import { generateTextWithRetry } from '@/lib/gemini/client';
import { validateIdeation, IdeationResult } from '@/lib/validator';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { article, title, tone, bans, brand_guideline, referenceImage } = body;

        if (!article) {
            return NextResponse.json({ error: 'Article is required' }, { status: 400 });
        }

        // 1. Create Job
        const job = createJob({ article, title, tone, bans, brand_guideline, referenceImage });

        // Load schema to inject into prompt
        const schemaPath = path.join(process.cwd(), 'schemas', 'schemaA_ideation.json');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');

        // 2. Prepare Template Variables
        const variables = {
            ARTICLE: article,
            TITLE: title || '(未指定)',
            TONE: tone || '(未指定)',
            BANS: bans || '(なし)',
            SCHEMA: schemaContent
        };

        // 3. Compile Prompt
        const prompt = compilePrompt('stepA_ideation.md', variables);

        // 4. Call Gemini (with reference image if provided)
        const ideationJson = await generateTextWithRetry<IdeationResult>(
            prompt,
            {
                image: referenceImage || undefined
            },
            (data) => {
                const isValid = validateIdeation(data);
                if (!isValid) {
                    const errMsg = validateIdeation.errors ? JSON.stringify(validateIdeation.errors) : 'Unknown validation error';
                    console.error("Validation failed! Raw Data:", JSON.stringify(data, null, 2));
                    console.error("AJV Errors:", errMsg);
                    return { error: `Schema validation error: ${errMsg}` };
                }
                return { data: data as IdeationResult };
            }
        );

        // 5. Update Job
        updateJob(job.id, {
            status: 'idea_generated',
            ideationJson
        });

        return NextResponse.json({ jobId: job.id, ideationJson });
    } catch (error: any) {
        console.error('Workflows start error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
