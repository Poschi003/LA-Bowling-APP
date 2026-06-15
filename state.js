const fs = require("fs");
const path = require("path");
const {
  handleError,
  publicSettings,
  readAppData,
  readJson,
  sanitizeSchedules,
  sendJson,
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
    if (didCleanup) await writeAppData(appData);
    const schedule = appData.schedules[month] || { month, published: false, days: {} };
    const nextMonth = req.query.nextMonth;
    const missingAvailability = availabilityMissing(appData, nextMonth);
    const availabilityChangeRequests = (appData.availabilityChangeRequests || []).filter((request) => !month || request.month === month);
    const weather = await fetchWeather();

    if (adminSession) {
      return sendJson(res, 200, {
        settings: publicSettings(appData.settings),
        availability: appData.availability[month] || {},
        schedule,
        schedules: appData.schedules || {},
        timesheets: appData.timesheets?.[month] || {},
        dayReports: appData.dayReports || {},
        messages: appData.messages || [],
        terminalMessages: appData.terminalMessages || [],
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
          [employeeSession.employee]: appData.availability[month]?.[employeeSession.employee] || {}
        },
        schedule: publicSchedule,
        schedules: sanitizeSchedules(appData.schedules),
        timesheets: isChef
          ? (appData.timesheets?.[month] || {})
          : { [employeeSession.employee]: appData.timesheets?.[month]?.[employeeSession.employee] || {} },
        dayReports: isChef ? (appData.dayReports || {}) : {},
        messages: messagesForEmployee(appData.messages || [], appData.settings, employeeSession.employee),
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
      messages: [],
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

  if (action.startsWith("schedule-")) {
    return handleScheduleMutation(req, res, body);
  }
  return saveCustomerInvoice(body, res);
}

function serveAsset(req, res) {
  const files = {
    "index.html": { file: "index.html", type: "text/html; charset=utf-8" },
    "todo.html": { file: "todo.html", type: "text/html; charset=utf-8" },
    "teamapp-client.js": { file: "teamapp-client.js", type: "text/javascript; charset=utf-8" },
    "terminal-roles-addon.js": { file: "terminal-roles-addon.js", type: "text/javascript; charset=utf-8" },
    "styles.css": { file: "styles.css", type: "text/css; charset=utf-8" },
    "la-bowling-logo.png": { file: "la-bowling-logo.png", type: "image/png" }
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
  const date = localDate(new Date());
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const invoiceCustomers = Array.isArray(report.invoiceCustomers) ? report.invoiceCustomers : [];
  appData.dayReports[date] = {
    ...report,
    invoiceCustomers: [...invoiceCustomers, customer],
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, date });
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
    } else {
      schedule.published = hasPublishedWeeks(schedule);
    }
    await writeAppData(appData);
    return sendJson(res, 200, { ok: true, schedule });
  }

  return sendJson(res, 400, { error: "Unbekannte Aktion." });
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
    createdAt: new Date().toISOString()
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
    receiptName: "",
    receiptData: "",
    bowlingReceiptName: "",
    bowlingReceiptData: "",
    gastroReceiptName: "",
    gastroReceiptData: "",
    area: "rechnung"
  };
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
  const departments = new Set((settings.employeeDepartments?.[employee] || []).map(normalizeDepartment));
  const role = normalizeDepartment(settings.employeeRoles?.[employee] || "");
  if (role) departments.add(role);
  return (messages || []).filter((message) => {
    if (message.target === "all") return true;
    if (message.target === "employees") return (message.employees || []).includes(employee);
    return departments.has(normalizeDepartment(message.target));
  });
}

function normalizeDepartment(value) {
  const clean = String(value || "").trim().toLowerCase();
  if (clean.startsWith("counter")) return "Counter";
  if (clean.startsWith("service")) return "Service";
  if (clean.startsWith("kÃ¼che") || clean.startsWith("kueche") || clean.startsWith("kuche")) return "Kueche";
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
    return Object.keys(days).length === 0;
  });
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

