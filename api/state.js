const fs = require("fs");
const path = require("path");
const {
  applyPushTemplate,
  collectEmployeeTimesheets,
  defaultData,
  handleError,
  publicSettings,
  pushPublicKey,
  pushSubscriptionActive,
  readAppData,
  readJson,
  sanitizeSchedules,
  sendJson,
  sendPushToEmployees,
  syncReportTipsToTimesheets,
  upsertPushSubscription,
  verifyToken,
  writeAppData
} = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET" && req.query.asset) return serveAsset(req, res);
    if (req.method === "POST") return handlePost(req, res);
    if (req.method !== "GET") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const month = req.query.month;
    const adminSession = verifyToken(req.query.adminToken, "admin");
    const employeeSession = verifyToken(req.query.employeeToken, "employee");
    const appData = await readAppData();
    const didCleanup = cleanupOldSchedules(appData);
    const didTipSync = syncReportTipsToTimesheets(appData);
    if (didCleanup || didTipSync) await writeAppData(appData);
    const schedule = appData.schedules[month] || { month, published: false, days: {} };
    const nextMonth = req.query.nextMonth;
    const availabilityMonth = cleanMonth(req.query.availabilityMonth) || cleanMonth(appData.settings.availabilityTargetMonth) || cleanMonth(nextMonth) || month;
    const missingAvailability = availabilityMissing(appData, availabilityMonth);
    const availabilityChangeRequests = (appData.availabilityChangeRequests || []).filter((request) => !availabilityMonth || request.month === availabilityMonth);
    const weather = await fetchWeather();
    const assignmentDates = todayAndTomorrowDates();

    if (adminSession) {
      return sendJson(res, 200, {
        settings: {
          ...publicSettings(appData.settings),
          invoiceNotificationTo: appData.settings.invoiceNotificationTo || ""
        },
        availability: appData.availability[availabilityMonth] || {},
        schedule,
        schedules: appData.schedules || {},
        assignmentTimes: assignmentTimesForDates(appData, assignmentDates),
        assignmentSchedules: assignmentSchedulesForDates(appData, assignmentDates),
        timesheets: appData.timesheets?.[month] || {},
        dayReports: appData.dayReports || {},
        messages: appData.messages || [],
        terminalMessages: appData.terminalMessages || [],
        customerDirectory: appData.customerDirectory || [],
        offers: normalizeOffers(appData.offers || []),
        tablePlanConfig: appData.tablePlanConfig || {},
        pushPublicKey: pushPublicKey(),
        weather,
        taskTemplates: appData.taskTemplates || [],
        cleaningTemplates: appData.cleaningTemplates || [],
        reminderTemplates: appData.reminderTemplates || [],
        missingAvailability,
        availabilityChangeRequests: availabilityChangeRequests.filter((request) => request.status === "open")
      });
    }

    if (employeeSession?.employee) {
      const publicSchedule = publicScheduleFor(schedule);
      const isChef = employeeIsChef(appData.settings, employeeSession.employee);
      return sendJson(res, 200, {
        settings: publicSettings(appData.settings),
        availability: {
          [employeeSession.employee]: appData.availability[availabilityMonth]?.[employeeSession.employee] || {}
        },
        schedule: publicSchedule,
        schedules: sanitizeSchedules(appData.schedules),
        assignmentTimes: assignmentTimesForDates(appData, assignmentDates),
        assignmentSchedules: assignmentSchedulesForDates(appData, assignmentDates),
        timesheets: isChef
          ? (appData.timesheets?.[month] || {})
          : { [employeeSession.employee]: collectEmployeeTimesheets(appData, month, employeeSession.employee) },
        dayReports: isChef ? (appData.dayReports || {}) : {},
        messages: messagesForEmployee(appData.messages || [], appData.settings, employeeSession.employee),
        pushPublicKey: pushPublicKey(),
        pushSubscriptionActive: pushSubscriptionActive(appData, employeeSession.employee),
        isChef,
        weather,
        missingAvailability,
        availabilityChangeRequests: availabilityChangeRequests.filter((request) => request.employee === employeeSession.employee)
      });
    }

    const publicSchedule = publicScheduleFor(schedule);
    sendJson(res, 200, {
      settings: publicSettings(appData.settings),
      availability: {},
      schedule: publicSchedule,
      schedules: sanitizeSchedules(appData.schedules),
      assignmentTimes: assignmentTimesForDates(appData, assignmentDates),
      assignmentSchedules: assignmentSchedulesForDates(appData, assignmentDates),
      messages: [],
      pushPublicKey: pushPublicKey(),
      weather,
      missingAvailability,
      availabilityChangeRequests: []
    });
  } catch (error) {
    handleError(res, error);
  }
};

