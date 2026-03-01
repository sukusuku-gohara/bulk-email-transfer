const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY=(.+)/)[1].trim();

const ai = new GoogleGenAI({ apiKey });

async function listModels() {
    try {
        console.log('Fetching available models...\n');
        const response = await ai.models.list();
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));

        const models = response.models || response;

        console.log('\n=== ALL MODELS ===\n');
        if (Array.isArray(models)) {
            models.forEach((model) => {
            console.log(`Name: ${model.name}`);
            if (model.displayName) console.log(`  Display: ${model.displayName}`);
            if (model.description) console.log(`  Description: ${model.description}`);
            if (model.supportedGenerationMethods) {
                console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
            }
            console.log('');
        });
        } else {
            console.log('Models is not an array:', models);
        }

        console.log('\n=== IMAGE GENERATION CAPABLE MODELS ===\n');
        const imageModels = models.filter((m) =>
            m.supportedGenerationMethods?.includes('generateImages') ||
            m.name.toLowerCase().includes('image') ||
            m.displayName?.toLowerCase().includes('image')
        );

        if (imageModels.length === 0) {
            console.log('No image generation models found.');
            console.log('\nNote: Google AI Studio API may not support image generation.');
            console.log('You may need to use Vertex AI API instead.');
        } else {
            imageModels.forEach((model) => {
                console.log(`✓ ${model.name}`);
                console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ')}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.status) console.error('Status:', error.status);
    }
}

listModels();
