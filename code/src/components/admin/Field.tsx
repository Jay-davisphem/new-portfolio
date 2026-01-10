"use client";

import type { ReactNode } from "react";

export function Field(props: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold">{props.label}</div>
      {props.hint ? <div className="mt-1 text-xs text-(--muted)">{props.hint}</div> : null}
      <div className="mt-2">{props.children}</div>
    </label>
  );
}

export function TextInput(props: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url";
}) {
  return (
    <input
      type={props.type ?? "text"}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      className="h-11 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 text-sm outline-none focus:ring-2 focus:ring-(--accent)/30"
    />
  );
}

export function TextArea(props: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      className="min-h-24 w-full resize-y rounded-2xl border border-(--border) bg-(--surface) p-4 text-sm outline-none focus:ring-2 focus:ring-(--accent)/30"
    />
  );
}

export function Toggle(props: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={() => props.onChange(!props.checked)}
      aria-pressed={props.checked}
    >
      {props.label}: {props.checked ? "On" : "Off"}
    </button>
  );
}
