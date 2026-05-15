const { handleError, readAppData, readJson, sendJson, verifyToken, writeAppData } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") return handleGet(req, res);
    if (req.method === "POST") return handlePost(req, res);
    return sendJson(res, 405, { error: "Methode nicht erlaubt." });
  } catch (error) {
    handleError(res, error);
  }
};

async function handleGet(req, res) {
  const month = req.query.month;
  const employeeSession = verifyToken(req.query.employeeToken, "employee");
  const adminSession = verifyToken(req.query.adminToken, "admin");
  const appData = await readAppData();
  const swaps = (appData.swaps || []).filter((swap) => !month || swap.month === month);
  const open = swaps.filter((swap) => swap.status === "open").map(publicSwap);
  const mine = employeeSession?.employee
    ? swaps.filter((swap) => swap.employee === employeeSession.employee || swap.responses?.some((item) => item.employee === employeeSession.employee)).map(publicSwap)
    : [];
  const myShifts = employeeSession?.employee ? shiftsForEmployee(appData, month, employeeSession.employee) : [];
  sendJson(res, 200, {
    open,
    mine,
    myShifts,
    admin: adminSession ? swaps.filter((swap) => swap.status === "open").map(publicSwap) : []
  });
}

async function handlePost(req, res) {
  const body = await readJson(req);
  const appData = await readAppData();
  appData.swaps ||= [];

  if (body.action === "offer") return offerSwap(req, res, appData, body);
  if (body.action === "claim") return claimSwap(req, res, appData, body);
  if (body.action === "approve") return approveSwap(req, res, appData, body);
  if (body.action === "cancel") return cancelSwap(req, res, appData, body);

  return sendJson(res, 400, { error: "Unbekannte Ersatz-Aktion." });
}

async function offerSwap(req, res, appData, body) {
  const session = verifyToken(body.employeeToken, "employee");
  if (!session?.employee) return sendJson(res, 401, { error: "Bitte mit Mitarbeiter-PIN anmelden." });
  const month = String(body.month || "");
  const date = String(body.date || "");
  const position = String(body.position || "");
  const schedule = appData.schedules?.[month];
  if (!schedule?.days?.[date] || schedule.days[date][position] !== session.employee) {
    return sendJson(res, 400, { error: "Dieser Dienst gehoert nicht zu deinem Dienstplan." });
  }
  const existing = appData.swaps.find((swap) => (
    swap.status === "open" && swap.date === date && swap.position === position && swap.employee === session.employee
  ));
  if (existing) return sendJson(res, 200, { ok: true, swap: publicSwap(existing) });
  const swap = {
    id: `swap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    month,
    date,
    position,
    employee: session.employee,
    note: String(body.note || "").trim(),
    status: "open",
    responses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  appData.swaps.push(swap);
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, swap: publicSwap(swap) });
}

async function claimSwap(req, res, appData, body) {
  const session = verifyToken(body.employeeToken, "employee");
  if (!session?.employee) return sendJson(res, 401, { error: "Bitte mit Mitarbeiter-PIN anmelden." });
  const swap = appData.swaps.find((item) => item.id === body.id && item.status === "open");
  if (!swap) return sendJson(res, 404, { error: "Ersatzanfrage nicht gefunden." });
  if (swap.employee === session.employee) return sendJson(res, 400, { error: "Du bist bereits fÃ¼r diesen Dienst eingeteilt." });
  swap.responses ||= [];
  const response = {
    employee: session.employee,
    note: String(body.note || "").trim(),
    createdAt: new Date().toISOString()
  };
  const existingIndex = swap.responses.findIndex((item) => item.employee === session.employee);
  if (existingIndex >= 0) swap.responses[existingIndex] = response;
  else swap.responses.push(response);
  swap.updatedAt = new Date().toISOString();
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, swap: publicSwap(swap) });
}

async function approveSwap(req, res, appData, body) {
  if (!verifyToken(req.headers["x-admin-token"], "admin")) {
    return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  }
  const swap = appData.swaps.find((item) => item.id === body.id && item.status === "open");
  if (!swap) return sendJson(res, 404, { error: "Ersatzanfrage nicht gefunden." });
  const replacement = String(body.replacement || "").trim();
  if (!swap.responses?.some((item) => item.employee === replacement)) {
    return sendJson(res, 400, { error: "Bitte einen gemeldeten Ersatz auswaehlen." });
  }
  const schedule = appData.schedules?.[swap.month];
  if (!schedule?.days?.[swap.date]) return sendJson(res, 400, { error: "Dienstplan-Tag nicht gefunden." });
  schedule.days[swap.date][swap.position] = replacement;
  schedule.updatedAt = new Date().toISOString();
  swap.status = "approved";
  swap.replacement = replacement;
  swap.approvedAt = new Date().toISOString();
  swap.updatedAt = new Date().toISOString();
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, swap: publicSwap(swap), schedule });
}

async function cancelSwap(req, res, appData, body) {
  const employeeSession = verifyToken(body.employeeToken, "employee");
  const adminSession = verifyToken(req.headers["x-admin-token"], "admin");
  const swap = appData.swaps.find((item) => item.id === body.id && item.status === "open");
  if (!swap) return sendJson(res, 404, { error: "Ersatzanfrage nicht gefunden." });
  if (!adminSession && swap.employee !== employeeSession?.employee) {
    return sendJson(res, 401, { error: "Du kannst nur eigene Ersatzanfragen zurueckziehen." });
  }
  swap.status = "cancelled";
  swap.updatedAt = new Date().toISOString();
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, swap: publicSwap(swap) });
}

function shiftsForEmployee(appData, month, employee) {
  const schedule = appData.schedules?.[month];
  if (!schedule?.published) return [];
  const shifts = [];
  for (const [date, assignments] of Object.entries(schedule.days || {})) {
    for (const [position, assigned] of Object.entries(assignments || {})) {
      if (position.startsWith("__") || position.endsWith("__note")) continue;
      if (assigned === employee) shifts.push({ date, position });
    }
  }
  return shifts.sort((a, b) => `${a.date}${a.position}`.localeCompare(`${b.date}${b.position}`));
}

function publicSwap(swap) {
  return {
    id: swap.id,
    month: swap.month,
    date: swap.date,
    position: swap.position,
    employee: swap.employee,
    note: swap.note || "",
    status: swap.status,
    replacement: swap.replacement || "",
    responses: (swap.responses || []).map((item) => ({
      employee: item.employee,
      note: item.note || "",
      createdAt: item.createdAt || ""
    })),
    createdAt: swap.createdAt || "",
    updatedAt: swap.updatedAt || ""
  };
}

