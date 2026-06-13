const { handleError, publicSettings, readAppData, readJson, sendJson, signToken, uploadReceiptDataUrl, verifyToken, writeAppData } = require("./_data");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    const action = String(body.action || "").trim();
    if (action === "login") return login(body, res);
    if (action === "admin-open-correction") return adminOpenCorrection(body, res);
    if (action === "admin-close-correction") return adminCloseCorrection(body, res);
    if (action === "add-task-template" || action === "delete-task-template") return saveTaskTemplate(body, res);
    const session = verifyToken(body.terminalToken, "terminal");
    if (!session?.terminal) return sendJson(res, 401, { error: "Terminal-Code bitte erneut eingeben." });
    if (session.correctionDate && cleanDate(body.date) !== session.correctionDate) return sendJson(res, 403, { error: "Korrekturmodus ist nur für das freigegebene Datum gültig." });
    if (!session.correctionDate && await reportIsInCorrection(body)) return sendJson(res, 423, { error: "Dieser Tagesbericht ist im Admin-Korrekturmodus geöffnet." });
    if (action === "load") return load(body, res, session);
    if (action === "punch") return punch(body, res);
    if (action === "adjust-time") return adjustTime(body, res);
    if (action === "add-employee") return addEmployee(body, res);
    if (action === "complete-task") return completeTask(body, res);
    if (action === "confirm-toilet" || action === "toilet-check") return confirmToilet(body, res);
    if (action === "confirm-reminder") return confirmReminder(body, res);
    if (action === "save-day-meta") return saveDayMeta(body, res);
    if (action === "add-handover") return addHandover(body, res);
    if (action === "save-report") return saveReport(body, res);
    if (action === "close-report") return closeReport(body, res);
    return sendJson(res, 400, { error: "Unbekannte Aktion." });
  } catch (error) {
    handleError(res, error);
  }
};

async function login(body, res) {
  const appData = await readAppData();
  if (!verifyTerminalCode(appData.settings, body.code)) return sendJson(res, 401, { error: "Code stimmt nicht." });
  sendJson(res, 200, { ok: true, token: signToken({ type: "terminal", terminal: true }), ...terminalPayload(appData, activeTerminalDate(appData, cleanDate(body.date))) });
}

