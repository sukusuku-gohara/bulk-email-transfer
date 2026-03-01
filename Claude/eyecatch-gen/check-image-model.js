const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKey = envContent.match(/GEMINI_API_KEY=(.+)/)[1].trim();

const ai = new GoogleGenAI({ apiKey });

async function checkModel() {
    try {
        const response = await ai.models.list();
        const models = response.pageInternal;

        const imageModel = models.find(m =>
            m.name === 'models/gemini-2.0-flash-exp-image-generation'
        );

        if (imageModel) {
            console.log('Found image generation model!\n');
            console.log('Name:', imageModel.name);
            console.log('Display Name:', imageModel.displayName);
            console.log('Description:', imageModel.description);
            console.log('\nSupported Actions:');
            console.log(JSON.stringify(imageModel.supportedActions || imageModel.supportedGenerationMethods, null, 2));

            console.log('\nFull model info:');
            console.log(JSON.stringify(imageModel, null, 2));
        } else {
            console.log('Model not found!');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkModel();
