const { handleError, publicSettings, readAppData, readJson, sendInvoiceNotificationEmail, sendJson, sendPushToEmployees, signToken, uploadReceiptDataUrl, verifyToken, writeAppData } = require("./_data");
const crypto = require("crypto");
const { defaultData } = require("./_data");
const { sameEmployeeName } = require("./_data");

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
    if (action === "remove-employee") return removeEmployee(body, res);
    if (action === "complete-task") return completeTask(body, res);
    if (action === "complete-cleaning") return completeCleaning(body, res);
    if (action === "confirm-toilet" || action === "toilet-check") return confirmToilet(body, res);
    if (action === "confirm-reminder") return confirmReminder(body, res);
    if (action === "confirm-terminal-message") return confirmTerminalMessage(body, res);
    if (action === "save-day-meta") return saveDayMeta(body, res);
    if (action === "save-assignment-times") return saveAssignmentTimes(body, res);
    if (action === "add-handover") return addHandover(body, res);
    if (action === "save-table-reservation") return saveTableReservation(body, res);
    if (action === "delete-table-reservation") return deleteTableReservation(body, res);
    if (action === "save-table-config") return saveTableConfig(body, res);
    if (action === "save-custom-table-config") return saveCustomTableConfig(body, res);
    if (action === "delete-custom-table-config") return deleteCustomTableConfig(body, res);
    if (action === "save-table-group") return saveTableGroup(body, res);
    if (action === "delete-table-group") return deleteTableGroup(body, res);
    if (action === "save-table-staff-assignment") return saveTableStaffAssignment(body, res);
    if (action === "delete-table-staff-assignment") return deleteTableStaffAssignment(body, res);
    if (action === "save-tips") return saveTips(body, res);
    if (action === "confirm-employee-tip-payout") return confirmEmployeeTipPayout(body, res);
    if (action === "confirm-tip-payout") return confirmTipPayout(body, res);
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
  if (require("./_data").syncReportTipsToTimesheets(appData)) await writeAppData(appData);
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
  if (require("./_data").syncReportTipsToTimesheets(appData)) await writeAppData(appData);
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

async function punch(body, res) {
  const appData = await readAppData(), employee = String(body.employee || "").trim(), punchType = String(body.punchType || "").trim(), date = cleanDate(body.date);
  if (!employee || !["start", "end"].includes(punchType)) return sendJson(res, 400, { error: "Mitarbeiter oder Aktion fehlt." });
  if (!(appData.settings.employees || []).includes(employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const month = date.slice(0, 7), time = roundToQuarter(new Date());
  appData.timesheets ||= {}; appData.timesheets[month] ||= {}; appData.timesheets[month][employee] ||= {};
  const existing = appData.timesheets[month][employee][date] || {};
  const segments = cleanTimeSegments(existing.segments, existing);
  if (punchType === "start") {
    if (!segments.length || (segments.at(-1).from && segments.at(-1).to)) {
      segments.push({ from: time, to: "" });
    } else {
      segments[segments.length - 1].from = time;
    }
  } else if (!segments.length) {
    segments.push({ from: "", to: time });
  } else {
    segments[segments.length - 1].to = time;
  }
  const bounds = timeBoundsFromSegments(segments);
  const nextEntry = { ...existing, ...bounds, segments, updatedAt: new Date().toISOString(), source: "terminal" };
  appData.timesheets[month][employee][date] = nextEntry;
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `${employee}: ${punchType === "start" ? "Beginn" : "Ende"} ${time}`, ...terminalPayload(appData, date) });
}

async function adjustTime(body, res) {
  const appData = await readAppData(), employee = String(body.employee || "").trim(), date = cleanDate(body.date), month = date.slice(0, 7);
  if (!(appData.settings.employees || []).includes(employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.timesheets ||= {}; appData.timesheets[month] ||= {}; appData.timesheets[month][employee] ||= {};
  const segments = cleanTimeSegments(body.segments, { from: body.from, to: body.to });
  const bounds = timeBoundsFromSegments(segments);
  appData.timesheets[month][employee][date] = { ...(appData.timesheets[month][employee][date] || {}), ...bounds, segments, updatedAt: new Date().toISOString(), source: "terminal-correction" };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `${employee}: Zeiten korrigiert.`, ...terminalPayload(appData, date) });
}

