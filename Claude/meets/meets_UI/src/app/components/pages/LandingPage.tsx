import { useNavigate } from "react-router";
import { Heart, Shield, Users, MessageCircle, ChevronRight, Star, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { FadeTransition } from "../PageTransition";
import { motion } from "motion/react";

const COUPLE_IMG = "https://images.unsplash.com/photo-1753674687728-f14e1dcd2230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGNvdXBsZSUyMHJvbWFudGljJTIwc3VubGlnaHQlMjB3ZWRkaW5nfGVufDF8fHx8MTc3MzA0NzMxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const features = [
  { icon: Shield, title: "安心の本人確認", desc: "eKYCによる厳格な本人確認で、安全な出会いを提供します", color: "from-emerald-400 to-emerald-500" },
  { icon: Users, title: "エージェントサポート", desc: "専任のエージェントがあなたの婚活を丁寧にサポートします", color: "from-violet-400 to-violet-500" },
  { icon: MessageCircle, title: "匿名チャット", desc: "個人情報を守りながら、安心してお相手とやりとりできます", color: "from-sky-400 to-sky-500" },
  { icon: Heart, title: "真剣な出会い", desc: "成婚を目指す方だけが集まる、真剣交際のプラットフォームです", color: "from-[#E0527D] to-[#F7768E]" },
];

const steps = [
  { num: "01", title: "無料登録", desc: "メールアドレスで簡単登録" },
  { num: "02", title: "プロフィール作成", desc: "あなたの魅力を伝えましょう" },
  { num: "03", title: "本人確認", desc: "eKYCで安全性を確保" },
  { num: "04", title: "お見合い", desc: "オンラインでお相手と出会う" },
];

const faqs = [
  { q: "料金はいくらですか？", a: "月額980円（税込）でご利用いただけます。成婚時に成婚料が発生します。" },
  { q: "どんな人が登録していますか？", a: "20代〜40代の真剣に結婚を考えている方が多く登録されています。" },
  { q: "個人情報は安全ですか？", a: "匿名チャット機能やNGワード検知で、個人情報の漏洩を防止しています。" },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <FadeTransition>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/60 backdrop-blur-xl sticky top-0 z-50 border-b border-white/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl bg-gradient-to-r from-[#E0527D] to-[#F7768E] bg-clip-text text-transparent">meets</span>
        </div>
        <button
          onClick={() => navigate("/auth")}
          className="px-5 py-2 text-sm bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white rounded-full shadow-[0_2px_12px_rgba(224,82,125,0.3)] hover:shadow-[0_4px_20px_rgba(224,82,125,0.4)] transition-all active:scale-95"
        >
          ログイン
        </button>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[520px] md:h-[620px]">
          <ImageWithFallback
            src={COUPLE_IMG}
            alt="幸せなカップル"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D1F21] via-[#2D1F21]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#E0527D]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#F7768E]" />
                <span className="text-xs text-white/90">成婚実績 1,200組以上</span>
              </div>
              <h1 className="text-3xl md:text-4xl mb-3 text-white">
                真剣な出会いを、<br />あなたのそばに。
              </h1>
              <p className="text-white/70 mb-6 max-w-md text-sm">
                meetsは、エージェントがサポートする安心の婚活プラットフォームです。
              </p>
              <button
                onClick={() => navigate("/auth/register")}
                className="bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white px-8 py-3.5 rounded-full text-lg shadow-[0_4px_24px_rgba(224,82,125,0.4)] hover:shadow-[0_6px_32px_rgba(224,82,125,0.5)] transition-all active:scale-95"
              >
                無料で始める
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-xs text-[#E0527D] bg-[#E0527D]/10 px-3 py-1 rounded-full mb-3">FEATURES</span>
          <h2 className="text-2xl mb-2">meetsが選ばれる理由</h2>
          <p className="text-muted-foreground text-sm">安心・安全な婚活をサポート</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-white/50 hover:shadow-[0_4px_24px_rgba(224,82,125,0.1)] transition-shadow"
            >
              <div className={`w-11 h-11 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-[#FFF8F9]">
        <div className="text-center mb-10">
          <span className="inline-block text-xs text-[#E0527D] bg-[#E0527D]/10 px-3 py-1 rounded-full mb-3">HOW IT WORKS</span>
          <h2 className="text-2xl">ご利用の流れ</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="flex-1 text-center bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E0527D] to-[#F7768E] text-white flex items-center justify-center mx-auto mb-3 text-sm shadow-[0_2px_12px_rgba(224,82,125,0.3)]">
                {s.num}
              </div>
              <h4 className="mb-1">{s.title}</h4>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-xs text-[#E0527D] bg-[#E0527D]/10 px-3 py-1 rounded-full mb-3">VOICE</span>
          <h2 className="text-2xl">会員の声</h2>
        </div>
        <div className="max-w-lg mx-auto bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[#E0527D]/5">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            「エージェントの方が親身にサポートしてくださり、素敵なお相手と出会うことができました。匿名チャットのおかげで安心してやりとりができました。」
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white">A</span>
            </div>
            <p className="text-sm">30代女性 / 東京都</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-[#FFF8F9]">
        <div className="text-center mb-10">
          <span className="inline-block text-xs text-[#E0527D] bg-[#E0527D]/10 px-3 py-1 rounded-full mb-3">FAQ</span>
          <h2 className="text-2xl">よくある質問</h2>
        </div>
        <div className="max-w-lg mx-auto space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="bg-white rounded-2xl p-4 group shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="text-sm">{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E0527D]/5 to-[#F7768E]/10" />
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_4px_24px_rgba(224,82,125,0.3)]">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-2xl mb-3">あなたの婚活を始めましょう</h2>
          <p className="text-muted-foreground mb-8 text-sm">まずは無料登録から</p>
          <button
            onClick={() => navigate("/auth/register")}
            className="bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white px-10 py-4 rounded-full text-lg shadow-[0_4px_24px_rgba(224,82,125,0.4)] hover:shadow-[0_6px_32px_rgba(224,82,125,0.5)] transition-all active:scale-95"
          >
            無料会員登録
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D1F21] py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-lg flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="text-white/90">meets</span>
        </div>
        <p className="text-xs text-white/40">&copy; 2026 meets Inc. All rights reserved.</p>
      </footer>
    </div>
    </FadeTransition>
  );
}