async function handlePost(req, res) {
  const body = await readJson(req);
  const action = String(body.action || "").trim();

  if (action === "ack-message") {
    return acknowledgeMessage(body, res);
  }
  if (action === "push-subscribe") {
    return savePushSubscription(body, res);
  }
  if (action === "save-offer") {
    return saveOffer(body, res);
  }
  if (action === "delete-offer") {
    return deleteOffer(body, res);
  }
  if (action.startsWith("schedule-")) {
    return handleScheduleMutation(req, res, body);
  }
  return saveCustomerInvoice(body, res);
}

async function acknowledgeMessage(body, res) {
  const session = verifyToken(body.employeeToken, "employee");
  if (!session?.employee) return sendJson(res, 401, { error: "Bitte erneut mit Mitarbeiter-PIN anmelden." });
  const messageId = String(body.messageId || "");
  if (!messageId) return sendJson(res, 400, { error: "Nachricht fehlt." });
  const appData = await readAppData();
  let changed = false;
  appData.messages = (appData.messages || []).map((message) => {
    if (message.id !== messageId) return message;
    const recipients = messageRecipients(appData.settings, message);
    if (!recipients.includes(session.employee)) return message;
    changed = true;
    return {
      ...message,
      recipients,
      readBy: {
        ...(message.readBy || {}),
        [session.employee]: new Date().toISOString()
      }
    };
  });
  appData.messages = (appData.messages || []).filter((message) => {
    if (message.id !== messageId) return true;
    const recipients = messageRecipients(appData.settings, message);
    if (!recipients.length) return false;
    const readBy = message.readBy || {};
    return !recipients.every((employee) => readBy[employee]);
  });
  if (changed) await writeAppData(appData);
  return sendJson(res, 200, {
    ok: true,
    messages: messagesForEmployee(appData.messages || [], appData.settings, session.employee)
  });
}

async function savePushSubscription(body, res) {
  const session = verifyToken(body.employeeToken, "employee");
  if (!session?.employee) return sendJson(res, 401, { error: "Bitte erneut mit Mitarbeiter-PIN anmelden." });
  const appData = await readAppData();
  if (!upsertPushSubscription(appData, session.employee, body.subscription)) {
    return sendJson(res, 400, { error: "Push-Abo konnte nicht gespeichert werden." });
  }
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, pushSubscriptionActive: true });
}

function serveAsset(req, res) {
  const files = {
    "index.html": { file: "index.html", type: "text/html; charset=utf-8" },
    "todo.html": { file: "todo.html", type: "text/html; charset=utf-8" },
    "teamapp-client.js": { file: "teamapp-client.js", type: "text/javascript; charset=utf-8" },
    "terminal-roles-addon.js": { file: "terminal-roles-addon.js", type: "text/javascript; charset=utf-8" },
    "sw.js": { file: "sw.js", type: "text/javascript; charset=utf-8" },
    "manifest.webmanifest": { file: "manifest.webmanifest", type: "application/manifest+json; charset=utf-8" },
    "styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
    "la-bowling-logo.png": { file: "la-bowling-logo.png", type: "image/png" },
    "teamapp-icon-192.png": { file: "teamapp-icon-192.png", type: "image/png" },
    "teamapp-icon-512.png": { file: "teamapp-icon-512.png", type: "image/png" },
    "apple-touch-icon.png": { file: "apple-touch-icon.png", type: "image/png" }
  };
  const asset = String(req.query.asset || "index.html");
  const entry = files[asset];
  if (!entry) return sendJson(res, 404, { error: "Datei nicht gefunden." });
  const file = path.join(process.cwd(), entry.file);
  if (!fs.existsSync(file)) return sendJson(res, 404, { error: "Datei nicht gefunden." });
  res.statusCode = 200;
  res.setHeader("Content-Type", entry.type);
  res.setHeader("Cache-Control", "public, max-age=60");
  res.end(fs.readFileSync(file));
}

async function saveCustomerInvoice(body, res) {
  const action = String(body.action || "").trim();
  if (action === "complete-invoice") {
    return completeInvoice(body, res);
  }
  if (action === "delete-invoice-customer") {
    return deleteInvoiceCustomer(body, res);
  }
  if (action === "add-task-template" || action === "delete-task-template") {
    return saveTaskTemplate(body, res);
  }
  if (action !== "customer-invoice" && !body.customer) {
    return sendJson(res, 400, { error: "Unbekannte Aktion." });
  }
  const customer = cleanCustomer(body.customer || body);
  if (!customer.name || !customer.contact || !customer.phone || !customer.email || !customer.address) {
    return sendJson(res, 400, { error: "Bitte alle Pflichtfelder ausfuellen." });
  }
  const appData = await readAppData();
  const date = cleanDate(body.date) || localDate(new Date());
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const invoiceCustomers = Array.isArray(report.invoiceCustomers) ? report.invoiceCustomers : [];
  appData.dayReports[date] = {
    ...report,
    invoiceCustomers: [...invoiceCustomers, customer],
    updatedAt: new Date().toISOString()
  };
  upsertCustomerDirectory(appData, customer);
  await writeAppData(appData);
  return sendJson(res, 200, {
    ok: true,
    date,
    message: "Rechnungskunde gespeichert."
  });
}

