const { handleError, readAppData, readJson, sendJson, verifyToken, writeAppData } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
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

    const from = cleanTime(body.from);
    const to = cleanTime(body.to);
    const tip = Math.max(0, Number(String(body.tip || "0").replace(",", ".")) || 0);
    const note = String(body.note || "").trim().slice(0, 200);

    if (!from && !to && !tip && !note) {
      delete appData.timesheets[month][session.employee][date];
    } else {
      appData.timesheets[month][session.employee][date] = { from, to, tip, note, updatedAt: new Date().toISOString() };
    }

    await writeAppData(appData);
    sendJson(res, 200, { ok: true, entries: appData.timesheets[month][session.employee] });
  } catch (error) {
    handleError(res, error);
  }
};

function cleanTime(value) {
  const text = String(value || "").trim();
  return /^\d{2}:\d{2}$/.test(text) ? text : "";
}
