import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

async function listModels() {
    try {
        console.log('Listing available models...\n');
        const models = await ai.models.list();

        console.log('All models:');
        models.forEach((model: any) => {
            console.log(`- ${model.name}`);
            if (model.supportedGenerationMethods) {
                console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
            }
        });

        console.log('\n\nImage generation models:');
        const imageModels = models.filter((m: any) =>
            m.name.toLowerCase().includes('image') ||
            m.supportedGenerationMethods?.includes('generateImage') ||
            m.supportedGenerationMethods?.includes('generateImages')
        );

        imageModels.forEach((model: any) => {
            console.log(`- ${model.name}`);
            console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        });

    } catch (error: any) {
        console.error('Error listing models:', error.message);
        console.error('Full error:', error);
    }
}

listModels();