async function adminOpenCorrection(body, res) {
  const session = verifyToken(body.adminToken || "", "admin");
  if (!session) return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  const date = cleanDate(body.date);
  const reason = cleanText(body.reason, 800);
  if (!reason) return sendJson(res, 400, { error: "Bitte Grund der Korrektur eintragen." });
  const appData = await readAppData();
  appData.dayReports ||= {};
  const existing = appData.dayReports[date] || {};
  const correctionLog = Array.isArray(existing.correctionLog) ? existing.correctionLog : [];
  appData.dayReports[date] = {
    ...existing,
    closed: false,
    closedAt: "",
    correctionOpen: true,
    correctionReason: reason,
    correctionOpenedAt: new Date().toISOString(),
    correctionLog: [...correctionLog, { action: "opened", reason, at: new Date().toISOString() }],
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  sendJson(res, 200, {
    ok: true,
    token: signToken({ type: "terminal", terminal: true, correction: true, correctionDate: date }),
    correctionMode: true,
    message: "Tagesbericht im Korrekturmodus geöffnet.",
    ...terminalPayload(appData, date)
  });
}

async function adminCloseCorrection(body, res) {
  const session = verifyToken(body.adminToken || "", "admin");
  if (!session) return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  const date = cleanDate(body.date);
  const appData = await readAppData();
  appData.dayReports ||= {};
  const existing = appData.dayReports[date] || {};
  const correctionLog = Array.isArray(existing.correctionLog) ? existing.correctionLog : [];
  appData.dayReports[date] = {
    ...existing,
    closed: true,
    closedAt: new Date().toISOString(),
    correctionOpen: false,
    correctionClosedAt: new Date().toISOString(),
    correctionLog: [...correctionLog, { action: "closed", at: new Date().toISOString() }],
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Tagesbericht wieder abgeschlossen.", ...terminalPayload(appData, date) });
}

async function load(body, res, session = {}) {
  const appData = await readAppData();
  const date = session.correctionDate || activeTerminalDate(appData, cleanDate(body.date));
  sendJson(res, 200, terminalPayload(appData, date));
}

async function saveTaskTemplate(body, res) {
  const session = verifyToken(body.adminToken || "", "admin");
  if (!session) return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  const appData = await readAppData();
  if (body.action === "add-task-template") {
    const task = cleanTaskTemplate(body.task || {});
    if (!task.title) return sendJson(res, 400, { error: "Aufgabe fehlt." });
    appData.taskTemplates ||= [];
    appData.taskTemplates.unshift(task);
    await writeAppData(appData);
    return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
  }
  const id = String(body.id || "");
  appData.taskTemplates = (appData.taskTemplates || []).filter((task) => task.id !== id);
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
}

async function punch(body, res) {
  const appData = await readAppData(), employee = String(body.employee || "").trim(), punchType = String(body.punchType || "").trim(), date = cleanDate(body.date);
  if (!employee || !["start", "end"].includes(punchType)) return sendJson(res, 400, { error: "Mitarbeiter oder Aktion fehlt." });
  if (!(appData.settings.employees || []).includes(employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const month = date.slice(0, 7), time = roundToQuarter(new Date());
  appData.timesheets ||= {}; appData.timesheets[month] ||= {}; appData.timesheets[month][employee] ||= {};
  appData.timesheets[month][employee][date] = { ...(appData.timesheets[month][employee][date] || {}), [punchType === "start" ? "from" : "to"]: time, updatedAt: new Date().toISOString(), source: "terminal" };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `${employee}: ${punchType === "start" ? "Beginn" : "Ende"} ${time}`, ...terminalPayload(appData, date) });
}

async function adjustTime(body, res) {
  const appData = await readAppData(), employee = String(body.employee || "").trim(), date = cleanDate(body.date), month = date.slice(0, 7);
  if (!(appData.settings.employees || []).includes(employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.timesheets ||= {}; appData.timesheets[month] ||= {}; appData.timesheets[month][employee] ||= {};
  appData.timesheets[month][employee][date] = { ...(appData.timesheets[month][employee][date] || {}), from: cleanTime(body.from), to: cleanTime(body.to), updatedAt: new Date().toISOString(), source: "terminal-correction" };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `${employee}: Zeiten korrigiert.`, ...terminalPayload(appData, date) });
}

async function addEmployee(body, res) {
  const appData = await readAppData(), employee = String(body.employee || "").trim(), date = cleanDate(body.date);
  if (!(appData.settings.employees || []).includes(employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.dayReports ||= {}; const report = appData.dayReports[date] || {}, role = String(body.role || "Zusatz").trim().slice(0, 80);
  const extraEmployees = (report.extraEmployees || []).map((item) => typeof item === "string" ? { employee: item, role: "Zusatz" } : item).filter((item) => item?.employee !== employee);
  appData.dayReports[date] = { ...report, extraEmployees: [...extraEmployees, { employee, role }], updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `${employee} wurde hinzugefuegt.`, ...terminalPayload(appData, date) });
}

async function saveReport(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen und kann nicht mehr geaendert werden." });
  appData.dayReports ||= {};
  appData.dayReports[date] = { ...existing, ecTotal: cleanMoney(body.ecTotal), barBowling: cleanMoney(body.barBowling), barGastro: cleanMoney(body.barGastro), invoiceCustomers: await cleanReportItems(body.invoiceCustomers, "invoice", date), expenses: await cleanReportItems(body.expenses, "expense", date), documents: await cleanReportDocuments(body.documents || existing.documents, date), notes: String(body.notes || "").trim().slice(0, 2000), openingHours: cleanText(body.openingHours || existing.openingHours, 80), shiftLeader: cleanText(body.shiftLeader || existing.shiftLeader, 160), handovers: cleanHandovers(body.handovers || existing.handovers), taskCompletions: cleanTaskCompletions(body.taskCompletions || existing.taskCompletions), toiletChecks: cleanToiletChecks(body.toiletChecks || existing.toiletChecks), reminderChecks: cleanToiletChecks(body.reminderChecks || existing.reminderChecks), updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, ...terminalPayload(appData, date) });
}

async function completeTask(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), id = String(body.id || "");
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  if (!id) return sendJson(res, 400, { error: "Aufgabe fehlt." });
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const taskCompletions = { ...(report.taskCompletions || {}) };
  if (body.done) {
    taskCompletions[id] = { done: true, doneAt: new Date().toISOString() };
  } else {
    delete taskCompletions[id];
  }
  appData.dayReports[date] = { ...report, taskCompletions, updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, ...terminalPayload(appData, date) });
}