async function completeInvoice(body, res) {
  const appData = await readAppData();
  const adminSession = verifyToken(body.adminToken || "", "admin");
  const employeeSession = verifyToken(body.employeeToken || "", "employee");
  const employee = employeeSession?.employee || "";
  if (!adminSession && !employeeIsChef(appData.settings, employee)) {
    return sendJson(res, 401, { error: "Bitte als Chef anmelden." });
  }
  const date = String(body.date || "").trim();
  const invoiceId = String(body.invoiceId || "").trim();
  const report = appData.dayReports?.[date];
  if (!report || !Array.isArray(report.invoiceCustomers)) {
    return sendJson(res, 404, { error: "Rechnung nicht gefunden." });
  }
  let found = false;
  report.invoiceCustomers = report.invoiceCustomers.map((invoice, index) => {
    if (String(invoice.id || index) !== invoiceId) return invoice;
    found = true;
    return {
      ...invoice,
      invoiceDone: true,
      invoiceDoneAt: new Date().toISOString()
    };
  });
  if (!found) return sendJson(res, 404, { error: "Rechnung nicht gefunden." });
  report.updatedAt = new Date().toISOString();
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true });
}

async function deleteInvoiceCustomer(body, res) {
  const appData = await readAppData();
  const adminSession = verifyToken(body.adminToken || "", "admin");
  const employeeSession = verifyToken(body.employeeToken || "", "employee");
  const employee = employeeSession?.employee || "";
  if (!adminSession && !employeeIsChef(appData.settings, employee)) {
    return sendJson(res, 401, { error: "Bitte als Chef anmelden." });
  }
  const date = String(body.date || "").trim();
  const invoiceId = String(body.invoiceId || "").trim();
  const report = appData.dayReports?.[date];
  if (!date || !invoiceId || !report || !Array.isArray(report.invoiceCustomers)) {
    return sendJson(res, 404, { error: "Rechnung nicht gefunden." });
  }
  let removed = false;
  report.invoiceCustomers = report.invoiceCustomers.filter((invoice, index) => {
    const match = String(invoice.id || index) === invoiceId;
    if (match) removed = true;
    return !match;
  });
  if (!removed) return sendJson(res, 404, { error: "Rechnung nicht gefunden." });
  report.updatedAt = new Date().toISOString();
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true });
}

async function saveOffer(body, res) {
  const session = verifyToken(body.adminToken || "", "admin");
  if (!session) return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  const offer = normalizeOffer(body.offer || body);
  if (!offer.customerName && !offer.title) {
    return sendJson(res, 400, { error: "Angebot fehlt." });
  }
  const appData = await readAppData();
  appData.offers = normalizeOffers(appData.offers || []);
  const index = appData.offers.findIndex((item) => item.id === offer.id);
  const now = new Date().toISOString();
  if (index >= 0) {
    const existing = appData.offers[index] || {};
    appData.offers[index] = {
      ...existing,
      ...offer,
      createdAt: existing.createdAt || offer.createdAt || now,
      updatedAt: now
    };
  } else {
    appData.offers.unshift({
      ...offer,
      createdAt: offer.createdAt || now,
      updatedAt: now
    });
  }
  appData.offers = normalizeOffers(appData.offers);
  await writeAppData(appData);
  return sendJson(res, 200, {
    ok: true,
    offers: appData.offers,
    offer: appData.offers.find((item) => item.id === offer.id) || null
  });
}

async function deleteOffer(body, res) {
  const session = verifyToken(body.adminToken || "", "admin");
  if (!session) return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  const offerId = String(body.offerId || body.id || "").trim();
  if (!offerId) return sendJson(res, 400, { error: "Angebot fehlt." });
  const appData = await readAppData();
  const before = Array.isArray(appData.offers) ? appData.offers.length : 0;
  appData.offers = normalizeOffers((appData.offers || []).filter((offer) => offer.id !== offerId));
  if (appData.offers.length === before) {
    return sendJson(res, 404, { error: "Angebot nicht gefunden." });
  }
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, offers: appData.offers });
}

async function saveTaskTemplate(body, res) {
  const session = verifyToken(body.adminToken || "", "admin");
  if (!session) return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  const appData = await readAppData();
  if (body.action === "add-task-template") {
    const task = cleanTaskTemplate(body.task || {});
    if (!task.title) return sendJson(res, 400, { error: "Aufgabe fehlt." });
    appData.taskTemplates ||= [];
    appData.taskTemplates.push(task);
    await writeAppData(appData);
    return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
  }
  const id = String(body.id || "");
  appData.taskTemplates = (appData.taskTemplates || []).filter((task) => task.id !== id);
  rememberDeletedDefaultTask(appData, id);
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
}

