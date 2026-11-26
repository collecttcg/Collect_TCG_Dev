// Render at 2× resolution so the PDF retains the browser's Unicode font fallback.
const pageWidth = 794;
const pageHeight = 1123;
const margin = 68;
const ink = "#20332e";
const bodyFont = "15px system-ui, sans-serif";

let pdfLibrary;

function loadPDFLibrary() {
  pdfLibrary ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jspdf@4.2.1/dist/jspdf.umd.min.js";
    script.integrity = "sha384-qovJwSBbRDPP5cEjCp8S0UP66wrvnjaa60XMOGzTNanrThcrGfXfnZkvgY8N1KT3";
    script.crossOrigin = "anonymous";
    script.onload = () => resolve(window.jspdf);
    script.onerror = () => {
      script.remove();
      pdfLibrary = undefined;
      reject(new Error("Could not load the PDF generator"));
    };
    document.head.append(script);
  });
  return pdfLibrary;
}

function wrap(context, text, width) {
  const lines = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = line ? line + " " + word : word;
      if (context.measureText(candidate).width <= width) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = "";
      for (const character of word) {
        if (line && context.measureText(line + character).width > width) {
          lines.push(line);
          line = "";
        }
        line += character;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function createInvoicePDF(invoice, number, logoUrl) {
  const logo = new Image();
  logo.src = logoUrl;
  const [{ jsPDF }] = await Promise.all([
    loadPDFLibrary(),
    logo.decode()
  ]);
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  // The archive can read these PDF fields without OCR.
  pdf.setProperties({
    title: `Invoice ${number}`,
    subject: "Collect TCG invoice v1 " + encodeURIComponent(JSON.stringify({
      date: invoice.date,
      seller: invoice.seller,
      description: invoice.description.slice(0, 120)
    }))
  });

  const canvas = document.createElement("canvas");
  canvas.width = pageWidth * 2;
  canvas.height = pageHeight * 2;
  const context = canvas.getContext("2d");
  context.scale(2, 2);
  const right = pageWidth - margin;
  let y;
  let page = 1;

  function text(value, x, baseline, font = bodyFont) {
    context.font = font;
    context.fillStyle = ink;
    context.fillText(value, x, baseline);
  }
  function rule(start, end, at, color = "#b6bcb7") {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(start, at);
    context.lineTo(end, at);
    context.stroke();
  }
  function startPage() {
    context.fillStyle = "white";
    context.fillRect(0, 0, pageWidth, pageHeight);
    context.drawImage(logo, margin, 52, 52, 52);
    text("Collect TCG", margin + 64, 76, "bold 23px Georgia, serif");
    text("Malaysia & Singapore", margin + 64, 96, "12px system-ui, sans-serif");
    rule(margin, right, 119, ink);
    text("Invoice", margin, 185, "56px Georgia, serif");
    text(`Invoice number: ${number}`, right - 210, 154);
    text(`Date: ${invoice.date}`, right - 210, 181);
    y = 220;
  }
  function finishPage() {
    rule(margin, right, pageHeight - 66);
    text("Collect TCG · Thank you for your business", margin, pageHeight - 44, "12px system-ui, sans-serif");
    text(String(page), right - 20, pageHeight - 44);
    if (page > 1) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, 210, 297);
  }
  function addPage() {
    finishPage();
    page += 1;
    startPage();
  }
  function itemHeading() {
    text("NO.", margin, y, "bold 12px system-ui, sans-serif");
    text("PRODUCT OR SERVICE DESCRIPTION", margin + 44, y, "bold 12px system-ui, sans-serif");
    rule(margin, right, y + 10);
    y += 34;
  }

  startPage();
  for (const [label, value, address, x] of [
    ["BILL TO", invoice.client, invoice.buyerAddress, margin],
    ["FROM", invoice.seller, invoice.sellerAddress, 411]
  ]) {
    rule(x, x + 315, 213);
    text(label, x, 238, "bold 12px system-ui, sans-serif");
    let baseline = 263;
    context.font = "bold 16px system-ui, sans-serif";
    for (const line of wrap(context, value, 315)) {
      text(line, x, baseline, "bold 16px system-ui, sans-serif");
      baseline += 22;
    }
    context.font = bodyFont;
    for (const line of wrap(context, address.replace(/\s+/g, " ").trim(), 315)) {
      if (!line) continue;
      text(line, x, baseline);
      baseline += 20;
    }
    y = Math.max(y, baseline + 30);
  }

  if (y > pageHeight - 185) addPage();
  itemHeading();
  const items = invoice.description.split("\n").map(line => line.trim()).filter(Boolean);
  for (const [index, item] of items.entries()) {
    context.font = bodyFont;
    const lines = wrap(context, item, right - margin - 44);
    for (const [lineIndex, line] of lines.entries()) {
      if (y > pageHeight - 105) {
        addPage();
        itemHeading();
      }
      if (!lineIndex) text(String(index + 1), margin, y);
      text(line, margin + 44, y);
      y += 21;
    }
    rule(margin, right, y - 5);
    y += 13;
  }
  if (y > pageHeight - 170) addPage();
  const amount = new Intl.NumberFormat("en", {
    style: "currency", currency: invoice.currency, currencyDisplay: "code"
  }).format(Number(invoice.amount));
  rule(right - 295, right, y + 14, "#99763c");
  context.textAlign = "right";
  text("AMOUNT PAID", right, y + 40, "bold 12px system-ui, sans-serif");
  text(amount, right, y + 74, "32px Georgia, serif");
  context.textAlign = "left";
  finishPage();
  return pdf.output("blob");
}
