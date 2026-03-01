import { useState } from 'react';
import { Download, Copy, PartyPopper, ArrowLeft, FileEdit } from 'lucide-react';

export default function Step5Final({
    finalAsset,
    finalJson,
    onBackToRough,
    onBackToPrompt
}: {
    finalAsset: string,
    finalJson: any,
    onBackToRough?: () => void,
    onBackToPrompt?: () => void
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(finalJson, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center justify-center gap-2">
                    <PartyPopper className="text-pink-500 w-10 h-10" />
                    完成しました！
                </h2>
                <p className="text-gray-400 text-lg">あなただけのオリジナルアイキャッチ画像が生成されました。</p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-purple-900/10">
                <div className="aspect-auto w-full max-w-3xl mx-auto relative rounded-2xl overflow-hidden shadow-2xl shadow-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={finalAsset} alt="Final Eyecatch" className="w-full h-auto object-cover" />
                </div>

                <div className="flex justify-center mt-8">
                    <a
                        href={finalAsset}
                        download="eyecatch.jpg"
                        className="bg-white text-black hover:bg-gray-200 px-8 py-3 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" /> 画像をダウンロード
                    </a>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white pl-2 border-l-4 border-purple-500">生成に使用したプロンプトデータ</h3>
                <div className="relative group">
                    <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition flex items-center gap-2 text-sm z-10"
                    >
                        {copied ? 'コピーしました' : <><Copy className="w-4 h-4" />コピー</>}
                    </button>
                    <div className="bg-black/50 border border-white/10 p-6 rounded-2xl">
                        <pre className="whitespace-pre-wrap text-sm text-green-400 font-mono overflow-x-auto">
                            {JSON.stringify(finalJson, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-center gap-4">
                    {onBackToRough && (
                        <button
                            onClick={onBackToRough}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 font-medium rounded-xl transition-all border border-white/20 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            ラフ案を選び直す
                        </button>
                    )}
                    {onBackToPrompt && (
                        <button
                            onClick={onBackToPrompt}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 font-medium rounded-xl transition-all border border-white/20 flex items-center gap-2"
                        >
                            <FileEdit className="w-5 h-5" />
                            プロンプトを編集し直す
                        </button>
                    )}
                </div>
                <div className="text-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="text-gray-400 hover:text-white transition underline underline-offset-4"
                    >
                        最初からやり直す
                    </button>
                </div>
            </div>
        </div>
    );
}