function rememberDeletedDefaultTask(appData, id) {
  if (!(defaultData.taskTemplates || []).some((task) => task.id === id)) return;
  appData.deletedTaskTemplateIds = [...new Set([...(appData.deletedTaskTemplateIds || []), id])];
}

async function handleScheduleMutation(req, res, body) {
  const adminToken = req.headers["x-admin-token"] || body.adminToken || "";
  if (!verifyToken(adminToken, "admin")) {
    return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  }
  const month = String(body.month || "").trim();
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return sendJson(res, 400, { error: "Monat fehlt oder ist ungueltig." });
  }
  const action = String(body.action || "").trim();
  const appData = await readAppData();
  cleanupOldSchedules(appData);

  if (action === "schedule-delete-month") {
    if (appData.schedules) delete appData.schedules[month];
    await writeAppData(appData);
    return sendJson(res, 200, { ok: true });
  }

  if (action === "schedule-delete-week" || action === "schedule-unpublish-week") {
    const schedule = ensureSchedule(appData, month);
    deleteWeek(schedule, String(body.weekKey || ""));
    await writeAppData(appData);
    return sendJson(res, 200, { ok: true, schedule });
  }

  if (action === "schedule-save-week" || action === "schedule-publish-week") {
    const schedule = ensureSchedule(appData, month);
    const weekKey = String(body.weekKey || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) {
      return sendJson(res, 400, { error: "Woche fehlt oder ist ungueltig." });
    }
    mergeWeekDays(schedule, body.days || {});
    if (action === "schedule-publish-week" || body.published === true) {
      schedule.publishedWeeks[weekKey] = true;
      await notifySchedulePublished(appData, month, weekKey);
    }
    schedule.published = hasPublishedWeeks(schedule);
    schedule.updatedAt = new Date().toISOString();
    await writeAppData(appData);
    return sendJson(res, 200, { ok: true, schedule });
  }

  if (action === "schedule-save-month") {
    const schedule = ensureSchedule(appData, month);
    schedule.days = body.days || {};
    schedule.updatedAt = new Date().toISOString();
    if (body.published === true) {
      schedule.publishedWeeks = allWeekKeysForScheduleDays(schedule.days);
      schedule.published = true;
      await notifySchedulePublished(appData, month);
    } else {
      schedule.published = hasPublishedWeeks(schedule);
    }
    await writeAppData(appData);
    return sendJson(res, 200, { ok: true, schedule });
  }

  return sendJson(res, 400, { error: "Unbekannte Aktion." });
}

async function notifySchedulePublished(appData, month, weekKey = "") {
  if (appData.settings?.pushSettings?.schedulePublished === false) {
    return { sent: 0, skipped: true, reason: "disabled" };
  }
  const settings = appData.settings?.pushSettings || {};
  const body = applyPushTemplate(
    weekKey ? settings.schedulePublishedBody : settings.schedulePublishedBody,
    {
      month,
      monthLabel: formatMonthLabel(month),
      weekKey,
      weekLabel: weekKey ? formatDateLabel(weekKey) : ""
    }
  ) || (weekKey
    ? `Die Woche ab ${formatDateLabel(weekKey)} ist veröffentlicht.`
    : `Der Dienstplan für ${formatMonthLabel(month)} ist veröffentlicht.`);
  return sendPushToEmployees(appData, appData.settings.employees || [], {
    title: applyPushTemplate(settings.schedulePublishedTitle, {
      month,
      monthLabel: formatMonthLabel(month),
      weekKey,
      weekLabel: weekKey ? formatDateLabel(weekKey) : ""
    }) || "LA-Bowling - Neuer Dienstplan online",
    body,
    url: "/",
    tag: weekKey ? `schedule-${weekKey}` : `schedule-${month}`
  });
}

function ensureSchedule(appData, month) {
  appData.schedules ||= {};
  appData.schedules[month] ||= {
    month,
    published: false,
    updatedAt: "",
    days: {},
    publishedWeeks: {}
  };
  appData.schedules[month].days ||= {};
  appData.schedules[month].publishedWeeks ||= {};
  return appData.schedules[month];
}

function mergeWeekDays(schedule, days) {
  schedule.days ||= {};
  for (const [dateKey, day] of Object.entries(days || {})) {
    schedule.days[dateKey] = day || {};
  }
}

function deleteWeek(schedule, weekKey) {
  if (!schedule || !weekKey) return;
  schedule.days ||= {};
  for (const dateKey of Object.keys(schedule.days)) {
    if (weekStartKey(dateKey) === weekKey) delete schedule.days[dateKey];
  }
  schedule.publishedWeeks ||= {};
  delete schedule.publishedWeeks[weekKey];
  schedule.published = hasPublishedWeeks(schedule);
  schedule.updatedAt = new Date().toISOString();
}

