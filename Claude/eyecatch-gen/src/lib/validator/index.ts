import Ajv from 'ajv';

const ajv = new Ajv({
    allErrors: true,
    strict: false // required to allow complex schemas without full validation 
});

// Import schemas
import schemaAIdeation from '../../../schemas/schemaA_ideation.json';
import schemaBRoughPrompts from '../../../schemas/schemaB_rough_prompts.json';
import schemaDFinalPrompt from '../../../schemas/schemaD_final_prompt.json';
import schemaJob from '../../../schemas/schemaJob.json';

// Compile validators once
export const validateIdeation = ajv.compile(schemaAIdeation);
export const validateRoughPrompts = ajv.compile(schemaBRoughPrompts);
export const validateFinalPrompt = ajv.compile(schemaDFinalPrompt);
export const validateJob = ajv.compile(schemaJob);

// Types
export type IdeationResult = {
    ideas: {
        concept_id: string;
        title: string;
        visual: string;
        motif: string;
        composition: string;
        mood: string;
        do: string;
        dont: string;
        short_copy: string;
    }[];
};

export type RoughPromptsResult = {
    prompts: {
        concept_id: string;
        aspect_ratio: "1:1" | "16:9" | "4:3" | "3:4" | "9:16";
        prompt: string;
        negative_prompt: string;
    }[];
};

export type FinalPromptResult = {
    aspect_ratio: "1:1" | "16:9" | "4:3" | "3:4" | "9:16";
    size: string;
    prompt: string;
    negative_prompt: string;
    seed?: number | null;
    guidance?: number | null;
};

// Generic validation wrapper
export function validate<T>(validator: any, data: any): { data?: T; error?: string; errors?: any } {
    const isValid = validator(data);
    if (!isValid) {
        return { error: ajv.errorsText(validator.errors), errors: validator.errors };
    }
    return { data: data as T };
}
