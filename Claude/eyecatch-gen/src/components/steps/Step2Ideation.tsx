import { useState } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Step2Ideation({
    jobId,
    ideationJson,
    inputs,
    onNext
}: {
    jobId: string,
    ideationJson: any,
    inputs: any,
    onNext: (roughAssets: string[]) => void
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateRoughs = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetchApi('/api/workflows/rough', {
                jobId,
                ideationJson,
                bans: inputs?.bans,
                referenceImage: inputs?.referenceImage
            });
            onNext(res.roughAssets);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                    <Zap className="text-yellow-400 w-8 h-8" />
                    3つのアイデアが生成されました
                </h2>
                <p className="text-gray-400">記事の分析に基づく3パターンのアプローチです。このアイデアを元にラフ画像を生成します。</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {ideationJson.ideas.map((idea: any, idx: number) => (
                    <div key={idea.concept_id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col space-y-4 hover:border-purple-500/30 transition-colors">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold mb-2">
                            {idx + 1}
                        </div>
                        <h3 className="text-xl font-bold text-white">{idea.title}</h3>

                        <div className="space-y-3 flex-1">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Visual</p>
                                <p className="text-sm text-gray-300">{idea.visual}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mood & Composition</p>
                                <p className="text-sm text-gray-300">{idea.mood} / {idea.composition}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-emerald-500 uppercase tracking-wider">DO</p>
                                <p className="text-sm text-emerald-200/70">{idea.do}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-red-500 uppercase tracking-wider">DON'T</p>
                                <p className="text-sm text-red-200/70">{idea.dont}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-center pt-8">
                <button
                    onClick={generateRoughs}
                    disabled={loading}
                    className="bg-white text-black hover:bg-gray-200 px-8 py-4 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 text-black animate-spin" /> ラフ画像を生成中（約30秒）...</>
                    ) : (
                        <>これらのアイデアでラフ画像を作成する</>
                    )}
                </button>
            </div>
        </div>
    );
}