function allWeekKeysForScheduleDays(days = {}) {
  const weekKeys = {};
  Object.keys(days).forEach((dateKey) => {
    weekKeys[weekStartKey(dateKey)] = true;
  });
  return weekKeys;
}

function cleanTaskTemplate(task) {
  const frequency = ["daily", "weekly", "monthly", "interval", "once", "next-day"].includes(task.frequency) ? task.frequency : "daily";
  const category = ["preparation", "running", "closing"].includes(task.category) ? task.category : "running";
  return {
    id: String(task.id || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: String(task.title || "").trim().slice(0, 180),
    note: String(task.note || "").trim().slice(0, 600),
    frequency,
    category,
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(task.date || "")) ? String(task.date) : "",
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.startDate || "")) ? String(task.startDate) : "",
    endDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.endDate || "")) ? String(task.endDate) : "",
    intervalDays: Math.max(1, Math.min(365, Number(task.intervalDays || 1))),
    weekdays: Array.isArray(task.weekdays) ? task.weekdays.map(Number).filter((day) => day >= 0 && day <= 6) : [],
    dayOfMonth: Math.min(31, Math.max(1, Number(task.dayOfMonth || 1))),
    popupEnabled: task.popupEnabled === true || task.popupEnabled === "true",
    popupTime: cleanTime(task.popupTime),
    createdAt: String(task.createdAt || new Date().toISOString()).slice(0, 40)
  };
}

