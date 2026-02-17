import { Label } from "@/components/ui/label";

interface Props {
  question: { id: string; label: string; description?: string | null };
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export default function BooleanQuestion({ question, value, onChange }: Props) {
  return (
    <div>
      <Label className="text-sm font-medium">{question.label}</Label>
      {question.description && (
        <p className="text-xs text-gray-500 mt-0.5">{question.description}</p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`opt-btn flex-1 ${value === true ? "opt-btn-selected" : ""}`}
        >
          Да
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`opt-btn flex-1 ${value === false ? "opt-btn-selected" : ""}`}
        >
          Нет
        </button>
      </div>
    </div>
  );
}
