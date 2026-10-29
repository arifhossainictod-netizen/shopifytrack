import { NextResponse } from "next/server";
import JSZip from "jszip";
import { wizardSchema } from "@/lib/schemas";
import { compilePackage, packageFileName } from "@/lib/engine";
import { db } from "@/db";
import { configurations, downloads } from "@/db/schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = wizardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid configuration", issues: parsed.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const cfg = parsed.data;
  const files = compilePackage(cfg);

  const zip = new JSZip();
  for (const f of files) zip.file(f.path, f.content);
  const buf = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const name = packageFileName(cfg);

  // Persist the generated configuration + download event (best effort).
  try {
    await db.insert(configurations).values({
      storeName: cfg.step1.storeName,
      shopDomain: cfg.step1.shopDomain,
      mode: cfg.step2.mode,
      platforms: cfg.step2.platforms,
      payload: cfg,
    });
    await db.insert(downloads).values({ kind: "package", label: cfg.step1.shopDomain });
  } catch (e) {
    console.error("[package] db write failed:", e);
  }

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store",
    },
  });
}
