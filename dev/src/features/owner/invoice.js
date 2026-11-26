import { readInvoiceDetails } from "./invoice-pdf.js?v=2026-11-26-v11";

const currencies = ["USD", "MYR", "SGD", "JPY"];

const sellers = ["Zakwan Zahid", "Lim Poh Yeap", "Jack Wong Tiong Kiat", "Foo Xiang Yen", "Shue"];
const invoiceFields = ["seller", "client", "date", "currency", "amount", "sellerAddress", "buyerAddress", "description"];
const invoiceBucket = "owner-invoices-dev";
const maxPDFBytes = 20 * 1024 * 1024;
const lastIssuedNumber = 1; // The supplied invoice, 0000000001, was issued before local history existed.

function openHistory() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("collect-tcg-invoices", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("invoices", { keyPath: "sequence" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function invoiceNumber(sequence) {
  return String(sequence).padStart(10, "0");
}

function nextSequence(records) {
  return records.reduce((last, invoice) => Math.max(last, invoice.sequence), lastIssuedNumber) + 1;
}

function readHistory(db) {
  return new Promise((resolve, reject) => {
    const request = db.transaction("invoices").objectStore("invoices").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function changeHistory(db, write) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("invoices", "readwrite");
    const request = write(transaction.objectStore("invoices"));
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(request.error ?? transaction.error);
  });
}

async function listCloudInvoices(bucket) {
  const records = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const { data, error } = await bucket.list("", { limit, offset, sortBy: { column: "name", order: "desc" } });
    if (error) throw error;
    for (const file of data) {
      if (/^[0-9]{10}\.pdf$/.test(file.name)) {
        records.push({ sequence: Number(file.name.slice(0, 10)), path: file.name, revision: file.id || file.created_at });
      }
    }
    if (data.length < limit) return records;
  }
}

function actionButton(label, action) {
  const button = document.createElement("button");
  button.className = "btn-ghost";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

export function renderInvoiceGenerator(appContext) {
  if (!appContext.requireOwner("open the invoice generator")) return;

  appContext.view.innerHTML = `
    <div class="inventory-tools-page">
      <div class="eyebrow">Owner Tools</div>
      <h2>Invoice Generator</h2>
      ${appContext.inventoryToolsSwitcher("invoices", "invoice")}
      <form class="panel" id="ownerInvoiceForm" autocomplete="off" style="max-width:780px;margin-top:20px;padding:20px">
        <style>
          :is(#ownerInvoiceForm,#ownerInvoiceUpload) .invoice-fields, #ownerInvoiceUpload{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:16px}
          :is(#ownerInvoiceForm,#ownerInvoiceUpload) label{display:grid;gap:6px}
          :is(#ownerInvoiceForm,#ownerInvoiceUpload) :is(input,select,textarea){box-sizing:border-box;width:100%;min-height:44px;padding:10px;border:1px solid #777f8c;border-radius:8px;background:var(--surface-2);color:var(--text);font:inherit}
          #ownerInvoiceForm :is(input,select,textarea):focus{outline:2px solid var(--invoice-focus);outline-offset:2px}
          #ownerInvoiceForm ::placeholder{color:var(--text-muted);opacity:1}
          #ownerInvoiceForm{--invoice-focus:var(--accent-teal);color-scheme:dark}
          .light-mode #ownerInvoiceForm{--invoice-focus:#14675e;color-scheme:light}
          #ownerInvoiceHistory label{display:grid;gap:6px;margin:12px 0}
          #ownerInvoiceHistory input{max-width:100%}
          #ownerInvoiceRows{list-style:none;padding:0;margin:0}
          #ownerInvoiceRows li[hidden]{display:none}
          #ownerInvoiceRows li{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)}
          #ownerInvoiceRows .invoice-summary{flex:1 1 250px;display:grid;gap:3px;overflow-wrap:anywhere}
          #ownerInvoiceRows .invoice-summary small{color:var(--text-muted)}
          #ownerInvoiceRows li div{display:flex;flex-wrap:wrap;gap:6px}
          #ownerInvoiceForm textarea{resize:vertical}
          #ownerInvoiceForm .invoice-wide{grid-column:1/-1}
        </style>
        <div class="invoice-fields">
          <label>Seller name <select name="seller" required>
            <option value="">Select a seller</option>
            ${sellers.map(seller => `<option>${seller}</option>`).join("")}
          </select></label>
          <label>Client name <input name="client" required maxlength="120"></label>
          <div><label>Invoice number <input name="number" inputmode="numeric" pattern="[0-9]{1,10}" maxlength="10" required aria-describedby="ownerInvoiceNumberHint"></label>
            <small id="ownerInvoiceNumberHint">Use the suggested number or enter up to 10 digits.</small>
          </div>
          <label>Date <input name="date" type="date" required></label>
          <label>Currency <select name="currency">${currencies.map(code => `<option>${code}</option>`).join("")}</select></label>
          <label>Amount paid <input name="amount" type="number" inputmode="decimal" min="0.01" max="999999999.99" step="0.01" required></label>
          <div class="invoice-fields invoice-wide">
            <label>Seller address (optional) <textarea name="sellerAddress" rows="3" maxlength="400"></textarea></label>
            <label>Buyer address (optional) <textarea name="buyerAddress" rows="3" maxlength="400"></textarea></label>
          </div>
          <label class="invoice-wide">Product or service description
            <textarea name="description" rows="5" required maxlength="2400" placeholder="Enter one product or service per line"></textarea>
          </label>
        </div>
        <p role="status" data-invoice-status></p>
        <button class="btn-primary" type="submit" disabled>Create and Save PDF</button>
        <button class="btn-ghost" id="ownerInvoicePreview" type="submit" value="preview" disabled>Preview Invoice</button>
      </form>
      <section class="panel" id="ownerInvoiceHistory" aria-label="Saved invoices" style="max-width:780px;margin-top:20px;padding:20px">
        <h3>Saved invoices</h3>
        <p class="muted">Created invoices are saved here automatically. You can also upload an existing PDF.</p>
        <form id="ownerInvoiceUpload" class="invoice-fields">
          <label>Invoice PDF <input name="pdf" type="file" accept=".pdf,application/pdf" required></label>
          <label>Invoice number on PDF <input name="sequence" inputmode="numeric" pattern="[0-9]{1,10}" maxlength="10" required></label>
          <button class="btn-primary" type="submit" disabled>Upload Invoice</button>
        </form>
        <p role="status" id="ownerInvoiceHistoryStatus"></p>
        <label>Search invoices <input id="ownerInvoiceSearch" type="search" placeholder="Seller, description, number or date"></label>
        <ul id="ownerInvoiceRows"><li>Loading invoices…</li></ul>
      </section>
    </div>`;

  const form = appContext.$("ownerInvoiceForm");
  const status = form.querySelector("[data-invoice-status]");
  const fields = form.elements;
  const numberField = fields.namedItem("number");
  let numberEdited = false;
  let suggestedNumber = "";
  numberField.addEventListener("input", () => {
    numberEdited = true;
  });
  const date = new Date();
  fields.date.value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  fields.currency.addEventListener("change", () => {
    const increment = fields.currency.value === "JPY" ? "1" : "0.01";
    fields.amount.min = increment;
    fields.amount.step = increment;
    fields.amount.max = increment === "1" ? "999999999" : "999999999.99";
  });

  const submit = form.querySelector("button[type=submit]");
  const previewButton = appContext.$("ownerInvoicePreview");
  const archive = appContext.$("ownerInvoiceUpload");
  const upload = archive.querySelector("button[type=submit]");
  const historyStatus = appContext.$("ownerInvoiceHistoryStatus");
  const rows = appContext.$("ownerInvoiceRows");
  const search = appContext.$("ownerInvoiceSearch");
  const fileInput = archive.elements.pdf;
  const sequenceInput = archive.elements.sequence;
  const bucket = appContext.supabaseClient.storage.from(invoiceBucket);
  let records = [];
  let db;
  let writing = false;
  let cloudReady = false;
  let detailsRun = 0;
  const detailsByFile = new Map();

  async function loadPDFDetails() {
    const run = ++detailsRun;
    for (const invoice of records) {
      if (run !== detailsRun || !rows.isConnected || !appContext.isOwnerMode()) return;
      if (!(invoice.path || invoice.pdf)) continue;
      const key = invoice.path
        ? `collect-tcg.invoice-details.v1:${invoice.path}:${invoice.revision}`
        : `browser:${invoice.sequence}`;
      try {
        let details = detailsByFile.get(key);
        if (!details && invoice.revision) {
          try { details = JSON.parse(sessionStorage.getItem(key)); } catch {}
        }
        if (!details) {
          const { data, error } = invoice.pdf ? { data: invoice.pdf } : await bucket.download(invoice.path);
          if (error) throw error;
          if (run !== detailsRun || !rows.isConnected || !appContext.isOwnerMode()) return;
          details = await readInvoiceDetails(data, [...sellers, "Daniel Lim Poh Yeap"]);
          detailsByFile.set(key, details);
          if (invoice.revision) {
            try { sessionStorage.setItem(key, JSON.stringify(details)); } catch {}
          }
        }
        if (run !== detailsRun || !rows.isConnected || !appContext.isOwnerMode()) return;
        invoice.details = details;
        updateInvoiceRow(invoice);
        updateEmptyMessage();
      } catch {
        if (run !== detailsRun || !rows.isConnected || !appContext.isOwnerMode()) return;
        invoice.details = {};
        updateInvoiceRow(invoice);
        updateEmptyMessage();
      }
    }
  }

  async function openSavedInvoice(invoice, download = false) {
    if (!appContext.requireOwner("access a saved invoice")) return;
    const preview = download ? null : window.open("", "_blank");
    if (!download && !preview) {
      historyStatus.textContent = "Allow pop-ups for this site to open the invoice.";
      return;
    }
    if (preview) preview.opener = null;
    try {
      let pdf = invoice.pdf;
      if (invoice.path) {
        const result = await bucket.download(invoice.path);
        if (result.error) throw result.error;
        pdf = result.data;
      }
      if (!appContext.requireOwner("access a saved invoice")) {
        preview?.close();
        return;
      }
      if (!pdf) {
        renderPreview(appContext, invoice, preview);
        return;
      }
      const url = URL.createObjectURL(pdf.slice(0, pdf.size, "application/pdf"));
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      if (preview) {
        preview.location.replace(url);
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = `Invoice ${invoiceNumber(invoice.sequence)}.pdf`;
        document.body.append(link);
        link.click();
        link.remove();
      }
    } catch {
      preview?.close();
      historyStatus.textContent = "The invoice could not be opened.";
    }
  }

  const rowsByInvoice = new Map();
  const empty = document.createElement("li");

  function updateInvoiceRow(invoice) {
    const { row, title, subtitle } = rowsByInvoice.get(invoice);
    const number = invoiceNumber(invoice.sequence);
    const pdf = invoice.path || invoice.pdf;
    const details = pdf ? invoice.details : invoice;
    const date = details?.date;
    const displayedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(date))
      : "";
    title.textContent = [details?.seller, details?.description].filter(Boolean).join(" · ") || `Invoice ${number}`;
    subtitle.textContent = [
      number,
      displayedDate || (details ? "Transaction date unavailable" : "Reading invoice details…"),
      invoice.path ? "" : "This browser"
    ].filter(Boolean).join(" · ");
    const haystack = [title.textContent, subtitle.textContent, date].join(" ").toLowerCase();
    row.hidden = !haystack.includes(search.value.trim().toLowerCase());
  }

  function updateEmptyMessage() {
    empty.hidden = [...rowsByInvoice.values()].some(entry => !entry.row.hidden);
    empty.textContent = search.value.trim() ? "No matching invoices." : "No saved invoices.";
  }

  function renderHistory() {
    rowsByInvoice.clear();
    rows.replaceChildren(empty);
    for (const invoice of records) {
      const row = document.createElement("li");
      const summary = document.createElement("span");
      summary.className = "invoice-summary";
      const title = document.createElement("strong");
      const subtitle = document.createElement("small");
      summary.append(title, subtitle);
      const actions = document.createElement("div");
      actions.append(actionButton("View", () => openSavedInvoice(invoice)));
      if (invoice.path || invoice.pdf) actions.append(actionButton("Download PDF", () => openSavedInvoice(invoice, true)));
      actions.append(actionButton("Delete", () => removeSavedInvoice(invoice)));
      row.append(summary, actions);
      rowsByInvoice.set(invoice, { row, title, subtitle });
      rows.insertBefore(row, empty);
      updateInvoiceRow(invoice);
    }
    updateEmptyMessage();
  }

  async function refreshHistory() {
    const [cloud, local] = await Promise.allSettled([
      listCloudInvoices(bucket),
      db ? readHistory(db) : Promise.resolve([])
    ]);
    cloudReady = cloud.status === "fulfilled";
    records = [...(cloud.value ?? []), ...(local.value ?? [])].sort((a, b) => b.sequence - a.sequence);
    const next = nextSequence(records);
    suggestedNumber = cloudReady && next <= 9999999999 ? invoiceNumber(next) : "";
    if (!numberEdited) numberField.value = suggestedNumber;
    upload.disabled = !cloudReady;
    submit.disabled = previewButton.disabled = !cloudReady;
    renderHistory();
    void loadPDFDetails();
    if (!cloudReady) throw cloud.reason;
  }

  async function removeSavedInvoice(invoice) {
    if (!appContext.requireOwner("delete a saved invoice") || writing) return;
    const number = invoiceNumber(invoice.sequence);
    const location = invoice.path ? "Supabase for all devices" : "this browser";
    if (!window.confirm(`Delete invoice ${number} from ${location}?`)) return;
    await updateHistory(async () => {
      if (invoice.path) {
        const { data, error } = await bucket.remove([invoice.path]);
        if (error || !data?.some(file => file.name === invoice.path)) throw error ?? new Error("Invoice was not removed");
      } else {
        await changeHistory(db, store => store.delete(invoice.sequence));
      }
    }, `Invoice ${number} deleted.`, "The invoice could not be deleted.");
  }

  async function updateHistory(write, successMessage, failureMessage) {
    writing = true;
    upload.disabled = true;
    submit.disabled = previewButton.disabled = true;
    try {
      await write();
      historyStatus.textContent = successMessage;
    } catch (error) {
      historyStatus.textContent = String(error?.statusCode) === "409" || error?.error === "Duplicate"
        ? "That invoice number is already saved in Supabase."
        : failureMessage;
      return false;
    } finally {
      try {
        await refreshHistory();
      } catch {
        historyStatus.textContent += " Reload the page to reconnect to Supabase.";
      }
      writing = false;
    }
    return true;
  }

  openHistory().then(connection => { db = connection; }).catch(() => {}).then(refreshHistory).catch(() => {
    historyStatus.textContent = "Could not load invoices from Supabase. Reload to try again.";
  });

  search.addEventListener("input", () => {
    records.forEach(updateInvoiceRow);
    updateEmptyMessage();
  });
  fileInput.addEventListener("change", () => {
    const filename = fileInput.files[0]?.name ?? "";
    sequenceInput.value = filename.match(/^invoice[ _-]+([0-9]{1,10})(?:[ _]*\([0-9]+\))?\.pdf$/i)?.[1] ?? "";
  });

  archive.addEventListener("submit", async event => {
    event.preventDefault();
    if (!appContext.requireOwner("upload an invoice") || !cloudReady || writing) return;
    const pdf = fileInput.files[0];
    const sequence = Number(sequenceInput.value);
    if (!pdf || !archive.reportValidity() || sequence < 1) return;
    if (pdf.size > maxPDFBytes) {
      historyStatus.textContent = "Select a PDF no larger than 20 MB.";
      return;
    }

    const saved = await updateHistory(async () => {
      if (await pdf.slice(0, 5).text() !== "%PDF-") throw new Error("Invalid PDF");
      if (!appContext.requireOwner("store an uploaded invoice")) throw new Error("Owner access ended");
      const { error } = await bucket.upload(`${invoiceNumber(sequence)}.pdf`, pdf, {
        contentType: "application/pdf", upsert: false
      });
      if (error) throw error;
    }, `Invoice ${invoiceNumber(sequence)} uploaded.`, "Could not upload the file. Select a valid PDF and try again.");
    if (saved) archive.reset();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!appContext.requireOwner("create an invoice") || submit.disabled || writing) return;
    status.textContent = "";
    fields.client.value = fields.client.value.trim();
    fields.description.value = fields.description.value.trim();
    if (!form.reportValidity() || !sellers.includes(fields.seller.value) || !currencies.includes(fields.currency.value)) return;

    const details = Object.fromEntries(invoiceFields.map(name => [name, fields.namedItem(name).value.trim()]));
    const enteredNumber = numberField.value;
    const sequence = Number(enteredNumber);
    if (sequence < 1) {
      status.textContent = "Enter an invoice number greater than zero.";
      return;
    }
    if (event.submitter !== previewButton) {
      const number = invoiceNumber(sequence);
      status.textContent = "Creating and saving the PDF…";
      const saved = await updateHistory(async () => {
        const { createInvoicePDF } = await import("./invoice-export.js?v=2026-11-26-v11");
        const pdf = await createInvoicePDF(details, number, new URL("../../../assets/shop-logo.png", import.meta.url).href);
        if (!appContext.requireOwner("save a created invoice")) throw new Error("Owner access ended");
        if (pdf.size > maxPDFBytes) throw new Error("Invoice PDF exceeds the upload limit");
        const { error } = await bucket.upload(`${number}.pdf`, pdf, { contentType: "application/pdf", upsert: false });
        if (error) throw error;
      }, `Invoice ${number} saved.`, "The invoice could not be saved. Your entries are still here.");
      status.textContent = saved ? `Invoice ${number} is ready in Saved invoices.` : historyStatus.textContent;
      if (saved) {
        if (numberField.value === enteredNumber || !numberEdited) {
          numberField.value = suggestedNumber;
          numberEdited = false;
        }
        for (const name of ["client", "buyerAddress", "amount", "description"]) {
          const field = fields.namedItem(name);
          if (field.value.trim() === details[name]) field.value = "";
        }
        search.value = "";
        renderHistory();
      }
      return;
    }
    const preview = window.open("", "_blank");
    if (!preview) {
      status.textContent = "Allow pop-ups for this site to preview your invoice.";
      return;
    }
    try {
      renderPreview(appContext, { ...details, sequence }, preview);
    } catch {
      preview.close();
      status.textContent = "The invoice preview could not open.";
    }
  });
}

function renderPreview(appContext, invoice, preview) {
  const escape = appContext.escapeHtml;
  const addressMarkup = name => {
    const address = invoice[name];
    return address ? `<p class="address">${escape(address)}</p>` : "";
  };
  const number = invoiceNumber(invoice.sequence);
  const descriptions = invoice.description.split("\n").map(line => line.trim()).filter(Boolean);
  const amount = new Intl.NumberFormat("en", {
    style: "currency", currency: invoice.currency, currencyDisplay: "code"
  }).format(Number(invoice.amount));
  const logo = new URL("../../../assets/shop-logo.png", import.meta.url);
  preview.opener = null;
  preview.document.open();
  preview.document.write(`<!doctype html>
    <html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Invoice ${number}</title>
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; background: #edece8; color: #202928; font: 15px/1.55 Arial, sans-serif; overflow-wrap: anywhere; }
      main { max-width: 794px; margin: 24px auto; padding: clamp(24px, 7vw, 68px); background: white; box-shadow: 0 8px 32px #24272414; }
      p, dl, dd, h1 { margin: 0; }
      .brand { display: flex; align-items: center; gap: 14px; padding-bottom: 18px; border-bottom: 2px solid #253632; }
      .brand img { width: 52px; height: 52px; object-fit: contain; }
      .brand strong { font: 600 22px/1.1 Georgia, serif; }
      .brand small { display: block; margin-top: 5px; color: #5e635e; font-size: 11px; letter-spacing: .09em; }
      .heading, .parties { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 36px; }
      .heading { align-items: end; margin: 36px 0; }
      h1 { font: normal 64px/.98 Georgia, serif; letter-spacing: -.045em; color: #20332e; }
      .metadata div { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 4px 0; }
      .metadata dt, .section-label, th { font-size: 11px; letter-spacing: .07em; font-weight: 700; text-transform: uppercase; color: #555e58; }
      dd { text-align: right; font-variant-numeric: tabular-nums; }
      .parties { border-top: 1px solid #c6cac4; padding-top: 20px; margin-bottom: 38px; }
      .seller-name, .client-name { margin-top: 5px; font-size: 17px; font-weight: 700; }
      .address { margin-top: 4px; color: #414943; white-space: pre-wrap; }
      table { border-collapse: collapse; width: 100%; table-layout: fixed; text-align: left; }
      th { padding: 9px 0; border-top: 1px solid #828b83; border-bottom: 1px solid #828b83; }
      td { padding: 13px 0; vertical-align: top; border-bottom: 1px solid #d7dad5; }
      th:first-child, td:first-child { width: 3.2rem; color: #616a64; font-variant-numeric: tabular-nums; }
      .paid { margin: 22px 0 0 auto; width: 19rem; max-width: 100%; padding-top: 10px; border-top: 2px solid #99763c; text-align: right; break-inside: avoid; }
      .paid strong { display: block; margin-top: 2px; font: normal 32px/1.25 Georgia, serif; font-variant-numeric: lining-nums tabular-nums; }
      footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-top: 54px; border-top: 1px solid #afb7af; padding-top: 10px; color: #536157; font-size: 12px; }
      footer a { color: inherit; }
      .print-controls { margin: 18px auto; text-align: center; font-size: 13px; }
      button { padding: 10px 18px; margin-bottom: 5px; background: #20332e; color: white; border: 0; border-radius: 5px; font: inherit; cursor: pointer; }
      @media screen and (max-width: 520px) {
        main { margin: 0; }
        .heading, .parties { grid-template-columns: 1fr; gap: 18px; }
        h1 { font-size: 48px; }
      }
      @media print {
        body, main { background: white; }
        main { max-width: none; margin: 0; padding: 18mm; box-shadow: none; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
        .print-controls{display:none}
        .brand, .heading, .party, tr, footer { break-inside: avoid; }
        thead { display: table-header-group; }
      }
    </style></head><body>
    <div class="print-controls">
      <button type="button" id="printInvoice">Print / Save as PDF</button>
    </div>
    <main>
      <header>
        <div class="brand"><img src="${escape(logo.href)}" alt="Collect TCG logo"><div><strong>Collect TCG</strong><small>Malaysia &amp; Singapore</small></div></div>
        <div class="heading">
          <h1>Invoice</h1>
          <dl class="metadata">
            <div><dt>Invoice number</dt><dd>${number}</dd></div>
            <div><dt>Date</dt><dd><time>${escape(invoice.date)}</time></dd></div>
          </dl>
        </div>
      </header>
      <div class="parties">
        <section class="party"><p class="section-label">Bill to</p><p class="client-name">${escape(invoice.client)}</p>${addressMarkup("buyerAddress")}</section>
        <section class="party"><p class="section-label">From</p><p class="seller-name">${escape(invoice.seller)}</p>${addressMarkup("sellerAddress")}</section>
      </div>
      <table><thead><tr><th scope="col">No.</th><th scope="col">Product or service description</th></tr></thead>
        <tbody>${descriptions.map((line,index) => `<tr><td>${index+1}</td><td>${escape(line)}</td></tr>`).join("")}</tbody>
      </table>
      <p class="paid"><span class="section-label">Amount paid</span><strong>${escape(amount)}</strong></p>
      <footer><span>Thank you for your business.</span><a href="https://collecttcg.github.io/Collect_TCG/">Collect TCG catalogue</a></footer>
    </main></body></html>`);
  preview.document.close();
  preview.document.getElementById("printInvoice").addEventListener("click", () => {
    if (appContext.isOwnerMode()) preview.print();
    else preview.close();
  });
}
