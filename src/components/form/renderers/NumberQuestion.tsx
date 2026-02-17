import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  question: { id: string; label: string; description?: string | null; config?: Record<string, unknown> | null };
  value: number | string;
  onChange: (value: number | string) => void;
}

export default function NumberQuestion({ question, value, onChange }: Props) {
  const min = (question.config?.min as number) ?? undefined;
  const max = (question.config?.max as number) ?? undefined;
  const placeholder = (question.config?.placeholder as string) || "";

  return (
    <div>
      <Label className="text-sm font-medium">{question.label}</Label>
      {question.description && (
        <p className="text-xs text-gray-500 mt-0.5">{question.description}</p>
      )}
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
        min={min}
        max={max}
        placeholder={placeholder}
        className="mt-1.5"
      />
    </div>
  );
}
