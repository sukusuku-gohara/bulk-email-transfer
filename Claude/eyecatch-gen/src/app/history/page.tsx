"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi('/api/jobs/all')
            .then(res => setJobs(res.jobs))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
                        生成履歴
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center p-20 text-gray-500">
                        履歴がありません。
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition flex flex-col">
                                <div className="aspect-video bg-black/50 relative">
                                    {job.finalAsset ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={job.finalAsset} alt="thumbnail" className="w-full h-full object-cover" />
                                    ) : job.roughAssets?.[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={job.roughAssets[job.selectedConceptId ? job.ideationJson?.ideas?.findIndex((i: any) => i.concept_id === job.selectedConceptId) : 0] || job.roughAssets[0]} alt="thumbnail" className="w-full h-full object-cover opacity-50 grayscale" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded bg-black/70 backdrop-blur-sm">
                                        {job.status === 'completed' ? <span className="text-green-400">完了</span> : <span className="text-orange-400">途中 ({job.status})</span>}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col gap-2">
                                    <h3 className="font-bold text-lg line-clamp-1">{job.inputs.title || "No Title"}</h3>
                                    <p className="text-xs text-gray-400">作成日: {new Date(job.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
