"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlatformId, TrackMode, CmpId } from "./platforms";
import {
  defaultConfig,
  demoConfig,
  validateStep,
  type Step1,
  type Step3,
  type Step4,
  type WizardConfig,
} from "./schemas";

/* Re-export schema surface so client components can keep importing from
   "@/lib/store" without ever pulling this module into a server bundle. */
export {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  wizardSchema,
  validateStep,
  defaultConfig,
  demoConfig,
} from "./schemas";
export type { Step1, Step2, Step3, Step4, WizardConfig } from "./schemas";

interface WizardState {
  step: number;
  maxStep: number;
  config: WizardConfig;
  setStep: (n: number) => void;
  patchStep1: (p: Partial<Step1>) => void;
  setMode: (m: TrackMode) => void;
  togglePlatform: (id: PlatformId) => void;
  setCred: (platform: string, field: string, value: string) => void;
  patchStep3: (p: Partial<Step3>) => void;
  toggleEvent: (id: string) => void;
  patchStep4: (p: Partial<Step4>) => void;
  setCmp: (c: CmpId) => void;
  fillDemo: () => void;
  reset: () => void;
}

export const useWizard = create<WizardState>()(
  persist(
    (set) => ({
      step: 1,
      maxStep: 1,
      config: defaultConfig,

      setStep: (n) =>
        set((s) => ({ step: n, maxStep: Math.max(s.maxStep, n) })),

      patchStep1: (p) =>
        set((s) => ({ config: { ...s.config, step1: { ...s.config.step1, ...p } } })),

      setMode: (m) =>
        set((s) => ({ config: { ...s.config, step2: { ...s.config.step2, mode: m } } })),

      togglePlatform: (id) =>
        set((s) => {
          const has = s.config.step2.platforms.includes(id);
          const platforms = has
            ? s.config.step2.platforms.filter((p) => p !== id)
            : [...s.config.step2.platforms, id];
          return { config: { ...s.config, step2: { ...s.config.step2, platforms } } };
        }),

      setCred: (platform, field, value) =>
        set((s) => ({
          config: {
            ...s.config,
            step2: {
              ...s.config.step2,
              creds: {
                ...s.config.step2.creds,
                [platform]: { ...(s.config.step2.creds[platform] ?? {}), [field]: value },
              },
            },
          },
        })),

      patchStep3: (p) =>
        set((s) => ({ config: { ...s.config, step3: { ...s.config.step3, ...p } } })),

      toggleEvent: (id) =>
        set((s) => {
          const has = s.config.step4.events.includes(id);
          const events = has
            ? s.config.step4.events.filter((e) => e !== id)
            : [...s.config.step4.events, id];
          return { config: { ...s.config, step4: { ...s.config.step4, events } } };
        }),

      patchStep4: (p) =>
        set((s) => ({ config: { ...s.config, step4: { ...s.config.step4, ...p } } })),

      setCmp: (c) =>
        set((s) => ({ config: { ...s.config, step4: { ...s.config.step4, cmp: c } } })),

      fillDemo: () => set({ config: demoConfig, maxStep: 5 }),
      reset: () => set({ config: defaultConfig, step: 1, maxStep: 1 }),
    }),
    { name: "stp-wizard" }
  )
);
