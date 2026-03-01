import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Step3Rough({
    jobId,
    ideationJson,
    roughAssets,
    inputs,
    onNext
}: {
    jobId: string,
    ideationJson: any,
    roughAssets: string[],
    inputs: any,
    onNext: (systemPromptJa: string, selectedIdeaId: string) => void
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const handleSelect = async () => {
        if (selectedIdx === null) return;
        setLoading(true);
        setError('');
        try {
            const selectedConceptId = ideationJson.ideas[selectedIdx].concept_id;
            const res = await fetchApi('/api/workflows/select', {
                jobId,
                selectedConceptId,
                ideationJson,
                title: inputs?.title,
                bans: inputs?.bans
            });
            onNext(res.systemPromptJa, selectedConceptId);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">ラフ画像の選択</h2>
                <p className="text-gray-400">3つのアプローチを元にラフ画像を生成しました。方向性に合うものを1つ選んでください。</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {roughAssets.map((asset, idx) => {
                    const idea = ideationJson.ideas[idx];
                    const isSelected = selectedIdx === idx;
                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedIdx(idx)}
                            className={`relative cursor-pointer group bg-black rounded-2xl overflow-hidden border-2 transition-all ${isSelected ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border-white/10 hover:border-white/30'
                                }`}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 z-10 bg-black/50 rounded-full backdrop-blur-sm">
                                    <CheckCircle2 className="w-8 h-8 text-purple-400" />
                                </div>
                            )}
                            <div className="aspect-[4/3] w-full relative overflow-hidden bg-gray-900 group-hover:opacity-90 transition-opacity">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={asset} alt={idea.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full">
                                <h3 className="text-lg font-bold text-white mb-1 drop-shadow-md">{idea.title}</h3>
                                <p className="text-xs text-gray-300 line-clamp-2">{idea.short_copy}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-center pt-8">
                <button
                    onClick={handleSelect}
                    disabled={loading || selectedIdx === null}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-12 py-4 font-bold rounded-xl transition-all shadow-lg disabled:opacity-20 flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> 日本語システムプロンプトを構築中...</>
                    ) : (
                        <>この方向性で制作を進める <span className="group-hover:translate-x-1 transition-transform">→</span></>
                    )}
                </button>
            </div>
        </div>
    );
}