async function addEmployee(body, res) {
  const appData = await readAppData(), employee = String(body.employee || "").trim(), date = cleanDate(body.date);
  if (!(appData.settings.employees || []).includes(employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.dayReports ||= {}; const report = appData.dayReports[date] || {}, role = String(body.role || "Zusatz").trim().slice(0, 80);
  const scheduleDay = appData.schedules?.[date.slice(0, 7)]?.days?.[date] || {};
  const isPlanned = Object.entries(scheduleDay).some(([key, value]) => !key.includes("__") && value === employee);
  const extraEmployees = (report.extraEmployees || []).map((item) => typeof item === "string" ? { employee: item, role: "Zusatz" } : item).filter((item) => item?.employee !== employee);
  const removedEmployees = cleanEmployeeList(report.removedEmployees).filter((name) => name !== employee);
  appData.dayReports[date] = {
    ...report,
    extraEmployees: isPlanned ? extraEmployees : [...extraEmployees, { employee, role }],
    removedEmployees,
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `${employee} wurde hinzugefügt.`, ...terminalPayload(appData, date) });
}

async function removeEmployee(body, res) {
  const appData = await readAppData(), employee = String(body.employee || "").trim(), date = cleanDate(body.date);
  if (!(appData.settings.employees || []).includes(employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const extraEmployees = (report.extraEmployees || [])
    .map((item) => typeof item === "string" ? { employee: item, role: "Zusatz" } : item)
    .filter((item) => item?.employee !== employee);
  const removedEmployees = [...new Set([...cleanEmployeeList(report.removedEmployees), employee])];
  appData.dayReports[date] = { ...report, extraEmployees, removedEmployees, updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `${employee} wurde aus der Terminal-Ansicht entfernt.`, ...terminalPayload(appData, date) });
}

async function saveReport(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen und kann nicht mehr geaendert werden." });
  appData.dayReports ||= {};
  const ecTerminal1 = Object.prototype.hasOwnProperty.call(body, "ecTerminal1") ? cleanMoney(body.ecTerminal1) : existing.ecTerminal1 || "";
  const ecTerminal2 = Object.prototype.hasOwnProperty.call(body, "ecTerminal2") ? cleanMoney(body.ecTerminal2) : existing.ecTerminal2 || "";
  const ecTotal = cleanEcTotal(body.ecTotal, ecTerminal1, ecTerminal2);
  const revenueDrinks = cleanMoney(body.revenueDrinks ?? existing.revenueDrinks);
  const revenueFood = cleanMoney(body.revenueFood ?? existing.revenueFood);
  const revenueOther = cleanMoney(body.revenueOther ?? existing.revenueOther);
  const revenueGastro = cleanGastroTotal(body.revenueGastro ?? body.barGastro ?? existing.revenueGastro ?? existing.barGastro, revenueDrinks, revenueFood, revenueOther);
  const personalConsumption = cleanMoney(body.personalConsumption ?? existing.personalConsumption);
  const cashExpenses = cleanMoney(body.cashExpenses ?? existing.cashExpenses);
  const invoiceCustomers = await cleanReportItems(body.invoiceCustomers, "invoice", date);
  const cleanedExpenses = await cleanReportItems(body.expenses, "expense", date);
  const expenses = body.mergeExpenses === true || body.mergeExpenses === "true"
    ? mergeReportItemsById(existing.expenses || [], cleanedExpenses)
    : cleanedExpenses;
  const documents = await cleanReportDocuments(body.documents || existing.documents, date);
  upsertCustomerDirectory(appData, invoiceCustomers);
  appData.dayReports[date] = { ...existing, cashTotal: cleanMoney(body.cashTotal), cashExpenses, ecTerminal1, ecTerminal2, ecTotal, personalConsumption, revenueBowling: cleanMoney(body.revenueBowling ?? body.barBowling), revenueDrinks, revenueFood, revenueOther, revenueGastro, barBowling: cleanMoney(body.barBowling ?? body.revenueBowling), barGastro: revenueGastro, tipTotal: cleanMoney(body.tipTotal ?? existing.tipTotal), tipRemainder: cleanMoney(body.tipRemainder ?? existing.tipRemainder), tipsByEmployee: cleanTipsByEmployee(body.tipsByEmployee || existing.tipsByEmployee), invoiceCustomers, expenses, documents, notes: String(body.notes || "").trim().slice(0, 2000), openingHours: cleanText(body.openingHours || existing.openingHours, 80), shiftLeader: cleanText(body.shiftLeader || existing.shiftLeader, 160), extraEmployees: cleanExtraEmployees(body.extraEmployees || existing.extraEmployees), removedEmployees: cleanEmployeeList(body.removedEmployees || existing.removedEmployees), handovers: cleanHandovers(body.handovers || existing.handovers), taskCompletions: cleanTaskCompletions(body.taskCompletions || existing.taskCompletions), cleaningCompletions: cleanCleaningCompletions(body.cleaningCompletions || existing.cleaningCompletions), toiletChecks: cleanToiletChecks(body.toiletChecks || existing.toiletChecks), reminderChecks: cleanToiletChecks(body.reminderChecks || existing.reminderChecks), terminalMessageChecks: cleanTerminalMessageChecks(body.terminalMessageChecks || existing.terminalMessageChecks), tipPayoutConfirmedAt: body.resetTipPayout ? "" : existing.tipPayoutConfirmedAt, tipPayoutAmount: body.resetTipPayout ? "" : existing.tipPayoutAmount, tipPayoutRemainder: body.resetTipPayout ? "" : existing.tipPayoutRemainder, updatedAt: new Date().toISOString() };
  applyTipsToTimesheets(appData, date, appData.dayReports[date].tipsByEmployee);
  await writeAppData(appData);
  const shouldSendInvoiceNotifications = body.sendInvoiceNotifications === true || body.sendInvoiceNotifications === "true";
  const targetInvoiceId = shouldSendInvoiceNotifications ? String(body.sendInvoiceNotificationId || "").trim() : "";
  const forceInvoiceNotification = shouldSendInvoiceNotifications && Boolean(targetInvoiceId);
  const mailResult = shouldSendInvoiceNotifications
    ? await sendReadyInvoiceNotifications(appData, date, targetInvoiceId, { forceResend: forceInvoiceNotification })
    : { sent: 0, failed: 0, skipped: 0, skipReasons: [], changed: false, errors: [] };
  const mailMessage = mailResult.sent || mailResult.failed || mailResult.skipped
    ? mailResult.failed
      ? (mailResult.sent ? "E-Mail teilweise versendet." : "E-Mail konnte nicht versendet werden.")
      : mailResult.skipped
        ? (mailResult.skipReasons.some((item) => item.reason === "missing-smtp-config")
          ? "E-Mail nicht versendet: SMTP in Vercel fehlt."
          : mailResult.skipReasons.some((item) => item.reason === "nodemailer-missing")
            ? "E-Mail nicht versendet: Mail-Modul fehlt im Build."
            : "E-Mail nicht versendet."
        )
      : "E-Mail wurde versendet."
    : "";
  sendJson(res, 200, { ok: true, message: "Tagesbericht gespeichert.", mailMessage, mailSent: mailResult.sent > 0, mailFailed: mailResult.failed > 0, ...terminalPayload(appData, date) });
}

async function saveTableReservation(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const reservation = cleanTableReservation(body.reservation || {});
  if (!reservation.tableIds.length) return sendJson(res, 400, { error: "Bitte mindestens einen Tisch auswählen." });
  if (!reservation.time) return sendJson(res, 400, { error: "Bitte eine Uhrzeit eintragen." });
  if (!reservation.name) return sendJson(res, 400, { error: "Bitte einen Reservierungsnamen eintragen." });
  if (!reservation.people) return sendJson(res, 400, { error: "Bitte die Personenzahl eintragen." });
  appData.dayReports ||= {};
  const report = defaultReport(existing);
  const reservations = cleanTableReservations(report.tableReservations || []);
  const now = new Date().toISOString();
  const nextReservation = {
    ...reservation,
    createdAt: reservation.createdAt || now,
    updatedAt: now
  };
  const index = reservations.findIndex((item) => item.id === nextReservation.id);
  if (index >= 0) {
    nextReservation.createdAt = reservations[index].createdAt || nextReservation.createdAt;
    reservations[index] = nextReservation;
  } else {
    reservations.push(nextReservation);
  }
  appData.dayReports[date] = {
    ...report,
    tableReservations: sortTableReservations(reservations),
    updatedAt: now
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Reservierung gespeichert.", ...terminalPayload(appData, date) });
}

async function deleteTableReservation(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const id = cleanText(body.id, 120);
  if (!id) return sendJson(res, 400, { error: "Reservierung nicht gefunden." });
  appData.dayReports ||= {};
  const report = defaultReport(existing);
  appData.dayReports[date] = {
    ...report,
    tableReservations: cleanTableReservations(report.tableReservations || []).filter((item) => item.id !== id),
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Reservierung gelöscht.", ...terminalPayload(appData, date) });
}

async function saveTableConfig(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const tableId = cleanTableId(body.tableId);
  if (!tableId) return sendJson(res, 400, { error: "Tisch nicht gefunden." });
  const seats = cleanInteger(body.seats, 1, 200);
  if (!seats) return sendJson(res, 400, { error: "Bitte eine gültige Standard-Personenzahl eintragen." });
  appData.tablePlanConfig = normalizeTablePlanConfig(appData.tablePlanConfig);
  appData.tablePlanConfig.seatsByTable[tableId] = seats;
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `Standard-Personenzahl für ${tableId} gespeichert.`, ...terminalPayload(appData, date) });
}

async function saveCustomTableConfig(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.tablePlanConfig = normalizeTablePlanConfig(appData.tablePlanConfig);
  const table = cleanCustomTable(body.table || {});
  if (!table.id || !table.label || !table.area) return sendJson(res, 400, { error: "Bitte Tisch-ID, Bezeichnung und Bereich eintragen." });
  if (!table.seats) return sendJson(res, 400, { error: "Bitte eine gültige Sitzplatzzahl eintragen." });
  if (TABLE_PLAN_BASE_IDS.has(table.id)) return sendJson(res, 400, { error: "Diese Tisch-ID ist bereits im Grundriss vorhanden." });
  const nextTables = (appData.tablePlanConfig.customTables || []).filter((item) => item.id !== table.id);
  nextTables.push(table);
  appData.tablePlanConfig.customTables = sortCustomTables(nextTables);
  appData.tablePlanConfig.seatsByTable[table.id] = table.seats;
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `Tisch ${table.id} gespeichert.`, ...terminalPayload(appData, date) });
}

async function deleteCustomTableConfig(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const tableId = cleanTableId(body.tableId);
  if (!tableId) return sendJson(res, 400, { error: "Tisch nicht gefunden." });
  appData.tablePlanConfig = normalizeTablePlanConfig(appData.tablePlanConfig);
  const exists = (appData.tablePlanConfig.customTables || []).some((item) => item.id === tableId);
  if (!exists) return sendJson(res, 400, { error: "Nur selbst angelegte Tische können hier gelöscht werden." });
  appData.tablePlanConfig.customTables = (appData.tablePlanConfig.customTables || []).filter((item) => item.id !== tableId);
  delete appData.tablePlanConfig.seatsByTable[tableId];
  appData.dayReports = Object.fromEntries(Object.entries(appData.dayReports || {}).map(([dateKey, report]) => {
    const cleaned = defaultReport(report);
    return [dateKey, {
      ...cleaned,
      tableReservations: cleanTableReservations(cleaned.tableReservations || []).map((item) => ({
        ...item,
        tableIds: item.tableIds.filter((id) => id !== tableId)
      })).filter((item) => item.tableIds.length),
      tableGroups: cleanTableGroups(cleaned.tableGroups || []).map((item) => ({
        ...item,
        tableIds: item.tableIds.filter((id) => id !== tableId)
      })).filter((item) => item.tableIds.length >= 2),
      tableStaffAssignments: cleanTableStaffAssignments(cleaned.tableStaffAssignments || []).map((item) => {
        const presetId = item.presetId === tableId ? "" : item.presetId;
        return { ...item, presetId };
      }).filter((item) => item.presetId)
    }];
  }));
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `Tisch ${tableId} gelöscht.`, ...terminalPayload(appData, date) });
}

