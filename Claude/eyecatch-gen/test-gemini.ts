import { GoogleGenAI } from '@google/genai';
require('dotenv').config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'あいうえお',
      config: {
        responseMimeType: 'application/json',
      }
    });
    console.log(response.text);
  } catch (e: any) {
    console.error('ERROR:', e.message);
  }
}
run();