function cleanTime(value) {
  const text = String(value || "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : "";
}

function cleanCustomer(item) {
  return {
    id: String(item.id || `customer-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: String(item.name || "").trim().slice(0, 160),
    contact: String(item.contact || "").trim().slice(0, 160),
    phone: String(item.phone || "").trim().slice(0, 80),
    email: String(item.email || "").trim().slice(0, 180),
    address: String(item.address || "").trim().slice(0, 600),
    tip: String(item.tip || "").trim().slice(0, 160),
    note: String(item.note || "").trim().slice(0, 600),
    createdAt: new Date().toISOString(),
    invoiceReady: false,
    invoiceReadyAt: "",
    invoiceDone: false,
    invoiceDoneAt: "",
    amount: "",
    bowlingAmount: "",
    gastroAmount: "",
    gastroDrinksAmount: "",
    gastroFoodAmount: "",
    gastroOtherAmount: "",
    gastroOtherNote: "",
    receiptName: "",
    receiptData: "",
    bowlingReceiptName: "",
    bowlingReceiptData: "",
    gastroReceiptName: "",
    gastroReceiptData: "",
    area: "rechnung"
  };
}

function upsertCustomerDirectory(appData, customers) {
  const list = Array.isArray(customers) ? customers : [customers];
  const byKey = new Map();
  (Array.isArray(appData.customerDirectory) ? appData.customerDirectory : []).forEach((customer) => {
    const entry = customerDirectoryEntry(customer);
    const key = customerDirectoryKey(entry);
    if (key) byKey.set(key, entry);
  });
  list.forEach((customer) => {
    const entry = customerDirectoryEntry(customer);
    const key = customerDirectoryKey(entry);
    if (!key) return;
    byKey.set(key, {
      ...(byKey.get(key) || {}),
      ...entry,
      updatedAt: new Date().toISOString()
    });
  });
  appData.customerDirectory = [...byKey.values()]
    .filter((customer) => customer.name)
    .sort((a, b) => a.name.localeCompare(b.name, "de"))
    .slice(0, 500);
}

function customerDirectoryEntry(item = {}) {
  return {
    id: String(item.id || customerDirectoryKey(item) || `customer-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: String(item.name || "").trim().slice(0, 160),
    contact: String(item.contact || "").trim().slice(0, 160),
    phone: String(item.phone || "").trim().slice(0, 80),
    email: String(item.email || "").trim().slice(0, 180),
    address: String(item.address || "").trim().slice(0, 600),
    tip: String(item.tip || "").trim().slice(0, 160),
    note: String(item.note || "").trim().slice(0, 600),
    createdAt: String(item.createdAt || new Date().toISOString()).slice(0, 80),
    updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString()).slice(0, 80)
  };
}

function customerDirectoryKey(item = {}) {
  const email = String(item.email || "").trim().toLowerCase();
  if (email) return `mail:${email}`;
  const name = String(item.name || "").trim().toLowerCase();
  const phone = String(item.phone || "").replace(/\s+/g, "");
  return name ? `name:${name}|${phone}` : "";
}

function normalizeOffers(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((offer) => normalizeOffer(offer))
    .filter((offer) => offer.customerName || offer.title || offer.eventDate || offer.createdAt)
    .sort((a, b) => {
      const aTime = Date.parse(a.updatedAt || a.createdAt || "") || 0;
      const bTime = Date.parse(b.updatedAt || b.createdAt || "") || 0;
      if (a.archived !== b.archived) return a.archived ? 1 : -1;
      return bTime - aTime;
    });
}

function normalizeOffer(offer = {}) {
  const buffet = offer.buffet && typeof offer.buffet === "object" ? offer.buffet : {};
  const bowling = offer.bowling && typeof offer.bowling === "object" ? offer.bowling : {};
  const costs = Array.isArray(offer.costs) ? offer.costs : [];
  const timeline = Array.isArray(offer.timeline) ? offer.timeline : [];
  return {
    id: String(offer.id || `offer-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    archived: offer.archived === true,
    createdAt: String(offer.createdAt || new Date().toISOString()).slice(0, 80),
    updatedAt: String(offer.updatedAt || new Date().toISOString()).slice(0, 80),
    title: String(offer.title || offer.customerName || "Angebot").trim().slice(0, 120),
    offerDate: cleanOfferDate(offer.offerDate),
    eventDate: cleanOfferDate(offer.eventDate),
    customerName: String(offer.customerName || "").trim().slice(0, 160),
    customerContact: String(offer.customerContact || "").trim().slice(0, 160),
    customerEmail: String(offer.customerEmail || "").trim().slice(0, 180),
    customerPhone: String(offer.customerPhone || "").trim().slice(0, 80),
    customerAddress: String(offer.customerAddress || "").trim().slice(0, 600),
    occasion: String(offer.occasion || "").trim().slice(0, 160),
    personsAdults: cleanOfferInteger(offer.personsAdults),
    personsChildren: cleanOfferInteger(offer.personsChildren),
    startTime: cleanTime(offer.startTime),
    mealTime: cleanTime(offer.mealTime),
    sparklingReceptionTime: cleanTime(offer.sparklingReceptionTime),
    reservedArea: String(offer.reservedArea || "").trim().slice(0, 200),
    reservedAreaPrice: cleanOfferMoney(offer.reservedAreaPrice),
    reservedAreaCampfire: offer.reservedAreaCampfire === true,
    customerDirectoryId: String(offer.customerDirectoryId || "").trim().slice(0, 120),
    additionalInfo: String(offer.additionalInfo || "").trim().slice(0, 2000),
    internalNote: String(offer.internalNote || "").trim().slice(0, 2000),
    textBlocks: normalizeOfferTextBlocks(offer.textBlocks),
    bowling: {
      tournamentPackage: String(bowling.tournamentPackage || "").trim().slice(0, 40),
      lanes: cleanOfferInteger(bowling.lanes),
      shoePersons: cleanOfferInteger(bowling.shoePersons),
      fromTime: cleanTime(bowling.fromTime),
      toTime: cleanTime(bowling.toTime)
    },
    buffet: {
      templateKey: String(buffet.templateKey || "").trim().slice(0, 40),
      name: String(buffet.name || "").trim().slice(0, 160),
      pricePerPerson: cleanOfferMoney(buffet.pricePerPerson),
      sparklingReception: buffet.sparklingReception === true,
      categories: normalizeOfferBuffetCategories(buffet.categories)
    },
    timeline: normalizeOfferTimeline(timeline),
    costs: normalizeOfferCosts(costs)
  };
}

function normalizeOfferTextBlocks(blocks = {}) {
  const defaults = {
    pricingNotice: {
      label: "Hinweis zur Preisangabe",
      enabled: true,
      text: "Der Buffetpreis kann einzeln pro Person abgerechnet werden. Jedoch gilt zu beachten, dass die 36 Stunden vor Veranstaltungsbeginn gemeldete Personenzahl als Berechnungsgrundlage dient und der Veranstalter für eventuelle Ausfälle aufkommen muss."
    },
    cancellationTerms: {
      label: "Stornierung & Rechnungsgrundlage",
      enabled: true,
      text: "Eine kostenfreie Stornierung der Veranstaltung ist bis 4 Wochen vor dem Veranstaltungstermin möglich. Bei einer späteren Stornierung berechnen wir 50 % der vereinbarten Auftragssumme.\n\nDie bis spätestens 36 Stunden vor Veranstaltungsbeginn gemeldete Personenzahl gilt als verbindliche Rechnungsgrundlage."
    },
    reservationConfirmation: {
      label: "Reservierungsbestätigung",
      enabled: true,
      text: "Dieses Angebot ist ab dem Ausstellungsdatum 14 Tage gültig.\n\nBitte senden Sie mir das Angebot unterschrieben als Reservierungsbestätigung zurück."
    },
    vatNotice: {
      label: "MwSt.-Hinweis",
      enabled: true,
      text: "Alle Preise verstehen sich inklusive gesetzlicher Mehrwertsteuer."
    }
  };
  return Object.fromEntries(Object.entries(defaults).map(([key, config]) => {
    const source = blocks && typeof blocks === "object" ? blocks[key] || {} : {};
    return [key, {
      label: config.label,
      enabled: source.enabled == null ? config.enabled : source.enabled === true,
      text: String(source.text ?? config.text).trim().slice(0, 4000)
    }];
  }));
}

function normalizeOfferTimeline(items = []) {
  return items.map((item) => ({
    id: String(item?.id || `timeline-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    time: cleanTime(item?.time),
    title: String(item?.title || item?.label || "").trim().slice(0, 160),
    note: String(item?.note || "").trim().slice(0, 600)
  })).filter((item) => item.time || item.title || item.note);
}

