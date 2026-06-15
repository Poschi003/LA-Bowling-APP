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
        messages: appData.messages || [],
        taskTemplates: appData.taskTemplates || [],
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
    createdAt: new Date().toISOString()
  };
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
  if (clean.startsWith("küche") || clean.startsWith("kueche") || clean.startsWith("kuche")) return "Kueche";
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
