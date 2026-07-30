const fs = require("fs");
const path = require("path");

const DEFAULT_INVOICE_SETTINGS = {
  companyName: "LA-Bowling Peter Vorholzer",
  companyAddress: "Röntgenstraße 12 a\n84030 Landshut",
  taxNumber: "",
  vatId: "",
  iban: "",
  bankName: "",
  bic: "",
  paymentDays: 14,
  defaultText: "Rechnung zu beiliegenden Einzelbelegen",
  colors: {
    primary: "#111827",
    accent: "#d71e28",
    muted: "#6b7280",
    line: "#dbe2ea",
    highlight: "#f4f6f8"
  },
  logoData: ""
};

function safeText(value, max = 4000) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function moneyNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value * 100) / 100;
  const raw = String(value == null ? "" : value).trim();
  if (!raw) return 0;
  const compact = raw.replace(/\s+/g, "").replace(/[^\d,.-]/g, "");
  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  let normalized = compact;
  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      normalized = compact.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = compact.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    normalized = compact.replace(",", ".");
  } else if ((compact.match(/\./g) || []).length > 1) {
    const parts = compact.split(".");
    const fraction = parts.pop();
    normalized = `${parts.join("")}.${fraction}`;
  }
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

function cleanInt(value, fallback = 0, min = 0, max = 999999) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function cleanDate(value, fallback = "") {
  const text = safeText(value, 20);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : fallback;
}

