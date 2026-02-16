"use client";

import { FormData, SAT_TIMELINES, WEEKLY_HOURS, RESOURCES, PLATFORM_USAGE } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface StepProps {
  data: FormData;
  onChange: (partial: Partial<FormData>) => void;
}

export function Step2({ data, onChange }: StepProps) {
  const toggleResource = (val: string) => {
    const next = data.resources.includes(val)
      ? data.resources.filter((r) => r !== val)
      : [...data.resources, val];
    onChange({ resources: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Когда планируете сдавать SAT? *</Label>
        <div className="mt-2 space-y-2">
          {SAT_TIMELINES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ satTimeline: opt.value })}
              className={`opt-btn w-full ${
                data.satTimeline === opt.value ? "opt-btn-selected" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Сдавали SAT раньше? *</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { val: true, label: "Да" },
            { val: false, label: "Нет" },
          ].map((opt) => (
            <button
              key={String(opt.val)}
              type="button"
              onClick={() =>
                onChange({
                  hasTakenSat: opt.val,
                  previousScore: opt.val ? data.previousScore : "",
                })
              }
              className={`opt-btn justify-center ${
                data.hasTakenSat === opt.val ? "opt-btn-selected" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {data.hasTakenSat === true && (
        <div>
          <Label htmlFor="score">Ваш балл (400-1600)</Label>
          <Input
            id="score"
            type="number"
            inputMode="numeric"
            min={400}
            max={1600}
            step={10}
            placeholder="1200"
            value={data.previousScore}
            onChange={(e) =>
              onChange({
                previousScore: e.target.value
                  ? parseInt(e.target.value)
                  : "",
              })
            }
            className="mt-1.5 h-11 sm:h-10"
          />
        </div>
      )}

      <div>
        <Label>Сколько часов в неделю готовитесь? *</Label>
        <div className="mt-2 space-y-2">
          {WEEKLY_HOURS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ weeklyHours: opt.value })}
              className={`opt-btn w-full ${
                data.weeklyHours === opt.value ? "opt-btn-selected" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Какие ресурсы используете для подготовки?</Label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {RESOURCES.map((opt) => (
            <label
              key={opt.value}
              className={`opt-btn gap-2.5 ${
                data.resources.includes(opt.value) ? "opt-btn-selected" : ""
              }`}
            >
              <Checkbox
                checked={data.resources.includes(opt.value)}
                onCheckedChange={() => toggleResource(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Пользуетесь нашей SAT-платформой? *</Label>
        <div className="mt-2 space-y-2">
          {PLATFORM_USAGE.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ platformUsage: opt.value })}
              className={`opt-btn w-full ${
                data.platformUsage === opt.value ? "opt-btn-selected" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
