const pdfjsBase = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/legacy/build";
let pdfjs;

function normalizeDate(value) {
  if (!value) return "";
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value ? value : "";
}

export function extractInvoiceDetails(items, sellers = []) {
  const text = items.filter(item => item.str?.trim()).map(item => item.str.trim()).join("\n");
  const date = normalizeDate(text.match(/(?:^|\n)(?:invoice |transaction )?date\s*:?\s*(\d{4}-\d{2}-\d{2})(?=\s|$)/i)?.[1]);
  const seller = text.match(/(?:^|\n)from\s*:?[^\S\n]*\n([^\n]+)/i)?.[1]
    ?? text.split(/\ninvoice\b/i)[0].split("\n").find(line => sellers.includes(line))
    ?? "";
  const itemText = text.match(/(?:^|\n)product or service description\s*\n([\s\S]*?)(?=\namount paid\b|$)/i)?.[1] ?? "";
  const description = itemText.split("\n").filter(line => !/^\d+$/.test(line)).join(" ");
  return {
    date,
    seller: seller.slice(0, 120),
    description: description.length > 120 ? description.slice(0, 117).trimEnd() + "…" : description
  };
}

export async function readInvoiceDetails(blob, sellers) {
  pdfjs ??= import(pdfjsBase + "/pdf.min.mjs");
  const runtime = await pdfjs;
  runtime.GlobalWorkerOptions.workerSrc = pdfjsBase + "/pdf.worker.min.mjs";
  const task = runtime.getDocument({
    data: new Uint8Array(await blob.arrayBuffer()),
    isEvalSupported: false,
    useWasm: false
  });
  try {
    const document = await task.promise;
    const { info } = await document.getMetadata();
    const prefix = "Collect TCG invoice v1 ";
    if (typeof info.Subject === "string" && info.Subject.startsWith(prefix)) {
      const fields = JSON.parse(decodeURIComponent(info.Subject.slice(prefix.length)));
      return {
        date: normalizeDate(String(fields.date ?? "")),
        seller: String(fields.seller ?? "").slice(0, 120),
        description: String(fields.description ?? "").slice(0, 120)
      };
    }
    const page = await document.getPage(1);
    return extractInvoiceDetails((await page.getTextContent()).items, sellers);
  } finally {
    await task.destroy();
  }
}
