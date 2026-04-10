import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Bell, Upload, ShieldCheck, CreditCard, AlertTriangle, Ban } from "lucide-react";
import { PageTransition } from "../PageTransition";
import { motion } from "motion/react";

export function NotificationsPage() {
  const navigate = useNavigate();
  const [lineEnabled, setLineEnabled] = useState(true);
  const [dayBefore, setDayBefore] = useState(true);
  const [threeHours, setThreeHours] = useState(true);
  const [oneHour, setOneHour] = useState(false);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full transition-all relative ${checked ? "bg-gradient-to-r from-[#E0527D] to-[#F7768E] shadow-[0_2px_6px_rgba(224,82,125,0.3)]" : "bg-[#E0527D]/15"}`}
    >
      <motion.span
        className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">通知・LINE設定</h1>
        <p className="text-sm text-muted-foreground mb-6">通知の受け取り方法を設定</p>

        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-4">
            <div>
              <p className="text-sm">LINE通知</p>
              <p className="text-xs text-muted-foreground">LINEで通知を受け取る</p>
            </div>
            <Toggle checked={lineEnabled} onChange={setLineEnabled} />
          </div>
        </div>

        <p className="text-sm mb-3">お見合いリマインド</p>
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden mb-4">
          {[
            { label: "前日", checked: dayBefore, onChange: setDayBefore },
            { label: "3時間前", checked: threeHours, onChange: setThreeHours },
            { label: "1時間前", checked: oneHour, onChange: setOneHour },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex items-center justify-between px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#E0527D]/6" : ""}`}>
              <span className="text-sm">{item.label}</span>
              <Toggle checked={item.checked} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

export function CertificatesPage() {
  const navigate = useNavigate();

  const certs = [
    { name: "本人確認（eKYC）", status: "verified", date: "2026年2月1日" },
    { name: "独身証明書", status: "verified", date: "2026年2月5日" },
    { name: "住民票", status: "required", date: null },
    { name: "年収証明書", status: "required", date: null },
    { name: "学歴証明書", status: "optional", date: null },
  ];

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">証明書管理</h1>
        <p className="text-sm text-muted-foreground mb-6">各種証明書の提出と管理</p>

        <div className="space-y-3">
          {certs.map((cert) => (
            <div key={cert.name} className="bg-white rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm">{cert.name}</p>
                {cert.status === "verified" && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> 確認済
                  </span>
                )}
                {cert.status === "required" && (
                  <span className="text-[10px] bg-red-50 text-destructive px-2 py-0.5 rounded-full">要提出</span>
                )}
                {cert.status === "optional" && (
                  <span className="text-[10px] bg-[#E0527D]/8 text-muted-foreground px-2 py-0.5 rounded-full">任意</span>
                )}
              </div>
              {cert.date && <p className="text-xs text-muted-foreground">提出日: {cert.date}</p>}
              {cert.status !== "verified" && (
                <button className="mt-2 text-xs text-[#E0527D] flex items-center gap-1 hover:underline">
                  <Upload className="w-3 h-3" /> アップロード
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mt-4 border border-amber-100">
          <p className="text-xs text-amber-800">
            💡 証明書は発行日から3ヶ月以内のものが有効です。バッジはプロフィールに表示されます。
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

export function BillingPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">月額会費・カード管理</h1>
        <p className="text-sm text-muted-foreground mb-6">お支払い情報の確認と変更</p>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4">
          <p className="text-xs text-muted-foreground mb-1">現在のプラン</p>
          <p className="text-lg bg-gradient-to-r from-[#E0527D] to-[#F7768E] bg-clip-text text-transparent mb-3">月額 ¥980（税込）</p>
          <div className="flex justify-between text-sm py-2 border-t border-[#E0527D]/8">
            <span className="text-muted-foreground">次回請求日</span>
            <span>2026年4月9日</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-t border-[#E0527D]/8">
            <span className="text-muted-foreground">ステータス</span>
            <span className="text-emerald-600">有効</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-sm">登録カード</p>
              <p className="text-xs text-muted-foreground">**** **** **** 4242</p>
            </div>
          </div>
          <button className="text-xs text-[#E0527D] hover:underline">カードを変更する</button>
        </div>

        <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 border border-[#E0527D]/8">
          <p className="text-xs text-muted-foreground">
            決済に関する問題がある場合は、サポートまでお問い合わせください。
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

export function AccountSuspendedPage() {
  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6 flex items-center justify-center">
      <div className="max-w-sm mx-auto text-center">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_4px_16px_rgba(212,24,61,0.15)]">
          <Ban className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-xl mb-2">アカウントが停止されています</h1>
        <p className="text-sm text-muted-foreground mb-6">
          以下の理由でアカウントが一時停止されています。
        </p>

        <div className="bg-red-50 rounded-xl p-4 text-left mb-6 border border-red-100">
          <p className="text-sm text-destructive">
            本人確認の失敗回数が上限に達しました。
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 text-left mb-6 border border-[#E0527D]/8">
          <p className="text-sm mb-1">解除方法</p>
          <p className="text-xs text-muted-foreground">
            サポートチームに連絡して、停止解除の手続きを行ってください。
          </p>
        </div>

        <a
          href="mailto:support@meets.jp"
          className="w-full inline-block bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl text-sm shadow-[0_4px_16px_rgba(224,82,125,0.3)]"
        >
          サポートに連絡する
        </a>
      </div>
    </div>
    </PageTransition>
  );
}

export function OnboardingResumePage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6 flex items-center justify-center">
      <div className="max-w-sm mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_4px_24px_rgba(224,82,125,0.3)]"
        >
          <Bell className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-xl mb-2">前回の続きから再開</h1>
        <p className="text-sm text-muted-foreground mb-6">
          プロフィール入力の途中です。<br />前回の入力地点から再開できます。
        </p>

        <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-6 text-left">
          <div className="flex justify-between text-sm py-2">
            <span className="text-muted-foreground">前回の地点</span>
            <span>④ 学歴・仕事・年収</span>
          </div>
          <div className="w-full bg-[#E0527D]/10 rounded-full h-2 mt-2">
            <div className="bg-gradient-to-r from-[#E0527D] to-[#F7768E] rounded-full h-2 w-1/2" />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/onboarding/1")}
            className="flex-1 bg-white border-2 border-[#E0527D]/10 py-3 rounded-xl text-sm active:scale-[0.98] transition-all"
          >
            最初から
          </button>
          <button
            onClick={() => navigate("/onboarding/4")}
            className="flex-1 bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl text-sm shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
          >
            再開する
          </button>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

export function MeetingsListPage() {
  const navigate = useNavigate();

  const meetings = [
    { id: 1, name: "はなこさん", date: "2026年3月15日（日）14:00", status: "confirmed" },
    { id: 2, name: "みきさん", date: "2026年3月20日（金）20:00", status: "pending" },
  ];

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-4 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">お見合い一覧</h1>
        <p className="text-sm text-muted-foreground mb-6">予定されているお見合い</p>

        <div className="space-y-3">
          {meetings.map((m) => (
            <button
              key={m.id}
              onClick={() => navigate("/meeting-detail")}
              className="w-full bg-white rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] text-left hover:shadow-[0_2px_16px_rgba(224,82,125,0.1)] transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm">{m.name}</p>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                  m.status === "confirmed"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {m.status === "confirmed" ? "確定" : "調整中"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{m.date}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
