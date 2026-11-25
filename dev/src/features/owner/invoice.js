const currencies = ["USD", "MYR", "SGD", "JPY"];

export function renderInvoiceGenerator(appContext) {
  if (!appContext.requireOwner("open the invoice generator")) return;

  appContext.view.innerHTML = `
    <div class="inventory-tools-page">
      <div class="eyebrow">Owner Tools</div>
      <h2>Invoice Generator</h2>
      ${appContext.inventoryToolsSwitcher("activity", "invoice")}
      <form class="panel" id="ownerInvoiceForm" autocomplete="off" style="max-width:780px;margin-top:20px;padding:20px">
        <style>
          #ownerInvoiceForm .invoice-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:16px}
          #ownerInvoiceForm label{display:grid;gap:6px}
          #ownerInvoiceForm :is(input,select,textarea){box-sizing:border-box;width:100%;min-height:44px;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--text);font:inherit}
          #ownerInvoiceForm textarea{resize:vertical}
          #ownerInvoiceForm .invoice-description{grid-column:1/-1}
        </style>
        <div class="invoice-fields">
          <label>Seller name <input name="seller" required maxlength="120" value="Collect TCG MY &amp; SG"></label>
          <label>Client name <input name="client" required maxlength="120"></label>
          <label>Invoice number <input name="number" required maxlength="64"></label>
          <label>Date <input name="date" type="date" required></label>
          <label>Currency <select name="currency">${currencies.map(code => `<option>${code}</option>`).join("")}</select></label>
          <label>Amount paid <input name="amount" type="number" inputmode="decimal" min="0.01" max="999999999.99" step="0.01" required></label>
          <label class="invoice-description">Product or service description
            <textarea name="description" rows="5" required maxlength="2400" placeholder="Enter one product or service per line"></textarea>
          </label>
        </div>
        <p role="status" data-invoice-status></p>
        <button class="btn-primary" type="submit">Preview Invoice</button>
      </form>
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

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!appContext.requireOwner("generate an invoice")) return;
    status.textContent = "";

    for (const name of ["seller", "client", "number", "description"]) {
      const field = fields.namedItem(name);
      field.value = field.value.trim();
    }
    if (!form.reportValidity()) return;
    const currency = fields.currency.value;
    if (!currencies.includes(currency)) return;

    const escape = appContext.escapeHtml;
    const number = escape(fields.namedItem("number").value);
    const descriptions = fields.description.value.split("\n").map(line => line.trim()).filter(Boolean);
    const amount = new Intl.NumberFormat("en", {
      style: "currency", currency, currencyDisplay: "code"
    }).format(fields.amount.valueAsNumber);
    const logo = new URL("../../../assets/shop-logo.png", import.meta.url);
    const preview = window.open("", "_blank");
    if (!preview) {
      status.textContent = "Allow pop-ups for this site and try again.";
      return;
    }
    preview.opener = null;
    preview.document.open();
    preview.document.write(`<!doctype html>
      <html lang="en"><head><meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Invoice ${number}</title>
      <style>
        @page{size:A4;margin:16mm}
        *{box-sizing:border-box}
        body{margin:0;background:#f1f2f4;color:#20242a;font:15px/1.5 system-ui,sans-serif;overflow-wrap:anywhere}
        main{max-width:780px;margin:24px auto;background:#fff;padding:clamp(20px,6vw,50px)}
        header{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;border-bottom:2px solid #20242a;padding-bottom:20px}
        header>div{flex:1 1 220px;min-width:0}
        header img{width:72px;height:72px;object-fit:contain;display:block;margin-bottom:10px}
        h1{margin:0 0 10px;font-size:2.2rem;letter-spacing:.08em;text-transform:uppercase}
        p{margin:4px 0}
        section{margin:22px 0}
        table{border-collapse:collapse;width:100%;table-layout:fixed}
        th,td{text-align:left;padding:10px;border-bottom:1px solid #c8ccd2}
        th{background:#eef0f3}
        .paid{text-align:right;margin-top:24px;font-size:1.2rem;break-inside:avoid}
        button{display:block;margin:24px auto;padding:10px 16px;font:inherit;cursor:pointer}
        @media print{body,main{background:#fff}main{margin:0;padding:0;max-width:none}button{display:none}header,tr{break-inside:avoid}}
      </style></head><body>
      <button type="button" id="printInvoice">Print / Save as PDF</button>
      <main>
        <header>
          <div><img src="${escape(logo.href)}" alt="Collect TCG logo"><strong>${escape(fields.seller.value)}</strong></div>
          <div><h1>Invoice</h1><p><strong>Invoice number:</strong> ${number}</p><p><strong>Date:</strong> <time>${escape(fields.date.value)}</time></p></div>
        </header>
        <section><strong>Invoice to</strong><p>${escape(fields.client.value)}</p></section>
        <table><thead><tr><th scope="col">Product or service description</th></tr></thead>
          <tbody>${descriptions.map(line => `<tr><td>${escape(line)}</td></tr>`).join("")}</tbody>
        </table>
        <p class="paid"><strong>Amount paid:</strong> ${escape(amount)}</p>
      </main></body></html>`);
    preview.document.close();
    preview.document.getElementById("printInvoice").addEventListener("click", () => {
      if (appContext.isOwnerMode()) preview.print();
      else preview.close();
    });
  });
}
