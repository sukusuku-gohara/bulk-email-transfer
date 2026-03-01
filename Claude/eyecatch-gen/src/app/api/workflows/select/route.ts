import { NextResponse } from 'next/server';
import { getJob, updateJob } from '@/lib/repository/jobStore';
import { compilePrompt } from '@/lib/prompts';
import { generatePlainText } from '@/lib/gemini/client';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { jobId, selectedConceptId, ideationJson: bodyIdeationJson, title: bodyTitle, bans: bodyBans } = body;

        if (!jobId || !selectedConceptId) {
            return NextResponse.json({ error: 'jobId and selectedConceptId are required' }, { status: 400 });
        }

        // Use data from request body if provided (stateless mode for Vercel),
        // otherwise fall back to job store (local dev compatibility)
        let ideationJson = bodyIdeationJson;
        let title = bodyTitle;
        let bans = bodyBans;

        if (!ideationJson) {
            const job = getJob(jobId);
            if (!job) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }
            if (!job.ideationJson) {
                return NextResponse.json({ error: 'Job does not have ideation results' }, { status: 400 });
            }
            ideationJson = job.ideationJson;
            title = job.inputs.title;
            bans = job.inputs.bans;
        }

        // Find selected concept
        const selectedIdea = ideationJson.ideas.find((i: any) => i.concept_id === selectedConceptId);
        if (!selectedIdea) {
            return NextResponse.json({ error: 'Selected concept not found in ideation' }, { status: 404 });
        }

        // Compile Step C prompt
        const variables = {
            TITLE: title || '(未指定)',
            BANS: bans || '(なし)',
            SELECTED_IDEA: JSON.stringify(selectedIdea, null, 2)
        };

        const prompt = compilePrompt('stepC_system_prompt_ja.md', variables);

        // Call Gemini for plain text
        const systemPromptJa = await generatePlainText(prompt, {
            model: 'gemini-2.5-flash' // using flash context window
        });

        // Update Job (best-effort for history - may fail on different container)
        updateJob(jobId, {
            status: 'concept_selected',
            selectedConceptId,
            systemPromptJa
        });

        return NextResponse.json({ jobId, systemPromptJa });
    } catch (error: any) {
        console.error('Workflows select error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
