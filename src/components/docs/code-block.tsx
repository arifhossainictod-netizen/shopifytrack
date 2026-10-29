"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="code-block my-5">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-faint">
          {title ?? "code"}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1.5 font-mono2 text-[10px] text-moss transition-colors hover:text-acid"
        >
          {copied ? <Check className="size-3 text-acid" /> : <Copy className="size-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre>{code}</pre>
    </div>
  );
}
