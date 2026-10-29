"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, FileJson2, FileText } from "lucide-react";
import { compilePackage } from "@/lib/engine";
import { useWizard } from "@/lib/store";

const ICON = (path: string) =>
  path.endsWith(".json") ? FileJson2 : path.endsWith(".js") ? FileCode2 : FileText;

function highlight(line: string) {
  // ultra-light token hints for the preview
  if (/^\s*(\/\*|\/\/|#|\*)/.test(line)) return "text-faint italic";
  if (/^\s*"/.test(line) && /":/.test(line)) return "text-mint/90";
  if (/(function|const|var|return|import|export)/.test(line)) return "text-acid/80";
  return "text-bone/75";
}

export default function PreviewPanel() {
  const config = useWizard((s) => s.config);
  const files = useMemo(() => compilePackage(config, { preview: true }), [config]);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const file = files[Math.min(active, files.length - 1)];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-[#070a07]">
      <div className="flex items-center gap-1.5 border-b border-line bg-panel px-3 py-2.5">
        <span className="mr-1 inline-flex items-center gap-1.5 px-1 font-mono2 text-[9px] uppercase tracking-[0.2em] text-faint">
          <span className="size-1.5 rounded-full bg-acid animate-pulse-dot" />
          live compile
        </span>
        {files.map((f, i) => {
          const Icon = ICON(f.path);
          const on = i === active;
          return (
            <button
              key={f.path}
              type="button"
              onClick={() => setActive(i)}
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono2 text-[9.5px] transition-colors ${
                on
                  ? "border-acid/50 bg-acid/10 text-acid"
                  : "border-transparent text-faint hover:text-moss"
              }`}
            >
              <Icon className="size-3" />
              {f.path}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(file.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="ml-auto rounded-md border border-line p-1.5 text-moss transition-colors hover:border-acid/40 hover:text-acid"
          title="Copy file"
        >
          {copied ? <Check className="size-3 text-acid" /> : <Copy className="size-3" />}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        <pre className="font-mono2 text-[10px] leading-[1.7]">
          {file.content.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 shrink-0 select-none text-right text-faint/50">{i + 1}</span>
              <span className={`pl-3 whitespace-pre-wrap break-all ${highlight(line)}`}>
                {line || " "}
              </span>
            </div>
          ))}
        </pre>
      </div>

      <div className="border-t border-line px-3 py-2 font-mono2 text-[9px] text-faint">
        {"{{TOKEN}}"} values resolve as you type · final export substitutes all tokens
      </div>
    </div>
  );
}