async function confirmToilet(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), checkKey = String(body.checkKey || "");
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  if (!checkKey) return sendJson(res, 400, { error: "Kontrolle fehlt." });
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const toiletChecks = Array.isArray(report.toiletChecks) ? report.toiletChecks : [];
  if (!toiletChecks.some((item) => item.checkKey === checkKey)) {
    toiletChecks.push({ checkKey, checkedAt: new Date().toISOString() });
  }
  appData.dayReports[date] = { ...report, toiletChecks, updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Toiletten-Kontrolle quittiert.", ...terminalPayload(appData, date) });
}

async function confirmReminder(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), checkKey = String(body.checkKey || "");
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  if (!checkKey) return sendJson(res, 400, { error: "Erinnerung fehlt." });
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const reminderChecks = Array.isArray(report.reminderChecks) ? report.reminderChecks : [];
  if (!reminderChecks.some((item) => item.checkKey === checkKey)) {
    reminderChecks.push({ checkKey, text: cleanText(body.text, 240), checkedAt: new Date().toISOString() });
  }
  appData.dayReports[date] = { ...report, reminderChecks, updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Erinnerung quittiert.", ...terminalPayload(appData, date) });
}

async function saveDayMeta(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.dayReports ||= {};
  appData.dayReports[date] = { ...existing, openingHours: cleanText(body.openingHours, 80), shiftLeader: cleanText(body.shiftLeader, 160), updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Tageskopf gespeichert.", ...terminalPayload(appData, date) });
}

async function addHandover(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const item = cleanHandover(body.handover || body);
  if (!item.from || !item.to || !item.note) return sendJson(res, 400, { error: "Bitte Von, An und Ãœbergabe-Notiz ausfÃ¼llen." });
  appData.dayReports ||= {};
  appData.dayReports[date] = { ...existing, handovers: [...cleanHandovers(existing.handovers), item], shiftLeader: item.to, updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Ãœbergabe gespeichert.", ...terminalPayload(appData, date) });
}

async function closeReport(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), existing = appData.dayReports?.[date] || {};
  const correctionLog = Array.isArray(existing.correctionLog) ? existing.correctionLog : [];
  appData.dayReports ||= {}; appData.dayReports[date] = {
    ...existing,
    closed: true,
    closedAt: new Date().toISOString(),
    correctionOpen: false,
    correctionClosedAt: existing.correctionOpen ? new Date().toISOString() : existing.correctionClosedAt,
    correctionLog: existing.correctionOpen ? [...correctionLog, { action: "closed", at: new Date().toISOString() }] : correctionLog,
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Tagesbericht abgeschlossen.", ...terminalPayload(appData, date) });
}

function terminalPayload(appData, requestedDate) {
  const date = cleanDate(requestedDate), month = date.slice(0, 7), schedule = appData.schedules?.[month] || {};
  const report = defaultReport(appData.dayReports?.[date]);
  return { date, settings: publicSettings(appData.settings), entries: appData.timesheets?.[month] || {}, schedule: schedule.days?.[date] || {}, report, correctionMode: Boolean(report.correctionOpen), tasks: tasksForDate(appData, date), reminders: appData.reminderTemplates || [] };
}

function activeTerminalDate(appData, requestedDate) {
  const today = localDate(new Date());
  const requested = cleanDate(requestedDate);
  const requestedReport = appData.dayReports?.[requested];
  if (requestedReport && !requestedReport.closed && !requestedReport.correctionOpen) return requested;
  const openDates = Object.entries(appData.dayReports || {})
    .filter(([dateKey, report]) => dateKey <= today && report && typeof report === "object" && !report.closed && !report.correctionOpen && reportHasActivity(report))
    .map(([dateKey]) => dateKey)
    .sort();
  return openDates.at(-1) || today;
}

async function reportIsInCorrection(body) {
  const date = cleanDate(body.date);
  const appData = await readAppData();
  return Boolean(appData.dayReports?.[date]?.correctionOpen);
}

function reportHasActivity(report = {}) {
  return Boolean(
    report.updatedAt ||
    report.openingHours ||
    report.shiftLeader ||
    report.notes ||
    (report.invoiceCustomers || []).length ||
    (report.expenses || []).length ||
    (report.handovers || []).length ||
    Object.keys(report.taskCompletions || {}).length ||
    (report.toiletChecks || []).length ||
    (report.reminderChecks || []).length
  );
}

function defaultReport(report = {}) {
  return { ecTotal: "", barBowling: "", barGastro: "", invoiceCustomers: [], expenses: [], documents: {}, notes: "", extraEmployees: [], handovers: [], taskCompletions: {}, toiletChecks: [], reminderChecks: [], ...report };
}

function tasksForDate(appData, dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = date.getDay();
  const dayOfMonth = date.getDate();
  return (appData.taskTemplates || []).filter((task) => {
    if (task.frequency === "daily") return true;
    if (task.frequency === "weekly") return (task.weekdays || []).map(Number).includes(weekday);
    if (task.frequency === "monthly") return Number(task.dayOfMonth || 1) === dayOfMonth;
    if (task.frequency === "interval") return intervalAppliesToDate(task, dateKey);
    if (task.frequency === "once" || task.frequency === "next-day") return task.date === dateKey;
    return false;
  });
}

function intervalAppliesToDate(task, dateKey) {
  const startKey = task.startDate || task.date;
  if (!startKey || dateKey < startKey) return false;
  if (task.endDate && dateKey > task.endDate) return false;
  const start = new Date(`${startKey}T12:00:00`);
  const date = new Date(`${dateKey}T12:00:00`);
  const diffDays = Math.round((date - start) / 86400000);
  const interval = Math.max(1, Number(task.intervalDays || 1));
  return diffDays >= 0 && diffDays % interval === 0;
}

function cleanTaskCompletions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([id, item]) => [String(id), { done: Boolean(item?.done), doneAt: String(item?.doneAt || "") }]));
}