async function saveTableGroup(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const group = cleanTableGroup(body.group || {});
  if (group.tableIds.length < 2) return sendJson(res, 400, { error: "Bitte mindestens zwei Tische für eine Tafel auswählen." });
  if (!group.label) return sendJson(res, 400, { error: "Bitte eine Tischnummer oder Bezeichnung für die Tafel eintragen." });
  appData.dayReports ||= {};
  const report = defaultReport(existing);
  const groups = cleanTableGroups(report.tableGroups || []);
  const selectedIds = new Set(group.tableIds);
  const now = new Date().toISOString();
  const next = {
    ...group,
    createdAt: group.createdAt || now,
    updatedAt: now
  };
  const merged = groups
    .filter((item) => item.id !== next.id)
    .map((item) => ({ ...item, tableIds: item.tableIds.filter((tableId) => !selectedIds.has(tableId)) }))
    .filter((item) => item.tableIds.length >= 2);
  const existingIndex = groups.findIndex((item) => item.id === next.id);
  if (existingIndex >= 0) next.createdAt = groups[existingIndex].createdAt || next.createdAt;
  merged.push(next);
  appData.dayReports[date] = {
    ...report,
    tableGroups: sortTableGroups(merged),
    updatedAt: now
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Tafel gespeichert.", ...terminalPayload(appData, date) });
}

async function deleteTableGroup(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const id = cleanText(body.id, 120);
  if (!id) return sendJson(res, 400, { error: "Tafel nicht gefunden." });
  appData.dayReports ||= {};
  const report = defaultReport(existing);
  appData.dayReports[date] = {
    ...report,
    tableGroups: cleanTableGroups(report.tableGroups || []).filter((item) => item.id !== id),
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Tafel gelöscht.", ...terminalPayload(appData, date) });
}

async function saveTableStaffAssignment(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const assignment = cleanTableStaffAssignment(body.assignment || {});
  if (!assignment.employee) return sendJson(res, 400, { error: "Bitte Mitarbeiter auswählen." });
  if (!assignment.presetId) return sendJson(res, 400, { error: "Bitte Bereich auswählen." });
  if (!(appData.settings?.employees || []).includes(assignment.employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  appData.dayReports ||= {};
  const report = defaultReport(existing);
  const assignments = cleanTableStaffAssignments(report.tableStaffAssignments || []);
  const index = assignments.findIndex((item) => item.id === assignment.id);
  const now = new Date().toISOString();
  const next = {
    ...assignment,
    createdAt: assignment.createdAt || now,
    updatedAt: now
  };
  if (index >= 0) {
    next.createdAt = assignments[index].createdAt || next.createdAt;
    assignments[index] = next;
  } else {
    assignments.push(next);
  }
  appData.dayReports[date] = {
    ...report,
    tableStaffAssignments: sortTableStaffAssignments(assignments),
    updatedAt: now
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Personalbereich gespeichert.", ...terminalPayload(appData, date) });
}

async function deleteTableStaffAssignment(body, res) {
  const appData = await readAppData();
  const date = cleanDate(body.date);
  const existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const id = cleanText(body.id, 120);
  if (!id) return sendJson(res, 400, { error: "Bereich nicht gefunden." });
  appData.dayReports ||= {};
  const report = defaultReport(existing);
  appData.dayReports[date] = {
    ...report,
    tableStaffAssignments: cleanTableStaffAssignments(report.tableStaffAssignments || []).filter((item) => item.id !== id),
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Personalbereich gelöscht.", ...terminalPayload(appData, date) });
}

async function saveTips(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.dayReports ||= {};
  const tipsByEmployee = cleanTipsByEmployee(body.tipsByEmployee || {});
  const ecTerminal1 = cleanMoney(body.ecTerminal1);
  const ecTerminal2 = cleanMoney(body.ecTerminal2);
  const revenueDrinks = cleanMoney(body.revenueDrinks);
  const revenueFood = cleanMoney(body.revenueFood);
  const revenueOther = cleanMoney(body.revenueOther);
  const revenueGastro = cleanGastroTotal(body.revenueGastro, revenueDrinks, revenueFood, revenueOther);
  const personalConsumption = cleanMoney(body.personalConsumption ?? existing.personalConsumption);
  const cashExpenses = cleanMoney(body.cashExpenses ?? existing.cashExpenses);
  const documents = await cleanReportDocuments(body.documents || existing.documents, date);
  appData.dayReports[date] = {
    ...existing,
    cashTotal: cleanMoney(body.cashTotal),
    cashExpenses,
    ecTerminal1,
    ecTerminal2,
    ecTotal: cleanEcTotal(body.ecTotal, ecTerminal1, ecTerminal2),
    personalConsumption,
    revenueBowling: cleanMoney(body.revenueBowling),
    revenueDrinks,
    revenueFood,
    revenueOther,
    revenueGastro,
    barBowling: cleanMoney(body.revenueBowling),
    barGastro: revenueGastro,
    tipTotal: cleanMoney(body.tipTotal),
    tipRemainder: cleanMoney(body.tipRemainder),
    tipPayoutConfirmedAt: body.resetTipPayout ? "" : existing.tipPayoutConfirmedAt,
    tipPayoutAmount: body.resetTipPayout ? "" : existing.tipPayoutAmount,
    tipPayoutRemainder: body.resetTipPayout ? "" : existing.tipPayoutRemainder,
    tipsByEmployee,
    documents,
    updatedAt: new Date().toISOString()
  };
  applyTipsToTimesheets(appData, date, tipsByEmployee);
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Umsatzdetails gespeichert.", ...terminalPayload(appData, date) });
}

async function confirmTipPayout(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date);
  appData.dayReports ||= {};
  const existing = appData.dayReports[date] || {};
  const tipsByEmployee = cleanTipsByEmployee(body.tipsByEmployee || existing.tipsByEmployee);
  const ecTerminal1 = Object.prototype.hasOwnProperty.call(body, "ecTerminal1") ? cleanMoney(body.ecTerminal1) : existing.ecTerminal1 || "";
  const ecTerminal2 = Object.prototype.hasOwnProperty.call(body, "ecTerminal2") ? cleanMoney(body.ecTerminal2) : existing.ecTerminal2 || "";
  const revenueDrinks = cleanMoney(body.revenueDrinks ?? existing.revenueDrinks);
  const revenueFood = cleanMoney(body.revenueFood ?? existing.revenueFood);
  const revenueOther = cleanMoney(body.revenueOther ?? existing.revenueOther);
  const revenueGastro = cleanGastroTotal(body.revenueGastro ?? existing.revenueGastro, revenueDrinks, revenueFood, revenueOther);
  appData.dayReports[date] = {
    ...existing,
    cashTotal: Object.prototype.hasOwnProperty.call(body, "cashTotal") ? cleanMoney(body.cashTotal) : existing.cashTotal || "",
    cashExpenses: cleanMoney(body.cashExpenses ?? existing.cashExpenses),
    ecTerminal1,
    ecTerminal2,
    ecTotal: cleanEcTotal(body.ecTotal ?? existing.ecTotal, ecTerminal1, ecTerminal2),
    personalConsumption: cleanMoney(body.personalConsumption ?? existing.personalConsumption),
    revenueBowling: cleanMoney(body.revenueBowling ?? existing.revenueBowling),
    revenueDrinks,
    revenueFood,
    revenueOther,
    revenueGastro,
    barBowling: cleanMoney(body.revenueBowling ?? existing.barBowling),
    barGastro: revenueGastro,
    tipTotal: cleanMoney(body.tipTotal ?? existing.tipTotal),
    tipRemainder: cleanMoney(body.tipRemainder ?? existing.tipRemainder),
    tipsByEmployee,
    tipPayoutConfirmedAt: new Date().toISOString(),
    tipPayoutAmount: cleanMoney(body.tipPayoutAmount),
    tipPayoutRemainder: cleanMoney(body.tipRemainder),
    updatedAt: new Date().toISOString()
  };
  applyTipsToTimesheets(appData, date, tipsByEmployee);
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Trinkgeld-Auszahlung bestätigt.", ...terminalPayload(appData, date) });
}

async function confirmEmployeeTipPayout(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date);
  const employee = cleanText(body.employee, 160);
  if (!employee) return sendJson(res, 400, { error: "Mitarbeiter fehlt." });
  const overview = tipPayoutOverview(appData);
  const row = overview.employees.find((item) => item.employee === employee);
  const amount = Number(row?.openAmount || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return sendJson(res, 400, { error: "Für diesen Mitarbeiter ist kein Trinkgeld offen." });
  }
  appData.tipPayouts ||= {};
  appData.tipPayouts[employee] = Array.isArray(appData.tipPayouts[employee]) ? appData.tipPayouts[employee] : [];
  appData.tipPayouts[employee].push({
    id: `tip-payout-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    employee,
    amount: amount.toFixed(2),
    terminalDate: date,
    paidAt: new Date().toISOString()
  });
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: `${employee}: Trinkgeld-Auszahlung bestätigt.`, ...terminalPayload(appData, date) });
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

async function completeCleaning(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), id = String(body.id || "");
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  if (!id) return sendJson(res, 400, { error: "Reinigungsaufgabe fehlt." });
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const cleaningCompletions = { ...(report.cleaningCompletions || {}) };
  if (body.done) {
    const employee = cleanText(body.employee, 160);
    if (!employee) return sendJson(res, 400, { error: "Bitte ausführende Person auswählen." });
    cleaningCompletions[id] = { done: true, employee, doneAt: new Date().toISOString() };
  } else {
    delete cleaningCompletions[id];
  }
  appData.dayReports[date] = { ...report, cleaningCompletions, updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, ...terminalPayload(appData, date) });
}

async function confirmToilet(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), checkKey = String(body.checkKey || "");
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  if (!checkKey) return sendJson(res, 400, { error: "Kontrolle fehlt." });
  const employee = cleanText(body.employee || body.checkEmployee, 160);
  if (!employee) return sendJson(res, 400, { error: "Bitte Mitarbeiter auswählen." });
  if (!(appData.settings.employees || []).includes(employee)) return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const toiletChecks = Array.isArray(report.toiletChecks) ? report.toiletChecks : [];
  if (!toiletChecks.some((item) => item.checkKey === checkKey)) {
    toiletChecks.push({ checkKey, employee, checkedAt: new Date().toISOString() });
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

async function confirmTerminalMessage(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), id = cleanText(body.messageId, 120);
  if (appData.dayReports?.[date]?.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  if (!id) return sendJson(res, 400, { error: "Nachricht fehlt." });
  const message = (appData.terminalMessages || []).find((item) => item.id === id);
  const checkedAt = new Date().toISOString();
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const terminalMessageChecks = cleanTerminalMessageChecks(report.terminalMessageChecks);
  if (!terminalMessageChecks.some((item) => item.messageId === id)) {
    terminalMessageChecks.push({
      messageId: id,
      text: cleanText(message?.text, 240),
      shiftLeader: cleanText(report.shiftLeader, 160),
      checkedAt
    });
  }
  if (message) {
    message.active = false;
    message.acknowledgedAt = checkedAt;
    message.acknowledgedBy = cleanText(report.shiftLeader, 160);
    message.acknowledgedDate = date;
  }
  appData.dayReports[date] = { ...report, terminalMessageChecks, updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Schichtleiter-Nachricht quittiert.", ...terminalPayload(appData, date) });
}

async function saveDayMeta(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  appData.dayReports ||= {};
  appData.dayReports[date] = { ...existing, openingHours: cleanText(body.openingHours, 80), shiftLeader: cleanText(body.shiftLeader, 160), updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Tageskopf gespeichert.", ...terminalPayload(appData, date) });
}

async function saveAssignmentTimes(body, res) {
  const appData = await readAppData();
  const baseDate = cleanDate(body.date);
  const validEmployees = new Set(appData.settings.employees || []);
  const nextTimes = cleanAssignmentTimes(body.assignmentTimes || {}, validEmployees);
  appData.assignmentTimes ||= {};
  for (const dateKey of terminalAssignmentDates(baseDate)) {
    if (nextTimes[dateKey] && Object.keys(nextTimes[dateKey]).length) {
      appData.assignmentTimes[dateKey] = nextTimes[dateKey];
    } else {
      delete appData.assignmentTimes[dateKey];
    }
  }
  const tomorrow = addDaysKey(baseDate, 1);
  const employeesForTomorrow = Object.entries(nextTimes[tomorrow] || {})
    .filter(([, item]) => item?.from || item?.note)
    .map(([employee]) => employee);
  if (employeesForTomorrow.length && appData.settings?.pushSettings?.assignmentsTomorrow !== false) {
    await sendPushToEmployees(appData, employeesForTomorrow, {
      title: appData.settings?.pushSettings?.assignmentsTomorrowTitle || "LA-Bowling - Einteilung für morgen ist Online",
      body: appData.settings?.pushSettings?.assignmentsTomorrowBody || "Bitte prüfe deine Startzeit in der TeamApp.",
      url: "/",
      tag: `assignment-${tomorrow}`
    });
  }
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Einteilung gespeichert.", ...terminalPayload(appData, baseDate) });
}

async function addHandover(body, res) {
  const appData = await readAppData(), date = cleanDate(body.date), existing = appData.dayReports?.[date] || {};
  if (existing.closed) return sendJson(res, 423, { error: "Tagesbericht ist abgeschlossen." });
  const item = cleanHandover(body.handover || body);
  if (!item.from || !item.to || !item.note) return sendJson(res, 400, { error: "Bitte Von, An und Übergabe-Notiz ausfüllen." });
  appData.dayReports ||= {};
  appData.dayReports[date] = { ...existing, handovers: [...cleanHandovers(existing.handovers), item], shiftLeader: item.to, updatedAt: new Date().toISOString() };
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, message: "Übergabe gespeichert.", ...terminalPayload(appData, date) });
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
  const assignmentDates = terminalAssignmentDates(date);
  return { date, settings: publicSettings(appData.settings), entries: appData.timesheets?.[month] || {}, schedule: schedule.days?.[date] || {}, assignmentTimes: assignmentTimesForDates(appData, assignmentDates), assignmentSchedules: assignmentSchedulesForDates(appData, assignmentDates), assignmentAvailability: assignmentAvailabilityForDates(appData, assignmentDates), report, tipOverview: tipPayoutOverview(appData), correctionMode: Boolean(report.correctionOpen), tasks: tasksForDate(appData, date), cleaningTemplates: weeklyCleaningTemplates(appData.cleaningTemplates), weeklyCleaningCompletions: weeklyCleaningCompletions(appData, date), reminders: appData.reminderTemplates || [], terminalMessages: activeTerminalMessages(appData), customerDirectory: normalizeCustomerDirectory(appData.customerDirectory), tablePlanConfig: normalizeTablePlanConfig(appData.tablePlanConfig), tablePlanInfo: tablePlanInfo(appData, date) };
}

function terminalAssignmentDates(dateKey) {
  return [dateKey, addDaysKey(dateKey, 1)];
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

function assignmentAvailabilityForDates(appData, dates = []) {
  return Object.fromEntries(dates.map((dateKey) => {
    const month = dateKey.slice(0, 7);
    const monthAvailability = appData.availability?.[month] || {};
    const day = {};
    Object.entries(monthAvailability).forEach(([employee, days]) => {
      const entry = days?.[dateKey];
      if (!entry || typeof entry !== "object") return;
      const status = cleanText(entry.status, 20);
      const from = cleanTime(entry.from);
      const to = cleanTime(entry.to);
      const note = cleanText(entry.note, 240);
      if (!status && !from && !to && !note) return;
      day[cleanText(employee, 160)] = { status, from, to, note };
    });
    return [dateKey, day];
  }));
}

function weekStartKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return localDate(date);
}

function cleanAssignmentTimes(value = {}, validEmployees = new Set()) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [dateKey, employees] of Object.entries(value)) {
    const date = cleanDate(dateKey);
    if (date !== dateKey || !employees || typeof employees !== "object" || Array.isArray(employees)) continue;
    const day = {};
    for (const [employee, item] of Object.entries(employees)) {
      const cleanEmployee = cleanText(employee, 160);
      if (!cleanEmployee || !validEmployees.has(cleanEmployee)) continue;
      const from = cleanTime(item?.from);
      const note = cleanText(item?.note, 240);
      if (from || note) day[cleanEmployee] = { from, to: "", note };
    }
    result[date] = day;
  }
  return result;
}

function activeTerminalDate(appData, requestedDate) {
  const today = localDate(new Date());
  const requested = cleanDate(requestedDate);
  const requestedReport = appData.dayReports?.[requested];
  if (requested && !requestedReport) return requested;
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
    report.cashExpenses ||
    (report.invoiceCustomers || []).length ||
    (report.expenses || []).length ||
    Object.values(report.documents || {}).some((document) => document?.name || document?.path || document?.url || document?.data) ||
    (report.handovers || []).length ||
    Object.keys(report.taskCompletions || {}).length ||
    Object.keys(report.cleaningCompletions || {}).length ||
    (report.toiletChecks || []).length ||
    (report.reminderChecks || []).length ||
    (report.terminalMessageChecks || []).length ||
    (report.tableReservations || []).length ||
    (report.tableGroups || []).length ||
    (report.tableStaffAssignments || []).length
  );
}

function tablePlanHasActivity(report = {}) {
  return Boolean(
    (report.tableReservations || []).length ||
    (report.tableGroups || []).length ||
    (report.tableStaffAssignments || []).length
  );
}

function tablePlanInfo(appData, selectedDate) {
  const todayDate = localDate(new Date());
  const todayReport = defaultReport(appData.dayReports?.[todayDate]);
  const selectedReport = defaultReport(appData.dayReports?.[selectedDate]);
  const todayItems = (todayReport.tableReservations || []).length + (todayReport.tableGroups || []).length + (todayReport.tableStaffAssignments || []).length;
  const selectedItems = (selectedReport.tableReservations || []).length + (selectedReport.tableGroups || []).length + (selectedReport.tableStaffAssignments || []).length;
  return {
    todayDate,
    todayAvailable: tablePlanHasActivity(todayReport),
    todayItems,
    selectedItems,
    selectedAvailable: tablePlanHasActivity(selectedReport)
  };
}

function defaultReport(report = {}) {
  return { cashTotal: "", cashExpenses: "", ecTerminal1: "", ecTerminal2: "", ecTotal: "", personalConsumption: "", revenueBowling: "", revenueDrinks: "", revenueFood: "", revenueOther: "", revenueGastro: "", barBowling: "", barGastro: "", tipTotal: "", tipRemainder: "", tipPayoutConfirmedAt: "", tipPayoutAmount: "", tipPayoutRemainder: "", tipsByEmployee: {}, invoiceCustomers: [], expenses: [], documents: {}, notes: "", extraEmployees: [], removedEmployees: [], handovers: [], taskCompletions: {}, cleaningCompletions: {}, toiletChecks: [], reminderChecks: [], terminalMessageChecks: [], tableReservations: [], tableGroups: [], tableStaffAssignments: [], ...report };
}

function normalizeTablePlanConfig(value = {}) {
  const customTables = sortCustomTables((Array.isArray(value?.customTables) ? value.customTables : []).map((item) => cleanCustomTable(item)).filter((item) => item.id));
  const allowedIds = new Set([...TABLE_PLAN_BASE_IDS, ...customTables.map((item) => item.id)]);
  const seatsByTable = {};
  if (value?.seatsByTable && typeof value.seatsByTable === "object" && !Array.isArray(value.seatsByTable)) {
    for (const [tableId, seats] of Object.entries(value.seatsByTable)) {
      const cleanId = cleanTableId(tableId);
      const cleanSeats = cleanInteger(seats, 1, 200);
      if (cleanId && cleanSeats && allowedIds.has(cleanId)) seatsByTable[cleanId] = cleanSeats;
    }
  }
  const tableOverrides = {};
  if (value?.tableOverrides && typeof value.tableOverrides === "object" && !Array.isArray(value.tableOverrides)) {
    for (const [tableId, entry] of Object.entries(value.tableOverrides)) {
      const cleanId = cleanTableId(tableId);
      if (!cleanId || !TABLE_PLAN_BASE_IDS.has(cleanId)) continue;
      const cleaned = cleanCustomTable({ ...(entry || {}), id: cleanId });
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
      const cleanId = cleanZoneId(zoneId);
      if (!cleanId || !TABLE_PLAN_BASE_ZONE_IDS.has(cleanId)) continue;
      const cleaned = cleanZoneEntry({ ...(entry || {}), id: cleanId });
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

function cleanCustomTable(value = {}) {
  return {
    id: cleanTableId(value.id),
    label: cleanText(value.label, 60),
    area: cleanText(value.area, 80),
    seats: cleanInteger(value.seats, 1, 200),
    x: cleanDecimal(value.x, 0, 96),
    y: cleanDecimal(value.y, 0, 96),
    w: cleanDecimal(value.w, 2, 40),
    h: cleanDecimal(value.h, 2, 30),
    shape: cleanTableShape(value.shape)
  };
}

function cleanZoneEntry(value = {}) {
  return {
    id: cleanZoneId(value.id),
    label: cleanText(value.label, 60),
    x: cleanDecimal(value.x, 0, 98),
    y: cleanDecimal(value.y, 0, 98),
    w: cleanDecimal(value.w, 4, 98),
    h: cleanDecimal(value.h, 4, 98),
    className: cleanZoneClass(value.className),
    visible: cleanBoolean(value.visible, true)
  };
}

function sortCustomTables(value = []) {
  return [...(Array.isArray(value) ? value : [])]
    .filter((item) => item?.id)
    .sort((left, right) => {
      const topCompare = Number(left.y || 0) - Number(right.y || 0);
      if (Math.abs(topCompare) > 0.1) return topCompare;
      const leftCompare = Number(left.x || 0) - Number(right.x || 0);
      if (Math.abs(leftCompare) > 0.1) return leftCompare;
      return String(left.id || "").localeCompare(String(right.id || ""), "de", { numeric: true });
    });
}

function cleanTableShape(value) {
  return ["table", "room", "lane"].includes(String(value || "").trim()) ? String(value).trim() : "table";
}

function cleanZoneId(value) {
  return String(value || "").trim().slice(0, 32);
}

function cleanZoneClass(value) {
  return ["is-lanes", "is-room", "is-open"].includes(String(value || "").trim()) ? String(value).trim() : "is-open";
}

function cleanBoolean(value, fallback = true) {
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return fallback;
}

function cleanTableGroups(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item) => cleanTableGroup(item))
    .filter((item) => item.tableIds.length >= 2 && item.label);
}

function cleanTableGroup(value = {}) {
  return {
    id: cleanText(value.id || crypto.randomUUID(), 120),
    label: cleanText(value.label, 120),
    tableIds: [...new Set((Array.isArray(value.tableIds) ? value.tableIds : []).map(cleanTableId).filter(Boolean))].slice(0, 12),
    createdAt: cleanText(value.createdAt, 80),
    updatedAt: cleanText(value.updatedAt, 80)
  };
}

function sortTableGroups(value = []) {
  return [...cleanTableGroups(value)].sort((left, right) => {
    const tableCompare = String(left.tableIds[0] || "").localeCompare(String(right.tableIds[0] || ""), "de", { numeric: true });
    if (tableCompare) return tableCompare;
    return String(left.label || "").localeCompare(String(right.label || ""), "de");
  });
}

function cleanTableStaffAssignments(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item) => cleanTableStaffAssignment(item))
    .filter((item) => item.employee && item.presetId);
}

function cleanTableStaffAssignment(value = {}) {
  return {
    id: cleanText(value.id || crypto.randomUUID(), 120),
    employee: cleanText(value.employee, 160),
    presetId: cleanText(value.presetId, 120),
    color: cleanColor(value.color),
    note: cleanText(value.note, 240),
    createdAt: cleanText(value.createdAt, 80),
    updatedAt: cleanText(value.updatedAt, 80)
  };
}

function cleanColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : "#e1172f";
}

function sortTableStaffAssignments(value = []) {
  return [...cleanTableStaffAssignments(value)].sort((left, right) => {
    const presetCompare = String(left.presetId || "").localeCompare(String(right.presetId || ""), "de", { numeric: true });
    if (presetCompare) return presetCompare;
    return String(left.employee || "").localeCompare(String(right.employee || ""), "de");
  });
}

function cleanTableReservations(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item) => cleanTableReservation(item))
    .filter((item) => item.tableIds.length && (item.time || item.name || item.people || item.note));
}

function cleanTableReservation(value = {}) {
  const tableIds = [...new Set((Array.isArray(value.tableIds) ? value.tableIds : []).map(cleanTableId).filter(Boolean))].slice(0, 12);
  const people = cleanInteger(value.people, 0, 500);
  return {
    id: cleanText(value.id || crypto.randomUUID(), 120),
    tableIds,
    time: cleanTime(value.time),
    name: cleanText(value.name, 160),
    people: people > 0 ? people : 0,
    marker: cleanTableMarker(value.marker),
    note: cleanText(value.note, 500),
    createdAt: cleanText(value.createdAt, 80),
    updatedAt: cleanText(value.updatedAt, 80)
  };
}

function cleanTableMarker(value) {
  const marker = String(value || "").trim().toLowerCase();
  return ["normal", "birthday", "setup"].includes(marker) ? marker : "normal";
}

function cleanTableId(value) {
  const clean = String(value || "").trim().toUpperCase();
  if (!clean) return "";
  return /^[A-Z0-9][A-Z0-9_-]{0,15}$/.test(clean) ? clean : "";
}

function cleanDecimal(value, min = 0, max = 100) {
  const number = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number * 10) / 10));
}

function cleanInteger(value, min = 0, max = 9999) {
  const number = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number)) return 0;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function sortTableReservations(value = []) {
  return [...cleanTableReservations(value)].sort((left, right) => {
    const timeCompare = String(left.time || "99:99").localeCompare(String(right.time || "99:99"));
    if (timeCompare) return timeCompare;
    const tableCompare = String(left.tableIds[0] || "").localeCompare(String(right.tableIds[0] || ""), "de", { numeric: true });
    if (tableCompare) return tableCompare;
    return String(left.name || "").localeCompare(String(right.name || ""), "de");
  });
}

function tipPayoutOverview(appData) {
  const employeeNames = new Set((appData.settings?.employees || []).map((name) => cleanText(name, 160)).filter(Boolean));
  const earned = {};
  const lastTipDate = {};
  Object.entries(appData.timesheets || {}).forEach(([, employees]) => {
    Object.entries(employees || {}).forEach(([employee, entries]) => {
      const cleanEmployee = cleanText(employee, 160);
      if (!cleanEmployee) return;
      employeeNames.add(cleanEmployee);
      Object.entries(entries || {}).forEach(([dateKey, entry]) => {
        const amount = moneyNumber(entry?.tip);
        if (amount <= 0) return;
        earned[cleanEmployee] = (earned[cleanEmployee] || 0) + amount;
        if (!lastTipDate[cleanEmployee] || dateKey > lastTipDate[cleanEmployee]) lastTipDate[cleanEmployee] = dateKey;
      });
    });
  });
  const payouts = normalizeTipPayouts(appData.tipPayouts);
  Object.keys(payouts).forEach((employee) => employeeNames.add(employee));
  const employees = [...employeeNames].sort((a, b) => a.localeCompare(b, "de")).map((employee) => {
    const history = payouts[employee] || [];
    const paid = history.reduce((sum, item) => sum + moneyNumber(item.amount), 0);
    const earnedTotal = earned[employee] || 0;
    const open = Math.max(0, earnedTotal - paid);
    const lastPaid = history.at(-1) || null;
    return {
      employee,
      earnedAmount: earnedTotal.toFixed(2),
      paidAmount: paid.toFixed(2),
      openAmount: open.toFixed(2),
      lastTipDate: lastTipDate[employee] || "",
      lastPaidAt: lastPaid?.paidAt || "",
      payoutCount: history.length
    };
  });
  return {
    employees,
    totalEarned: employees.reduce((sum, row) => sum + moneyNumber(row.earnedAmount), 0).toFixed(2),
    totalPaid: employees.reduce((sum, row) => sum + moneyNumber(row.paidAmount), 0).toFixed(2),
    totalOpen: employees.reduce((sum, row) => sum + moneyNumber(row.openAmount), 0).toFixed(2)
  };
}

function normalizeTipPayouts(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  Object.entries(value).forEach(([employee, history]) => {
    const cleanEmployee = cleanText(employee, 160);
    if (!cleanEmployee) return;
    result[cleanEmployee] = (Array.isArray(history) ? history : []).map((item) => ({
      id: cleanText(item?.id, 80),
      employee: cleanEmployee,
      amount: cleanMoney(item?.amount) || "0.00",
      terminalDate: /^\d{4}-\d{2}-\d{2}$/.test(String(item?.terminalDate || "")) ? String(item.terminalDate) : "",
      paidAt: cleanText(item?.paidAt, 40)
    })).filter((item) => moneyNumber(item.amount) > 0);
  });
  return result;
}

function moneyNumber(value) {
  const n = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function weeklyCleaningTemplates(templates = []) {
  return (Array.isArray(templates) ? templates : []).filter((task) => task && task.frequency === "weekly" && task.title);
}

function weeklyCleaningCompletions(appData, dateKey) {
  const range = weekRange(dateKey);
  const completions = {};
  Object.entries(appData.dayReports || {}).forEach(([reportDate, report]) => {
    if (reportDate < range.start || reportDate > range.end) return;
    Object.entries(report?.cleaningCompletions || {}).forEach(([id, item]) => {
      if (!item?.done) return;
      completions[id] = { ...item, date: reportDate };
    });
  });
  return completions;
}

function weekRange(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const diffToMonday = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: localDate(start), end: localDate(end) };
}

function activeTerminalMessages(appData) {
  return (appData.terminalMessages || [])
    .filter((message) => message && message.active !== false && message.id && message.text)
    .slice(0, 30);
}

function tasksForDate(appData, dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = date.getDay();
  const dayOfMonth = date.getDate();
  return sortTaskTemplates(appData.taskTemplates || []).filter((task) => {
    if (task.frequency === "daily") return true;
    if (task.frequency === "weekly") return (task.weekdays || []).map(Number).includes(weekday);
    if (task.frequency === "monthly") return Number(task.dayOfMonth || 1) === dayOfMonth;
    if (task.frequency === "interval") return intervalAppliesToDate(task, dateKey);
    if (task.frequency === "once" || task.frequency === "next-day") return task.date === dateKey;
    return false;
  });
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

function cleanCleaningCompletions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([id, item]) => [String(id), {
    done: Boolean(item?.done),
    employee: cleanText(item?.employee, 160),
    doneAt: String(item?.doneAt || "")
  }]));
}

function cleanTipsByEmployee(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([employee, amount]) => [
    cleanText(employee, 160),
    cleanMoney(amount)
  ]).filter(([employee]) => employee));
}

function applyTipsToTimesheets(appData, date, tipsByEmployee = {}) {
  const month = date.slice(0, 7);
  appData.timesheets ||= {};
  appData.timesheets[month] ||= {};
  for (const [employee, tip] of Object.entries(tipsByEmployee || {})) {
    const canonicalEmployee = matchEmployeeName(appData.settings, employee)
      || (appData.settings.employees || []).find((name) => sameEmployeeName(name, employee))
      || String(employee || "").trim();
    if (!canonicalEmployee) continue;
    appData.timesheets[month][canonicalEmployee] ||= {};
    const existing = appData.timesheets[month][canonicalEmployee][date] || {};
    if (!cleanTimeSegments(existing.segments, existing).some((segment) => segment.from || segment.to)) continue;
    appData.timesheets[month][canonicalEmployee][date] = {
      ...existing,
      tip,
      tipSource: "terminal-distribution",
      updatedAt: new Date().toISOString()
    };
  }
}

function cleanToiletChecks(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 40).map((item) => ({
    checkKey: String(item.checkKey || "").slice(0, 40),
    text: cleanText(item.text, 240),
    employee: cleanText(item.employee, 160),
    checkedAt: String(item.checkedAt || new Date().toISOString()).slice(0, 40)
  })).filter((item) => item.checkKey);
}

function cleanTerminalMessageChecks(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 80).map((item) => ({
    messageId: cleanText(item.messageId, 120),
    text: cleanText(item.text, 240),
    shiftLeader: cleanText(item.shiftLeader, 160),
    checkedAt: cleanText(item.checkedAt || new Date().toISOString(), 40)
  })).filter((item) => item.messageId);
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
    popupEnabled: task.popupEnabled === true || task.popupEnabled === "true",
    popupTime: cleanTime(task.popupTime),
    createdAt: cleanText(task.createdAt || new Date().toISOString(), 40)
  };
}

function localDate(date) { const p = berlinParts(date); return `${p.year}-${p.month}-${p.day}`; }
function cleanDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? String(value) : localDate(new Date()); }
function cleanText(value, max) { return String(value || "").trim().slice(0, max); }
function roundToQuarter(date) { const p = berlinParts(date), m = Number(p.hour) * 60 + Number(p.minute), r = Math.round(m / 15) * 15; return `${String(Math.floor(r / 60) % 24).padStart(2, "0")}:${String(r % 60).padStart(2, "0")}`; }
function berlinParts(date) { const parts = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date); return Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value])); }
function cleanMoney(value) { const n = Number(String(value || "").replace(",", ".").trim()); return Number.isFinite(n) && String(value || "").trim() ? n.toFixed(2) : ""; }

function cleanEcTotal(value, ecTerminal1 = "", ecTerminal2 = "") {
  const first = cleanMoney(ecTerminal1);
  const second = cleanMoney(ecTerminal2);
  if (first || second) return (Number(first || 0) + Number(second || 0)).toFixed(2);
  return cleanMoney(value);
}
function cleanGastroTotal(value, drinks = "", food = "", other = "") {
  const parts = [drinks, food, other].map(cleanMoney);
  if (parts.some(Boolean)) return parts.reduce((sum, part) => sum + Number(part || 0), 0).toFixed(2);
  return cleanMoney(value);
}
function cleanTime(value) { const text = String(value || "").trim(); return /^\d{2}:\d{2}$/.test(text) ? text : ""; }
function matchEmployeeName(settings = {}, employee = "") {
  const clean = String(employee || "").trim();
  if (!clean) return "";
  return (settings.employees || []).find((name) => sameEmployeeName(name, clean)) || "";
}
function cleanTimeSegments(value, fallback = {}) {
  const source = Array.isArray(value) ? value : [];
  const segments = source.map((segment) => ({
    from: cleanTime(segment?.from),
    to: cleanTime(segment?.to)
  })).filter((segment) => segment.from || segment.to);
  if (segments.length) return segments.slice(0, 8);
  const from = cleanTime(fallback.from);
  const to = cleanTime(fallback.to);
  return from || to ? [{ from, to }] : [];
}
function timeBoundsFromSegments(segments = []) {
  const clean = cleanTimeSegments(segments);
  const first = clean.find((segment) => segment.from || segment.to) || {};
  const lastWithTo = [...clean].reverse().find((segment) => segment.to);
  const last = lastWithTo || clean.at(-1) || {};
  return {
    from: first.from || "",
    to: last.to || ""
  };
}
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
    handwriting: await cleanReportDocumentUpload(value.handwriting || {}, date, "handschrift"),
    ecCut: await cleanReportDocumentUpload(value.ecCut || {}, date, "ec-schnitt")
  };
}

function cleanEmployeeList(value = []) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((name) => cleanText(name, 160))
    .filter(Boolean))];
}

function cleanExtraEmployees(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item) => typeof item === "string" ? { employee: item, role: "Zusatz" } : item)
    .map((item) => ({
      employee: cleanText(item?.employee, 160),
      role: cleanText(item?.role || "Zusatz", 80) || "Zusatz"
    }))
    .filter((item) => item.employee)
    .filter((item, index, list) => list.findIndex((other) => other.employee === item.employee) === index);
}

function totalInvoiceGastroAmount(item) {
  const drinksText = String(item.gastroDrinksAmount ?? "").trim();
  const foodText = String(item.gastroFoodAmount ?? "").trim();
  const otherText = String(item.gastroOtherAmount ?? "").trim();
  const hasSplit = [drinksText, foodText, otherText].some(Boolean);
  const split = Number(cleanMoney(item.gastroDrinksAmount) || 0)
    + Number(cleanMoney(item.gastroFoodAmount) || 0)
    + Number(cleanMoney(item.gastroOtherAmount) || 0);
  if (hasSplit) return split;
  return Number(cleanMoney(item.gastroAmount ?? (item.area === "gastro" ? item.amount : "")) || 0);
}
function totalInvoiceAmount(item) { const b = Number(cleanMoney(item.bowlingAmount ?? (item.area === "bowling" ? item.amount : "")) || 0), g = totalInvoiceGastroAmount(item); return b + g || item.amount || ""; }
async function cleanReportItems(items, type, date) {
  if (!Array.isArray(items)) return [];
  const cleaned = await Promise.all(items.slice(0, 20).map(async (raw) => {
  const gastroDrinksAmount = cleanMoney(raw.gastroDrinksAmount);
  const gastroFoodAmount = cleanMoney(raw.gastroFoodAmount);
  const gastroOtherAmount = cleanMoney(raw.gastroOtherAmount);
  const invoiceReadyRequested = raw.invoiceReady === true || raw.invoiceReady === "true";
  const invoiceDone = raw.invoiceDone === true || raw.invoiceDone === "true";
  const invoiceNotificationSentAt = cleanText(raw.invoiceNotificationSentAt, 80);
  const hasPentacodeFlag = Object.prototype.hasOwnProperty.call(raw || {}, "pentacodeEntered");
  const pentacodeEntered = raw.pentacodeEntered === true || raw.pentacodeEntered === "true"
    || (!hasPentacodeFlag && (invoiceReadyRequested || invoiceDone || invoiceNotificationSentAt));
  const hasGastroSplit = [String(raw.gastroDrinksAmount ?? "").trim(), String(raw.gastroFoodAmount ?? "").trim(), String(raw.gastroOtherAmount ?? "").trim()].some(Boolean);
  const gastroAmount = hasGastroSplit
      ? cleanMoney(String(
        Number(gastroDrinksAmount || 0)
        + Number(gastroFoodAmount || 0)
        + Number(gastroOtherAmount || 0)
      ))
      : cleanMoney(raw.gastroAmount ?? (raw.area === "gastro" ? raw.amount : ""));
    const item = {
      id: String(raw.id || crypto.randomUUID()),
      name: String(raw.name || "").trim().slice(0, 160),
      amount: cleanMoney(totalInvoiceAmount(raw)),
      bowlingAmount: cleanMoney(raw.bowlingAmount ?? (raw.area === "bowling" ? raw.amount : "")),
      gastroAmount,
      gastroDrinksAmount,
      gastroFoodAmount,
      gastroOtherAmount,
      gastroOtherNote: String(raw.gastroOtherNote || "").trim().slice(0, 300),
      note: String(raw.note || "").trim().slice(0, 600),
      receiptName: String(raw.receiptName || "").trim().slice(0, 180),
      receiptData: String(raw.receiptData || ""),
      receiptPath: cleanReceiptPath(raw.receiptPath),
      receiptUrl: cleanReceiptUrl(raw.receiptUrl),
      receipts: [],
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
      paymentMethod: String(raw.paymentMethod || "").trim().slice(0, 40),
      tip: String(raw.tip || "").trim().slice(0, 160),
      pentacodeEntered,
      email: String(raw.email || "").trim().slice(0, 180),
      category: String(raw.category || "").trim().slice(0, 120),
      createdAt: cleanText(raw.createdAt || new Date().toISOString(), 80),
      invoiceReady: invoiceReadyRequested && pentacodeEntered,
      invoiceReadyAt: cleanText(raw.invoiceReadyAt, 80),
      invoiceDone,
      invoiceDoneAt: cleanText(raw.invoiceDoneAt, 80),
      invoicePaid: raw.invoicePaid === true || raw.invoicePaid === "true",
      invoicePaidAt: cleanText(raw.invoicePaidAt, 80),
      invoiceNotificationSentAt,
      area: type === "invoice" ? "rechnung" : raw.area
    };
    if (type === "expense") {
      item.receipts = await cleanExpenseReceipts(raw, date, item.id);
      const firstReceipt = item.receipts[0] || {};
      item.receiptName = firstReceipt.receiptName || "";
      item.receiptData = firstReceipt.receiptData || "";
      item.receiptPath = firstReceipt.receiptPath || "";
      item.receiptUrl = firstReceipt.receiptUrl || "";
    } else {
      await applyReceiptUpload(item, "receipt", date, `${type}-${item.id}`);
    }
    await applyReceiptUpload(item, "bowlingReceipt", date, `bowling-${item.id}`);
    await applyReceiptUpload(item, "gastroReceipt", date, `gastro-${item.id}`);
    return item;
  }));
  return cleaned.filter((i) => i.name || i.amount || i.note || i.receiptData || i.receiptPath || (i.receipts || []).length || i.bowlingReceiptData || i.bowlingReceiptPath || i.gastroReceiptData || i.gastroReceiptPath || i.address || i.contact || i.phone || i.tip || i.email);
}
async function cleanExpenseReceipts(raw, date, id) {
  const entries = [];
  const seen = new Set();
  const addReceipt = (receipt = {}) => {
    const item = {
      receiptName: String(receipt.receiptName || receipt.name || "").trim().slice(0, 180),
      receiptData: String(receipt.receiptData || receipt.data || ""),
      receiptPath: cleanReceiptPath(receipt.receiptPath || receipt.path),
      receiptUrl: cleanReceiptUrl(receipt.receiptUrl || receipt.url)
    };
    if (!item.receiptName && !item.receiptData && !item.receiptPath && !item.receiptUrl) return;
    const key = item.receiptPath || item.receiptUrl || item.receiptData || item.receiptName;
    if (seen.has(key)) return;
    seen.add(key);
    entries.push(item);
  };
  (Array.isArray(raw.receipts) ? raw.receipts : []).forEach(addReceipt);
  addReceipt({
    receiptName: raw.receiptName,
    receiptData: raw.receiptData,
    receiptPath: raw.receiptPath,
    receiptUrl: raw.receiptUrl
  });
  const cleaned = [];
  for (const [index, entry] of entries.slice(0, 10).entries()) {
    await applyReceiptUpload(entry, "receipt", date, `expense-${id}-${index + 1}`);
    if (entry.receiptName || entry.receiptData || entry.receiptPath || entry.receiptUrl) cleaned.push(entry);
  }
  return cleaned;
}
function mergeReportItemsById(existing = [], current = []) {
  const merged = new Map();
  (Array.isArray(existing) ? existing : []).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const id = cleanText(item.id || crypto.randomUUID(), 120);
    merged.set(id, { ...item, id });
  });
  (Array.isArray(current) ? current : []).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const id = cleanText(item.id || crypto.randomUUID(), 120);
    const previous = merged.get(id) || {};
    const next = { ...previous, ...item, id };
    if (!(item.receipts || []).length && (previous.receipts || []).length) {
      next.receipts = previous.receipts;
      next.receiptName = previous.receiptName;
      next.receiptData = previous.receiptData;
      next.receiptPath = previous.receiptPath;
      next.receiptUrl = previous.receiptUrl;
    }
    if (!String(next.invoiceNotificationSentAt || "").trim() && String(previous.invoiceNotificationSentAt || "").trim()) {
      next.invoiceNotificationSentAt = previous.invoiceNotificationSentAt;
    }
    merged.set(id, next);
  });
  return [...merged.values()].slice(0, 20);
}

async function sendReadyInvoiceNotifications(appData, date, targetInvoiceId = "", options = {}) {
  const report = appData.dayReports?.[date];
  const invoices = Array.isArray(report?.invoiceCustomers) ? report.invoiceCustomers : [];
  const now = new Date().toISOString();
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let changed = false;
  const errors = [];
  const skipReasons = new Map();
  const forceResend = options?.forceResend === true;

  for (const invoice of invoices) {
    if (!invoice || typeof invoice !== "object") continue;
    const isReady = invoice.invoiceReady === true || invoice.invoiceReady === "true";
    const isDone = invoice.invoiceDone === true || invoice.invoiceDone === "true";
    const alreadySent = String(invoice.invoiceNotificationSentAt || "").trim();
    const isTargetInvoice = !targetInvoiceId || String(invoice.id || "").trim() === targetInvoiceId;
    if (!isTargetInvoice) continue;
    if (!isReady || isDone || (alreadySent && !forceResend)) continue;
    const result = await sendInvoiceNotificationEmail({
      date,
      customer: invoice,
      to: appData.settings?.invoiceNotificationTo
    });
    if (result?.ok) {
      invoice.invoiceNotificationSentAt = now;
      sent += 1;
      changed = true;
    } else if (result?.skipped) {
      skipped += 1;
      const reason = String(result.reason || "unbekannt").trim();
      skipReasons.set(reason, (skipReasons.get(reason) || 0) + 1);
    } else {
      failed += 1;
      const error = result?.error || result?.reason || "unbekannter Fehler";
      errors.push({ id: invoice.id || "", name: invoice.name || "", error });
      console.error("Rechnungskunden-Mailversand nicht erfolgreich.", { date, invoiceId: invoice.id || "", name: invoice.name || "", error });
    }
  }

  if (changed && report) {
    report.updatedAt = new Date().toISOString();
    appData.dayReports[date] = report;
    await writeAppData(appData);
  }

  return { sent, failed, skipped, skipReasons: [...skipReasons.entries()].map(([reason, count]) => ({ reason, count })), changed, errors };
}

function upsertCustomerDirectory(appData, customers) {
  const byKey = new Map();
  normalizeCustomerDirectory(appData.customerDirectory).forEach((customer) => {
    const key = customerDirectoryKey(customer);
    if (key) byKey.set(key, customer);
  });
  (Array.isArray(customers) ? customers : [customers]).forEach((customer) => {
    const entry = customerDirectoryEntry(customer);
    const key = customerDirectoryKey(entry);
    if (!key) return;
    byKey.set(key, { ...(byKey.get(key) || {}), ...entry, updatedAt: new Date().toISOString() });
  });
  appData.customerDirectory = [...byKey.values()]
    .filter((customer) => customer.name)
    .sort((a, b) => a.name.localeCompare(b.name, "de"))
    .slice(0, 500);
}
function normalizeCustomerDirectory(customers) {
  const byKey = new Map();
  (Array.isArray(customers) ? customers : []).forEach((customer) => {
    const entry = customerDirectoryEntry(customer);
    const key = customerDirectoryKey(entry);
    if (key) byKey.set(key, { ...(byKey.get(key) || {}), ...entry });
  });
  return [...byKey.values()].filter((customer) => customer.name).sort((a, b) => a.name.localeCompare(b.name, "de")).slice(0, 500);
}
function customerDirectoryEntry(item = {}) {
  return {
    id: cleanText(item.id || customerDirectoryKey(item) || `customer-${Date.now()}-${Math.random().toString(16).slice(2)}`, 120),
    name: cleanText(item.name, 160),
    contact: cleanText(item.contact, 160),
    phone: cleanText(item.phone, 80),
    email: cleanText(item.email, 180),
    address: cleanText(item.address, 600),
    paymentMethod: cleanText(item.paymentMethod, 40),
    tip: cleanText(item.tip, 160),
    note: cleanText(item.note, 600),
    createdAt: cleanText(item.createdAt || new Date().toISOString(), 80),
    updatedAt: cleanText(item.updatedAt || item.createdAt || new Date().toISOString(), 80)
  };
}
function customerDirectoryKey(item = {}) {
  const email = cleanText(item.email, 180).toLowerCase();
  if (email) return `mail:${email}`;
  const name = cleanText(item.name, 160).toLowerCase();
  const phone = cleanText(item.phone, 80).replace(/\s+/g, "");
  return name ? `name:${name}|${phone}` : "";
}
function verifyTerminalCode(settings, code) { return verifyPin(code, settings?.terminalCodeHash || settings?.terminalCode || process.env.DEFAULT_TERMINAL_CODE || "2468"); }
function verifyPin(pin, stored) { if (!pin || !stored) return false; if (!String(stored).startsWith("pbkdf2_sha256$")) return String(pin) === String(stored); const [, iterations, salt, digest] = String(stored).split("$"), test = crypto.pbkdf2Sync(String(pin), salt, Number(iterations), 32, "sha256").toString("hex"); return crypto.timingSafeEqual(Buffer.from(test, "hex"), Buffer.from(digest, "hex")); }

