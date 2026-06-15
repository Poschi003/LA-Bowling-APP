const { handleError, readAppData, readJson, sendJson, verifyToken, writeAppData } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    const appData = await readAppData();
    appData.availabilityChangeRequests ||= [];

    if (body.action === "request") return requestChange(res, appData, body);
    if (body.action === "approve") return approveChange(req, res, appData, body);

    return sendJson(res, 400, { error: "Unbekannte Aktion." });
  } catch (error) {
    handleError(res, error);
  }
};

async function requestChange(res, appData, body) {
  const session = verifyToken(body.employeeToken, "employee");
  if (!session?.employee) return sendJson(res, 401, { error: "Bitte erneut mit Mitarbeiter-PIN anmelden." });
  const month = cleanMonth(body.month);
  const targetMonth = cleanMonth(appData.settings.availabilityTargetMonth);
  if (!month) return sendJson(res, 400, { error: "Ungueltiger Monat." });
  if (appData.settings.availabilitySubmissionOpen === false) {
    return sendJson(res, 403, { error: "Die Verfuegbarkeits-Abgabe ist aktuell geschlossen." });
  }
  if (targetMonth && month !== targetMonth) {
    return sendJson(res, 400, { error: `Verfuegbarkeit ist aktuell nur fuer ${targetMonth} freigegeben.` });
  }
  const existingOpen = appData.availabilityChangeRequests.find((request) => (
    request.status === "open" && request.month === month && request.employee === session.employee
  ));
  if (existingOpen) return sendJson(res, 200, { ok: true, request: publicRequest(existingOpen) });
  const request = {
    id: `availability_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    month,
    employee: session.employee,
    note: String(body.note || "").trim(),
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  appData.availabilityChangeRequests.push(request);
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, request: publicRequest(request) });
}

async function approveChange(req, res, appData, body) {
  if (!verifyToken(req.headers["x-admin-token"], "admin")) {
    return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
  }
  const request = appData.availabilityChangeRequests.find((item) => item.id === body.id && item.status === "open");
  if (!request) return sendJson(res, 404, { error: "Anfrage nicht gefunden." });
  if (appData.availability?.[request.month]) {
    delete appData.availability[request.month][request.employee];
  }
  request.status = "approved";
  request.approvedAt = new Date().toISOString();
  request.updatedAt = new Date().toISOString();
  await writeAppData(appData);
  sendJson(res, 200, { ok: true, request: publicRequest(request) });
}

function publicRequest(request) {
  return {
    id: request.id,
    month: request.month,
    employee: request.employee,
    note: request.note || "",
    status: request.status,
    createdAt: request.createdAt || "",
    updatedAt: request.updatedAt || ""
  };
}

function cleanMonth(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(text) ? text : "";
}
