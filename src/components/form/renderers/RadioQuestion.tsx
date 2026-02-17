import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  value: string;
  label: string;
}

interface Props {
  question: { id: string; label: string; description?: string | null; config?: Record<string, unknown> | null; options: Option[] };
  value: string;
  onChange: (value: string) => void;
}

export default function RadioQuestion({ question, value, onChange }: Props) {
  const layout = (question.config?.layout as string) || "vertical";

  return (
    <div>
      <Label className="text-sm font-medium">{question.label}</Label>
      {question.description && (
        <p className="text-xs text-gray-500 mt-0.5">{question.description}</p>
      )}
      <div
        className={`mt-2 ${
          layout === "grid"
            ? "grid grid-cols-2 gap-2 sm:grid-cols-3"
            : "flex flex-col gap-2"
        }`}
      >
        {question.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`opt-btn ${value === opt.value ? "opt-btn-selected" : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
