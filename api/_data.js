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
    employeeTipSettings: {
      "Renate Leicht": { eligible: true, factor: 0.675 }
    },
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
    hourlyRate: 25,
    invoiceNotificationTo: process.env.INVOICE_NOTIFICATION_TO || "pvo65@outlook.de",
    pushSettings: {
      schedulePublished: true,
      assignmentsTomorrow: true,
      messages: true,
      schedulePublishedTitle: "LA-Bowling - Neuer Dienstplan online",
      schedulePublishedBody: "Der neue Dienstplan ist online. Bitte in der TeamApp prüfen.",
      assignmentsTomorrowTitle: "LA-Bowling - Einteilung für morgen ist Online",
      assignmentsTomorrowBody: "Bitte prüfe deine Startzeit in der TeamApp.",
      messagesTitle: "LA-Bowling - Du hast eine neue Nachricht im Dashboard",
      messagesBody: "{{text}}"
    }
  },
  availability: {},
  schedules: {},
  timesheets: {},
  tipPayouts: {},
  assignmentTimes: {},
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
  offers: [],
  swaps: [],
  availabilityChangeRequests: [],
  pushSubscriptions: {}
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
      employeeTipSettings: normalizeEmployeeTipSettings({
        ...base.settings.employeeTipSettings,
        ...(value?.settings?.employeeTipSettings || {})
      }),
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
      ),
      invoiceNotificationTo: String(value?.settings?.invoiceNotificationTo || base.settings.invoiceNotificationTo || "pvo65@outlook.de").trim().slice(0, 180),
      pushSettings: {
        ...base.settings.pushSettings,
        ...(value?.settings?.pushSettings || {})
      }
    },
    availability: value?.availability || base.availability,
    schedules: normalizeSchedules(value?.schedules || base.schedules),
    timesheets: value?.timesheets || base.timesheets,
    tipPayouts: value?.tipPayouts && typeof value.tipPayouts === "object" ? value.tipPayouts : base.tipPayouts,
    assignmentTimes: normalizeAssignmentTimes(value?.assignmentTimes || base.assignmentTimes),
    cleaningTemplates: Array.isArray(value?.cleaningTemplates) ? value.cleaningTemplates : base.cleaningTemplates,
    taskTemplates: mergeTaskTemplates(value?.taskTemplates, base.taskTemplates, deletedTaskTemplateIds),
    deletedTaskTemplateIds,
    reminderTemplates: Array.isArray(value?.reminderTemplates) ? value.reminderTemplates : base.reminderTemplates,
    messages: Array.isArray(value?.messages) ? value.messages : base.messages,
    terminalMessages: Array.isArray(value?.terminalMessages) ? value.terminalMessages : base.terminalMessages,
    customerDirectory: Array.isArray(value?.customerDirectory) ? value.customerDirectory : base.customerDirectory,
    offers: Array.isArray(value?.offers) ? value.offers : base.offers,
    swaps: Array.isArray(value?.swaps) ? value.swaps : base.swaps,
    availabilityChangeRequests: Array.isArray(value?.availabilityChangeRequests) ? value.availabilityChangeRequests : base.availabilityChangeRequests,
    pushSubscriptions: normalizePushSubscriptions(value?.pushSubscriptions || base.pushSubscriptions)
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

function normalizeAssignmentTimes(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  for (const [dateKey, employees] of Object.entries(value)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) continue;
    if (!employees || typeof employees !== "object" || Array.isArray(employees)) continue;
    const day = {};
    for (const [employee, item] of Object.entries(employees)) {
      const cleanEmployee = String(employee || "").trim();
      if (!cleanEmployee) continue;
      const from = normalizeAssignmentTime(item?.from);
      const note = String(item?.note || "").trim().slice(0, 240);
      if (from || note) day[cleanEmployee] = { from, to: "", note };
    }
    if (Object.keys(day).length) result[dateKey] = day;
  }
  return result;
}

function normalizeAssignmentTime(value) {
  const text = String(value || "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : "";
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

function normalizeEmployeeTipSettings(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .map(([employee, setting]) => [String(employee || "").trim(), normalizeEmployeeTipSetting(setting)])
    .filter(([employee]) => employee));
}

function normalizeEmployeeTipSetting(setting = {}) {
  return {
    eligible: setting?.eligible === true,
    factor: normalizeTipFactor(setting?.factor, 1)
  };
}

function normalizeTipFactor(value, fallback = 1) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  const base = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(0.1, Math.min(1, Math.round(base * 1000) / 1000));
}