function normalizeOfferCosts(items = []) {
  return items.map((item) => ({
    id: String(item?.id || `cost-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    label: String(item?.label || "").trim().slice(0, 160),
    quantity: cleanOfferMoney(item?.quantity),
    unitPrice: cleanOfferMoney(item?.unitPrice),
    note: String(item?.note || "").trim().slice(0, 400)
  })).filter((item) => item.label || item.quantity || item.unitPrice || item.note);
}

function normalizeOfferBuffetCategories(categories = {}) {
  const source = categories && typeof categories === "object" ? categories : {};
  return {
    vorspeise: normalizeOfferBuffetItems([
      ...(Array.isArray(source.vorspeise) ? source.vorspeise : []),
      ...(Array.isArray(source.vorspeisen) ? source.vorspeisen : []),
      ...(Array.isArray(source.suppen) ? source.suppen : [])
    ]),
    hauptgericht: normalizeOfferBuffetItems([
      ...(Array.isArray(source.hauptgericht) ? source.hauptgericht : []),
      ...(Array.isArray(source.fleisch) ? source.fleisch : []),
      ...(Array.isArray(source.fisch) ? source.fisch : []),
      ...(Array.isArray(source.vegetarisch) ? source.vegetarisch : [])
    ]),
    dessert: normalizeOfferBuffetItems([
      ...(Array.isArray(source.dessert) ? source.dessert : [])
    ])
  };
}

function normalizeOfferBuffetItems(items = []) {
  return items.map((item) => ({
    id: String(item?.id || `dish-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: String(item?.name || item?.title || "").trim().slice(0, 180),
    note: String(item?.note || "").trim().slice(0, 240)
  })).filter((item) => item.name || item.note);
}

function cleanOfferDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function cleanOfferInteger(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(9999, Math.floor(parsed))) : 0;
}

function cleanOfferMoney(value) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, Math.min(999999, Math.round(parsed * 100) / 100)) : 0;
}

function cleanTime(value) {
  const text = String(value || "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : "";
}

function cleanDate(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : localDate(new Date());
}

function localDate(date) {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function todayAndTomorrowDates() {
  const today = localDate(new Date());
  return [today, addDaysKey(today, 1)];
}

function addDaysKey(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return localDate(date);
}

function assignmentTimesForDates(appData, dates = []) {
  return Object.fromEntries(dates.map((dateKey) => [
    dateKey,
    appData.assignmentTimes?.[dateKey] || {}
  ]));
}

function assignmentSchedulesForDates(appData, dates = []) {
  return Object.fromEntries(dates.map((dateKey) => {
    const schedule = appData.schedules?.[dateKey.slice(0, 7)] || {};
    const day = schedule.days?.[dateKey] || {};
    const isPublished = schedule.publishedWeeks?.[weekStartKey(dateKey)] || schedule.published;
    return [dateKey, isPublished ? day : {}];
  }));
}

async function fetchWeather() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", "48.5442");
    url.searchParams.set("longitude", "12.1467");
    url.searchParams.set("current", "temperature_2m,precipitation,weather_code,wind_speed_10m");
    url.searchParams.set("hourly", "temperature_2m,precipitation_probability,precipitation,weather_code");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
    url.searchParams.set("timezone", "Europe/Berlin");
    url.searchParams.set("forecast_days", "1");
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error("Wetterbericht konnte nicht geladen werden.");
    const data = await response.json();
    return {
      location: "Roentgenstrasse 12, 84034 Landshut",
      current: data.current,
      daily: {
        weatherCode: data.daily?.weather_code?.[0],
        tempMax: data.daily?.temperature_2m_max?.[0],
        tempMin: data.daily?.temperature_2m_min?.[0],
        precipitation: data.daily?.precipitation_sum?.[0]
      },
      hourly: hourlyForecast(data.hourly)
    };
  } catch (error) {
    return { error: true };
  }
}

