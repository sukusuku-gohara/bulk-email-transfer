import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, Camera, FileCheck, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { PageTransition } from "../PageTransition";
import { motion } from "motion/react";

export function EkycSubmitPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"upload" | "selfie" | "confirm">("upload");

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-6 py-6">
      <div className="max-w-sm mx-auto">
        <button onClick={() => navigate(-1)} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        <h1 className="text-xl mb-1">本人確認（eKYC）</h1>
        <p className="text-sm text-muted-foreground mb-6">本人確認書類の提出と顔写真の照合を行います</p>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["書類提出", "顔照合", "確認"].map((label, i) => {
            const stepIndex = i === 0 ? "upload" : i === 1 ? "selfie" : "confirm";
            const isCurrent = step === stepIndex;
            const isPast = (step === "selfie" && i === 0) || (step === "confirm" && i <= 1);
            return (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm mb-1 transition-all ${
                  isPast || isCurrent
                    ? "bg-gradient-to-br from-[#E0527D] to-[#F7768E] text-white shadow-[0_2px_8px_rgba(224,82,125,0.3)]"
                    : "bg-[#E0527D]/8 text-muted-foreground"
                }`}>
                  {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs ${isCurrent ? "text-[#E0527D]" : "text-muted-foreground"}`}>{label}</span>
              </div>
            );
          })}
        </div>

        {step === "upload" && (
          <div className="space-y-4">
            <p className="text-sm">提出可能な本人確認書類</p>
            <div className="space-y-2">
              {["運転免許証", "マイナンバーカード", "パスポート", "在留カード"].map((doc) => (
                <label key={doc} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-[0_2px_12px_rgba(224,82,125,0.08)] transition-all">
                  <input type="radio" name="doc" className="accent-[#E0527D] w-4 h-4" />
                  <span className="text-sm">{doc}</span>
                </label>
              ))}
            </div>

            <div className="border-2 border-dashed border-[#E0527D]/20 rounded-2xl p-8 text-center hover:border-[#E0527D]/40 hover:bg-[#FFF8F9] transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-[#E0527D]/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">書類の写真をアップロード</p>
              <p className="text-xs text-muted-foreground mt-1">表面・裏面の両方が必要です</p>
            </div>

            <button
              onClick={() => setStep("selfie")}
              className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
            >
              次へ：顔写真の撮影
            </button>
          </div>
        )}

        {step === "selfie" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#E0527D]/5 to-[#F7768E]/10 mx-auto flex items-center justify-center mb-4 border-2 border-dashed border-[#E0527D]/20">
                <Camera className="w-12 h-12 text-[#E0527D]/30" />
              </div>
              <p className="text-sm mb-2">顔写真を撮影してください</p>
              <p className="text-xs text-muted-foreground">書類の写真と照合します。正面を向いて明るい場所で撮影してください。</p>
            </div>

            <button
              onClick={() => setStep("confirm")}
              className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              撮影する
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[0_4px_16px_rgba(224,82,125,0.25)]">
                <FileCheck className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm mb-3">提出内容を確認</p>
              <div className="space-y-2 text-left">
                <div className="flex justify-between py-2 border-b border-[#E0527D]/8">
                  <span className="text-sm text-muted-foreground">書類種別</span>
                  <span className="text-sm">運転免許証</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E0527D]/8">
                  <span className="text-sm text-muted-foreground">書類画像</span>
                  <span className="text-sm text-[#E0527D]">2枚アップロード済み</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">顔写真</span>
                  <span className="text-sm text-[#E0527D]">撮影済み</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/ekyc/status")}
              className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
            >
              提出する
            </button>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}

export function EkycStatusPage() {
  const navigate = useNavigate();
  const [status] = useState<"pending" | "rejected" | "approved">("pending");

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-6 py-6">
      <div className="max-w-sm mx-auto text-center">
        {status === "pending" && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mt-16 mb-6 shadow-[0_4px_16px_rgba(245,158,11,0.2)]"
            >
              <Clock className="w-10 h-10 text-amber-600" />
            </motion.div>
            <h1 className="text-xl mb-2">審査中です</h1>
            <p className="text-sm text-muted-foreground mb-8">
              本人確認の審査には通常1〜3営業日かかります。<br />審査完了後、通知でお知らせいたします。
            </p>
            <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm">審査ステータス</p>
                  <p className="text-xs text-amber-600">確認中...</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/home")}
              className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
            >
              ホームに戻る
            </button>
          </>
        )}

        {status === "rejected" && (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mt-16 mb-6 shadow-[0_4px_16px_rgba(212,24,61,0.15)]">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-xl mb-2">差し戻しがあります</h1>
            <p className="text-sm text-muted-foreground mb-4">
              以下の理由で再提出が必要です。
            </p>
            <div className="bg-red-50 rounded-xl p-4 text-left mb-6 border border-red-100">
              <p className="text-sm text-destructive">書類の一部が不鮮明です。再度撮影してください。</p>
            </div>
            <p className="text-xs text-muted-foreground mb-6">失敗回数: 1 / 3回</p>
            <button
              onClick={() => navigate("/ekyc")}
              className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] active:scale-[0.98] transition-all"
            >
              再提出する
            </button>
          </>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
