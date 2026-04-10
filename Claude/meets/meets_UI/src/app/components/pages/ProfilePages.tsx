import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Edit, ShieldCheck, Camera, ChevronRight, CreditCard, Bell, LogOut, Heart, FileText } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { PageTransition, SlideTransition } from "../PageTransition";

const MAN1 = "https://images.unsplash.com/photo-1729559149688-bee985e447ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMG1hbiUyMHBvcnRyYWl0JTIwc21pbGUlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMDQ3MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const profileData = {
  nickname: "たろう", age: 30, area: "東京都", job: "IT企業", education: "大学卒",
  income: "500-600万円", height: "172cm", bodyType: "普通", bloodType: "A型",
  marriage: "未婚", siblings: "長男", hobbies: "旅行, カフェ巡り, 映画鑑賞",
  alcohol: "少し飲む", smoking: "吸わない", holiday: "土日", wantKids: "欲しい",
  bio: "はじめまして。IT企業でエンジニアをしています。休日はカフェでのんびりしたり、映画を観たりしています。旅行が好きで、年に2-3回は国内外に旅行しています。穏やかで優しい方と出会えたらうれしいです。",
  badges: ["本人確認済", "独身証明"],
};

export function MyProfilePage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="bg-gray-50 min-h-screen pb-6">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ImageWithFallback
              src={MAN1}
              alt="プロフィール"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-[15px] font-bold">{profileData.nickname}</h1>
            <p className="text-[11px] text-gray-500">無料会員</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/profile/view")}
          className="text-sm font-bold border border-gray-300 rounded-full px-4 py-1.5 flex items-center gap-1 active:bg-gray-50 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          プロフィールを設定
        </button>
      </div>

      <div className="bg-white px-4 py-4 border-b border-gray-200 flex items-center justify-around text-center mb-2">
        <div>
          <p className="text-[11px] text-gray-500 mb-1">残いいね！数</p>
          <p className="text-[15px] font-bold text-[#FF5A71] flex items-center justify-center gap-1">
            <Heart className="w-4 h-4 fill-current" /> 3294
          </p>
        </div>
        <div className="w-[1px] h-8 bg-gray-200" />
        <div>
          <p className="text-[11px] text-gray-500 mb-1">残ポイント数</p>
          <p className="text-[15px] font-bold text-amber-500 flex items-center justify-center gap-1">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">P</span> 3
          </p>
        </div>
      </div>

      {/* Grid Menu */}
      <div className="bg-white border-y border-gray-200 py-6 px-4 mb-4">
        <div className="grid grid-cols-3 gap-y-6">
          {[
            { icon: Heart, label: "お気に入り", path: "/favorites", color: "text-gray-800" },
            { icon: Bell, label: "お知らせ", path: "/notifications", color: "text-gray-800", badge: "N" },
            { icon: ArrowLeft, label: "自分から", path: "/history", color: "text-gray-800" },
            { icon: CreditCard, label: "Omiaiポイント", path: "/billing", color: "text-gray-800" },
            { icon: ShieldCheck, label: "有料会員", path: "/premium", color: "text-gray-800" },
            { icon: FileText, label: "プレミアムパック", path: "/premium-pack", color: "text-gray-800" },
            { icon: Camera, label: "ヘルプ", path: "/help", color: "text-gray-800" },
            { icon: Edit, label: "各種設定", path: "/settings", color: "text-gray-800" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-2 active:opacity-60 transition-opacity relative"
            >
              <item.icon className={`w-7 h-7 ${item.color}`} strokeWidth={1.5} />
              {item.badge && (
                <span className="absolute top-0 right-1/4 w-4 h-4 bg-[#FF5A71] text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                  {item.badge}
                </span>
              )}
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Info */}
      <div className="bg-white border-y border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-bold text-gray-800">所属エージェント</p>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm text-amber-700">鈴</span>
            </div>
            <div>
              <p className="text-[13px] font-bold">鈴木エージェント</p>
              <p className="text-[11px] text-gray-500">サポート中</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/agent-search")}
            className="text-[11px] text-[#2088D5] hover:underline"
          >
            変更・検索
          </button>
        </div>
      </div>

      <div className="px-4 py-6">
        <button
          onClick={() => navigate("/")}
          className="w-full bg-white border border-gray-300 py-3 rounded-full text-sm font-bold active:bg-gray-50 transition-all"
        >
          ログアウト
        </button>
      </div>
    </div>
    </PageTransition>
  );
}

