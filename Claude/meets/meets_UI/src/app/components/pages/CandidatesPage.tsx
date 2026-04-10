import { useState } from "react";
import { useNavigate } from "react-router";
import { Heart, MapPin, Briefcase, GraduationCap, ShieldCheck, ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { PageTransition, SlideTransition } from "../PageTransition";

const WOMAN1 = "https://images.unsplash.com/photo-1752718065615-14ee9a0bb3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMwNDczMTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const WOMAN2 = "https://images.unsplash.com/photo-1743359726806-5995b35c4b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwY2FzdWFsJTIwb3V0ZG9vciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzA0NzMxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const MAN1 = "https://images.unsplash.com/photo-1729559149688-bee985e447ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGUlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMDQ3MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const MAN2 = "https://images.unsplash.com/photo-1611403119860-57c4937ef987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMGNhc3VhbCUyMHNtaWxlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMDQ3MzE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const candidates = [
  {
    id: "1", name: "はなこ", age: 28, area: "東京都", job: "看護師", education: "大学卒",
    photo: WOMAN1, badges: ["本人確認済", "独身証明"], source: "エージェント紹介", agentName: "鈴木エージェント",
    intro: "穏やかで笑顔が素敵な方です。休日はカフェ巡りや読書を楽しんでいます。",
  },
  {
    id: "2", name: "みき", age: 31, area: "神奈川県", job: "IT企業", education: "大学院卒",
    photo: WOMAN2, badges: ["本人確認済"], source: "検索マッチ", agentName: null,
    intro: "活発で明るい性格の方です。旅行が大好きで、これまで20カ国以上を訪問されています。",
  },
  {
    id: "3", name: "けんた", age: 33, area: "東京都", job: "商社勤務", education: "大学卒",
    photo: MAN1, badges: ["本人確認済", "年収証明"], source: "エージェント紹介", agentName: "佐藤エージェント",
    intro: "誠実で真面目な方です。料理が得意で、週末は自炊を楽しんでいます。",
  },
  {
    id: "4", name: "ゆうき", age: 29, area: "大阪府", job: "公務員", education: "大学卒",
    photo: MAN2, badges: ["本人確認済"], source: "検索マッチ", agentName: null,
    intro: "スポーツ好きでアウトドア派です。週末はよくランニングをしています。",
  },
];

