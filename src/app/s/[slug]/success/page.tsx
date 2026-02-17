import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const survey = await prisma.survey.findUnique({
    where: { slug },
    select: { title: true, successMessage: true },
  });

  const message =
    survey?.successMessage ||
    "Спасибо за участие! Ваши ответы успешно отправлены.";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-xl font-bold mb-3">{survey?.title || "Готово!"}</h1>
        <p className="text-gray-600 whitespace-pre-wrap">{message}</p>
      </Card>
    </div>
  );
}
