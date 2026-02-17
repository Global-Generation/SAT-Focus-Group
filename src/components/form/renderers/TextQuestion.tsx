import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  question: { id: string; label: string; description?: string | null; config?: Record<string, unknown> | null };
  value: string;
  onChange: (value: string) => void;
}

export default function TextQuestion({ question, value, onChange }: Props) {
  const placeholder = (question.config?.placeholder as string) || "";
  const prefix = (question.config?.prefix as string) || "";

  const handleChange = (val: string) => {
    if (prefix && !val.startsWith(prefix)) {
      onChange(prefix + val);
    } else {
      onChange(val);
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium">{question.label}</Label>
      {question.description && (
        <p className="text-xs text-gray-500 mt-0.5">{question.description}</p>
      )}
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5"
      />
    </div>
  );
}
