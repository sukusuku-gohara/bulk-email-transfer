import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Heart, AlertTriangle, CheckCircle2, Clock, Calendar, Video, Copy, Bell, Star, MessageCircle } from "lucide-react";
import { PageTransition } from "../PageTransition";
import { motion } from "motion/react";

export function MeetingRequestPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">お見合い申込確認</h1>
        <p className="text-sm text-muted-foreground mb-6">申込前の最終確認</p>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#E0527D]/10 to-[#F7768E]/15 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#E0527D]" />
            </div>
            <div>
              <p className="text-base">はなこさん (28歳)</p>
              <p className="text-xs text-muted-foreground">東京都 ・ 看護師</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">残り申込回数</span>
              <span className="text-sm text-[#E0527D]">5回 / 月10回</span>
            </div>
            <div className="w-full bg-[#E0527D]/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#E0527D] to-[#F7768E] rounded-full h-2 w-1/2" />
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2 border border-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              申込は月10回までです。残り回数をご確認の上、お申込みください。
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white border-2 border-[#E0527D]/10 py-3 rounded-xl hover:bg-[#FFF8F9] transition-all text-sm active:scale-[0.98]"
          >
            やめる
          </button>
          <button
            onClick={() => navigate("/meeting-sent")}
            className="flex-1 bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] text-sm active:scale-[0.98] transition-all"
          >
            申し込む
          </button>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

export function MeetingSentPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6 text-center">
      <div className="max-w-sm mx-auto mt-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_4px_24px_rgba(224,82,125,0.3)]"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-xl mb-2">申込を送信しました</h1>
        <p className="text-sm text-muted-foreground mb-8">
          お相手の承認をお待ちください。<br />承認されると候補日時の入力に進みます。
        </p>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm">ステータス</p>
              <p className="text-xs text-[#E0527D]">承認待ち</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}

export function ReceivedApplicationPage() {
  const navigate = useNavigate();
  const [showRejectForm, setShowRejectForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">お見合い申込</h1>
        <p className="text-sm text-muted-foreground mb-6">あなたへの申込が届いています</p>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#E0527D]/10 to-[#F7768E]/15 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#E0527D]" />
            </div>
            <div>
              <p className="text-base">けんたさん (33歳)</p>
              <p className="text-xs text-muted-foreground">東京都 ・ 商社勤務 ・ 大学卒</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            誠実で真面目な方です。料理が得意で、週末は自炊を楽しんでいます。
          </p>
        </div>

        {showRejectForm ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm mb-1.5 block text-foreground/80">お断りの理由（任意）</label>
              <textarea
                rows={3}
                placeholder="理由をご入力ください"
                className="w-full bg-white border-2 border-[#E0527D]/10 rounded-xl py-3 px-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none resize-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectForm(false)}
                className="flex-1 bg-white border-2 border-[#E0527D]/10 py-3 rounded-xl text-sm active:scale-[0.98] transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={() => navigate("/home")}
                className="flex-1 bg-destructive text-white py-3 rounded-xl text-sm active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(212,24,61,0.25)]"
              >
                お断りする
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setShowRejectForm(true)}
              className="flex-1 bg-white border-2 border-[#E0527D]/10 py-3 rounded-xl text-sm hover:bg-[#FFF8F9] transition-all active:scale-[0.98]"
            >
              お断り
            </button>
            <button
              onClick={() => navigate("/schedule-input")}
              className="flex-1 bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl text-sm shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
            >
              承認する
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ScheduleInputPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">候補日時の入力</h1>
        <p className="text-sm text-muted-foreground mb-6">3件まで候補日時を入力できます</p>

        <div className="space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <p className="text-sm text-muted-foreground mb-2">候補 {i}</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 bg-[#FFF5F7] border-2 border-[#E0527D]/10 rounded-lg py-2 px-3 text-sm outline-none focus:border-[#E0527D] transition-colors"
                />
                <input
                  type="time"
                  className="w-28 bg-[#FFF5F7] border-2 border-[#E0527D]/10 rounded-lg py-2 px-3 text-sm outline-none focus:border-[#E0527D] transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/schedule-select")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
        >
          候補日時を送信
        </button>
      </div>
    </div>
  );
}

