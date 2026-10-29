"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  FileJson2,
  FileText,
  Loader2,
  PackageCheck,
  ShieldAlert,
} from "lucide-react";
import { compilePackage, packageFileName, preflightChecks } from "@/lib/engine";
import { platformById } from "@/lib/platforms";
import { useWizard } from "@/lib/store";
import { StepCard } from "./fields";

type Phase = "idle" | "compiling" | "done";

const FILE_ICON = (path: string) =>
  path.endsWith(".json") ? FileJson2 : path.endsWith(".js") ? FileCode2 : FileText;

export default function StepReview() {
  const { config, setStep } = useWizard();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const checks = useMemo(() => preflightChecks(config), [config]);
  const files = useMemo(() => compilePackage(config), [config]);
  const fails = checks.filter((c) => c.level === "fail").length;
  const warns = checks.filter((c) => c.level === "warn").length;

  const { step1: s1, step2: s2, step4: s4 } = config;

  async function downloadZip() {
    setPhase("compiling");
    setError(null);
    try {
      const res = await fetch("/api/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Compile failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = packageFileName(config);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPhase("done");
      setTimeout(() => setPhase("idle"), 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compile failed");
      setPhase("idle");
    }
  }

  function downloadFile(path: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = path;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyFile(path: string, content: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(path);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  return (
    <div className="space-y-4">
      <StepCard
        title="Pre-flight checks"
        desc="Automated validation across domains, credentials, events and privacy before anything is packaged."
        aside={
          <div className="flex items-center gap-2">
            {fails > 0 && (
              <span className="rounded-full border border-rose/40 bg-rose/10 px-2.5 py-1 font-mono2 text-[10px] text-rose">
                {fails} fail
              </span>
            )}
            {warns > 0 && (
              <span className="rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono2 text-[10px] text-amber">
                {warns} warn
              </span>
            )}
            {fails === 0 && (
              <span className="rounded-full border border-acid/50 bg-acid/10 px-2.5 py-1 font-mono2 text-[10px] text-acid">
                shippable
              </span>
            )}
          </div>
        }
      >
        <div className="space-y-1.5">
          {checks.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px]"
            >
              {c.level === "pass" ? (
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-mint" />
              ) : c.level === "warn" ? (
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber" />
              ) : (
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-rose" />
              )}
              <span className={c.level === "pass" ? "text-moss" : c.level === "warn" ? "text-bone/90" : "text-rose"}>
                {c.text}
              </span>
            </motion.div>
          ))}
        </div>
      </StepCard>

      <StepCard title="Manifest" desc="Everything the compiler will emit into your zip.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-white/[0.02] p-4">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-faint">Store</div>
            <div className="mt-1.5 text-[13.5px] font-medium text-bone">{s1.storeName || "—"}</div>
            <div className="font-mono2 text-[11px] text-faint">{s1.shopDomain || "—"}</div>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.02] p-4">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-faint">Mode</div>
            <div className="mt-1.5 text-[13.5px] font-medium capitalize text-bone">{s2.mode}</div>
            <div className="font-mono2 text-[11px] text-faint">{s4.events.length} events · CMP {s4.cmp}</div>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.02] p-4 sm:col-span-2">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-faint">Platforms</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {s2.platforms.map((pid) => (
                <span
                  key={pid}
                  className="rounded-full border border-line px-2.5 py-1 font-mono2 text-[10px]"
                  style={{ color: platformById(pid as never).color }}
                >
                  {platformById(pid as never).short}
                </span>
              ))}
              {s2.platforms.length === 0 && <span className="text-[12px] text-faint">none selected</span>}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {files.map((f) => {
            const Icon = FILE_ICON(f.path);
            const kb = (new Blob([f.content]).size / 1024).toFixed(1);
            return (
              <div
                key={f.path}
                className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-2.5"
              >
                <Icon className="size-4 shrink-0 text-mint" />
                <span className="min-w-0 flex-1 truncate font-mono2 text-[12px] text-bone">{f.path}</span>
                <span className="font-mono2 text-[10px] text-faint">{kb} KB</span>
                <button
                  type="button"
                  onClick={() => copyFile(f.path, f.content)}
                  className="rounded-md border border-line p-1.5 text-moss transition-colors hover:border-acid/40 hover:text-acid"
                  title="Copy file contents"
                >
                  {copied === f.path ? <CheckCircle2 className="size-3.5 text-acid" /> : <Copy className="size-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => downloadFile(f.path, f.content, f.mime)}
                  className="rounded-md border border-line p-1.5 text-moss transition-colors hover:border-acid/40 hover:text-acid"
                  title="Download this file"
                >
                  <Download className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </StepCard>

      {/* generate */}
      <div className="overflow-hidden rounded-2xl border border-acid/30 bg-gradient-to-br from-acid/[0.08] to-transparent p-5 sm:p-7">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-bone">Compile & download package</h3>
            <p className="mt-1 text-[12.5px] text-moss">
              {packageFileName(config)} · {files.length} files · generated server-side, logged to your build history.
            </p>
            {error && (
              <p className="mt-2 text-[12px] text-rose">
                {error} — fix the failing checks above and retry.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={downloadZip}
            disabled={phase === "compiling" || fails > 0}
            className={`group inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-semibold transition-all ${
              fails > 0
                ? "cursor-not-allowed border border-line bg-white/5 text-faint"
                : "bg-acid text-ink hover:glow-acid"
            }`}
          >
            {phase === "compiling" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Compiling…
              </>
            ) : phase === "done" ? (
              <>
                <PackageCheck className="size-4" /> Downloaded — check your files
              </>
            ) : (
              <>
                <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
                Generate & download .zip
              </>
            )}
          </button>
        </div>
        {fails > 0 && (
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-3 text-[11.5px] text-mint underline-offset-2 hover:underline"
          >
            ← jump back to Destinations to resolve failing checks
          </button>
        )}
      </div>
    </div>
  );
}
