import fs from 'fs';
import path from 'path';

export const PROMPTS_DIR = path.join(process.cwd(), 'prompts');

export function loadPromptTemplate(filename: string): string {
    try {
        const filePath = path.join(PROMPTS_DIR, filename);
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error(`Failed to load prompt template: ${filename}`, error);
        throw new Error(`Failed to load prompt template: ${filename}`);
    }
}

export function renderPrompt(template: string, variables: Record<string, string>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        // Replace all occurrences
        rendered = rendered.split(placeholder).join(value || '');
    }
    return rendered;
}

// Helper to pre-load and render with common_system
export function compilePrompt(promptFilename: string, variables: Record<string, string>): string {
    const commonSystem = loadPromptTemplate('common_system.md');
    const template = loadPromptTemplate(promptFilename);

    // First, resolve the common system
    const withSystem = template.replace('{{COMMON_SYSTEM}}', commonSystem);

    // Then resolve all other variables
    return renderPrompt(withSystem, variables);
}
