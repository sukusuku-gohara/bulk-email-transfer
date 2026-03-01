import { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export default function Step1Input({ onNext }: { onNext: (jobId: string, data: any, inputs: any) => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/image\/(png|webp)/)) {
            setError('PNG または WebP 形式の画像のみアップロード可能です');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('画像サイズは10MB以下にしてください');
            return;
        }

        setImageFile(file);
        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        // Convert image to base64 if exists
        let referenceImageBase64 = '';
        if (imageFile) {
            const reader = new FileReader();
            referenceImageBase64 = await new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
        }

        const payload = {
            article: formData.get('article'),
            title: formData.get('title'),
            tone: formData.get('tone'),
            bans: formData.get('bans'),
            referenceImage: referenceImageBase64,
        };

        try {
            const res = await fetchApi('/api/workflows/start', payload);
            onNext(res.jobId, res.ideationJson, payload);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white">記事からアイキャッチを生成</h2>
                <p className="text-gray-400">記事本文を入力して、AIに魅力的なアイキャッチ画像のアイデアを考えてもらいましょう。</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">記事本文 <span className="text-red-400">*</span></label>
                    <textarea
                        name="article"
                        required
                        rows={8}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-200 placeholder:text-gray-600 resize-none"
                        placeholder="記事の本文をここにペースト..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">タイトル (任意)</label>
                        <input
                            name="title"
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-200 placeholder:text-gray-600"
                            placeholder="記事のタイトル"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">トーン・雰囲気 (任意)</label>
                        <input
                            name="tone"
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-200 placeholder:text-gray-600"
                            placeholder="例: サイバーパンク風、水彩画のような優しさ"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">禁止事項 (任意)</label>
                    <input
                        name="bans"
                        type="text"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none text-gray-200 placeholder:text-gray-600"
                        placeholder="例: 文字は入れない、暗い色は使わない"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">
                        参考画像 (任意) <span className="text-xs text-gray-400">PNG/WebP, 最大10MB</span>
                    </label>
                    <div className="space-y-3">
                        {!imagePreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 transition-all bg-black/20">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-400">クリックして画像を選択</span>
                                <input
                                    type="file"
                                    accept="image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-white/10">
                                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-all"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500">
                            ※参考画像を指定すると、その画像の要素やスタイルを活用したアイキャッチが生成されます
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium p-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                    {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> アイデアを生成中...</>
                    ) : (
                        <>3案のアイデアを生成する <span className="group-hover:translate-x-1 transition-transform">→</span></>
                    )}
                </button>
            </form>
        </div>
    );
}
