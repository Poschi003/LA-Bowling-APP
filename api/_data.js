const crypto = require("crypto");

const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const defaultPins = {
  Kevin: "1001",
  Daniel: "1002",
  Anita: "1003",
  Dennis: "1004",
  Marc: "1005",
  "Christian Gaas": "1006",
  Marco: "1007",
  Ali: "1008",
  Bianca: "1009",
  "Kevin Leicht": "1010"
};

const defaultCleaningTemplates = [
  { id: "weekly-fridges", title: "Kuehlungen und Getraenkelager reinigen/kontrollieren", frequency: "weekly", weekdays: [], note: "", createdAt: "2026-05-20T00:00:00.000Z" },
  { id: "weekly-shoe-racks", title: "Schuhregale und Leihschuhe gruendlich reinigen", frequency: "weekly", weekdays: [], note: "", createdAt: "2026-05-20T00:00:00.000Z" },
  { id: "weekly-storage", title: "Lagerflaechen ordnen und Boden reinigen", frequency: "weekly", weekdays: [], note: "", createdAt: "2026-05-20T00:00:00.000Z" },
  { id: "weekly-glass", title: "Glasflaechen, Tueren und Eingangsbereich gruendlich reinigen", frequency: "weekly", weekdays: [], note: "", createdAt: "2026-05-20T00:00:00.000Z" },
  { id: "weekly-sanitary", title: "Sanitaerbereich Grundkontrolle dokumentieren", frequency: "weekly", weekdays: [], note: "", createdAt: "2026-05-20T00:00:00.000Z" }
];
const TIP_ELIGIBLE_AREAS = ["Counter", "Service", "Kueche", "Spueler"];

