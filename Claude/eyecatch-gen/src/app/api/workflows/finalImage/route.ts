import { NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/repository/jobStore';
import { generateImage } from '@/lib/gemini/client';

export async function POST(req: Request) {
    let requestBody: any = {};
    try {
        requestBody = await req.json();
        const { jobId } = requestBody;

        if (!jobId) {
            return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
        }

        const job = getJob(jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        if (!job.finalPromptJson) {
            return NextResponse.json({ error: 'Job requires finalPromptJson to generate final image' }, { status: 400 });
        }

        const { prompt, negative_prompt, aspect_ratio } = job.finalPromptJson;

        // Call Gemini for final image using Nano Banana Pro (Gemini 3 Pro Image)
        // Include reference image (logo) to ensure it's incorporated
        console.log(`Generating final high-quality image for job: ${jobId} using Gemini 3 Pro Image`);
        const finalAsset = await generateImage(prompt, {
            aspectRatio: aspect_ratio,
            model: 'gemini-3-pro-image-preview', // Nano Banana Pro for high quality
            referenceImage: job.inputs.referenceImage // Include logo/reference image
        });

        // Update Job
        updateJob(job.id, {
            status: 'completed',
            finalAsset
        });

        return NextResponse.json({ jobId: job.id, finalAsset });
    } catch (error: any) {
        console.error('Workflows finalImage error:', error);
        if (requestBody?.jobId) {
            updateJob(requestBody.jobId, { status: 'error', errors: [error.message] });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
