interface Props {
  question: { id: string; label: string; description?: string | null };
  value: boolean;
  onChange: (value: boolean) => void;
}

export default function ConsentQuestion({ question, value, onChange }: Props) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <div>
          <span className="text-sm font-medium">{question.label}</span>
          {question.description && (
            <p className="text-xs text-gray-500 mt-0.5">
              {question.description}
            </p>
          )}
        </div>
      </label>
    </div>
  );
}
