const {
  createPinHash,
  defaultData,
  handleError,
  publicSettings,
  readAppData,
  readJson,
  sendJson,
  verifyToken,
  writeAppData
} = require("./_data");
const { addBonusEvent, bonusSummaryForEmployee } = require("./_data");

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
      const target = cleanTarget(body.target);
      const employees = cleanEmployeeList(body.employees, appData.settings);
      const recipients = messageRecipients(appData.settings, { target, employees });
      if (!recipients.length) return sendJson(res, 400, { error: "Bitte mindestens einen Empfänger auswählen." });
      appData.messages ||= [];
      appData.messages.unshift({
        id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        target,
        employees,
        recipients,
        readBy: {},
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

    if (body.action === "add-bonus-praise") {
      const employee = String(body.employee || "").trim();
      if (!(appData.settings.employees || []).includes(employee)) {
        return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
      }
      const note = String(body.note || "").trim().slice(0, 180);
      addBonusEvent(appData, {
        employee,
        type: "employee-praise",
        label: note ? `Mitarbeiterlob: ${note}` : "Mitarbeiterlob",
        points: 20,
        sourceKey: `employee-praise:${employee}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
        date: new Date().toISOString().slice(0, 10)
      });
      await writeAppData(appData);
      return sendJson(res, 200, {
        ok: true,
        bonusSummary: bonusSummaryForEmployee(appData, employee)
      });
    }

    if (body.action === "add-terminal-message") {
      const text = String(body.text || "").trim().slice(0, 1000);
      if (!text) return sendJson(res, 400, { error: "Nachricht fehlt." });
      appData.terminalMessages ||= [];
      appData.terminalMessages.unshift({
        id: `terminal-msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        active: true,
        createdAt: new Date().toISOString()
      });
      appData.terminalMessages = appData.terminalMessages.slice(0, 40);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, terminalMessages: appData.terminalMessages });
    }

    if (body.action === "delete-terminal-message") {
      const id = String(body.id || "");
      appData.terminalMessages = (appData.terminalMessages || []).filter((message) => message.id !== id);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, terminalMessages: appData.terminalMessages });
    }

    if (body.action === "add-task-template") {
      const task = cleanTaskTemplate(body.task || {});
      if (!task.title) return sendJson(res, 400, { error: "Aufgabe fehlt." });
      appData.taskTemplates ||= [];
      appData.taskTemplates.push(task);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
    }

    if (body.action === "delete-task-template") {
      const id = String(body.id || "");
      appData.taskTemplates = (appData.taskTemplates || []).filter((task) => task.id !== id);
      rememberDeletedDefaultTasks(appData);
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

    if (body.action === "add-cleaning-template") {
      const task = cleanCleaningTemplate(body.task || {});
      if (!task.title) return sendJson(res, 400, { error: "Reinigungsaufgabe fehlt." });
      appData.cleaningTemplates ||= [];
      appData.cleaningTemplates.unshift(task);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, cleaningTemplates: appData.cleaningTemplates });
    }

    if (body.action === "delete-cleaning-template") {
      const id = String(body.id || "");
      appData.cleaningTemplates = (appData.cleaningTemplates || []).filter((task) => task.id !== id);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, cleaningTemplates: appData.cleaningTemplates });
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
    if (Array.isArray(body.fixedEmployees)) {
      const currentEmployees = new Set(appData.settings.employees || []);
      appData.settings.fixedEmployees = [...new Set(body.fixedEmployees.map(String).map((name) => name.trim()).filter((name) => name && currentEmployees.has(name)))];
    }
    if (Array.isArray(body.availabilityExemptEmployees)) {
      appData.settings.availabilityExemptEmployees = [...new Set(body.availabilityExemptEmployees.map(String).map((name) => name.trim()).filter(Boolean))];
    }
    if (typeof body.availabilityTargetMonth === "string" && /^\d{4}-\d{2}$/.test(body.availabilityTargetMonth.trim())) {
      appData.settings.availabilityTargetMonth = body.availabilityTargetMonth.trim();
    }
    if (body.availabilitySubmissionOpen !== undefined) {
      appData.settings.availabilitySubmissionOpen = body.availabilitySubmissionOpen !== false;
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
      appData.taskTemplates = sortTaskTemplates(body.taskTemplates.map(cleanTaskTemplate).filter((task) => task.title));
      rememberDeletedDefaultTasks(appData);
    }
    if (Array.isArray(body.cleaningTemplates)) {
      appData.cleaningTemplates = body.cleaningTemplates.map(cleanCleaningTemplate).filter((task) => task.title);
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

function rememberDeletedDefaultTasks(appData) {
  const currentIds = new Set((appData.taskTemplates || []).map((task) => task.id).filter(Boolean));
  const deleted = new Set(appData.deletedTaskTemplateIds || []);
  for (const task of defaultData.taskTemplates || []) {
    if (!currentIds.has(task.id)) deleted.add(task.id);
  }
  appData.deletedTaskTemplateIds = [...deleted];
}

function sortTaskTemplates(tasks = []) {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const aTime = Date.parse(a.task.createdAt || "") || 0;
      const bTime = Date.parse(b.task.createdAt || "") || 0;
      if (aTime !== bTime) return aTime - bTime;
      return a.index - b.index;
    })
    .map(({ task }) => task);
}

function cleanVisibility(value, keys) {
  return Object.fromEntries(keys.map((key) => [key, value[key] !== false]));
}

function cleanTarget(value) {
  const text = String(value || "all").trim();
  return ["all", "Counter", "Service", "Kueche", "Reinigung", "Mechanik", "employees"].includes(text) ? text : "all";
}

function cleanEmployeeList(value, settings = {}) {
  const valid = new Set((settings.employees || []).map(String));
  return [...new Set((Array.isArray(value) ? value : [])
    .map(String)
    .map((name) => name.trim())
    .filter((name) => name && valid.has(name)))];
}

function messageRecipients(settings = {}, message = {}) {
  const employees = (settings.employees || []).map(String).filter(Boolean);
  if (message.target === "all") return employees;
  if (message.target === "employees") return cleanEmployeeList(message.employees, settings);
  return employees.filter((employee) => employeeMatchesTarget(settings, employee, message.target));
}

function employeeMatchesTarget(settings = {}, employee, target) {
  const wanted = normalizeDepartment(target);
  const departments = (settings.employeeDepartments?.[employee] || []).map(normalizeDepartment);
  const role = normalizeDepartment(settings.employeeRoles?.[employee] || "");
  return departments.includes(wanted) || role === wanted;
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

function cleanCleaningTemplate(task) {
  return {
    id: String(task.id || `cleaning-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: String(task.title || "").trim().slice(0, 180),
    note: String(task.note || "").trim().slice(0, 600),
    frequency: "weekly",
    weekdays: [],
    createdAt: String(task.createdAt || new Date().toISOString()).slice(0, 40)
  };
}

