const {
  createPinHash,
  defaultData,
  handleError,
  publicSettings,
  readAppData,
  readJson,
  sendInvoiceNotificationEmail,
  sendPushToEmployees,
  sendJson,
  verifyToken,
  writeAppData
} = require("./_data");

const TABLE_PLAN_BASE_IDS = new Set([
  ...Array.from({ length: 14 }, (_, index) => String(index + 1)),
  "T50", "T15", "T16", "T17", "T18", "T19",
  "T28", "T27", "T26", "T25", "T24",
  "T30", "T31", "T32", "T33",
  "T20", "T21", "T22", "T23",
  "T60", "T70",
  "T101", "T102", "T103", "T104"
]);
const TABLE_PLAN_BASE_ZONE_IDS = new Set([
  "lanes",
  "nz-small",
  "main-left",
  "dj",
  "main-bottom",
  "nz-big",
  "hut",
  "billiard"
]);

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
      if (pushSettingEnabled(appData.settings, "messages")) {
        const pushSettings = appData.settings.pushSettings || {};
        await sendPushToEmployees(appData, recipients, {
          title: cleanPushText(pushSettings.messagesTitle, "LA-Bowling - Du hast eine neue Nachricht im Dashboard"),
          body: pushTemplate(pushSettings.messagesBody, { text }) || text,
          url: "/",
          tag: `message-${appData.messages[0].id}`
        });
      }
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, messages: appData.messages });
    }

    if (body.action === "send-push") {
      const title = String(body.title || "LA-Bowling TeamApp").trim().slice(0, 120);
      const text = String(body.text || "").trim().slice(0, 240);
      if (!text) return sendJson(res, 400, { error: "Push-Nachricht fehlt." });
      const target = cleanTarget(body.target);
      const employees = cleanEmployeeList(body.employees, appData.settings);
      const recipients = messageRecipients(appData.settings, { target, employees });
      if (!recipients.length) return sendJson(res, 400, { error: "Bitte mindestens einen Empfänger auswählen." });
      const result = await sendPushToEmployees(appData, recipients, {
        title,
        body: text,
        url: "/",
        tag: `manual-push-${Date.now()}`
      });
      if (result.removed) await writeAppData(appData);
      return sendJson(res, 200, { ok: true, sent: result.sent || 0, removed: result.removed || 0, skipped: Boolean(result.skipped), reason: result.reason || "" });
    }

    if (body.action === "save-push-settings") {
      appData.settings.pushSettings = cleanPushSettings(body.pushSettings, appData.settings.pushSettings);
      await writeAppData(appData);
      return sendJson(res, 200, {
        ok: true,
        settings: {
          ...publicSettings(appData.settings),
          invoiceNotificationTo: appData.settings.invoiceNotificationTo || ""
        }
      });
    }

    if (body.action === "send-invoice-test-mail") {
      const to = String(body.to || appData.settings.invoiceNotificationTo || process.env.INVOICE_NOTIFICATION_TO || "").trim();
      const date = String(body.date || new Date().toISOString().slice(0, 10)).trim();
      const result = await sendInvoiceNotificationEmail({
        to,
        date,
        customer: {
          name: "Testkunde",
          contact: "Testkontakt",
          phone: "000000",
          email: "test@example.com",
          address: "Testadresse 1",
          bowlingAmount: "120.00",
          gastroDrinksAmount: "85.00",
          gastroFoodAmount: "210.00",
          gastroOtherAmount: "60.00",
          gastroOtherNote: "Raummiete",
          tip: "15,00",
          note: "Test-Mail aus dem Backoffice"
        }
      });
      if (result?.ok) {
        return sendJson(res, 200, {
          ok: true,
          sent: true,
          to,
          message: `Test-Mail an ${to} versendet.`
        });
      }
      if (result?.skipped) {
        return sendJson(res, 200, {
          ok: true,
          sent: false,
          skipped: true,
          reason: result.reason || "unbekannt",
          message: result.reason === "missing-smtp-config"
            ? "Test-Mail nicht versendet: SMTP in Vercel fehlt."
            : result.reason === "nodemailer-missing"
              ? "Test-Mail nicht versendet: Mail-Modul fehlt im Build."
              : "Test-Mail nicht versendet."
        });
      }
      return sendJson(res, 500, {
        ok: false,
        sent: false,
        error: result?.error || "Test-Mail konnte nicht versendet werden."
      });
    }

    if (body.action === "save-table-plan-entry") {
      const table = cleanTablePlanEntry(body.table || {});
      if (!table.id || !table.label || !table.area) {
        return sendJson(res, 400, { error: "Bitte Tisch-ID, Bezeichnung und Bereich eintragen." });
      }
      if (!table.seats) {
        return sendJson(res, 400, { error: "Bitte eine gueltige Personenzahl eintragen." });
      }
      appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
      if (table.baseTable) {
        if (!TABLE_PLAN_BASE_IDS.has(table.id)) {
          return sendJson(res, 400, { error: "Dieser Grundtisch ist nicht bekannt." });
        }
        appData.tablePlanConfig.tableOverrides[table.id] = {
          label: table.label,
          area: table.area,
          seats: table.seats,
          x: table.x,
          y: table.y,
          w: table.w,
          h: table.h,
          shape: table.shape
        };
        appData.tablePlanConfig.seatsByTable[table.id] = table.seats;
      } else {
        if (TABLE_PLAN_BASE_IDS.has(table.id)) {
          return sendJson(res, 400, { error: "Diese Tisch-ID ist bereits im Grundriss vorhanden." });
        }
        const nextCustomTables = (appData.tablePlanConfig.customTables || []).filter((item) => item.id !== table.id);
        nextCustomTables.push({
          id: table.id,
          label: table.label,
          area: table.area,
          seats: table.seats,
          x: table.x,
          y: table.y,
          w: table.w,
          h: table.h,
          shape: table.shape
        });
        appData.tablePlanConfig.customTables = sortTablePlanEntries(nextCustomTables);
        appData.tablePlanConfig.seatsByTable[table.id] = table.seats;
      }
      appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
      await writeAppData(appData);
      return sendJson(res, 200, {
        ok: true,
        message: table.baseTable ? `Grundtisch ${table.id} gespeichert.` : `Tisch ${table.id} gespeichert.`,
        tablePlanConfig: appData.tablePlanConfig
      });
    }

    if (body.action === "delete-table-plan-entry") {
      const tableId = cleanTablePlanId(body.tableId);
      if (!tableId) return sendJson(res, 400, { error: "Tisch nicht gefunden." });
      appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
      const isBaseTable = body.baseTable === true || body.baseTable === "true";
      if (isBaseTable || TABLE_PLAN_BASE_IDS.has(tableId)) {
        delete appData.tablePlanConfig.tableOverrides[tableId];
        delete appData.tablePlanConfig.seatsByTable[tableId];
        appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
        await writeAppData(appData);
        return sendJson(res, 200, {
          ok: true,
          message: `Standardwerte fuer ${tableId} wiederhergestellt.`,
          tablePlanConfig: appData.tablePlanConfig
        });
      }
      const exists = (appData.tablePlanConfig.customTables || []).some((item) => item.id === tableId);
      if (!exists) return sendJson(res, 400, { error: "Nur selbst angelegte Tische koennen geloescht werden." });
      appData.tablePlanConfig.customTables = (appData.tablePlanConfig.customTables || []).filter((item) => item.id !== tableId);
      delete appData.tablePlanConfig.seatsByTable[tableId];
      delete appData.tablePlanConfig.tableOverrides[tableId];
      appData.dayReports = Object.fromEntries(Object.entries(appData.dayReports || {}).map(([dateKey, report]) => {
        const tableReservations = Array.isArray(report?.tableReservations) ? report.tableReservations : [];
        const tableGroups = Array.isArray(report?.tableGroups) ? report.tableGroups : [];
        const tableStaffAssignments = Array.isArray(report?.tableStaffAssignments) ? report.tableStaffAssignments : [];
        return [dateKey, {
          ...report,
          tableReservations: tableReservations
            .map((item) => ({
              ...item,
              tableIds: [...new Set((Array.isArray(item?.tableIds) ? item.tableIds : []).map(cleanTablePlanId).filter((id) => id && id !== tableId))]
            }))
            .filter((item) => item.tableIds.length),
          tableGroups: tableGroups
            .map((item) => ({
              ...item,
              tableIds: [...new Set((Array.isArray(item?.tableIds) ? item.tableIds : []).map(cleanTablePlanId).filter((id) => id && id !== tableId))]
            }))
            .filter((item) => item.tableIds.length >= 2),
          tableStaffAssignments: tableStaffAssignments
            .map((item) => ({
              ...item,
              presetId: cleanTablePlanId(item?.presetId) === tableId ? "" : cleanTablePlanId(item?.presetId),
              tableIds: [...new Set((Array.isArray(item?.tableIds) ? item.tableIds : []).map(cleanTablePlanId).filter((id) => id && id !== tableId))]
            }))
            .filter((item) => item.presetId || item.tableIds.length)
        }];
      }));
      appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
      await writeAppData(appData);
      return sendJson(res, 200, {
        ok: true,
        message: `Tisch ${tableId} geloescht.`,
        tablePlanConfig: appData.tablePlanConfig
      });
    }

    if (body.action === "save-table-plan-zone") {
      const zone = cleanTablePlanZoneEntry(body.zone || {});
      if (!zone.id || !TABLE_PLAN_BASE_ZONE_IDS.has(zone.id)) {
        return sendJson(res, 400, { error: "Bereich nicht gefunden." });
      }
      if (!zone.label) {
        return sendJson(res, 400, { error: "Bitte Bereichsname eintragen." });
      }
      appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
      appData.tablePlanConfig.zoneOverrides[zone.id] = {
        label: zone.label,
        x: zone.x,
        y: zone.y,
        w: zone.w,
        h: zone.h,
        className: zone.className,
        visible: zone.visible !== false
      };
      appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
      await writeAppData(appData);
      return sendJson(res, 200, {
        ok: true,
        message: `Bereich ${zone.label} gespeichert.`,
        tablePlanConfig: appData.tablePlanConfig
      });
    }

    if (body.action === "delete-table-plan-zone") {
      const zoneId = cleanTablePlanZoneId(body.zoneId);
      if (!zoneId || !TABLE_PLAN_BASE_ZONE_IDS.has(zoneId)) {
        return sendJson(res, 400, { error: "Bereich nicht gefunden." });
      }
      appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
      delete appData.tablePlanConfig.zoneOverrides[zoneId];
      appData.tablePlanConfig = normalizeTablePlanConfigSettings(appData.tablePlanConfig);
      await writeAppData(appData);
      return sendJson(res, 200, {
        ok: true,
        message: "Bereich auf Standard zurückgesetzt.",
        tablePlanConfig: appData.tablePlanConfig
      });
    }

    if (body.action === "delete-message") {
      const id = String(body.id || "");
      appData.messages = (appData.messages || []).filter((message) => message.id !== id);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, messages: appData.messages });
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
    if (body.employeeTipSettings && typeof body.employeeTipSettings === "object") {
      appData.settings.employeeTipSettings = cleanEmployeeTipSettings(body.employeeTipSettings, appData.settings);
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
    if (typeof body.invoiceNotificationTo === "string") {
      appData.settings.invoiceNotificationTo = body.invoiceNotificationTo.trim().slice(0, 180) || appData.settings.invoiceNotificationTo || "pvo65@outlook.de";
    }
    if (body.pushSettings && typeof body.pushSettings === "object") {
      appData.settings.pushSettings = cleanPushSettings(body.pushSettings, appData.settings.pushSettings);
    }

    await writeAppData(appData);
    sendJson(res, 200, {
      ok: true,
      settings: {
        ...publicSettings(appData.settings),
        invoiceNotificationTo: appData.settings.invoiceNotificationTo || ""
      }
    });
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

function cleanEmployeeTipSettings(value = {}, settings = {}) {
  const currentEmployees = new Set((settings.employees || []).map(String));
  const result = {};
  for (const [name, setting] of Object.entries(value || {})) {
    const employee = String(name || "").trim();
    if (!employee || !currentEmployees.has(employee)) continue;
    const factor = Number(String(setting?.factor ?? "").replace(",", "."));
    result[employee] = {
      eligible: setting?.eligible === true,
      factor: Number.isFinite(factor) ? Math.max(0.1, Math.min(1, Math.round(factor * 1000) / 1000)) : 1
    };
  }
  return result;
}

function normalizeTablePlanConfigSettings(value = {}) {
  const customTables = sortTablePlanEntries((Array.isArray(value?.customTables) ? value.customTables : [])
    .map((item) => cleanTablePlanEntry(item))
    .filter((item) => item.id && !item.baseTable && !TABLE_PLAN_BASE_IDS.has(item.id)));
  const allowedIds = new Set([...TABLE_PLAN_BASE_IDS, ...customTables.map((item) => item.id)]);
  const seatsByTable = {};
  if (value?.seatsByTable && typeof value.seatsByTable === "object" && !Array.isArray(value.seatsByTable)) {
    for (const [tableId, seats] of Object.entries(value.seatsByTable)) {
      const cleanId = cleanTablePlanId(tableId);
      const cleanSeats = cleanTablePlanInteger(seats, 1, 200);
      if (cleanId && cleanSeats && allowedIds.has(cleanId)) seatsByTable[cleanId] = cleanSeats;
    }
  }
  const tableOverrides = {};
  if (value?.tableOverrides && typeof value.tableOverrides === "object" && !Array.isArray(value.tableOverrides)) {
    for (const [tableId, entry] of Object.entries(value.tableOverrides)) {
      const cleanId = cleanTablePlanId(tableId);
      if (!cleanId || !TABLE_PLAN_BASE_IDS.has(cleanId)) continue;
      const cleaned = cleanTablePlanEntry({ ...(entry || {}), id: cleanId, baseTable: true });
      if (!cleaned.id) continue;
      tableOverrides[cleanId] = {
        label: cleaned.label || cleanId,
        area: cleaned.area || "",
        seats: cleaned.seats || seatsByTable[cleanId] || 4,
        x: cleaned.x,
        y: cleaned.y,
        w: cleaned.w,
        h: cleaned.h,
        shape: cleaned.shape
      };
      seatsByTable[cleanId] = tableOverrides[cleanId].seats;
    }
  }
  const zoneOverrides = {};
  if (value?.zoneOverrides && typeof value.zoneOverrides === "object" && !Array.isArray(value.zoneOverrides)) {
    for (const [zoneId, entry] of Object.entries(value.zoneOverrides)) {
      const cleanId = cleanTablePlanZoneId(zoneId);
      if (!cleanId || !TABLE_PLAN_BASE_ZONE_IDS.has(cleanId)) continue;
      const cleaned = cleanTablePlanZoneEntry({ ...(entry || {}), id: cleanId });
      if (!cleaned.id) continue;
      zoneOverrides[cleanId] = {
        label: cleaned.label || cleanId,
        x: cleaned.x,
        y: cleaned.y,
        w: cleaned.w,
        h: cleaned.h,
        className: cleaned.className,
        visible: cleaned.visible !== false
      };
    }
  }
  return { seatsByTable, tableOverrides, customTables, zoneOverrides };
}

function cleanTablePlanEntry(value = {}) {
  const id = cleanTablePlanId(value.id || value.originalId);
  return {
    id,
    originalId: cleanTablePlanId(value.originalId || id),
    baseTable: value.baseTable === true || value.baseTable === "true",
    label: cleanTablePlanText(value.label, 60),
    area: cleanTablePlanText(value.area, 80),
    seats: cleanTablePlanInteger(value.seats, 1, 200),
    x: cleanTablePlanDecimal(value.x, 0, 96),
    y: cleanTablePlanDecimal(value.y, 0, 96),
    w: cleanTablePlanDecimal(value.w, 2, 40),
    h: cleanTablePlanDecimal(value.h, 2, 30),
    shape: cleanTablePlanShape(value.shape)
  };
}

function cleanTablePlanZoneEntry(value = {}) {
  const id = cleanTablePlanZoneId(value.id || value.originalId);
  return {
    id,
    originalId: cleanTablePlanZoneId(value.originalId || id),
    label: cleanTablePlanText(value.label, 60),
    x: cleanTablePlanDecimal(value.x, 0, 98),
    y: cleanTablePlanDecimal(value.y, 0, 98),
    w: cleanTablePlanDecimal(value.w, 4, 98),
    h: cleanTablePlanDecimal(value.h, 4, 98),
    className: cleanTablePlanZoneClass(value.className),
    visible: cleanTablePlanBoolean(value.visible, true)
  };
}

function sortTablePlanEntries(entries = []) {
  return [...(Array.isArray(entries) ? entries : [])]
    .filter((item) => item?.id)
    .sort((left, right) => {
      const topCompare = Number(left.y || 0) - Number(right.y || 0);
      if (Math.abs(topCompare) > 0.1) return topCompare;
      const leftCompare = Number(left.x || 0) - Number(right.x || 0);
      if (Math.abs(leftCompare) > 0.1) return leftCompare;
      return String(left.id || "").localeCompare(String(right.id || ""), "de", { numeric: true });
    });
}

function cleanTablePlanId(value) {
  return String(value || "").trim().replace(/\s+/g, "").slice(0, 16);
}

function cleanTablePlanZoneId(value) {
  return String(value || "").trim().slice(0, 32);
}

function cleanTablePlanText(value, max = 80) {
  return String(value || "").trim().slice(0, max);
}

function cleanTablePlanInteger(value, min, max) {
  const number = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number)) return 0;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function cleanTablePlanDecimal(value, min, max) {
  const number = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number)) return 0;
  return Math.round(Math.max(min, Math.min(max, number)) * 10) / 10;
}