function publicSettings(settings) {
  return {
    businessName: settings.businessName,
    employees: settings.employees,
    employeeDepartments: settings.employeeDepartments || {},
    employeeRoles: settings.employeeRoles || {},
    employeeTipSettings: normalizeEmployeeTipSettings(settings.employeeTipSettings || {}),
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
    ),
    pushSettings: {
      ...defaultData.settings.pushSettings,
      ...(settings.pushSettings || {})
    }
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

function pushPublicKey() {
  return String(process.env.VAPID_PUBLIC_KEY || "").trim();
}

function normalizePushSubscriptions(value = {}) {
  const result = {};
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  for (const [employee, subscriptions] of Object.entries(value)) {
    const cleanEmployee = String(employee || "").trim();
    const list = (Array.isArray(subscriptions) ? subscriptions : [])
      .map(cleanPushSubscription)
      .filter(Boolean)
      .filter((item, index, all) => all.findIndex((other) => other.endpoint === item.endpoint) === index)
      .slice(0, 5);
    if (cleanEmployee && list.length) result[cleanEmployee] = list;
  }
  return result;
}

function cleanPushSubscription(subscription = {}) {
  const endpoint = String(subscription.endpoint || "").trim();
  const keys = subscription.keys || {};
  const p256dh = String(keys.p256dh || "").trim();
  const auth = String(keys.auth || "").trim();
  if (!endpoint || !p256dh || !auth) return null;
  return {
    endpoint,
    expirationTime: subscription.expirationTime || null,
    keys: { p256dh, auth },
    createdAt: String(subscription.createdAt || new Date().toISOString()).slice(0, 80),
    updatedAt: String(subscription.updatedAt || new Date().toISOString()).slice(0, 80)
  };
}

function upsertPushSubscription(appData, employee, subscription) {
  const employeeName = matchEmployeeName(appData?.settings, employee);
  const clean = cleanPushSubscription(subscription);
  if (!employeeName || !clean) return false;
  appData.pushSubscriptions = normalizePushSubscriptions(appData.pushSubscriptions);
  const existing = appData.pushSubscriptions[employeeName] || [];
  const previous = existing.find((item) => item.endpoint === clean.endpoint);
  appData.pushSubscriptions[employeeName] = [
    {
      ...clean,
      createdAt: previous?.createdAt || clean.createdAt,
      updatedAt: new Date().toISOString()
    },
    ...existing.filter((item) => item.endpoint !== clean.endpoint)
  ].slice(0, 5);
  return true;
}

function pushSubscriptionActive(appData, employee) {
  const employeeName = matchEmployeeName(appData?.settings, employee);
  return Boolean(employeeName && normalizePushSubscriptions(appData?.pushSubscriptions)[employeeName]?.length);
}

async function sendPushToEmployees(appData, employees = [], payload = {}) {
  const publicKey = pushPublicKey();
  const privateKey = String(process.env.VAPID_PRIVATE_KEY || "").trim();
  if (!publicKey || !privateKey) return { sent: 0, skipped: true, reason: "missing-vapid" };
  let webpush;
  try {
    webpush = require("web-push");
  } catch (error) {
    return { sent: 0, skipped: true, reason: "web-push-missing" };
  }
  webpush.setVapidDetails(
    String(process.env.VAPID_SUBJECT || "mailto:info@la-bowling.de").trim(),
    publicKey,
    privateKey
  );
  appData.pushSubscriptions = normalizePushSubscriptions(appData.pushSubscriptions);
  const targetEmployees = [...new Set((employees || []).map((employee) => matchEmployeeName(appData.settings, employee)).filter(Boolean))];
  let sent = 0;
  let removed = 0;
  const body = JSON.stringify({
    title: String(payload.title || "LA-Bowling TeamApp").slice(0, 120),
    body: String(payload.body || "Es gibt eine neue Info in der TeamApp.").slice(0, 240),
    url: String(payload.url || "/").slice(0, 240),
    tag: String(payload.tag || `teamapp-${Date.now()}`).slice(0, 120)
  });
  for (const employee of targetEmployees) {
    const subscriptions = appData.pushSubscriptions[employee] || [];
    const keep = [];
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, body, { TTL: 86400 });
        sent += 1;
        keep.push(subscription);
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          removed += 1;
        } else {
          keep.push(subscription);
        }
      }
    }
    if (keep.length) appData.pushSubscriptions[employee] = keep;
    else delete appData.pushSubscriptions[employee];
  }
  return { sent, removed, skipped: false };
}

