import { Card } from "@/components/ui/card";
import { CheckCircle2, MessageCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <Card className="max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Спасибо!</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
          Ваша заявка на участие в фокус-группе успешно отправлена.
        </p>

        <div className="mx-auto mt-5 flex items-start gap-2.5 rounded-xl bg-blue-50 p-4 text-left">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div className="text-sm leading-relaxed text-blue-800">
            <p>
              Если вы будете отобраны — мы свяжемся с вами через{" "}
              <strong>Telegram</strong>.
            </p>
            <p className="mt-2 text-blue-600">
              Мы получаем сотни заявок и, к сожалению, не можем ответить
              каждому. Если вы не получили сообщение — не расстраивайтесь, мы
              ценим ваше участие и интерес к проекту!
            </p>
          </div>
        </div>

        <p className="mt-5 text-xs text-gray-400">
          Спасибо, что уделили время. Это очень важно для нас.
        </p>
      </Card>
    </div>
  );
}
