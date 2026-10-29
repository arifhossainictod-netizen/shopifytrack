import JSZip from "jszip";
import { EXTENSION_FILES, EXTENSION_VERSION } from "@/lib/extension-files";
import { db } from "@/db";
import { downloads } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const zip = new JSZip();
  const folder = zip.folder(`shopifytrack-inspector-v${EXTENSION_VERSION}`);
  const root = folder ?? zip;
  for (const f of EXTENSION_FILES) root.file(f.path, f.content);

  const buf = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  try {
    await db.insert(downloads).values({ kind: "extension", label: `v${EXTENSION_VERSION}` });
  } catch (e) {
    console.error("[extension] db write failed:", e);
  }

  return new Response(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="shopifytrack-inspector-v${EXTENSION_VERSION}.zip"`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store",
    },
  });
}