export function ProfileViewPage() {
  const navigate = useNavigate();

  const sections = [
    { title: "基本情報", items: [
      { label: "年齢", value: `${profileData.age}歳` },
      { label: "居住地", value: profileData.area },
      { label: "身長", value: profileData.height },
      { label: "体型", value: profileData.bodyType },
      { label: "血液型", value: profileData.bloodType },
    ]},
    { title: "仕事・学歴", items: [
      { label: "職業", value: profileData.job },
      { label: "年収", value: profileData.income },
      { label: "学歴", value: profileData.education },
    ]},
    { title: "ライフスタイル", items: [
      { label: "趣味", value: profileData.hobbies },
      { label: "お酒", value: profileData.alcohol },
      { label: "タバコ", value: profileData.smoking },
      { label: "休日", value: profileData.holiday },
    ]},
    { title: "結婚観", items: [
      { label: "結婚歴", value: profileData.marriage },
      { label: "子供の希望", value: profileData.wantKids },
    ]},
  ];

  return (
    <SlideTransition>
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-[15px]">プロフィールの設定</span>
        <button className="border border-gray-800 rounded-full px-3 py-1 text-[11px] font-bold">
          プレビュー
        </button>
      </div>

      <div className="bg-white px-4 py-6 border-b border-gray-200 mb-2">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <ImageWithFallback
              src={MAN1}
              alt="プロフィール"
              className="w-24 h-24 rounded-[1.5rem] object-cover"
            />
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100">
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-[#2088D5] rounded-full"></span>
                <span className="w-1 h-1 bg-[#2088D5] rounded-full"></span>
                <span className="w-1 h-1 bg-[#2088D5] rounded-full"></span>
              </span>
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-center mb-6">
          <button className="w-20 h-20 rounded-xl border border-[#2088D5] flex items-center justify-center text-[#2088D5]">
            <span className="text-3xl">+</span>
          </button>
          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50" />
          <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50" />
        </div>

        <div className="flex border-b border-gray-200 mb-2">
          <button className="flex-1 pb-3 text-[13px] font-bold text-[#2088D5] border-b-2 border-[#2088D5]">
            プロフィール
          </button>
          <button className="flex-1 pb-3 text-[13px] text-gray-500 font-bold">
            つぶやきPhoto
          </button>
        </div>
      </div>

      <div className="bg-white border-y border-gray-200 mb-4">
        {[
          { label: "マイQ&A", value: "質問に回答して「あなたらしさ」をアピール", highlight: true },
          { label: "マイベスト", value: "「こだわり」をランキング形式にできます", highlight: true },
          { label: "キーワード", value: "" },
          { label: "自己紹介文", value: "" },
          { label: "詳細プロフィール", value: "22/26" },
        ].map((item, i) => (
          <div key={item.label} className={`flex items-center justify-between px-4 py-4 ${i !== 4 ? 'border-b border-gray-200' : ''}`}>
            <span className="text-[13px]">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] ${item.highlight ? 'text-[#FF5A71]' : 'text-gray-500'}`}>{item.value}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2">
        <button className="w-full bg-white border border-gray-800 rounded-full py-3.5 text-[13px] font-bold flex items-center justify-center gap-2">
          人気会員を参考にする
        </button>
      </div>

    </div>
    </SlideTransition>
  );
}

export function ProfileEditPage() {
  const navigate = useNavigate();

  return (
    <SlideTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">プロフィール編集</h1>
        <p className="text-sm text-muted-foreground mb-6">自動保存されます</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm mb-1.5 block text-foreground/80">ニックネーム</label>
            <input
              defaultValue={profileData.nickname}
              className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] transition-colors"
            />
          </div>
          <div>
            <label className="text-sm mb-1.5 block text-foreground/80">居住地</label>
            <select className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] appearance-none transition-colors">
              <option>東京都</option>
              <option>神奈川県</option>
              <option>大阪府</option>
            </select>
          </div>
          <div>
            <label className="text-sm mb-1.5 block text-foreground/80">職業</label>
            <input
              defaultValue={profileData.job}
              className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] transition-colors"
            />
          </div>
          <div>
            <label className="text-sm mb-1.5 block text-foreground/80">年収</label>
            <select className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] appearance-none transition-colors">
              <option>500-600万円</option>
              <option>600-800万円</option>
              <option>800-1000万円</option>
            </select>
          </div>
          <div>
            <label className="text-sm mb-1.5 block text-foreground/80">趣味</label>
            <input
              defaultValue={profileData.hobbies}
              className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] transition-colors"
            />
          </div>
          <div>
            <label className="text-sm mb-1.5 block text-foreground/80">自己PR</label>
            <textarea
              defaultValue={profileData.bio}
              rows={5}
              className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] resize-none transition-colors"
            />
          </div>
        </div>

        <button
          onClick={() => navigate("/profile/view")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl mt-6 shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
        >
          保存する
        </button>
      </div>
    </div>
    </SlideTransition>
  );
}
