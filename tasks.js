const {
  handleError,
  readAppData,
  readJson,
  sendJson,
  verifyToken,
  writeAppData
} = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    if (!verifyToken(req.headers["x-admin-token"], "admin")) {
      return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
    }
    const body = await readJson(req);
    const appData = await readAppData();

    if (body.action === "add-task-template") {
      const task = cleanTaskTemplate(body.task || {});
      if (!task.title) return sendJson(res, 400, { error: "Aufgabe fehlt." });
      appData.taskTemplates ||= [];
      appData.taskTemplates.unshift(task);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
    }

    if (body.action === "delete-task-template") {
      const id = String(body.id || "");
      appData.taskTemplates = (appData.taskTemplates || []).filter((task) => task.id !== id);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, taskTemplates: appData.taskTemplates });
    }

    return sendJson(res, 400, { error: "Unbekannte Aktion." });
  } catch (error) {
    handleError(res, error);
  }
};

function cleanTaskTemplate(task) {
  const frequency = ["daily", "weekly", "monthly", "interval", "once", "next-day"].includes(task.frequency) ? task.frequency : "daily";
  const category = ["preparation", "running", "closing"].includes(task.category) ? task.category : "running";
  return {
    id: String(task.id || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: String(task.title || "").trim().slice(0, 180),
    note: String(task.note || "").trim().slice(0, 600),
    frequency,
    category,
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(task.date || "")) ? String(task.date) : "",
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.startDate || "")) ? String(task.startDate) : "",
    endDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.endDate || "")) ? String(task.endDate) : "",
    intervalDays: Math.max(1, Math.min(365, Number(task.intervalDays || 1))),
    weekdays: Array.isArray(task.weekdays) ? task.weekdays.map(Number).filter((day) => day >= 0 && day <= 6) : [],
    dayOfMonth: Math.min(31, Math.max(1, Number(task.dayOfMonth || 1))),
    createdAt: new Date().toISOString()
  };
}