function cleanColor(value, fallback) {
  const text = safeText(value, 20);
  return /^#[0-9a-fA-F]{6}$/.test(text) ? text.toLowerCase() : fallback;
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(dateKey, days) {
  const base = cleanDate(dateKey, nowIso().slice(0, 10));
  const date = new Date(`${base}T12:00:00`);
  if (Number.isNaN(date.getTime())) return base;
  date.setDate(date.getDate() + Number(days || 0));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(dateKey) {
  const safe = cleanDate(dateKey);
  if (!safe) return "-";
  const [year, month, day] = safe.split("-");
  return `${day}.${month}.${year}`;
}

function euro(value) {
  return `${moneyNumber(value).toFixed(2).replace(".", ",")} Euro`;
}

function taxRateNumber(value) {
  const rate = moneyNumber(value);
  if (rate <= 0) return 0;
  if (Math.abs(rate - 7) < 0.01) return 7;
  if (Math.abs(rate - 19) < 0.01) return 19;
  return Math.max(0, Math.min(100, rate));
}

function createAuditEntry(action, actor = "", note = "") {
  return {
    at: nowIso(),
    action: safeText(action, 80),
    actor: safeText(actor, 120),
    note: safeText(note, 600)
  };
}

function normalizeInvoiceSettings(value = {}) {
  const colors = value && typeof value === "object" ? value.colors || {} : {};
  return {
    companyName: safeText(value.companyName || DEFAULT_INVOICE_SETTINGS.companyName, 160) || DEFAULT_INVOICE_SETTINGS.companyName,
    companyAddress: safeText(value.companyAddress || DEFAULT_INVOICE_SETTINGS.companyAddress, 600) || DEFAULT_INVOICE_SETTINGS.companyAddress,
    taxNumber: safeText(value.taxNumber, 80),
    vatId: safeText(value.vatId, 80),
    iban: safeText(value.iban, 80),
    bankName: safeText(value.bankName, 120),
    bic: safeText(value.bic, 80),
    paymentDays: cleanInt(value.paymentDays, DEFAULT_INVOICE_SETTINGS.paymentDays, 0, 120),
    defaultText: safeText(value.defaultText || DEFAULT_INVOICE_SETTINGS.defaultText, 1200) || DEFAULT_INVOICE_SETTINGS.defaultText,
    colors: {
      primary: cleanColor(colors.primary, DEFAULT_INVOICE_SETTINGS.colors.primary),
      accent: cleanColor(colors.accent, DEFAULT_INVOICE_SETTINGS.colors.accent),
      muted: cleanColor(colors.muted, DEFAULT_INVOICE_SETTINGS.colors.muted),
      line: cleanColor(colors.line, DEFAULT_INVOICE_SETTINGS.colors.line),
      highlight: cleanColor(colors.highlight, DEFAULT_INVOICE_SETTINGS.colors.highlight)
    },
    logoData: safeText(value.logoData, 800000)
  };
}

function normalizeInvoiceAttachment(item = {}, index = 0) {
  const name = safeText(item.name || item.filename, 240);
  const data = safeText(item.data || item.dataUrl, 4000000);
  const filePath = safeText(item.path || item.objectPath, 600);
  const url = safeText(item.url, 1200);
  return {
    id: safeText(item.id || `invoice-attachment-${Date.now()}-${index}`, 80),
    label: safeText(item.label || "Anlage", 80) || "Anlage",
    name,
    data,
    path: filePath,
    url,
    mime: safeText(item.mime || "", 120)
  };
}

function normalizeInvoicePosition(item = {}, index = 0) {
  return {
    id: safeText(item.id || `invoice-position-${Date.now()}-${index}`, 80),
    articleNumber: safeText(item.articleNumber || item.articleNo, 40),
    description: safeText(item.description || item.label || item.name, 400),
    quantity: Math.max(0, moneyNumber(item.quantity || 1)),
    unit: safeText(item.unit || "Stück", 40) || "Stück",
    unitPrice: moneyNumber(item.unitPrice || item.price || item.amount || 0),
    taxRate: taxRateNumber(item.taxRate)
  };
}

function normalizeInvoiceSourceType(invoice = {}) {
  const explicit = String(invoice.sourceType || "").trim();
  if (["event", "advertising", "manual"].includes(explicit)) return explicit;
  if (invoice.sourceDate || invoice.sourceCustomerId) return "event";
  return "manual";
}

function normalizeInvoiceRecord(invoice = {}, settings = DEFAULT_INVOICE_SETTINGS) {
  const normalizedSettings = normalizeInvoiceSettings(settings);
  const positions = (Array.isArray(invoice.positions) ? invoice.positions : [])
    .map((item, index) => normalizeInvoicePosition(item, index))
    .filter((item) => item.description || item.unitPrice || item.quantity);
  const attachments = (Array.isArray(invoice.attachments) ? invoice.attachments : [])
    .map((item, index) => normalizeInvoiceAttachment(item, index))
    .filter((item) => item.name || item.data || item.path || item.url);
  const invoiceDate = cleanDate(invoice.invoiceDate, nowIso().slice(0, 10));
  const serviceDate = cleanDate(invoice.serviceDate, invoiceDate);
  const dueDate = cleanDate(invoice.dueDate, addDays(invoiceDate, normalizedSettings.paymentDays));
  const status = ["draft", "finalized", "sent", "archived"].includes(String(invoice.status || "").trim())
    ? String(invoice.status).trim()
    : "draft";
  const paymentStatus = ["open", "paid", "cash-paid"].includes(String(invoice.paymentStatus || "").trim())
    ? String(invoice.paymentStatus).trim()
    : "open";
  const paymentMethod = ["Überweisung", "Bar", "EC", ""].includes(String(invoice.paymentMethod || "").trim())
    ? String(invoice.paymentMethod || "").trim()
    : "";
  return {
    id: safeText(invoice.id || `invoice-${Date.now()}-${Math.random().toString(16).slice(2)}`, 80),
    type: ["invoice", "correction", "storno"].includes(String(invoice.type || "").trim()) ? String(invoice.type).trim() : "invoice",
    sourceType: normalizeInvoiceSourceType(invoice),
    sourceDate: cleanDate(invoice.sourceDate),
    sourceCustomerId: safeText(invoice.sourceCustomerId, 120),
    sourceCustomerStatus: safeText(invoice.sourceCustomerStatus, 40),
    customerName: safeText(invoice.customerName || invoice.name, 200),
    customerContact: safeText(invoice.customerContact || invoice.contact, 200),
    customerEmail: safeText(invoice.customerEmail || invoice.email, 180),
    customerPhone: safeText(invoice.customerPhone || invoice.phone, 80),
    customerAddress: safeText(invoice.customerAddress || invoice.address, 1000),
    invoiceDate,
    serviceDate,
    dueDate,
    paymentMethod,
    paymentStatus,
    headline: safeText(invoice.headline || "Rechnung", 120) || "Rechnung",
    introText: safeText(invoice.introText || normalizedSettings.defaultText, 1200) || normalizedSettings.defaultText,
    note: safeText(invoice.note, 2000),
    internalNote: safeText(invoice.internalNote, 2000),
    positions,
    attachments,
    status,
    invoiceNumber: safeText(invoice.invoiceNumber, 60),
    pdfData: safeText(invoice.pdfData, 8000000),
    pdfFileName: safeText(invoice.pdfFileName, 240),
    createdAt: safeText(invoice.createdAt || nowIso(), 80),
    updatedAt: safeText(invoice.updatedAt || invoice.createdAt || nowIso(), 80),
    finalizedAt: safeText(invoice.finalizedAt, 80),
    sentAt: safeText(invoice.sentAt, 80),
    archivedAt: safeText(invoice.archivedAt, 80),
    emailMessageId: safeText(invoice.emailMessageId, 240),
    auditLog: (Array.isArray(invoice.auditLog) ? invoice.auditLog : [])
      .map((entry) => ({
        at: safeText(entry?.at, 80),
        action: safeText(entry?.action, 80),
        actor: safeText(entry?.actor, 120),
        note: safeText(entry?.note, 600)
      }))
      .filter((entry) => entry.action)
  };
}

function normalizeInvoices(value = [], settings = DEFAULT_INVOICE_SETTINGS) {
  return (Array.isArray(value) ? value : [])
    .map((invoice) => normalizeInvoiceRecord(invoice, settings))
    .filter((invoice) => invoice.customerName || invoice.invoiceNumber || invoice.positions.length)
    .sort((a, b) => {
      const aTime = Date.parse(a.updatedAt || a.createdAt || "") || 0;
      const bTime = Date.parse(b.updatedAt || b.createdAt || "") || 0;
      if (a.status !== b.status) {
        const rank = { draft: 0, finalized: 1, sent: 2, archived: 3 };
        return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      }
      return bTime - aTime;
    });
}

function invoiceLineGross(position = {}) {
  return Math.max(0, moneyNumber(position.quantity || 0) * moneyNumber(position.unitPrice || 0));
}

function invoiceLineNet(position = {}) {
  const gross = invoiceLineGross(position);
  const rate = taxRateNumber(position.taxRate);
  if (!rate) return gross;
  return Math.round((gross / (1 + (rate / 100))) * 100) / 100;
}

function invoiceLineTax(position = {}) {
  return Math.round((invoiceLineGross(position) - invoiceLineNet(position)) * 100) / 100;
}

function invoiceTotals(invoice = {}) {
  const groups = new Map();
  let grossTotal = 0;
  let netTotal = 0;
  let taxTotal = 0;
  (invoice.positions || []).forEach((position) => {
    const gross = invoiceLineGross(position);
    const net = invoiceLineNet(position);
    const tax = invoiceLineTax(position);
    const rate = taxRateNumber(position.taxRate);
    grossTotal += gross;
    netTotal += net;
    taxTotal += tax;
    const current = groups.get(rate) || { rate, net: 0, tax: 0, gross: 0 };
    current.net += net;
    current.tax += tax;
    current.gross += gross;
    groups.set(rate, current);
  });
  return {
    grossTotal: Math.round(grossTotal * 100) / 100,
    netTotal: Math.round(netTotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    groups: [...groups.values()]
      .map((group) => ({
        rate: group.rate,
        net: Math.round(group.net * 100) / 100,
        tax: Math.round(group.tax * 100) / 100,
        gross: Math.round(group.gross * 100) / 100
      }))
      .sort((a, b) => b.rate - a.rate)
  };
}

function invoiceYear(invoice = {}) {
  const source = cleanDate(invoice.invoiceDate || invoice.serviceDate || "");
  return source ? source.slice(0, 4) : String(new Date().getFullYear());
}

function nextInvoiceNumber(invoices = [], invoiceDate = "") {
  const year = cleanDate(invoiceDate || nowIso().slice(0, 10), nowIso().slice(0, 10)).slice(0, 4);
  const prefix = `RE-${year}-`;
  let max = 0;
  normalizeInvoices(invoices).forEach((invoice) => {
    const number = String(invoice.invoiceNumber || "");
    if (!number.startsWith(prefix)) return;
    const tail = Number(number.slice(prefix.length));
    if (Number.isFinite(tail) && tail > max) max = tail;
  });
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

function attachmentFromCustomer(label, name, data, filePath, url) {
  if (!name && !data && !filePath && !url) return null;
  return normalizeInvoiceAttachment({
    label,
    name,
    data,
    path: filePath,
    url
  });
}

function attachmentsFromCustomer(customer = {}) {
  return [
    attachmentFromCustomer("Rechnungsbeleg", customer.receiptName, customer.receiptData, customer.receiptPath, customer.receiptUrl),
    attachmentFromCustomer("Bowling-Beleg", customer.bowlingReceiptName, customer.bowlingReceiptData, customer.bowlingReceiptPath, customer.bowlingReceiptUrl),
    attachmentFromCustomer("Gastro-Beleg", customer.gastroReceiptName, customer.gastroReceiptData, customer.gastroReceiptPath, customer.gastroReceiptUrl)
  ].filter(Boolean);
}

function invoicePositionPreset(articleNumber, description, amount, taxRate, unit = "Stück") {
  const gross = moneyNumber(amount);
  if (gross <= 0) return null;
  return normalizeInvoicePosition({
    articleNumber,
    description,
    quantity: 1,
    unit,
    unitPrice: gross,
    taxRate
  });
}

function positionsFromCustomer(customer = {}) {
  const otherLabel = safeText(customer.gastroOtherNote || "Sonstiges", 120) || "Sonstiges";
  return [
    invoicePositionPreset("10", "Bowling", customer.bowlingAmount, 19),
    invoicePositionPreset("02", "Getränke", customer.gastroDrinksAmount, 19),
    invoicePositionPreset("03", "Speisen", customer.gastroFoodAmount, 7),
    invoicePositionPreset("05", otherLabel, customer.gastroOtherAmount, 19),
    invoicePositionPreset("TIP", "Tip", customer.tip, 0)
  ].filter(Boolean);
}

function createBlankInvoiceDraft(settings = DEFAULT_INVOICE_SETTINGS, actor = "") {
  const normalizedSettings = normalizeInvoiceSettings(settings);
  const today = nowIso().slice(0, 10);
  return normalizeInvoiceRecord({
    sourceType: "manual",
    headline: "Rechnung",
    introText: normalizedSettings.defaultText,
    invoiceDate: today,
    serviceDate: today,
    dueDate: addDays(today, normalizedSettings.paymentDays),
    status: "draft",
    paymentStatus: "open",
    positions: [],
    attachments: [],
    auditLog: [createAuditEntry("draft-created", actor, "Leerer Entwurf erstellt.")]
  }, normalizedSettings);
}

function createInvoiceDraftFromCustomer(customer = {}, sourceDate = "", settings = DEFAULT_INVOICE_SETTINGS, actor = "") {
  const normalizedSettings = normalizeInvoiceSettings(settings);
  const serviceDate = cleanDate(sourceDate, nowIso().slice(0, 10));
  return normalizeInvoiceRecord({
    sourceType: "event",
    sourceDate: serviceDate,
    sourceCustomerId: customer.id || "",
    sourceCustomerStatus: "ready",
    customerName: customer.name || "",
    customerContact: customer.contact || "",
    customerEmail: customer.email || "",
    customerPhone: customer.phone || "",
    customerAddress: customer.address || "",
    invoiceDate: nowIso().slice(0, 10),
    serviceDate,
    dueDate: addDays(nowIso().slice(0, 10), normalizedSettings.paymentDays),
    paymentMethod: customer.paymentMethod || "",
    paymentStatus: customer.paymentMethod === "Bar" || customer.paymentMethod === "EC" ? "cash-paid" : "open",
    headline: "Rechnung",
    introText: normalizedSettings.defaultText,
    note: safeText(customer.note, 1200),
    positions: positionsFromCustomer(customer),
    attachments: attachmentsFromCustomer(customer),
    auditLog: [createAuditEntry("draft-created", actor, `Aus Rechnungskunde vom ${formatDateLabel(serviceDate)} übernommen.`)]
  }, normalizedSettings);
}

function invoiceMailPreviewText(invoice = {}) {
  const totals = invoiceTotals(invoice);
  return [
    invoice.invoiceNumber ? `Rechnung ${invoice.invoiceNumber}` : "LA-Bowling Rechnung",
    invoice.customerName || "-",
    invoice.customerAddress || "-",
    "",
    `Rechnungsbetrag: ${euro(totals.grossTotal)}`,
    `Leistungsdatum: ${formatDateLabel(invoice.serviceDate)}`,
    invoice.note ? `Hinweis: ${invoice.note}` : "",
    "",
    "Beiliegende Einzelbelege sind Bestandteil dieser Rechnung."
  ].filter(Boolean).join("\n");
}

function buildInvoiceMailHtml(invoice = {}, settings = DEFAULT_INVOICE_SETTINGS) {
  const normalizedSettings = normalizeInvoiceSettings(settings);
  const totals = invoiceTotals(invoice);
  const rows = (invoice.positions || []).map((position, index) => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${index + 1}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(position.articleNumber || "-")}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(position.description || "-")}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(String(position.quantity || 0))}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(position.unit || "-")}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(euro(position.unitPrice || 0))}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${escapeHtml(euro(invoiceLineGross(position)))}</td>
    </tr>
  `).join("");
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;padding:24px;color:#111827;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #dbe2ea;border-radius:18px;overflow:hidden;">
        <div style="padding:28px 32px 18px;border-top:4px solid ${normalizedSettings.colors.accent};">
          <div style="font-size:28px;font-weight:700;letter-spacing:0.02em;color:${normalizedSettings.colors.primary};">LA-BOWLING</div>
          <div style="margin-top:6px;font-size:15px;color:${normalizedSettings.colors.muted};">${escapeHtml(normalizedSettings.companyName)}</div>
          <div style="margin-top:4px;font-size:14px;color:${normalizedSettings.colors.muted};white-space:pre-line;">${escapeHtml(normalizedSettings.companyAddress)}</div>
        </div>
        <div style="padding:0 32px 28px;">
          <div style="display:flex;justify-content:space-between;gap:24px;align-items:flex-start;">
            <div>
              <div style="font-size:30px;font-weight:700;color:${normalizedSettings.colors.primary};">Rechnung</div>
              <div style="margin-top:6px;font-size:14px;color:${normalizedSettings.colors.muted};">${escapeHtml(invoice.introText || normalizedSettings.defaultText)}</div>
            </div>
            <div style="min-width:220px;background:${normalizedSettings.colors.highlight};border:1px solid ${normalizedSettings.colors.line};border-radius:14px;padding:16px;">
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${normalizedSettings.colors.muted};margin-bottom:8px;">Rechnungsdaten</div>
              <div style="display:grid;grid-template-columns:1fr auto;gap:8px 12px;font-size:14px;">
                <span>Belegnummer</span><strong>${escapeHtml(invoice.invoiceNumber || "-")}</strong>
                <span>Belegdatum</span><strong>${escapeHtml(formatDateLabel(invoice.invoiceDate))}</strong>
                <span>Leistungsdatum</span><strong>${escapeHtml(formatDateLabel(invoice.serviceDate))}</strong>
                <span>Zahlungsziel</span><strong>${escapeHtml(formatDateLabel(invoice.dueDate))}</strong>
              </div>
            </div>
          </div>
          <div style="margin-top:26px;padding:18px 20px;border:1px solid ${normalizedSettings.colors.line};border-radius:14px;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${normalizedSettings.colors.muted};margin-bottom:10px;">Kunde</div>
            <div style="font-size:18px;font-weight:700;color:${normalizedSettings.colors.primary};">${escapeHtml(invoice.customerName || "-")}</div>
            <div style="margin-top:8px;white-space:pre-line;font-size:14px;line-height:1.6;color:${normalizedSettings.colors.primary};">${escapeHtml(invoice.customerAddress || "-")}</div>
          </div>
          <table style="width:100%;margin-top:24px;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:${normalizedSettings.colors.highlight};text-align:left;">
                <th style="padding:10px;">Pos</th>
                <th style="padding:10px;">Art.-Nr.</th>
                <th style="padding:10px;">Bezeichnung</th>
                <th style="padding:10px;text-align:right;">Menge</th>
                <th style="padding:10px;">Einheit</th>
                <th style="padding:10px;text-align:right;">Einzelpreis</th>
                <th style="padding:10px;text-align:right;">Betrag EUR</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="7" style="padding:14px 10px;color:${normalizedSettings.colors.muted};">Keine Positionen vorhanden.</td></tr>`}</tbody>
          </table>
          <div style="margin-top:24px;display:flex;justify-content:flex-end;">
            <div style="width:320px;border:1px solid ${normalizedSettings.colors.line};border-radius:16px;padding:18px 20px;background:${normalizedSettings.colors.highlight};">
              <div style="display:flex;justify-content:space-between;gap:12px;font-size:14px;margin-bottom:8px;"><span>Summe</span><strong>${escapeHtml(euro(totals.grossTotal))}</strong></div>
              ${totals.groups.filter((group) => group.rate > 0).map((group) => `<div style="display:flex;justify-content:space-between;gap:12px;font-size:14px;margin-bottom:8px;"><span>${String(group.rate).replace(".", ",")} % USt. auf EUR ${group.net.toFixed(2).replace(".", ",")}</span><strong>${group.tax.toFixed(2).replace(".", ",")} Euro</strong></div>`).join("")}
              <div style="display:flex;justify-content:space-between;gap:12px;font-size:14px;margin-bottom:10px;"><span>Nettogesamtbetrag</span><strong>${escapeHtml(euro(totals.netTotal))}</strong></div>
              <div style="padding-top:12px;border-top:1px solid ${normalizedSettings.colors.line};display:flex;justify-content:space-between;gap:12px;font-size:20px;font-weight:700;color:${normalizedSettings.colors.primary};"><span>Endbetrag</span><span>${escapeHtml(euro(totals.grossTotal))}</span></div>
            </div>
          </div>
          <div style="margin-top:24px;font-size:14px;line-height:1.6;color:${normalizedSettings.colors.primary};">
            <div><strong>Zahlungsstatus:</strong> ${escapeHtml(paymentStatusLabel(invoice.paymentStatus))}</div>
            <div><strong>Zahlungsart:</strong> ${escapeHtml(invoice.paymentMethod || "-")}</div>
            ${invoice.note ? `<div><strong>Hinweis:</strong> ${escapeHtml(invoice.note)}</div>` : ""}
            <div><strong>Bank:</strong> ${escapeHtml(normalizedSettings.bankName || "-")} · <strong>IBAN:</strong> ${escapeHtml(normalizedSettings.iban || "-")} · <strong>BIC:</strong> ${escapeHtml(normalizedSettings.bic || "-")}</div>
            <div style="margin-top:10px;color:${normalizedSettings.colors.muted};">Beiliegende Einzelbelege sind Bestandteil dieser Rechnung.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function paymentStatusLabel(value) {
  if (value === "paid") return "Bezahlt";
  if (value === "cash-paid") return "Bereits über Kasse bezahlt";
  return "Offen";
}

