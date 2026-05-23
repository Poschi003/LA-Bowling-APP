const { handleError, readAppData, readJson, sendJson, verifyToken, writeAppData } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    if (String(body.action || "").trim() === "admin-save-time") return adminSaveTime(body, req, res);
    const session = verifyToken(body.employeeToken, "employee");
    if (!session?.employee) return sendJson(res, 401, { error: "Bitte erneut anmelden." });

    const month = String(body.month || "").trim();
    const date = String(body.date || "").trim();
    if (!/^\d{4}-\d{2}$/.test(month) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(month)) {
      return sendJson(res, 400, { error: "Ungueltiger Tag." });
    }

    const appData = await readAppData();
    appData.timesheets ||= {};
    appData.timesheets[month] ||= {};
    appData.timesheets[month][session.employee] ||= {};

    const existing = appData.timesheets[month][session.employee][date] || {};
    const from = cleanTime(existing.from);
    const to = cleanTime(existing.to);
    if (!to) return sendJson(res, 400, { error: "Trinkgeld kann erst nach Dienstende eingetragen werden." });
    if (existing.tipSource === "terminal-distribution") {
      return sendJson(res, 409, { error: "Trinkgeld wurde bereits automatisch aus dem Tagesabschluss uebernommen." });
    }
    const tip = Math.max(0, Number(String(body.tip || "0").replace(",", ".")) || 0);

    appData.timesheets[month][session.employee][date] = { ...existing, from, to, tip, updatedAt: new Date().toISOString() };

    await writeAppData(appData);
    sendJson(res, 200, { ok: true, entries: appData.timesheets[month][session.employee] });
  } catch (error) {
    handleError(res, error);
  }
};

async function adminSaveTime(body, req, res) {
  const adminToken = body.adminToken || req.headers["x-admin-token"] || "";
  if (!verifyToken(adminToken, "admin")) return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });

  const employee = String(body.employee || "").trim();
  const month = String(body.month || "").trim();
  const date = String(body.date || "").trim();
  const from = cleanTime(body.from);
  const to = cleanTime(body.to);
  if (!/^\d{4}-\d{2}$/.test(month) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(month)) {
    return sendJson(res, 400, { error: "Ungueltiger Tag." });
  }
  if (!from || !to) return sendJson(res, 400, { error: "Bitte Beginn und Ende eintragen." });

  const appData = await readAppData();
  if (!(appData.settings.employees || []).includes(employee)) {
    return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  }

  appData.timesheets ||= {};
  appData.timesheets[month] ||= {};
  appData.timesheets[month][employee] ||= {};
  const existing = appData.timesheets[month][employee][date] || {};
  appData.timesheets[month][employee][date] = {
    ...existing,
    from,
    to,
    adminNote: String(body.note || "").trim().slice(0, 600),
    adminOnly: true,
    source: "admin-manual",
    updatedAt: new Date().toISOString()
  };

  await writeAppData(appData);
  sendJson(res, 200, {
    ok: true,
    employee,
    entries: appData.timesheets[month][employee],
    timesheets: appData.timesheets[month]
  });
}

function cleanTime(value) {
  const text = String(value || "").trim();
  return /^\d{2}:\d{2}$/.test(text) ? text : "";
}