function cleanTablePlanShape(value) {
  return ["table", "room", "lane"].includes(String(value || "").trim()) ? String(value).trim() : "table";
}

function cleanTablePlanZoneClass(value) {
  return ["is-lanes", "is-room", "is-open"].includes(String(value || "").trim()) ? String(value).trim() : "is-open";
}

function cleanTablePlanBoolean(value, fallback = true) {
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return fallback;
}

function cleanPushSettings(value = {}, fallback = {}) {
  const source = value && typeof value === "object" ? value : {};
  const read = (key) => Object.prototype.hasOwnProperty.call(source, key)
    ? source[key] !== false
    : fallback?.[key] !== false;
  return {
    schedulePublished: read("schedulePublished"),
    assignmentsTomorrow: read("assignmentsTomorrow"),
    messages: read("messages"),
    schedulePublishedTitle: cleanPushText(source.schedulePublishedTitle, fallback?.schedulePublishedTitle || "LA-Bowling - Neuer Dienstplan online"),
    schedulePublishedBody: cleanPushText(source.schedulePublishedBody, fallback?.schedulePublishedBody || "Der neue Dienstplan ist online. Bitte in der TeamApp prüfen."),
    assignmentsTomorrowTitle: cleanPushText(source.assignmentsTomorrowTitle, fallback?.assignmentsTomorrowTitle || "LA-Bowling - Einteilung für morgen ist Online"),
    assignmentsTomorrowBody: cleanPushText(source.assignmentsTomorrowBody, fallback?.assignmentsTomorrowBody || "Bitte prüfe deine Startzeit in der TeamApp."),
    messagesTitle: cleanPushText(source.messagesTitle, fallback?.messagesTitle || "LA-Bowling - Du hast eine neue Nachricht im Dashboard"),
    messagesBody: cleanPushText(source.messagesBody, fallback?.messagesBody || "{{text}}")
  };
}

function cleanPushText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text ? text.slice(0, 240) : String(fallback || "").trim().slice(0, 240);
}

function pushTemplate(template, values = {}) {
  return String(template || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const value = values[key];
    return value == null ? "" : String(value);
  }).trim();
}

function pushSettingEnabled(settings = {}, key) {
  return (settings.pushSettings || {})[key] !== false;
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

