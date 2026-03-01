import { NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/repository/jobStore';
import { generateImage } from '@/lib/gemini/client';

export async function POST(req: Request) {
    let requestBody: any = {};
    try {
        requestBody = await req.json();
        const { jobId, finalPromptJson: bodyFinalPromptJson, referenceImage: bodyReferenceImage } = requestBody;

        if (!jobId) {
            return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }

        // Use data from request body if provided (stateless mode for Vercel),
        // otherwise fall back to job store (local dev compatibility)
        let finalPromptJson = bodyFinalPromptJson;
        let referenceImage = bodyReferenceImage;

        if (!finalPromptJson) {
            const job = getJob(jobId);
            if (!job) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }
            if (!job.finalPromptJson) {
                return NextResponse.json({ error: 'Job requires finalPromptJson to generate final image' }, { status: 400 });
            }
            finalPromptJson = job.finalPromptJson;
            referenceImage = job.inputs.referenceImage;
        }

        const { prompt, aspect_ratio } = finalPromptJson;

        // Call Gemini for final image using Nano Banana Pro (Gemini 3 Pro Image)
        // Include reference image (logo) to ensure it's incorporated
        console.log(`Generating final high-quality image for job: ${jobId} using Gemini 3 Pro Image`);
        const finalAsset = await generateImage(prompt, {
            aspectRatio: aspect_ratio,
            model: 'gemini-3-pro-image-preview', // Nano Banana Pro for high quality
            referenceImage: referenceImage
        });

        // Update Job (best-effort for history - may fail on different container)
        updateJob(jobId, {
            status: 'completed',
            finalAsset
        });

        return NextResponse.json({ jobId, finalAsset });
    } catch (error: any) {
        console.error('Workflows finalImage error:', error);
        if (requestBody?.jobId) {
            updateJob(requestBody.jobId, { status: 'error', errors: [error.message] });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
