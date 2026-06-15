const { handleError, readAppData, readJson, sendJson, verifyToken, writeAppData } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    const session = verifyToken(body.employeeToken, "employee");
    if (!session?.employee) return sendJson(res, 401, { error: "Bitte erneut mit Mitarbeiter-PIN anmelden." });
    const appData = await readAppData();
    appData.availability[body.month] ||= {};
    const existing = appData.availability[body.month][session.employee] || {};
    if (Object.keys(existing).length > 0) {
      return sendJson(res, 409, { error: "Verfuegbarkeit wurde bereits abgegeben. Bitte zuerst eine Aenderung anfragen." });
    }
    appData.availability[body.month][session.employee] = body.days || {};
    await writeAppData(appData);
    sendJson(res, 200, { ok: true, employee: session.employee });
  } catch (error) {
    handleError(res, error);
  }
};
