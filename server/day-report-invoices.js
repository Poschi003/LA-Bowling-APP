const { invoiceTotals, normalizeInvoices } = require("./invoice-engine");

function isTransferInvoice(invoice = {}) {
  const method = String(invoice.paymentMethod || "").trim().toLowerCase();
  return !method || method === "überweisung" || method === "ueberweisung";
}

function reportItemFromInvoice(invoice = {}) {
  const amount = invoiceTotals(invoice).grossTotal;
  return {
    id: `generated-${invoice.id}`,
    name: String(invoice.customerName || "Rechnungskunde").trim(),
    amount: amount ? amount.toFixed(2) : "",
    bowlingAmount: "",
    gastroAmount: "",
    gastroDrinksAmount: "",
    gastroFoodAmount: "",
    gastroOtherAmount: "",
    note: invoice.invoiceNumber ? `Rechnung ${invoice.invoiceNumber}` : "",
    address: String(invoice.customerAddress || "").trim(),
    contact: String(invoice.customerContact || "").trim(),
    phone: String(invoice.customerPhone || "").trim(),
    email: String(invoice.customerEmail || "").trim(),
    paymentMethod: "Überweisung",
    tip: "",
    pentacodeEntered: true,
    invoiceReady: true,
    invoiceReadyAt: invoice.finalizedAt || invoice.updatedAt || new Date().toISOString(),
    invoiceDone: true,
    invoiceDoneAt: invoice.finalizedAt || invoice.updatedAt || new Date().toISOString(),
    invoiceGeneratedId: invoice.id,
    createdAt: invoice.createdAt || new Date().toISOString(),
    area: "rechnung"
  };
}

function syncInvoiceToDayReport(appData, invoice) {
  if (!invoice || invoice.status === "draft" || !isTransferInvoice(invoice) || !invoice.serviceDate) return false;
  appData.dayReports ||= {};
  const report = appData.dayReports[invoice.serviceDate] ||= {};
  const customers = Array.isArray(report.invoiceCustomers) ? report.invoiceCustomers : [];
  const generated = reportItemFromInvoice(invoice);
  const index = customers.findIndex((item) => String(item.invoiceGeneratedId || "") === String(invoice.id));
  if (index >= 0) {
    const current = customers[index];
    const next = { ...current, ...generated, id: current.id || generated.id };
    const keys = Object.keys(generated);
    if (keys.every((key) => String(current[key] ?? "") === String(next[key] ?? ""))) return false;
    customers[index] = next;
  } else customers.push(generated);
  report.invoiceCustomers = customers;
  report.updatedAt = new Date().toISOString();
  return true;
}

function syncInvoicesForDate(appData, date) {
  let changed = false;
  normalizeInvoices(appData.invoices || [], appData.invoiceSettings || {})
    .filter((invoice) => invoice.serviceDate === date)
    .forEach((invoice) => {
      if (syncInvoiceToDayReport(appData, invoice)) changed = true;
    });
  return changed;
}

module.exports = { syncInvoiceToDayReport, syncInvoicesForDate };
