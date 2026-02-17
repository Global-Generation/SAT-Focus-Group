import TextQuestion from "./TextQuestion";
import TextareaQuestion from "./TextareaQuestion";
import NumberQuestion from "./NumberQuestion";
import RadioQuestion from "./RadioQuestion";
import CheckboxQuestion from "./CheckboxQuestion";
import BooleanQuestion from "./BooleanQuestion";
import ChipSelectQuestion from "./ChipSelectQuestion";
import ConsentQuestion from "./ConsentQuestion";

export interface QuestionData {
  id: string;
  fieldKey: string;
  label: string;
  description?: string | null;
  type: string;
  required: boolean;
  config?: Record<string, unknown> | null;
  showIf?: { fieldKey: string; value: unknown } | null;
  options: { id: string; value: string; label: string }[];
}

interface Props {
  question: QuestionData;
  value: unknown;
  onChange: (fieldKey: string, value: unknown) => void;
  allValues: Record<string, unknown>;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  allValues,
}: Props) {
  // Check showIf condition
  if (question.showIf) {
    const condVal = allValues[question.showIf.fieldKey];
    if (condVal !== question.showIf.value) {
      return null;
    }
  }

  const handleChange = (val: unknown) => {
    onChange(question.fieldKey, val);
  };

  switch (question.type) {
    case "TEXT":
      return (
        <TextQuestion
          question={question}
          value={(value as string) || ""}
          onChange={handleChange}
        />
      );
    case "TEXTAREA":
      return (
        <TextareaQuestion
          question={question}
          value={(value as string) || ""}
          onChange={handleChange}
        />
      );
    case "NUMBER":
      return (
        <NumberQuestion
          question={question}
          value={(value as number | string) ?? ""}
          onChange={handleChange}
        />
      );
    case "RADIO":
      return (
        <RadioQuestion
          question={question}
          value={(value as string) || ""}
          onChange={handleChange}
        />
      );
    case "CHECKBOX":
      return (
        <CheckboxQuestion
          question={question}
          value={(value as string[]) || []}
          onChange={handleChange}
        />
      );
    case "BOOLEAN":
      return (
        <BooleanQuestion
          question={question}
          value={value as boolean | null}
          onChange={handleChange}
        />
      );
    case "CHIP_SELECT":
      return (
        <ChipSelectQuestion
          question={question}
          value={(value as string[]) || []}
          onChange={handleChange}
        />
      );
    case "CONSENT":
      return (
        <ConsentQuestion
          question={question}
          value={(value as boolean) || false}
          onChange={handleChange}
        />
      );
    default:
      return (
        <div className="text-sm text-red-500">
          Unknown question type: {question.type}
        </div>
      );
  }
}
