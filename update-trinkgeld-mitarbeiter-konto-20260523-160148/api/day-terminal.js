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
    if (action === "complete-cleaning") return completeCleaning(body, res);
    if (action === "confirm-toilet" || action === "toilet-check") return confirmToilet(body, res);
    if (action === "confirm-reminder") return confirmReminder(body, res);
    if (action === "confirm-terminal-message") return confirmTerminalMessage(body, res);
    if (action === "save-day-meta") return saveDayMeta(body, res);
    if (action === "add-handover") return addHandover(body, res);
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
  const existing = appData.timesheets[month][employee][date] || {};
  const nextEntry = { ...existing, [punchType === "start" ? "from" : "to"]: time, updatedAt: new Date().toISOString(), source: "terminal" };
  appData.timesheets[month][employee][date] = nextEntry;
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
  const ecTerminal1 = Object.prototype.hasOwnProperty.call(body, "ecTerminal1") ? cleanMoney(body.ecTerminal1) : existing.ecTerminal1 || "";
  const ecTerminal2 = Object.prototype.hasOwnProperty.call(body, "ecTerminal2") ? cleanMoney(body.ecTerminal2) : existing.ecTerminal2 || "";
  const ecTotal = cleanEcTotal(body.ecTotal, ecTerminal1, ecTerminal2);
  const revenueDrinks = cleanMoney(body.revenueDrinks ?? existing.revenueDrinks);
  const revenueFood = cleanMoney(body.revenueFood ?? existing.revenueFood);
  const revenueOther = cleanMoney(body.revenueOther ?? existing.revenueOther);
  const revenueGastro = cleanGastroTotal(body.revenueGastro ?? body.barGastro ?? existing.revenueGastro ?? existing.barGastro, revenueDrinks, revenueFood, revenueOther);
  const personalConsumption = cleanMoney(body.personalConsumption ?? existing.personalConsumption);
  const invoiceCustomers = await cleanReportItems(body.invoiceCustomers, "invoice", date);
  const expenses = await cleanReportItems(body.expenses, "expense", date);
  const documents = await cleanReportDocuments(body.documents || existing.documents, date);
  upsertCustomerDirectory(appData, invoiceCustomers);
  appData.dayReports[date] = { ...existing, cashTotal: cleanMoney(body.cashTotal), ecTerminal1, ecTerminal2, ecTotal, personalConsumption, revenueBowling: cleanMoney(body.revenueBowling ?? body.barBowling), revenueDrinks, revenueFood, revenueOther, revenueGastro, barBowling: cleanMoney(body.barBowling ?? body.revenueBowling), barGastro: revenueGastro, tipTotal: cleanMoney(body.tipTotal ?? existing.tipTotal), tipRemainder: cleanMoney(body.tipRemainder ?? existing.tipRemainder), tipsByEmployee: cleanTipsByEmployee(body.tipsByEmployee || existing.tipsByEmployee), invoiceCustomers, expenses, documents, notes: String(body.notes || "").trim().slice(0, 2000), openingHours: cleanText(body.openingHours || existing.openingHours, 80), shiftLeader: cleanText(body.shiftLeader || existing.shiftLeader, 160), handovers: cleanHandovers(body.handovers || existing.handovers), taskCompletions: cleanTaskCompletions(body.taskCompletions || existing.taskCompletions), cleaningCompletions: cleanCleaningCompletions(body.cleaningCompletions || existing.cleaningCompletions), toiletChecks: cleanToiletChecks(body.toiletChecks || existing.toiletChecks), reminderChecks: cleanToiletChecks(body.reminderChecks || existing.reminderChecks), terminalMessageChecks: cleanTerminalMessageChecks(body.terminalMessageChecks || existing.terminalMessageChecks), tipPayoutConfirmedAt: body.resetTipPayout ? "" : existing.tipPayoutConfirmedAt, tipPayoutAmount: body.resetTipPayout ? "" : existing.tipPayoutAmount, tipPayoutRemainder: body.resetTipPayout ? "" : existing.tipPayoutRemainder, updatedAt: new Date().toISOString() };
  applyTipsToTimesheets(appData, date, appData.dayReports[date].tipsByEmployee);
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, ...terminalPayload(appData, date) });
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
  appData.dayReports[date] = {
    ...existing,
    cashTotal: cleanMoney(body.cashTotal),
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
    if (!employee) return sendJson(res, 400, { error: "Bitte ausfuehrende Person auswaehlen." });
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
  return { date, settings: publicSettings(appData.settings), entries: appData.timesheets?.[month] || {}, schedule: schedule.days?.[date] || {}, report, tipOverview: tipPayoutOverview(appData), correctionMode: Boolean(report.correctionOpen), tasks: tasksForDate(appData, date), cleaningTemplates: weeklyCleaningTemplates(appData.cleaningTemplates), weeklyCleaningCompletions: weeklyCleaningCompletions(appData, date), reminders: appData.reminderTemplates || [], terminalMessages: activeTerminalMessages(appData), customerDirectory: normalizeCustomerDirectory(appData.customerDirectory) };
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
    Object.keys(report.cleaningCompletions || {}).length ||
    (report.toiletChecks || []).length ||
    (report.reminderChecks || []).length ||
    (report.terminalMessageChecks || []).length
  );
}

function defaultReport(report = {}) {
  return { cashTotal: "", ecTerminal1: "", ecTerminal2: "", ecTotal: "", personalConsumption: "", revenueBowling: "", revenueDrinks: "", revenueFood: "", revenueOther: "", revenueGastro: "", barBowling: "", barGastro: "", tipTotal: "", tipRemainder: "", tipPayoutConfirmedAt: "", tipPayoutAmount: "", tipPayoutRemainder: "", tipsByEmployee: {}, invoiceCustomers: [], expenses: [], documents: {}, notes: "", extraEmployees: [], handovers: [], taskCompletions: {}, cleaningCompletions: {}, toiletChecks: [], reminderChecks: [], terminalMessageChecks: [], ...report };
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
    if (!(appData.settings.employees || []).includes(employee)) continue;
    appData.timesheets[month][employee] ||= {};
    const existing = appData.timesheets[month][employee][date] || {};
    if (!existing.from && !existing.to) continue;
    appData.timesheets[month][employee][date] = {
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

