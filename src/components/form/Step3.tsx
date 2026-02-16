"use client";

import { FormData } from "@/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StepProps {
  data: FormData;
  onChange: (partial: Partial<FormData>) => void;
}

export function Step3({ data, onChange }: StepProps) {
  return (
    <div className="space-y-6">
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
