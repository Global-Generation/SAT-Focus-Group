import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      <Card className="max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Спасибо!</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
          Ваша заявка на участие в фокус-группе успешно отправлена. Мы свяжемся
          с вами в Telegram, если вы будете отобраны.
        </p>
        <p className="mt-4 text-sm text-gray-400">
          Обычно мы отвечаем в течение 3-5 дней.
        </p>
      </Card>
    </div>
  );
}