const defaultData = {
  settings: {
    adminPin: process.env.DEFAULT_ADMIN_PIN || "1234",
    businessName: "Teamapp",
    employees: [
      "Kevin",
      "Daniel",
      "Anita",
      "Dennis",
      "Marc",
      "Christian Gaas",
      "Marco",
      "Ali",
      "Bianca",
      "Kevin Leicht"
    ],
    employeePins: defaultPins,
    employeeDepartments: {
      Kevin: ["Counter", "Service"],
      Daniel: ["Service"],
      Anita: ["Reinigung", "Service"],
      Dennis: ["Counter", "Service"],
      Marc: ["Service"],
      "Christian Gaas": ["Service", "Kueche"],
      Marco: ["Service", "Kueche"],
      Ali: ["Service", "Kueche"],
      Bianca: ["Reinigung"],
      "Kevin Leicht": ["Counter", "Service"]
    },
    employeeRoles: {},
    fixedEmployees: [],
    availabilityExemptEmployees: [],
    availabilityTargetMonth: defaultAvailabilityTargetMonth(),
    availabilitySubmissionOpen: true,
    adminEmployees: [],
    positions: ["Counter 1", "Counter 2", "Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Kueche 1", "Kueche 2", "Spueler", "Reinigung", "Mechanik"],
    chefViewSections: {
      messages: true,
      today: true,
      reports: true,
      reportFolders: true,
      employees: true,
      schedule: true
    },
    dayReportFields: {
      ecTotal: true,
      barBowling: true,
      barGastro: true,
      barTotal: true,
      invoiceCustomers: true,
      expenses: true,
      documents: true,
      notes: true,
      preparation: true,
      handovers: true,
      extraEmployees: true
    },
    scheduleAutoDeleteDays: 14,
    hourlyRate: 25
  },
  availability: {},
  schedules: {},
  timesheets: {},
  tipPayouts: {},
  cleaningTemplates: defaultCleaningTemplates,
  taskTemplates: [
    {
      id: "default-prep-kasse",
      title: "Kasse und EC-GerÃ¤te vorbereiten",
      note: "Kassenstart, Wechselgeld und EC-GerÃ¤te prÃ¼fen.",
      frequency: "daily",
      category: "preparation",
      createdAt: "2026-05-09T00:00:00.000Z"
    },
    {
      id: "default-prep-bahnen",
      title: "Bahnen, Schuhe und GÃ¤stebereich kontrollieren",
      note: "Sichtkontrolle vor Ã–ffnung, MÃ¤ngel direkt notieren.",
      frequency: "daily",
      category: "preparation",
      createdAt: "2026-05-09T00:00:00.000Z"
    },
    {
      id: "default-restmuell-roentgenstrasse-12",
      title: "Restmuell Entleerung RÃ¶ntgenstraÃŸe 12 prÃ¼fen",
      note: "Abfuhrtermin kontrollieren und rechtzeitig rausstellen.",
      frequency: "weekly",
      category: "running",
      weekdays: [1],
      createdAt: "2026-05-08T00:00:00.000Z"
    },
    {
      id: "default-gelbe-saecke-roentgenstrasse-12",
      title: "Gelbe SÃ¤cke RÃ¶ntgenstraÃŸe 12 prÃ¼fen",
      note: "Abfuhrtermin kontrollieren und rechtzeitig rausstellen.",
      frequency: "weekly",
      category: "running",
      weekdays: [1],
      createdAt: "2026-05-08T00:00:00.000Z"
    },
    {
      id: "default-closing-kasse",
      title: "Kassenabschluss und Tagesbericht prÃ¼fen",
      note: "EC, Bar Bowling, Bar Gastro, Ausgaben und Rechnungskunden kontrollieren.",
      frequency: "daily",
      category: "closing",
      createdAt: "2026-05-09T00:00:00.000Z"
    },
    {
      id: "default-closing-haus",
      title: "Schlussrunde durchfÃ¼hren",
      note: "Lichter, TÃ¼ren, GerÃ¤te, Toiletten und offene Notizen prÃ¼fen.",
      frequency: "daily",
      category: "closing",
      createdAt: "2026-05-09T00:00:00.000Z"
    }
  ],
  deletedTaskTemplateIds: [],
  reminderTemplates: [
    {
      id: "default-toilet-reminder",
      text: "Toiletten-Kontrolle durchfÃ¼hren",
      startAfterOpeningMinutes: 60,
      intervalMinutes: 60,
      active: true,
      createdAt: "2026-05-09T00:00:00.000Z"
    }
  ],
  messages: [],
  terminalMessages: [],
  customerDirectory: [],
  swaps: [],
  availabilityChangeRequests: []
};

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeData(value) {
  const base = cloneData(defaultData);
  const deletedTaskTemplateIds = normalizeDeletedIds(value?.deletedTaskTemplateIds);
  const merged = {
    ...base,
    ...(value || {}),
    settings: {
      ...base.settings,
      ...(value?.settings || {}),
      employees: Array.isArray(value?.settings?.employees) && value.settings.employees.length
        ? value.settings.employees
        : base.settings.employees,
      employeePins: {
        ...base.settings.employeePins,
        ...(value?.settings?.employeePins || {})
      },
      employeePinHashes: {
        ...(value?.settings?.employeePinHashes || {})
      },
      employeeDepartments: {
        ...base.settings.employeeDepartments,
        ...(value?.settings?.employeeDepartments || {})
      },
      employeeRoles: {
        ...(value?.settings?.employeeRoles || {})
      },
      fixedEmployees: value?.settings?.fixedEmployees || base.settings.fixedEmployees,
      availabilityExemptEmployees: value?.settings?.availabilityExemptEmployees || base.settings.availabilityExemptEmployees,
      availabilityTargetMonth: normalizeMonth(value?.settings?.availabilityTargetMonth) || base.settings.availabilityTargetMonth,
      availabilitySubmissionOpen: value?.settings?.availabilitySubmissionOpen !== false,
      adminEmployees: value?.settings?.adminEmployees || base.settings.adminEmployees,
      positions: ensureRequiredPositions(value?.settings?.positions || base.settings.positions),
      chefViewSections: {
        ...base.settings.chefViewSections,
        ...(value?.settings?.chefViewSections || {})
      },
      dayReportFields: {
        ...base.settings.dayReportFields,
        ...(value?.settings?.dayReportFields || {})
      },
      scheduleAutoDeleteDays: normalizeScheduleAutoDeleteDays(
        value?.settings?.scheduleAutoDeleteDays,
        base.settings.scheduleAutoDeleteDays
      ),
      hourlyRate: normalizeHourlyRate(
        value?.settings?.hourlyRate,
        base.settings.hourlyRate
      )
    },
    availability: value?.availability || base.availability,
    schedules: normalizeSchedules(value?.schedules || base.schedules),
    timesheets: value?.timesheets || base.timesheets,
    tipPayouts: value?.tipPayouts && typeof value.tipPayouts === "object" ? value.tipPayouts : base.tipPayouts,
    cleaningTemplates: Array.isArray(value?.cleaningTemplates) ? value.cleaningTemplates : base.cleaningTemplates,
    taskTemplates: mergeTaskTemplates(value?.taskTemplates, base.taskTemplates, deletedTaskTemplateIds),
    deletedTaskTemplateIds,
    reminderTemplates: Array.isArray(value?.reminderTemplates) ? value.reminderTemplates : base.reminderTemplates,
    messages: Array.isArray(value?.messages) ? value.messages : base.messages,
    terminalMessages: Array.isArray(value?.terminalMessages) ? value.terminalMessages : base.terminalMessages,
    customerDirectory: Array.isArray(value?.customerDirectory) ? value.customerDirectory : base.customerDirectory,
    swaps: Array.isArray(value?.swaps) ? value.swaps : base.swaps,
    availabilityChangeRequests: Array.isArray(value?.availabilityChangeRequests) ? value.availabilityChangeRequests : base.availabilityChangeRequests
  };
  if (!merged.settings.businessName || merged.settings.businessName === "Dienstplan") {
    merged.settings.businessName = "Teamapp";
  }
  return merged;
}

