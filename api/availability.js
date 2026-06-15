const { handleError, readAppData, readJson, sendJson, verifyToken, writeAppData } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    const session = verifyToken(body.employeeToken, "employee");
    if (!session?.employee) return sendJson(res, 401, { error: "Bitte erneut mit Mitarbeiter-PIN anmelden." });
    const appData = await readAppData();
    const month = cleanMonth(body.month);
    const targetMonth = cleanMonth(appData.settings.availabilityTargetMonth);
    if (!month) return sendJson(res, 400, { error: "Ungueltiger Monat." });
    if (appData.settings.availabilitySubmissionOpen === false) {
      return sendJson(res, 403, { error: "Die Verfuegbarkeits-Abgabe ist aktuell geschlossen." });
    }
    if (targetMonth && month !== targetMonth) {
      return sendJson(res, 400, { error: `Verfuegbarkeit ist aktuell nur fuer ${targetMonth} freigegeben.` });
    }
    appData.availability[month] ||= {};
    const existing = appData.availability[month][session.employee] || {};
    if (Object.keys(existing).length > 0) {
      return sendJson(res, 409, { error: "VerfÃ¼gbarkeit wurde bereits abgegeben. Bitte zuerst eine Ã„nderung anfragen." });
    }
    const days = body.days && typeof body.days === "object" && !Array.isArray(body.days) ? body.days : {};
    appData.availability[month][session.employee] = {
      ...days,
      __meta: {
        submitted: true,
        mode: body.mode === "fixed" ? "fixed" : "standard",
        submittedAt: new Date().toISOString()
      }
    };
    await writeAppData(appData);
    sendJson(res, 200, { ok: true, employee: session.employee });
  } catch (error) {
    handleError(res, error);
  }
};

function cleanMonth(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(text) ? text : "";
}
