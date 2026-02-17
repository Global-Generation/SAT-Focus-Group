import { prisma } from "@/lib/prisma";
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
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      {/* Animated blob background */}
      <div className="animated-bg" aria-hidden="true">
        <div className="blob blob-hero-center" />
        <div className="blob blob-1" />
        <div className="blob blob-3" />
        <div className="blob blob-5" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-form animate-fade-scale p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50/80 backdrop-blur-sm">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="mb-3 text-xl font-bold text-slate-900">
            {survey?.title || "Готово!"}
          </h1>
          <p className="whitespace-pre-wrap text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