function normalizeSchedules(schedules) {
  const result = {};
  for (const [month, schedule] of Object.entries(schedules || {})) {
    const safeSchedule = schedule && typeof schedule === "object" ? schedule : {};
    const days = safeSchedule.days && typeof safeSchedule.days === "object" ? safeSchedule.days : {};
    const publishedWeeks = safeSchedule.publishedWeeks && typeof safeSchedule.publishedWeeks === "object"
      ? { ...safeSchedule.publishedWeeks }
      : {};
    const hasPublishedWeekFlags = Object.values(publishedWeeks).some(Boolean);
    if (safeSchedule.published && !hasPublishedWeekFlags && Object.keys(days).length > 0) {
      for (const dateKey of Object.keys(days)) {
        const key = weekStartKey(dateKey);
        if (key) publishedWeeks[key] = true;
      }
    }
    result[month] = {
      ...safeSchedule,
      month: safeSchedule.month || month,
      days,
      publishedWeeks
    };
  }
  return result;
}

function weekStartKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) return "";
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

function normalizeDeletedIds(value) {
  return Array.isArray(value) ? [...new Set(value.map(String).filter(Boolean))] : [];
}

function mergeTaskTemplates(value, defaults, deletedIds = []) {
  const incoming = Array.isArray(value) ? value : [];
  const ids = new Set(incoming.map((task) => task?.id).filter(Boolean));
  const deleted = new Set(deletedIds);
  return [
    ...incoming,
    ...defaults.filter((task) => !ids.has(task.id) && !deleted.has(task.id))
  ];
}

function publicSettings(settings) {
  return {
    businessName: settings.businessName,
    employees: settings.employees,
    employeeDepartments: settings.employeeDepartments || {},
    employeeRoles: settings.employeeRoles || {},
    fixedEmployees: settings.fixedEmployees || [],
    availabilityExemptEmployees: settings.availabilityExemptEmployees || [],
    availabilityTargetMonth: normalizeMonth(settings.availabilityTargetMonth) || defaultAvailabilityTargetMonth(),
    availabilitySubmissionOpen: settings.availabilitySubmissionOpen !== false,
    adminEmployees: settings.adminEmployees || [],
    positions: ensureRequiredPositions(settings.positions || []),
    chefViewSections: settings.chefViewSections || defaultData.settings.chefViewSections,
    dayReportFields: settings.dayReportFields || defaultData.settings.dayReportFields,
    scheduleAutoDeleteDays: normalizeScheduleAutoDeleteDays(
      settings.scheduleAutoDeleteDays,
      defaultData.settings.scheduleAutoDeleteDays
    ),
    hourlyRate: normalizeHourlyRate(
      settings.hourlyRate,
      defaultData.settings.hourlyRate
    )
  };
}

