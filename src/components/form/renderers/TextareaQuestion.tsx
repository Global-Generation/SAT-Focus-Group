import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  question: { id: string; label: string; description?: string | null; config?: Record<string, unknown> | null };
  value: string;
  onChange: (value: string) => void;
}

export default function TextareaQuestion({ question, value, onChange }: Props) {
  const rows = (question.config?.rows as number) || 4;
  const minLength = (question.config?.minLength as number) || 0;

  return (
    <div>
      <Label className="text-sm font-medium">{question.label}</Label>
      {question.description && (
        <p className="text-xs text-gray-500 mt-0.5">{question.description}</p>
      )}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1.5"
      />
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>{value.length} символов</span>
        {minLength > 0 && value.length < minLength && (
          <span className="text-yellow-600">Мин. {minLength} символов</span>
        )}
      </div>
    </div>
  );
}
