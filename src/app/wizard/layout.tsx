import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Setup Wizard — compile GTM + CAPI in 3 minutes",
  description:
    "Five steps to error-free Shopify tracking: web & server GTM containers, Conversions API templates and a Customer Events pixel — compiled and zipped automatically.",
};

export default function WizardLayout({ children }: { children: ReactNode }) {
  return children;
}
