import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Heart, ChevronRight, AlertTriangle, CheckCircle2, Star } from "lucide-react";
import { PageTransition } from "../PageTransition";
import { motion } from "motion/react";

const relationships = [
  { id: "1", name: "はなこさん", age: 28, status: "仮交際", since: "2026年2月15日", area: "東京都" },
  { id: "2", name: "みきさん", age: 31, status: "仮交際", since: "2026年3月1日", area: "神奈川県" },
];

export function RelationshipsPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="bg-white min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-[15px] mx-auto">お相手から</h1>
        <button className="absolute right-4 p-1">
          <div className="w-5 h-[2px] bg-gray-800 mb-1" />
          <div className="w-5 h-[2px] bg-gray-800 mb-1" />
          <div className="w-5 h-[2px] bg-gray-800" />
        </button>
      </div>

      <div className="bg-yellow-400 py-3 px-4 flex items-center justify-between">
        <span className="text-white text-[13px] font-bold">ハイライト表示で注目度をUPさせよう！</span>
        <button className="border border-white text-white rounded-md px-4 py-1 text-[11px] font-bold">
          詳細
        </button>
      </div>

      <div className="flex flex-col items-center justify-center mt-20 px-4 text-center">
        <div className="w-24 h-24 bg-gray-50 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center relative mb-8">
          <div className="w-8 h-8 rounded-full border-2 border-gray-400 mb-1"></div>
          <div className="w-12 h-6 border-2 border-gray-400 rounded-t-full border-b-0"></div>
          
          <div className="absolute -bottom-4 bg-[#FF7A8A] text-white text-[11px] font-bold px-4 py-1.5 rounded-full z-10 w-24">
            いいね！
          </div>
          
          <div className="absolute -left-3 bottom-0 text-[#FF7A8A]">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12L1 8M8 19l-4-4"/></svg>
          </div>

          <div className="absolute -bottom-6 -right-6">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="#666" strokeWidth="1.5"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 14v4M12 6v6"/></svg>
          </div>
        </div>

        <h2 className="text-[#FF7A8A] font-bold mb-4">気になるお相手の方へいいね！をしましょう</h2>
        <p className="text-gray-500 text-[13px] leading-relaxed mb-10">
          あなたに「いいね！」をしている<br />
          新着のお相手はいません
        </p>

        <button className="border border-gray-200 rounded-full px-8 py-3 text-[#2088D5] font-bold text-[13px] bg-gray-50">
          スキップしたお相手を見る
        </button>
      </div>
    </div>
    </PageTransition>
  );
}

export function SeriousRequestPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">本交際申込み</h1>
        <p className="text-sm text-muted-foreground mb-6">仮交際から本交際へ進む意思表示です</p>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E0527D]/10 to-[#F7768E]/15 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#E0527D]" />
            </div>
            <div>
              <p className="text-base">はなこさん (28歳)</p>
              <p className="text-xs text-muted-foreground">仮交際中</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 mb-4 flex items-start gap-2 border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            本交際に進むと、他の仮交際はすべて終了になります。相手の同意が必要です。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white border-2 border-[#E0527D]/10 py-3 rounded-xl text-sm active:scale-[0.98] transition-all"
          >
            やめる
          </button>
          <button
            onClick={() => navigate("/end-other-relationships")}
            className="flex-1 bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl text-sm shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
          >
            申し込む
          </button>
        </div>
      </div>
    </div>
  );
}

export function EndOtherRelationshipsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">他仮交際の終了確認</h1>
        <p className="text-sm text-muted-foreground mb-6">本交際成立に伴い、以下の仮交際が終了します</p>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm">みきさん (31歳)</p>
              <p className="text-xs text-muted-foreground">仮交際中 → 終了</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          ※ お相手にも終了の通知が送られます。この操作は取り消せません。
        </p>

        <button
          onClick={() => navigate("/matches")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
        >
          確認して終了する
        </button>
      </div>
    </div>
  );
}

export function MarriageApplicationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">成婚退会申請</h1>
        <p className="text-sm text-muted-foreground mb-6">おめでとうございます！</p>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_20px_rgba(224,82,125,0.3)]">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <p className="text-base mb-1">成婚退会を申請しますか？</p>
          <p className="text-xs text-muted-foreground">
            承認後、成婚料のお支払いに進みます。<br />お支払い完了後、アカウントは退会となります。
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 bg-white border-2 border-[#E0527D]/10 py-3 rounded-xl text-sm active:scale-[0.98] transition-all">
            やめる
          </button>
          <button
            onClick={() => navigate("/marriage-payment")}
            className="flex-1 bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl text-sm shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
          >
            申請する
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarriagePaymentPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">成婚料のお支払い</h1>
        <p className="text-sm text-muted-foreground mb-6">成婚退会が承認されました</p>

        <div className="bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl p-6 mb-4 text-center shadow-[0_4px_24px_rgba(224,82,125,0.25)] text-white">
          <p className="text-xs text-white/80 mb-1">成婚料</p>
          <p className="text-4xl">¥200,000</p>
          <p className="text-xs text-white/60 mt-1">（税込）</p>
        </div>

        <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 mb-6 border border-[#E0527D]/8">
          <p className="text-xs text-muted-foreground">
            決済はStripeで安全に処理されます。<br />
            決済リンクはメールでもお送りしています。
          </p>
        </div>

        <button
          onClick={() => navigate("/marriage-complete")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3.5 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
        >
          決済に進む
        </button>
      </div>
    </div>
  );
}

export function MarriageCompletePage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto text-center mt-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_6px_32px_rgba(224,82,125,0.35)]"
        >
          <Heart className="w-10 h-10 text-white fill-white" />
        </motion.div>
        <h1 className="text-2xl mb-2">ご成婚おめでとうございます！</h1>
        <p className="text-sm text-muted-foreground mb-8">
          素敵なお相手との出会いを<br />心よりお祝い申し上げます。
        </p>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-6 text-left">
          <p className="text-sm mb-3 text-center">担当エージェントの評価</p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className="active:scale-110 transition-transform">
                <Star className={`w-8 h-8 ${
                  star <= rating ? "text-amber-400 fill-amber-400" : "text-[#E0527D]/15"
                }`} />
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            placeholder="エージェントへのコメント（任意）"
            className="w-full bg-[#FFF5F7] border-2 border-[#E0527D]/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] resize-none transition-colors"
          />
        </div>

        <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 mb-6 border border-[#E0527D]/8">
          <p className="text-xs text-muted-foreground">
            退会処理が完了しました。<br />今後このアカウントにはログインできなくなります。
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
