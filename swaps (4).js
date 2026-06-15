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
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "POST") return saveCustomerInvoice(req, res);
    if (req.method !== "GET") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const month = req.query.month;
    const adminSession = verifyToken(req.query.adminToken, "admin");
    const employeeSession = verifyToken(req.query.employeeToken, "employee");
    const appData = await readAppData();
    const schedule = appData.schedules[month] || { month, published: false, days: {} };
    const nextMonth = req.query.nextMonth;
    const missingAvailability = availabilityMissing(appData, nextMonth);
    const availabilityChangeRequests = (appData.availabilityChangeRequests || []).filter((request) => !month || request.month === month);

    if (adminSession) {
      return sendJson(res, 200, {
        settings: publicSettings(appData.settings),
        availability: appData.availability[month] || {},
        schedule,
        schedules: appData.schedules || {},
        timesheets: appData.timesheets?.[month] || {},
        dayReports: appData.dayReports || {},
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
        isChef,
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
      missingAvailability,
      availabilityChangeRequests: []
    });
  } catch (error) {
    handleError(res, error);
  }
};

async function saveCustomerInvoice(req, res) {
  const body = await readJson(req);
  const action = String(body.action || "").trim();
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

function cleanCustomer(item) {
  return {
    id: String(item.id || crypto.randomUUID()),
    name: String(item.name || "").trim().slice(0, 160),
    contact: String(item.contact || "").trim().slice(0, 160),
    phone: String(item.phone || "").trim().slice(0, 80),
    email: String(item.email || "").trim().slice(0, 180),
    address: String(item.address || "").trim().slice(0, 600),
    tip: String(item.tip || "").trim().slice(0, 160),
    note: String(item.note || "").trim().slice(0, 600),
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

function employeeIsChef(settings, employee) {
  const name = String(employee || "").trim().toLowerCase();
  const role = String(settings.employeeRoles?.[employee] || "").trim().toLowerCase();
  return name === "peter" || role.includes("chef") || role.includes("betriebsleitung");
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
