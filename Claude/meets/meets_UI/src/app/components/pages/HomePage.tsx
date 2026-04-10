import { useNavigate } from "react-router";
import {
  Bell, Heart, Shield, FileText, Users, ChevronRight,
  Calendar, MessageCircle, Sparkles, SlidersHorizontal, Camera, User
} from "lucide-react";
import { PageTransition } from "../PageTransition";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header Tabs (Omiai style) */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1 font-bold text-gray-800">
            <Heart className="w-4 h-4" /> 3294
          </div>
          <h1 className="font-bold text-xl tracking-tighter">Omiai</h1>
          <button className="p-1">
            <SlidersHorizontal className="w-5 h-5 text-gray-800" />
          </button>
        </div>
        <div className="flex px-4 overflow-x-auto scrollbar-hide text-[13px] font-bold text-gray-500">
          <button className="px-3 pb-3 whitespace-nowrap relative">
            ログイン順<span className="absolute top-0 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
          </button>
          <button className="px-3 pb-3 whitespace-nowrap text-gray-800 border-b-2 border-gray-800">
            おすすめ順
          </button>
          <button className="px-3 pb-3 whitespace-nowrap">
            新メンバー
          </button>
          <button className="px-3 pb-3 whitespace-nowrap">
            マイベスト
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        
        {/* Story-like circles */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[
            "https://images.unsplash.com/photo-1611403119860-57c4937ef987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMGNhc3VhbCUyMHNtaWxlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMDQ3MzE4fDA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1752718065615-14ee9a0bb3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMwNDczMTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
            "https://images.unsplash.com/photo-1743359726806-5995b35c4b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwY2FzdWFsJTIwb3V0ZG9vciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzA0NzMxNHww&ixlib=rb-4.1.0&q=80&w=1080"
          ].map((url, i) => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-tr from-gray-300 to-gray-400">
                <ImageWithFallback src={url} alt="" className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 shrink-0 relative">
            <div className="w-[60px] h-[60px] rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
              <span className="text-2xl text-gray-500">+</span>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="w-full h-24 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl flex items-center px-4 relative overflow-hidden shadow-sm">
           <div className="text-white z-10 relative">
             <p className="text-[11px] font-bold mb-1">その人"らしさ"が伝わる</p>
             <h2 className="text-xl font-bold mb-1">マイベスト</h2>
             <span className="inline-block bg-[#FF7A8A] text-[10px] px-2 py-0.5 rounded-md">みんなの投稿を見に行く</span>
           </div>
           {/* Mock phone graphic inside banner */}
           <div className="absolute right-0 bottom-[-20px] w-32 h-36 bg-white rounded-t-xl rotate-12 shadow-lg opacity-90 border-4 border-gray-100 flex flex-col p-2">
             <div className="w-full h-2 bg-gray-100 rounded-full mb-2"></div>
             <div className="w-3/4 h-2 bg-gray-100 rounded-full mb-1"></div>
             <div className="w-1/2 h-2 bg-gray-100 rounded-full mb-1"></div>
           </div>
        </div>

        {/* Grid of users */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-6">
          {[
            { id: 1, name: "神奈川", age: 40, likes: 3, match: 79, photo: "https://images.unsplash.com/photo-1752718065615-14ee9a0bb3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMwNDczMTN8MA&ixlib=rb-4.1.0&q=80&w=1080", isNew: true },
            { id: 2, name: "東京", age: 40, likes: 3, match: 67, photo: "https://images.unsplash.com/photo-1743359726806-5995b35c4b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwY2FzdWFsJTIwb3V0ZG9vciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzA0NzMxNHww&ixlib=rb-4.1.0&q=80&w=1080", isNew: true },
          ].map(user => (
            <button key={user.id} onClick={() => navigate("/candidates/1")} className="text-left group">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                <ImageWithFallback src={user.photo} alt={user.name} className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300" />
                {user.isNew && (
                  <div className="absolute top-0 left-0 bg-[#FF5A71] text-white text-[10px] font-bold px-2 py-1 rounded-br-xl">
                    NEW
                  </div>
                )}
              </div>
              <div className="px-1">
                <h3 className="text-[13px] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                  {user.age}歳 {user.name}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                  <Heart className="w-3 h-3" /> ? <Camera className="w-3 h-3 ml-1" /> {user.likes} <Heart className="w-3 h-3 ml-1" /> {user.match}%
                </p>
              </div>
            </button>
          ))}

          <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-orange-400 to-[#FF5A71] text-white p-4 flex flex-col justify-center items-center text-center shadow-sm">
             <h3 className="font-bold text-[15px] mb-4">本日の<br />Pickupメンバー</h3>
             <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center relative">
               <User className="w-8 h-8 text-white" />
               <Sparkles className="absolute -top-2 -right-3 w-5 h-5" />
               <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4" />
             </div>
          </div>

        </div>

      </div>
    </div>
    </PageTransition>
  );
}