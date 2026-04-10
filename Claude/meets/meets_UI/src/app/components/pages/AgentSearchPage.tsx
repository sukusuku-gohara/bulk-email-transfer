import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Star, MapPin, Users, CheckCircle } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { PageTransition, SlideTransition } from "../PageTransition";

const AGENT1 = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzJTIwd29tYW58ZW58MXx8fHwxNzczMDQ3MzE5fDA&ixlib=rb-4.1.0&q=80&w=1080";
const AGENT2 = "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxhc2lhbiUyMGJ1c2luZXNzJTIwbWFufGVufDF8fHx8MTc3MzA0NzMyMHww&ixlib=rb-4.1.0&q=80&w=1080";
const AGENT3 = "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxhc2lhbiUyMGJ1c2luZXNzJTIwd29tYW58ZW58MXx8fHwxNzczMDQ3MzE5fDA&ixlib=rb-4.1.0&q=80&w=1080";

const agents = [
  {
    id: "1", name: "鈴木エージェント", area: "東京都・神奈川県", experience: "10年",
    photo: AGENT1, rating: 4.8, members: 45, matchingRate: "82%",
    intro: "10年の経験を活かし、あなたにぴったりのパートナー探しを全力でサポートします。",
    tags: ["20代・30代に強い", "レスポンスが早い", "親身なサポート"],
  },
  {
    id: "2", name: "佐藤エージェント", area: "全国対応（オンライン）", experience: "5年",
    photo: AGENT2, rating: 4.6, members: 60, matchingRate: "75%",
    intro: "男性目線でのアドバイスが得意です。論理的なアプローチで成婚まで導きます。",
    tags: ["男性のサポート実績多数", "オンライン対応", "データ重視"],
  },
  {
    id: "3", name: "田中エージェント", area: "大阪府・京都府", experience: "15年",
    photo: AGENT3, rating: 4.9, members: 30, matchingRate: "88%",
    intro: "アットホームな雰囲気で、相談しやすい環境づくりを心がけています。",
    tags: ["ベテラン", "少人数制で手厚い", "アットホーム"],
  }
];

export function AgentSearchPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="px-4 py-6 bg-[#FFF8F9] min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-muted-foreground active:scale-95 transition-transform">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium">エージェントを探す</h1>
      </div>

      <div className="bg-white rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-3 py-2.5 flex items-center gap-2 border border-[#E0527D]/20 mb-6">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="エリアや特徴で検索" className="flex-1 text-sm outline-none bg-transparent" />
      </div>

      <div className="space-y-4">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => navigate(`/agent-search/${agent.id}`)}
            className="w-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(224,82,125,0.12)] transition-all text-left active:scale-[0.98] border border-transparent hover:border-[#E0527D]/10 p-4"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border border-gray-100">
                <ImageWithFallback
                  src={agent.photo}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-medium mb-1">{agent.name}</h2>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-medium mb-2">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {agent.rating}
                  <span className="text-gray-400 ml-1 font-normal">| 担当会員: {agent.members}名</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" /> {agent.area}
                  </div>
                  <div className="flex items-center gap-1 truncate">
                    <CheckCircle className="w-3 h-3 shrink-0" /> マッチング率: {agent.matchingRate}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {agent.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px] whitespace-nowrap">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
    </PageTransition>
  );
}

export function AgentDetailPage() {
  const navigate = useNavigate();
  const id = window.location.pathname.split("/").pop() || "1";
  const agent = agents.find(a => a.id === id) || agents[0];

  const handleApply = () => {
    if (confirm(`${agent.name}にサポートを依頼しますか？`)) {
      alert("依頼を送信しました。エージェントからの連絡をお待ちください。");
      navigate("/profile");
    }
  };

  return (
    <SlideTransition>
    <div className="pb-24 bg-[#FFF8F9] min-h-screen">
      <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform z-10"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 -mt-16 relative">
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-4 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md -mt-12 mb-3">
            <ImageWithFallback
              src={agent.photo}
              alt={agent.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-xl font-medium mb-1">{agent.name}</h1>
          <div className="flex items-center gap-1 text-sm text-amber-500 font-medium mb-4">
            <Star className="w-4 h-4 fill-current" />
            {agent.rating}
            <span className="text-gray-400 ml-2 font-normal">経験: {agent.experience}</span>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mb-5">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground mb-0.5">担当会員数</p>
              <p className="text-lg font-medium">{agent.members}<span className="text-xs font-normal">名</span></p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center text-amber-700">
              <p className="text-[10px] mb-0.5 opacity-80">マッチング率</p>
              <p className="text-lg font-medium">{agent.matchingRate}</p>
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-sm font-medium mb-2 border-b pb-2">対応エリア</h3>
            <p className="text-sm text-gray-600 mb-4">{agent.area}</p>

            <h3 className="text-sm font-medium mb-2 border-b pb-2">特徴</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {agent.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-[10px]">
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="text-sm font-medium mb-2 border-b pb-2">ご挨拶</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {agent.intro}<br/><br/>
              結婚は人生の大きな決断です。不安なこと、悩んでいること、何でもお気軽にご相談ください。<br/>
              あなたに寄り添い、一緒に理想のパートナーを見つけるお手伝いをさせていただきます。
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/30 p-4 max-w-md mx-auto z-50">
        <button
          onClick={handleApply}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3.5 rounded-xl shadow-[0_4px_16px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] font-medium"
        >
          <Users className="w-5 h-5" />
          このエージェントに依頼する
        </button>
      </div>
    </div>
    </SlideTransition>
  );
}