function cleanToiletChecks(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 40).map((item) => ({
    checkKey: String(item.checkKey || "").slice(0, 40),
    checkedAt: String(item.checkedAt || new Date().toISOString()).slice(0, 40)
  })).filter((item) => item.checkKey);
}

function cleanHandover(item = {}) {
  return {
    id: cleanText(item.id || `handover-${Date.now()}-${Math.random().toString(16).slice(2)}`, 80),
    from: cleanText(item.from, 160),
    to: cleanText(item.to, 160),
    time: cleanTime(item.time) || cleanText(item.time, 20),
    note: cleanText(item.note, 1000),
    createdAt: cleanText(item.createdAt || new Date().toISOString(), 40)
  };
}

function cleanHandovers(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).map(cleanHandover).filter((item) => item.from || item.to || item.note);
}

function cleanTaskTemplate(task) {
  const frequency = ["daily", "weekly", "monthly", "interval", "once", "next-day"].includes(task.frequency) ? task.frequency : "daily";
  const category = ["preparation", "running", "closing"].includes(task.category) ? task.category : "running";
  return {
    id: String(task.id || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: cleanText(task.title, 180),
    note: cleanText(task.note, 600),
    frequency,
    category,
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(task.date || "")) ? String(task.date) : "",
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.startDate || "")) ? String(task.startDate) : "",
    endDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.endDate || "")) ? String(task.endDate) : "",
    intervalDays: Math.max(1, Math.min(365, Number(task.intervalDays || 1))),
    weekdays: Array.isArray(task.weekdays) ? task.weekdays.map(Number).filter((day) => day >= 0 && day <= 6) : [],
    dayOfMonth: Math.min(31, Math.max(1, Number(task.dayOfMonth || 1))),
    createdAt: cleanText(task.createdAt || new Date().toISOString(), 40)
  };
}

