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

const defaultData = {
  settings: {
    adminPin: process.env.DEFAULT_ADMIN_PIN || "1234",
    businessName: "Dienstplan",
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
    positions: ["Counter", "Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Kueche 1", "Reinigung"]
  },
  availability: {},
  schedules: {}
};

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeData(value) {
  const base = cloneData(defaultData);
  return {
    ...base,
    ...(value || {}),
    settings: {
      ...base.settings,
      ...(value?.settings || {}),
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
      }
    },
    availability: value?.availability || base.availability,
    schedules: value?.schedules || base.schedules
  };
}

function publicSettings(settings) {
  return {
    businessName: settings.businessName,
    employees: settings.employees,
    employeeDepartments: settings.employeeDepartments || {},
    positions: settings.positions || []
  };
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
  if (supabaseKey.startsWith("eyJ")) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }
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

function employeeByPin(settings, pin) {
  for (const employee of settings.employees || []) {
    const stored = settings.employeePinHashes?.[employee] || settings.employeePins?.[employee];
    if (verifyPin(pin, stored)) return employee;
  }
  return "";
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

module.exports = {
  createPinHash,
  defaultData,
  employeeByPin,
  handleError,
  mergeData,
  publicSettings,
  readAppData,
  readJson,
  sanitizeSchedules,
  sendJson,
  signToken,
  verifyAdmin,
  verifyToken,
  weekdays,
  writeAppData
};
