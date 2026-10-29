"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function Field({
  label,
  hint,
  error,
  valid,
  mono = true,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  valid?: boolean;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-moss">
          {label}
        </label>
        {valid && !error && <CheckCircle2 className="size-3.5 text-mint" />}
      </div>
      <div className={mono ? "[&_input]:font-mono2" : ""}>{children}</div>
      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 flex items-center gap-1.5 text-[11px] text-rose"
        >
          <AlertCircle className="size-3" /> {error}
        </motion.p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-white/[0.02] px-4 py-3.5 text-left transition-colors hover:border-line-strong"
    >
      <span>
        <span className="block text-[13.5px] font-medium text-bone">{label}</span>
        {desc && <span className="mt-0.5 block text-[11.5px] leading-relaxed text-faint">{desc}</span>}
      </span>
      <span
        className={`relative h-5.5 w-10 shrink-0 rounded-full border transition-colors duration-300 ${
          checked ? "border-acid/60 bg-acid/25" : "border-line bg-white/5"
        }`}
      >
        <span
          className={`absolute top-1/2 size-4 -translate-y-1/2 rounded-full transition-all duration-300 ${
            checked ? "left-[calc(100%-1.15rem)] bg-acid" : "left-1 bg-faint"
          }`}
        />
      </span>
    </button>
  );
}

export function StepCard({
  title,
  desc,
  children,
  aside,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[15px] font-semibold tracking-tight text-bone">{title}</h3>
          {desc && <p className="mt-1 text-[12px] leading-relaxed text-faint">{desc}</p>}
        </div>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
