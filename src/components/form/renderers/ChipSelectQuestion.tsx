import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  value: string;
  label: string;
}

interface Props {
  question: { id: string; label: string; description?: string | null; options: Option[] };
  value: string[];
  onChange: (value: string[]) => void;
}

export default function ChipSelectQuestion({ question, value, onChange }: Props) {
  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium">{question.label}</Label>
      {question.description && (
        <p className="text-xs text-gray-500 mt-0.5">{question.description}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`opt-btn ${
              value.includes(opt.value) ? "opt-btn-selected" : ""
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
