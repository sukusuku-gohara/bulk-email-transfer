import { useState } from 'react';
import { Loader2, FileText, Copy, Check } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Step4SystemPrompt({
    jobId,
    systemPromptJa,
    onNext
}: {
    jobId: string,
    systemPromptJa: string,
    onNext: (finalAsset: string, finalJson: any) => void
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [editedPrompt, setEditedPrompt] = useState(systemPromptJa);
    const [isEditing, setIsEditing] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(editedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateFinal = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Generate JSON Prompt (with edited prompt)
            const jsonRes = await fetchApi('/api/workflows/finalPrompt', {
                jobId,
                customPrompt: editedPrompt
            });

            // 2. Generate Final Image
            const imgRes = await fetchApi('/api/workflows/finalImage', { jobId });

            onNext(imgRes.finalAsset, jsonRes.finalPromptJson);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                    <FileText className="text-blue-400 w-8 h-8" />
                    日本語システムプロンプト構築完了
                </h2>
                <p className="text-gray-400">これが画像生成AIに渡す「メタ・プロンプト（指示書）」です。<br />これを元に最適なパラメータ（英語プロンプト、ネガティブプロンプト、アスペクト比など）を自動生成し、本番画像を作成します。</p>
            </div>

            <div className="relative group">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition text-sm"
                    >
                        {isEditing ? '編集完了' : '編集する'}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition flex items-center gap-2 text-sm"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'コピー完了' : 'コピー'}
                    </button>
                </div>
                {isEditing ? (
                    <textarea
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        className="w-full bg-black/50 border border-purple-500/50 p-6 rounded-2xl min-h-[400px] text-sm text-gray-200 font-mono leading-relaxed outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                        placeholder="プロンプトを編集..."
                    />
                ) : (
                    <div className="bg-black/50 border border-white/10 p-6 rounded-2xl max-h-[400px] overflow-y-auto custom-scrollbar">
                        <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
                            {editedPrompt}
                        </pre>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-center pt-4">
                <button
                    onClick={generateFinal}
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-12 py-4 font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 group w-full max-w-md"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> 本番画像を生成中（数十秒かかります）...</>
                    ) : (
                        <>本番用画像生成を実行する <span className="group-hover:translate-x-1 transition-transform">→</span></>
                    )}
                </button>
            </div>
        </div>
    );
}
