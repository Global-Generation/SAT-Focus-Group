import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DynamicForm from "@/components/form/DynamicForm";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const survey = await prisma.survey.findUnique({
    where: { slug },
    include: {
      pages: {
        orderBy: { sortOrder: "asc" },
        include: {
          questions: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              fieldKey: true,
              label: true,
              description: true,
              type: true,
              required: true,
              config: true,
              showIf: true,
              options: {
                orderBy: { sortOrder: "asc" },
                select: { id: true, value: true, label: true },
              },
            },
          },
        },
      },
    },
  });

  if (!survey || survey.status !== "ACTIVE") {
    notFound();
  }

  return (
    <DynamicForm
      survey={{
        id: survey.id,
        slug: survey.slug,
        title: survey.title,
        description: survey.description,
        heroTitle: survey.heroTitle,
        ndaText: survey.ndaText,
        successMessage: survey.successMessage,
        dedupFieldKey: survey.dedupFieldKey,
        pages: survey.pages.map((p) => ({
          id: p.id,
          title: p.title,
          sortOrder: p.sortOrder,
          questions: p.questions.map((q) => ({
            ...q,
            config: q.config as Record<string, unknown> | null,
            showIf: q.showIf as { fieldKey: string; value: unknown } | null,
          })),
        })),
      }}
    />
  );
}
