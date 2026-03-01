"use client";

import { useState } from "react";
import Step1Input from "@/components/steps/Step1Input";
import Step2Ideation from "@/components/steps/Step2Ideation";
import Step3Rough from "@/components/steps/Step3Rough";
import Step4SystemPrompt from "@/components/steps/Step4SystemPrompt";
import Step5Final from "@/components/steps/Step5Final";

export default function Home() {
  const [step, setStep] = useState(1);
  const [jobId, setJobId] = useState("");
  const [ideation, setIdeation] = useState<any>(null);
  const [originalInputs, setOriginalInputs] = useState<any>(null);
  const [roughs, setRoughs] = useState<string[]>([]);
  const [systemPromptJa, setSystemPromptJa] = useState("");
  const [finalAsset, setFinalAsset] = useState("");
  const [finalJson, setFinalJson] = useState<any>(null);

  // Simple step nav header
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30 font-sans">
      <header className="fixed top-0 left-0 w-full border-b border-white/5 bg-black/60 backdrop-blur-md z-50 shadow-sm shadow-black/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Gemini Eyecatch Gen
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-700 ${step === i ? 'w-10 bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_10px_purple]' : step > i ? 'w-4 bg-purple-500/50' : 'w-2 bg-white/10'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6 sm:px-12">
        {step === 1 && (
          <Step1Input onNext={(id, data, inputs) => { setJobId(id); setIdeation(data); setOriginalInputs(inputs); setStep(2); }} />
        )}
        {step === 2 && (
          <Step2Ideation jobId={jobId} ideationJson={ideation} inputs={originalInputs} onNext={(assets) => { setRoughs(assets); setStep(3); }} />
        )}
        {step === 3 && (
          <Step3Rough jobId={jobId} ideationJson={ideation} roughAssets={roughs} inputs={originalInputs} onNext={(sys, cid) => { setSystemPromptJa(sys); setStep(4); }} />
        )}
        {step === 4 && (
          <Step4SystemPrompt jobId={jobId} systemPromptJa={systemPromptJa} inputs={originalInputs} onNext={(asset, json) => { setFinalAsset(asset); setFinalJson(json); setStep(5); }} />
        )}
        {step === 5 && (
          <Step5Final
            finalAsset={finalAsset}
            finalJson={finalJson}
            onBackToRough={() => setStep(3)}
            onBackToPrompt={() => setStep(4)}
          />
        )}
      </main>
    </div>
  );
}
