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
          #ownerInvoiceForm :is(input,select,textarea){box-sizing:border-box;width:100%;min-height:44px;padding:10px;border:1px solid #777f8c;border-radius:8px;background:var(--surface-2);color:var(--text);font:inherit}
          #ownerInvoiceForm :is(input,select,textarea):focus{outline:2px solid var(--invoice-focus);outline-offset:2px}
          #ownerInvoiceForm ::placeholder{color:var(--text-muted);opacity:1}
          #ownerInvoiceForm{--invoice-focus:var(--accent-teal);color-scheme:dark}
          .light-mode #ownerInvoiceForm{--invoice-focus:#14675e;color-scheme:light}
          #ownerInvoiceForm textarea{resize:vertical}
          #ownerInvoiceForm .invoice-wide{grid-column:1/-1}
        </style>
        <div class="invoice-fields">
          <label>Seller name <input name="seller" required maxlength="120" value="Collect TCG MY &amp; SG"></label>
          <label>Client name <input name="client" required maxlength="120"></label>
          <label>Invoice number <input name="number" required maxlength="64"></label>
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
    const addressMarkup = name => {
      const address = fields.namedItem(name).value.trim();
      return address ? `<p class="address">${escape(address)}</p>` : "";
    };
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
        body{margin:0;background:#edefef;color:#20252b;font:15px/1.5 system-ui,sans-serif;overflow-wrap:anywhere}
        main{max-width:794px;margin:24px auto;background:#fff;padding:clamp(22px,6vw,54px);border:1px solid #ccd0d2;border-top:6px solid #9a641b}
        header{display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,4vw,38px);align-items:start;padding:0 0 25px;border-bottom:1px solid #bcc1c4}
        .brand{display:flex;align-items:center;flex-wrap:wrap;gap:14px;margin:0 0 13px}
        .brand img{width:76px;height:76px;object-fit:contain}
        .brand strong{font-size:1.15rem}
        h1{margin:0 0 12px;font-size:clamp(1.9rem,5vw,3.15rem);font-weight:780;line-height:1.05;letter-spacing:.09em;text-transform:uppercase;text-align:right}
        dl{margin:0}
        .metadata div{display:grid;grid-template-columns:1fr 1.25fr;gap:10px;padding:7px 0;border-bottom:1px solid #dde0e1}
        dt,.section-label{color:#4a5056;font-size:.74rem;font-weight:750;letter-spacing:.06em;text-transform:uppercase}
        dd{margin:0;text-align:right;font-weight:650;font-variant-numeric:tabular-nums}
        p{margin:4px 0}
        .seller-name,.client-name{font-size:1.08rem;font-weight:700}
        .address{white-space:pre-wrap;color:#41474d}
        .recipient{margin:24px 0;break-inside:avoid}
        table{border-collapse:collapse;width:100%;table-layout:fixed}
        th,td{text-align:left;padding:11px 13px;border-bottom:1px solid #c8ccd2}
        thead th{background:#e9ebeb;border-top:2px solid #383e43;color:#252a2f;font-weight:750}
        th:first-child,td:first-child{width:3.3rem;text-align:center}
        tbody td:first-child{color:#515860;font-variant-numeric:tabular-nums}
        .paid{display:flex;justify-content:space-between;gap:12px 22px;align-items:baseline;flex-wrap:wrap;width:max-content;max-width:100%;margin:24px 0 0 auto;padding:12px 16px;border:1px solid #969a9d;border-top:3px solid #9a641b;background:#f4eee4;break-inside:avoid}
        .paid strong{font-size:1.24rem;font-variant-numeric:tabular-nums}
        footer{margin-top:46px;padding-top:13px;border-top:2px solid #383e43;text-align:center;color:#42484e;font-size:.85rem;break-inside:avoid}
        .print-controls{text-align:center;margin:20px auto;padding:0 12px;color:#42484e;font-size:.88rem}
        button{padding:10px 16px;border:1px solid #32373d;border-radius:6px;background:#252a2f;color:#fff;font:inherit;font-weight:650;cursor:pointer}
        @media screen and (max-width:520px){main{margin:0}header{grid-template-columns:1fr}h1{text-align:left}.brand img{width:64px;height:64px}}
        @media print{
          body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          main{margin:0;padding:12px 0 0;max-width:none;border-width:5px 0 0}
          .print-controls{display:none}
          header,tr{break-inside:avoid}
          thead{display:table-header-group}
        }
      </style></head><body>
      <div class="print-controls">
        <button type="button" id="printInvoice">Print / Save as PDF</button>
        <p>Turn off Headers and footers in the print dialog for a clean PDF.</p>
      </div>
      <main>
        <header>
          <div>
            <div class="brand"><img src="${escape(logo.href)}" alt="Collect TCG logo"><strong>Collect TCG MY &amp; SG</strong></div>
            <p class="section-label">Seller</p><p class="seller-name">${escape(fields.seller.value)}</p>${addressMarkup("sellerAddress")}
          </div>
          <div>
            <h1>Invoice</h1>
            <dl class="metadata">
              <div><dt>Invoice number</dt><dd>${number}</dd></div>
              <div><dt>Date</dt><dd><time>${escape(fields.date.value)}</time></dd></div>
            </dl>
          </div>
        </header>
        <section class="recipient"><p class="section-label">Invoice to</p><p class="client-name">${escape(fields.client.value)}</p>${addressMarkup("buyerAddress")}</section>
        <table><thead><tr><th scope="col">No.</th><th scope="col">Product or service description</th></tr></thead>
          <tbody>${descriptions.map((line,index) => `<tr><td>${index+1}</td><td>${escape(line)}</td></tr>`).join("")}</tbody>
        </table>
        <p class="paid"><span class="section-label">Amount paid</span><strong>${escape(amount)}</strong></p>
        <footer>Thank you for your business</footer>
      </main></body></html>`);
    preview.document.close();
    preview.document.getElementById("printInvoice").addEventListener("click", () => {
      if (appContext.isOwnerMode()) preview.print();
      else preview.close();
    });
  });
}
