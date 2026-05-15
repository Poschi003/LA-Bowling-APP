const { handleError, readAppData, readJson, sendJson, verifyToken, writeAppData } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    if (!verifyToken(req.headers["x-admin-token"], "admin")) {
      return sendJson(res, 401, { error: "Bitte Admin erneut entsperren." });
    }
    const appData = await readAppData();
    cleanupOldSchedules(appData);
    if (body.action === "delete-month") {
      delete appData.schedules[body.month];
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true });
    }
    if (body.action === "delete-week" || body.action === "unpublish-week") {
      const schedule = ensureSchedule(appData, body.month);
      deleteWeek(schedule, body.weekKey);
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, schedule });
    }

    if (body.action === "save-week" || body.action === "publish-week" || body.weekKey) {
      const schedule = ensureSchedule(appData, body.month);
      mergeWeekDays(schedule, body.days || {});
      if (body.action === "publish-week" || body.published === true) {
        schedule.publishedWeeks[body.weekKey] = true;
      }
      schedule.published = hasPublishedWeeks(schedule);
      schedule.updatedAt = new Date().toISOString();
      await writeAppData(appData);
      return sendJson(res, 200, { ok: true, schedule });
    }

    const existing = ensureSchedule(appData, body.month);
    const days = body.days || {};
    appData.schedules[body.month] = {
      month: body.month,
      published: Boolean(body.published),
      publishedWeeks: body.published ? allWeekKeysForScheduleDays(days) : (existing.publishedWeeks || {}),
      updatedAt: new Date().toISOString(),
      days
    };
    await writeAppData(appData);
    sendJson(res, 200, { ok: true, schedule: appData.schedules[body.month] });
  } catch (error) {
    handleError(res, error);
  }
};

function ensureSchedule(appData, month) {
  appData.schedules ||= {};
  appData.schedules[month] ||= {
    month,
    published: false,
    updatedAt: "",
    days: {},
    publishedWeeks: {}
  };
  appData.schedules[month].days ||= {};
  appData.schedules[month].publishedWeeks ||= {};
  return appData.schedules[month];
}

function mergeWeekDays(schedule, days) {
  schedule.days ||= {};
  for (const [dateKey, day] of Object.entries(days || {})) {
    schedule.days[dateKey] = day || {};
  }
}

function allWeekKeysForScheduleDays(days = {}) {
  const weekKeys = {};
  for (const dateKey of Object.keys(days || {})) {
    weekKeys[weekStartKey(dateKey)] = true;
  }
  return weekKeys;
}

function deleteWeek(schedule, weekKey) {
  if (!schedule || !weekKey) return;
  schedule.days ||= {};
  for (const dateKey of Object.keys(schedule.days)) {
    if (weekStartKey(dateKey) === weekKey) delete schedule.days[dateKey];
  }
  schedule.publishedWeeks ||= {};
  delete schedule.publishedWeeks[weekKey];
  schedule.published = hasPublishedWeeks(schedule);
  schedule.updatedAt = new Date().toISOString();
}

function cleanupOldSchedules(appData) {
  const retentionDays = scheduleRetentionDays(appData.settings);
  if (retentionDays <= 0) return;
  const today = localDate(new Date());
  for (const [month, schedule] of Object.entries(appData.schedules || {})) {
    const lastPublished = latestPublishedDate(schedule);
    if (lastPublished && daysBetween(lastPublished, today) > retentionDays) {
      delete appData.schedules[month];
    }
  }
}

function latestPublishedDate(schedule) {
  let latest = "";
  for (const dateKey of Object.keys(schedule?.days || {})) {
    const weekKey = weekStartKey(dateKey);
    if ((schedule.publishedWeeks?.[weekKey] || schedule.published) && dateKey > latest) latest = dateKey;
  }
  return latest;
}

function hasPublishedWeeks(schedule) {
  return Object.values(schedule?.publishedWeeks || {}).some(Boolean);
}

function weekStartKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return localDate(date);
}

function localDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(start, end) {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  return Math.floor((endDate - startDate) / 86400000);
}

function scheduleRetentionDays(settings = {}) {
  const parsed = Number(settings.scheduleAutoDeleteDays);
  if (!Number.isFinite(parsed)) return 14;
  return Math.max(0, Math.min(365, Math.floor(parsed)));
}

