const currencies = ["USD", "MYR", "SGD", "JPY"];

const sellers = ["Zakwan Zahid", "Daniel Lim Poh Yeap", "Jack Wong Tiong Kiat", "Foo Xiang Yen", "Shue"];
const invoiceFields = ["seller", "client", "date", "currency", "amount", "sellerAddress", "buyerAddress", "description"];
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

export function renderInvoiceGenerator(appContext) {
  if (!appContext.requireOwner("open the invoice generator")) return;

  appContext.view.innerHTML = `
    <div class="inventory-tools-page">
      <div class="eyebrow">Owner Tools</div>
      <h2>Invoice Generator</h2>
      ${appContext.inventoryToolsSwitcher("activity", "invoice")}
      <form class="panel" id="ownerInvoiceForm" autocomplete="off" style="max-width:780px;margin-top:20px;padding:20px">
        <style>
          :is(#ownerInvoiceForm,#ownerInvoiceUpload) .invoice-fields, #ownerInvoiceUpload{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:16px}
          :is(#ownerInvoiceForm,#ownerInvoiceUpload) label{display:grid;gap:6px}
          :is(#ownerInvoiceForm,#ownerInvoiceUpload) :is(input,select,textarea){box-sizing:border-box;width:100%;min-height:44px;padding:10px;border:1px solid #777f8c;border-radius:8px;background:var(--surface-2);color:var(--text);font:inherit}
          #ownerInvoiceForm :is(input,select,textarea):focus{outline:2px solid var(--invoice-focus);outline-offset:2px}
          #ownerInvoiceForm ::placeholder{color:var(--text-muted);opacity:1}
          #ownerInvoiceForm{--invoice-focus:var(--accent-teal);color-scheme:dark}
          .light-mode #ownerInvoiceForm{--invoice-focus:#14675e;color-scheme:light}
          #ownerInvoiceForm textarea{resize:vertical}
          #ownerInvoiceForm .invoice-wide{grid-column:1/-1}
        </style>
        <div class="invoice-fields">
          <label>Seller name <select name="seller" required>
            <option value="">Select a seller</option>
            ${sellers.map(seller => `<option>${seller}</option>`).join("")}
          </select></label>
          <label>Client name <input name="client" required maxlength="120"></label>
          <label>Next invoice number <input name="number" readonly></label>
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
        <button class="btn-primary" type="submit" disabled>Preview Invoice</button>
      </form>
      <section class="panel" aria-label="Saved invoices" style="max-width:780px;margin-top:20px;padding:20px">
        <h3>Saved invoices</h3>
        <p class="muted">Save the preview as a PDF, then upload it here when you want it added to this browser’s invoice history.</p>
        <form id="ownerInvoiceUpload" class="invoice-fields">
          <label>Invoice PDF <input name="pdf" type="file" accept=".pdf,application/pdf" required></label>
          <label>Invoice number on PDF <input name="sequence" inputmode="numeric" pattern="[0-9]{1,10}" maxlength="10" required></label>
          <button class="btn-primary" type="submit" disabled>Upload Invoice</button>
        </form>
        <p role="status" id="ownerInvoiceHistoryStatus"></p>
        <label>Invoice <select id="ownerSavedInvoice" disabled><option value="">Loading invoices…</option></select></label>
        <button class="btn-ghost" type="button" id="ownerOpenInvoice" disabled>Open Invoice</button>
        <button class="btn-ghost" type="button" id="ownerDeleteInvoice" disabled>Delete Invoice</button>
      </section>
    </div>`;

  const form = appContext.$("ownerInvoiceForm");
  const status = form.querySelector("[data-invoice-status]");
  const fields = form.elements;
  const date = new Date();
  fields.date.value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  fields.currency.addEventListener("change", () => {
    const increment = fields.currency.value === "JPY" ? "1" : "0.01";
    fields.amount.min = increment;
    fields.amount.step = increment;
    fields.amount.max = increment === "1" ? "999999999" : "999999999.99";
  });

  const submit = form.querySelector("button[type=submit]");
  const archive = appContext.$("ownerInvoiceUpload");
  const upload = archive.querySelector("button[type=submit]");
  const historyStatus = appContext.$("ownerInvoiceHistoryStatus");
  const savedInvoices = appContext.$("ownerSavedInvoice");
  const openInvoice = appContext.$("ownerOpenInvoice");
  const deleteInvoice = appContext.$("ownerDeleteInvoice");
  const fileInput = archive.elements.pdf;
  const sequenceInput = archive.elements.sequence;
  let records = [];
  let db;
  let writing = false;

  function updateHistoryButtons() {
    openInvoice.disabled = writing || !savedInvoices.value;
    deleteInvoice.disabled = writing || !savedInvoices.value;
    upload.disabled = writing;
  }

  async function refreshHistory(selected = "") {
    records = await readHistory(db);
    fields.namedItem("number").value = invoiceNumber(nextSequence(records));
    savedInvoices.replaceChildren(new Option(records.length ? "Select an invoice" : "No saved invoices", ""));
    for (const invoice of [...records].reverse()) {
      const label = invoice.pdf ? invoice.pdf.name : `${invoice.date} · ${invoice.client}`;
      savedInvoices.add(new Option(`${invoiceNumber(invoice.sequence)} · ${label}`, String(invoice.sequence)));
    }
    savedInvoices.value = selected;
    savedInvoices.disabled = !records.length;
    updateHistoryButtons();
  }

  openHistory().then(connection => {
    db = connection;
    return refreshHistory();
  }).then(() => {
    submit.disabled = false;
  }).catch(() => {
    status.textContent = "Invoice storage is unavailable in this browser.";
    savedInvoices.options[0].text = "Invoice history unavailable";
  });

  savedInvoices.addEventListener("change", updateHistoryButtons);
  fileInput.addEventListener("change", () => {
    const filename = fileInput.files[0]?.name ?? "";
    sequenceInput.value = filename.match(/^invoice[ _-]+([0-9]{1,10})(?:[ _]*\([0-9]+\))?\.pdf$/i)?.[1] ?? "";
  });

  openInvoice.addEventListener("click", () => {
    if (!appContext.requireOwner("open a saved invoice")) return;
    const invoice = records.find(item => String(item.sequence) === savedInvoices.value);
    if (!invoice) return;
    const preview = window.open("", "_blank");
    if (!preview) {
      historyStatus.textContent = "Allow pop-ups for this site to open your saved invoice.";
      return;
    }
    historyStatus.textContent = "";
    if (invoice.pdf) {
      const url = URL.createObjectURL(new Blob([invoice.pdf], { type: "application/pdf" }));
      preview.opener = null;
      preview.location.replace(url);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else {
      renderPreview(appContext, invoice, preview);
    }
  });

  async function updateHistory(write, selected, successMessage, failureMessage) {
    writing = true;
    updateHistoryButtons();
    try {
      await changeHistory(db, write);
      historyStatus.textContent = successMessage;
    } catch (error) {
      historyStatus.textContent = error?.name === "ConstraintError"
        ? "That invoice number is already saved."
        : failureMessage;
      return false;
    } finally {
      try {
        await refreshHistory(selected);
      } catch {
        historyStatus.textContent += " Reload the page to refresh the list.";
      }
      writing = false;
      updateHistoryButtons();
    }
    return true;
  }

  archive.addEventListener("submit", async event => {
    event.preventDefault();
    if (!appContext.requireOwner("upload an invoice") || !db || writing) return;
    const pdf = fileInput.files[0];
    const sequence = Number(sequenceInput.value);
    if (!pdf || !archive.reportValidity() || sequence < 1) return;
    writing = true;
    updateHistoryButtons();
    let signature;
    try {
      signature = await pdf.slice(0, 5).text();
    } catch {
      historyStatus.textContent = "The selected file could not be read.";
      return;
    } finally {
      writing = false;
      updateHistoryButtons();
    }
    if (signature !== "%PDF-") {
      historyStatus.textContent = "Select a valid PDF file.";
      return;
    }
    if (!appContext.requireOwner("store an uploaded invoice")) return;
    const saved = await updateHistory(
      store => store.add({ sequence, pdf }),
      String(sequence),
      `Invoice ${invoiceNumber(sequence)} uploaded.`,
      "The invoice could not be uploaded."
    );
    if (saved) archive.reset();
  });

  deleteInvoice.addEventListener("click", async () => {
    if (!appContext.requireOwner("delete a saved invoice") || writing || !savedInvoices.value) return;
    const sequence = Number(savedInvoices.value);
    const number = invoiceNumber(sequence);
    if (!window.confirm(`Delete invoice ${number} from this browser’s history?`)) return;
    await updateHistory(store => store.delete(sequence), "", `Invoice ${number} deleted.`, "The invoice could not be deleted.");
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!appContext.requireOwner("preview an invoice") || submit.disabled) return;
    status.textContent = "";
    fields.client.value = fields.client.value.trim();
    fields.description.value = fields.description.value.trim();
    if (!form.reportValidity() || !sellers.includes(fields.seller.value) || !currencies.includes(fields.currency.value)) return;

    const details = Object.fromEntries(invoiceFields.map(name => [name, fields.namedItem(name).value.trim()]));
    const preview = window.open("", "_blank");
    if (!preview) {
      status.textContent = "Allow pop-ups for this site to preview your invoice.";
      return;
    }
    submit.disabled = true;
    try {
      await refreshHistory(savedInvoices.value);
      if (appContext.isOwnerMode()) renderPreview(appContext, { ...details, sequence: nextSequence(records) }, preview);
      else preview.close();
    } catch {
      preview.close();
      status.textContent = "The invoice preview could not open.";
    } finally {
      submit.disabled = false;
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
