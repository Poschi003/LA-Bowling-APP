const {
  handleError,
  publicSettings,
  readAppData,
  sanitizeSchedules,
  sendJson,
  verifyToken
} = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const month = req.query.month;
    const adminSession = verifyToken(req.query.adminToken, "admin");
    const employeeSession = verifyToken(req.query.employeeToken, "employee");
    const appData = await readAppData();
    const schedule = appData.schedules[month] || { month, published: false, days: {} };
    const nextMonth = req.query.nextMonth;
    const missingAvailability = availabilityMissing(appData, nextMonth);
    const availabilityChangeRequests = (appData.availabilityChangeRequests || []).filter((request) => !month || request.month === month);

    if (adminSession) {
      return sendJson(res, 200, {
        settings: publicSettings(appData.settings),
        availability: appData.availability[month] || {},
        schedule,
        schedules: appData.schedules || {},
        timesheets: appData.timesheets?.[month] || {},
        dayReports: appData.dayReports || {},
        missingAvailability,
        availabilityChangeRequests: availabilityChangeRequests.filter((request) => request.status === "open")
      });
    }

    if (employeeSession?.employee) {
      const publicSchedule = publicScheduleFor(schedule);
      const isChef = employeeIsChef(appData.settings, employeeSession.employee);
      return sendJson(res, 200, {
        settings: publicSettings(appData.settings),
        availability: {
          [employeeSession.employee]: appData.availability[month]?.[employeeSession.employee] || {}
        },
        schedule: publicSchedule,
        schedules: sanitizeSchedules(appData.schedules),
        timesheets: isChef
          ? (appData.timesheets?.[month] || {})
          : { [employeeSession.employee]: appData.timesheets?.[month]?.[employeeSession.employee] || {} },
        dayReports: isChef ? (appData.dayReports || {}) : {},
        isChef,
        missingAvailability,
        availabilityChangeRequests: availabilityChangeRequests.filter((request) => request.employee === employeeSession.employee)
      });
    }

    const publicSchedule = publicScheduleFor(schedule);
    sendJson(res, 200, {
      settings: publicSettings(appData.settings),
      availability: {},
      schedule: publicSchedule,
      schedules: sanitizeSchedules(appData.schedules),
      missingAvailability,
      availabilityChangeRequests: []
    });
  } catch (error) {
    handleError(res, error);
  }
};

function availabilityMissing(appData, month) {
  if (!month) return [];
  const monthAvailability = appData.availability?.[month] || {};
  const exempt = new Set((appData.settings.availabilityExemptEmployees || []).map((name) => String(name).trim().toLowerCase()));
  return (appData.settings.employees || []).filter((employee) => {
    if (exempt.has(String(employee).trim().toLowerCase())) return false;
    const days = monthAvailability[employee] || {};
    return Object.keys(days).length === 0;
  });
}

function employeeIsChef(settings, employee) {
  const name = String(employee || "").trim().toLowerCase();
  const role = String(settings.employeeRoles?.[employee] || "").trim().toLowerCase();
  return name === "peter" || role.includes("chef") || role.includes("betriebsleitung");
}

function publicScheduleFor(schedule) {
  if (!schedule?.published && !hasPublishedWeeks(schedule)) {
    return { month: schedule.month, published: false, days: {} };
  }
  if (schedule.published && !schedule.publishedWeeks) {
    return schedule;
  }
  const days = {};
  for (const [dateKey, assignments] of Object.entries(schedule.days || {})) {
    if (schedule.publishedWeeks?.[weekStartKey(dateKey)]) {
      days[dateKey] = assignments;
    }
  }
  return {
    ...schedule,
    published: Object.keys(days).length > 0,
    days
  };
}

function hasPublishedWeeks(schedule) {
  return Object.values(schedule?.publishedWeeks || {}).some(Boolean);
}

function weekStartKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}