function hourlyForecast(hourly = {}) {
  const times = hourly.time || [];
  const now = new Date();
  const startIndex = Math.max(0, times.findIndex((time) => new Date(time) >= now));
  return times.slice(startIndex, startIndex + 6).map((time, index) => {
    const sourceIndex = startIndex + index;
    return {
      time,
      temperature: hourly.temperature_2m?.[sourceIndex],
      rainProbability: hourly.precipitation_probability?.[sourceIndex],
      precipitation: hourly.precipitation?.[sourceIndex],
      weatherCode: hourly.weather_code?.[sourceIndex]
    };
  });
}

function messagesForEmployee(messages, settings, employee) {
  return (messages || []).filter((message) => {
    if (message.readBy?.[employee]) return false;
    return messageRecipients(settings, message).includes(employee);
  });
}

function messageRecipients(settings, message = {}) {
  if (Array.isArray(message.recipients) && message.recipients.length) {
    return message.recipients.map(String).filter((employee) => (settings.employees || []).includes(employee));
  }
  const employees = (settings.employees || []).map(String).filter(Boolean);
  if (message.target === "all") return employees;
  if (message.target === "employees") {
    const wanted = new Set((message.employees || []).map(String));
    return employees.filter((employee) => wanted.has(employee));
  }
  return employees.filter((employee) => employeeMatchesMessageTarget(settings, employee, message.target));
}

function employeeMatchesMessageTarget(settings, employee, target) {
  const wanted = normalizeDepartment(target);
  const departments = new Set((settings.employeeDepartments?.[employee] || []).map(normalizeDepartment));
  const role = normalizeDepartment(settings.employeeRoles?.[employee] || "");
  if (role) departments.add(role);
  return departments.has(wanted);
}

function normalizeDepartment(value) {
  const clean = String(value || "").trim().toLowerCase();
  if (clean.startsWith("counter")) return "Counter";
  if (clean.startsWith("service")) return "Service";
  if (clean.startsWith("kÃ¼che") || clean.startsWith("küche") || clean.startsWith("kueche") || clean.startsWith("kuche")) return "Kueche";
  if (clean.startsWith("reinigung")) return "Reinigung";
  if (clean.startsWith("mechanik")) return "Mechanik";
  return String(value || "").trim();
}

function availabilityMissing(appData, month) {
  if (!month) return [];
  const monthAvailability = appData.availability?.[month] || {};
  const exempt = new Set((appData.settings.availabilityExemptEmployees || []).map((name) => String(name).trim().toLowerCase()));
  return (appData.settings.employees || []).filter((employee) => {
    if (exempt.has(String(employee).trim().toLowerCase())) return false;
    const days = monthAvailability[employee] || {};
    return Object.keys(days).filter((key) => key !== "__meta").length === 0 && !days.__meta?.submitted;
  });
}

function cleanMonth(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(text) ? text : "";
}

function cleanupOldSchedules(appData) {
  const retentionDays = scheduleRetentionDays(appData.settings);
  if (retentionDays <= 0) return false;
  let changed = false;
  const today = localDate(new Date());
  for (const [month, schedule] of Object.entries(appData.schedules || {})) {
    const latest = latestPublishedDate(schedule);
    if (latest && daysBetween(latest, today) > retentionDays) {
      delete appData.schedules[month];
      changed = true;
    }
  }
  return changed;
}

function latestPublishedDate(schedule) {
  let latest = "";
  for (const dateKey of Object.keys(schedule?.days || {})) {
    const weekKey = weekStartKey(dateKey);
    if ((schedule.publishedWeeks?.[weekKey] || schedule.published) && dateKey > latest) latest = dateKey;
  }
  return latest;
}

function daysBetween(start, end) {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  return Math.floor((endDate - startDate) / 86400000);
}

function scheduleRetentionDays(settings = {}) {
  const parsed = Number(settings.scheduleAutoDeleteDays);
  if (!Number.isFinite(parsed)) return 14;
  return Math.max(0, Math.min(365, Math.floor(parsed)));
}

function employeeIsChef(settings, employee) {
  const role = String(settings.employeeRoles?.[employee] || "").trim().toLowerCase();
  return role === "chef";
}

function publicScheduleFor(schedule) {
  if (!schedule?.published && !hasPublishedWeeks(schedule)) {
    return { month: schedule.month, published: false, days: {} };
  }
  if (schedule.published && !schedule.publishedWeeks) {
    return schedule;
  }
  const days = {};
  for (const [dateKey, assignments] of Object.entries(schedule.days || {})) {
    if (schedule.publishedWeeks?.[weekStartKey(dateKey)]) {
      days[dateKey] = assignments;
    }
  }
  return {
    ...schedule,
    published: Object.keys(days).length > 0,
    days
  };
}

function hasPublishedWeeks(schedule) {
  return Object.values(schedule?.publishedWeeks || {}).some(Boolean);
}

function weekStartKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

function formatDateLabel(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMonthLabel(month) {
  const [year, monthIndex] = String(month || "").split("-").map(Number);
  if (!year || !monthIndex) return "den neuen Monat";
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