export function ScheduleSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);

  const options = [
    { date: "2026年3月15日（日）", time: "14:00〜" },
    { date: "2026年3月16日（月）", time: "19:00〜" },
    { date: "2026年3月20日（金）", time: "20:00〜" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">候補日時の選択</h1>
        <p className="text-sm text-muted-foreground mb-6">1つを選んで確定してください</p>

        <div className="space-y-2 mb-6">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-all active:scale-[0.98] ${
                selected === i ? "border-[#E0527D] bg-[#FFF8F9] shadow-[0_2px_12px_rgba(224,82,125,0.1)]" : "border-transparent shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selected === i ? "bg-gradient-to-br from-[#E0527D] to-[#F7768E]" : "bg-[#E0527D]/10"
                }`}>
                  <Calendar className={`w-5 h-5 ${selected === i ? "text-white" : "text-[#E0527D]"}`} />
                </div>
                <div>
                  <p className="text-sm">{opt.date}</p>
                  <p className="text-xs text-muted-foreground">{opt.time}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/meeting-detail")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
          disabled={selected === null}
        >
          確定する
        </button>
      </div>
    </div>
  );
}

export function MeetingDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">お見合い詳細</h1>
        <p className="text-sm text-muted-foreground mb-6">日時が確定しました</p>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#E0527D]/10 to-[#F7768E]/15 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#E0527D]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">日時</p>
              <p className="text-sm">2026年3月15日（日）14:00〜</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Zoom URL</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-[#E0527D] truncate">https://zoom.us/j/1234567890</p>
                <button className="shrink-0 active:scale-95 transition-transform">
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">リマインド</p>
              <p className="text-sm">前日 / 3時間前 / 1時間前</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 mb-4 border border-[#E0527D]/8">
          <p className="text-sm mb-2">お見合いルール</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>・時間は30分〜1時間を目安にしてください</li>
            <li>・録画・録音は禁止です</li>
            <li>・個人情報の交換はお控えください</li>
            <li>・終了後は必ずフィードバックをお願いします</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/notifications")}
            className="flex-1 bg-white border-2 border-[#E0527D]/10 py-3 rounded-xl text-sm active:scale-[0.98] transition-all"
          >
            通知設定
          </button>
          <button
            onClick={() => window.open("https://zoom.us", "_blank")}
            className="flex-1 bg-gradient-to-r from-sky-500 to-blue-500 text-white py-3 rounded-xl text-sm flex items-center justify-center gap-1 shadow-[0_4px_16px_rgba(56,189,248,0.3)] active:scale-[0.98] transition-all"
          >
            <Video className="w-4 h-4" />
            Zoom参加
          </button>
        </div>

        <button
          onClick={() => navigate("/feedback")}
          className="w-full mt-3 bg-white border-2 border-[#E0527D] text-[#E0527D] py-3 rounded-xl text-sm active:scale-[0.98] transition-all hover:bg-[#FFF8F9]"
        >
          フィードバックを入力
        </button>
      </div>
    </div>
  );
}

export function FeedbackPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <h1 className="text-xl mb-1">お見合い後フィードバック</h1>
        <p className="text-sm text-muted-foreground mb-6">お見合いの感想をお聞かせください（必須）</p>

        <div className="space-y-3 mb-6">
          {[
            { value: "again", label: "また会いたい", icon: Heart, gradient: "from-[#E0527D] to-[#F7768E]" },
            { value: "serious", label: "本交際を申し込みたい", icon: Star, gradient: "from-amber-400 to-orange-400" },
            { value: "ng", label: "今回はご縁がなかった", icon: MessageCircle, gradient: "from-gray-400 to-gray-500" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setResult(opt.value)}
              className={`w-full text-left bg-white rounded-xl p-4 border-2 transition-all flex items-center gap-3 active:scale-[0.98] ${
                result === opt.value ? "border-[#E0527D] bg-[#FFF8F9] shadow-[0_2px_12px_rgba(224,82,125,0.1)]" : "border-transparent shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
              }`}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${opt.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                <opt.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="text-sm mb-1.5 block text-foreground/80">コメント（任意）</label>
          <textarea
            rows={3}
            placeholder="お相手への感想など"
            className="w-full bg-white border-2 border-[#E0527D]/10 rounded-xl py-3 px-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none resize-none transition-colors"
          />
        </div>

        <button
          onClick={() => navigate("/home")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
          disabled={!result}
        >
          送信する
        </button>
      </div>
    </div>
  );
}

export function StripePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">月額課金のお支払い</h1>
        <p className="text-sm text-muted-foreground mb-6">お見合い申込には月額会費が必要です</p>

        <div className="bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl p-6 mb-4 text-center shadow-[0_4px_24px_rgba(224,82,125,0.25)] text-white">
          <p className="text-4xl mb-1">¥980</p>
          <p className="text-sm text-white/80">/ 月（税込）</p>
        </div>

        <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 mb-6 border border-[#E0527D]/8">
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>・毎月自動更新されます</li>
            <li>・いつでも解約可能です</li>
            <li>・お支払いはStripeで安全に処理されます</li>
          </ul>
        </div>

        <div className="mb-4">
          <label className="text-sm mb-1.5 block text-foreground/80">カード番号</label>
          <input
            placeholder="4242 4242 4242 4242"
            className="w-full bg-white border-2 border-[#E0527D]/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] transition-colors"
          />
        </div>
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <label className="text-sm mb-1.5 block text-foreground/80">有効期限</label>
            <input
              placeholder="MM/YY"
              className="w-full bg-white border-2 border-[#E0527D]/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm mb-1.5 block text-foreground/80">CVC</label>
            <input
              placeholder="123"
              className="w-full bg-white border-2 border-[#E0527D]/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-[#E0527D] transition-colors"
            />
          </div>
        </div>

        <button
          onClick={() => navigate("/meeting-sent")}
          className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3.5 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
        >
          お支払い
        </button>
      </div>
    </div>
  );
}
