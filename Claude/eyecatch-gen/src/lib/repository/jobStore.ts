import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { validateJob } from '../validator';

const isVercel = !!process.env.VERCEL;

// Vercel本番は /var/task が read-only なので、書き込み可能な /tmp を使う
const DATA_DIR = isVercel
    ? '/tmp/eyecatch-gen'
    : path.join(process.cwd(), '.data');

const JOBS_PATH = path.join(DATA_DIR, 'jobs.json');

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(JOBS_PATH)) fs.writeFileSync(JOBS_PATH, '[]', 'utf-8');
}

export type JobStatus = 'draft' | 'idea_generated' | 'rough_generated' | 'concept_selected' | 'prompt_generated' | 'completed' | 'error';

export interface Job {
    id: string;
    status: JobStatus;
    inputs: {
        article: string;
        title?: string;
        tone?: string;
        bans?: string;
        brand_guideline?: string;
        referenceImage?: string; // base64 data URI
    };
    ideationJson?: any;
    roughAssets?: string[];
    selectedConceptId?: string;
    systemPromptJa?: string;
    finalPromptJson?: any;
    finalAsset?: string;
    errors?: string[];
    createdAt: number;
    updatedAt: number;
}

function readJobs(): Job[] {
    try {
        ensureDataDir();
        const raw = fs.readFileSync(JOBS_PATH, 'utf-8');
        return raw ? JSON.parse(raw) as Job[] : [];
    } catch (e) {
        return [];
    }
}

function writeJobs(jobs: Job[]) {
    ensureDataDir();
    fs.writeFileSync(JOBS_PATH, JSON.stringify(jobs, null, 2), 'utf-8');
}

export function createJob(inputs: Job['inputs']): Job {
    const job: Job = {
        id: uuidv4(),
        status: 'draft',
        inputs,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    const jobs = readJobs();
    jobs.unshift(job); // Add to beginning
    writeJobs(jobs);

    return job;
}

export function getJob(id: string): Job | undefined {
    const jobs = readJobs();
    return jobs.find(j => j.id === id);
}

export function getJobs(): Job[] {
    return readJobs();
}

export function updateJob(id: string, updates: Partial<Job>): Job {
    const jobs = readJobs();
    const jobIndex = jobs.findIndex(j => j.id === id);
    if (jobIndex === -1) {
        throw new Error(`Job not found: ${id}`);
    }

    const updatedJob = {
        ...jobs[jobIndex],
        ...updates,
        updatedAt: Date.now()
    };

    // Validate updated job using AJV before saving
    const isValid = validateJob(updatedJob);
    if (!isValid) {
        console.warn(`Job ${id} schema validation failed after update, but still saving.`);
        // Or throw error depending on strictness
    }

    jobs[jobIndex] = updatedJob;
    writeJobs(jobs);

    return updatedJob;
}
