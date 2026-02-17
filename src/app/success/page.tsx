import { CheckCircle2, MessageCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="relative flex min-h-screen min-h-dvh items-center justify-center overflow-hidden px-4 py-8">
      {/* Animated blob background */}
      <div className="animated-bg" aria-hidden="true">
        <div className="blob blob-hero-center" />
        <div className="blob blob-1" />
        <div className="blob blob-3" />
        <div className="blob blob-5" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-form animate-fade-scale p-6 text-center sm:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50/80 backdrop-blur-sm">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Спасибо!</h1>

          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            Ваша заявка на участие в фокус-группе успешно отправлена.
          </p>

          <div className="mx-auto mt-5 flex items-start gap-2.5 rounded-xl border border-slate-200/60 bg-white/50 p-4 text-left backdrop-blur-sm">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div className="text-sm leading-relaxed text-slate-600">
              <p>
                Если вы будете отобраны — мы свяжемся с вами через{" "}
                <strong className="text-slate-700">Telegram</strong>.
              </p>
              <p className="mt-2 text-slate-500">
                Мы получаем сотни заявок и, к сожалению, не можем ответить
                каждому. Если вы не получили сообщение — не расстраивайтесь, мы
                ценим ваше участие и интерес к проекту!
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Спасибо, что уделили время. Это очень важно для нас.
          </p>
        </div>
      </div>
    </div>
  );
}