export function CandidatesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"intro" | "search">("intro");

  const displayList = activeTab === "intro" 
    ? candidates.filter(c => c.source === "エージェント紹介")
    : candidates;

  return (
    <PageTransition>
    <div className="px-4 py-6">
      <h1 className="text-xl mb-4">さがす</h1>
      
      {/* Tabs */}
      <div className="flex bg-[#E0527D]/10 rounded-full p-1 mb-6 relative">
        <button
          onClick={() => setActiveTab("intro")}
          className={`flex-1 py-2 text-sm text-center rounded-full transition-all z-10 ${
            activeTab === "intro" ? "text-white font-medium" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          紹介
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-2 text-sm text-center rounded-full transition-all z-10 ${
            activeTab === "search" ? "text-white font-medium" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          検索
        </button>
        <div 
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-[#E0527D] to-[#F7768E] rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateX(${activeTab === "intro" ? "0%" : "100%"})` }}
        />
      </div>

      {activeTab === "search" && (
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 bg-white rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-3 py-2.5 flex items-center gap-2 border border-transparent focus-within:border-[#E0527D]/30 transition-colors">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="キーワードで検索" className="flex-1 text-sm outline-none bg-transparent" />
            </div>
            <button className="w-11 h-11 bg-white rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 border border-transparent hover:border-[#E0527D]/30 transition-colors text-muted-foreground">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["20代", "30代", "東京都", "年収600万〜", "大卒以上"].map(tag => (
              <button key={tag} className="px-3 py-1.5 bg-white border border-[#E0527D]/10 rounded-full text-xs text-gray-600 whitespace-nowrap shadow-sm hover:bg-[#FFF5F7] transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayList.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/candidates/${c.id}`)}
            className="w-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(224,82,125,0.12)] transition-all text-left active:scale-[0.98] border border-transparent hover:border-[#E0527D]/10"
          >
            <div className="flex">
              <div className="relative w-28 h-36">
                <ImageWithFallback
                  src={c.photo}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-center gap-2 mb-1">
                  {c.source === "エージェント紹介" ? (
                    <span className="text-[10px] text-white bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-0.5 rounded-full">{c.source}</span>
                  ) : (
                    <span className="text-[10px] text-[#E0527D] bg-[#E0527D]/10 px-2.5 py-0.5 rounded-full border border-[#E0527D]/20">会員検索</span>
                  )}
                  {c.agentName && (
                    <span className="text-[10px] text-gray-500 truncate max-w-[80px]">担当: {c.agentName.slice(0,2)}</span>
                  )}
                </div>
                <p className="text-base mb-1 font-medium">{c.name}さん ({c.age}歳)</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E0527D]/60" /> {c.area}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-[#E0527D]/60" /> {c.job}
                  </div>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {c.badges.map((b) => (
                    <span key={b} className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-2.5 h-2.5" /> {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
    </PageTransition>
  );
}

export function CandidateDetailPage() {
  const navigate = useNavigate();
  // Get candidate ID from path, mock implementation
  const id = window.location.pathname.split("/").pop() || "1";
  const profile = candidates.find(c => c.id === id) || candidates[0];

  const handleRequestMeeting = () => {
    if (profile.agentName) {
      if (confirm(`この会員は${profile.agentName}が担当しています。お見合い申請はまず担当エージェントに通知されます。申請しますか？`)) {
        navigate("/meeting-request");
      }
    } else {
      if (confirm("この会員には直接お見合い申請が通知されます。申請しますか？")) {
        navigate("/meeting-request");
      }
    }
  };

  return (
    <SlideTransition>
    <div className="bg-gray-50 min-h-screen pb-32">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 max-w-md mx-auto pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto p-1"
        >
          <ArrowLeft className="w-6 h-6 text-white drop-shadow-md" />
        </button>
        <button className="pointer-events-auto p-1">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white drop-shadow-md" />
            <div className="w-1.5 h-1.5 rounded-full bg-white drop-shadow-md" />
            <div className="w-1.5 h-1.5 rounded-full bg-white drop-shadow-md" />
          </div>
        </button>
      </div>

      <div className="relative h-[65vh]">
        <ImageWithFallback
          src={profile.photo}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        {/* Omiai-style badge over photo */}
        <div className="absolute bottom-4 left-4 bg-orange-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1">
          <span className="text-white">NEW</span> 登録1週間以内
        </div>
        <div className="absolute bottom-4 right-4 bg-white/90 rounded-full w-14 h-14 flex flex-col items-center justify-center border-2 border-[#FF5A71]">
          <span className="text-[8px] text-[#FF5A71]">マッチ度</span>
          <span className="text-[16px] font-bold text-[#FF5A71] -mt-1">67<span className="text-[10px]">%</span></span>
        </div>
      </div>

      <div className="bg-white px-4 py-4 mb-2">
        <div className="flex gap-2 justify-center mb-4">
          <div className="w-14 h-14 bg-gray-100 border border-gray-200" />
          <div className="w-14 h-14 bg-gray-100 border border-gray-200" />
          <div className="w-14 h-14 bg-gray-100 border border-gray-200" />
          <div className="w-14 h-14 bg-gray-100 border border-gray-200" />
        </div>
        
        <div className="text-center mb-4">
          <h1 className="text-xl inline-flex items-end gap-2">
            {profile.name} <span className="text-[13px]">{profile.age}歳 / {profile.area}</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> 24時間以内</span>
            <span>|</span>
            <span className="flex items-center gap-1 text-[#FF5A71]"><Heart className="w-3.5 h-3.5 fill-[#FF5A71]" /> いいね！ : ?</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2">
          {["ディズニー", "アニメ", "ゲーム", "ドライブ", "映画鑑賞", "散歩", "Music", "漫画", "ショッピング", "カフェ巡り"].map(tag => (
            <span key={tag} className="border border-gray-200 rounded-full px-4 py-1.5 text-[11px] text-gray-800">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Basic Profile */}
      <div className="bg-white border-y border-gray-200 mb-2">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-[13px] font-bold">自己紹介文</h2>
        </div>
        <div className="px-4 py-4 text-[13px] text-gray-800 leading-relaxed">
          はじめまして♪はじめまして(*^^*)<br />
          プロフィールを見てくれて、ありがとうございます。<br /><br />
          {profile.area}在住で、会社員の仕事をしています。<br />
          出身は高知です。<br /><br />
          YouTubeが好きで、家にいるときはよく観てます。<br />
          休みの日は家で過ごすこともお出かけするのも好きです。<br /><br />
          同じ趣味だったり、一緒にいて楽しい時間を過ごせる人と出会えたらいいな、と思っています。<br /><br />
          素敵な出会いが見つかると嬉しいです☆
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white border-y border-gray-200 mb-2">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="text-[13px] font-bold">外見・内面</h2>
        </div>
        {[
          { label: "身長", value: "153cm" },
          { label: "体型", value: "普通" },
          { label: "チャームポイント", value: "笑顔\n童顔" },
          { label: "性格・タイプ", value: "親しみやすい\n誠実\nいつも笑顔" },
        ].map((item, i) => (
          <div key={item.label} className={`flex px-4 py-4 ${i !== 3 ? 'border-b border-gray-200' : ''}`}>
            <span className="w-1/3 text-[13px] text-gray-400">{item.label}</span>
            <span className="w-2/3 text-[13px] text-right whitespace-pre-line text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Fixed CTA like Omiai */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent z-50 flex items-end justify-center pb-6 gap-4 pointer-events-none">
        <button
          onClick={handleRequestMeeting}
          className="relative pointer-events-auto"
        >
          <div className="w-[84px] h-[84px] rounded-full bg-[#FF7A8A] flex items-center justify-center shadow-lg transform hover:scale-95 transition-transform">
            <Heart className="w-10 h-10 text-white fill-white" />
          </div>
          <div className="absolute -bottom-1 -right-2 bg-white rounded-full border border-gray-200 px-2 py-0.5 text-[#FF7A8A] font-bold text-[11px] shadow-sm">
            ×10
          </div>
        </button>
        <button
          className="pointer-events-auto w-[84px] h-[84px] rounded-full bg-[#F5C767] flex items-center justify-center shadow-lg transform hover:scale-95 transition-transform"
        >
          <div className="w-9 h-7 border-2 border-white rounded-md flex items-center justify-center relative">
             <div className="absolute top-0 w-full h-[2px] bg-white transform rotate-45 origin-top-left -ml-[1px]" />
             <div className="absolute top-0 w-full h-[2px] bg-white transform -rotate-45 origin-top-right -mr-[1px]" />
          </div>
        </button>
      </div>

    </div>
    </SlideTransition>
  );
}