function formatMailDate(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const date = new Date(`${text.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("de-DE");
}

function formatInvoiceMoney(value) {
  const amount = tipMoneyNumber(value);
  return `${amount.toFixed(2).replace(".", ",")} Euro`;
}

function invoiceGastroSplit(customer = {}) {
  const drinksText = String(customer.gastroDrinksAmount ?? "").trim();
  const foodText = String(customer.gastroFoodAmount ?? "").trim();
  const otherText = String(customer.gastroOtherAmount ?? "").trim();
  const hasSplit = [drinksText, foodText, otherText].some(Boolean);
  const drinks = tipMoneyNumber(customer.gastroDrinksAmount);
  const food = tipMoneyNumber(customer.gastroFoodAmount);
  const other = tipMoneyNumber(customer.gastroOtherAmount);
  const fallback = tipMoneyNumber(customer.gastroAmount);
  const total = hasSplit ? drinks + food + other : fallback;
  return { drinks, food, other, total, hasSplit, note: String(customer.gastroOtherNote || "").trim() };
}

function buildInvoiceNotificationText({ date, customer = {} } = {}) {
  const formattedDate = formatMailDate(date) || String(date || "").trim() || "-";
  const bowlingAmount = tipMoneyNumber(customer.bowlingAmount);
  const gastroSplit = invoiceGastroSplit(customer);
  const gastroAmount = gastroSplit.total;
  const totalAmount = tipMoneyNumber(customer.amount) || bowlingAmount + gastroAmount;
  const tipText = String(customer.tip || "").trim() || "-";
  const paymentMethod = String(customer.paymentMethod || "").trim() || "-";
  const gastroLines = gastroSplit.hasSplit
    ? [
      `Gastro Getränke: ${formatInvoiceMoney(gastroSplit.drinks)}`,
      `Gastro Speisen: ${formatInvoiceMoney(gastroSplit.food)}`,
      `Gastro Sonstiges: ${formatInvoiceMoney(gastroSplit.other)}`,
      `Gastro Gesamt: ${formatInvoiceMoney(gastroAmount)}`
    ]
    : [`Gastro Gesamt: ${formatInvoiceMoney(gastroAmount)}`];
  return [
    "Bitte eine Rechnung schreiben",
    "",
    `Datum: ${formattedDate}`,
    `Firma / Name: ${String(customer.name || "").trim() || "-"}`,
    `Rechnungsadresse: ${String(customer.address || "").trim() || "-"}`,
    `Bowling Betrag: ${formatInvoiceMoney(bowlingAmount)}`,
    ...gastroLines,
    `Gesamtbetrag: ${formatInvoiceMoney(totalAmount)}`,
    `Zahlungsart: ${paymentMethod}`,
    `Ansprechpartner: ${String(customer.contact || "").trim() || "-"}`,
    `Telefonnummer: ${String(customer.phone || "").trim() || "-"}`,
    `E-Mail für Rechnung: ${String(customer.email || "").trim() || "-"}`,
    ...(gastroSplit.note ? [`Sonstiges Notiz: ${gastroSplit.note}`] : []),
    `Notiz: ${String(customer.note || "").trim() || "-"}`,
    `Tipp separat: ${tipText}`,
    "",
    "Hinweis: Kunde auf Rechnung wurde in der TeamApp erfasst und ist jetzt bereit für die Rechnungsschreibung"
  ].join("\n");
}

function escapeMailHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMailMultiline(value) {
  const text = String(value || "").trim();
  if (!text) return "<strong>-</strong>";
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => `<strong>${escapeMailHtml(line)}</strong>`)
    .join("<br>");
}

function mailValue(value, fallback = "-") {
  const text = String(value || "").trim() || fallback;
  return `<strong>${escapeMailHtml(text)}</strong>`;
}

function mailMoneyValue(value) {
  return `<strong>${escapeMailHtml(formatInvoiceMoney(value))}</strong>`;
}

function buildInvoiceNotificationHtml({ date, customer = {} } = {}) {
  const formattedDate = formatMailDate(date) || String(date || "").trim() || "-";
  const bowlingAmount = tipMoneyNumber(customer.bowlingAmount);
  const gastroSplit = invoiceGastroSplit(customer);
  const gastroAmount = gastroSplit.total;
  const totalAmount = tipMoneyNumber(customer.amount) || bowlingAmount + gastroAmount;
  const tipText = String(customer.tip || "").trim() || "-";
  const paymentMethod = String(customer.paymentMethod || "").trim() || "-";
  const amountRows = [
    ["Bowling Betrag", mailMoneyValue(bowlingAmount)],
    ["Gastro Getränke", mailMoneyValue(gastroSplit.drinks)],
    ["Gastro Speisen", mailMoneyValue(gastroSplit.food)],
    ["Gastro Sonstiges", mailMoneyValue(gastroSplit.other)],
    ["Gastro Gesamt", mailMoneyValue(gastroAmount)],
    ["Tipp", mailValue(tipText)]
  ];
  const dayReference = String(customer.reportDate || customer.dayDate || customer.date || date || "").trim();
  const attachments = invoiceAttachmentSources(customer)
    .map((item) => {
      const label = item.label === "rechnungsbeleg"
        ? "Rechnungsbeleg"
        : item.label === "bowling-beleg"
          ? "Bowling-Beleg"
          : "Gastro-Beleg";
      const filename = String(item.filename || "").trim() || label;
      return { label, filename };
    });
  const infoBlock = (label, value, extra = "") => `
      <div style="margin-top:14px;padding:16px 18px;background:#fafbfc;border:1px solid #e8edf2;border-radius:12px;">
        <div style="font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#7b8794;margin-bottom:8px;">${escapeMailHtml(label)}</div>
        <div style="font-size:16px;line-height:1.55;color:#111827;">${value}</div>
        ${extra}
      </div>
    `;
  const amountHtml = amountRows.map(([label, value], index) => `
      <tr>
        <td style="padding:11px 0;border-bottom:${index === amountRows.length - 1 ? "0" : "1px solid #edf1f5"};color:#5f6b76;font-size:14px;vertical-align:top;">${escapeMailHtml(label)}</td>
        <td style="padding:11px 0;border-bottom:${index === amountRows.length - 1 ? "0" : "1px solid #edf1f5"};color:#111827;font-size:15px;vertical-align:top;text-align:right;">${value}</td>
      </tr>
    `).join("");
  const attachmentHtml = attachments.length
    ? `<div style="margin-top:14px;padding:16px 18px;background:#fafbfc;border:1px solid #e8edf2;border-radius:12px;">
        <div style="font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#7b8794;margin-bottom:10px;">Mitgesendete Belege</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${attachments.map((item) => `<span style="display:inline-block;padding:8px 10px;border-radius:999px;background:#ffffff;border:1px solid #e5e7eb;color:#4b5563;font-size:13px;"><strong>${escapeMailHtml(item.label)}:</strong> ${escapeMailHtml(item.filename)}</span>`).join("")}
        </div>
      </div>`
    : "";
  return `
    <div style="margin:0;padding:24px;background:#f3f6f9;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #e6ebf0;border-radius:16px;overflow:hidden;">
        <div style="padding:24px 30px 20px;background:#ffffff;border-top:4px solid #d71920;border-bottom:1px solid #eef2f6;">
          <div style="font-size:25px;font-weight:800;letter-spacing:0.02em;line-height:1;color:#111827;">LA-BOWLING</div>
          <div style="margin-top:14px;font-size:26px;font-weight:700;line-height:1.2;color:#111827;">Bitte eine Rechnung schreiben</div>
          <div style="margin-top:8px;font-size:14px;line-height:1.5;color:#6b7280;">Kunde auf Rechnung wurde in der TeamApp erfasst und ist jetzt bereit für die Rechnung.</div>
        </div>
        <div style="padding:22px 30px 28px;">
          ${infoBlock("Datum", mailValue(formattedDate), dayReference ? `<div style="margin-top:6px;font-size:13px;color:#7b8794;">Tagesbericht-Zuordnung: <strong>${escapeMailHtml(formatMailDate(dayReference) || dayReference)}</strong></div>` : "")}
          ${infoBlock("Firma", formatMailMultiline(customer.name), `<div style="margin-top:14px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#7b8794;margin-bottom:8px;">Rechnungsadresse</div><div style="font-size:16px;line-height:1.55;color:#111827;">${formatMailMultiline(customer.address)}</div>`)}
          <div style="margin-top:14px;padding:16px 18px;background:#fafbfc;border:1px solid #e8edf2;border-radius:12px;">
            <div style="font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#7b8794;margin-bottom:10px;">Beträge</div>
            <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
              <tbody>${amountHtml}</tbody>
              <tfoot>
                <tr>
                  <td style="padding-top:14px;border-top:1px solid #dbe2ea;color:#111827;font-size:15px;font-weight:700;">Gesamtbetrag</td>
                  <td style="padding-top:14px;border-top:1px solid #dbe2ea;color:#111827;font-size:20px;font-weight:800;text-align:right;">${escapeMailHtml(formatInvoiceMoney(totalAmount))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          ${infoBlock("Zahlungsart", mailValue(paymentMethod))}
          ${infoBlock("Ansprechpartner", mailValue(customer.contact))}
          ${infoBlock("Telefon", mailValue(customer.phone), `<div style="margin-top:12px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#7b8794;margin-bottom:8px;">E-Mail für Rechnung</div><div style="font-size:15px;line-height:1.5;color:#111827;">${mailValue(customer.email)}</div>`)}
          ${infoBlock("Notiz", mailValue(customer.note), gastroSplit.note ? `<div style="margin-top:12px;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#7b8794;margin-bottom:8px;">Sonstiges Hinweis</div><div style="font-size:15px;line-height:1.5;color:#111827;">${mailValue(gastroSplit.note)}</div>` : "")}
          ${attachmentHtml}
          <div style="margin-top:14px;padding:14px 16px;background:#fcfcfd;border:1px solid #e8edf2;border-radius:12px;color:#6b7280;font-size:13px;line-height:1.55;">
            Hinweis: Bitte Zahlungsart, Beträge und angehängte Belege bei der Rechnungserstellung berücksichtigen.
          </div>
        </div>
      </div>
    </div>
  `;
}

function receiptPathFromUrl(url = "") {
  const text = String(url || "").trim();
  if (!text) return "";
  try {
    const parsed = new URL(text, "https://local.invalid");
    return String(parsed.searchParams.get("path") || "").replace(/^\/+/, "").trim();
  } catch {
    return "";
  }
}

function attachmentFilename(label, filename = "", contentType = "application/octet-stream") {
  const cleanName = cleanStorageName(filename || "");
  if (cleanName && /\.[a-zA-Z0-9]{2,6}$/.test(cleanName)) return cleanName;
  const ext = extensionForMime(contentType, cleanName || label);
  const base = cleanName || cleanStorageName(label || "beleg");
  return `${base}.${ext}`;
}

function invoiceAttachmentSources(customer = {}) {
  return [
    {
      label: "rechnungsbeleg",
      filename: customer.receiptName || "",
      dataUrl: customer.receiptData || "",
      objectPath: customer.receiptPath || receiptPathFromUrl(customer.receiptUrl)
    },
    {
      label: "bowling-beleg",
      filename: customer.bowlingReceiptName || "",
      dataUrl: customer.bowlingReceiptData || "",
      objectPath: customer.bowlingReceiptPath || receiptPathFromUrl(customer.bowlingReceiptUrl)
    },
    {
      label: "gastro-beleg",
      filename: customer.gastroReceiptName || "",
      dataUrl: customer.gastroReceiptData || "",
      objectPath: customer.gastroReceiptPath || receiptPathFromUrl(customer.gastroReceiptUrl)
    }
  ].filter((item) => item.dataUrl || item.objectPath);
}

async function invoiceMailAttachments(customer = {}) {
  const seen = new Set();
  const attachments = [];
  for (const source of invoiceAttachmentSources(customer)) {
    const key = source.objectPath || source.dataUrl || source.filename || source.label;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    try {
      if (source.dataUrl) {
        const parsed = dataUrlToBuffer(source.dataUrl);
        if (!parsed?.buffer?.length) continue;
        attachments.push({
          filename: attachmentFilename(source.label, source.filename, parsed.mime),
          content: parsed.buffer,
          contentType: parsed.mime
        });
        continue;
      }
      if (source.objectPath) {
        const downloaded = await downloadReceipt(source.objectPath);
        if (!downloaded?.buffer?.length) continue;
        attachments.push({
          filename: attachmentFilename(source.label, source.filename, downloaded.contentType),
          content: downloaded.buffer,
          contentType: downloaded.contentType
        });
      }
    } catch (error) {
      console.error("Rechnungsbeleg konnte nicht als Mail-Anhang geladen werden.", {
        label: source.label,
        filename: source.filename || "",
        objectPath: source.objectPath || "",
        error: error?.message || String(error)
      });
    }
  }
  return attachments;
}

async function sendInvoiceNotificationEmail(payload = {}) {
  const to = String(payload.to || process.env.INVOICE_NOTIFICATION_TO || "pvo65@outlook.de").trim();
  const smtpHost = String(process.env.SMTP_HOST || "").trim();
  const smtpUser = String(process.env.SMTP_USER || "").trim();
  const smtpPass = String(process.env.SMTP_PASS || "").trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || smtpPort === 465;

  if (!to) return { ok: false, skipped: true, reason: "missing-recipient" };
  if (!smtpHost || !smtpUser || !smtpPass) {
    return { ok: false, skipped: true, reason: "missing-smtp-config" };
  }

  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch (error) {
    console.error("Rechnungskunden-Mailversand fehlgeschlagen: nodemailer fehlt im Build.", error);
    return { ok: false, skipped: true, reason: "nodemailer-missing" };
  }

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: Number.isFinite(smtpPort) ? smtpPort : 587,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  try {
    const attachments = await invoiceMailAttachments(payload.customer || {});
    const info = await transport.sendMail({
      from: String(process.env.EMAIL_FROM || smtpUser).trim(),
      to,
      subject: "LA-Bowling Rechnung",
      text: buildInvoiceNotificationText(payload),
      html: buildInvoiceNotificationHtml(payload),
      attachments
    });
    return {
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted || []
    };
  } catch (error) {
    console.error("Rechnungskunden-Mailversand fehlgeschlagen.", error);
    return {
      ok: false,
      error: error?.message || String(error)
    };
  }
}

function applyPushTemplate(template, values = {}) {
  const source = String(template == null ? "" : template);
  return source.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const value = values[key];
    return value == null ? "" : String(value);
  }).trim();
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
      if (!existing || !timeSegmentsForSync(existing).some((segment) => segment.from || segment.to)) continue;
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
  }).filter((row) => employeeTipEligibleForSync(appData.settings || {}, row.employee, row.area) && row.hours > 0);
  if (!rows.length) {
    rows = Object.entries(entriesByEmployee).map(([employee, entries]) => {
      const entry = entries?.[date] || {};
      const area = tipAreaForSync(appData.settings || {}, scheduleDay, report, employee);
      const hours = paidHoursAfterOpeningForSync(entry, openingTime);
      return { employee, area, hours };
    }).filter((row) => employeeTipEligibleForSync(appData.settings || {}, row.employee, row.area) && row.hours > 0);
  }
  const kitchenInfo = tipKitchenInfoForSync(rows, tipMoneyNumber(report.revenueFood));
  const weighted = rows.map((row) => ({
    ...row,
    factor: tipFactorForSync(appData.settings || {}, row.employee, row.area, kitchenInfo)
  })).map((row) => ({
    ...row,
    weight: row.hours * row.factor
  }));
  const totalWeight = weighted.reduce((sum, row) => sum + row.weight, 0);
  if (totalWeight <= 0) return {};
  return cleanTipMapForSync(exactTipMapForSync(weighted, tipTotal));
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
  const invoiceTotal = reportTransferInvoiceTotalForSync(report);
  const totalRevenue = Math.max(0, revenueBowling + revenueGastro - personalConsumption);
  return Math.max(0, cashTotal + cashExpenses + ecTotal + invoiceTotal - totalRevenue);
}

function normalizedInvoicePaymentMethodForSync(value = "") {
  const text = String(value || "").trim().toLowerCase();
  if (text === "überweisung" || text === "ueberweisung") return "ueberweisung";
  if (text === "ec") return "ec";
  if (text === "bar") return "bar";
  return "";
}

function reportTransferInvoiceTotalForSync(report = {}) {
  return (Array.isArray(report.invoiceCustomers) ? report.invoiceCustomers : [])
    .filter(invoiceIsReadyForSync)
    .filter((item) => normalizedInvoicePaymentMethodForSync(item?.paymentMethod) === "ueberweisung")
    .reduce((sum, item) => sum + invoiceTotalForSync(item), 0);
}

function invoiceTotalForSync(item = {}) {
  const splitTotal = tipMoneyNumber(item.bowlingAmount) + invoiceGastroSplit(item).total;
  return splitTotal || tipMoneyNumber(item.amount);
}

function invoiceIsReadyForSync(item = {}) {
  if (item?.invoiceReady === true || item?.invoiceReady === "true") return true;
  if (item?.invoiceReady === false || item?.invoiceReady === "false") return false;
  return invoiceTotalForSync(item) > 0 && invoiceHasReceiptForSync(item);
}

function invoiceHasReceiptForSync(item = {}) {
  return Boolean(
    item?.receiptData || item?.receiptPath || item?.receiptUrl
    || item?.bowlingReceiptData || item?.bowlingReceiptPath || item?.bowlingReceiptUrl
    || item?.gastroReceiptData || item?.gastroReceiptPath || item?.gastroReceiptUrl
  );
}

function tipAreaForSync(settings, scheduleDay, report, employee) {
  const canonicalEmployee = matchEmployeeName(settings, employee) || String(employee || "").trim();
  for (const [position, value] of Object.entries(scheduleDay || {})) {
    if (position.includes("__")) continue;
    if (sameEmployeeName(value, canonicalEmployee)) return tipDepartmentForSync(position);
  }
  const extra = (Array.isArray(report.extraEmployees) ? report.extraEmployees : [])
    .map((item) => typeof item === "string" ? { employee: item, role: "" } : item)
    .find((item) => sameEmployeeName(item?.employee, canonicalEmployee));
  if (extra?.role) return tipDepartmentForSync(extra.role);
  const roleDepartment = tipDepartmentForSync(settings.employeeRoles?.[canonicalEmployee] || "");
  if (roleDepartment) return roleDepartment;
  const departments = settings.employeeDepartments?.[canonicalEmployee] || [];
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

function employeeTipEligibleForSync(settings = {}, employee, area) {
  const setting = tipSettingForSync(settings, employee);
  if (setting) return setting.eligible;
  return isTipEligibleAreaForSync(area);
}

function tipFactorForSync(settings = {}, employee, area, kitchenInfo = {}) {
  const groupFactor = kitchenGroupTipFactorForSync(area, kitchenInfo);
  if (groupFactor !== null) return groupFactor;
  const setting = tipSettingForSync(settings, employee);
  if (setting) return setting.eligible ? setting.factor : 0;
  return automaticTipFactorForSync(area, kitchenInfo);
}

function automaticTipFactorForSync(area, kitchenInfo = {}) {
  return kitchenGroupTipFactorForSync(area, kitchenInfo) ?? 1;
}

function kitchenGroupTipFactorForSync(area, kitchenInfo = {}) {
  if (!isKitchenTipAreaForSync(area)) return null;
  const cooks = Number(kitchenInfo.cooks || 0);
  const spuelers = Number(kitchenInfo.spuelers || 0);
  const kitchenRevenue = Number(kitchenInfo.kitchenRevenue || 0);
  if (cooks >= 2 && spuelers >= 1 && kitchenRevenue >= 2000) return 1;
  if (cooks >= 2 && spuelers >= 1) return 0.5;
  if (area === "Kueche" && cooks >= 2) return 0.75;
  return null;
}

function tipKitchenInfoForSync(rows = [], kitchenRevenue = 0) {
  return {
    cooks: rows.filter((row) => row.area === "Kueche").length,
    spuelers: rows.filter((row) => row.area === "Spueler").length,
    kitchenRevenue: Number(kitchenRevenue || 0)
  };
}

function tipSettingForSync(settings = {}, employee = "") {
  const tipSettings = settings.employeeTipSettings || {};
  const exact = tipSettings[employee];
  if (exact) return normalizeEmployeeTipSetting(exact);
  const clean = String(employee || "").trim();
  const match = Object.entries(tipSettings).find(([name]) => sameEmployeeName(name, clean));
  return match ? normalizeEmployeeTipSetting(match[1]) : null;
}

function exactTipMapForSync(rows = [], tipTotal = 0) {
  const totalCents = Math.round(tipMoneyNumber(tipTotal) * 100);
  const totalWeight = rows.reduce((sum, row) => sum + Number(row.weight || 0), 0);
  if (!rows.length || totalCents <= 0 || totalWeight <= 0) return {};
  const shares = rows.map((row) => {
    const rawCents = totalCents * Number(row.weight || 0) / totalWeight;
    return {
      employee: row.employee,
      cents: Math.floor(rawCents),
      rest: rawCents - Math.floor(rawCents)
    };
  });
  let remaining = totalCents - shares.reduce((sum, row) => sum + row.cents, 0);
  shares
    .slice()
    .sort((a, b) => b.rest - a.rest || a.employee.localeCompare(b.employee, "de"))
    .forEach((row) => {
      if (remaining <= 0) return;
      row.cents += 1;
      remaining -= 1;
    });
  return Object.fromEntries(shares.map((row) => [row.employee, tipMoneyString(row.cents / 100)]));
}

function tipOpeningTimeForSync(report = {}) {
  const match = String(report.openingHours || "").match(/(\d{1,2}):(\d{2})/);
  return match ? `${String(match[1]).padStart(2, "0")}:${match[2]}` : "00:00";
}

function paidHoursAfterOpeningForSync(entry = {}, openingTime = "00:00") {
  const opening = tipTimeToMinutes(openingTime);
  return timeSegmentsForSync(entry).reduce((sum, segment) => {
    if (!segment.from || !segment.to) return sum;
    const start = tipTimeToMinutes(segment.from);
    let end = tipTimeToMinutes(segment.to);
    if (end < start) end += 24 * 60;
    const effectiveStart = Math.max(start, opening);
    return sum + Math.max(0, end - effectiveStart) / 60;
  }, 0);
}

function timeSegmentsForSync(entry = {}) {
  const segments = Array.isArray(entry.segments) ? entry.segments : [];
  const normalized = segments.map((segment) => ({
    from: String(segment?.from || "").trim(),
    to: String(segment?.to || "").trim()
  })).filter((segment) => segment.from || segment.to);
  if (normalized.length) return normalized;
  return entry.from || entry.to ? [{ from: entry.from || "", to: entry.to || "" }] : [];
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

function matchEmployeeName(settings = {}, employee = "") {
  const clean = String(employee || "").trim();
  if (!clean) return "";
  return (settings.employees || []).find((name) => sameEmployeeName(name, clean)) || "";
}

function sameEmployeeName(left, right) {
  return normalizeEmployeeName(left) === normalizeEmployeeName(right);
}

function normalizeEmployeeName(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

function collectEmployeeTimesheets(appData, month, employee) {
  const targetMonth = String(month || "").trim();
  const canonicalEmployee = matchEmployeeName(appData?.settings, employee) || String(employee || "").trim();
  const monthEntries = appData?.timesheets?.[targetMonth];
  if (!targetMonth || !canonicalEmployee || !monthEntries || typeof monthEntries !== "object") return {};
  const result = {};
  for (const [storedEmployee, entries] of Object.entries(monthEntries)) {
    if (!sameEmployeeName(storedEmployee, canonicalEmployee)) continue;
    for (const [date, entry] of Object.entries(entries || {})) {
      result[date] = {
        ...(result[date] || {}),
        ...(entry || {})
      };
    }
  }
  return result;
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
  collectEmployeeTimesheets,
  applyPushTemplate,
  employeeByPin,
  matchEmployeeName,
  employeeIsAdmin,
  handleError,
  downloadReceipt,
  mergeData,
  publicSettings,
  pushPublicKey,
  pushSubscriptionActive,
  sendInvoiceNotificationEmail,
  readAppData,
  readJson,
  sanitizeSchedules,
  sendJson,
  sendPushToEmployees,
  signToken,
  syncReportTipsToTimesheets,
  sameEmployeeName,
  upsertPushSubscription,
  uploadReceiptDataUrl,
  verifyAdmin,
  verifyToken,
  weekdays,
  writeAppData
};
