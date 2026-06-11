const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const cookieName = "we2_session";
const roles = ["one", "two", "control"];
const defaultDevCodes = {
  one: "1111",
  two: "2222",
  control: "9999"
};
const pointsJennyResetVersion = "2026-06-03-points-jenny-first-login-v2";
const testingZeroVersion = "2026-06-11-reset-points-v5";

function isProduction() {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}

function sessionSecret() {
  return process.env.WE2_SESSION_SECRET || process.env.SESSION_SECRET || "";
}

function effectiveSecret() {
  const secret = sessionSecret();
  if (secret) return secret;
  if (isProduction()) return "";
  return "we2-local-dev-secret-change-before-production";
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function hmac(value) {
  const secret = effectiveSecret();
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function safeEqual(a = "", b = "") {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function signSession(role) {
  const payload = {
    role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14
  };
  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${hmac(encoded)}`;
}

function parseCookies(header = "") {
  return Object.fromEntries(
    String(header || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index === -1) return [part, ""];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function verifySession(req) {
  const secret = effectiveSecret();
  if (!secret) return null;
  const token = parseCookies(req.headers.cookie || "")[cookieName];
  if (!token || !token.includes(".")) return null;
  const [encoded, signature] = token.split(".");
  if (!safeEqual(signature, hmac(encoded))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!roles.includes(payload.role)) return null;
    if (Number(payload.exp) < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge) {
  const secure = isProduction() ? "; Secure" : "";
  return `HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}

function setSessionCookie(res, role) {
  res.setHeader("Set-Cookie", `${cookieName}=${encodeURIComponent(signSession(role))}; ${cookieOptions(60 * 60 * 24 * 14)}`);
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${cookieName}=; ${cookieOptions(0)}`);
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function storageKey() {
  return process.env.WE2_STORAGE_KEY || "we2:state";
}

function localDataFile() {
  return process.env.WE2_DATA_FILE || path.join(process.cwd(), "private", "we2-backend.json");
}

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
  return { url, token };
}

function hasKvStorage() {
  const { url, token } = kvConfig();
  return Boolean(url && token && typeof fetch === "function");
}

function kvDiagnostics() {
  return {
    hasKvRestApiUrl: Boolean(process.env.KV_REST_API_URL),
    hasKvRestApiToken: Boolean(process.env.KV_REST_API_TOKEN),
    hasUpstashRedisRestUrl: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    hasUpstashRedisRestToken: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
    hasFetch: typeof fetch === "function"
  };
}

async function kvCommand(command) {
  const { url, token } = kvConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    throw new Error(payload.error || `KV request failed with ${response.status}`);
  }
  return payload.result;
}

async function readLocalData() {
  try {
    return JSON.parse(await fs.readFile(localDataFile(), "utf8"));
  } catch {
    return {};
  }
}

function parseStoredData(value) {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? value : {};
}

async function writeLocalData(data) {
  const file = localDataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function readData() {
  if (hasKvStorage()) {
    const result = await kvCommand(["GET", storageKey()]);
    return parseStoredData(result);
  }
  return readLocalData();
}

async function writeData(data) {
  const next = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  if (hasKvStorage()) {
    await kvCommand(["SET", storageKey(), JSON.stringify(next)]);
  } else {
    await writeLocalData(next);
  }
  return next;
}

function hasPointsJennyReset(state) {
  return state?.serverMigrations?.pointsJennyFirstLogin === pointsJennyResetVersion;
}

function applyPointsJennyReset(state) {
  if (!state || typeof state !== "object") return false;
  if (hasPointsJennyReset(state)) return false;

  state.round = 1;
  state.score = 0;
  state.xp = 0;
  state.sharedPoints = 0;
  state.playerScores = [0, 0];
  state.dailyLog = {};
  state.weeklyLog = {};
  state.weeklyRewards = {};
  state.streak = 0;
  state.lastDailyCompleted = "";
  state.rewardsClaimed = 0;
  state.activeTask = null;
  state.pendingWish = null;
  state.pendingThought = null;
  state.pendingMedia = null;
  state.pendingMediaRequest = null;
  state.pendingPornClip = null;
  state.pendingTruthDareDuty = null;

  if (!state.records || typeof state.records !== "object") state.records = {};
  state.records.lifeBest = 0;
  state.records.monthBest = 0;
  state.records.monthKey = new Date().toISOString().slice(0, 7);
  if (!Array.isArray(state.records.sexLog)) state.records.sexLog = [];

  if (!Array.isArray(state.welcomeSeen)) state.welcomeSeen = [false, false];
  if (!Array.isArray(state.welcomeSeenVersion)) state.welcomeSeenVersion = [0, 0];
  state.welcomeSeen[1] = false;
  state.welcomeSeenVersion[1] = 0;

  if (Array.isArray(state.profiles) && state.profiles[1] && typeof state.profiles[1] === "object") {
    state.profiles[1].setupComplete = false;
  }

  if (!Array.isArray(state.loginNewsSeen)) state.loginNewsSeen = [[], []];
  state.loginNewsSeen[1] = [];
  if (!Array.isArray(state.profileChangeMessages)) state.profileChangeMessages = [[], []];
  state.profileChangeMessages[1] = [];

  state.serverMigrations = {
    ...(state.serverMigrations || {}),
    pointsJennyFirstLogin: pointsJennyResetVersion
  };
  return true;
}

function hasTestingZeroReset(state) {
  return state?.serverMigrations?.testingZero === testingZeroVersion;
}

function applyTestingZeroReset(state) {
  if (!state || typeof state !== "object") return false;
  if (hasTestingZeroReset(state)) return false;

  state.round = 1;
  state.score = 0;
  state.sharedPoints = 0;
  state.playerScores = [0, 0];
  state.weeklyScores = {};
  state.xp = 0;
  state.streak = 0;
  state.lastDailyCompleted = "";
  state.currentDaily = null;

  state.serverMigrations = {
    ...(state.serverMigrations || {}),
    testingZero: testingZeroVersion
  };
  return true;
}

async function readDataWithMigrations() {
  const data = parseStoredData(await readData());
  const next = JSON.parse(JSON.stringify(data));
  applyPointsJennyReset(next.state);
  applyTestingZeroReset(next.state);
  return next;
}

function envCode(role) {
  const names = {
    one: "WE2_CODE_CHRISTIAN",
    two: "WE2_CODE_JENNY",
    control: "WE2_CODE_CONTROL"
  };
  return process.env[names[role]] || "";
}

function hashCode(role, code) {
  return hmac(`we2-code:${role}:${String(code || "")}`);
}

function codeHashesFromEnvironment() {
  const hashes = {};
  roles.forEach((role) => {
    const code = envCode(role);
    if (code) hashes[role] = hashCode(role, code);
  });
  if (!Object.keys(hashes).length && !isProduction()) {
    roles.forEach((role) => {
      hashes[role] = hashCode(role, defaultDevCodes[role]);
    });
  }
  return hashes;
}

function effectiveCodeHashes(data = {}) {
  return {
    ...codeHashesFromEnvironment(),
    ...(data.codeHashes || {})
  };
}

function authenticateCode(code, data) {
  const hashes = effectiveCodeHashes(data);
  return roles.find((role) => hashes[role] && safeEqual(hashes[role], hashCode(role, code))) || "";
}

function activeIndexForRole(role) {
  if (role === "one") return 0;
  if (role === "two") return 1;
  return null;
}

function sanitizeStateForStorage(input) {
  const state = input && typeof input === "object" ? JSON.parse(JSON.stringify(input)) : null;
  if (!state) return null;
  state.access = { backendManaged: true };
  return state;
}

function sanitizeStateForClient(input) {
  const state = sanitizeStateForStorage(input);
  return state;
}

function storageMode() {
  return hasKvStorage() ? "kv" : "local";
}

function roleFromPlayerId(playerId) {
  if (Number(playerId) === 0) return "one";
  if (Number(playerId) === 1) return "two";
  return "";
}

function requireSession(req, res) {
  const session = verifySession(req);
  if (!session) {
    sendJson(res, 401, { error: "Nicht angemeldet." });
    return null;
  }
  return session;
}

async function routeHealth(req, res) {
  sendJson(res, 200, {
    ok: true,
    storage: storageMode(),
    production: isProduction(),
    configured: Boolean(effectiveSecret()),
    kv: kvDiagnostics()
  });
}

async function routeLogin(req, res) {
  if (isProduction() && !sessionSecret()) {
    sendJson(res, 500, { error: "WE2_SESSION_SECRET fehlt auf dem Server." });
    return;
  }

  const body = await readJsonBody(req);
  const data = await readDataWithMigrations();
  const role = authenticateCode(body.code, data);
  if (!role) {
    sendJson(res, 401, { error: "Code passt nicht." });
    return;
  }

  setSessionCookie(res, role);
  sendJson(res, 200, {
    authenticated: true,
    role,
    activeIndex: activeIndexForRole(role),
    storage: storageMode(),
    state: sanitizeStateForClient(data.state || null)
  });
}

async function routeLogout(req, res) {
  clearSessionCookie(res);
  sendJson(res, 200, { ok: true });
}

async function routeSession(req, res) {
  const session = verifySession(req);
  sendJson(res, 200, {
    authenticated: Boolean(session),
    role: session?.role || "",
    activeIndex: session ? activeIndexForRole(session.role) : null,
    storage: storageMode()
  });
}

async function routeGetState(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  const data = await readDataWithMigrations();
  sendJson(res, 200, {
    state: sanitizeStateForClient(data.state || null),
    updatedAt: data.updatedAt || "",
    role: session.role,
    storage: storageMode()
  });
}

async function routeSaveState(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  const body = await readJsonBody(req);
  const incomingState = sanitizeStateForStorage(body.state);
  if (!incomingState) {
    sendJson(res, 400, { error: "Kein gueltiger State." });
    return;
  }

  const current = await readData();
  const nextState = JSON.parse(JSON.stringify(incomingState));
  applyPointsJennyReset(nextState);
  applyTestingZeroReset(nextState);
  const saved = await writeData({
    ...current,
    state: nextState,
    savedBy: session.role
  });
  sendJson(res, 200, {
    ok: true,
    updatedAt: saved.updatedAt,
    storage: storageMode()
  });
}

async function routeCodes(req, res) {
  const session = requireSession(req, res);
  if (!session) return;
  if (session.role !== "control") {
    sendJson(res, 403, { error: "Nur Kontrolle darf Codes aendern." });
    return;
  }

  const body = await readJsonBody(req);
  const updates = body.codes && typeof body.codes === "object" ? body.codes : {};
  const current = await readData();
  const codeHashes = { ...(current.codeHashes || {}) };
  roles.forEach((role) => {
    const value = String(updates[role] || "").trim();
    if (value) codeHashes[role] = hashCode(role, value);
  });
  await writeData({ ...current, codeHashes });
  sendJson(res, 200, { ok: true });
}

const routes = {
  "health:GET": routeHealth,
  "login:POST": routeLogin,
  "logout:POST": routeLogout,
  "session:GET": routeSession,
  "state:GET": routeGetState,
  "state:PUT": routeSaveState,
  "codes:POST": routeCodes
};

async function handleApiRoute(route, req, res) {
  try {
    const method = String(req.method || "GET").toUpperCase();
    const handler = routes[`${route}:${method}`];
    if (!handler) {
      sendJson(res, 404, { error: "API-Route nicht gefunden." });
      return;
    }
    await handler(req, res);
  } catch (error) {
    sendJson(res, 500, { error: "Serverfehler.", detail: isProduction() ? "" : String(error.message || error) });
  }
}

async function handleApiRequest(req, res) {
  const url = new URL(req.url, "http://localhost");
  const route = url.pathname.replace(/^\/api\/?/, "").replace(/^\/+|\/+$/g, "") || "health";
  await handleApiRoute(route, req, res);
}

module.exports = {
  handleApiRequest,
  handleApiRoute
};
