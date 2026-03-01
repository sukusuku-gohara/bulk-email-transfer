import { NextResponse } from 'next/server';
import { getJob } from '@/lib/repository/jobStore';

export async function GET(req: Request, { params }: { params: Promise<{ jobId: string }> }) {
    try {
        const { jobId } = await params;

        const job = getJob(jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({ job });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
