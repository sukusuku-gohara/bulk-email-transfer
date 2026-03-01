import { GoogleGenAI } from '@google/genai';
import { compilePrompt } from './src/lib/prompts';
import { validateIdeation } from './src/lib/validator';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const article = "吾輩（わがはい）は猫である。名前はまだ無い。\nどこで生れたかとんと見当（けんとう）がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪（どうあく）な種族であったそうだ。";
    const prompt = compilePrompt('stepA_ideation.md', {
      ARTICLE: article,
      TITLE: '(未指定)',
      TONE: '(未指定)',
      BANS: '(なし)'
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const cleanJsonStr = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

    console.log("=== RAW JSON ===");
    console.log(cleanJsonStr);

    let parsed;
    try {
      parsed = JSON.parse(cleanJsonStr);
    } catch (e: any) {
      console.error("JSON parse error:", e.message);
      return;
    }

    const isValid = validateIdeation(parsed);

    if (!isValid) {
      console.error("=== VALIDATION ERRORS ===");
      console.error(JSON.stringify(validateIdeation.errors, null, 2));
    } else {
      console.log("=== VALIDATION SUCCESS ===");
    }

  } catch (e: any) {
    console.error('ERROR:', e.message);
    if (e.stack) console.error(e.stack);
  }
}
run();