function localDate(date) { const p = berlinParts(date); return `${p.year}-${p.month}-${p.day}`; }
function cleanDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : localDate(new Date()); }
function cleanText(value, max) { return String(value || "").trim().slice(0, max); }
function roundToQuarter(date) { const p = berlinParts(date), m = Number(p.hour) * 60 + Number(p.minute), r = Math.round(m / 15) * 15; return `${String(Math.floor(r / 60) % 24).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`; }
function berlinParts(date) { const parts = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date); return Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value])); }
function cleanMoney(value) { const n = Number(String(value || "").replace(",", ".").trim()); return Number.isFinite(n) && String(value || "").trim() ? n.toFixed(2) : ""; }
function cleanTime(value) { const text = String(value || "").trim(); return /^\d{2}:\d{2}$/.test(text) ? text : ""; }
function cleanReceiptData(value) { const text = String(value || ""); return text.startsWith("data:") && text.length <= 700000 ? text : ""; }
function cleanReceiptPath(value) { return String(value || "").trim().replace(/^\/+/, "").slice(0, 300); }
function cleanReceiptUrl(value) { const text = String(value || "").trim(); return text.startsWith("/api/receipt?") ? text.slice(0, 500) : ""; }
async function applyReceiptUpload(item, field, date, prefix) {
  const dataKey = `${field}Data`, nameKey = `${field}Name`, pathKey = `${field}Path`, urlKey = `${field}Url`;
  const data = String(item[dataKey] || "");
  const existingPath = cleanReceiptPath(item[pathKey]);
  if (data.startsWith("data:")) {
    const upload = await uploadReceiptDataUrl(data, { date, filename: item[nameKey], prefix });
    if (upload) {
      item[nameKey] = upload.receiptName;
      item[pathKey] = upload.receiptPath;
      item[urlKey] = upload.receiptUrl;
      item[dataKey] = "";
      return;
    }
  }
  item[pathKey] = existingPath;
  item[urlKey] = cleanReceiptUrl(item[urlKey]) || (existingPath ? `/api/receipt?path=${encodeURIComponent(existingPath)}&name=${encodeURIComponent(item[nameKey] || "beleg")}` : "");
  item[dataKey] = cleanReceiptData(data);
}
function cleanReportDocument(item = {}) {
  return {
    name: cleanText(item.name, 180),
    data: String(item.data || ""),
    path: cleanReceiptPath(item.path),
    url: cleanReceiptUrl(item.url)
  };
}
async function cleanReportDocumentUpload(raw, date, key) {
  const item = cleanReportDocument(raw);
  if (item.data.startsWith("data:")) {
    const upload = await uploadReceiptDataUrl(item.data, { date, filename: item.name || `${key}.pdf`, prefix: `abschluss-${key}` });
    if (upload) {
      return { name: upload.receiptName, path: upload.receiptPath, url: upload.receiptUrl, data: "" };
    }
  }
  if (item.path && !item.url) {
    item.url = `/api/receipt?path=${encodeURIComponent(item.path)}&name=${encodeURIComponent(item.name || key)}`;
  }
  item.data = cleanReceiptData(item.data);
  return item;
}
async function cleanReportDocuments(value = {}, date) {
  return {
    penta: await cleanReportDocumentUpload(value.penta || {}, date, "penta"),
    handwriting: await cleanReportDocumentUpload(value.handwriting || {}, date, "handschrift")
  };
}
function totalInvoiceAmount(item) { const b = Number(cleanMoney(item.bowlingAmount ?? (item.area === "bowling" ? item.amount : "")) || 0), g = Number(cleanMoney(item.gastroAmount ?? (item.area === "gastro" ? item.amount : "")) || 0); return b + g || item.amount || ""; }
async function cleanReportItems(items, type, date) {
  if (!Array.isArray(items)) return [];
  const cleaned = await Promise.all(items.slice(0, 20).map(async (raw) => {
    const item = {
      id: String(raw.id || crypto.randomUUID()),
      name: String(raw.name || "").trim().slice(0, 160),
      amount: cleanMoney(totalInvoiceAmount(raw)),
      bowlingAmount: cleanMoney(raw.bowlingAmount ?? (raw.area === "bowling" ? raw.amount : "")),
      gastroAmount: cleanMoney(raw.gastroAmount ?? (raw.area === "gastro" ? raw.amount : "")),
      note: String(raw.note || "").trim().slice(0, 600),
      receiptName: String(raw.receiptName || "").trim().slice(0, 180),
      receiptData: String(raw.receiptData || ""),
      receiptPath: cleanReceiptPath(raw.receiptPath),
      receiptUrl: cleanReceiptUrl(raw.receiptUrl),
      bowlingReceiptName: String(raw.bowlingReceiptName || "").trim().slice(0, 180),
      bowlingReceiptData: String(raw.bowlingReceiptData || ""),
      bowlingReceiptPath: cleanReceiptPath(raw.bowlingReceiptPath),
      bowlingReceiptUrl: cleanReceiptUrl(raw.bowlingReceiptUrl),
      gastroReceiptName: String(raw.gastroReceiptName || "").trim().slice(0, 180),
      gastroReceiptData: String(raw.gastroReceiptData || ""),
      gastroReceiptPath: cleanReceiptPath(raw.gastroReceiptPath),
      gastroReceiptUrl: cleanReceiptUrl(raw.gastroReceiptUrl),
      address: String(raw.address || "").trim().slice(0, 600),
      contact: String(raw.contact || "").trim().slice(0, 160),
      phone: String(raw.phone || "").trim().slice(0, 80),
      tip: String(raw.tip || "").trim().slice(0, 160),
      email: String(raw.email || "").trim().slice(0, 180),
      category: String(raw.category || "").trim().slice(0, 120),
      createdAt: cleanText(raw.createdAt || new Date().toISOString(), 80),
      invoiceReady: raw.invoiceReady === true || raw.invoiceReady === "true",
      invoiceReadyAt: cleanText(raw.invoiceReadyAt, 80),
      invoiceDone: raw.invoiceDone === true || raw.invoiceDone === "true",
      invoiceDoneAt: cleanText(raw.invoiceDoneAt, 80),
      area: type === "invoice" ? "rechnung" : raw.area
    };
    await applyReceiptUpload(item, "receipt", date, `${type}-${item.id}`);
    await applyReceiptUpload(item, "bowlingReceipt", date, `bowling-${item.id}`);
    await applyReceiptUpload(item, "gastroReceipt", date, `gastro-${item.id}`);
    return item;
  }));
  return cleaned.filter((i) => i.name || i.amount || i.note || i.receiptData || i.receiptPath || i.bowlingReceiptData || i.bowlingReceiptPath || i.gastroReceiptData || i.gastroReceiptPath || i.address || i.contact || i.phone || i.tip || i.email);
}
function verifyTerminalCode(settings, code) { return verifyPin(code, settings?.terminalCodeHash || settings?.terminalCode || process.env.DEFAULT_TERMINAL_CODE || "2468"); }
function verifyPin(pin, stored) { if (!pin || !stored) return false; if (!String(stored).startsWith("pbkdf2_sha256$")) return String(pin) === String(stored); const [, iterations, salt, digest] = String(stored).split("$"), test = crypto.pbkdf2Sync(String(pin), salt, Number(iterations), 32, "sha256").toString("hex"); return crypto.timingSafeEqual(Buffer.from(test, "hex"), Buffer.from(digest, "hex")); }

