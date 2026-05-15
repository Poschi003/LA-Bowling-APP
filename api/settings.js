const {
  createPinHash,
  handleError,
  publicSettings,
  readAppData,
  readJson,
  sendJson,
  verifyToken,
  writeAppData
} = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    if (!verifyToken(req.headers["x-admin-token"], "admin")) {
      return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
    }
    const body = await readJson(req);
    const appData = await readAppData();

    if (body.action === "add-message") {
      const text = String(body.text || "").trim().slice(0, 800);
      if (!text) return sendJson(res, 400, { error: "Nachricht fehlt." });
      appData.messages ||= [];
      appData.messages.unshift({
        id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        target: cleanTarget(body.target),
        employees: Array.isArray(body.employees) ? body.employees.map(String).map((name) => name.trim()).filter(Boolean) : [],
        createdAt: new Date().toISOString()
      });
      appData.messages = appData.messages.slice(0, 30);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, messages: appData.messages });
    }

    if (body.action === "delete-message") {
      const id = String(body.id || "");
      appData.messages = (appData.messages || []).filter((message) => message.id !== id);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, messages: appData.messages });
    }

    if (body.action === "add-task-template") {
      const task = cleanTaskTemplate(body.task || {});
      if (!task.title) return sendJson(res, 400, { error: "Aufgabe fehlt." });
      appData.taskTemplates ||= [];
      appData.taskTemplates.unshift(task);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
    }

    if (body.action === "delete-task-template") {
      const id = String(body.id || "");
      appData.taskTemplates = (appData.taskTemplates || []).filter((task) => task.id !== id);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
    }

    if (body.action === "add-reminder") {
      const reminder = cleanReminder(body.reminder || {});
      if (!reminder.text) return sendJson(res, 400, { error: "Erinnerungstext fehlt." });
      appData.reminderTemplates ||= [];
      appData.reminderTemplates.unshift(reminder);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, reminderTemplates: appData.reminderTemplates });
    }

    if (body.action === "delete-reminder") {
      const id = String(body.id || "");
      appData.reminderTemplates = (appData.reminderTemplates || []).filter((reminder) => reminder.id !== id);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, reminderTemplates: appData.reminderTemplates });
    }

    if (Array.isArray(body.employees)) {
      const employees = [...new Set(body.employees.map(String).map((name) => name.trim()).filter(Boolean))];
      if (!employees.length) {
        return sendJson(res, 400, { error: "Mitarbeiterliste darf nicht leer gespeichert werden." });
      }
      appData.settings.employees = employees;
    }
    if (body.employeePins && typeof body.employeePins === "object") {
      appData.settings.employeePinHashes ||= {};
      for (const [name, pin] of Object.entries(body.employeePins)) {
        const cleanName = String(name || "").trim();
        const cleanPin = String(pin || "").trim();
        if (cleanName && cleanPin) {
          appData.settings.employeePinHashes[cleanName] = createPinHash(cleanPin);
          delete appData.settings.employeePins?.[cleanName];
        }
      }
    }
    if (appData.settings.employeePinHashes && Array.isArray(appData.settings.employees)) {
      const currentEmployees = new Set(appData.settings.employees);
      for (const name of Object.keys(appData.settings.employeePinHashes)) {
        if (!currentEmployees.has(name)) delete appData.settings.employeePinHashes[name];
      }
    }
    if (appData.settings.employeePins && Array.isArray(appData.settings.employees)) {
      const currentEmployees = new Set(appData.settings.employees);
      for (const name of Object.keys(appData.settings.employeePins)) {
        if (!currentEmployees.has(name) || appData.settings.employeePinHashes?.[name]) {
          delete appData.settings.employeePins[name];
        }
      }
    }
    if (body.employeeDepartments && typeof body.employeeDepartments === "object") {
      appData.settings.employeeDepartments = body.employeeDepartments;
    }
    if (body.employeeRoles && typeof body.employeeRoles === "object") {
      appData.settings.employeeRoles = body.employeeRoles;
    }
    if (Array.isArray(body.availabilityExemptEmployees)) {
      appData.settings.availabilityExemptEmployees = [...new Set(body.availabilityExemptEmployees.map(String).map((name) => name.trim()).filter(Boolean))];
    }
    if (Array.isArray(body.adminEmployees)) {
      appData.settings.adminEmployees = [...new Set(body.adminEmployees.map(String).map((name) => name.trim()).filter(Boolean))];
    }
    if (Array.isArray(body.positions)) {
      appData.settings.positions = [...new Set(body.positions.map(String).map((name) => name.trim()).filter(Boolean))];
    }
    if (body.chefViewSections && typeof body.chefViewSections === "object") {
      appData.settings.chefViewSections = cleanVisibility(body.chefViewSections, ["messages", "today", "reports", "reportFolders", "employees", "schedule"]);
    }
    if (body.dayReportFields && typeof body.dayReportFields === "object") {
      appData.settings.dayReportFields = cleanVisibility(body.dayReportFields, ["ecTotal", "barBowling", "barGastro", "barTotal", "invoiceCustomers", "expenses", "documents", "notes", "preparation", "handovers", "extraEmployees"]);
    }
    if (Array.isArray(body.taskTemplates)) {
      appData.taskTemplates = body.taskTemplates.map(cleanTaskTemplate).filter((task) => task.title);
    }
    if (typeof body.businessName === "string" && body.businessName.trim()) {
      appData.settings.businessName = body.businessName.trim();
    }
    if (typeof body.adminPin === "string" && body.adminPin.trim()) {
      appData.settings.adminPinHash = createPinHash(body.adminPin.trim());
      delete appData.settings.adminPin;
    }
    if (typeof body.terminalCode === "string" && body.terminalCode.trim()) {
      appData.settings.terminalCodeHash = createPinHash(body.terminalCode.trim());
      delete appData.settings.terminalCode;
    }
    if (body.scheduleAutoDeleteDays !== undefined && body.scheduleAutoDeleteDays !== null && body.scheduleAutoDeleteDays !== "") {
      const days = Number(body.scheduleAutoDeleteDays);
      appData.settings.scheduleAutoDeleteDays = Number.isFinite(days)
        ? Math.max(0, Math.min(365, Math.floor(days)))
        : appData.settings.scheduleAutoDeleteDays;
    }
    if (body.hourlyRate !== undefined && body.hourlyRate !== null && body.hourlyRate !== "") {
      const hourlyRate = Number(body.hourlyRate);
      appData.settings.hourlyRate = Number.isFinite(hourlyRate)
        ? Math.max(0, Math.min(200, Math.round(hourlyRate * 100) / 100))
        : appData.settings.hourlyRate;
    }

    await writeAppData(appData);
    sendJson(res, 200, { ok: true, settings: publicSettings(appData.settings) });
  } catch (error) {
    handleError(res, error);
  }
};

function cleanVisibility(value, keys) {
  return Object.fromEntries(keys.map((key) => [key, value[key] !== false]));
}

function cleanTarget(value) {
  const text = String(value || "all").trim();
  return ["all", "Counter", "Service", "Kueche", "Reinigung", "Mechanik", "employees"].includes(text) ? text : "all";
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

function cleanReminder(reminder) {
  return {
    id: String(reminder.id || `reminder-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    text: String(reminder.text || "").trim().slice(0, 240),
    startAfterOpeningMinutes: Math.max(0, Math.min(720, Number(reminder.startAfterOpeningMinutes || 60))),
    intervalMinutes: Math.max(5, Math.min(360, Number(reminder.intervalMinutes || 60))),
    active: reminder.active !== false,
    createdAt: new Date().toISOString()
  };
}

