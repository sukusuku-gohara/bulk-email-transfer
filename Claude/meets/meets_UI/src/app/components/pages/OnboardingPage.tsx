import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Camera, Check } from "lucide-react";
import { SlideTransition } from "../PageTransition";
import { motion } from "motion/react";

const TOTAL_STEPS = 8;

const stepTitles: Record<number, { title: string; subtitle: string; emoji: string }> = {
  1: { title: "基本情報", subtitle: "まずはあなたのことを教えてください", emoji: "👤" },
  2: { title: "居住・属性", subtitle: "お住まいの地域や基本的な情報", emoji: "🏠" },
  3: { title: "ライフスタイル", subtitle: "趣味や生活スタイルについて", emoji: "🌿" },
  4: { title: "学歴・仕事・年収", subtitle: "お仕事や学歴について", emoji: "💼" },
  5: { title: "家族・婚歴・価値観", subtitle: "ご家族や結婚観について", emoji: "👨‍👩‍👧" },
  6: { title: "自己PR・紹介文", subtitle: "あなたの魅力をアピール", emoji: "✨" },
  7: { title: "写真アップロード", subtitle: "プロフィール写真を登録", emoji: "📸" },
  8: { title: "登録内容確認", subtitle: "入力内容をご確認ください", emoji: "✅" },
};

