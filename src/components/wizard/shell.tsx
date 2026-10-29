"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/logo";
import { STEPS } from "@/lib/platforms";
import { useWizard, validateStep } from "@/lib/store";
import StepBasics from "./step-basics";
import StepDestinations from "./step-destinations";
import StepContainers from "./step-containers";
import StepEvents from "./step-events";
import StepReview from "./step-review";
import PreviewPanel from "./preview";
import { EASE } from "@/components/reveal";

export default function WizardShell() {
  const { step, maxStep, config, setStep, fillDemo, reset } = useWizard();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink">
        <div className="flex items-center gap-3 font-mono2 text-[12px] text-moss">
          <span className="size-2 rounded-full bg-acid animate-pulse-dot" />
          booting compiler…
        </div>
      </div>
    );
  }

  function next() {
    const errs = validateStep(step, config);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(Math.min(5, step + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function go(n: number) {
    if (n <= maxStep) {
      setErrors({});
      setStep(n);
    }
  }

  const stepMeta = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-ink">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
          <Logo />
          <span className="hidden rounded-full border border-line px-2.5 py-1 font-mono2 text-[10px] uppercase tracking-[0.18em] text-faint sm:block">
            setup wizard
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={fillDemo}
              className="hidden items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[12px] text-moss transition-colors hover:border-acid/40 hover:text-acid sm:inline-flex"
            >
              <Sparkles className="size-3.5" /> Demo data
            </button>
            <button
              type="button"
              onClick={reset}
              className="grid size-8 place-items-center rounded-full border border-line text-moss transition-colors hover:border-rose/50 hover:text-rose"
              title="Reset wizard"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <a
              href="/api/extension/download"
              className="hidden items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[12px] text-bone transition-colors hover:border-acid/40 hover:text-acid md:inline-flex"
              title="Download ShopifyTrack Inspector"
            >
              <Download className="size-3.5 text-acid" /> Extension
            </a>
            <Link href="/docs" className="hidden text-[12px] text-moss hover:text-bone md:block">
              Docs
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)_minmax(380px,460px)]">
        {/* steps rail */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            {STEPS.map((s) => {
              const done = s.id < step;
              const current = s.id === step;
              const reachable = s.id <= maxStep;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(s.id)}
                  disabled={!reachable}
                  className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                    current
                      ? "border-acid/50 bg-acid/[0.07]"
                      : reachable
                        ? "border-transparent hover:bg-white/[0.03]"
                        : "cursor-not-allowed opacity-40"
                  }`}
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full border font-mono2 text-[10px] transition-all ${
                      done
                        ? "border-acid bg-acid text-ink"
                        : current
                          ? "border-acid/60 text-acid"
                          : "border-line-strong text-faint"
                    }`}
                  >
                    {done ? <Check className="size-3" strokeWidth={3} /> : `0${s.id}`}
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate text-[13px] font-medium ${current ? "text-bone" : "text-moss"}`}>
                      {s.name}
                    </span>
                    <span className="block truncate text-[10.5px] text-faint">{s.desc}</span>
                  </span>
                </button>
              );
            })}

            <div className="mt-6 rounded-xl border border-line bg-panel p-4">
              <div className="mb-2 flex justify-between font-mono2 text-[9px] uppercase tracking-[0.2em] text-faint">
                <span>progress</span>
                <span className="text-acid">{Math.round(((step - 1) / 4) * 100)}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full bg-acid"
                  animate={{ width: `${((step - 1) / 4) * 100}%` }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </div>
            </div>
          </nav>
        </aside>

        {/* form column */}
        <main className="min-w-0">
          {/* mobile progress */}
          <div className="mb-6 lg:hidden">
            <div className="flex items-center justify-between font-mono2 text-[10px] uppercase tracking-[0.2em] text-faint">
              <span>
                step {step}/5 — {stepMeta.name}
              </span>
              <span className="text-acid">{Math.round(((step - 1) / 4) * 100)}%</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full bg-acid"
                animate={{ width: `${((step - 1) / 4) * 100}%` }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="font-mono2 text-[10px] uppercase tracking-[0.3em] text-acid">
              {"// step 0" + step}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
              {stepMeta.name}
            </h1>
            <p className="mt-1 text-[13px] text-faint">{stepMeta.desc}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {step === 1 && <StepBasics errors={errors} />}
              {step === 2 && <StepDestinations errors={errors} />}
              {step === 3 && <StepContainers errors={errors} />}
              {step === 4 && <StepEvents errors={errors} />}
              {step === 5 && <StepReview />}
            </motion.div>
          </AnimatePresence>

          {step < 5 && (
            <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
              <button
                type="button"
                onClick={() => go(step - 1)}
                disabled={step === 1}
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[13px] text-moss transition-colors enabled:hover:border-line-strong enabled:hover:text-bone disabled:opacity-30"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
              <button
                type="button"
                onClick={next}
                className="group inline-flex items-center gap-2 rounded-full bg-acid px-6 py-2.5 text-[13px] font-semibold text-ink transition-all hover:glow-acid"
              >
                {step === 4 ? "Review package" : "Continue"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="mt-8 border-t border-line pt-6">
              <button
                type="button"
                onClick={() => go(4)}
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[13px] text-moss transition-colors hover:border-line-strong hover:text-bone"
              >
                <ArrowLeft className="size-4" /> Back to events
              </button>
            </div>
          )}
        </main>

        {/* live preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 h-[calc(100vh-8.5rem)]">
            <PreviewPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}
