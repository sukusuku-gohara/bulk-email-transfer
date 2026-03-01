const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'あいうえお',
      config: {
        systemInstruction: undefined,
        responseMimeType: 'application/json',
      }
    });
    console.log('SUCCESS:', response.text);
  } catch (e) {
    console.error('ERROR:', e.message);
    if (e.stack) console.error(e.stack);
  }
}
run();
