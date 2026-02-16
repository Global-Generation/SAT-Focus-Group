"use client";

import { FormData, EDUCATION_LEVELS } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepProps {
  data: FormData;
  onChange: (partial: Partial<FormData>) => void;
}

export function Step1({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="name">Имя *</Label>
        <Input
          id="name"
          placeholder="Ваше имя"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="mt-1.5 h-11 sm:h-10"
          autoComplete="name"
        />
      </div>

      <div>
        <Label htmlFor="telegram">Telegram *</Label>
        <Input
          id="telegram"
          placeholder="@username"
          value={data.telegramUsername}
          onChange={(e) => {
            let val = e.target.value;
            if (val && !val.startsWith("@")) val = "@" + val;
            onChange({ telegramUsername: val });
          }}
          className="mt-1.5 h-11 sm:h-10"
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="age">Возраст *</Label>
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            min={14}
            max={25}
            placeholder="16"
            value={data.age}
            onChange={(e) =>
              onChange({ age: e.target.value ? parseInt(e.target.value) : "" })
            }
            className="mt-1.5 h-11 sm:h-10"
          />
        </div>
        <div>
          <Label htmlFor="city">Город *</Label>
          <Input
            id="city"
            placeholder="Москва"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="mt-1.5 h-11 sm:h-10"
            autoComplete="address-level2"
          />
        </div>
      </div>

      <div>
        <Label>Класс / курс *</Label>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {EDUCATION_LEVELS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ educationLevel: opt.value })}
              className={`opt-btn justify-center text-sm ${
                data.educationLevel === opt.value ? "opt-btn-selected" : ""
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
