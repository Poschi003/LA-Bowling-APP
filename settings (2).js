const { handleError, readAppData, readJson, sendJson, verifyToken, writeAppData } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    if (!verifyToken(req.headers["x-admin-token"], "admin")) {
      return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
    }
    const appData = await readAppData();
    if (body.action === "delete-month") {
      delete appData.schedules[body.month];
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true });
    }
    if (body.action === "unpublish-week") {
      const schedule = appData.schedules[body.month];
      if (schedule?.publishedWeeks) {
        schedule.publishedWeeks[body.weekKey] = false;
        schedule.published = Object.values(schedule.publishedWeeks).some(Boolean);
        schedule.updatedAt = new Date().toISOString();
      }
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, schedule });
    }
    const existing = appData.schedules[body.month] || {
      month: body.month,
      published: false,
      updatedAt: "",
      days: {},
      publishedWeeks: {}
    };
    const days = {
      ...(existing.days || {}),
      ...(body.days || {})
    };
    const publishedWeeks = {
      ...(existing.publishedWeeks || {})
    };
    if (body.weekKey) {
      publishedWeeks[body.weekKey] = Boolean(body.published);
    }
    appData.schedules[body.month] = {
      month: body.month,
      published: body.weekKey ? Object.values(publishedWeeks).some(Boolean) : Boolean(body.published),
      publishedWeeks,
      updatedAt: new Date().toISOString(),
      days
    };
    await writeAppData(appData);
    sendJson(res, 200, { ok: true, schedule: appData.schedules[body.month] });
  } catch (error) {
    handleError(res, error);
  }
};
