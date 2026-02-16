"use client";

import { FormData, SESSION_READINESS, DAYS, TIMES } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface StepProps {
  data: FormData;
  onChange: (partial: Partial<FormData>) => void;
}

export function Step4({ data, onChange }: StepProps) {
  const toggleDay = (val: string) => {
    const next = data.availableDays.includes(val)
      ? data.availableDays.filter((d) => d !== val)
      : [...data.availableDays, val];
    onChange({ availableDays: next });
  };

  const toggleTime = (val: string) => {
    const next = data.availableTimes.includes(val)
      ? data.availableTimes.filter((t) => t !== val)
      : [...data.availableTimes, val];
    onChange({ availableTimes: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="motivation">
          Почему хотите участвовать в фокус-группе? *
        </Label>
        <Textarea
          id="motivation"
          placeholder="Расскажите о вашей мотивации..."
          value={data.motivation}
          onChange={(e) => onChange({ motivation: e.target.value })}
          className="mt-1 min-h-[120px]"
        />
        <p className="mt-1 text-xs text-gray-400">
          {data.motivation.length} / 200+ символов для макс. баллов
        </p>
      </div>

      <div>
        <Label>Готовы уделить 45-60 минут на сессию? *</Label>
        <div className="mt-2 space-y-2">
          {SESSION_READINESS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ sessionReadiness: opt.value })}
              className={`block w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                data.sessionReadiness === opt.value
                  ? "border-primary bg-blue-50 text-primary font-medium"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Удобные дни *</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                data.availableDays.includes(opt.value)
                  ? "border-primary bg-blue-50 font-medium text-primary"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Checkbox
                checked={data.availableDays.includes(opt.value)}
                onCheckedChange={() => toggleDay(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Удобное время *</Label>
        <div className="mt-2 space-y-2">
          {TIMES.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors ${
                data.availableTimes.includes(opt.value)
                  ? "border-primary bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Checkbox
                checked={data.availableTimes.includes(opt.value)}
                onCheckedChange={() => toggleTime(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
