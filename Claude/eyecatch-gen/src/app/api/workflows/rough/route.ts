import { NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/repository/jobStore';
import { compilePrompt } from '@/lib/prompts';
import { generateTextWithRetry, generateImage } from '@/lib/gemini/client';
import { validateRoughPrompts, RoughPromptsResult } from '@/lib/validator';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { jobId, ideationJson: bodyIdeationJson, bans: bodyBans, referenceImage: bodyReferenceImage } = body;

        if (!jobId) {
            return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }

        // Use data from request body if provided (stateless mode for Vercel),
        // otherwise fall back to job store (local dev compatibility)
        let ideationJson = bodyIdeationJson;
        let bans = bodyBans;
        let referenceImage = bodyReferenceImage;

        if (!ideationJson) {
            const job = getJob(jobId);
            if (!job) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }
            if (!job.ideationJson) {
                return NextResponse.json({ error: 'Job does not have ideation results yet' }, { status: 400 });
            }
            ideationJson = job.ideationJson;
            bans = job.inputs.bans;
            referenceImage = job.inputs.referenceImage;
        }

        const schemaPath = path.join(process.cwd(), 'schemas', 'schemaB_rough_prompts.json');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');

        // 1. Prepare Variables
        const variables = {
            IDEATION_JSON: JSON.stringify(ideationJson, null, 2),
            BANS: bans || '(なし)',
            SCHEMA: schemaContent
        };

        const prompt = compilePrompt('stepB_rough_image.md', variables);

        // 2. Generate Image Prompts (Text)
        const roughPromptsData = await generateTextWithRetry<RoughPromptsResult>(
            prompt,
            {},
            (data) => {
                const isValid = validateRoughPrompts(data);
                if (!isValid) return { error: 'Invalid Rough Prompts schema' };
                return { data: data as RoughPromptsResult };
            }
        );

        // 3. Generate Images (Parallel or sequential)
        const prompts = roughPromptsData.prompts;
        const roughAssets: string[] = [];

        // Using sequential to avoid rate limits on free tier API
        // Include reference image if provided
        for (const p of prompts) {
            const base64Asset = await generateImage(p.prompt, {
                aspectRatio: p.aspect_ratio,
                referenceImage: referenceImage
            });
            roughAssets.push(base64Asset);
        }

        // 4. Update Job (best-effort for history - may fail on different container)
        updateJob(jobId, {
            status: 'rough_generated',
            roughAssets
        });

        return NextResponse.json({ jobId, roughAssets });
    } catch (error: any) {
        console.error('Workflows rough error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
