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
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="font-medium text-blue-900">Перед отправкой</h3>
        <p className="mt-1 text-sm text-blue-700">
          Пожалуйста, подтвердите согласие на участие. Это необходимо для
          обработки вашей заявки.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
          <Checkbox
            checked={data.consentData}
            onCheckedChange={(checked) =>
              onChange({ consentData: checked === true })
            }
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium">
              Согласие на обработку данных *
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Я даю согласие на обработку моих персональных данных для целей
              отбора участников фокус-группы. Данные будут использованы
              исключительно в рамках исследования.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300">
          <Checkbox
            checked={data.consentRecording}
            onCheckedChange={(checked) =>
              onChange({ consentRecording: checked === true })
            }
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium">Согласие на запись сессии *</p>
            <p className="mt-1 text-xs text-gray-500">
              Я согласен(а) на аудио/видео запись фокус-группы. Записи будут
              использованы только для внутреннего анализа и не будут переданы
              третьим лицам.
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
              className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                data.referralSource === opt.value
                  ? "border-primary bg-blue-50 text-primary font-medium"
                  : "border-gray-200 hover:border-gray-300"
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
