const {
  handleError,
  publicSettings,
  readAppData,
  readJson,
  sendJson,
  signToken,
  verifyToken,
  writeAppData
} = require("./_data");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    const action = String(body.action || "").trim();

    if (action === "login") return login(body, res);

    const session = verifyToken(body.terminalToken, "terminal");
    if (!session?.terminal) return sendJson(res, 401, { error: "Terminal-Code bitte erneut eingeben." });

    if (action === "load") return load(res);
    if (action === "punch") return punch(body, res);
    if (action === "adjust-time") return adjustTime(body, res);
    if (action === "add-employee") return addEmployee(body, res);
    if (action === "save-report") return saveReport(body, res);

    return sendJson(res, 400, { error: "Unbekannte Aktion." });
  } catch (error) {
    handleError(res, error);
  }
};

async function login(body, res) {
  const appData = await readAppData();
  if (!verifyTerminalCode(appData.settings, body.code)) {
    return sendJson(res, 401, { error: "Code stimmt nicht." });
  }
  return sendJson(res, 200, {
    ok: true,
    token: signToken({ type: "terminal", terminal: true }),
    ...terminalPayload(appData)
  });
}

async function load(res) {
  const appData = await readAppData();
  return sendJson(res, 200, terminalPayload(appData));
}

async function punch(body, res) {
  const employee = String(body.employee || "").trim();
  const punchType = String(body.punchType || "").trim();
  if (!employee || !["start", "end"].includes(punchType)) {
    return sendJson(res, 400, { error: "Mitarbeiter oder Aktion fehlt." });
  }

  const appData = await readAppData();
  if (!(appData.settings.employees || []).includes(employee)) {
    return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  }

  const now = new Date();
  const date = localDate(now);
  const month = date.slice(0, 7);
  const time = roundToQuarter(now);
  appData.timesheets ||= {};
  appData.timesheets[month] ||= {};
  appData.timesheets[month][employee] ||= {};
  const entry = appData.timesheets[month][employee][date] || {};
  appData.timesheets[month][employee][date] = {
    ...entry,
    [punchType === "start" ? "from" : "to"]: time,
    updatedAt: new Date().toISOString(),
    source: "terminal"
  };

  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, message: `${employee}: ${punchType === "start" ? "Beginn" : "Ende"} ${time}`, ...terminalPayload(appData) });
}

async function saveReport(body, res) {
  const appData = await readAppData();
  const date = localDate(new Date());
  const existing = appData.dayReports?.[date] || {};
  appData.dayReports ||= {};
  appData.dayReports[date] = {
    ...existing,
    ecTotal: cleanMoney(body.ecTotal),
    barBowling: cleanMoney(body.barBowling),
    barGastro: cleanMoney(body.barGastro),
    notes: String(body.notes || "").trim().slice(0, 2000),
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, ...terminalPayload(appData) });
}

async function adjustTime(body, res) {
  const employee = String(body.employee || "").trim();
  const appData = await readAppData();
  if (!(appData.settings.employees || []).includes(employee)) {
    return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  }
  const date = localDate(new Date());
  const month = date.slice(0, 7);
  const from = cleanTime(body.from);
  const to = cleanTime(body.to);
  appData.timesheets ||= {};
  appData.timesheets[month] ||= {};
  appData.timesheets[month][employee] ||= {};
  const entry = appData.timesheets[month][employee][date] || {};
  appData.timesheets[month][employee][date] = {
    ...entry,
    from,
    to,
    updatedAt: new Date().toISOString(),
    source: "terminal-correction"
  };
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, message: `${employee}: Zeiten korrigiert.`, ...terminalPayload(appData) });
}

async function addEmployee(body, res) {
  const employee = String(body.employee || "").trim();
  const appData = await readAppData();
  if (!(appData.settings.employees || []).includes(employee)) {
    return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  }
  const date = localDate(new Date());
  appData.dayReports ||= {};
  const report = appData.dayReports[date] || {};
  const extraEmployees = new Set((report.extraEmployees || []).map(String));
  extraEmployees.add(employee);
  appData.dayReports[date] = {
    ...report,
    extraEmployees: [...extraEmployees],
    updatedAt: new Date().toISOString()
  };
  await writeAppData(appData);
  return sendJson(res, 200, { ok: true, message: `${employee} wurde hinzugefügt.`, ...terminalPayload(appData) });
}

function terminalPayload(appData) {
  const date = localDate(new Date());
  const month = date.slice(0, 7);
  const schedule = appData.schedules?.[month] || {};
  return {
    date,
    settings: publicSettings(appData.settings),
    entries: appData.timesheets?.[month] || {},
    schedule: schedule.days?.[date] || {},
    report: appData.dayReports?.[date] || { ecTotal: "", barBowling: "", barGastro: "", notes: "", extraEmployees: [] }
  };
}

function localDate(date) {
  const parts = berlinParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function roundToQuarter(date) {
  const parts = berlinParts(date);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const roundedMinutes = Math.round(minutes / 15) * 15;
  return `${String(Math.floor(roundedMinutes / 60) % 24).padStart(2, "0")}:${String(roundedMinutes % 60).padStart(2, "0")}`;
}

function berlinParts(date) {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function cleanMoney(value) {
  const text = String(value || "").replace(",", ".").trim();
  if (!text) return "";
  const number = Number(text);
  return Number.isFinite(number) ? number.toFixed(2) : "";
}

function cleanTime(value) {
  const text = String(value || "").trim();
  return /^\d{2}:\d{2}$/.test(text) ? text : "";
}

function verifyTerminalCode(settings, code) {
  const stored = settings?.terminalCodeHash || settings?.terminalCode || process.env.DEFAULT_TERMINAL_CODE || "2468";
  return verifyPin(code, stored);
}

function verifyPin(pin, stored) {
  if (!pin || !stored) return false;
  if (!String(stored).startsWith("pbkdf2_sha256$")) {
    return String(pin) === String(stored);
  }
  const [, iterations, salt, digest] = String(stored).split("$");
  const test = crypto.pbkdf2Sync(String(pin), salt, Number(iterations), 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(test, "hex"), Buffer.from(digest, "hex"));
}
