"use client";

import Image from "next/image";

import { Field, TextInput } from "@/components/admin/Field";
import { isValidHttpsUrl } from "@/lib/validation/sanitize";

export function ImageUrlField(props: {
  label: string;
  src: string;
  alt: string;
  onChange: (next: { src: string; alt: string }) => void;
}) {
  const isValid = isValidHttpsUrl(props.src);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_180px] md:items-start">
      <div className="grid gap-4">
        <Field label={props.label + " URL"} hint="Must be an https:// URL">
          <TextInput
            type="url"
            value={props.src}
            onChange={(src) => props.onChange({ src, alt: props.alt })}
            placeholder="https://…"
          />
          {!isValid && props.src ? (
            <div className="mt-2 text-xs font-semibold text-red-600">Invalid https URL</div>
          ) : null}
        </Field>

        <Field label={props.label + " alt text"} hint="Used for accessibility">
          <TextInput
            value={props.alt}
            onChange={(alt) => props.onChange({ src: props.src, alt })}
            placeholder="Describe the image"
          />
        </Field>
      </div>

      <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--surface)">
        <div className="relative aspect-square w-full">
          {isValid ? (
            <Image src={props.src} alt={props.alt || "Preview"} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-(--muted)">No preview</div>
          )}
        </div>
      </div>
    </div>
  );
}