function InputField({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-sm mb-1.5 block text-foreground/80">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none transition-colors"
      />
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-sm mb-1.5 block text-foreground/80">{label}</label>
      <select className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none appearance-none transition-colors">
        <option value="">選択してください</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Step1() {
  return (
    <div className="space-y-4">
      <InputField label="氏名（非公開）" placeholder="山田 太郎" />
      <InputField label="ニックネーム" placeholder="公開される名前" />
      <SelectField label="性別" options={["男性", "女性"]} />
      <InputField label="生年月日" placeholder="1990-01-01" type="date" />
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-4">
      <SelectField label="居住地" options={["東京都", "神奈川県", "大阪府", "愛知県", "福岡県", "北海道", "その他"]} />
      <SelectField label="出身地" options={["東京都", "神奈川県", "大阪府", "愛知県", "福岡県", "北海道", "その他"]} />
      <SelectField label="国籍" options={["日本", "その他"]} />
      <SelectField label="身長" options={["150cm未満", "150-155cm", "155-160cm", "160-165cm", "165-170cm", "170-175cm", "175-180cm", "180cm以上"]} />
      <SelectField label="体型" options={["スリム", "普通", "ややぽっちゃり", "グラマー", "がっちり", "筋肉質"]} />
      <SelectField label="血液型" options={["A型", "B型", "O型", "AB型", "不明"]} />
    </div>
  );
}

function Step3() {
  return (
    <div className="space-y-4">
      <SelectField label="兄弟姉妹" options={["一人っ子", "長男/長女", "次男/次女", "末っ子", "その他"]} />
      <InputField label="趣味" placeholder="例: 旅行, 料理, 映画鑑賞" />
      <SelectField label="お酒" options={["飲む", "少し飲む", "飲まない"]} />
      <SelectField label="タバコ" options={["吸う", "吸わない", "時々吸う"]} />
      <SelectField label="休日" options={["土日", "不定休", "平日"]} />
    </div>
  );
}

function Step4() {
  return (
    <div className="space-y-4">
      <SelectField label="職業" options={["会社員", "公務員", "自営業", "医療従事者", "教育関係", "IT/エンジニア", "金融", "その他"]} />
      <SelectField label="年収" options={["300万円未満", "300-400万円", "400-500万円", "500-600万円", "600-800万円", "800-1000万円", "1000万円以上"]} />
      <SelectField label="学歴" options={["高校卒", "専門学校卒", "短大卒", "大学卒", "大学院卒"]} />
      <InputField label="資格（任意）" placeholder="例: MBA, 弁護士" />
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
        <p className="text-xs text-amber-800">
          💡 年収600万円以上を選択された方は、年収証明書の提出が必要です。証明書はホーム画面から提出できます。
        </p>
      </div>
    </div>
  );
}

function Step5() {
  return (
    <div className="space-y-4">
      <SelectField label="結婚歴" options={["未婚", "離婚", "死別"]} />
      <SelectField label="子供の有無" options={["なし", "あり（同居）", "あり（別居）"]} />
      <SelectField label="家族構成" options={["一人暮らし", "実家暮らし", "その他"]} />
      <SelectField label="結婚に対する意思" options={["すぐにでもしたい", "2-3年以内", "いい人がいれば", "まだ分からない"]} />
      <SelectField label="子供の希望" options={["欲しい", "相手と相談", "欲しくない"]} />
    </div>
  );
}

function Step6() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm mb-1.5 block text-foreground/80">自己PR</label>
        <textarea
          placeholder="あなたの魅力を自由にアピールしてください（200文字以上推奨）"
          rows={6}
          className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none resize-none transition-colors"
        />
      </div>
      <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 border border-[#E0527D]/8">
        <p className="text-xs text-muted-foreground mb-2">💡 担当エージェント紹介文</p>
        <p className="text-sm text-muted-foreground italic">
          「とても誠実で穏やかな方です。趣味は旅行で、週末はよくカフェ巡りをされています。お相手の話を丁寧に聞いてくれる素敵な方です。」
        </p>
        <p className="text-xs text-muted-foreground mt-2">※ エージェントが登録後に記入します</p>
      </div>
    </div>
  );
}

function Step7() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-square bg-white border-2 border-dashed border-[#E0527D]/15 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#E0527D]/40 hover:bg-[#FFF8F9] transition-all"
          >
            <Camera className="w-8 h-8 text-[#E0527D]/40 mb-2" />
            <span className="text-xs text-muted-foreground">
              {i === 1 ? "メイン写真" : `サブ写真 ${i - 1}`}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-[#FFF8F9] to-[#FFF0F3] rounded-xl p-4 space-y-2 border border-[#E0527D]/8">
        <p className="text-sm">写真審査ガイド</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>・顔がはっきり写っている写真</li>
          <li>・加工しすぎていない自然な写真</li>
          <li>・1枚目はお顔がよく分かるもの</li>
          <li>・過度な露出のある写真は不可</li>
        </ul>
      </div>
    </div>
  );
}

function Step8() {
  const items = [
    { label: "ニックネーム", value: "たろう" },
    { label: "性別", value: "男性" },
    { label: "生年月日", value: "1990年1月1日" },
    { label: "居住地", value: "東京都" },
    { label: "職業", value: "会社員" },
    { label: "年収", value: "500-600万円" },
    { label: "学歴", value: "大学卒" },
    { label: "結婚歴", value: "未婚" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        {items.map((item, i) => (
          <div key={item.label} className={`flex justify-between px-4 py-3 ${i < items.length - 1 ? "border-b border-[#E0527D]/8" : ""}`}>
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
        <p className="text-xs text-emerald-800">
          ✅ 登録完了後、本人確認（eKYC）に進みます。本人確認が完了するとお見合いのお申込みが可能になります。
        </p>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const { step: stepParam } = useParams();
  const currentStep = parseInt(stepParam || "1");
  const navigate = useNavigate();
  const info = stepTitles[currentStep] || stepTitles[1];

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      case 5: return <Step5 />;
      case 6: return <Step6 />;
      case 7: return <Step7 />;
      case 8: return <Step8 />;
      default: return <Step1 />;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      navigate(`/onboarding/${currentStep + 1}`);
    } else {
      navigate("/ekyc");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      navigate(`/onboarding/${currentStep - 1}`);
    } else {
      navigate("/auth/register");
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-6 py-6">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <button onClick={handleBack} className="text-muted-foreground mb-4 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> 戻る
        </button>

        {/* Progress */}
        <div className="relative h-1.5 bg-[#E0527D]/10 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#E0527D] to-[#F7768E] rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-white bg-gradient-to-r from-[#E0527D] to-[#F7768E] px-2.5 py-0.5 rounded-full shadow-sm">
            {currentStep} / {TOTAL_STEPS}
          </span>
          <span className="text-xs text-muted-foreground">自動保存</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{info.emoji}</span>
          <h1 className="text-xl">{info.title}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{info.subtitle}</p>

        <SlideTransition>
          {renderStep()}
        </SlideTransition>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 bg-white border-2 border-[#E0527D]/10 text-foreground py-3 rounded-xl hover:border-[#E0527D]/20 hover:bg-[#FFF8F9] transition-all active:scale-[0.98]"
            >
              前へ
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {currentStep === TOTAL_STEPS ? (
              <>
                <Check className="w-4 h-4" />
                登録完了
              </>
            ) : (
              <>
                次へ
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