function invoiceFileName(invoice = {}) {
  const base = safeText(invoice.invoiceNumber || `${invoice.customerName || "rechnung"}-${invoice.invoiceDate || "beleg"}`, 120)
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "rechnung"}.pdf`;
}

function hexToRgb(hex) {
  const value = String(hex || "").replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(value.slice(0, 2), 16) / 255,
    g: parseInt(value.slice(2, 4), 16) / 255,
    b: parseInt(value.slice(4, 6), 16) / 255
  };
}

function dataUrlToBuffer(dataUrl = "") {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

async function loadPdfLib() {
  try {
    return require("pdf-lib");
  } catch (error) {
    throw new Error("pdf-lib fehlt. Bitte einmal die Abhängigkeiten mit npm installieren und danach erneut testen.");
  }
}

async function loadLogoBytes(settings = DEFAULT_INVOICE_SETTINGS) {
  const normalizedSettings = normalizeInvoiceSettings(settings);
  if (normalizedSettings.logoData) {
    const parsed = dataUrlToBuffer(normalizedSettings.logoData);
    if (parsed?.buffer?.length) return parsed;
  }
  const file = [
    path.join(process.cwd(), "la-bowling-print-logo.png"),
    path.join(process.cwd(), "la-bowling-logo.png")
  ].find((candidate) => fs.existsSync(candidate));
  if (!file) return null;
  return {
    mime: "image/png",
    buffer: fs.readFileSync(file)
  };
}

function wrapText(font, text, fontSize, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

function drawWrapped(page, font, text, x, y, width, fontSize, color, lineHeight = fontSize * 1.35) {
  const lines = String(text || "").split("\n").flatMap((part) => wrapText(font, part, fontSize, width));
  let currentY = y;
  lines.forEach((line) => {
    page.drawText(line, { x, y: currentY, size: fontSize, font, color });
    currentY -= lineHeight;
  });
  return currentY;
}

async function buildInvoicePdfBuffer(invoice = {}, settings = DEFAULT_INVOICE_SETTINGS) {
  const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
  const normalizedSettings = normalizeInvoiceSettings(settings);
  const normalizedInvoice = normalizeInvoiceRecord(invoice, normalizedSettings);
  const totals = invoiceTotals(normalizedInvoice);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const width = page.getWidth();
  const height = page.getHeight();
  const margin = 44;
  const primary = rgb(...Object.values(hexToRgb(normalizedSettings.colors.primary)));
  const accent = rgb(...Object.values(hexToRgb(normalizedSettings.colors.accent)));
  const muted = rgb(...Object.values(hexToRgb(normalizedSettings.colors.muted)));
  const line = rgb(...Object.values(hexToRgb(normalizedSettings.colors.line)));
  const highlight = rgb(...Object.values(hexToRgb(normalizedSettings.colors.highlight)));
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await loadLogoBytes(normalizedSettings);
  if (logoBytes?.buffer?.length) {
    try {
      const embedded = logoBytes.mime.includes("png")
        ? await pdfDoc.embedPng(logoBytes.buffer)
        : await pdfDoc.embedJpg(logoBytes.buffer);
      const scale = Math.min(1, 170 / embedded.width);
      page.drawImage(embedded, {
        x: margin,
        y: height - 92,
        width: embedded.width * scale,
        height: embedded.height * scale
      });
    } catch (error) {
      // Ignore invalid logo bytes and continue with text-only header.
    }
  }

  const infoX = width - 220;
  const infoY = height - 58;
  page.drawText("Belegnummer", { x: infoX, y: infoY, size: 9, font: fontRegular, color: muted });
  page.drawText(normalizedInvoice.invoiceNumber || "-", { x: infoX + 92, y: infoY, size: 10, font: fontBold, color: primary });
  page.drawText("Belegdatum", { x: infoX, y: infoY - 18, size: 9, font: fontRegular, color: muted });
  page.drawText(formatDateLabel(normalizedInvoice.invoiceDate), { x: infoX + 92, y: infoY - 18, size: 10, font: fontBold, color: primary });
  page.drawText("Leistungsdatum", { x: infoX, y: infoY - 36, size: 9, font: fontRegular, color: muted });
  page.drawText(formatDateLabel(normalizedInvoice.serviceDate), { x: infoX + 92, y: infoY - 36, size: 10, font: fontBold, color: primary });
  page.drawText("Seite", { x: infoX, y: infoY - 54, size: 9, font: fontRegular, color: muted });
  page.drawText("1 von 1", { x: infoX + 92, y: infoY - 54, size: 10, font: fontBold, color: primary });

  page.drawText(
    `${normalizedSettings.companyName} · ${normalizedSettings.companyAddress.replace(/\n/g, " · ")}`,
    { x: margin, y: height - 112, size: 8.5, font: fontRegular, color: muted }
  );

  let cursorY = height - 170;
  cursorY = drawWrapped(page, fontBold, normalizedInvoice.customerName || "-", margin, cursorY, 250, 12, primary, 16);
  cursorY = drawWrapped(page, fontRegular, normalizedInvoice.customerAddress || "-", margin, cursorY - 2, 250, 10, primary, 14);

  page.drawText(normalizedInvoice.headline || "Rechnung", { x: margin, y: 600, size: 24, font: fontBold, color: primary });
  page.drawText(normalizedInvoice.introText || normalizedSettings.defaultText, {
    x: margin,
    y: 582,
    size: 10,
    font: fontRegular,
    color: muted,
    maxWidth: width - (margin * 2)
  });

  page.drawText("Steuernummer", { x: margin, y: 558, size: 8.5, font: fontRegular, color: muted });
  page.drawText(normalizedSettings.taxNumber || "-", { x: margin + 74, y: 558, size: 9.5, font: fontBold, color: primary });
  page.drawText("USt-ID", { x: margin + 230, y: 558, size: 8.5, font: fontRegular, color: muted });
  page.drawText(normalizedSettings.vatId || "-", { x: margin + 270, y: 558, size: 9.5, font: fontBold, color: primary });

  const tableTop = 530;
  const columns = [
    { key: "pos", label: "Pos", x: margin, width: 24 },
    { key: "article", label: "Art.-Nr.", x: margin + 30, width: 52 },
    { key: "description", label: "Bezeichnung", x: margin + 88, width: 200 },
    { key: "quantity", label: "Menge", x: margin + 294, width: 36 },
    { key: "unit", label: "Einheit", x: margin + 336, width: 48 },
    { key: "unitPrice", label: "Einzelpreis", x: margin + 390, width: 70 },
    { key: "gross", label: "Betrag EUR", x: margin + 466, width: 84 }
  ];

  page.drawRectangle({ x: margin, y: tableTop, width: width - (margin * 2), height: 24, color: highlight });
  page.drawLine({ start: { x: margin, y: tableTop }, end: { x: width - margin, y: tableTop }, thickness: 1, color: line });
  page.drawLine({ start: { x: margin, y: tableTop + 24 }, end: { x: width - margin, y: tableTop + 24 }, thickness: 1, color: line });
  columns.forEach((column) => {
    page.drawText(column.label, { x: column.x + 2, y: tableTop + 8, size: 9, font: fontBold, color: primary });
  });

  let rowY = tableTop - 8;
  normalizedInvoice.positions.forEach((position, index) => {
    const descriptionLines = wrapText(fontRegular, position.description || "-", 9.5, columns[2].width - 4);
    const rowHeight = Math.max(20, descriptionLines.length * 12 + 6);
    page.drawLine({ start: { x: margin, y: rowY }, end: { x: width - margin, y: rowY }, thickness: 0.8, color: line });
    page.drawText(String(index + 1), { x: columns[0].x + 2, y: rowY - 12, size: 9.5, font: fontRegular, color: primary });
    page.drawText(position.articleNumber || "-", { x: columns[1].x + 2, y: rowY - 12, size: 9.5, font: fontRegular, color: primary });
    let descY = rowY - 12;
    descriptionLines.forEach((lineText) => {
      page.drawText(lineText, { x: columns[2].x + 2, y: descY, size: 9.5, font: fontRegular, color: primary });
      descY -= 11.5;
    });
    page.drawText(String(position.quantity || 0).replace(".", ","), { x: columns[3].x + columns[3].width - 4 - fontRegular.widthOfTextAtSize(String(position.quantity || 0).replace(".", ","), 9.5), y: rowY - 12, size: 9.5, font: fontRegular, color: primary });
    page.drawText(position.unit || "-", { x: columns[4].x + 2, y: rowY - 12, size: 9.5, font: fontRegular, color: primary });
    const unitPrice = euro(position.unitPrice || 0);
    const amount = euro(invoiceLineGross(position));
    page.drawText(unitPrice, { x: columns[5].x + columns[5].width - 2 - fontRegular.widthOfTextAtSize(unitPrice, 9.5), y: rowY - 12, size: 9.5, font: fontRegular, color: primary });
    page.drawText(amount, { x: columns[6].x + columns[6].width - 2 - fontRegular.widthOfTextAtSize(amount, 9.5), y: rowY - 12, size: 9.5, font: fontBold, color: primary });
    rowY -= rowHeight;
  });
  page.drawLine({ start: { x: margin, y: rowY }, end: { x: width - margin, y: rowY }, thickness: 0.8, color: line });

  const footerTop = 248;
  const boxWidth = 230;
  const boxHeight = 122;
  const boxX = width - margin - boxWidth;
  const boxY = footerTop;
  page.drawRectangle({ x: boxX, y: boxY, width: boxWidth, height: boxHeight, color: highlight, borderColor: line, borderWidth: 1 });
  let sumY = boxY + boxHeight - 18;
  page.drawText("Summe", { x: boxX + 16, y: sumY, size: 10, font: fontRegular, color: primary });
  page.drawText(euro(totals.grossTotal), { x: boxX + boxWidth - 16 - fontBold.widthOfTextAtSize(euro(totals.grossTotal), 10), y: sumY, size: 10, font: fontBold, color: primary });
  sumY -= 18;
  totals.groups.filter((group) => group.rate > 0).forEach((group) => {
    const label = `${String(group.rate).replace(".", ",")} % USt. auf EUR ${group.net.toFixed(2).replace(".", ",")}`;
    const value = euro(group.tax);
    page.drawText(label, { x: boxX + 16, y: sumY, size: 9, font: fontRegular, color: muted, maxWidth: boxWidth - 86 });
    page.drawText(value, { x: boxX + boxWidth - 16 - fontBold.widthOfTextAtSize(value, 9), y: sumY, size: 9, font: fontBold, color: primary });
    sumY -= 16;
  });
  page.drawText("Nettogesamtbetrag", { x: boxX + 16, y: sumY, size: 9.5, font: fontRegular, color: primary });
  page.drawText(euro(totals.netTotal), { x: boxX + boxWidth - 16 - fontBold.widthOfTextAtSize(euro(totals.netTotal), 9.5), y: sumY, size: 9.5, font: fontBold, color: primary });
  sumY -= 20;
  page.drawLine({ start: { x: boxX + 16, y: sumY + 8 }, end: { x: boxX + boxWidth - 16, y: sumY + 8 }, thickness: 1, color: line });
  page.drawText("Endbetrag", { x: boxX + 16, y: sumY - 2, size: 13, font: fontBold, color: accent });
  page.drawText(euro(totals.grossTotal), { x: boxX + boxWidth - 16 - fontBold.widthOfTextAtSize(euro(totals.grossTotal), 13), y: sumY - 2, size: 13, font: fontBold, color: accent });

  const footerY = 156;
  page.drawText(`Ohne Abzug bis zum ${formatDateLabel(normalizedInvoice.dueDate)}`, { x: margin, y: footerY + 26, size: 10, font: fontRegular, color: primary });
  page.drawText(`Zahlungsstatus: ${paymentStatusLabel(normalizedInvoice.paymentStatus)}`, { x: margin, y: footerY + 12, size: 10, font: fontRegular, color: primary });
  page.drawText(`Zahlungsart: ${normalizedInvoice.paymentMethod || "-"}`, { x: margin, y: footerY - 2, size: 10, font: fontRegular, color: primary });
  const bankText = `IBAN ${normalizedSettings.iban || "-"} · ${normalizedSettings.bankName || "-"} · BIC ${normalizedSettings.bic || "-"}`;
  page.drawText(bankText, { x: margin, y: footerY - 18, size: 9.5, font: fontRegular, color: muted, maxWidth: width - (margin * 2) });
  page.drawText("Beiliegende Einzelbelege sind Bestandteil dieser Rechnung.", { x: margin, y: footerY - 34, size: 9.5, font: fontRegular, color: muted });

  if (normalizedInvoice.note) {
    page.drawText("Hinweis", { x: margin, y: 118, size: 9.5, font: fontBold, color: primary });
    drawWrapped(page, fontRegular, normalizedInvoice.note, margin, 104, width - (margin * 2), 9.5, muted, 12);
  }

  const bytes = await pdfDoc.save();
  return {
    buffer: Buffer.from(bytes),
    fileName: invoiceFileName(normalizedInvoice)
  };
}

function finalizeInvoiceRecord(invoice = {}, invoices = [], settings = DEFAULT_INVOICE_SETTINGS, actor = "") {
  const normalized = normalizeInvoiceRecord(invoice, settings);
  const finalized = {
    ...normalized,
    invoiceNumber: normalized.invoiceNumber || nextInvoiceNumber(invoices, normalized.invoiceDate),
    status: "finalized",
    finalizedAt: normalized.finalizedAt || nowIso(),
    updatedAt: nowIso(),
    auditLog: [...normalized.auditLog, createAuditEntry("finalized", actor, "Rechnung finalisiert.")]
  };
  return finalized;
}

function archiveInvoiceRecord(invoice = {}, actor = "") {
  const normalized = normalizeInvoiceRecord(invoice);
  return {
    ...normalized,
    status: "archived",
    archivedAt: nowIso(),
    updatedAt: nowIso(),
    auditLog: [...normalized.auditLog, createAuditEntry("archived", actor, "Rechnung archiviert.")]
  };
}

function createFollowUpInvoice(invoice = {}, type = "correction", actor = "", settings = DEFAULT_INVOICE_SETTINGS) {
  const normalized = normalizeInvoiceRecord(invoice, settings);
  const multiplier = type === "storno" ? -1 : 1;
  return normalizeInvoiceRecord({
    type,
    sourceDate: normalized.sourceDate,
    sourceCustomerId: normalized.sourceCustomerId,
    customerName: normalized.customerName,
    customerContact: normalized.customerContact,
    customerEmail: normalized.customerEmail,
    customerPhone: normalized.customerPhone,
    customerAddress: normalized.customerAddress,
    invoiceDate: nowIso().slice(0, 10),
    serviceDate: normalized.serviceDate,
    dueDate: addDays(nowIso().slice(0, 10), normalizeInvoiceSettings(settings).paymentDays),
    paymentMethod: normalized.paymentMethod,
    paymentStatus: "open",
    headline: type === "storno" ? "Stornorechnung" : "Korrekturrechnung",
    introText: type === "storno"
      ? `Stornorechnung zu ${normalized.invoiceNumber || "einer bestehenden Rechnung"}`
      : `Korrekturrechnung zu ${normalized.invoiceNumber || "einer bestehenden Rechnung"}`,
    note: normalized.note,
    positions: normalized.positions.map((position) => ({
      ...position,
      id: `${position.id}-copy`,
      quantity: Math.max(0, moneyNumber(position.quantity) * multiplier)
    })),
    attachments: normalized.attachments,
    auditLog: [createAuditEntry(type === "storno" ? "storno-created" : "correction-created", actor, `Folgerechnung zu ${normalized.invoiceNumber || "ohne Nummer"} erstellt.`)]
  }, settings);
}

async function attachmentToMailFile(attachment = {}) {
  const normalized = normalizeInvoiceAttachment(attachment);
  if (normalized.data) {
    const parsed = dataUrlToBuffer(normalized.data);
    if (parsed?.buffer?.length) {
      return {
        filename: normalized.name || `${normalized.label || "Anlage"}.bin`,
        content: parsed.buffer,
        contentType: parsed.mime || normalized.mime || undefined
      };
    }
  }
  if (normalized.path && fs.existsSync(normalized.path)) {
    return {
      filename: normalized.name || path.basename(normalized.path),
      content: fs.readFileSync(normalized.path),
      contentType: normalized.mime || undefined
    };
  }
  return null;
}

async function sendInvoiceEmail(invoice = {}, settings = DEFAULT_INVOICE_SETTINGS) {
  const normalized = normalizeInvoiceRecord(invoice, settings);
  const smtpHost = safeText(process.env.SMTP_HOST, 120);
  const smtpUser = safeText(process.env.SMTP_USER, 180);
  const smtpPass = safeText(process.env.SMTP_PASS, 240);
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;
  if (!normalized.customerEmail) return { ok: false, error: "Rechnungsmail-Adresse beim Kunden fehlt." };
  if (!smtpHost || !smtpUser || !smtpPass) {
    return { ok: false, error: "SMTP fehlt. Bitte SMTP_HOST, SMTP_USER und SMTP_PASS setzen." };
  }
  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch (error) {
    return { ok: false, error: "nodemailer fehlt im Build." };
  }
  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: Number.isFinite(smtpPort) ? smtpPort : 587,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  const attachments = [];
  if (normalized.pdfData) {
    const pdf = dataUrlToBuffer(normalized.pdfData);
    if (pdf?.buffer?.length) {
      attachments.push({
        filename: normalized.pdfFileName || invoiceFileName(normalized),
        content: pdf.buffer,
        contentType: "application/pdf"
      });
    }
  } else {
    const pdf = await buildInvoicePdfBuffer(normalized, settings);
    attachments.push({
      filename: pdf.fileName,
      content: pdf.buffer,
      contentType: "application/pdf"
    });
  }
  for (const attachment of normalized.attachments || []) {
    const file = await attachmentToMailFile(attachment);
    if (file) attachments.push(file);
  }
  try {
    const info = await transport.sendMail({
      from: safeText(process.env.EMAIL_FROM || smtpUser, 180),
      to: normalized.customerEmail,
      subject: normalized.invoiceNumber ? `LA-Bowling Rechnung ${normalized.invoiceNumber}` : "LA-Bowling Rechnung",
      text: invoiceMailPreviewText(normalized),
      html: buildInvoiceMailHtml(normalized, settings),
      attachments
    });
    return { ok: true, messageId: info.messageId, accepted: info.accepted || [] };
  } catch (error) {
    return { ok: false, error: error?.message || String(error) };
  }
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
  DEFAULT_INVOICE_SETTINGS,
  archiveInvoiceRecord,
  buildInvoiceMailHtml,
  buildInvoicePdfBuffer,
  createBlankInvoiceDraft,
  createFollowUpInvoice,
  createInvoiceDraftFromCustomer,
  createAuditEntry,
  dataUrlToBuffer,
  finalizeInvoiceRecord,
  formatDateLabel,
  invoiceFileName,
  invoiceLineGross,
  invoiceLineNet,
  invoiceLineTax,
  invoiceMailPreviewText,
  invoiceTotals,
  nextInvoiceNumber,
  normalizeInvoiceRecord,
  normalizeInvoiceSettings,
  normalizeInvoices,
  paymentStatusLabel,
  positionsFromCustomer,
  sendInvoiceEmail
};