function normalizePositionGroup(value) {
  const clean = String(value || "").trim().toLowerCase();
  if (clean.startsWith("counter")) return "counter";
  if (clean.startsWith("service")) return "service";
  if (clean.startsWith("kÃ¼che") || clean.startsWith("kueche") || clean.startsWith("kuche")) return "kueche";
  if (clean.startsWith("spÃ¼ler") || clean.startsWith("spueler") || clean.startsWith("spuler")) return "spueler";
  if (clean.startsWith("reinigung")) return "reinigung";
  if (clean.startsWith("mechanik")) return "mechanik";
  return clean;
}

function ensureRequiredPositions(positions) {
  const clean = [...new Set((positions || []).map(String).map((name) => name.trim()).filter(Boolean))];
  if (!clean.some((position) => normalizePositionGroup(position) === "counter")) clean.push("Counter 1");
  if (!clean.some((position) => position.toLowerCase() === "counter 2")) clean.push("Counter 2");
  if (!clean.some((position) => position.toLowerCase() === "kueche 2" || position.toLowerCase() === "kÃ¼che 2")) clean.push("Kueche 2");
  if (!clean.some((position) => normalizePositionGroup(position) === "spueler")) clean.push("Spueler");
  if (!clean.some((position) => normalizePositionGroup(position) === "mechanik")) clean.push("Mechanik");
  return clean;
}

function normalizeScheduleAutoDeleteDays(value, fallback = 14) {
  const normalizedFallback = Number.isFinite(Number(fallback)) ? Number(fallback) : 14;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Math.max(0, Math.min(365, Math.floor(normalizedFallback)));
  return Math.max(0, Math.min(365, Math.floor(parsed)));
}

function normalizeHourlyRate(value, fallback = 25) {
  const normalizedFallback = Number.isFinite(Number(fallback)) ? Number(fallback) : 25;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Math.max(0, Math.min(200, Math.round(normalizedFallback * 100) / 100));
  return Math.max(0, Math.min(200, Math.round(parsed * 100) / 100));
}

function normalizeMonth(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(text) ? text : "";
}

function defaultAvailabilityTargetMonth() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function sanitizeSchedules(schedules) {
  return Object.fromEntries(
    Object.entries(schedules || {}).filter(([, schedule]) => schedule?.published)
  );
}

function config() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  return {
    supabaseUrl,
    supabaseKey,
    receiptBucket: process.env.SUPABASE_RECEIPTS_BUCKET || "receipts",
    table: process.env.SUPABASE_TABLE || "app_state",
    stateKey: process.env.STATE_KEY || "dienstplan"
  };
}

async function supabaseRequest(pathname, options = {}) {
  const { supabaseUrl, supabaseKey } = config();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Server-Konfiguration fehlt: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY muessen in Vercel gesetzt sein.");
  }
  const headers = {
    apikey: supabaseKey,
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  headers.Authorization = `Bearer ${supabaseKey}`;
  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${pathname}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function readAppData() {
  const { table, stateKey } = config();
  const rows = await supabaseRequest(`${table}?key=eq.${encodeURIComponent(stateKey)}&select=value&limit=1`);
  if (rows.length) return mergeData(rows[0].value);
  const data = cloneData(defaultData);
  await writeAppData(data);
  return data;
}

async function writeAppData(appData) {
  const { table, stateKey } = config();
  await supabaseRequest(`${table}?on_conflict=key`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify({
      key: stateKey,
      value: appData,
      updated_at: new Date().toISOString()
    })
  });
}

async function supabaseStorageRequest(pathname, options = {}) {
  const { supabaseUrl, supabaseKey } = config();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Server-Konfiguration fehlt: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY muessen in Vercel gesetzt sein.");
  }
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...(options.headers || {})
  };
  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/storage/v1/${pathname}`, {
    ...options,
    headers
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Storage-Fehler ${response.status}`);
  }
  return response;
}

async function ensureReceiptBucket() {
  const { receiptBucket } = config();
  try {
    await supabaseStorageRequest("bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: receiptBucket, name: receiptBucket, public: false })
    });
  } catch (error) {
    const text = String(error.message || error).toLowerCase();
    if (!text.includes("already") && !text.includes("exist") && !text.includes("duplicate")) {
      throw error;
    }
  }
}

function cleanStorageName(value, fallback = "beleg") {
  const name = String(value || fallback).trim() || fallback;
  return name
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120) || fallback;
}

