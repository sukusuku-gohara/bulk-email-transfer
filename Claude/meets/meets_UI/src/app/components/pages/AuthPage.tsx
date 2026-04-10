import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Heart, Mail, Lock, ArrowLeft } from "lucide-react";
import { PageTransition } from "../PageTransition";

export function AuthSelectPage() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-[#E0527D] to-[#F7768E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_24px_rgba(224,82,125,0.3)]">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-2xl bg-gradient-to-r from-[#E0527D] to-[#F7768E] bg-clip-text text-transparent mb-1">meets</h1>
            <p className="text-sm text-muted-foreground">真剣な出会いを、あなたのそばに。</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/auth/register")}
              className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3.5 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] hover:shadow-[0_6px_24px_rgba(224,82,125,0.4)] transition-all active:scale-[0.98]"
            >
              新規会員登録
            </button>
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full bg-white text-[#E0527D] border-2 border-[#E0527D]/20 py-3.5 rounded-xl hover:bg-[#FFF0F3] hover:border-[#E0527D]/30 transition-all active:scale-[0.98]"
            >
              ログイン
            </button>
          </div>
          <button
            onClick={() => navigate("/")}
            className="mt-6 text-sm text-muted-foreground flex items-center gap-1 mx-auto hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            トップに戻る
          </button>
        </div>
      </div>
    </PageTransition>
  );
}

interface RegisterFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  referralCode: string;
  matchmakerCode: string;
  agree: boolean;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      referralCode: "",
      matchmakerCode: "",
      agree: false,
    },
  });

  const password = watch("password");

  const onSubmit = (_data: RegisterFormData) => {
    navigate("/onboarding/1");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-6 py-8">
        <div className="max-w-sm mx-auto">
          <button onClick={() => navigate("/auth")} className="text-muted-foreground mb-6 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> 戻る
          </button>
          <h1 className="text-2xl mb-1">新規会員登録</h1>
          <p className="text-sm text-muted-foreground mb-8">メールアドレスで登録</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm mb-1.5 block text-foreground/80">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="example@mail.com"
                  {...register("email", {
                    required: "メールアドレスは必須です",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "有効なメールアドレスを入力してください",
                    },
                  })}
                  className={`w-full bg-white border-2 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none transition-colors ${
                    errors.email ? "border-destructive" : "border-[#E0527D]/10 hover:border-[#E0527D]/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-1.5 block text-foreground/80">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="8文字以上"
                  {...register("password", {
                    required: "パスワードは必須です",
                    minLength: {
                      value: 8,
                      message: "8文字以上で入力してください",
                    },
                  })}
                  className={`w-full bg-white border-2 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none transition-colors ${
                    errors.password ? "border-destructive" : "border-[#E0527D]/10 hover:border-[#E0527D]/20"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-1.5 block text-foreground/80">パスワード確認</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="もう一度入力"
                  {...register("passwordConfirm", {
                    required: "パスワード確認は必須です",
                    validate: (value) =>
                      value === password || "パスワードが一致しません",
                  })}
                  className={`w-full bg-white border-2 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none transition-colors ${
                    errors.passwordConfirm ? "border-destructive" : "border-[#E0527D]/10 hover:border-[#E0527D]/20"
                  }`}
                />
              </div>
              {errors.passwordConfirm && (
                <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-1.5 block text-foreground/80">紹介コード（任意）</label>
              <input
                type="text"
                placeholder="お持ちの方はご入力ください"
                {...register("referralCode")}
                className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-sm mb-1.5 block text-foreground/80">仲人コード（任意）</label>
              <input
                type="text"
                placeholder="仲人からのコード"
                {...register("matchmakerCode")}
                className="w-full bg-white border-2 border-[#E0527D]/10 hover:border-[#E0527D]/20 rounded-xl py-3 px-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none transition-colors"
              />
            </div>

            <label className="flex items-start gap-3 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded accent-[#E0527D] w-4 h-4"
                {...register("agree", { required: "利用規約への同意が必要です" })}
              />
              <span>利用規約とプライバシーポリシーに同意します</span>
            </label>
            {errors.agree && (
              <p className="text-xs text-destructive">{errors.agree.message}</p>
            )}

            <button
              type="submit"
              disabled={!isValid}
              className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3.5 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] hover:shadow-[0_6px_24px_rgba(224,82,125,0.4)] transition-all mt-2 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98]"
            >
              登録する
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (_data: LoginFormData) => {
    navigate("/home");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-white px-6 py-8">
        <div className="max-w-sm mx-auto">
          <button onClick={() => navigate("/auth")} className="text-muted-foreground mb-6 flex items-center gap-1 text-sm hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> 戻る
          </button>
          <h1 className="text-2xl mb-1">ログイン</h1>
          <p className="text-sm text-muted-foreground mb-8">登録済みのアカウントでログイン</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm mb-1.5 block text-foreground/80">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="example@mail.com"
                  {...register("email", {
                    required: "メールアドレスは必須です",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "有効なメールアドレスを入力してください",
                    },
                  })}
                  className={`w-full bg-white border-2 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none transition-colors ${
                    errors.email ? "border-destructive" : "border-[#E0527D]/10 hover:border-[#E0527D]/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-1.5 block text-foreground/80">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="パスワード"
                  {...register("password", {
                    required: "パスワードは必須です",
                  })}
                  className={`w-full bg-white border-2 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-0 focus:border-[#E0527D] outline-none transition-colors ${
                    errors.password ? "border-destructive" : "border-[#E0527D]/10 hover:border-[#E0527D]/20"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="w-full bg-gradient-to-r from-[#E0527D] to-[#F7768E] text-white py-3.5 rounded-xl shadow-[0_4px_16px_rgba(224,82,125,0.3)] hover:shadow-[0_6px_24px_rgba(224,82,125,0.4)] transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98]"
            >
              ログイン
            </button>

            <button type="button" className="text-sm text-[#E0527D] mx-auto block hover:underline">
              パスワードを忘れた方
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
