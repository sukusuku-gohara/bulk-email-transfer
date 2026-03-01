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
            m.name === 'models/gemini-2.5-flash-image'
        );

        if (imageModel) {
            console.log('✓ Found: Gemini 2.5 Flash Image\n');
            console.log('Name:', imageModel.name);
            console.log('Display Name:', imageModel.displayName);
            console.log('Description:', imageModel.description);
            console.log('\nSupported Actions:', imageModel.supportedActions);
            console.log('\nFull details:');
            console.log(JSON.stringify(imageModel, null, 2));
        } else {
            console.log('Model not found!');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkModel();
