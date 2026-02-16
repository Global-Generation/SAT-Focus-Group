"use client";

import { FormData, REFERRAL_SOURCES } from "@/types";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface StepProps {
  data: FormData;
  onChange: (partial: Partial<FormData>) => void;
}

export function Step5({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-50 p-4">
        <h3 className="font-medium text-blue-900">Перед отправкой</h3>
        <p className="mt-1 text-sm leading-relaxed text-blue-700">
          Пожалуйста, подтвердите согласие на участие. Это необходимо для
          обработки вашей заявки.
        </p>
      </div>

      <div className="space-y-3">
        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
            data.consentData
              ? "border-primary bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Checkbox
            checked={data.consentData}
            onCheckedChange={(checked) =>
              onChange({ consentData: checked === true })
            }
            className="mt-0.5 shrink-0"
          />
          <div>
            <p className="text-sm font-medium leading-snug">
              Согласие на обработку данных *
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Я даю согласие на обработку моих персональных данных для целей
              отбора участников фокус-группы.
            </p>
          </div>
        </label>

        <label
          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
            data.consentRecording
              ? "border-primary bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <Checkbox
            checked={data.consentRecording}
            onCheckedChange={(checked) =>
              onChange({ consentRecording: checked === true })
            }
            className="mt-0.5 shrink-0"
          />
          <div>
            <p className="text-sm font-medium leading-snug">
              Согласие на запись сессии *
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Я согласен(а) на аудио/видео запись фокус-группы. Записи
              используются только для внутреннего анализа.
            </p>
          </div>
        </label>
      </div>

      <div>
        <Label>Как вы узнали о фокус-группе?</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {REFERRAL_SOURCES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ referralSource: opt.value })}
              className={`opt-btn justify-center text-sm ${
                data.referralSource === opt.value ? "opt-btn-selected" : ""
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
