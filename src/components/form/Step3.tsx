"use client";

import { FormData, FEATURES } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface StepProps {
  data: FormData;
  onChange: (partial: Partial<FormData>) => void;
}

export function Step3({ data, onChange }: StepProps) {
  const toggleFeature = (val: string) => {
    if (val === "none") {
      onChange({ featuresUsed: data.featuresUsed.includes("none") ? [] : ["none"] });
      return;
    }
    const without = data.featuresUsed.filter((f) => f !== "none");
    const next = without.includes(val)
      ? without.filter((f) => f !== val)
      : [...without, val];
    onChange({ featuresUsed: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Какие функции вы использовали?</Label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FEATURES.map((opt) => (
            <label
              key={opt.value}
              className={`opt-btn gap-2.5 ${
                data.featuresUsed.includes(opt.value) ? "opt-btn-selected" : ""
              }`}
            >
              <Checkbox
                checked={data.featuresUsed.includes(opt.value)}
                onCheckedChange={() => toggleFeature(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="like">
          Что вам нравится в онлайн-подготовке к SAT? *
        </Label>
        <Textarea
          id="like"
          placeholder="Расскажите, что вам нравится..."
          value={data.whatYouLike}
          onChange={(e) => onChange({ whatYouLike: e.target.value })}
          className="mt-1.5 min-h-[110px]"
        />
        <p className="mt-1.5 text-xs text-gray-400">
          {data.whatYouLike.length} / 200+ символов для макс. баллов
        </p>
      </div>

      <div>
        <Label htmlFor="frustrate">
          Что расстраивает или чего не хватает? *
        </Label>
        <Textarea
          id="frustrate"
          placeholder="Расскажите, что можно улучшить..."
          value={data.whatFrustrates}
          onChange={(e) => onChange({ whatFrustrates: e.target.value })}
          className="mt-1.5 min-h-[110px]"
        />
        <p className="mt-1.5 text-xs text-gray-400">
          {data.whatFrustrates.length} / 200+ символов для макс. баллов
        </p>
      </div>
    </div>
  );
}