function dataUrlToBuffer(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

function extensionForMime(mime, filename) {
  const fromName = String(filename || "").match(/\.([a-zA-Z0-9]{2,6})$/)?.[1];
  if (fromName) return fromName.toLowerCase();
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

async function uploadReceiptDataUrl(dataUrl, { date, filename, prefix } = {}) {
  const parsed = dataUrlToBuffer(dataUrl);
  if (!parsed) return null;
  if (parsed.buffer.length > 8 * 1024 * 1024) {
    throw new Error("Beleg ist zu gross. Bitte Datei auf maximal 8 MB verkleinern.");
  }
  await ensureReceiptBucket();
  const { receiptBucket } = config();
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(String(date || "")) ? date : "ohne-datum";
  const safePrefix = cleanStorageName(prefix || "beleg");
  const safeName = cleanStorageName(filename || "beleg");
  const ext = extensionForMime(parsed.mime, safeName);
  const id = crypto.randomBytes(8).toString("hex");
  const objectPath = `${safeDate}/${safePrefix}-${Date.now()}-${id}.${ext}`;
  await supabaseStorageRequest(`object/${receiptBucket}/${objectPath}`, {
    method: "POST",
    headers: {
      "Content-Type": parsed.mime,
      "x-upsert": "false"
    },
    body: parsed.buffer
  });
  return {
    receiptName: safeName,
    receiptPath: objectPath,
    receiptUrl: `/api/receipt?path=${encodeURIComponent(objectPath)}&name=${encodeURIComponent(safeName)}`
  };
}

async function downloadReceipt(objectPath) {
  const { receiptBucket } = config();
  const response = await supabaseStorageRequest(`object/${receiptBucket}/${String(objectPath || "").replace(/^\/+/, "")}`);
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType
  };
}

function createPinHash(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 120000;
  const digest = crypto.pbkdf2Sync(String(pin), salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$${iterations}$${salt}$${digest}`;
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

function verifyAdmin(settings, pin) {
  return verifyPin(pin, settings.adminPinHash || settings.adminPin);
}

function employeePinKeys(employee) {
  const clean = String(employee || "").trim();
  const names = [clean];
  const parts = clean.replace(",", " ").split(/\s+/).filter(Boolean);
  if (clean.includes(",")) {
    const [last, rest = ""] = clean.split(",");
    const first = rest.trim().split(/\s+/).filter(Boolean)[0] || "";
    if (first && last.trim()) names.push(`${first} ${last.trim()}`);
    if (first) names.push(first);
    if (last.trim()) names.push(last.trim());
  }
  if (parts.length > 1) {
    names.push(parts[0]);
    names.push(parts[parts.length - 1]);
    names.push(`${parts[0]} ${parts[parts.length - 1]}`);
  }
  return [...new Set(names.filter(Boolean))];
}

function employeePinCandidates(settings, employee) {
  const exact = String(employee || "").trim();
  const exactCandidates = [
    settings.employeePinHashes?.[exact],
    settings.employeePins?.[exact]
  ];
  const aliasCandidates = employeePinKeys(exact)
    .filter((key) => key !== exact)
    .flatMap((key) => [settings.employeePinHashes?.[key], settings.employeePins?.[key]]);
  return [...new Set([...exactCandidates, ...aliasCandidates].filter(Boolean))];
}

function employeeByPin(settings, pin) {
  for (const employee of settings.employees || []) {
    for (const stored of employeePinCandidates(settings, employee)) {
      if (verifyPin(pin, stored)) return employee;
    }
  }
  return "";
}

function employeeIsAdmin(settings, employee) {
  const admins = new Set((settings.adminEmployees || []).map((name) => String(name).trim().toLowerCase()));
  return admins.has(String(employee || "").trim().toLowerCase());
}

function sessionSecret() {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "dienstplan-local-secret";
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Date.now() + 12 * 60 * 60 * 1000
  })).toString("base64url");
  const sig = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token, type) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp < Date.now() || payload.type !== type) return null;
  return payload;
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function handleError(res, error) {
  sendJson(res, error.statusCode || 500, { error: error.message || String(error) });
}

function syncReportTipsToTimesheets(appData) {
  if (!appData || typeof appData !== "object") return false;
  const reports = appData.dayReports && typeof appData.dayReports === "object" ? appData.dayReports : {};
  appData.timesheets ||= {};
  let changed = false;

  for (const [date, report] of Object.entries(reports)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !report || typeof report !== "object") continue;
    const month = date.slice(0, 7);
    appData.timesheets[month] ||= {};
    const tips = reportTipsForSync(appData, date, report);
    if (!Object.keys(tips).length) continue;
    const syncedTipTotal = reportTipTotalForSync(report);
    const syncedTipRemainder = Math.max(0, syncedTipTotal - Object.values(tips).reduce((sum, amount) => sum + tipMoneyNumber(amount), 0));

    if (syncedTipTotal > 0 && tipMoneyNumber(report.tipTotal) <= 0) {
      report.tipTotal = tipMoneyString(syncedTipTotal);
      changed = true;
    }
    if (syncedTipTotal > 0 && tipMoneyString(report.tipRemainder) !== tipMoneyString(syncedTipRemainder)) {
      report.tipRemainder = tipMoneyString(syncedTipRemainder);
      changed = true;
    }

    const existingTips = cleanTipMapForSync(report.tipsByEmployee || {});
    if (JSON.stringify(existingTips) !== JSON.stringify(tips)) {
      report.tipsByEmployee = tips;
      changed = true;
    }

    for (const [employee, tip] of Object.entries(tips)) {
      const entries = appData.timesheets[month][employee];
      const existing = entries?.[date];
      if (!existing || (!existing.from && !existing.to)) continue;
      if (String(existing.tip || "") === tip && existing.tipSource === "terminal-distribution") continue;
      appData.timesheets[month][employee][date] = {
        ...existing,
        tip,
        tipSource: "terminal-distribution",
        updatedAt: new Date().toISOString()
      };
      changed = true;
    }
  }

  return changed;
}

function reportTipsForSync(appData, date, report) {
  const explicit = cleanTipMapForSync(report.tipsByEmployee || {});
  if (Object.values(explicit).some((amount) => tipMoneyNumber(amount) > 0)) return explicit;
  return deriveTipsForReport(appData, date, report);
}

function deriveTipsForReport(appData, date, report) {
  const tipTotal = reportTipTotalForSync(report);
  if (tipTotal <= 0) return {};
  const month = date.slice(0, 7);
  const entriesByEmployee = appData.timesheets?.[month] || {};
  const scheduleDay = appData.schedules?.[month]?.days?.[date] || {};
  const openingTime = tipOpeningTimeForSync(report);
  let rows = Object.entries(entriesByEmployee).map(([employee, entries]) => {
    const entry = entries?.[date] || {};
    const area = tipAreaForSync(appData.settings || {}, scheduleDay, report, employee);
    const hours = paidHoursAfterOpeningForSync(entry, openingTime);
    return { employee, area, hours };
  }).filter((row) => isTipEligibleAreaForSync(row.area) && row.hours > 0);
  if (!rows.length) {
    rows = Object.entries(entriesByEmployee).map(([employee, entries]) => {
      const entry = entries?.[date] || {};
      const area = tipAreaForSync(appData.settings || {}, scheduleDay, report, employee);
      const hours = paidHoursAfterOpeningForSync(entry, openingTime);
      return { employee, area, hours };
    }).filter((row) => isTipEligibleAreaForSync(row.area) && row.hours > 0);
  }
  const kitchenCount = rows.filter((row) => isKitchenTipAreaForSync(row.area)).length;
  const weighted = rows.map((row) => ({
    ...row,
    factor: isKitchenTipAreaForSync(row.area) && kitchenCount >= 2 ? 0.75 : 1
  })).map((row) => ({
    ...row,
    weight: row.hours * row.factor
  }));
  const totalWeight = weighted.reduce((sum, row) => sum + row.weight, 0);
  if (totalWeight <= 0) return {};
  return cleanTipMapForSync(Object.fromEntries(weighted.map((row) => {
    const rawTip = tipTotal * row.weight / totalWeight;
    return [row.employee, roundTipToBillsForSync(rawTip)];
  })));
}

function cleanTipMapForSync(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .map(([employee, amount]) => [String(employee || "").trim(), tipMoneyString(amount)])
    .filter(([employee, amount]) => employee && tipMoneyNumber(amount) > 0)
    .sort(([left], [right]) => left.localeCompare(right, "de")));
}

function reportTipTotalForSync(report = {}) {
  const storedTipTotal = tipMoneyNumber(report.tipTotal);
  if (storedTipTotal > 0) return storedTipTotal;
  const payoutTotal = tipMoneyNumber(report.tipPayoutAmount) + tipMoneyNumber(report.tipPayoutRemainder);
  if (payoutTotal > 0) return payoutTotal;
  const cashTotal = tipMoneyNumber(report.cashTotal);
  const ecTotal = tipMoneyNumber(report.ecTotal) || tipMoneyNumber(report.ecTerminal1) + tipMoneyNumber(report.ecTerminal2);
  const personalConsumption = tipMoneyNumber(report.personalConsumption);
  const cashExpenses = tipMoneyNumber(report.cashExpenses);
  const revenueBowling = tipMoneyNumber(report.revenueBowling ?? report.barBowling);
  const revenueGastro = tipMoneyNumber(report.revenueGastro ?? report.barGastro)
    || tipMoneyNumber(report.revenueDrinks) + tipMoneyNumber(report.revenueFood) + tipMoneyNumber(report.revenueOther);
  const totalRevenue = Math.max(0, revenueBowling + revenueGastro - personalConsumption);
  return Math.max(0, cashTotal + cashExpenses + ecTotal - totalRevenue);
}

function tipAreaForSync(settings, scheduleDay, report, employee) {
  for (const [position, value] of Object.entries(scheduleDay || {})) {
    if (position.includes("__")) continue;
    if (String(value || "").trim() === employee) return tipDepartmentForSync(position);
  }
  const extra = (Array.isArray(report.extraEmployees) ? report.extraEmployees : [])
    .map((item) => typeof item === "string" ? { employee: item, role: "" } : item)
    .find((item) => String(item?.employee || "").trim() === employee);
  if (extra?.role) return tipDepartmentForSync(extra.role);
  const roleDepartment = tipDepartmentForSync(settings.employeeRoles?.[employee] || "");
  if (roleDepartment) return roleDepartment;
  const departments = settings.employeeDepartments?.[employee] || [];
  const values = Array.isArray(departments) ? departments : String(departments || "").split(",");
  return values.map(tipDepartmentForSync).find(isTipEligibleAreaForSync) || "";
}

function tipDepartmentForSync(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (text.includes("spuel") || text.includes("spül")) return "Spueler";
  if (text.includes("counter")) return "Counter";
  if (text.includes("service")) return "Service";
  if (text.includes("kueche") || text.includes("kuche") || text.includes("küche") || text.includes("koch")) return "Kueche";
  return "";
}

function isTipEligibleAreaForSync(area) {
  return TIP_ELIGIBLE_AREAS.includes(area);
}

function isKitchenTipAreaForSync(area) {
  return area === "Kueche" || area === "Spueler";
}

function tipOpeningTimeForSync(report = {}) {
  const match = String(report.openingHours || "").match(/(\d{1,2}):(\d{2})/);
  return match ? `${String(match[1]).padStart(2, "0")}:${match[2]}` : "00:00";
}

function paidHoursAfterOpeningForSync(entry = {}, openingTime = "00:00") {
  if (!entry.from || !entry.to) return 0;
  const start = tipTimeToMinutes(entry.from);
  let end = tipTimeToMinutes(entry.to);
  const opening = tipTimeToMinutes(openingTime);
  if (end < start) end += 24 * 60;
  const effectiveStart = Math.max(start, opening);
  return Math.max(0, end - effectiveStart) / 60;
}

function tipMinutesBetween(from, to) {
  const start = tipTimeToMinutes(from);
  let end = tipTimeToMinutes(to);
  if (end < start) end += 24 * 60;
  return Math.max(0, end - start);
}

function tipTimeToMinutes(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function roundTipToBillsForSync(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 5) return 0;
  return Math.floor(amount / 5) * 5;
}

function tipMoneyNumber(value) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function tipMoneyString(value) {
  return (Math.round(tipMoneyNumber(value) * 100) / 100).toFixed(2);
}

module.exports = {
  createPinHash,
  defaultData,
  employeeByPin,
  employeeIsAdmin,
  handleError,
  downloadReceipt,
  mergeData,
  publicSettings,
  readAppData,
  readJson,
  sanitizeSchedules,
  sendJson,
  signToken,
  syncReportTipsToTimesheets,
  uploadReceiptDataUrl,
  verifyAdmin,
  verifyToken,
  weekdays,
  writeAppData
};
