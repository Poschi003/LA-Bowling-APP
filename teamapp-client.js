const state = {
  settings: null,
  availability: {},
  schedule: null,
  allSchedules: {},
  selectedMonth: currentMonthValue(),
  adminUnlocked: false,
  activeEmployee: "",
  employeeToken: "",
  adminToken: "",
  hasBackofficeAccess: false,
  pinChangeRequired: false,
  isChef: false,
  chefTab: "reports",
  timesheets: {},
  messages: [],
  terminalMessages: [],
  pushPublicKey: "",
  pushSubscriptionActive: false,
  dayReports: {},
  assignmentTimes: {},
  assignmentSchedules: {},
  missingAvailability: [],
  swaps: { open: [], mine: [], myShifts: [], admin: [] },
  availabilityChangeRequests: [],
  weather: null,
  weatherLoading: false,
  terminalToken: "",
  terminalTab: "tasks",
  terminalDate: "",
  terminalEntries: {},
  terminalReport: {},
  tipOverview: { employees: [], totalEarned: "0.00", totalPaid: "0.00", totalOpen: "0.00" },
  terminalSchedule: {},
  terminalTasks: [],
  terminalReminders: [],
  terminalCleaningTemplates: [],
  terminalWeeklyCleaningCompletions: {},
  pendingToiletCheck: "",
  pendingReminder: null,
  terminalReminderRefreshInFlight: false,
  timesheetRefreshInFlight: false,
  terminalDayMetaEditing: false,
  terminalCorrectionMode: false,
  invoiceTerminalToken: window.localStorage?.getItem("invoiceTerminalToken") || "",
  invoiceDate: todayKey(),
  invoiceReport: {},
  customerDirectory: [],
  taskTemplates: [],
  cleaningTemplates: [],
  reminderTemplates: [],
  plannerEditWeeks: []
};

const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const defaultReminderTemplates = [
  {
    id: "default-toilet-reminder",
    text: "Toiletten-Kontrolle durchführen",
    startAfterOpeningMinutes: 60,
    intervalMinutes: 60,
    active: true
  }
];
const defaultCleaningPlans = [
  {
    group: "weekly",
    label: "Wöchentlich",
    tasks: [
      { id: "weekly-fridges", title: "Kühlungen und Getränkelager reinigen/kontrollieren" },
      { id: "weekly-shoe-racks", title: "Schuhregale und Leihschuhe gründlich reinigen" },
      { id: "weekly-storage", title: "Lagerflächen ordnen und Boden reinigen" },
      { id: "weekly-glass", title: "Glasflächen, Türen und Eingangsbereich gründlich reinigen" },
      { id: "weekly-sanitary", title: "Sanitärbereich Grundkontrolle dokumentieren" }
    ]
  }
];
const defaultCleaningTemplates = defaultCleaningPlans.flatMap((group) =>
  group.tasks.map((task) => ({
    ...task,
    frequency: "weekly",
    weekdays: [],
    note: "",
    createdAt: "2026-05-20T00:00:00.000Z"
  }))
);
const motivationQuotes = [
  "Gemeinsam wird der Tag leichter.",
  "Ein gutes Team merkt man im laufenden Betrieb.",
  "Heute zählt: freundlich, wach und zusammen.",
  "Danke, dass du den Laden am Rollen hältst.",
  "Guter Service beginnt mit guter Stimmung.",
  "Zusammen bleibt auch ein voller Tag rund.",
  "Kleine Hilfe, große Wirkung."
];
const defaultData = {
  settings: {
    businessName: "Teamapp",
    employees: [
      "Kevin",
      "Daniel",
      "Anita",
      "Dennis",
      "Marc",
      "Christian Gaas",
      "Marco",
      "Ali",
      "Bianca",
      "Kevin Leicht"
    ],
    employeeDepartments: {
      "Kevin": ["Counter", "Service"],
      "Daniel": ["Service"],
      "Anita": ["Reinigung", "Service"],
      "Dennis": ["Counter", "Service"],
      "Marc": ["Service"],
      "Christian Gaas": ["Service", "Kueche"],
      "Marco": ["Service", "Kueche"],
      "Ali": ["Service", "Kueche"],
      "Bianca": ["Reinigung"],
      "Kevin Leicht": ["Counter", "Service"]
    },
    employeeRoles: {},
    employeeTipSettings: {
      "Renate Leicht": { eligible: true, factor: 0.675 }
    },
    fixedEmployees: [],
    availabilityExemptEmployees: [],
    availabilityTargetMonth: nextMonthValue(),
    availabilitySubmissionOpen: true,
    adminEmployees: [],
    positions: ["Counter 1", "Counter 2", "Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Kueche 1", "Kueche 2", "Spueler", "Reinigung", "Mechanik"],
    chefViewSections: {
      messages: true,
      today: true,
      reports: true,
      reportFolders: true,
      employees: true,
      schedule: true
    },
    dayReportFields: {
      ecTotal: true,
      barBowling: true,
      barGastro: true,
      barTotal: true,
      invoiceCustomers: true,
      expenses: true,
      documents: true,
      notes: true,
      preparation: true,
      handovers: true,
      extraEmployees: true
    },
    scheduleAutoDeleteDays: 14,
    hourlyRate: 25,
    invoiceNotificationTo: "pvo65@outlook.de",
    pushSettings: {
      schedulePublished: true,
      assignmentsTomorrow: true,
      messages: true,
      schedulePublishedTitle: "LA-Bowling - Neuer Dienstplan online",
      schedulePublishedBody: "Der neue Dienstplan ist online. Bitte in der TeamApp prüfen.",
      assignmentsTomorrowTitle: "LA-Bowling - Einteilung für morgen ist Online",
      assignmentsTomorrowBody: "Bitte prüfe deine Startzeit in der TeamApp.",
      messagesTitle: "LA-Bowling - Du hast eine neue Nachricht im Dashboard",
      messagesBody: "{{text}}"
    }
  },
  reminderTemplates: defaultReminderTemplates,
  availability: {},
  schedules: {},
  timesheets: {},
  tipOverview: { employees: [], totalEarned: "0.00", totalPaid: "0.00", totalOpen: "0.00" },
  cleaningTemplates: defaultCleaningTemplates,
  messages: [],
  terminalMessages: [],
  customerDirectory: [],
  dayReports: {},
  assignmentTimes: {},
  assignmentSchedules: {},
  availabilityChangeRequests: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const TIP_ELIGIBLE_AREAS = ["Counter", "Service", "Kueche", "Spueler"];
const GERMAN_DISPLAY_REPLACEMENTS = [
  [/Ã„/g, "Ä"], [/Ã–/g, "Ö"], [/Ãœ/g, "Ü"], [/Ã¤/g, "ä"], [/Ã¶/g, "ö"], [/Ã¼/g, "ü"], [/ÃŸ/g, "ß"],
  [/Kueche/g, "Küche"], [/kueche/g, "küche"], [/Kuechen/g, "Küchen"], [/kuechen/g, "küchen"],
  [/Spueler/g, "Spüler"], [/spueler/g, "spüler"], [/fuer/g, "für"], [/Fuer/g, "Für"],
  [/Umsaetze/g, "Umsätze"], [/umsaetze/g, "umsätze"], [/gehoeren/g, "gehören"],
  [/Verfuegbarkeit/g, "Verfügbarkeit"], [/verfuegbarkeit/g, "verfügbarkeit"],
  [/Aenderung/g, "Änderung"], [/aenderung/g, "änderung"], [/geaendert/g, "geändert"],
  [/veroeffentlicht/g, "veröffentlicht"], [/Veroeffentlicht/g, "Veröffentlicht"],
  [/geoeffnet/g, "geöffnet"], [/Geoeffnet/g, "Geöffnet"], [/oeffnen/g, "öffnen"], [/Oeffnen/g, "Öffnen"],
  [/hinzugefuegt/g, "hinzugefügt"], [/ausfuehrende/g, "ausführende"], [/auswaehlen/g, "auswählen"],
  [/pruefen/g, "prüfen"], [/loeschen/g, "löschen"], [/geloescht/g, "gelöscht"]
];

function currentMonthValue() {
  return monthValue(new Date());
}

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextMonthValue() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 1);
  return monthValue(date);
}

function monthValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function datesInMonth(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const date = new Date(year, monthIndex - 1, 1);
  const dates = [];
  while (date.getMonth() === monthIndex - 1) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
}

function isoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return `${weekdays[date.getDay()]}, ${date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
}

function formatNumericDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatLongDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function taskFrequencyLabel(task = {}) {
  const category = taskCategoryLabel(task.category);
  const popup = taskPopupLabel(task);
  if (task.frequency === "daily") return `${category} | Täglich${popup}`;
  if (task.frequency === "weekly") return `${category} | Wöchentlich ${((task.weekdays || []).map((day) => weekdays[Number(day)]).filter(Boolean).join(", ") || "")}${popup}`;
  if (task.frequency === "monthly") return `${category} | Monatlich am ${Number(task.dayOfMonth || 1)}.${popup}`;
  if (task.frequency === "interval") return `${category} | Alle ${Number(task.intervalDays || 1)} Tage ab ${task.startDate ? formatDate(task.startDate) : formatDate(task.date || todayKey())}${task.endDate ? ` bis ${formatDate(task.endDate)}` : ""}${popup}`;
  if (task.frequency === "next-day") return `${category} | Für nächsten Tag${task.date ? ` (${formatDate(task.date)})` : ""}${popup}`;
  if (task.frequency === "once") return `${category} | Einmalig${task.date ? ` (${formatDate(task.date)})` : ""}${popup}`;
  return "Aufgabe";
}

function taskPopupLabel(task = {}) {
  return task.popupEnabled && task.popupTime ? ` | Popup ${task.popupTime}` : "";
}

function taskCategoryLabel(value) {
  if (value === "preparation") return "Vorbereitung";
  if (value === "closing") return "Schlussdienst";
  return "Laufender Betrieb";
}

function emptyDay() {
  return { status: "", from: "", to: "", note: "" };
}

function todayKey() {
  return isoDate(new Date());
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return isoDate(date);
}

function dailyQuote(dateKey) {
  const number = Number(dateKey.replaceAll("-", ""));
  return motivationQuotes[number % motivationQuotes.length];
}

function weekNumber(date) {
  const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = copy.getUTCDay() || 7;
  copy.setUTCDate(copy.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
  return Math.ceil((((copy - yearStart) / 86400000) + 1) / 7);
}

function weekStart(date) {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

function weekEnd(date) {
  return addDays(weekStart(date), 6);
}

function formatShortDate(date) {
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function weekLabel(dates) {
  const first = dates[0];
  const start = weekStart(first);
  const end = weekEnd(first);
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

function availabilityDayLabel(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function groupedMonthWeeks(month) {
  const groups = [];
  for (const date of datesInMonth(month)) {
    const startKey = isoDate(weekStart(date));
    let group = groups.find((item) => item.key === startKey);
    if (!group) {
      group = { key: startKey, dates: [] };
      groups.push(group);
    }
    group.dates.push(date);
  }
  return groups;
}

function renderWeekSections(month, renderer) {
  return groupedMonthWeeks(month).map((week) => `
    <section class="week-section">
      <h3>Woche ${weekLabel(week.dates)}</h3>
      <div class="week-days">
        ${week.dates.map(renderer).join("")}
      </div>
    </section>
  `).join("");
}

function renderPublishedWeekSections(month) {
  const schedule = arguments.length > 1 ? arguments[1] : state.schedule;
  const scheduleDays = schedule?.days || {};
  const weeks = groupedMonthWeeks(month).filter((week) => (
    week.dates.some((date) => scheduleDays[isoDate(date)])
  ));
  return weeks.map((week) => `
    <details class="week-section published-week print-week">
      <summary>
        <span>${weekLabel(week.dates)}</span>
        <span class="week-state">veröffentlicht</span>
      </summary>
      <div class="week-days">
        ${week.dates.map((date) => renderScheduleDay(date, { compact: true, collapsible: true, schedule })).join("")}
      </div>
    </details>
  `).join("");
}

function publishedScheduleDays(schedule = {}) {
  const days = schedule.days || {};
  if (!schedule.publishedWeeks || !Object.keys(schedule.publishedWeeks).length) return days;
  return Object.fromEntries(Object.entries(days).filter(([dateKey]) => schedule.publishedWeeks?.[weekStartKey(dateKey)]));
}

function scheduleHasPublishedDays(schedule = {}) {
  return Object.keys(publishedScheduleDays(schedule)).length > 0;
}

function chefPublishedSchedulesHtml() {
  const schedules = Object.entries(state.allSchedules || {})
    .filter(([, schedule]) => schedule && schedule.published && scheduleHasPublishedDays(schedule))
    .sort(([a], [b]) => a.localeCompare(b));
  if (!schedules.length) {
    return `<p class="hint">Es ist noch kein Dienstplan veröffentlicht.</p>`;
  }
  return schedules.map(([month, schedule]) => {
    const publishedSchedule = { ...schedule, days: publishedScheduleDays(schedule) };
    return `
      <details class="chef-schedule-month" ${month === state.selectedMonth ? "open" : ""}>
        <summary>
          <strong>${formatMonth(month)}</strong>
          <span>${Object.keys(publishedSchedule.days || {}).length} Tage veröffentlicht</span>
        </summary>
        ${renderPublishedWeekSections(month, publishedSchedule)}
      </details>
    `;
  }).join("");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let error = {};
    try {
      error = text ? JSON.parse(text) : {};
    } catch (parseError) {
      error = {};
    }
    throw new Error(error.error || text || `Aktion fehlgeschlagen (${response.status}).`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function loadState() {
  state.settings = state.settings || cloneData(defaultData.settings);
  state.availability = state.availability || {};
  state.schedule = state.schedule || { month: state.selectedMonth, published: false, days: {} };
  state.allSchedules = state.allSchedules || {};
  renderAll();
  const params = new URLSearchParams({ month: state.selectedMonth, nextMonth: availabilityMonthValue(), availabilityMonth: availabilityMonthValue() });
  if (state.employeeToken) params.set("employeeToken", state.employeeToken);
  if (state.adminToken) params.set("adminToken", state.adminToken);
  const data = await api(`/api/state?${params.toString()}`);
  state.settings = normalizeSettings(data.settings || cloneData(defaultData.settings));
  state.availability = data.availability || {};
  state.schedule = data.schedule || { month: state.selectedMonth, published: false, days: {} };
  state.allSchedules = data.schedules || {};
  state.timesheets = data.timesheets || {};
  state.messages = data.messages || [];
  state.terminalMessages = data.terminalMessages || [];
  state.pushPublicKey = data.pushPublicKey || "";
  state.pushSubscriptionActive = Boolean(data.pushSubscriptionActive);
  state.taskTemplates = data.taskTemplates || [];
  state.cleaningTemplates = normalizeCleaningTemplates(data.cleaningTemplates);
  state.reminderTemplates = normalizeReminderTemplates(data.reminderTemplates);
  state.dayReports = data.dayReports || {};
  state.assignmentTimes = normalizeAssignmentTimes(data.assignmentTimes || {});
  state.assignmentSchedules = data.assignmentSchedules || {};
  state.weather = data.weather || state.weather;
  state.isChef = Boolean(data.isChef);
  state.missingAvailability = data.missingAvailability || [];
  state.availabilityChangeRequests = data.availabilityChangeRequests || [];
  await ensurePushSubscriptionSynced();
  renderAll();
  if (!state.weather || state.weather.error) loadWeather().catch(() => {});
  loadSwaps().catch(() => {});
}

async function loadSwaps() {
  const params = new URLSearchParams({ month: state.selectedMonth });
  if (state.employeeToken) params.set("employeeToken", state.employeeToken);
  if (state.adminToken) params.set("adminToken", state.adminToken);
  state.swaps = await api(`/api/swaps?${params.toString()}`);
  renderHome();
  ensureWeatherVisible();
  renderSwaps();
  renderAdminSwaps();
}

async function loadWeather() {
  if (state.weatherLoading) return;
  state.weatherLoading = true;
  try {
    const data = await api("/api/weather");
    state.weather = data;
  } catch (error) {
    state.weather = { error: true };
  } finally {
    state.weatherLoading = false;
  }
  renderWeather();
}

function ensureWeatherVisible() {
  if (!$$("[data-weather-widget]").length) return;
  if (state.weather && !state.weather.error) {
    renderWeather();
    return;
  }
  loadWeather().catch(() => {});
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function germanDisplayText(value) {
  return GERMAN_DISPLAY_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    String(value == null ? "" : value)
  );
}

function hasGermanDisplayReplacement(value) {
  const text = String(value || "");
  return GERMAN_DISPLAY_REPLACEMENTS.some(([pattern]) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

function normalizeGermanDisplay(root = document.body) {
  if (!root || typeof document.createTreeWalker !== "function") return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.nodeValue || parent?.matches("script, style, textarea")) return NodeFilter.FILTER_REJECT;
      return hasGermanDisplayReplacement(node.nodeValue)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    node.nodeValue = germanDisplayText(node.nodeValue);
  });
  root.querySelectorAll("input[placeholder], textarea[placeholder], [title], [aria-label]").forEach((element) => {
    ["placeholder", "title", "aria-label"].forEach((attribute) => {
      if (element.hasAttribute(attribute)) element.setAttribute(attribute, germanDisplayText(element.getAttribute(attribute)));
    });
  });
}

function mergeData(value) {
  const base = cloneData(defaultData);
  const incomingSettings = value && value.settings ? value.settings : {};
  const merged = {
    ...base,
    ...value,
    settings: {
      ...base.settings,
      ...incomingSettings,
      employeeDepartments: {
        ...base.settings.employeeDepartments,
        ...(incomingSettings.employeeDepartments || {})
      },
      employeeRoles: {
        ...(incomingSettings.employeeRoles || {})
      },
      employeeTipSettings: normalizeEmployeeTipSettings({
        ...base.settings.employeeTipSettings,
        ...(incomingSettings.employeeTipSettings || {})
      }),
      fixedEmployees: incomingSettings.fixedEmployees || base.settings.fixedEmployees || [],
      availabilityExemptEmployees: incomingSettings.availabilityExemptEmployees || base.settings.availabilityExemptEmployees || []
      ,
      availabilityTargetMonth: normalizeMonthValue(incomingSettings.availabilityTargetMonth) || base.settings.availabilityTargetMonth,
      availabilitySubmissionOpen: incomingSettings.availabilitySubmissionOpen !== false,
      adminEmployees: incomingSettings.adminEmployees || base.settings.adminEmployees || [],
      positions: ensureRequiredPositions(incomingSettings.positions || base.settings.positions || []),
      chefViewSections: {
        ...base.settings.chefViewSections,
        ...(incomingSettings.chefViewSections || {})
      },
      dayReportFields: {
        ...base.settings.dayReportFields,
        ...(incomingSettings.dayReportFields || {})
      },
      scheduleAutoDeleteDays: normalizeScheduleAutoDeleteDays(
        incomingSettings.scheduleAutoDeleteDays,
        base.settings.scheduleAutoDeleteDays
      ),
      hourlyRate: normalizeHourlyRate(
        incomingSettings.hourlyRate,
        base.settings.hourlyRate
      ),
      invoiceNotificationTo: String(incomingSettings.invoiceNotificationTo || base.settings.invoiceNotificationTo || "pvo65@outlook.de").trim().slice(0, 180),
      pushSettings: {
        ...base.settings.pushSettings,
        ...(incomingSettings.pushSettings || {})
      }
    },
    availability: value && value.availability ? value.availability : base.availability,
    schedules: value && value.schedules ? value.schedules : base.schedules,
    timesheets: value && value.timesheets ? value.timesheets : base.timesheets,
    tipOverview: value && value.tipOverview ? value.tipOverview : base.tipOverview,
    cleaningTemplates: normalizeCleaningTemplates(Array.isArray(value?.cleaningTemplates) ? value.cleaningTemplates : base.cleaningTemplates),
    messages: Array.isArray(value?.messages) ? value.messages : base.messages,
    terminalMessages: Array.isArray(value?.terminalMessages) ? value.terminalMessages : base.terminalMessages,
    customerDirectory: normalizeCustomerDirectory(value?.customerDirectory || base.customerDirectory),
    dayReports: value && value.dayReports ? value.dayReports : base.dayReports,
    assignmentTimes: normalizeAssignmentTimes(value?.assignmentTimes || base.assignmentTimes),
    assignmentSchedules: value && value.assignmentSchedules ? value.assignmentSchedules : base.assignmentSchedules,
    availabilityChangeRequests: Array.isArray(value?.availabilityChangeRequests) ? value.availabilityChangeRequests : base.availabilityChangeRequests
  };
  if (!merged.settings.businessName || merged.settings.businessName === "Dienstplan") {
    merged.settings.businessName = "Teamapp";
  }
  return merged;
}

function normalizeSettings(settings) {
  return mergeData({ settings }).settings;
}

function normalizeAssignmentTimes(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  Object.entries(value).forEach(([dateKey, employees]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || "")) || !employees || typeof employees !== "object" || Array.isArray(employees)) return;
    const day = {};
    Object.entries(employees).forEach(([employee, item]) => {
      const cleanEmployee = String(employee || "").trim();
      if (!cleanEmployee) return;
      const from = cleanTimeValue(item?.from);
      const note = String(item?.note || "").trim().slice(0, 240);
      if (from || note) day[cleanEmployee] = { from, to: "", note };
    });
    if (Object.keys(day).length) result[dateKey] = day;
  });
  return result;
}

function cleanTimeValue(value) {
  const text = String(value || "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : "";
}

function normalizeScheduleAutoDeleteDays(value, fallback = 14) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Number(fallback) || 14;
  return Math.max(0, Math.min(365, Math.floor(parsed)));
}

function normalizeHourlyRate(value, fallback = 25) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Number(fallback) || 25;
  return Math.max(0, Math.min(200, Math.round(parsed * 100) / 100));
}

function currentHourlyRate() {
  return normalizeHourlyRate(state.settings?.hourlyRate, defaultData.settings.hourlyRate);
}

function normalizeMonthValue(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}$/.test(text) ? text : "";
}

function availabilityMonthValue() {
  return normalizeMonthValue(state.settings?.availabilityTargetMonth) || nextMonthValue();
}

function normalizeReminderTemplates(reminders) {
  const list = Array.isArray(reminders) ? reminders.filter((reminder) => reminder && reminder.active !== false) : [];
  return list.length ? list : cloneData(defaultReminderTemplates);
}

function normalizeCleaningTemplates(tasks) {
  if (!Array.isArray(tasks)) return cloneData(defaultCleaningTemplates);
  return tasks.map(cleanCleaningTemplateClient).filter((task) => task.title && task.frequency === "weekly");
}

function normalizeCustomerDirectory(customers) {
  const byKey = new Map();
  (Array.isArray(customers) ? customers : []).forEach((customer) => {
    const entry = customerDirectoryEntry(customer);
    const key = customerDirectoryKey(entry);
    if (!key) return;
    byKey.set(key, { ...(byKey.get(key) || {}), ...entry });
  });
  return [...byKey.values()]
    .filter((customer) => customer.name)
    .sort((a, b) => a.name.localeCompare(b.name, "de"))
    .slice(0, 500);
}

function customerDirectoryEntry(item = {}) {
  return {
    id: String(item.id || customerDirectoryKey(item) || cryptoId()),
    name: String(item.name || "").trim().slice(0, 160),
    contact: String(item.contact || "").trim().slice(0, 160),
    phone: String(item.phone || "").trim().slice(0, 80),
    email: String(item.email || "").trim().slice(0, 180),
    address: String(item.address || "").trim().slice(0, 600),
    tip: String(item.tip || "").trim().slice(0, 160),
    note: String(item.note || "").trim().slice(0, 600),
    createdAt: String(item.createdAt || new Date().toISOString()),
    updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString())
  };
}

function customerDirectoryKey(item = {}) {
  const email = String(item.email || "").trim().toLowerCase();
  if (email) return `mail:${email}`;
  const name = String(item.name || "").trim().toLowerCase();
  const phone = String(item.phone || "").replace(/\s+/g, "");
  return name ? `name:${name}|${phone}` : "";
}

function cleanCleaningTemplateClient(task = {}) {
  return {
    id: String(task.id || `cleaning-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    title: String(task.title || "").trim().slice(0, 180),
    note: String(task.note || "").trim().slice(0, 600),
    frequency: "weekly",
    weekdays: [],
    createdAt: String(task.createdAt || new Date().toISOString())
  };
}

function renderAll() {
  $("#appTitle").textContent = isCustomerInvoiceMode() ? "Bezahlung auf Rechnung" : isTodoMode() ? "TO DO" : state.settings.businessName;
  if ($("#customerInvoiceDate")) $("#customerInvoiceDate").value = formatDate(localDateValue());
  $("#monthInput").value = availabilityMonthValue();
  $("#monthInput").disabled = true;
  renderAccess();
  renderEmployeeSelect();
  renderAvailability();
  renderHome();
  renderAssignments();
  renderPublished();
  renderSwaps();
  renderChef();
  renderTimesheet();
  renderSettings();
  renderPlanner();
  renderAdminLock();
  renderAdminEmployeeOverview();
  renderAdminPublishedList();
  renderAdminMonthlyNumbers();
  renderAdminSwaps();
  renderAdminAvailabilityRequests();
  renderMessageEmployeePicker();
  renderAdminPushControls();
  renderAdminMessages();
  renderAdminTerminalMessages();
  renderAdminTasks();
  renderAdminCleaningTasks();
  renderAdminReminders();
  renderAdminAvailabilityPreview();
  renderAdminCorrection();
  renderWeather();
  renderTerminal();
  renderCustomerInvoiceDesk();
  renderPinChangeOverlay();
  normalizeGermanDisplay();
}

function renderAccess() {
  if (isTerminalMode() || isTodoMode()) {
    document.body.classList.remove("login-mode");
    $("#mainTabs")?.classList.add("hidden");
    $("#topLogout")?.classList.add("hidden");
    return;
  }
  if (isCustomerInvoiceMode()) {
    document.body.classList.remove("login-mode");
    document.body.classList.remove("terminal-login-mode");
    $("#mainTabs")?.classList.add("hidden");
    $("#topLogout")?.classList.add("hidden");
    return;
  }
  const loggedIn = Boolean(state.activeEmployee);
  const chef = currentUserIsChef();
  document.body.classList.remove("terminal-login-mode");
  document.body.classList.toggle("login-mode", !loggedIn && !state.adminToken);
  $("#mainTabs")?.classList.toggle("hidden", !loggedIn || state.pinChangeRequired);
  $$(".employee-only").forEach((element) => element.classList.toggle("hidden", !loggedIn || chef));
  $('[data-tab="swaps"]')?.classList.add("hidden");
  $$(".backoffice-only").forEach((element) => element.classList.toggle("hidden", !loggedIn || !state.hasBackofficeAccess));
  $$(".chef-only").forEach((element) => element.classList.toggle("hidden", !chef));
  $("#homeLogin")?.classList.toggle("hidden", loggedIn);
  $(".home-access")?.classList.toggle("hidden", loggedIn);
  $("#homeGreeting")?.classList.toggle("hidden", !loggedIn);
  $("#topLogout")?.classList.toggle("hidden", !loggedIn && !state.adminToken);
  if ($("#homeEmployeeName")) {
    $("#homeEmployeeName").innerHTML = loggedIn ? renderEmployeeBadge() : "";
  }
}

function renderPinChangeOverlay() {
  const overlay = $("#pinChangeOverlay");
  if (!overlay) return;
  const show = Boolean(state.activeEmployee && state.employeeToken && state.pinChangeRequired);
  overlay.classList.toggle("hidden", !show);
  document.body.classList.toggle("pin-change-required", show);
  if ($("#pinChangeText")) {
    $("#pinChangeText").textContent = show
      ? `${state.activeEmployee}, bitte lege jetzt deinen persönlichen PIN fest. Danach kommst du direkt in die App.`
      : "Bitte lege deinen persönlichen PIN fest.";
  }
}

function isTerminalMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has("terminal") || window.location.hash === "#terminal";
}

function isTodoMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has("todo") || window.location.hash === "#todo" || window.location.pathname.toLowerCase().endsWith("/todo.html");
}

function isCustomerInvoiceMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has("kunde") || params.has("rechnung") || window.location.hash === "#rechnung";
}

function currentUserIsChef() {
  if (!state.activeEmployee) return false;
  const role = String(state.settings?.employeeRoles?.[state.activeEmployee] || "").trim().toLowerCase();
  return state.isChef || role === "chef";
}

function renderEmployeeBadge() {
  const role = roleLabel(state.settings.employeeRoles?.[state.activeEmployee] || "Team");
  if (currentUserIsChef()) {
    return `
      <div class="employee-welcome-block">
        <span class="employee-welcome-title">Willkommen in der Teamapp</span>
        <div class="employee-welcome-name-row">
          <span class="employee-badge-name">${escapeHtml(state.activeEmployee)}</span>
          <span class="employee-badge-role">${escapeHtml(role)}</span>
        </div>
      </div>
    `;
  }
  const totals = timesheetTotals();
  return `
    <div class="employee-welcome-block">
      <span class="employee-welcome-title">Willkommen in der Teamapp</span>
      <div class="employee-welcome-name-row">
        <span class="employee-badge-name">${escapeHtml(state.activeEmployee)}</span>
        <span class="employee-badge-role">${escapeHtml(role)}</span>
      </div>
    </div>
    <button class="employee-badge-stat compact" type="button" data-open-timesheet><small>Gesamtstunden in diesem Monat</small>${formatHours(totals.hours)}</button>
    <span class="employee-badge-stat compact"><small>Gesammeltes Trinkgeld in diesem Monat</small>${formatMoney(totals.tip)}</span>
  `;
}

function renderHome() {
  const container = $("#homeContent");
  if (!container) return;
  const today = todayKey();
  if (!state.activeEmployee && !state.adminToken) {
    container.innerHTML = renderLoginReminder(today);
    return;
  }
  if (currentUserIsChef()) {
    container.innerHTML = chefDashboardHtml();
    return;
  }
  container.innerHTML = `
    ${renderDashboardMessages()}
    ${renderPushNotificationBox()}
    <section class="today-section dashboard-today dashboard-today-open">
      <h2>Heutiger Tag</h2>
      ${renderScheduleDay(new Date(`${today}T12:00:00`), { today: true })}
    </section>
    ${state.activeEmployee ? renderHomeSwaps() : ""}
    ${state.adminUnlocked ? renderMissingAvailability() : ""}
  `;
  removeEmptyHomeBlocks(container);
  ensureWeatherVisible();
}

function renderDashboardMessages() {
  const messages = dashboardMessagesForActiveEmployee()
    .map((message) => ({ ...message, text: String(message.text || "").trim() }))
    .filter((message) => message.text);
  if (!messages.length) return "";
  return `
    <section class="dashboard-messages">
      ${messages.slice(0, 5).map((message) => `
        <article class="dashboard-message">
          <strong>${messageTargetLabel(message)}</strong>
          <p>${escapeHtml(message.text)}</p>
          <button class="secondary dashboard-message-read" data-ack-message="${escapeHtml(message.id)}" type="button">Gelesen</button>
        </article>
      `).join("")}
    </section>
  `;
}

function renderPushNotificationBox() {
  if (!state.activeEmployee || currentUserIsChef()) return "";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "";
  if (Notification.permission === "granted" && state.pushSubscriptionActive) return "";
  const missingKey = !state.pushPublicKey;
  const denied = Notification.permission === "denied";
  return `
    <section class="push-notice">
      <div>
        <strong>Benachrichtigungen am Handy</strong>
        <p>${pushNotificationHint(missingKey, denied)}</p>
      </div>
      <button class="primary" data-enable-push type="button" ${missingKey || denied ? "disabled" : ""}>
        Push aktivieren
      </button>
    </section>
  `;
}

function pushNotificationHint(missingKey, denied) {
  if (missingKey) return "Push ist im Code vorbereitet. In Vercel fehlen noch die VAPID-Schlüssel.";
  if (denied) return "Benachrichtigungen sind im Browser blockiert. Bitte in den Handy-Einstellungen wieder erlauben.";
  return "Erhalte eine Meldung, wenn ein neuer Dienstplan oder die Einteilung für morgen online ist.";
}

async function enablePushNotifications(button) {
  if (!state.employeeToken) {
    showToast("Bitte erneut mit Mitarbeiter-PIN anmelden.");
    return;
  }
  if (!state.pushPublicKey) {
    showToast("Push ist noch nicht fertig eingerichtet.");
    return;
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    showToast("Dieses Gerät unterstützt Web-Push leider nicht.");
    return;
  }
  const oldText = button?.textContent || "Push aktivieren";
  if (button) {
    button.disabled = true;
    button.textContent = "Aktiviert...";
  }
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      showToast("Benachrichtigungen wurden nicht erlaubt.");
      return;
    }
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(state.pushPublicKey)
      });
    }
    await api("/api/state", {
      method: "POST",
      body: JSON.stringify({
        action: "push-subscribe",
        employeeToken: state.employeeToken,
        subscription
      })
    });
    state.pushSubscriptionActive = true;
    renderHome();
    showToast("Push-Benachrichtigungen sind aktiviert.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function ensurePushSubscriptionSynced() {
  if (!state.activeEmployee || !state.employeeToken || !state.pushPublicKey) return;
  if (state.pushSubscriptionActive) return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    const result = await api("/api/state", {
      method: "POST",
      body: JSON.stringify({
        action: "push-subscribe",
        employeeToken: state.employeeToken,
        subscription
      })
    });
    state.pushSubscriptionActive = Boolean(result.pushSubscriptionActive);
  } catch (error) {
    console.warn("Push-Abo konnte nicht automatisch synchronisiert werden.", error);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function dashboardMessagesForActiveEmployee() {
  if (!state.activeEmployee) return [];
  return (state.messages || []).filter((message) => {
    if (!String(message.text || "").trim()) return false;
    if (message.readBy?.[state.activeEmployee]) return false;
    return messageRecipientsClient(message).includes(state.activeEmployee);
  });
}

function removeEmptyHomeBlocks(container) {
  container.querySelectorAll(".dashboard-message, .dashboard-messages, .home-swaps").forEach((element) => {
    if (!element.textContent.trim()) element.remove();
  });
  [...container.children].forEach((element) => {
    if (element.matches(".dashboard-today")) return;
    if (!element.textContent.trim() && !element.querySelector("input, button, select, textarea, [data-weather-widget]")) {
      element.remove();
    }
  });
}

function messageTargetLabel(message) {
  if (message.target === "all") return "Nachricht an alle";
  if (message.target === "employees") {
    const recipients = messageRecipientsClient(message);
    return recipients.length === 1 ? `Nachricht an ${recipients[0]}` : `Nachricht an ${recipients.length || ""} Mitarbeiter`;
  }
  return `Nachricht ${message.target}`;
}

function messageRecipientsClient(message = {}) {
  if (Array.isArray(message.recipients) && message.recipients.length) return message.recipients;
  const employees = state.settings?.employees || [];
  if (message.target === "all") return employees;
  if (message.target === "employees") {
    const wanted = new Set((message.employees || []).map(String));
    return employees.filter((employee) => wanted.has(employee));
  }
  return employees.filter((employee) => employeeMatchesDepartment(employee, message.target));
}

function employeeMatchesDepartment(employee, target) {
  const wanted = normalizeDepartment(target);
  const departments = departmentsForEmployee(state.settings?.employeeDepartments || {}, employee).map(normalizeDepartment);
  const role = normalizeDepartment(state.settings?.employeeRoles?.[employee] || "");
  return departments.includes(wanted) || role === wanted;
}

function renderHomeStats() {
  if (!state.activeEmployee || currentUserIsChef()) return "";
  const totals = timesheetTotals();
  const doneDays = completedTimesheetDates(state.activeEmployee, state.selectedMonth).length;
  return `
    <section class="dashboard-stats">
      <button type="button" data-open-timesheet>
        <span>Stunden</span>
        <strong>${formatHours(totals.hours)}</strong>
        <small>${doneDays} abgeschlossene Tage</small>
      </button>
      <button type="button" data-open-timesheet>
        <span>Trinkgeld</span>
        <strong>${formatMoney(totals.tip)}</strong>
        <small>optional ergänzen</small>
      </button>
    </section>
  `;
}

function renderChef() {
  const container = $("#chefDashboard");
  if (!container) return;
  if (!currentUserIsChef()) {
    container.innerHTML = `<p class="hint">Diese Ansicht ist nur für die Geschäftsleitung sichtbar.</p>`;
    return;
  }
  container.innerHTML = chefDashboardHtml();
}

function chefDashboardHtml() {
  const today = todayKey();
  const schedule = state.schedule || {};
  const openInvoiceCount = openInvoiceItems().length;
  const pendingInvoiceCount = pendingInvoiceItems().length;
  const tabs = [
    ["reports", "Tagesberichte", chefSectionEnabled("reports")],
    ["invoices", "Rechnung schreiben", openInvoiceCount > 0],
    ["employees", "Mitarbeiterübersicht", chefSectionEnabled("employees")],
    ["numbers", "Monatszahlen", true],
    ["schedule", "Dienstplan", chefSectionEnabled("schedule")]
  ].filter(([, , visible]) => visible);
  if (!tabs.some(([key]) => key === state.chefTab)) state.chefTab = tabs[0]?.[0] || "";
  return `
    ${chefSectionEnabled("messages") ? renderDashboardMessages() : ""}
    ${chefSectionEnabled("today") ? `<details class="chef-current-day">
      <summary>Heutiger Tag</summary>
      ${renderScheduleDay(new Date(`${today}T12:00:00`), { today: true })}
    </details>` : ""}
    ${openInvoiceCount ? invoiceWriteAlertHtml(openInvoiceCount) : pendingInvoiceCount ? invoicePendingHintHtml(pendingInvoiceCount) : ""}
    <nav class="chef-tabs" aria-label="Chef-Bereiche">
      ${tabs.map(([key, label]) => `<button class="chef-tab ${state.chefTab === key ? "active" : ""} ${key === "invoices" && openInvoiceCount ? "needs-attention" : ""}" type="button" data-chef-tab="${key}">${label}${key === "invoices" && openInvoiceCount ? ` <span>${openInvoiceCount}</span>` : ""}</button>`).join("")}
    </nav>
    ${chefSectionEnabled("reports") ? `<section class="chef-section ${state.chefTab === "reports" ? "active" : "hidden"}">
      ${dayReportFoldersByMonthHtml()}
    </section>` : ""}
    ${openInvoiceCount ? `<section class="chef-section ${state.chefTab === "invoices" ? "active" : "hidden"}">
      ${openInvoicesHtml()}
    </section>` : ""}
    ${chefSectionEnabled("employees") ? `<section class="chef-section ${state.chefTab === "employees" ? "active" : "hidden"}">
      <div class="chef-section-head">
        <h3>Mitarbeiterübersicht</h3>
        <label>
          Monat
          <input id="chefEmployeeMonth" type="month" value="${escapeHtml(state.selectedMonth)}">
        </label>
      </div>
      ${employeeOverviewHtml({ allowCorrection: false })}
    </section>` : ""}
    <section class="chef-section ${state.chefTab === "numbers" ? "active" : "hidden"}">
      ${monthlyNumbersHtml("chef")}
    </section>
    ${chefSectionEnabled("schedule") ? `<section class="chef-section ${state.chefTab === "schedule" ? "active" : "hidden"}">
      <div class="chef-current-plan">
        <h3>Veröffentlichte Dienstpläne</h3>
        ${chefPublishedSchedulesHtml()}
      </div>
    </section>` : ""}
  `;
}

function invoiceWriteAlertHtml(count) {
  return `
    <button class="invoice-write-alert" type="button" data-chef-tab="invoices">
      <span>Rechnung schreiben</span>
      <strong>${count} Rechnung${count === 1 ? "" : "en"} fertig</strong>
      <small>Zum Öffnen klicken</small>
    </button>
  `;
}

function invoicePendingHintHtml(count) {
  return `
    <div class="invoice-pending-hint">
      <strong>${count} Rechnungskunde${count === 1 ? "" : "n"} angelegt</strong>
      <span>Noch nicht fertig für den Chef. In „Bezahlung auf Rechnung“ Betrag und Beleg ergänzen, dann „Fertig für Chef“ drücken.</span>
    </div>
  `;
}

function dayReportsHtml() {
  const reports = Object.entries(state.dayReports || {})
    .filter(([, report]) => report && typeof report === "object")
    .sort(([a], [b]) => b.localeCompare(a));
  if (!reports.length) {
    return `<p class="hint">Noch keine Tagesberichte gespeichert.</p>`;
  }
  return `
    <div class="day-report-list">
      ${reports.map(([dateKey, report]) => `
        <details class="day-report-card">
          <summary>
            <strong>${formatDate(dateKey)}</strong>
          <span>${dayReportSummaryLine(report)}</span>
          </summary>
          ${dayReportA4Html(dateKey, report)}
          ${chefDayReportAttachmentsHtml(dateKey, report)}
          <button class="secondary" data-print-day-report="${escapeHtml(dateKey)}" type="button">Bericht drucken</button>
        </details>
      `).join("")}
    </div>
  `;
}

function dayReportsForMonthHtml(month) {
  const reports = Object.entries(state.dayReports || {})
    .filter(([dateKey, report]) => dateKey.startsWith(`${month}-`) && report && typeof report === "object")
    .sort(([a], [b]) => b.localeCompare(a));
  if (!reports.length) {
    return `<p class="hint">In diesem Monat sind noch keine Tagesberichte gespeichert.</p>`;
  }
  return `
    <div class="day-report-list">
      ${reports.map(([dateKey, report]) => `
        <details class="day-report-card">
          <summary>
            <strong>${formatDate(dateKey)}</strong>
          <span>${dayReportSummaryLine(report)}</span>
          </summary>
          ${dayReportA4Html(dateKey, report)}
          ${chefDayReportAttachmentsHtml(dateKey, report)}
          <button class="secondary" data-print-day-report="${escapeHtml(dateKey)}" type="button">Bericht drucken</button>
        </details>
      `).join("")}
    </div>
  `;
}

function dayReportSummaryLine(report = {}) {
  return [
    `Umsatz ${formatReportMoney(reportRevenueTotal(report))}`,
    `Rechnung ${formatReportMoney(reportInvoiceTotal(report))}`,
    `EC ${formatReportMoney(reportEcTotal(report))}`,
    ...(reportPersonalConsumptionTotal(report) ? [`Personalverzehr ${formatReportMoney(reportPersonalConsumptionTotal(report))}`] : []),
    `Ausgaben Kasse ${formatReportMoney(reportCashExpensesTotal(report))}`,
    `Abzugeben an Chef ${formatReportMoney(reportChefHandoverTotal(report))}`
  ].join(" · ");
}

function dayReportValuesHtml(report = {}) {
  const gastroParts = reportGastroParts(report);
  return `
    <div class="day-report-values">
      <span><small>Umsatz Bowling</small><strong>${formatReportMoney(report.revenueBowling || report.barBowling)}</strong></span>
      <span><small>Umsatz Gastro</small><strong>${formatReportMoney(gastroRevenueTotal(report))}</strong></span>
      <span><small>Getränke</small><strong>${formatReportMoney(gastroParts.drinks || "")}</strong></span>
      <span><small>Speisen</small><strong>${formatReportMoney(gastroParts.food || "")}</strong></span>
      <span><small>Sonstiges</small><strong>${formatReportMoney(gastroParts.other || "")}</strong></span>
      <span><small>Umsatz gesamt</small><strong>${formatReportMoney(reportRevenueTotal(report))}</strong></span>
      ${reportFieldEnabled("invoiceCustomers") ? `<span><small>Rechnung</small><strong>${formatReportMoney(reportInvoiceTotal(report))}</strong></span>` : ""}
      <span><small>EC</small><strong>${formatReportMoney(reportEcTotal(report))}</strong></span>
      <span><small>Personalverzehr</small><strong>${formatReportMoney(reportPersonalConsumptionTotal(report))}</strong></span>
      ${reportFieldEnabled("expenses") ? `<span><small>Ausgaben Kasse</small><strong>${formatReportMoney(reportCashExpensesTotal(report))}</strong></span>` : ""}
      <span><small>Abzugeben an Chef</small><strong>${formatReportMoney(reportChefHandoverTotal(report))}</strong></span>
    </div>
  `;
}

function dayReportA4Html(dateKey, report = {}) {
  const printableInvoices = reportInvoiceCustomers(report);
  const invoiceTotalValue = reportItemsTotal(printableInvoices);
  const expenseTotalValue = reportCashExpensesTotal(report);
  const ecTotalValue = reportEcTotal(report);
  const ecTerminal1Value = reportMoneyNumber(report.ecTerminal1);
  const ecTerminal2Value = reportMoneyNumber(report.ecTerminal2);
  const personalConsumptionValue = reportPersonalConsumptionTotal(report);
  const bowlingRevenueValue = reportMoneyNumber(report.revenueBowling || report.barBowling);
  const gastroParts = reportGastroParts(report);
  const gastroRevenueValue = gastroRevenueTotal(report);
  const totalRevenueValue = reportRevenueTotal(report);
  const chefHandoverValue = reportChefHandoverTotal(report);
  return `
    <section class="a4-report official-day-report">
      <div class="a4-report-head official-report-head">
        <div class="a4-report-topline">
          <div class="a4-report-brand">
            <img class="a4-report-logo" src="la-bowling-print-logo.png" alt="LA Bowling">
          </div>
          <dl>
            <div><dt>Schichtleitung</dt><dd>${escapeHtml(report.shiftLeader || "-")}</dd></div>
          </dl>
        </div>
        <h2 class="a4-report-title">Tagesbericht vom ${escapeHtml(formatNumericDate(dateKey))}</h2>
      </div>

      <div class="a4-report-grid">
        <section class="a4-report-block a4-report-finance-summary">
          <h4>Umsätze</h4>
          ${a4MoneyTable([
            ["Umsatz Bowling", bowlingRevenueValue],
            ["Getränke", gastroParts.drinks],
            ["Speisen", gastroParts.food],
            ["Sonstiges", gastroParts.other],
            ["Umsatz Gastro gesamt", gastroRevenueValue],
            ["Umsatz gesamt", totalRevenueValue, "strong"]
          ])}
        </section>
        <section class="a4-report-block a4-report-finance-summary">
          <h4>Zahlarten & Abzüge</h4>
          ${a4MoneyTable([
            ["Bezahlung auf Rechnung", invoiceTotalValue],
            ["EC Terminal 1", ecTerminal1Value],
            ["EC Terminal 2", ecTerminal2Value],
            ["EC gesamt", ecTotalValue, "strong"],
            ["Personalverzehr", personalConsumptionValue],
            ["Ausgaben Kasse", expenseTotalValue]
          ])}
        </section>
        <div class="a4-chef-mini-total" style="grid-column:1/-1;display:grid;grid-template-columns:1fr auto;align-items:center;background:#fff0f2;padding:2px 8px;min-height:16px;line-height:1;">
          <span style="font-size:12px;font-weight:700;line-height:1;">Abzugeben an Chef</span>
          <strong style="font-size:15px;font-weight:700;line-height:1;">${escapeHtml(formatReportMoney(chefHandoverValue))}</strong>
        </div>
        ${reportFieldEnabled("invoiceCustomers") && printableInvoices.length ? a4InvoiceBlock(printableInvoices) : ""}
        ${reportFieldEnabled("expenses") && (report.expenses || []).length ? a4ExpenseBlock(report.expenses) : ""}
        <section class="a4-report-block a4-report-block-wide a4-report-staff">
          <h4>Personalzeiten</h4>
          ${dayReportEmployeeRowsHtml(dateKey, report) || `<p class="hint">Keine Arbeitszeiten erfasst.</p>`}
        </section>
        ${reportFieldEnabled("handovers") ? a4HandoversBlock(report.handovers) : ""}
        ${reportFieldEnabled("notes") && String(report.notes || "").trim() ? a4NotesBlock(report.notes) : ""}
        <section class="a4-report-signature">
          <div>
            <span>Ort / Datum</span>
            <strong>Landshut, ${escapeHtml(formatNumericDate(dateKey))}</strong>
          </div>
          <div>
            <span>Unterschrift Schichtleitung</span>
            <strong>${escapeHtml(report.shiftLeader || "-")}</strong>
          </div>
        </section>
      </div>
    </section>
  `;
}

function a4MoneyTable(rows = []) {
  return `
    <div class="a4-money-list">
      ${rows.map(([label, value, mode]) => `
        <div class="a4-money-row ${mode === "strong" ? "a4-money-strong" : ""}">
          <span>${escapeHtml(label)}</span>
          <strong>${formatReportMoney(value)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function a4Kpi(label, value) {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function a4ReportLine(label, value, className = "") {
  return `
    <div class="a4-report-line ${className}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function a4TipDistributionBlock(report = {}) {
  const rows = reportTipRows(report);
  const tipTotal = reportMoneyNumber(report.tipTotal);
  const distributed = rows.reduce((sum, row) => sum + row.amount, 0);
  const remainder = reportMoneyNumber(report.tipRemainder);
  if (!rows.length && tipTotal <= 0 && remainder <= 0) return "";
  return `
    <section class="a4-report-block a4-report-block-wide a4-report-tip-control">
      <h4>Trinkgeld-Verteilung</h4>
      <table class="a4-report-table">
        <thead>
          <tr><th>Mitarbeiter</th><th>Betrag</th></tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map((row) => `
            <tr>
              <td>${escapeHtml(row.employee)}</td>
              <td>${formatReportMoney(row.amount)}</td>
            </tr>
          `).join("") : `<tr><td colspan="2">Noch keine Verteilung gespeichert.</td></tr>`}
        </tbody>
        <tfoot>
          <tr><th>Verteilt</th><td>${formatReportMoney(distributed)}</td></tr>
          <tr><th>Trinkgeld gesamt</th><td>${formatReportMoney(tipTotal)}</td></tr>
        </tfoot>
      </table>
    </section>
  `;
}

function reportTipRows(report = {}) {
  return Object.entries(report.tipsByEmployee || {})
    .map(([employee, amount]) => ({ employee, amount: reportMoneyNumber(amount) }))
    .filter((row) => row.employee && row.amount > 0)
    .sort((a, b) => a.employee.localeCompare(b.employee, "de"));
}

function dayReportEmployeeRowsHtml(dateKey, report = {}) {
  const employees = reportEmployeesForDate(dateKey, report);
  if (!employees.length) return "";
  const rows = employees.map((employee) => {
    const entry = state.timesheets?.[employee]?.[dateKey] || state.terminalEntries?.[employee]?.[dateKey] || {};
    const hours = paidHours(entry);
    return `
      <div class="a4-staff-row">
        <strong>${escapeHtml(employee)}</strong>
        <span>${escapeHtml(dayReportShiftText(entry))}</span>
        <b>${formatHours(hours)}</b>
      </div>
    `;
  }).join("");
  return `
    <div class="a4-staff-list">
      <div class="a4-staff-head"><span>Name</span><span>Dienstzeit</span><span>Arbeitszeit</span></div>
      ${rows}
    </div>
  `;
}

function dayReportShiftText(entry = {}) {
  const segments = timeSegments(entry);
  if (!segments.length) return "offen bis offen";
  return segments.map((segment) => `${segment.from || "offen"} bis ${segment.to || "offen"}`).join(" | ");
}

function reportEmployeesForDate(dateKey, report = {}) {
  const names = new Set();
  const removed = new Set(report.removedEmployees || state.terminalReport?.removedEmployees || []);
  Object.entries(state.timesheets || {}).forEach(([employee, entries]) => {
    const entry = entries?.[dateKey] || {};
    if (entryHasAnyTime(entry)) names.add(employee);
  });
  if (dateKey === state.terminalDate) {
    terminalEmployeesForDay(dateKey).forEach((employee) => names.add(employee));
  }
  (report.extraEmployees || []).forEach((item) => {
    const employee = typeof item === "string" ? item : item.employee;
    if (employee) names.add(employee);
  });
  return [...names].filter((employee) => {
    if (!employee) return false;
    if (!removed.has(employee)) return true;
    const entry = state.timesheets?.[employee]?.[dateKey] || state.terminalEntries?.[employee]?.[dateKey] || {};
    return entryHasAnyTime(entry);
  }).sort((a, b) => a.localeCompare(b, "de"));
}

function a4InvoiceBlock(items = []) {
  return `
    <section class="a4-report-block a4-report-compact">
      <h4>Rechnungskunden</h4>
      ${items.length ? `<div class="a4-compact-list">
        ${items.map((item, index) => `
          <div class="a4-compact-row">
            <div>
              <strong>${escapeHtml(item.name || `Kunde ${index + 1}`)}</strong>
              <small>Bowling ${formatReportMoney(item.bowlingAmount)} · ${escapeHtml(invoiceGastroSummaryText(item))}</small>
              ${item.gastroOtherNote ? `<small>Sonstiges Notiz: ${escapeHtml(item.gastroOtherNote)}</small>` : ""}
            </div>
            <strong>${formatReportMoney(invoiceTotal(item))}</strong>
          </div>
        `).join("")}
      </div>` : `<p class="hint">Keine Rechnungskunden.</p>`}
    </section>
  `;
}

function a4ExpenseBlock(items = []) {
  return `
    <section class="a4-report-block">
      <h4>Ausgaben</h4>
      ${items.length ? `<div class="a4-compact-list">
        ${items.map((item, index) => `
          <div class="a4-compact-row">
            <span>${escapeHtml(item.name || `Ausgabe ${index + 1}`)}${item.category ? ` · ${escapeHtml(item.category)}` : ""}</span>
            <strong>${formatReportMoney(item.amount)}</strong>
          </div>
        `).join("")}
      </div>` : `<p class="hint">Keine Ausgaben.</p>`}
    </section>
  `;
}

function a4DocumentsBlock(documents = {}) {
  const entries = [
    ["Penta", documents.penta],
    ["Handschrift", documents.handwriting],
    ["EC-Schnitt", documents.ecCut]
  ];
  return `
    <section class="a4-report-block">
      <h4>Dokumente Tagesordner</h4>
      <table class="a4-report-table">
        <tbody>${entries.map(([label, document]) => `
          <tr>
            <th>${escapeHtml(label)}</th>
            <td>${document?.name ? escapeHtml(document.name) : "fehlt"}</td>
            <td>${document?.path || document?.url || document?.data ? reportDocumentLinkHtml(document, label) : "-"}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    </section>
  `;
}

function a4HandoversBlock(items = []) {
  if (!items.length) return "";
  return `
    <section class="a4-report-block">
      <h4>Schichtübergaben</h4>
      ${items.map((item) => `<p><strong>${escapeHtml(item.time || "--:--")} ${escapeHtml(item.from || "-")} an ${escapeHtml(item.to || "-")}:</strong> ${escapeHtml(item.note || "-")}</p>`).join("")}
    </section>
  `;
}

function a4NotesBlock(notes = "") {
  return `
    <section class="a4-report-block">
      <h4>Notizen</h4>
      <p>${notes ? escapeHtml(notes) : "Keine Notizen."}</p>
    </section>
  `;
}

function openInvoicesHtml() {
  const items = openInvoiceItems();
  return `
    <section class="open-invoices-panel ${items.length ? "has-open-invoices" : ""}">
      <div>
        <h3>Rechnung schreiben</h3>
        <p>${items.length ? `${items.length} Rechnung${items.length === 1 ? "" : "en"} zu schreiben` : "Keine offene Rechnung."}</p>
      </div>
      ${items.length ? `<div class="open-invoice-list">
        ${items.map((entry) => openInvoiceCardHtml(entry)).join("")}
      </div>` : ""}
    </section>
  `;
}

function openInvoiceItems() {
  const items = [];
  for (const [dateKey, report] of Object.entries(state.dayReports || {})) {
    (report.invoiceCustomers || []).forEach((invoice, index) => {
      if (invoice.invoiceDone) return;
      if (!invoiceIsReady(invoice)) return;
      items.push({ dateKey, invoice, index });
    });
  }
  return items.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function pendingInvoiceItems() {
  const items = [];
  for (const [dateKey, report] of Object.entries(state.dayReports || {})) {
    (report.invoiceCustomers || []).forEach((invoice, index) => {
      if (invoice.invoiceDone || invoiceIsReady(invoice)) return;
      items.push({ dateKey, invoice, index });
    });
  }
  return items.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function openInvoiceCardHtml({ dateKey, invoice, index }) {
  const bowling = reportMoneyNumber(invoice.bowlingAmount || 0);
  const gastroSplit = invoiceGastroSplit(invoice);
  const total = invoiceTotal(invoice);
  const token = `${dateKey}|${invoice.id || index}`;
  const briefhead = invoiceBriefhead(invoice);
  const gastroFields = gastroSplit.hasSplit
    ? `
        ${invoiceCopyField("Gastro Getränke", formatReportMoney(gastroSplit.drinks))}
        ${invoiceCopyField("Gastro Speisen", formatReportMoney(gastroSplit.food))}
        ${invoiceCopyField("Gastro Sonstiges", formatReportMoney(gastroSplit.other))}
      `
    : invoiceCopyField("Gastro Betrag", formatReportMoney(gastroSplit.total), "invoice-copy-field-wide");
  return `
    <article class="open-invoice-card">
      <div class="open-invoice-head">
        <strong>${escapeHtml(invoice.name || `Rechnung ${index + 1}`)}</strong>
        <div class="open-invoice-actions">
          <button class="primary" type="button" data-complete-invoice="${escapeHtml(token)}">Erledigt</button>
          <button class="secondary danger-lite" type="button" data-delete-invoice="${escapeHtml(token)}">Löschen</button>
        </div>
      </div>
      <div class="invoice-copy-grid">
        ${invoiceCopyField("Rechnungsdatum", formatDate(dateKey))}
        ${invoiceCopyField("Briefkopf", briefhead, "invoice-copy-field-wide")}
        ${invoiceCopyField("Betrag Bowling", formatReportMoney(bowling))}
        ${gastroFields}
        ${invoiceCopyField("Betrag gesamt", formatReportMoney(total))}
      </div>
      <p class="hint">Ansprechpartner: ${escapeHtml(invoice.contact || "-")} · E-Mail: ${escapeHtml(invoice.email || "-")} · Telefon: ${escapeHtml(invoice.phone || "-")}</p>
      ${gastroSplit.note ? `<p class="hint">Sonstiges Notiz: ${escapeHtml(gastroSplit.note)}</p>` : ""}
      ${invoiceReceiptLinksHtml(invoice)}
    </article>
  `;
}

function invoiceBriefhead(invoice = {}) {
  return [
    invoice.name || "",
    invoice.address || ""
  ].map((line) => String(line || "").trim()).filter(Boolean).join("\n") || "-";
}

function invoiceCopyField(label, value, className = "") {
  const text = String(value || "-");
  const escapedText = escapeHtml(text);
  return `
    <div class="invoice-copy-field ${escapeHtml(className)}">
      <small>${escapeHtml(label)}</small>
      <strong>${escapedText.replace(/\n/g, "<br>")}</strong>
      <button class="secondary" type="button" data-copy-value="${escapedText.replace(/\n/g, "&#10;")}">Kopieren</button>
    </div>
  `;
}

function dayReportFoldersByMonthHtml() {
  const months = Object.keys(state.dayReports || {})
    .filter((dateKey) => state.dayReports?.[dateKey] && typeof state.dayReports[dateKey] === "object")
    .map((dateKey) => dateKey.slice(0, 7));
  const sortedMonths = [...new Set(months)].sort((a, b) => b.localeCompare(a));
  if (!sortedMonths.length) return "";
  return `
    <section class="report-folders">
      <div class="report-folders-head">
        <div>
          <h3>Monatsordner</h3>
          <p>Tagesberichte monatsweise prüfen. Belege und Dokumente stehen direkt im jeweiligen Tagesbericht.</p>
        </div>
      </div>
      ${sortedMonths.map((month) => `
        <details class="report-month-card">
          <summary class="report-month-summary">
            <span>
              <strong>${formatMonth(month)}</strong>
              <small>${monthReportDays(month)} Tagesberichte</small>
            </span>
            <b>${monthReportAttachmentCount(month)} Dateien</b>
          </summary>
          <details class="report-month-section">
            <summary>Tagesberichte</summary>
            ${dayReportsForMonthHtml(month)}
          </details>
        </details>
      `).join("")}
    </section>
  `;
}

function reportFolderHtml(month, key, label) {
  const items = reportFolderItems(month, key);
  return `
    <details class="report-folder-card">
      <summary class="report-folder-card-head">
        <div>
          <strong>${escapeHtml(label)}</strong>
          <span>${items.length} Datei${items.length === 1 ? "" : "en"}</span>
        </div>
      </summary>
      <div class="report-folder-actions">
        <button class="secondary" type="button" data-export-selected-folder="${escapeHtml(month)}|${escapeHtml(key)}" ${items.length ? "" : "disabled"}>Ausgewählte exportieren</button>
        <button class="secondary" type="button" data-export-report-folder="${escapeHtml(month)}|${escapeHtml(key)}" ${items.length ? "" : "disabled"}>Alle exportieren</button>
      </div>
      <div class="report-folder-files">
        ${items.length ? items.map((item, index) => {
          const token = `${month}|${key}|${index}`;
          return `
          <div class="report-folder-file" data-report-file-row="${escapeHtml(token)}">
            <label class="report-file-select">
              <input type="checkbox" data-report-file="${escapeHtml(token)}">
              <span>${escapeHtml(item.title)}</span>
            </label>
            <div class="report-file-actions">
              <button class="secondary" type="button" data-preview-report-file="${escapeHtml(token)}">Vorschau</button>
              <button class="secondary" type="button" data-export-report-file="${escapeHtml(token)}">Export</button>
            </div>
            <div class="report-file-preview hidden" data-report-file-preview="${escapeHtml(token)}"></div>
          </div>
        `}).join("") : `<p class="hint">Keine Dateien in diesem Ordner.</p>`}
      </div>
    </details>
  `;
}

function monthReportDays(month) {
  return Object.keys(state.dayReports || {}).filter((dateKey) => dateKey.startsWith(`${month}-`)).length;
}

function monthReportAttachmentCount(month) {
  return Object.entries(state.dayReports || {})
    .filter(([dateKey]) => dateKey.startsWith(`${month}-`))
    .reduce((sum, [, report]) => sum + dayReportAttachmentCount(report), 0);
}

function dayReportAttachmentCount(report = {}) {
  return chefDayReportAttachmentGroups(report).reduce((sum, group) => sum + group.items.length, 0);
}

function chefDayReportAttachmentsHtml(dateKey, report = {}) {
  const groups = chefDayReportAttachmentGroups(report);
  if (!groups.length) return "";
  return `
    <section class="day-report-attachments">
      <div class="day-report-attachments-head">
        <h4>Belege und Dokumente</h4>
        <span>${groups.reduce((sum, group) => sum + group.items.length, 0)} Datei${groups.reduce((sum, group) => sum + group.items.length, 0) === 1 ? "" : "en"}</span>
      </div>
      <div class="day-report-attachment-groups">
        ${groups.map((group) => `
          <section class="day-report-attachment-group">
            <h5>${escapeHtml(group.label)}</h5>
            <div class="day-report-attachment-list">
              ${group.items.map((item) => `
                <article class="day-report-attachment-item">
                  <div>
                    <strong>${escapeHtml(item.title)}</strong>
                    ${item.subtitle ? `<span>${escapeHtml(item.subtitle)}</span>` : ""}
                  </div>
                  ${item.link}
                </article>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </section>
  `;
}

function chefDayReportAttachmentGroups(report = {}) {
  const invoiceItems = (report.invoiceCustomers || [])
    .flatMap((customer, index) => invoiceAttachmentItems(customer, index));
  const expenseItems = (report.expenses || [])
    .flatMap((expense, index) => expenseAttachmentItems(expense, index));
  const documentGroups = [
    ["EC-Schnitt", report.documents?.ecCut],
    ["Penta", report.documents?.penta],
    ["Handschrift", report.documents?.handwriting]
  ].map(([label, document]) => ({
    label,
    items: documentAttachmentItems(document, label)
  }));
  return [
    { label: "Bezahlung auf Rechnung", items: invoiceItems },
    { label: "Ausgaben", items: expenseItems },
    ...documentGroups
  ].filter((group) => group.items.length);
}

function invoiceAttachmentItems(customer = {}, index = 0) {
  const base = customer.name || `Rechnungskunde ${index + 1}`;
  const total = invoiceTotal(customer);
  const singleReceipt = invoiceReceipt(customer);
  if (singleReceipt) {
    return [{
      title: base,
      subtitle: `Rechnungssumme ${formatReportMoney(total)}`,
      link: receiptLinkHtml(singleReceipt, singleReceipt.receiptName || "Rechnungsbeleg")
    }];
  }
  return invoiceLegacyReceipts(customer).map(({ receipt, title, label }) => ({
    title: `${base} - ${title}`,
    subtitle: `Rechnungssumme ${formatReportMoney(total)}`,
    link: receiptLinkHtml(receipt, label)
  }));
}

function expenseAttachmentItems(expense = {}, index = 0) {
  return expenseReceiptEntries(expense).map((receipt, receiptIndex) => ({
    title: expense.name || `Ausgabe ${index + 1}`,
    subtitle: `${expense.category || "Ausgabe"} · ${formatReportMoney(expense.amount)} · Beleg ${receiptIndex + 1}`,
    link: receiptLinkHtml(receipt, receipt.receiptName || `Beleg ${receiptIndex + 1}`)
  }));
}

function documentAttachmentItems(document = {}, label = "Dokument") {
  if (!hasDocument(document)) return [];
  return [{
    title: label,
    subtitle: document.name || label,
    link: reportDocumentLinkHtml(document, label)
  }];
}

function reportFolderItems(month, key) {
  const reports = Object.entries(state.dayReports || {})
    .filter(([dateKey]) => dateKey.startsWith(`${month}-`))
    .sort(([a], [b]) => a.localeCompare(b));
  const items = [];
  for (const [dateKey, report] of reports) {
    if (key === "expenses") {
      (report.expenses || []).forEach((expense, index) => {
        expenseReceiptEntries(expense).forEach((receipt, receiptIndex) => {
          items.push(receiptFolderItem(dateKey, receipt, `${expense.name || `Ausgabe ${index + 1}`} - Beleg ${receiptIndex + 1}`, receipt.receiptName || `Beleg ${receiptIndex + 1}`));
        });
      });
    }
    if (key === "invoices") {
      (report.invoiceCustomers || []).forEach((customer, index) => {
        const base = customer.name || `Rechnungskunde ${index + 1}`;
        const singleReceipt = invoiceReceipt(customer);
        if (singleReceipt) {
          items.push(receiptFolderItem(dateKey, singleReceipt, base, "Rechnungsbeleg"));
          return;
        }
        invoiceLegacyReceipts(customer).forEach(({ receipt, title, label }) => {
          items.push(receiptFolderItem(dateKey, receipt, `${base} - ${title}`, label));
        });
      });
    }
    if (key === "penta" && hasDocument(report.documents?.penta)) {
      items.push(documentFolderItem(dateKey, report.documents.penta, "Penta"));
    }
    if (key === "handwriting" && hasDocument(report.documents?.handwriting)) {
      items.push(documentFolderItem(dateKey, report.documents.handwriting, "Handschrift"));
    }
    if (key === "ecCut" && hasDocument(report.documents?.ecCut)) {
      items.push(documentFolderItem(dateKey, report.documents.ecCut, "EC-Schnitt"));
    }
  }
  return items;
}

function hasReceipt(item = {}) {
  return Boolean(item.receiptPath || item.receiptUrl || item.receiptData || expenseReceiptEntries(item).length);
}

function hasDocument(item = {}) {
  return Boolean(item.path || item.url || item.data);
}

function invoiceReceipt(item = {}) {
  const receipt = {
    receiptName: item.receiptName,
    receiptPath: item.receiptPath,
    receiptUrl: item.receiptUrl,
    receiptData: item.receiptData
  };
  if (hasReceipt(receipt)) return receipt;
  const legacy = invoiceLegacyReceipts(item);
  return legacy.length === 1 ? legacy[0].receipt : null;
}

function invoiceLegacyReceipts(item = {}) {
  const receipts = [];
  const bowling = {
    receiptName: item.bowlingReceiptName,
    receiptPath: item.bowlingReceiptPath,
    receiptUrl: item.bowlingReceiptUrl,
    receiptData: item.bowlingReceiptData
  };
  const gastro = {
    receiptName: item.gastroReceiptName,
    receiptPath: item.gastroReceiptPath,
    receiptUrl: item.gastroReceiptUrl,
    receiptData: item.gastroReceiptData
  };
  if (hasReceipt(bowling)) receipts.push({ receipt: bowling, title: "Bowling", label: "Beleg Bowling" });
  if (hasReceipt(gastro)) receipts.push({ receipt: gastro, title: "Gastro", label: "Beleg Gastro" });
  return receipts;
}

function invoiceReceiptLinksHtml(item = {}) {
  const singleReceipt = invoiceReceipt(item);
  if (singleReceipt) return receiptLinkHtml(singleReceipt, "Rechnungsbeleg");
  return invoiceLegacyReceipts(item).map(({ receipt, label }) => receiptLinkHtml(receipt, label)).join("");
}

function invoiceReceiptNameText(item = {}) {
  const singleReceipt = invoiceReceipt(item);
  if (singleReceipt) return singleReceipt.receiptName || "Rechnungsbeleg";
  const legacy = invoiceLegacyReceipts(item).map(({ label, receipt }) => `${label}: ${receipt.receiptName || "Beleg"}`);
  return legacy.join(" | ") || "-";
}

function invoiceGastroSplit(item = {}) {
  const drinksText = String(item.gastroDrinksAmount ?? "").trim();
  const foodText = String(item.gastroFoodAmount ?? "").trim();
  const otherText = String(item.gastroOtherAmount ?? "").trim();
  const hasSplit = [drinksText, foodText, otherText].some(Boolean);
  const drinks = reportMoneyNumber(item.gastroDrinksAmount);
  const food = reportMoneyNumber(item.gastroFoodAmount);
  const other = reportMoneyNumber(item.gastroOtherAmount);
  const fallback = reportMoneyNumber(item.gastroAmount || (item.area === "gastro" ? item.amount : ""));
  const total = hasSplit ? drinks + food + other : fallback;
  return {
    drinks,
    food,
    other,
    total,
    hasSplit,
    note: String(item.gastroOtherNote || "").trim()
  };
}

function expenseReceiptEntries(item = {}) {
  const receipts = [];
  const seen = new Set();
  const addReceipt = (receipt = {}) => {
    const clean = {
      receiptName: receipt.receiptName || receipt.name || "",
      receiptPath: receipt.receiptPath || receipt.path || "",
      receiptUrl: receipt.receiptUrl || receipt.url || "",
      receiptData: receipt.receiptData || receipt.data || ""
    };
    if (!clean.receiptName && !clean.receiptPath && !clean.receiptUrl && !clean.receiptData) return;
    const key = clean.receiptPath || clean.receiptUrl || clean.receiptData || clean.receiptName;
    if (seen.has(key)) return;
    seen.add(key);
    receipts.push(clean);
  };
  (Array.isArray(item.receipts) ? item.receipts : []).forEach(addReceipt);
  addReceipt({
    receiptName: item.receiptName,
    receiptPath: item.receiptPath,
    receiptUrl: item.receiptUrl,
    receiptData: item.receiptData
  });
  return receipts;
}

function expenseReceiptLinksHtml(item = {}) {
  const receipts = expenseReceiptEntries(item);
  if (!receipts.length) return `<span class="hint">Beleg: nicht hochgeladen.</span>`;
  return `<div class="expense-receipt-links">${receipts.map((receipt, index) => receiptLinkHtml(receipt, receipt.receiptName || `Beleg ${index + 1}`)).join("")}</div>`;
}

function invoiceIsReady(item = {}) {
  if (item.invoiceReady === true || item.invoiceReady === "true") return true;
  if (item.invoiceReady === false || item.invoiceReady === "false") return false;
  return invoiceTotal(item) > 0 && Boolean(invoiceReceipt(item));
}

function invoiceStatusText(item = {}) {
  if (item.invoiceDone) return "Erledigt";
  if (item.invoiceNotificationSentAt) return "An Chef gesendet";
  if (invoiceIsReady(item)) return "Fertig für Chef";
  return "Angelegt";
}

function invoiceStatusClass(item = {}) {
  if (item.invoiceDone) return "is-done";
  if (invoiceIsReady(item)) return "is-ready";
  return "is-draft";
}

function invoiceGastroSummaryText(item = {}) {
  const split = invoiceGastroSplit(item);
  if (!split.hasSplit) return `Gastro ${formatReportMoney(split.total)}`;
  const parts = [
    `Getränke ${formatReportMoney(split.drinks)}`,
    `Speisen ${formatReportMoney(split.food)}`,
    `Sonstiges ${formatReportMoney(split.other)}`
  ];
  return `Gastro ${parts.join(" · ")}${split.note ? ` · Notiz: ${split.note}` : ""}`;
}

function receiptFolderItem(dateKey, receipt, title, label) {
  return {
    ...receipt,
    title: `${formatDate(dateKey)} · ${title}`,
    label,
    href: receiptHref(receipt)
  };
}

function documentFolderItem(dateKey, document, label) {
  const receipt = {
    receiptName: document.name || label,
    receiptPath: document.path,
    receiptUrl: document.url,
    receiptData: document.data
  };
  return {
    ...receipt,
    title: `${formatDate(dateKey)} · ${label}`,
    label,
    href: receiptHref(receipt)
  };
}

function reportInvoiceCustomersHtml(items = []) {
  if (!items.length) return "";
  return `
    <div class="report-item-list">
      <h4>Rechnungskunden</h4>
      ${items.map((item, index) => `
        <article class="report-item">
          <strong>${escapeHtml(item.name || `Kunde ${index + 1}`)}</strong>
          <span>Rechnungssumme ${formatReportMoney(invoiceTotal(item))}</span>
          <span>Bowling ${formatReportMoney(item.bowlingAmount)}</span>
          <span>${escapeHtml(invoiceGastroSummaryText(item))}</span>
          <span>Briefkopf</span>
          <p class="invoice-briefhead">${escapeHtml(invoiceBriefhead(item)).replace(/\n/g, "<br>")}</p>
          <span>Ansprechpartner: ${escapeHtml(item.contact || "-")}</span>
          <span>Telefon: ${escapeHtml(item.phone || "-")}</span>
          <span>Tipp: ${escapeHtml(item.tip || "-")}</span>
          <span>${escapeHtml(item.email || "Keine E-Mail")}</span>
          ${item.gastroOtherNote ? `<span>Sonstiges Notiz: ${escapeHtml(item.gastroOtherNote)}</span>` : ""}
          ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
          ${invoiceReceiptLinksHtml(item)}
        </article>
      `).join("")}
    </div>
  `;
}

function reportHandoversHtml(items = []) {
  if (!items.length) return "";
  return `
    <div class="report-item-list">
      <h4>Übergaben</h4>
      ${items.map((item) => `
        <article class="report-item">
          <strong>${escapeHtml(item.time || "--:--")} | ${escapeHtml(item.from || "-")} an ${escapeHtml(item.to || "-")}</strong>
          <p>${escapeHtml(item.note || "-")}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function reportPreparationHtml(dateKey, report = {}) {
  const prepTasks = (state.taskTemplates || []).filter((task) => task.category === "preparation" && taskAppliesToDate(task, dateKey));
  if (!prepTasks.length) return "";
  const done = report.taskCompletions || {};
  const complete = prepTasks.every((task) => done[task.id]);
  return `
    <p><strong>Vorbereitung:</strong> ${complete ? "erledigt" : "nicht vollständig"}${report.shiftLeader ? ` von ${escapeHtml(report.shiftLeader)}` : ""}</p>
  `;
}

function reportPreparationLine(dateKey, report = {}) {
  const prepTasks = (state.taskTemplates || []).filter((task) => task.category === "preparation" && taskAppliesToDate(task, dateKey));
  if (!prepTasks.length) return "Vorbereitung: keine Aufgaben hinterlegt";
  const done = report.taskCompletions || {};
  const complete = prepTasks.every((task) => done[task.id]);
  return `Vorbereitung: ${complete ? "erledigt" : "nicht vollständig"}${report.shiftLeader ? ` von ${report.shiftLeader}` : ""}`;
}

function reportExpensesHtml(items = []) {
  if (!items.length) return "";
  return `
    <div class="report-item-list">
      <h4>Ausgaben</h4>
      ${items.map((item, index) => `
        <article class="report-item">
          <strong>${escapeHtml(item.name || `Ausgabe ${index + 1}`)}</strong>
          <span>${escapeHtml(item.category || "Ausgabe")} · ${formatReportMoney(item.amount)}</span>
          ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
          ${expenseReceiptLinksHtml(item)}
        </article>
      `).join("")}
    </div>
  `;
}

function reportDocumentsHtml(documents = {}) {
  const entries = [
    ["Penta", documents.penta],
    ["Handschrift", documents.handwriting],
    ["EC-Schnitt", documents.ecCut]
  ].filter(([, document]) => document?.path || document?.url || document?.data);
  if (!entries.length) return "";
  return `
    <div class="report-item-list">
      <h4>Abschlussdokumente</h4>
      <article class="report-item">
        ${entries.map(([label, document]) => reportDocumentLinkHtml(document, label)).join("")}
      </article>
    </div>
  `;
}

function receiptLinkHtml(item, label = "Beleg") {
  const href = item.href || receiptHref(item);
  if (!href) return `<span class="hint">${label}: nicht hochgeladen.</span>`;
  const name = item.receiptName || "beleg";
  return `<a class="receipt-link" href="${escapeHtml(href)}" download="${escapeHtml(name)}" target="_blank">${escapeHtml(label)} öffnen/exportieren</a>`;
}

function receiptHref(item = {}) {
  return item.receiptUrl || (item.receiptPath ? `/api/receipt?path=${encodeURIComponent(item.receiptPath)}&name=${encodeURIComponent(item.receiptName || "beleg")}` : item.receiptData || "");
}

function reportDocumentLinkHtml(document = {}, label = "Dokument") {
  return receiptLinkHtml({
    receiptName: document.name || label,
    receiptPath: document.path,
    receiptUrl: document.url,
    receiptData: document.data
  }, label);
}

function reportItemsTotal(items = []) {
  return items.reduce((sum, item) => sum + invoiceTotal(item), 0);
}

function reportInvoiceCustomers(report = {}) {
  return (report.invoiceCustomers || []).filter((item) => invoiceIsReady(item));
}

function reportInvoiceTotal(report = {}) {
  return reportItemsTotal(reportInvoiceCustomers(report));
}

function barTotal(report = {}) {
  if (report.cashTotal !== "" && report.cashTotal != null) return reportMoneyNumber(report.cashTotal);
  return reportMoneyNumber(report.barBowling) + reportMoneyNumber(report.barGastro);
}

function reportEcTotal(report = {}) {
  const splitTotal = reportMoneyNumber(report.ecTerminal1) + reportMoneyNumber(report.ecTerminal2);
  return splitTotal || reportMoneyNumber(report.ecTotal);
}

function reportPersonalConsumptionTotal(report = {}) {
  return reportMoneyNumber(report.personalConsumption);
}

function reportCashExpensesTotal(report = {}) {
  if (report.cashExpenses !== "" && report.cashExpenses != null) return reportMoneyNumber(report.cashExpenses);
  return reportItemsTotal(report.expenses);
}

function reportGrossRevenueTotal(report = {}) {
  const split = reportMoneyNumber(report.revenueBowling || report.barBowling) + gastroRevenueTotal(report);
  if (split) return split;
  return Math.max(0, barTotal(report) + reportEcTotal(report) - reportInvoiceTotal(report));
}

function reportRevenueTotal(report = {}) {
  return Math.max(0, reportGrossRevenueTotal(report) - reportPersonalConsumptionTotal(report));
}

function reportGastroParts(report = {}) {
  return {
    drinks: reportMoneyNumber(report.revenueDrinks),
    food: reportMoneyNumber(report.revenueFood),
    other: reportMoneyNumber(report.revenueOther)
  };
}

function gastroRevenueTotal(report = {}) {
  const parts = reportGastroParts(report);
  const split = parts.drinks + parts.food + parts.other;
  return split || reportMoneyNumber(report.revenueGastro || report.barGastro);
}

function reportTipTotal(report = {}) {
  if (report.tipTotal !== "" && report.tipTotal != null) return reportMoneyNumber(report.tipTotal);
  const revenueBowling = reportMoneyNumber(report.revenueBowling || report.barBowling);
  const revenueGastro = gastroRevenueTotal(report);
  const revenueTotal = Math.max(0, revenueBowling + revenueGastro - reportPersonalConsumptionTotal(report));
  return Math.max(0, barTotal(report) + reportCashExpensesTotal(report) + reportEcTotal(report) - revenueTotal);
}

function reportChefHandoverTotal(report = {}) {
  return Math.max(
    0,
    reportRevenueTotal(report)
      - reportEcTotal(report)
      - reportInvoiceTotal(report)
      - reportCashExpensesTotal(report)
  );
}

function reportMoneyNumber(value) {
  const number = Number(String(value || "").replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function invoiceTotal(item = {}) {
  const splitTotal = reportMoneyNumber(item.bowlingAmount) + invoiceGastroSplit(item).total;
  return splitTotal || reportMoneyNumber(item.amount);
}

function exportDayReport(dateKey) {
  const report = state.dayReports?.[dateKey];
  if (!report) return;
  const lineIf = (key, line) => reportFieldEnabled(key) ? [line] : [];
  const printableInvoices = reportInvoiceCustomers(report);
  const invoiceTotalValue = reportItemsTotal(printableInvoices);
  const expenseTotalValue = reportCashExpensesTotal(report);
  const ecTotalValue = reportEcTotal(report);
  const personalConsumptionValue = reportPersonalConsumptionTotal(report);
  const totalRevenueValue = reportRevenueTotal(report);
  const gastroParts = reportGastroParts(report);
  const chefHandoverValue = reportChefHandoverTotal(report);
  const employees = reportEmployeesForDate(dateKey, report);
  const lines = [
    `Tagesbericht ${formatDate(dateKey)}`,
    `Schichtleitung: ${report.shiftLeader || "-"}`,
    `Öffnungszeit: ${report.openingHours || "-"}`,
    `Status: ${report.closed ? "Abgeschlossen" : "Offen"}`,
    "",
    "Personalzeiten:",
    ...(employees.length ? employees.map((employee) => {
      const entry = state.timesheets?.[employee]?.[dateKey] || {};
      return `- ${employee} | ${dayReportShiftText(entry)} | ${formatHours(paidHours(entry))}`;
    }) : ["- Keine Arbeitszeiten erfasst."]),
    "",
    `Umsatz Bowling: ${formatReportMoney(report.revenueBowling || report.barBowling)}`,
    `Umsatz Gastro: ${formatReportMoney(gastroRevenueTotal(report))}`,
    `- Getränke: ${formatReportMoney(gastroParts.drinks || "")}`,
    `- Speisen: ${formatReportMoney(gastroParts.food || "")}`,
    `- Sonstiges: ${formatReportMoney(gastroParts.other || "")}`,
    `Gesamtumsatz: ${formatReportMoney(totalRevenueValue)}`,
    `Bezahlung auf Rechnung: ${formatReportMoney(invoiceTotalValue)}`,
    `EC: ${formatReportMoney(ecTotalValue)}`,
    `Personalverzehr: ${formatReportMoney(personalConsumptionValue)}`,
    `Ausgaben: ${formatReportMoney(expenseTotalValue)}`,
    `Abzugeben an Chef: ${formatReportMoney(chefHandoverValue)}`,
    ...(reportFieldEnabled("preparation") ? [reportPreparationLine(dateKey, report)] : []),
    "",
    ...(reportFieldEnabled("handovers") ? ["Übergaben:", ...(report.handovers || []).map((item) => `- ${item.time || "--:--"} | ${item.from || "-"} an ${item.to || "-"} | ${item.note || "-"}`)] : []),
    "",
    ...(reportFieldEnabled("invoiceCustomers") && printableInvoices.length ? ["Rechnungskunden:", ...printableInvoices.map((item) => `- ${item.name || "Kunde"} | ${formatReportMoney(invoiceTotal(item))}`)] : []),
    "",
    ...(reportFieldEnabled("expenses") ? ["Ausgaben:", ...(report.expenses || []).map((item) => `- ${item.name || "Ausgabe"} | ${item.category || "-"} | ${formatReportMoney(item.amount)} | Beleg: ${item.receiptName || "-"}`)] : []),
    "",
    ...(reportFieldEnabled("documents") ? ["Abschlussdokumente:", `- Penta: ${report.documents?.penta?.name || "-"}`, `- Handschrift: ${report.documents?.handwriting?.name || "-"}`, `- EC-Schnitt: ${report.documents?.ecCut?.name || "-"}`] : []),
    "",
    ...lineIf("notes", `Notizen: ${report.notes || "-"}`)
  ];
  downloadText(`tagesbericht-${dateKey}.txt`, lines.join("\n"));
}

function printDayReportFromChef(dateKey, button) {
  const card = button?.closest(".day-report-card");
  if (!card) return;
  card.setAttribute("data-printing-report", dateKey);
  card.open = true;
  document.body.classList.add("print-chef-day-report");
  const cleanup = () => {
    document.body.classList.remove("print-chef-day-report");
    card.removeAttribute("data-printing-report");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
  window.setTimeout(cleanup, 1200);
}

function exportReportFolder(value) {
  const [month, key] = String(value || "").split("|");
  const items = reportFolderItems(month, key).filter((item) => item.href);
  exportReportItems(items);
}

function exportSelectedReportFolder(value) {
  const [month, key] = String(value || "").split("|");
  const prefix = `${month}|${key}|`;
  const checked = $$("[data-report-file]").filter((input) => input.checked && input.dataset.reportFile.startsWith(prefix));
  const items = checked
    .map((input) => reportFolderItemByToken(input.dataset.reportFile))
    .filter((item) => item?.href);
  if (!items.length) {
    showToast("Bitte mindestens eine Datei auswählen.");
    return;
  }
  exportReportItems(items);
}

function exportSingleReportFile(value) {
  const item = reportFolderItemByToken(value);
  if (!item?.href) {
    showToast("Datei nicht gefunden.");
    return;
  }
  downloadFileLink(item.href, item.receiptName || item.title || item.label || "datei");
}

function exportReportItems(items) {
  if (!items.length) {
    showToast("In diesem Ordner sind keine Dateien zum Exportieren.");
    return;
  }
  items.forEach((item, index) => {
    window.setTimeout(() => downloadFileLink(item.href, item.receiptName || `${item.label}-${index + 1}`), index * 350);
  });
  showToast(`${items.length} Datei${items.length === 1 ? "" : "en"} werden exportiert.`);
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast("Kopiert.");
  } catch (error) {
    showToast("Kopieren nicht möglich.");
  }
}

async function completeInvoice(value, button) {
  const [date, invoiceId] = String(value || "").split("|");
  if (!date || !invoiceId) return;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    await api("/api/state", {
      method: "POST",
      body: JSON.stringify({
        action: "complete-invoice",
        date,
        invoiceId,
        employeeToken: state.employeeToken,
        adminToken: state.adminToken
      })
    });
    await loadState();
    showToast("Rechnung erledigt.");
  } catch (error) {
    button.textContent = oldText;
    button.disabled = false;
    showError(error);
  }
}

async function deleteInvoiceCustomer(value, button) {
  const [date, invoiceId] = String(value || "").split("|");
  if (!date || !invoiceId) return;
  if (!window.confirm("Rechnungskunden wirklich vollständig löschen? Der Eintrag verschwindet dann aus Chefansicht, Tagesbericht und Druckansicht.")) return;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Löscht...";
  try {
    await api("/api/state", {
      method: "POST",
      body: JSON.stringify({
        action: "delete-invoice-customer",
        date,
        invoiceId,
        employeeToken: state.employeeToken,
        adminToken: state.adminToken
      })
    });
    await loadState();
    showToast("Rechnungskunde gelöscht.");
  } catch (error) {
    button.textContent = oldText;
    button.disabled = false;
    showError(error);
  }
}

function reportFolderItemByToken(value) {
  const [month, key, indexText] = String(value || "").split("|");
  const index = Number(indexText);
  if (!month || !key || !Number.isInteger(index)) return null;
  return reportFolderItems(month, key)[index] || null;
}

function toggleReportFilePreview(value) {
  const target = $(`[data-report-file-preview="${cssEscape(value)}"]`);
  const item = reportFolderItemByToken(value);
  if (!target || !item?.href) return;
  const isOpening = target.classList.contains("hidden");
  $$(".report-file-preview").forEach((preview) => {
    if (preview !== target) preview.classList.add("hidden");
  });
  if (!isOpening) {
    target.classList.add("hidden");
    return;
  }
  target.innerHTML = `
    <div class="report-preview-head">
      <strong>${escapeHtml(item.title)}</strong>
      <a class="receipt-link" href="${escapeHtml(item.href)}" target="_blank" rel="noopener">In neuem Tab öffnen</a>
    </div>
    <iframe src="${escapeHtml(item.href)}" title="${escapeHtml(item.title)}"></iframe>
  `;
  target.classList.remove("hidden");
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}

function downloadFileLink(href, filename) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function renderLoginReminder(dateKey) {
  return "";
}

function renderEmployeeSelect() {
  const loggedIn = Boolean(state.activeEmployee);
  const fixed = loggedIn && employeeIsFixed(state.activeEmployee);
  $("#employeeLogin").classList.toggle("hidden", loggedIn);
  $("#employeeActive").classList.toggle("hidden", !loggedIn);
  $("#saveAvailability").classList.toggle("hidden", !loggedIn);
  $("#activeEmployeeName").textContent = loggedIn ? state.activeEmployee : "";
  const locked = loggedIn && availabilityIsSubmitted();
  const monthLabel = formatMonth(availabilityMonthValue());
  const isOpen = state.settings.availabilitySubmissionOpen !== false;
  $("#employeeViewHint").textContent = loggedIn
    ? (!isOpen ? `Die Verfügbarkeit für ${monthLabel} ist aktuell geschlossen.` : (locked ? `Verfügbarkeit für ${monthLabel} wurde bereits abgegeben. Änderungen bitte anfragen.` : (fixed ? `Markiere für ${monthLabel} nur die Tage, an denen du nicht kannst, bitte mit Grund.` : `Markiere für ${monthLabel} die Tage, an denen du kannst.`)))
    : "Mitarbeiter-PIN eingeben, um die eigene Verfügbarkeit zu bearbeiten.";
  $("#saveAvailability").disabled = !isOpen;
  $("#saveAvailability").textContent = locked ? "Änderung anfragen" : (fixed ? "Ausnahmen absenden" : "Verfügbarkeit absenden");
}

function renderAvailability() {
  if (!state.activeEmployee) {
    $("#availabilityGrid").innerHTML = "";
    return;
  }
  const employee = state.activeEmployee;
  const employeeDays = state.availability[employee] || {};
  const fixed = employeeIsFixed(employee);
  const locked = availabilityIsSubmitted();
  const requestOpen = hasOpenAvailabilityRequest();
  $("#availabilityGrid").innerHTML = renderWeekSections(availabilityMonthValue(), (date) => {
    const key = isoDate(date);
    const day = { ...emptyDay(), ...(employeeDays[key] || {}) };
    const holiday = holidayInfo(key);
    const active = fixed ? day.status === "no" : day.status === "yes";
    return `
      <article class="day-card ${active ? (fixed ? "cannot-work" : "can-work") : ""} ${fixed ? "fixed-availability-card" : ""}" data-date="${key}" data-availability-mode="${fixed ? "fixed" : "standard"}">
        <div class="day-title availability-day-title">
          <span class="availability-date">${availabilityDayLabel(date)}${holiday.label ? " *" : ""}</span>
          ${holiday.label ? `<span class="weekday availability-special">${escapeHtml(holiday.label)}</span>` : ""}
        </div>
        <div class="status-row single">
          <button data-status="${fixed ? "no" : "yes"}" class="${active ? "active" : ""}" ${locked ? "disabled" : ""}>${fixed ? "Kann nicht" : "Kann"}</button>
        </div>
        <input type="text" data-field="note" value="${escapeHtml(day.note)}" placeholder="${fixed ? "Grund, z.B. Urlaub oder Termin" : "Notiz, z.B. nur früh"}" ${locked ? "disabled" : ""}>
      </article>
    `;
  }) + (locked ? `
    <section class="locked-box availability-locked">
      <span>${requestOpen ? "Änderung ist bereits angefragt." : "Diese Verfügbarkeit ist gesperrt, weil sie bereits abgegeben wurde."}</span>
      ${requestOpen ? "" : `<input id="availabilityChangeNote" type="text" placeholder="Grund für Änderung, optional">`}
    </section>
  ` : "");
}

function availabilityIsSubmitted() {
  if (!state.activeEmployee) return false;
  const days = state.availability[state.activeEmployee] || {};
  return Boolean(days.__meta?.submitted) || Object.keys(days).filter((key) => key !== "__meta").length > 0;
}

function hasOpenAvailabilityRequest() {
  return (state.availabilityChangeRequests || []).some((request) => (
    request.employee === state.activeEmployee && request.month === availabilityMonthValue() && request.status === "open"
  ));
}

function collectAvailability() {
  const days = {};
  const fixed = employeeIsFixed(state.activeEmployee);
  $$("#availabilityGrid .day-card").forEach((card) => {
    const active = card.querySelector(".status-row button.active");
    if (!active) return;
    days[card.dataset.date] = {
      status: fixed ? "no" : "yes",
      from: "",
      to: "",
      note: card.querySelector('[data-field="note"]').value.trim()
    };
  });
  return days;
}

function availabilityValidationMessage() {
  if (!employeeIsFixed(state.activeEmployee) || availabilityIsSubmitted()) return "";
  const missing = [];
  $$("#availabilityGrid .day-card").forEach((card) => {
    const active = card.querySelector(".status-row button.active");
    if (!active) return;
    const note = card.querySelector('[data-field="note"]')?.value.trim();
    if (!note) missing.push(card.dataset.date);
  });
  return missing.length ? "Bitte bei jedem markierten Kann-nicht-Tag einen Grund eintragen." : "";
}

function employeeIsFixed(employee) {
  const fixed = new Set((state.settings.fixedEmployees || []).map((name) => String(name).trim().toLowerCase()));
  return fixed.has(String(employee || "").trim().toLowerCase());
}

function renderAssignments() {
  const container = $("#assignmentContent");
  if (!container) return;
  if (!state.activeEmployee) {
    container.innerHTML = `<p class="hint">Bitte mit Mitarbeiter-PIN anmelden.</p>`;
    return;
  }
  const dates = assignmentDateKeys(todayKey());
  container.innerHTML = dates.map((dateKey, index) => assignmentDayHtml(dateKey, index)).join("");
}

function assignmentDateKeys(baseDate) {
  const base = /^\d{4}-\d{2}-\d{2}$/.test(String(baseDate || "")) ? baseDate : todayKey();
  return [base, isoDate(addDays(new Date(`${base}T12:00:00`), 1))];
}

function assignmentScheduleForDate(dateKey) {
  const month = dateKey.slice(0, 7);
  return state.assignmentSchedules?.[dateKey]
    || state.schedules?.[month]?.days?.[dateKey]
    || (dateKey === state.terminalDate ? state.terminalSchedule : null)
    || (state.schedule?.month === month ? state.schedule?.days?.[dateKey] : null)
    || {};
}

function assignmentRowsForDate(dateKey) {
  const scheduleDay = assignmentScheduleForDate(dateKey);
  return (state.settings.positions || [])
    .filter((position) => scheduleDay[position] && assignmentPositionIncluded(position))
    .map((position) => {
      const employee = scheduleDay[position];
      return {
        dateKey,
        position,
        employee,
        time: assignmentTimeForEmployee(dateKey, employee, scheduleDay, position)
      };
    });
}

function assignmentTimeForEmployee(dateKey, employee, scheduleDay = {}, position = "") {
  const direct = state.assignmentTimes?.[dateKey]?.[employee];
  if (direct?.from || direct?.note) return { from: direct.from || "", to: "", note: direct.note || "" };
  return { from: "", to: "", note: "" };
}

function assignmentPositionIncluded(position) {
  const department = departmentForPosition(position);
  return department === "Counter" || department === "Service";
}

function assignmentDayHtml(dateKey, index = 0) {
  const rows = assignmentRowsForDate(dateKey);
  const ownRows = rows.filter((row) => row.employee === state.activeEmployee);
  const title = index === 0 ? "Heute" : "Morgen";
  const holiday = holidayInfo(dateKey);
  return `
    <article class="assignment-day-card ${ownRows.length ? "has-own-assignment" : ""}">
      <div class="assignment-day-head">
        <div>
          <span>${escapeHtml(title)}</span>
          <h3>${escapeHtml(formatLongDate(dateKey))}${holiday.label ? ` · ${escapeHtml(holiday.label)}` : ""}</h3>
        </div>
        ${ownRows.length ? `<strong>Du bist eingeteilt</strong>` : `<strong class="muted">Nicht eingeteilt</strong>`}
      </div>
      <div class="assignment-own-list">
        ${ownRows.length ? ownRows.map(assignmentOwnRowHtml).join("") : `<p class="hint">Für dich ist an diesem Tag aktuell kein Dienst hinterlegt.</p>`}
      </div>
      <div class="assignment-team-list fixed-view">
        <h4>Team-Einteilung</h4>
        <div>
          ${rows.length ? rows.map(assignmentTeamRowHtml).join("") : `<p class="hint">Für diesen Tag ist kein Counter- oder Service-Dienst gefunden.</p>`}
        </div>
      </div>
    </article>
  `;
}

function assignmentOwnRowHtml(row) {
  return `
    <div class="assignment-own-row ${positionClass(row.position)}">
      <span>${escapeHtml(row.position)}</span>
      <strong>${escapeHtml(assignmentTimeText(row.time))}</strong>
      ${row.time?.note ? `<small>${escapeHtml(row.time.note)}</small>` : ""}
    </div>
  `;
}

function assignmentTeamRowHtml(row) {
  return `
    <div class="assignment-team-row">
      <span>${escapeHtml(row.position)}</span>
      <strong>${escapeHtml(row.employee)}</strong>
      <em>${escapeHtml(assignmentTimeText(row.time))}</em>
    </div>
  `;
}

function assignmentTimeText(time = {}) {
  if (time.from) return `ab ${time.from}`;
  return "Startzeit ausstehend";
}

function renderScheduleDay(date, options = {}) {
  const key = isoDate(date);
  const sourceSchedule = options.schedule || state.schedule;
  const assignments = sourceSchedule && sourceSchedule.days && sourceSchedule.days[key] ? sourceSchedule.days[key] : {};
  const holiday = holidayInfo(key);
  const filled = state.settings.positions.filter((position) => assignments[position]);
  const visiblePositions = state.settings.positions.filter((position) => assignments[position]);
  const ownShiftCount = state.activeEmployee
    ? filled.filter((position) => assignments[position] === state.activeEmployee).length
    : 0;
  const cells = visiblePositions.map((position) => {
    const assignedEmployee = assignments[position] || "";
    const ownShift = Boolean(state.activeEmployee && assignedEmployee === state.activeEmployee && !state.adminUnlocked);
    return `
          <div class="position-cell ${positionClass(position)} ${assignedEmployee ? "filled" : ""} ${ownShift ? "own-shift clickable-shift" : ""}"
            ${ownShift ? `data-request-swap-date="${key}" data-request-swap-position="${escapeHtml(position)}"` : ""}>
            <span class="position-name">${escapeHtml(position)}</span>
            <span class="assignment">${escapeHtml(assignedEmployee)}</span>
            ${ownShift ? `<span class="assignment-note">Zum Diensttausch anklicken</span>` : ""}
          </div>
        `;
  });
  if (options.today) {
    cells.push(`<div class="position-cell weather-cell" data-weather-widget>Wetter wird geladen...</div>`);
  }
  const content = `
      <div class="day-header ${holiday.className}">
          <span class="day-date-with-badge">${formatDate(key)}${holiday.label ? `<span class="day-badge holiday-inline">${escapeHtml(holiday.label)}</span>` : ""}</span>
          <span class="day-header-meta">
            ${options.today ? `<span class="opening-hours-inline">Geöffnet: ${openingHoursFor(key)}</span>` : ""}
          </span>
        </div>
      <div class="position-grid">
        ${cells.join("")}
      </div>
      ${options.today && filled.length === 0 ? `<div class="published-day-note">Es ist niemand eingeteilt.</div>` : ""}
      ${assignments.__dayNote ? `<div class="published-day-note">Tagesnotiz: ${escapeHtml(assignments.__dayNote)}</div>` : ""}
  `;
  if (options.collapsible) {
    return `
      <details class="schedule-day ${options.today ? "today-summary" : ""}">
        <summary class="day-header ${holiday.className} ${ownShiftCount ? "has-own-assignment" : ""}">
          <span class="day-date-with-badge">${formatDate(key)}${holiday.label ? `<span class="day-badge holiday-inline">${escapeHtml(holiday.label)}</span>` : ""}</span>
          <span class="day-header-meta">
            ${ownShiftCount ? `<span class="own-assignment-indicator"><i></i>Eingeteilt</span>` : ""}
          </span>
        </summary>
        <div class="position-grid">
          ${cells.join("")}
        </div>
        ${filled.length === 0 ? `<div class="published-day-note">Es ist niemand eingeteilt.</div>` : ""}
        ${assignments.__dayNote ? `<div class="published-day-note">Tagesnotiz: ${escapeHtml(assignments.__dayNote)}</div>` : ""}
      </details>
    `;
  }
  return `
      <article class="schedule-day ${options.today ? "today-summary" : ""}">
        ${content}
    </article>
  `;
}

function isOptionalServiceSlot(position) {
  return /^Service\s+[2-5]$/i.test(String(position || "").trim());
}

function weekStartKey(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return isoDate(date);
}

function renderPublished() {
  const schedule = state.schedule;
  const container = $("#publishedSchedule");
  renderPublishedMonths();
  if (!schedule || !schedule.published) {
    $("#publishedState").textContent = "Für diesen Monat wurde noch kein Dienstplan veröffentlicht.";
    container.innerHTML = "";
    return;
  }
  $("#publishedState").textContent = `Aktualisiert: ${new Date(schedule.updatedAt).toLocaleString("de-DE")}`;
  container.innerHTML = renderPublishedWeekSections(state.selectedMonth);
}

function renderSwaps() {
  const login = $("#swapLogin");
  if (!login) return;
  const loggedIn = Boolean(state.activeEmployee);
  login.classList.toggle("hidden", loggedIn);
  $("#swapActive").classList.toggle("hidden", !loggedIn);
  $("#swapEmployeeName").textContent = loggedIn ? state.activeEmployee : "";
  renderMySwapShifts();
  renderOpenSwaps();
}

function renderMySwapShifts() {
  const container = $("#swapMyShifts");
  if (!container) return;
  if (!state.activeEmployee) {
    container.innerHTML = `<p class="hint">PIN eingeben, um für eigene Dienste Ersatz zu suchen.</p>`;
    return;
  }
  const shifts = state.swaps.myShifts || [];
  if (!shifts.length) {
    container.innerHTML = `<p class="hint">Für diesen Monat sind keine eigenen veröffentlichten Dienste gefunden.</p>`;
    return;
  }
  container.innerHTML = shifts.map((shift) => {
    const alreadyOpen = (state.swaps.open || []).some((swap) => (
      swap.date === shift.date && swap.position === shift.position && swap.employee === state.activeEmployee
    ));
    return `
      <article class="swap-card">
        <div>
          <strong>${formatDate(shift.date)}</strong>
          <span>${escapeHtml(shift.position)}</span>
        </div>
        <input type="text" data-swap-note="${shift.date}|${escapeHtml(shift.position)}" placeholder="Grund/Notiz, optional">
        <button class="secondary" data-offer-swap-date="${shift.date}" data-offer-swap-position="${escapeHtml(shift.position)}" ${alreadyOpen ? "disabled" : ""}>
          ${alreadyOpen ? "Bereits angefragt" : "Ersatz suchen"}
        </button>
      </article>
    `;
  }).join("");
}

function renderOpenSwaps() {
  const container = $("#swapOpenList");
  if (!container) return;
  const swaps = state.swaps.open || [];
  if (!swaps.length) {
    container.innerHTML = `<p class="hint">Aktuell gibt es keine offenen Ersatzanfragen.</p>`;
    return;
  }
  container.innerHTML = swaps.map((swap) => {
    const own = swap.employee === state.activeEmployee;
    const alreadyClaimed = swap.responses.some((item) => item.employee === state.activeEmployee);
    return `
      <article class="swap-card ${own ? "own-swap" : ""}">
        <div>
          <strong>${formatDate(swap.date)} | ${escapeHtml(swap.position)}</strong>
          <span>${escapeHtml(swap.employee)} sucht Ersatz${swap.note ? `: ${escapeHtml(swap.note)}` : ""}</span>
        </div>
        ${swap.responses.length ? `<p class="hint">Gemeldet: ${swap.responses.map((item) => escapeHtml(item.employee)).join(", ")}</p>` : `<p class="hint">Noch kein Ersatz gemeldet.</p>`}
        ${state.activeEmployee && !own ? `
          <input type="text" data-claim-note="${swap.id}" placeholder="Notiz, optional">
          <button class="primary" data-claim-swap="${swap.id}" ${alreadyClaimed ? "disabled" : ""}>${alreadyClaimed ? "Du bist gemeldet" : "Ich kann einspringen"}</button>
        ` : ""}
        ${own ? `<button class="secondary" data-cancel-swap="${swap.id}">Zurueckziehen</button>` : ""}
      </article>
    `;
  }).join("");
}

function renderHomeSwaps() {
  const swaps = (state.swaps.open || []).filter((swap) => swap.status === "open");
  if (!swaps.length) return "";
  return `
    <section class="missing-section home-swaps">
      <h2>Offene Ersatzanfragen</h2>
      <div class="swap-list">${swaps.slice(0, 6).map((swap) => `
            <article class="swap-card compact-swap-card clickable-card" data-open-swaps>
              <strong>${formatDate(swap.date)} | ${escapeHtml(swap.position)}</strong>
              <span>${escapeHtml(swap.employee)} sucht Ersatz${swap.responses.length ? `, ${swap.responses.length} gemeldet` : ""}</span>
              <button class="primary" type="button">Öffnen</button>
            </article>
          `).join("")}</div>
    </section>
  `;
}

function renderAdminSwaps() {
  const container = $("#adminSwapList");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-PIN eingeben, um Ersatz freizugeben.</p>`;
    return;
  }
  const swaps = state.swaps.admin || [];
  if (!swaps.length) {
    container.innerHTML = `<p class="hint">Keine offenen Ersatzanfragen.</p>`;
    return;
  }
  container.innerHTML = swaps.map((swap) => `
    <article class="swap-card admin-swap-card">
      <div>
        <strong>${formatDate(swap.date)} | ${escapeHtml(swap.position)}</strong>
        <span>${escapeHtml(swap.employee)} moechte abgeben${swap.note ? `: ${escapeHtml(swap.note)}` : ""}</span>
      </div>
      ${swap.responses.length
        ? `<select data-admin-replacement="${swap.id}">
            ${swap.responses.map((item) => `<option value="${escapeHtml(item.employee)}">${escapeHtml(item.employee)}${item.note ? ` - ${escapeHtml(item.note)}` : ""}</option>`).join("")}
          </select>
          <button class="primary" data-approve-swap="${swap.id}">Ersatz bestätigen</button>`
        : `<p class="hint">Noch niemand hat sich gemeldet.</p>`}
    </article>
  `).join("");
}

function renderAdminAvailabilityRequests() {
  const container = $("#adminAvailabilityRequests");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-PIN eingeben, um Änderungen freizugeben.</p>`;
    return;
  }
  const requests = (state.availabilityChangeRequests || []).filter((request) => request.status === "open");
  if (!requests.length) {
    container.innerHTML = `<p class="hint">Keine offenen Änderungsanfragen.</p>`;
    return;
  }
  container.innerHTML = requests.map((request) => `
    <article class="swap-card admin-swap-card">
      <div>
        <strong>${escapeHtml(request.employee)} | ${formatMonth(request.month)}</strong>
        <span>${request.note ? escapeHtml(request.note) : "möchte Verfügbarkeit nochmal bearbeiten"}</span>
      </div>
        <button class="primary" data-approve-availability="${request.id}">Änderung freigeben</button>
    </article>
  `).join("");
}

function renderAdminMessages() {
  const container = $("#adminMessagesList");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  const messages = state.messages || [];
  container.innerHTML = messages.length ? messages.map((message) => `
    <article class="swap-card admin-swap-card">
      <div>
        <strong>${escapeHtml(messageTargetLabel(message))}</strong>
        <span>${escapeHtml(message.text)}</span>
        <p class="hint">${message.createdAt ? formatDateTime(message.createdAt) : ""}</p>
        <p class="hint">${escapeHtml(messageReadStatusText(message))}</p>
      </div>
      <button class="secondary" data-delete-message="${escapeHtml(message.id)}" type="button">Löschen</button>
    </article>
  `).join("") : `<p class="hint">Keine Nachrichten aktiv.</p>`;
}

function renderMessageEmployeePicker() {
  const picker = $("#messageEmployeePicker");
  if (!picker) return;
  const target = $("#messageTarget")?.value || "all";
  picker.classList.toggle("hidden", target !== "employees");
  if (target !== "employees") {
    picker.innerHTML = "";
    return;
  }
  const employees = state.settings?.employees || [];
  picker.innerHTML = employees.length
    ? employees.map((employee) => `
      <label>
        <input type="checkbox" value="${escapeHtml(employee)}" data-message-employee>
        ${escapeHtml(employee)}
      </label>
    `).join("")
    : `<p class="hint">Keine Mitarbeiter angelegt.</p>`;
}

function selectedMessageEmployees() {
  return $$("[data-message-employee]:checked").map((input) => input.value).filter(Boolean);
}

function renderAdminPushControls() {
  const settings = {
    ...defaultData.settings.pushSettings,
    ...(state.settings?.pushSettings || {})
  };
  if ($("#pushAutoSchedule")) $("#pushAutoSchedule").checked = settings.schedulePublished !== false;
  if ($("#pushAutoAssignment")) $("#pushAutoAssignment").checked = settings.assignmentsTomorrow !== false;
  if ($("#pushAutoMessages")) $("#pushAutoMessages").checked = settings.messages !== false;
  if ($("#pushScheduleTitle")) $("#pushScheduleTitle").value = settings.schedulePublishedTitle || "";
  if ($("#pushScheduleBody")) $("#pushScheduleBody").value = settings.schedulePublishedBody || "";
  if ($("#pushAssignmentTitle")) $("#pushAssignmentTitle").value = settings.assignmentsTomorrowTitle || "";
  if ($("#pushAssignmentBody")) $("#pushAssignmentBody").value = settings.assignmentsTomorrowBody || "";
  if ($("#pushMessagesTitle")) $("#pushMessagesTitle").value = settings.messagesTitle || "";
  if ($("#pushMessagesBody")) $("#pushMessagesBody").value = settings.messagesBody || "";
  renderPushEmployeePicker();
}

function renderPushEmployeePicker() {
  const picker = $("#pushEmployeePicker");
  if (!picker) return;
  const target = $("#pushTarget")?.value || "all";
  picker.classList.toggle("hidden", target !== "employees");
  if (target !== "employees") {
    picker.innerHTML = "";
    return;
  }
  const employees = state.settings?.employees || [];
  picker.innerHTML = employees.length
    ? employees.map((employee) => `
      <label>
        <input type="checkbox" value="${escapeHtml(employee)}" data-push-employee>
        ${escapeHtml(employee)}
      </label>
    `).join("")
    : `<p class="hint">Keine Mitarbeiter angelegt.</p>`;
}

function selectedPushEmployees() {
  return $$("[data-push-employee]:checked").map((input) => input.value).filter(Boolean);
}

function pushResultText(result = {}) {
  if (result.skipped && result.reason === "missing-vapid") return "Push konnte nicht senden: VAPID-Schlüssel fehlen in Vercel.";
  if (result.skipped && result.reason === "web-push-missing") return "Push konnte nicht senden: Server-Paket web-push ist noch nicht installiert.";
  const sent = Number(result.sent || 0);
  const removed = Number(result.removed || 0);
  if (!sent && removed) return `Kein aktives Gerät erreicht. ${removed} alte Registrierung(en) wurden entfernt.`;
  if (!sent) return "Kein aktives Handy für diese Empfänger registriert.";
  return `Push gesendet: ${sent} Gerät(e).${removed ? ` ${removed} alte Registrierung(en) entfernt.` : ""}`;
}

function messageReadStatusText(message = {}) {
  const recipients = messageRecipientsClient(message);
  const total = recipients.length;
  const read = Object.keys(message.readBy || {}).filter((employee) => !recipients.length || recipients.includes(employee)).length;
  if (!total) return "Keine Empfänger hinterlegt.";
  return `Gelesen: ${read}/${total}`;
}

function renderAdminTerminalMessages() {
  const container = $("#adminTerminalMessagesList");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  const messages = state.terminalMessages || [];
  container.innerHTML = messages.length ? messages.map((message) => `
    <article class="swap-card admin-swap-card">
      <div>
        <strong>Terminal / Schichtleitung</strong>
        <span>${escapeHtml(message.text)}</span>
        <p class="hint">${message.acknowledgedAt ? `Quittiert${message.acknowledgedBy ? ` von ${escapeHtml(message.acknowledgedBy)}` : ""} am ${escapeHtml(formatDateTime(message.acknowledgedAt))}` : `Offen${message.createdAt ? ` seit ${escapeHtml(formatDateTime(message.createdAt))}` : ""}`}</p>
      </div>
      <button class="secondary" data-delete-terminal-message="${escapeHtml(message.id)}" type="button">Löschen</button>
    </article>
  `).join("") : `<p class="hint">Keine Terminal-Nachrichten aktiv.</p>`;
}

function renderAdminTasks() {
  const container = $("#adminTaskList");
  if (!container) return;
  if (!state.adminUnlocked) {
    $$("#prepTaskTable, #runningTaskTable, #closingTaskTable").forEach((target) => {
      target.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    });
    return;
  }
  fillWeekdaySelects();
  updatePrepClosingTaskFields();
  updateRunningTaskFields();
  if ($("#taskCalendarMonth") && !$("#taskCalendarMonth").value) $("#taskCalendarMonth").value = state.selectedMonth;
  if ($("#calendarTaskDate") && !$("#calendarTaskDate").value) $("#calendarTaskDate").value = todayKey();
  const tasks = sortTaskTemplates(state.taskTemplates || []);
  renderTaskTable("#prepTaskTable", tasks.filter((task) => task.category === "preparation"));
  renderTaskTable("#runningTaskTable", tasks.filter((task) => (task.category || "running") === "running"));
  renderTaskTable("#closingTaskTable", tasks.filter((task) => task.category === "closing"));
  renderTaskCalendar();
}

function renderAdminCleaningTasks() {
  const container = $("#adminCleaningTaskTable");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  fillCleaningWeekdaySelect();
  updateCleaningTaskFields();
  const tasks = normalizeCleaningTemplates(state.cleaningTemplates);
  if (!tasks.length) {
    container.innerHTML = `<p class="hint">Keine Reinigungsaufgaben angelegt.</p>`;
    return;
  }
  container.innerHTML = `
    <div class="admin-task-row admin-task-row-head">
      <span>Aufgabe</span><span>Status</span><span>Notiz</span><span></span>
    </div>
    ${tasks.map((task) => `
      <div class="admin-task-row">
        <span><strong>${escapeHtml(task.title)}</strong></span>
        <span>${escapeHtml(cleaningFrequencyLabel(task))}</span>
        <span>${task.note ? escapeHtml(task.note) : "-"}</span>
        <button class="secondary" data-delete-cleaning-task="${escapeHtml(task.id)}" type="button">Löschen</button>
      </div>
    `).join("")}
  `;
}

function fillCleaningWeekdaySelect() {
  const select = $("#cleaningTaskWeekday");
  if (!select || select.options.length) return;
  select.innerHTML = weekdays.map((day, index) => `<option value="${index}">${day}</option>`).join("");
  select.value = "1";
}

function updateCleaningTaskFields() {
  $("#cleaningWeekdayField")?.classList.add("hidden");
}

function cleaningFrequencyLabel(task) {
  return "Wöchentlich offen bis erledigt";
}

function setCalendarTaskDate(dateKey) {
  const dateInput = $("#calendarTaskDate");
  if (dateInput) dateInput.value = dateKey;
  const popupDate = $("#calendarTaskPopupDate");
  if (popupDate) popupDate.textContent = formatDate(dateKey);
}

function openCalendarTaskPopup(dateKey) {
  setCalendarTaskDate(dateKey);
  updateCalendarPopupFields();
  $("#calendarTaskPopup")?.classList.remove("hidden");
  window.setTimeout(() => $("#calendarTaskTitle")?.focus(), 30);
}

function closeCalendarTaskPopup() {
  $("#calendarTaskPopup")?.classList.add("hidden");
}

function updateCalendarPopupFields() {
  const enabled = Boolean($("#calendarTaskPopupEnabled")?.checked);
  $("#calendarTaskPopupTimeField")?.classList.toggle("hidden", !enabled);
}

function renderTaskCalendar() {
  const target = $("#adminTaskCalendar");
  if (!target) return;
  const month = $("#taskCalendarMonth")?.value || state.selectedMonth;
  const weeks = calendarWeeksForMonth(month);
  target.innerHTML = `
    <div class="admin-calendar-weekdays">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => `<span>${day}</span>`).join("")}</div>
    <div class="admin-calendar-grid">
      ${weeks.map((week) => week.map((day) => calendarDayHtml(day)).join("")).join("")}
    </div>
  `;
}

function calendarWeeksForMonth(month) {
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1, 12);
  const last = new Date(year, monthIndex, 0, 12);
  const start = weekStart(first);
  const end = weekEnd(last);
  const weeks = [];
  let week = [];
  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 1)) {
    const date = new Date(cursor);
    week.push({ date, inMonth: date.getMonth() === monthIndex - 1 });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  return weeks;
}

function calendarDayHtml(day) {
  const date = day.date;
  const dateKey = isoDate(date);
  const tasks = sortTaskTemplates(state.taskTemplates || [])
    .filter((task) => (task.category || "running") === "running" && taskAppliesToDate(task, dateKey));
  const holiday = holidayInfo(dateKey);
  const selected = ($("#calendarTaskDate")?.value || todayKey()) === dateKey;
  const today = todayKey() === dateKey;
  const weekend = [0, 6].includes(date.getDay());
  const classes = [
    "admin-calendar-day",
    day.inMonth ? "" : "is-outside-month",
    weekend ? "is-weekend" : "",
    today ? "is-today" : "",
    selected ? "selected" : "",
    holiday.className ? `is-${holiday.className}` : ""
  ].filter(Boolean).join(" ");
  return `
    <article class="${classes}" data-calendar-date="${dateKey}" data-calendar-in-month="${day.inMonth ? "true" : "false"}">
      <div class="admin-calendar-date-head">
        <strong>${escapeHtml(weekdays[date.getDay()])} ${formatShortDate(date)}</strong>
        ${today ? `<span>Heute</span>` : ""}
      </div>
      <div class="admin-calendar-tags">
        ${holiday.label ? `<b class="calendar-special-badge ${escapeHtml(holiday.className)}">${escapeHtml(holiday.label)}</b>` : ""}
        ${weekend ? `<b class="calendar-special-badge weekend">Wochenende</b>` : ""}
      </div>
      ${tasks.map((task) => `
        <span class="calendar-task calendar-${task.category || "running"} ${task.popupEnabled && task.popupTime ? "has-popup" : ""}">
          <span class="calendar-task-title">${escapeHtml(task.title)}</span>
          ${task.popupEnabled && task.popupTime ? `<span class="calendar-popup-badge">Popup ${escapeHtml(task.popupTime)}</span>` : ""}
          <button type="button" aria-label="Eintrag löschen" data-calendar-delete-task="${escapeHtml(task.id)}">×</button>
        </span>
      `).join("")}
    </article>
  `;
}

function taskAppliesToDate(task, dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  if (task.frequency === "daily") return true;
  if (task.frequency === "weekly") return (task.weekdays || []).map(Number).includes(date.getDay());
  if (task.frequency === "monthly") return Number(task.dayOfMonth || 1) === date.getDate();
  if (task.frequency === "interval") return intervalAppliesToDate(task, dateKey);
  return task.date === dateKey;
}

function intervalAppliesToDate(task, dateKey) {
  const startKey = task.startDate || task.date;
  if (!startKey) return false;
  if (dateKey < startKey) return false;
  if (task.endDate && dateKey > task.endDate) return false;
  const start = new Date(`${startKey}T12:00:00`);
  const date = new Date(`${dateKey}T12:00:00`);
  const diffDays = Math.round((date - start) / 86400000);
  const interval = Math.max(1, Number(task.intervalDays || 1));
  return diffDays >= 0 && diffDays % interval === 0;
}

function renderAdminReminders() {
  const target = $("#adminReminderList");
  if (!target) return;
  const reminders = state.reminderTemplates || [];
  target.innerHTML = reminders.length ? `
    <div class="admin-task-row admin-task-row-head"><span>Text</span><span>Start</span><span>Intervall</span><span></span></div>
    ${reminders.map((reminder) => `
      <div class="admin-task-row">
        <strong>${escapeHtml(reminder.text)}</strong>
        <span>${Number(reminder.startAfterOpeningMinutes || 0)} Min. nach Öffnung</span>
        <span>${Number(reminder.intervalMinutes || 60)} Min. ${reminder.active === false ? "(inaktiv)" : ""}</span>
        <button class="secondary" data-delete-reminder="${escapeHtml(reminder.id)}" type="button">Löschen</button>
      </div>
    `).join("")}
  ` : `<p class="hint">Keine Popup-Erinnerungen eingetragen.</p>`;
}

function fillWeekdaySelects() {
  const options = [1, 2, 3, 4, 5, 6, 0].map((day) => `<option value="${day}">${weekdays[day]}</option>`).join("");
  ["#prepTaskWeekday", "#runningTaskWeekday", "#closingTaskWeekday"].forEach((selector) => {
    const select = $(selector);
    if (select && !select.innerHTML) select.innerHTML = options;
  });
}

function renderTaskTable(selector, tasks) {
  const target = $(selector);
  if (!target) return;
  const sortedTasks = sortTaskTemplates(tasks || []);
  target.innerHTML = sortedTasks.length ? `
    <div class="admin-task-row admin-task-row-head">
      <span>Aufgabe</span>
      <span>Wann</span>
      <span>Notiz</span>
      <span></span>
    </div>
    ${sortedTasks.map((task) => `
      <div class="admin-task-row">
        <strong>${escapeHtml(task.title)}</strong>
        <span>${escapeHtml(taskFrequencyLabel(task).replace(`${taskCategoryLabel(task.category)} | `, ""))}</span>
        <span>${task.note ? escapeHtml(task.note) : "-"}</span>
        <button class="secondary" data-delete-task="${escapeHtml(task.id)}" type="button">Löschen</button>
      </div>
    `).join("")}
  ` : `<p class="hint">Noch keine Aufgaben eingetragen.</p>`;
}

function sortTaskTemplates(tasks = []) {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const aTime = Date.parse(a.task.createdAt || "") || 0;
      const bTime = Date.parse(b.task.createdAt || "") || 0;
      if (aTime !== bTime) return aTime - bTime;
      return a.index - b.index;
    })
    .map(({ task }) => task);
}

function updateRunningTaskFields() {
  const frequency = $("#runningTaskFrequency")?.value || "daily";
  $("#runningWeekdayField")?.classList.toggle("hidden", frequency !== "weekly");
  $("#runningMonthdayField")?.classList.toggle("hidden", frequency !== "monthly");
  $("#runningIntervalField")?.classList.toggle("hidden", frequency !== "interval");
  $("#runningDateField")?.classList.toggle("hidden", !["once", "next-day", "interval"].includes(frequency));
  $("#runningEndDateField")?.classList.toggle("hidden", frequency !== "interval");
}

function updatePrepClosingTaskFields() {
  $("#prepWeekdayField")?.classList.toggle("hidden", ($("#prepTaskFrequency")?.value || "daily") !== "weekly");
  $("#closingWeekdayField")?.classList.toggle("hidden", ($("#closingTaskFrequency")?.value || "daily") !== "weekly");
}

function renderAdminAvailabilityPreview() {
  const container = $("#adminAvailabilityPreview");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  const availabilityMonth = availabilityMonthValue();
  const dates = datesInMonth(availabilityMonth);
  const employees = state.settings.employees || [];
  const cards = dates.map((date) => {
    const dateKey = isoDate(date);
    const available = employees.filter((employee) => state.availability?.[employee]?.[dateKey]?.status === "yes");
    const unavailable = employees
      .map((employee) => ({ employee, day: state.availability?.[employee]?.[dateKey] }))
      .filter((entry) => entry.day?.status === "no");
    const cardClass = available.length ? "has-availability" : (unavailable.length ? "has-unavailable" : "");
    return `
      <article class="availability-preview-card ${cardClass}">
        <strong>${formatShortDate(date)}</strong>
        <span>${weekdays[date.getDay()]}</span>
        <p>${available.length ? `Kann: ${escapeHtml(available.join(", "))}` : "Keine Zusagen"}</p>
        ${unavailable.length ? `<p class="availability-cannot-line">Kann nicht: ${unavailable.map((entry) => `${escapeHtml(entry.employee)}${entry.day.note ? ` (${escapeHtml(entry.day.note)})` : ""}`).join(", ")}</p>` : ""}
      </article>
    `;
  }).join("");
  container.innerHTML = `
    <div class="availability-preview-head">
      <strong>${formatMonth(availabilityMonth)}</strong>
      <span>${employees.length} Mitarbeiter</span>
    </div>
    <div class="availability-preview-grid">${cards}</div>
  `;
}

function renderAdminCorrection() {
  const dateInput = $("#correctionDate");
  if (!dateInput) return;
  if (!dateInput.value) dateInput.value = yesterdayKey();
  const status = $("#correctionStatus");
  if (!status || status.textContent) return;
  status.textContent = "Datum wählen, Grund eintragen und Bericht gezielt zur Korrektur öffnen.";
}

function renderMissingAvailability() {
  const missing = state.missingAvailability || [];
  return `
    <section class="missing-section">
      <h2>Fehlende Verfügbarkeit für ${formatMonth(availabilityMonthValue())}</h2>
      ${missing.length
        ? `<div class="missing-list">${missing.map((name) => `<span>${escapeHtml(name)}</span>`).join("")}</div>`
        : `<p>Alle haben ihre Verfügbarkeit abgegeben.</p>`}
    </section>
  `;
}

function renderWeather() {
  const targets = $$("[data-weather-widget]");
  if (!targets.length) return;
  if (!state.weather) {
    targets.forEach((target) => {
      target.textContent = "Wetterbericht wird geladen...";
    });
    return;
  }
  if (state.weather.error) {
    targets.forEach((target) => {
      target.innerHTML = `
        <span class="position-name">Wetterbericht</span>
        <span class="assignment">Wird aktualisiert...</span>
        <span class="assignment-note">Verbindung wird erneut aufgebaut.</span>
      `;
    });
    window.setTimeout(() => {
      state.weather = null;
      loadWeather().catch(() => {});
    }, 1200);
    return;
  }
  const daily = state.weather.daily || {};
  const current = state.weather.current || {};
  const hourly = state.weather.hourly || [];
  targets.forEach((target) => {
    target.innerHTML = `
      <span class="position-name">Wetterbericht</span>
      <span class="assignment">${weatherText(daily.weatherCode)}</span>
      <span class="assignment-note">Jetzt ${roundValue(current.temperature_2m)} C, Wind ${roundValue(current.wind_speed_10m)} km/h</span>
      <span class="assignment-note">Heute ${roundValue(daily.tempMin)}-${roundValue(daily.tempMax)} C, Regen ${roundValue(daily.precipitation)} mm</span>
      ${hourly.length ? weatherHourlyHtml(hourly) : ""}
      <span class="hint">${escapeHtml(state.weather.location || "Roentgenstrasse 12, 84034 Landshut")}</span>
    `;
  });
}

function weatherHourlyHtml(items = []) {
  return `
    <div class="weather-hourly">
      ${items.map((item) => `
        <span>
          <strong>${escapeHtml(weatherHourLabel(item.time))}</strong>
          <small>${roundValue(item.temperature)} C</small>
          <small>${roundValue(item.rainProbability)}% Regen</small>
        </span>
      `).join("")}
    </div>
  `;
}

function weatherHourLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function roundValue(value) {
  return value == null ? "-" : Math.round(Number(value));
}

function weatherText(code) {
  const map = {
    0: "Klar",
    1: "Ueberwiegend klar",
    2: "Teilweise bewoelkt",
    3: "Bewoelkt",
    45: "Nebel",
    48: "Reifnebel",
    51: "Leichter Nieselregen",
    53: "Nieselregen",
    55: "Starker Nieselregen",
    61: "Leichter Regen",
    63: "Regen",
    65: "Starker Regen",
    71: "Leichter Schnee",
    73: "Schnee",
    75: "Starker Schnee",
    80: "Leichte Schauer",
    81: "Schauer",
    82: "Starke Schauer",
    95: "Gewitter"
  };
  return map[code] || "Wetter";
}
function renderPublishedMonths() {
  const months = Object.entries(state.allSchedules || {})
    .filter(([, schedule]) => schedule && schedule.published)
    .map(([month]) => month)
    .sort();
  $("#publishedMonths").innerHTML = months.length
    ? months.map((month) => `<button class="month-pill ${month === state.selectedMonth ? "active" : ""}" data-month="${month}">${formatMonth(month)}</button>`).join("")
    : "";
}

function renderTimesheet() {
  const summary = $("#timesheetSummary");
  const grid = $("#timesheetGrid");
  if (!summary || !grid) return;
  if (!state.activeEmployee) {
    summary.innerHTML = `<p class="hint">Bitte anmelden, um Stunden zu erfassen.</p>`;
    grid.innerHTML = "";
    return;
  }
  const entries = state.timesheets[state.activeEmployee] || {};
  const shiftDates = completedTimesheetDates(state.activeEmployee, state.selectedMonth);
  const totals = timesheetTotals();
  const rows = shiftDates.map((dateKey) => {
    const entry = entries[dateKey] || {};
    const hours = paidHours(entry);
    const hasTip = entry.tip !== "" && entry.tip != null && Number(entry.tip || 0) > 0;
    const tipSource = entry.tipSource === "terminal-distribution" ? "aus Tagesabschluss" : "manuell erfasst";
    return `
      <article class="timesheet-row" data-date="${dateKey}">
        <div>
          <strong>${formatDate(dateKey)}</strong>
          <span>${escapeHtml(dayReportShiftText(entry))} · ${formatHours(hours)}</span>
        </div>
        <div class="timesheet-tip-display">
          <span>Trinkgeld</span>
          <strong>${hasTip ? formatMoney(entry.tip) : "Noch nicht verteilt"}</strong>
          <small>${hasTip ? escapeHtml(tipSource) : "erscheint nach dem Tagesabschluss"}</small>
        </div>
      </article>
    `;
  }).join("");
  summary.innerHTML = `
    <article><span>Aktuelle Stunden</span><strong>${formatHours(totals.hours)}</strong></article>
    <article><span>Trinkgeld</span><strong>${formatMoney(totals.tip)}</strong></article>
  `;
  grid.innerHTML = rows || `<p class="hint">Abgeschlossene Dienste erscheinen hier erst nach Dienstende.</p>`;
}

function completedTimesheetDates(employee, month) {
  const entries = state.timesheets?.[employee] || {};
  return Object.entries(entries)
    .filter(([dateKey, entry]) => dateKey.startsWith(month) && entryHasCompletedTime(entry))
    .map(([dateKey]) => dateKey)
    .sort();
}

function employeeShiftDates(employee, month) {
  const schedule = state.allSchedules[month] || state.schedule || {};
  const days = schedule.days || {};
  return Object.keys(days)
    .filter((dateKey) => dateKey.startsWith(month))
    .filter((dateKey) => {
      if (schedule.publishedWeeks && !schedule.publishedWeeks[isoDate(weekStart(new Date(`${dateKey}T12:00:00`)))]) return false;
      return Object.entries(days[dateKey] || {}).some(([key, value]) => !key.includes("__") && value === employee);
    })
    .sort();
}

function timesheetTotals() {
  const entries = state.activeEmployee ? (state.timesheets[state.activeEmployee] || {}) : {};
  return Object.entries(entries).reduce((totals, [dateKey, entry]) => {
    if (!dateKey.startsWith(state.selectedMonth)) return totals;
    totals.hours += paidHours(entry);
    totals.tip += Number(entry.tip || 0);
    return totals;
  }, { hours: 0, tip: 0 });
}

function hoursBetween(from, to) {
  if (!from || !to) return 0;
  return minutesBetween(from, to) / 60;
}

function minutesBetween(from, to) {
  if (!from || !to) return 0;
  const [fromH, fromM] = String(from).split(":").map(Number);
  const [toH, toM] = String(to).split(":").map(Number);
  if (![fromH, fromM, toH, toM].every(Number.isFinite)) return 0;
  let start = fromH * 60 + fromM;
  let end = toH * 60 + toM;
  if (end < start) end += 24 * 60;
  return Math.max(0, end - start);
}

function paidHours(entry = {}) {
  const segments = timeSegments(entry);
  if (!segments.length) return hoursBetween(entry.from, entry.to);
  return segments.reduce((sum, segment) => sum + hoursBetween(segment.from, segment.to), 0);
}

function timeSegments(entry = {}) {
  const segments = Array.isArray(entry.segments) ? entry.segments : [];
  const normalized = segments.map((segment) => ({
    from: String(segment?.from || "").trim(),
    to: String(segment?.to || "").trim()
  })).filter((segment) => segment.from || segment.to);
  if (normalized.length) return normalized;
  return entry.from || entry.to ? [{ from: entry.from || "", to: entry.to || "" }] : [];
}

function timeSegmentsForEdit(entry = {}) {
  const segments = timeSegments(entry);
  return segments.length ? segments : [{ from: "", to: "" }];
}

function entryHasAnyTime(entry = {}) {
  return timeSegments(entry).some((segment) => segment.from || segment.to);
}

function entryHasCompletedTime(entry = {}) {
  return timeSegments(entry).some((segment) => segment.from && segment.to);
}

function formatHours(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")} h`;
}

function formatMoney(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")} Euro`;
}

function formatReportMoney(value) {
  if (value === "" || value == null) return "-";
  return formatMoney(value);
}

function parseMoneyInput(value) {
  const number = Number(String(value || "").replace(",", ".").trim());
  return Number.isFinite(number) ? number : 0;
}

function ecInputValue(selector, reportKey) {
  const field = $(selector);
  if (field) return field.value;
  return state.terminalReport?.[reportKey] || "";
}

function ecTotalFromFormOrReport() {
  const terminal1 = ecInputValue("#reportEcTerminal1", "ecTerminal1");
  const terminal2 = ecInputValue("#reportEcTerminal2", "ecTerminal2");
  if (String(terminal1 || terminal2).trim()) {
    return parseMoneyInput(terminal1) + parseMoneyInput(terminal2);
  }
  return parseMoneyInput(state.terminalReport?.ecTotal || $("#reportEcTotal")?.value || "");
}

function updateEcTotalField() {
  const field = $("#reportEcTotal");
  if (!field) return;
  field.value = ecTotalFromFormOrReport().toFixed(2).replace(".", ",");
}

function gastroRevenueFromFormOrReport(report = state.terminalReport || {}) {
  const drinks = parseMoneyInput($("#reportRevenueDrinks")?.value || report.revenueDrinks || "");
  const food = parseMoneyInput($("#reportRevenueFood")?.value || report.revenueFood || "");
  const other = parseMoneyInput($("#reportRevenueOther")?.value || report.revenueOther || "");
  const split = drinks + food + other;
  return split || parseMoneyInput($("#reportRevenueGastro")?.value || report.revenueGastro || report.barGastro || "");
}

function updateGastroTotalField() {
  const field = $("#reportRevenueGastro");
  if (!field) return;
  field.value = gastroRevenueFromFormOrReport().toFixed(2).replace(".", ",");
}

function cashExpensesFromFormOrReport(report = state.terminalReport || {}) {
  const field = $("#reportCashExpenses");
  if (field && String(field.value || "").trim()) return parseMoneyInput(field.value);
  if (report.cashExpenses !== "" && report.cashExpenses != null) return reportMoneyNumber(report.cashExpenses);
  return reportItemsTotal(report.expenses || []);
}

function expenseRowsTotalFromDom() {
  return $$("#expensesList [data-report-entry='expense']").reduce((sum, row) => {
    return sum + parseMoneyInput(row.querySelector("[data-report-field='amount']")?.value || "");
  }, 0);
}

function syncCashExpensesFromExpenseRows(force = false) {
  const field = $("#reportCashExpenses");
  if (!field) return;
  const total = expenseRowsTotalFromDom();
  if (force || !String(field.value || "").trim()) {
    field.value = total > 0 ? total.toFixed(2) : "";
  }
}

function updateReportBarTotal() {
  updateEcTotalField();
  updateGastroTotalField();
  renderTipDistribution();
  renderDayReportA4Summary(state.terminalDate || todayKey(), reportPreviewFromForm());
}

function reportPreviewFromForm() {
  const cashTotal = $("#reportCashTotal")?.value || state.terminalReport?.cashTotal || "";
  const cashExpenses = cashExpensesFromFormOrReport().toFixed(2);
  const revenueBowling = $("#reportRevenueBowling")?.value || state.terminalReport?.revenueBowling || state.terminalReport?.barBowling || "";
  const revenueDrinks = $("#reportRevenueDrinks")?.value || state.terminalReport?.revenueDrinks || "";
  const revenueFood = $("#reportRevenueFood")?.value || state.terminalReport?.revenueFood || "";
  const revenueOther = $("#reportRevenueOther")?.value || state.terminalReport?.revenueOther || "";
  const revenueGastro = gastroRevenueFromFormOrReport().toFixed(2);
  const personalConsumption = $("#reportPersonalConsumption")?.value || state.terminalReport?.personalConsumption || "";
  const tipResult = calculateTipDistribution(state.terminalDate || todayKey());
  return {
    ...(state.terminalReport || {}),
    cashTotal,
    cashExpenses,
    ecTerminal1: $("#reportEcTerminal1")?.value || state.terminalReport?.ecTerminal1 || "",
    ecTerminal2: $("#reportEcTerminal2")?.value || state.terminalReport?.ecTerminal2 || "",
    ecTotal: ecTotalFromFormOrReport().toFixed(2),
    personalConsumption,
    revenueBowling,
    revenueDrinks,
    revenueFood,
    revenueOther,
    revenueGastro,
    barBowling: revenueBowling,
    barGastro: revenueGastro,
    tipTotal: tipResult.tipTotal.toFixed(2),
    tipRemainder: tipResult.tipRemainder.toFixed(2),
    tipsByEmployee: Object.fromEntries(tipResult.rows.map((row) => [row.employee, row.tip.toFixed(2)])),
    openingHours: $("#terminalOpeningHours")?.value || state.terminalReport?.openingHours || "",
    shiftLeader: $("#terminalShiftLeader")?.value || state.terminalReport?.shiftLeader || ""
  };
}

function renderTerminal() {
  const panel = $("#terminal");
  if (!panel) return;
  const todoMode = isTodoMode();
  if (todoMode && !["tasks", "checks"].includes(state.terminalTab)) state.terminalTab = "tasks";
  if ($("#terminalTitle")) $("#terminalTitle").textContent = "Tages-Terminal";
  if ($("#terminalCodeLabel")) $("#terminalCodeLabel").textContent = todoMode ? "TO-DO-Code" : "Terminal-Code";
  if ($("#terminalLoginHint")) $("#terminalLoginHint").textContent = todoMode
    ? "Willkommen bei der LA-Bowling To-do-App! Bitte melden Sie sich an."
    : "Willkommen bei der LA-Bowling TerminalApp! Bitte melden Sie sich an.";
  if ($("#unlockTerminal")) $("#unlockTerminal").textContent = "Login";
  $(".terminal-tabs")?.classList.remove("hidden");
  document.body.classList.toggle("terminal-login-mode", (isTerminalMode() || todoMode) && !state.terminalToken);
  $("#terminalLoginBrand")?.classList.toggle("hidden", Boolean(state.terminalToken));
  $("#terminalLogin")?.classList.toggle("hidden", Boolean(state.terminalToken));
  $("#terminalContent")?.classList.toggle("hidden", !state.terminalToken);
  const dateKey = state.terminalDate || todayKey();
  state.terminalDate = dateKey;
  $("#terminalDate").textContent = formatLongDate(dateKey);
  if (!state.terminalToken) {
    normalizeGermanDisplay();
    return;
  }

  const employees = terminalEmployeesForDay(dateKey);
  const entries = state.terminalEntries || {};
  const report = state.terminalReport || {};
  const reportClosed = Boolean(report.closed);
  renderTerminalTabs();
  renderTerminalDayMeta(dateKey, report, reportClosed);
  renderTerminalCorrectionBanner(dateKey, report);
  renderTerminalLeaderMessages(report, reportClosed);
  renderTerminalTasks(report, reportClosed);
  renderHandovers(report, reportClosed);
  renderToiletStatus(report);
  renderTerminalChecks(report);
  renderTerminalAssignments(dateKey);
  checkTerminalReminders(report, reportClosed);
  renderTerminalCosts(dateKey, employees);
  renderTipDistribution();
  $(".terminal-add")?.classList.remove("hidden");
  $("#terminalEmployees").innerHTML = employees.length ? employees.map((employee) => {
    const entry = entries[employee]?.[dateKey] || {};
    const hours = paidHours(entry);
    const planned = terminalIsPlanned(employee);
    const plannedShift = terminalPlannedShiftFor(employee);
    const shiftText = dayReportShiftText(entry);
    return `
      <article class="terminal-employee ${reportClosed ? "is-locked" : ""}">
        <div class="terminal-employee-head">
          <div>
          <strong>${escapeHtml(employee)}</strong>
            <span>${planned ? "Geplant" : "Zusätzlich"}${plannedShift.label ? ` · Plan ${escapeHtml(plannedShift.label)}` : ""}</span>
          </div>
          <strong class="terminal-shift-time">${escapeHtml(shiftText)}</strong>
          ${hours ? `<span class="terminal-hours">${formatHours(hours)}</span>` : ""}
        </div>
        <div class="terminal-time-edit">
          <div class="terminal-time-toolbar">
            <strong>Arbeitszeiten</strong>
            <div class="terminal-time-toolbar-actions">
              <button class="secondary terminal-add-segment-button" type="button" data-add-time-segment="${escapeHtml(employee)}" title="Arbeitszeit hinzufügen" aria-label="Arbeitszeit hinzufügen" ${reportClosed ? "disabled" : ""}>+</button>
              <button class="secondary terminal-save-times-button" data-terminal-adjust="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Speichern</button>
            </div>
          </div>
          <div class="terminal-time-segments">
            ${timeSegmentsForEdit(entry).map((segment, index) => terminalTimeSegmentRowHtml(segment, index, reportClosed)).join("")}
          </div>
        </div>
        <div class="terminal-actions">
          <button class="primary" data-terminal-punch="start" data-terminal-employee="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Dienstbeginn</button>
          <button class="secondary" data-terminal-punch="end" data-terminal-employee="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Dienstende</button>
          <button class="secondary danger-lite terminal-remove-button" data-terminal-remove="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Entfernen</button>
        </div>
      </article>
    `;
  }).join("") : `<p class="hint">Für heute ist noch niemand im Dienstplan eingeteilt.</p>`;

  $("#reportCashTotal").value = report.cashTotal || "";
  $("#reportCashExpenses").value = report.cashExpenses || (reportItemsTotal(report.expenses) ? reportItemsTotal(report.expenses).toFixed(2) : "");
  $("#reportEcTerminal1").value = report.ecTerminal1 || "";
  $("#reportEcTerminal2").value = report.ecTerminal2 || "";
  $("#reportPersonalConsumption").value = report.personalConsumption || "";
  $("#reportRevenueBowling").value = report.revenueBowling || report.barBowling || "";
  $("#reportRevenueDrinks").value = report.revenueDrinks || "";
  $("#reportRevenueFood").value = report.revenueFood || "";
  $("#reportRevenueOther").value = report.revenueOther || "";
  $("#reportRevenueGastro").value = report.revenueGastro || report.barGastro || "";
  updateReportBarTotal();
  $("#reportNotes").value = report.notes || "";
  renderReportEntryLists(report);
  renderReportDocuments(report);
  renderDayReportA4Summary(dateKey, report);
  setDayReportLocked(reportClosed, report);
  applyDayReportVisibility();

  const select = $("#terminalAddEmployee");
  if (select) {
    const planned = new Set(employees);
    const options = (state.settings.employees || []).filter((employee) => !planned.has(employee));
    select.innerHTML = `<option value="">Ungeplanten Mitarbeiter auswählen</option>${options.map((employee) => `<option value="${escapeHtml(employee)}">${escapeHtml(employee)}</option>`).join("")}`;
  }
  normalizeGermanDisplay();
}

function terminalTimeSegmentRowHtml(segment = {}, index = 0, disabled = false) {
  return `
    <div class="terminal-time-segment" data-terminal-segment-row>
      <span>${index + 1}.</span>
      <label>Beginn<input type="time" data-terminal-time="from" value="${escapeHtml(segment.from || "")}" ${disabled ? "disabled" : ""}></label>
      <label>Ende<input type="time" data-terminal-time="to" value="${escapeHtml(segment.to || "")}" ${disabled ? "disabled" : ""}></label>
      <button class="secondary terminal-remove-segment-button" type="button" data-remove-time-segment title="Arbeitszeit entfernen" aria-label="Arbeitszeit entfernen" ${disabled || index === 0 ? "disabled" : ""}>×</button>
    </div>
  `;
}

function collectTerminalTimeSegments(card) {
  return [...card.querySelectorAll("[data-terminal-segment-row]")].map((row) => ({
    from: row.querySelector('[data-terminal-time="from"]')?.value || "",
    to: row.querySelector('[data-terminal-time="to"]')?.value || ""
  })).filter((segment) => segment.from || segment.to);
}

function refreshTerminalSegmentNumbers(card) {
  card.querySelectorAll("[data-terminal-segment-row]").forEach((row, index) => {
    const number = row.querySelector("span");
    if (number) number.textContent = `${index + 1}.`;
    const removeButton = row.querySelector("[data-remove-time-segment]");
    if (removeButton) removeButton.disabled = index === 0;
  });
}

function renderDayReportA4Summary(dateKey, report = {}) {
  const target = $("#dayReportA4Summary");
  if (!target) return;
  target.innerHTML = dayReportA4Html(dateKey, report);
}

function applyDayReportVisibility() {
  $$("[data-report-field-box]").forEach((element) => {
    element.classList.toggle("hidden", !reportFieldEnabled(element.dataset.reportFieldBox));
  });
}

function renderTerminalTabs() {
  const active = state.terminalTab === "cleaning" ? "tasks" : state.terminalTab || "tasks";
  state.terminalTab = active;
  $$(".terminal-tab").forEach((button) => button.classList.toggle("active", button.dataset.terminalTab === active));
  $("#terminalTasksSection")?.classList.toggle("hidden", active !== "tasks");
  $("#terminalChecksSection")?.classList.toggle("hidden", active !== "checks");
  $("#terminalAssignmentsSection")?.classList.toggle("hidden", active !== "assignments");
  $("#terminalServiceSection")?.classList.toggle("hidden", active !== "service");
  $("#terminalFinanceSection")?.classList.toggle("hidden", active !== "finance");
  $("#terminalTipsSection")?.classList.toggle("hidden", active !== "tips");
  $("#dayReportPrintArea")?.classList.toggle("hidden", active !== "report");
}

function renderTerminalAssignments(dateKey) {
  const target = $("#terminalAssignmentList");
  if (!target) return;
  target.innerHTML = assignmentDateKeys(dateKey).map((dayKey, index) => terminalAssignmentDayHtml(dayKey, index)).join("");
}

function terminalAssignmentDayHtml(dateKey, index = 0) {
  const rows = assignmentEmployeeRowsForDate(dateKey);
  const title = index === 0 ? "Heute" : "Morgen";
  return `
    <article class="terminal-assignment-day">
      <div class="terminal-task-group-head">
        <div>
          <h4>${escapeHtml(title)} · ${escapeHtml(formatLongDate(dateKey))}</h4>
          <span>${rows.length ? `${rows.length} Mitarbeiter` : "Keine Einteilung"}</span>
        </div>
      </div>
      <div class="terminal-assignment-rows">
        ${rows.length ? rows.map(terminalAssignmentRowHtml).join("") : `<p class="hint">Für diesen Tag ist kein Counter- oder Service-Dienst gefunden.</p>`}
      </div>
    </article>
  `;
}

function assignmentEmployeeRowsForDate(dateKey) {
  const byEmployee = new Map();
  assignmentRowsForDate(dateKey).forEach((row) => {
    const existing = byEmployee.get(row.employee) || {
      dateKey,
      employee: row.employee,
      positions: [],
      time: assignmentTimeForEmployee(dateKey, row.employee, assignmentScheduleForDate(dateKey), row.position)
    };
    existing.positions.push(row.position);
    byEmployee.set(row.employee, existing);
  });
  return [...byEmployee.values()];
}

function terminalAssignmentRowHtml(row) {
  const time = row.time || {};
  return `
    <div class="terminal-assignment-row" data-assignment-date="${escapeHtml(row.dateKey)}" data-assignment-employee="${escapeHtml(row.employee)}">
      <div>
        <strong>${escapeHtml(row.employee)}</strong>
        <span>${escapeHtml(row.positions.join(", "))}</span>
      </div>
      <label>Beginn ab<input type="time" data-assignment-field="from" value="${escapeHtml(time.from || "")}"></label>
      <label>Notiz<input data-assignment-field="note" value="${escapeHtml(time.note || "")}" placeholder="optional"></label>
    </div>
  `;
}

function collectTerminalAssignmentTimes() {
  const result = {};
  $$("#terminalAssignmentList [data-assignment-date][data-assignment-employee]").forEach((row) => {
    const dateKey = row.dataset.assignmentDate;
    const employee = row.dataset.assignmentEmployee;
    result[dateKey] ||= {};
    result[dateKey][employee] = {
      from: row.querySelector('[data-assignment-field="from"]')?.value || "",
      to: "",
      note: row.querySelector('[data-assignment-field="note"]')?.value || ""
    };
  });
  return result;
}

function renderTerminalDayMeta(dateKey, report, reportClosed) {
  const dateInput = $("#terminalWorkDate");
  const openingInput = $("#terminalOpeningHours");
  const leaderSelect = $("#terminalShiftLeader");
  const hasSavedDayHead = Boolean(report.openingHours || report.shiftLeader);
  const showForm = !hasSavedDayHead || state.terminalDayMetaEditing;
  $("#terminalDayHeadForm")?.classList.toggle("hidden", !showForm);
  const display = $("#terminalDayMetaDisplay");
  if (display) {
    const opening = report.openingHours || openingHoursFor(dateKey) || "Öffnungszeit offen";
    const leader = report.shiftLeader || "Schichtleitung offen";
    display.classList.toggle("hidden", showForm);
    display.innerHTML = `
      <div>
        <h3>${escapeHtml(formatLongDate(dateKey))}</h3>
        <p><strong>${escapeHtml(leader)}</strong>${opening ? ` · ${escapeHtml(opening)}` : ""}</p>
      </div>
      <button id="editTerminalDayMeta" class="secondary" type="button" ${reportClosed ? "disabled" : ""}>Tageskopf ändern</button>
    `;
  }
  const summary = $("#terminalDayMetaSummary");
  if (summary) {
    const opening = report.openingHours || openingHoursFor(dateKey) || "Öffnungszeit offen";
    const leader = report.shiftLeader || "Schichtleitung offen";
    summary.textContent = hasSavedDayHead
      ? `${formatLongDate(dateKey)} | ${leader} | ${opening}`
      : "Tageskopf speichern, dann die Aufgaben des Tages abarbeiten.";
  }
  if (dateInput) {
    dateInput.value = dateKey;
    dateInput.disabled = true;
  }
  if (openingInput) {
    openingInput.value = report.openingHours || openingHoursFor(dateKey);
    openingInput.disabled = reportClosed;
  }
  if (leaderSelect) {
    const leader = report.shiftLeader || "";
    leaderSelect.innerHTML = `<option value="">Schichtleitung wählen</option>${shiftLeaderEmployees().map((employee) => `<option value="${escapeHtml(employee)}" ${leader === employee ? "selected" : ""}>${escapeHtml(employee)}</option>`).join("")}`;
    leaderSelect.disabled = reportClosed;
  }
  $("#saveTerminalDayMeta")?.toggleAttribute("disabled", reportClosed);
}

function renderTerminalCorrectionBanner(dateKey, report = {}) {
  const target = $("#terminalCorrectionBanner");
  if (!target) return;
  const active = Boolean(report.correctionOpen || state.terminalCorrectionMode);
  target.classList.toggle("hidden", !active);
  if (!active) {
    target.innerHTML = "";
    return;
  }
  target.innerHTML = `
    <div>
      <strong>Korrekturmodus aktiv</strong>
      <span>${escapeHtml(formatLongDate(dateKey))}${report.correctionReason ? ` | Grund: ${escapeHtml(report.correctionReason)}` : ""}</span>
      ${report.correctionOpenedAt ? `<small>Geöffnet am ${escapeHtml(formatDateTime(report.correctionOpenedAt))}</small>` : ""}
    </div>
    <button id="returnToAdminCorrection" class="secondary" type="button">Zurück zum Admin-Reiter</button>
  `;
}

function renderTerminalLeaderMessages(report = {}, reportClosed = false) {
  const target = $("#terminalLeaderMessages");
  if (!target) return;
  const checked = new Set((report.terminalMessageChecks || []).map((item) => item.messageId));
  const messages = (state.terminalMessages || []).filter((message) => message && message.active !== false && !checked.has(message.id));
  target.classList.toggle("hidden", !messages.length);
  if (!messages.length) {
    target.innerHTML = "";
    return;
  }
  target.innerHTML = `
    <div class="terminal-leader-message-head">
      <strong>Nachricht an Schichtleitung</strong>
      <span>${messages.length === 1 ? "1 offene Nachricht" : `${messages.length} offene Nachrichten`}</span>
    </div>
    ${messages.map((message) => `
      <article class="terminal-leader-message">
        <p>${escapeHtml(message.text)}</p>
        <div>
          <small>${message.createdAt ? escapeHtml(formatDateTime(message.createdAt)) : ""}</small>
          <button class="primary" data-confirm-terminal-message="${escapeHtml(message.id)}" type="button" ${reportClosed ? "disabled" : ""}>Quittieren</button>
        </div>
      </article>
    `).join("")}
  `;
}

function shiftLeaderEmployees() {
  const employees = state.settings.employees || [];
  const wanted = [
    (name) => /kevin/i.test(name),
    (name) => /dennis/i.test(name),
    (name) => /poschenrieder/i.test(name) || /christian\s+poschenrieder/i.test(name)
  ];
  const matches = wanted
    .map((test) => employees.find((name) => test(name)))
    .filter(Boolean);
  return [...new Set(matches.length ? matches : ["Leicht, Kevin", "Eberhardt, Dennis", "Poschenrieder, Christian"])];
}

function renderTerminalTasks(report, reportClosed) {
  const target = $("#terminalTaskList");
  if (!target) return;
  const done = report.taskCompletions || {};
  const tasks = sortTaskTemplates(state.terminalTasks || []);
  const cleaningDone = weeklyCleaningCompletionsForTerminal(report);
  const allCleaningTasks = weeklyCleaningTasksForTerminal();
  const cleaningTasks = allCleaningTasks.filter((task) => !cleaningDone[task.id]);
  const cleaningTotal = allCleaningTasks.length;
  const cleaningCompleted = allCleaningTasks.filter((task) => cleaningDone[task.id]).length;
  const employeeOptions = (selected = "") => `<option value="">Person auswählen</option>${(state.settings.employees || []).map((employee) => `<option value="${escapeHtml(employee)}" ${selected === employee ? "selected" : ""}>${escapeHtml(employee)}</option>`).join("")}`;
  const groups = [
    ["preparation", "Vorbereitung"],
    ["running", "Laufender Betrieb"],
    ["closing", "Schlussdienst"]
  ];
  const taskHtml = groups.map(([category, label]) => {
    const items = tasks.filter((task) => (task.category || "running") === category);
    const openItems = items.filter((task) => !done[task.id]);
    const completed = items.filter((task) => done[task.id]).length;
    if (!openItems.length) return "";
    return `
      <section class="terminal-task-group terminal-task-${category}">
        <div class="terminal-task-group-head">
          <h4>${label}</h4>
          <span>${completed}/${items.length} erledigt · ${openItems.length} offen</span>
        </div>
        <div class="terminal-task-items">
          ${openItems.map((task) => `
              <article class="terminal-task">
                <label>
                  <input type="checkbox" data-terminal-task="${escapeHtml(task.id)}" ${reportClosed ? "disabled" : ""}>
                  <span>
                    <strong>${escapeHtml(task.title)}</strong>
                    ${task.popupEnabled && task.popupTime ? `<small>Popup ${escapeHtml(task.popupTime)}</small>` : ""}
                    ${task.note ? `<small>${escapeHtml(task.note)}</small>` : ""}
                  </span>
                </label>
              </article>
            `).join("")}
        </div>
      </section>
    `;
  }).join("");
  const cleaningHtml = cleaningTasks.length ? `
    <section class="terminal-task-group terminal-task-cleaning">
      <div class="terminal-task-group-head">
        <h4>Wöchentliche Reinigung</h4>
        <span>${cleaningCompleted}/${cleaningTotal} diese Woche erledigt · ${cleaningTasks.length} offen</span>
      </div>
      <div class="terminal-task-items">
        ${cleaningTasks.map((task) => `
          <article class="terminal-task terminal-cleaning-todo">
            <label>
              <input type="checkbox" data-cleaning-task="${escapeHtml(task.id)}" ${reportClosed ? "disabled" : ""}>
              <span>
                <strong>${escapeHtml(task.title)}</strong>
                ${task.note ? `<small>${escapeHtml(task.note)}</small>` : ""}
              </span>
            </label>
            <select data-cleaning-employee="${escapeHtml(task.id)}" ${reportClosed ? "disabled" : ""}>
              ${employeeOptions()}
            </select>
          </article>
        `).join("")}
      </div>
    </section>
  ` : "";
  target.innerHTML = taskHtml + cleaningHtml || `<p class="hint">Alle To Do Aufgaben sind erledigt.</p>`;
}

function weeklyCleaningTasksForTerminal() {
  return normalizeCleaningTemplates(state.terminalToken ? state.terminalCleaningTemplates : state.cleaningTemplates)
    .filter((task) => task.frequency === "weekly");
}

function weeklyCleaningCompletionsForTerminal(report = {}) {
  return {
    ...(state.terminalWeeklyCleaningCompletions || {}),
    ...(report.cleaningCompletions || {})
  };
}

function renderCleaningPlan(report, reportClosed) {
  const target = $("#terminalCleaningList");
  if (!target) return;
  const completions = report.cleaningCompletions || {};
  const employees = state.settings.employees || [];
  const employeeOptions = (selected = "") => `<option value="">Person auswählen</option>${employees.map((employee) => `<option value="${escapeHtml(employee)}" ${selected === employee ? "selected" : ""}>${escapeHtml(employee)}</option>`).join("")}`;
  const groups = cleaningPlanGroupsForDate(state.terminalDate || todayKey());
  if (!groups.some((group) => group.tasks.length)) {
    target.innerHTML = `<p class="hint">Für heute sind keine Reinigungsaufgaben geplant.</p>`;
    return;
  }
  target.innerHTML = groups.filter((group) => group.tasks.length).map((group) => `
    <section class="terminal-cleaning-group">
      <div class="terminal-task-group-head">
        <h4>${escapeHtml(group.label)}</h4>
        <span>${group.tasks.filter((task) => completions[task.id]).length}/${group.tasks.length} unterschrieben</span>
      </div>
      <div class="terminal-cleaning-items">
        ${group.tasks.map((task) => {
          const done = completions[task.id];
          return `
            <article class="terminal-cleaning-row ${done ? "is-done" : ""}">
              <label>
                <input type="checkbox" data-cleaning-task="${escapeHtml(task.id)}" ${done ? "checked" : ""} ${reportClosed ? "disabled" : ""}>
                <span>${escapeHtml(task.title)}${task.note ? `<small>${escapeHtml(task.note)}</small>` : ""}</span>
              </label>
              <select data-cleaning-employee="${escapeHtml(task.id)}" ${done || reportClosed ? "disabled" : ""}>
                ${employeeOptions(done?.employee || "")}
              </select>
              <div class="cleaning-signature">
                <small>Unterschrift</small>
                <strong>${done?.employee ? escapeHtml(done.employee) : "offen"}</strong>
                <span>${done?.doneAt ? formatDateTime(done.doneAt) : ""}</span>
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `).join("");
}

function cleaningPlanGroupsForDate(dateKey) {
  const tasks = normalizeCleaningTemplates(state.terminalToken ? state.terminalCleaningTemplates : state.cleaningTemplates);
  const due = tasks.filter((task) => cleaningTaskAppliesToDate(task, dateKey));
  return [
    { group: "weekly", label: "Wöchentliche Reinigung", tasks: due.filter((task) => task.frequency === "weekly") }
  ];
}

function cleaningTaskAppliesToDate(task, dateKey) {
  return task.frequency === "weekly";
}

function renderHandovers(report, reportClosed) {
  const from = $("#handoverFrom");
  const to = $("#handoverTo");
  const list = $("#handoverList");
  const count = $("#handoverCount");
  const handovers = report.handovers || [];
  const todoMode = isTodoMode();
  const anchor = $("#terminalHandoverAnchor");
  if (anchor) anchor.classList.toggle("hidden", todoMode && !handovers.length);
  $("#openHandover")?.classList.toggle("hidden", todoMode);
  const title = $("#terminalHandoverAnchor h4");
  if (title) title.textContent = todoMode ? "Übergabe-Info" : "Übergabe";
  const currentLeader = report.shiftLeader || "";
  const employees = shiftLeaderEmployees();
  const options = (selected = "") => `<option value="">Auswählen</option>${employees.map((employee) => `<option value="${escapeHtml(employee)}" ${selected === employee ? "selected" : ""}>${escapeHtml(employee)}</option>`).join("")}`;
  if (from) {
    from.innerHTML = options(currentLeader);
    from.disabled = reportClosed;
  }
  if (to) {
    to.innerHTML = options("");
    to.disabled = reportClosed;
  }
  $("#handoverTime")?.toggleAttribute("disabled", reportClosed);
  $("#handoverNote")?.toggleAttribute("disabled", reportClosed);
  $("#saveHandover")?.toggleAttribute("disabled", reportClosed);
  if (count) count.textContent = `${handovers.length} Übergabe${handovers.length === 1 ? "" : "n"}`;
  if (list) {
    list.innerHTML = handovers.length ? handovers.slice().reverse().map((item) => `
      <article class="handover-card">
        <strong>${escapeHtml(item.time || "--:--")} | ${escapeHtml(item.from || "-")} an ${escapeHtml(item.to || "-")}</strong>
        <p>${escapeHtml(item.note || "")}</p>
      </article>
    `).join("") : `<p class="hint">Noch keine Übergabe eingetragen.</p>`;
  }
}

function renderToiletStatus(report) {
  const target = $("#toiletCheckStatus");
  if (!target) return;
  target.innerHTML = "";
  target.classList.add("hidden");
}

function renderTerminalChecks(report = {}) {
  const target = $("#terminalCheckLog");
  if (!target) return;
  const reminderChecks = (report.reminderChecks || []).map((item) => ({
    key: item.checkKey || "",
    text: item.text || "Toiletten-Kontrolle durchführen",
    employee: item.employee || "",
    checkedAt: item.checkedAt || "",
    type: checkLogType(item)
  }));
  const reminderKeys = new Set(reminderChecks.map((item) => item.key));
  const toiletOnly = (report.toiletChecks || [])
    .filter((item) => item.checkKey && !reminderKeys.has(item.checkKey))
    .map((item) => ({
      key: item.checkKey || "",
      text: "Toiletten-Kontrolle durchführen",
      employee: item.employee || "",
      checkedAt: item.checkedAt || "",
      type: "Toilette"
    }));
  const entries = [...reminderChecks, ...toiletOnly]
    .filter((item) => item.checkedAt || item.key)
    .sort((a, b) => String(a.checkedAt || a.key).localeCompare(String(b.checkedAt || b.key)));
  target.innerHTML = entries.length ? `
    <div class="terminal-check-list">
      ${entries.map((item) => `
        <article class="terminal-check-entry">
          <div>
            <strong>${escapeHtml(item.type)}</strong>
            <span>${escapeHtml(item.text)}</span>
            ${item.employee ? `<small>${escapeHtml(item.employee)}</small>` : ""}
          </div>
          <time>${escapeHtml(item.checkedAt ? formatDateTime(item.checkedAt) : checkTimeFromKey(item.key))}</time>
        </article>
      `).join("")}
    </div>
  ` : `<p class="hint">Heute wurde noch keine Kontrolle quittiert.</p>`;
}

function checkLogType(item = {}) {
  const text = String(item.text || "").toLowerCase();
  const key = String(item.checkKey || "").toLowerCase();
  if (text.includes("toilet") || text.includes("toilette") || key.includes("toilet")) return "Toilette";
  if (key.includes("task-popup")) return "Aufgaben-Popup";
  return "Popup";
}

function pendingReminderIsToilet(reminder = state.pendingReminder) {
  if (!reminder) return false;
  const key = String(reminder.checkKey || "").toLowerCase();
  const id = String(reminder.reminderId || "").toLowerCase();
  return !key.includes("task-popup") && (key.includes("toilet") || id.includes("toilet"));
}

function checkTimeFromKey(key = "") {
  const match = String(key).match(/(\d{2}:\d{2})$/);
  return match ? match[1] : "-";
}

function checkTerminalReminders(report, reportClosed) {
  const modal = $("#toiletReminder");
  if (!modal || reportClosed || !state.terminalToken) {
    modal?.classList.add("hidden");
    return;
  }
  const due = dueReminder(state.terminalDate || todayKey(), report, report.openingHours || $("#terminalOpeningHours")?.value || "");
  state.pendingReminder = due;
  state.pendingToiletCheck = due?.checkKey || "";
  $("#terminalReminderTitle").textContent = due?.title || (isTodoMode() ? "TO DO Erinnerung" : "Terminal Erinnerung");
  $("#terminalReminderText").textContent = due?.text || "Bitte quittieren.";
  const employeeWrap = $("#toiletCheckEmployeeWrap");
  const employeeSelect = $("#toiletCheckEmployee");
  const toiletDue = pendingReminderIsToilet(due);
  employeeWrap?.classList.toggle("hidden", !toiletDue);
  if (employeeSelect && toiletDue) {
    const current = employeeSelect.value || report.shiftLeader || "";
    employeeSelect.innerHTML = `<option value="">Mitarbeiter auswählen</option>${(state.settings?.employees || []).map((employee) => (
      `<option value="${escapeHtml(employee)}" ${current === employee ? "selected" : ""}>${escapeHtml(employee)}</option>`
    )).join("")}`;
  }
  modal.classList.toggle("hidden", !due);
}

function dueReminder(dateKey, report, openingText = "") {
  const reminders = normalizeReminderTemplates(state.terminalReminders);
  const checks = [...(report.toiletChecks || []), ...(report.reminderChecks || [])];
  const checked = new Set((checks || []).map((item) => item.checkKey));
  const taskPopup = dueTaskPopupReminder(dateKey, report, checked);
  if (taskPopup) return taskPopup;
  const match = String(openingText || openingHoursFor(dateKey)).match(/(\d{2}):(\d{2})/);
  if (!match) return null;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  for (const reminder of reminders) {
    const start = Number(match[1]) * 60 + Number(match[2]) + Number(reminder.startAfterOpeningMinutes || 60);
    if (current < start) continue;
    for (let minute = start; minute <= current; minute += Number(reminder.intervalMinutes || 60)) {
      const key = `${dateKey}-${reminder.id}-${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      if (!checked.has(key)) {
        return { checkKey: key, text: reminder.text, title: reminder.text, reminderId: reminder.id };
      }
    }
  }
  return null;
}

function dueTaskPopupReminder(dateKey, report = {}, checked = new Set()) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const done = report.taskCompletions || {};
  const tasks = (state.terminalTasks || [])
    .filter((task) => task.popupEnabled && task.popupTime)
    .sort((a, b) => String(a.popupTime || "").localeCompare(String(b.popupTime || "")));
  for (const task of tasks) {
    if (done[task.id]) continue;
    const match = String(task.popupTime || "").match(/^(\d{2}):(\d{2})$/);
    if (!match) continue;
    const dueMinute = Number(match[1]) * 60 + Number(match[2]);
    if (current < dueMinute) continue;
    const key = `${dateKey}-task-popup-${task.id}-${task.popupTime}`;
    if (!checked.has(key)) {
      return {
        checkKey: key,
        text: task.note ? `${task.title}\n${task.note}` : task.title,
        title: "Aufgaben-Popup",
        reminderId: task.id
      };
    }
  }
  return null;
}

async function refreshTerminalReminderState() {
  if (!state.terminalToken || state.terminalReminderRefreshInFlight) {
    if (state.terminalToken) checkTerminalReminders(state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    return;
  }
  state.terminalReminderRefreshInFlight = true;
  try {
    const result = await api("/api/day-terminal", {
      method: "POST",
      body: JSON.stringify({
        action: "load",
        date: state.terminalDate || todayKey(),
        terminalToken: state.terminalToken
      })
    });
    const report = result.report || {};
    state.terminalDate = result.date || state.terminalDate || todayKey();
    state.terminalTasks = result.tasks || state.terminalTasks || [];
    state.terminalReminders = normalizeReminderTemplates(result.reminders || state.terminalReminders);
    state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.terminalCleaningTemplates);
    state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || state.terminalWeeklyCleaningCompletions || {};
    state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
    state.terminalReport = {
      ...(state.terminalReport || {}),
      closed: report.closed,
      closedAt: report.closedAt || state.terminalReport?.closedAt || "",
      taskCompletions: report.taskCompletions || state.terminalReport?.taskCompletions || {},
      cleaningCompletions: report.cleaningCompletions || state.terminalReport?.cleaningCompletions || {},
      toiletChecks: report.toiletChecks || state.terminalReport?.toiletChecks || [],
      reminderChecks: report.reminderChecks || state.terminalReport?.reminderChecks || [],
      terminalMessageChecks: report.terminalMessageChecks || state.terminalReport?.terminalMessageChecks || []
    };
    renderTerminalTasks(state.terminalReport, Boolean(state.terminalReport?.closed));
    renderTerminalChecks(state.terminalReport);
    checkTerminalReminders(state.terminalReport, Boolean(state.terminalReport?.closed));
  } catch (error) {
    checkTerminalReminders(state.terminalReport || {}, Boolean(state.terminalReport?.closed));
  } finally {
    state.terminalReminderRefreshInFlight = false;
  }
}

function setDayReportLocked(isLocked, report = {}) {
  const target = $("#dayReportPrintArea");
  if (!target) return;
  target.classList.toggle("is-locked", isLocked);
  $("#dayReportLockStatus").textContent = isLocked
    ? `Abgeschlossen${report.closedAt ? ` am ${formatDateTime(report.closedAt)}` : ""}. Keine Änderungen mehr möglich.`
    : "Vor dem Tagesabschluss speichern und prüfen.";
  $$("#dayReportPrintArea input, #dayReportPrintArea textarea, #dayReportPrintArea select, #terminalFinanceSection input, #terminalFinanceSection textarea, #terminalFinanceSection select").forEach((field) => {
    field.disabled = isLocked;
  });
  $$("#addInvoiceCustomer, #addExpense, [data-save-invoice-draft], [data-mark-invoice-ready], [data-save-expense-entry], [data-remove-report-entry], [data-remove-report-document], #saveDayReport, #saveTipDistribution").forEach((button) => {
    button.disabled = isLocked;
  });
  const closeButton = $("#closeDayReport");
  if (closeButton) {
    closeButton.disabled = isLocked;
    closeButton.textContent = isLocked ? "Abgeschlossen" : "Tagesabschluss";
  }
}

function renderReportEntryLists(report) {
  const invoices = report.invoiceCustomers || [];
  const expenses = report.expenses || [];
  const invoiceTarget = $("#invoiceCustomersList");
  const expenseTarget = $("#expensesList");
  if (invoiceTarget) {
    invoiceTarget.innerHTML = invoices.length
      ? `${invoiceDayOverviewHtml(invoices)}${invoices.map((item) => invoiceRowHtml(item)).join("")}`
      : `<p class="hint">Keine Rechnungskunden erfasst.</p>`;
  }
  if (expenseTarget) {
    expenseTarget.innerHTML = expenses.map((item) => expenseRowHtml(item)).join("") || `<p class="hint">Keine Ausgaben erfasst.</p>`;
  }
}

function invoiceDayOverviewHtml(invoices = []) {
  const ready = invoices.filter((item) => invoiceIsReady(item) && !item.invoiceDone).length;
  const draft = invoices.filter((item) => !invoiceIsReady(item) && !item.invoiceDone).length;
  const done = invoices.filter((item) => item.invoiceDone).length;
  const total = invoices.reduce((sum, item) => sum + invoiceTotal(item), 0);
  return `
    <div class="invoice-day-overview">
      <div>
        <small>Tagesübersicht Rechnung</small>
        <strong>${invoices.length} Kunde${invoices.length === 1 ? "" : "n"}</strong>
      </div>
      <span class="invoice-pill is-draft">${draft} angelegt</span>
      <span class="invoice-pill is-ready">${ready} fertig für Chef</span>
      <span class="invoice-pill is-done">${done} erledigt</span>
      <span class="invoice-pill">${formatReportMoney(total)}</span>
    </div>
  `;
}

function renderReportDocuments(report = {}) {
  const target = $("#reportDocumentStatus");
  if (!target) return;
  const documents = report.documents || {};
  const rows = [
    ["Penta", documents.penta],
    ["Handschrift", documents.handwriting],
    ["EC-Schnitt", documents.ecCut]
  ];
  const documentKey = (label) => {
    if (label === "Penta") return "penta";
    if (label === "Handschrift") return "handwriting";
    return "ecCut";
  };
  target.innerHTML = rows.map(([label, document]) => `
    <article class="report-entry compact-report-entry">
      <strong>${escapeHtml(label)}</strong>
      ${document?.name ? `<span class="hint">${escapeHtml(document.name)}</span>` : `<span class="hint">Noch nicht hochgeladen.</span>`}
      ${document?.path || document?.url || document?.data ? `
        <div class="report-document-actions">
          ${reportDocumentLinkHtml(document, label)}
          <button class="secondary danger-lite" data-remove-report-document="${documentKey(label)}" type="button">Entfernen</button>
        </div>
      ` : ""}
      <input type="hidden" data-report-document="${documentKey(label)}" data-document-field="name" value="${escapeHtml(document?.name || "")}">
      <input type="hidden" data-report-document="${documentKey(label)}" data-document-field="path" value="${escapeHtml(document?.path || "")}">
      <input type="hidden" data-report-document="${documentKey(label)}" data-document-field="url" value="${escapeHtml(document?.url || "")}">
      <input type="hidden" data-report-document="${documentKey(label)}" data-document-field="data" value="${escapeHtml(document?.data || "")}">
    </article>
  `).join("");
}

function reportDocumentInputForKey(key) {
  return {
    penta: "#reportDocumentPenta",
    handwriting: "#reportDocumentHandwriting",
    ecCut: "#reportDocumentEcCut"
  }[key] || "";
}

function reportDocumentLabelForInput(input) {
  if (input?.id === "reportDocumentPenta") return "Penta";
  if (input?.id === "reportDocumentHandwriting") return "Handschrift";
  if (input?.id === "reportDocumentEcCut") return "EC-Schnitt";
  if (input?.id === "customerReportDocumentPenta") return "Penta";
  if (input?.id === "customerReportDocumentHandwriting") return "Handschrift";
  if (input?.id === "customerReportDocumentEcCut") return "EC-Schnitt";
  return "Dokument";
}

function clearReportDocumentFields(key) {
  $$(`[data-report-document="${key}"]`).forEach((field) => {
    field.value = "";
  });
  const selector = reportDocumentInputForKey(key);
  if (selector && $(selector)) $(selector).value = "";
  if (state.terminalReport?.documents) {
    state.terminalReport.documents[key] = {};
  }
}

async function saveReportDocumentsNow(source, successText = "Abschlussdokumente gespeichert.") {
  if (state.terminalReport?.closed) {
    showToast("Tagesbericht ist abgeschlossen. Dokument kann nicht gespeichert werden.");
    return;
  }
  const oldText = source?.tagName === "BUTTON" ? source.textContent : "";
  if (source?.tagName === "BUTTON") {
    source.disabled = true;
    source.textContent = "Speichert...";
  }
  showToast("Dokument wird verkleinert und gespeichert...");
  try {
    await terminalAction(await collectDayReportPayload());
    showToast(successText);
  } catch (error) {
    showError(error);
  } finally {
    if (source?.tagName === "BUTTON") {
      source.textContent = oldText;
      source.disabled = false;
    }
  }
}

function renderCustomerInvoiceDesk() {
  if (!isCustomerInvoiceMode()) return;
  const login = $("#customerInvoiceStaffLogin");
  const area = $("#customerInvoiceStaffArea");
  const lockButton = $("#lockCustomerInvoiceStaff");
  if (!login || !area) return;
  const unlocked = Boolean(state.invoiceTerminalToken);
  login.classList.toggle("hidden", unlocked);
  area.classList.toggle("hidden", !unlocked);
  lockButton?.classList.toggle("hidden", !unlocked);
  if (!unlocked) return;

  const report = state.invoiceReport || {};
  const invoices = report.invoiceCustomers || [];
  const expenses = report.expenses || [];
  const summary = $("#customerInvoiceDaySummary");
  if (summary) {
    const ready = invoices.filter((item) => invoiceIsReady(item) && !item.invoiceDone).length;
    const draft = invoices.filter((item) => !invoiceIsReady(item) && !item.invoiceDone).length;
    const total = invoices.reduce((sum, item) => sum + invoiceTotal(item), 0);
    summary.innerHTML = `
      <div>
        <small>${escapeHtml(formatDate(state.invoiceDate || todayKey()))}</small>
        <strong>${invoices.length} Rechnungskunde${invoices.length === 1 ? "" : "n"}</strong>
      </div>
      <span class="invoice-pill is-draft">${draft} offen</span>
      <span class="invoice-pill is-ready">${ready} fertig für Chef</span>
      <span class="invoice-pill">${formatReportMoney(total)}</span>
    `;
  }
  const invoiceList = $("#customerInvoiceWorkList");
  if (invoiceList) {
    invoiceList.innerHTML = invoices.map((item) => invoiceRowHtml(item)).join("") || `<p class="hint">Noch keine Rechnungskunden für heute.</p>`;
  }
  renderCustomerMaster();
  const expenseList = $("#customerExpenseWorkList");
  if (expenseList) {
    expenseList.innerHTML = expenses.map((item) => expenseRowHtml(item)).join("") || `<p class="hint">Noch keine Ausgaben für heute.</p>`;
  }
  renderCustomerInvoiceDocuments(report);
  const status = $("#customerInvoiceStaffStatus");
  if (status && !status.textContent) status.textContent = "Tagesübersicht geöffnet.";
  normalizeGermanDisplay();
}

function renderCustomerMaster() {
  const select = $("#customerMasterSelect");
  const preview = $("#customerMasterPreview");
  if (!select || !preview) return;
  const query = ($("#customerMasterSearch")?.value || "").trim().toLowerCase();
  const customers = normalizeCustomerDirectory(state.customerDirectory);
  const filtered = customers.filter((customer) => {
    if (!query) return true;
    return [
      customer.name,
      customer.contact,
      customer.phone,
      customer.email,
      customer.address,
      customer.tip,
      customer.note
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });
  const previous = select.value;
  select.innerHTML = filtered.length
    ? filtered.map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.name)}${customer.contact ? ` - ${escapeHtml(customer.contact)}` : ""}</option>`).join("")
    : `<option value="">Kein Kunde gefunden</option>`;
  if (filtered.some((customer) => customer.id === previous)) {
    select.value = previous;
  }
  const selected = filtered.find((customer) => customer.id === select.value) || filtered[0];
  preview.innerHTML = selected ? customerMasterPreviewHtml(selected) : `<p class="hint">Noch keine Kunden in der Kartei. Sobald ein Rechnungskunde gespeichert wird, taucht er hier auf.</p>`;
  const button = $("#addCustomerFromMaster");
  if (button) button.disabled = !selected;
}

function customerMasterPreviewHtml(customer) {
  return `
    <strong>${escapeHtml(customer.name || "Kunde")}</strong>
    ${customer.contact ? `<span>${escapeHtml(customer.contact)}</span>` : ""}
    ${customer.email || customer.phone ? `<span>${escapeHtml([customer.email, customer.phone].filter(Boolean).join(" · "))}</span>` : ""}
    ${customer.address ? `<span>${escapeHtml(customer.address)}</span>` : ""}
    ${customer.tip ? `<span class="hint">Tipp: ${escapeHtml(customer.tip)}</span>` : ""}
    ${customer.note ? `<span class="hint">Notiz: ${escapeHtml(customer.note)}</span>` : ""}
  `;
}

function customerMasterToInvoice(customer = {}) {
  return {
    id: cryptoId(),
    name: customer.name || "",
    contact: customer.contact || "",
    phone: customer.phone || "",
    email: customer.email || "",
    address: customer.address || "",
    tip: customer.tip || "",
    note: customer.note || "",
    createdAt: new Date().toISOString(),
    invoiceReady: false,
    invoiceReadyAt: "",
    invoiceDone: false,
    invoiceDoneAt: "",
    amount: "",
    bowlingAmount: "",
    gastroAmount: "",
    gastroDrinksAmount: "",
    gastroFoodAmount: "",
    gastroOtherAmount: "",
    gastroOtherNote: "",
    receiptName: "",
    receiptData: "",
    receiptPath: "",
    receiptUrl: "",
    area: "rechnung"
  };
}

function renderCustomerInvoiceDocuments(report = {}) {
  const target = $("#customerReportDocumentStatus");
  if (!target) return;
  const documents = report.documents || {};
  const rows = [
    ["Penta", "penta", documents.penta],
    ["Handschrift", "handwriting", documents.handwriting],
    ["EC-Schnitt", "ecCut", documents.ecCut]
  ];
  target.innerHTML = rows.map(([label, key, document]) => `
    <article class="report-entry compact-report-entry">
      <strong>${escapeHtml(label)}</strong>
      ${document?.name ? `<span class="hint">${escapeHtml(document.name)}</span>` : `<span class="hint">Noch nicht hochgeladen.</span>`}
      ${document?.path || document?.url || document?.data ? reportDocumentLinkHtml(document, label) : ""}
      <input type="hidden" data-customer-report-document="${key}" data-document-field="name" value="${escapeHtml(document?.name || "")}">
      <input type="hidden" data-customer-report-document="${key}" data-document-field="path" value="${escapeHtml(document?.path || "")}">
      <input type="hidden" data-customer-report-document="${key}" data-document-field="url" value="${escapeHtml(document?.url || "")}">
      <input type="hidden" data-customer-report-document="${key}" data-document-field="data" value="${escapeHtml(document?.data || "")}">
    </article>
  `).join("");
}

function invoiceRowHtml(item = {}) {
  const isSaved = Boolean(item.id);
  const id = item.id || cryptoId();
  const singleReceipt = invoiceReceipt(item);
  const legacyReceipts = invoiceLegacyReceipts(item);
  const isReady = invoiceIsReady(item);
  const statusClass = invoiceStatusClass(item);
  const total = invoiceTotal(item);
  const legacyHint = !singleReceipt && legacyReceipts.length
    ? `<span class="hint">Bisherige getrennte Belege: ${legacyReceipts.map(({ label, receipt }) => `${escapeHtml(label)} ${escapeHtml(receipt.receiptName || "")}`).join(" | ")}</span>`
    : "";
  return `
    <details class="report-entry invoice-entry ${statusClass}" data-report-entry="invoice" data-id="${escapeHtml(id)}" data-saved="${isSaved ? "true" : "false"}" ${isReady ? "" : "open"}>
      <summary class="invoice-entry-summary">
        <div>
          <strong>${escapeHtml(item.name || "Neuer Rechnungskunde")}</strong>
          <span>${escapeHtml(item.contact || "Kontakt offen")} · ${escapeHtml(item.email || "E-Mail offen")}</span>
        </div>
        <span class="invoice-pill ${statusClass}">${escapeHtml(invoiceStatusText(item))}</span>
        <span class="invoice-entry-total">${formatReportMoney(total)}</span>
      </summary>
      <div class="invoice-entry-body">
      <div class="report-entry-grid">
        <label>Kunde<input data-report-field="name" value="${escapeHtml(item.name || "")}" placeholder="Name/Firma"></label>
        <label>Ansprechpartner<input data-report-field="contact" value="${escapeHtml(item.contact || "")}" placeholder="optional"></label>
        <label>Telefon<input data-report-field="phone" type="tel" value="${escapeHtml(item.phone || "")}" placeholder="optional"></label>
        <label>E-Mail<input data-report-field="email" type="email" value="${escapeHtml(item.email || "")}" placeholder="rechnung@kunde.de"></label>
        <label>Tipp<input data-report-field="tip" value="${escapeHtml(item.tip || "")}" placeholder="optional"></label>
      </div>
      <div class="report-entry-grid">
        <label>Bowling Betrag<input data-report-field="bowlingAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.bowlingAmount || (item.area === "bowling" ? item.amount : ""))}" placeholder="0,00"></label>
        <label>Gastro Getränke<input data-report-field="gastroDrinksAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.gastroDrinksAmount || "")}" placeholder="0,00"></label>
        <label>Gastro Speisen<input data-report-field="gastroFoodAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.gastroFoodAmount || "")}" placeholder="0,00"></label>
        <label>Gastro Sonstiges<input data-report-field="gastroOtherAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.gastroOtherAmount || "")}" placeholder="0,00"></label>
        <label>Sonstiges Notiz<textarea data-report-field="gastroOtherNote" rows="2" placeholder="Hinweis zu Sonstiges">${escapeHtml(item.gastroOtherNote || "")}</textarea></label>
      </div>
      <label>Rechnungsadresse<textarea data-report-field="address" rows="2" placeholder="Adresse für Rechnung">${escapeHtml(item.address || "")}</textarea></label>
      <label>Notiz<input data-report-field="note" value="${escapeHtml(item.note || "")}" placeholder="optional"></label>
      <label>Rechnungsbeleg scannen/fotografieren<input data-report-file type="file" accept="image/*,application/pdf" capture="environment"></label>
      ${singleReceipt?.receiptName ? `<span class="hint">Aktueller Rechnungsbeleg: ${escapeHtml(singleReceipt.receiptName)}</span>` : ""}
      ${legacyHint}
      <input type="hidden" data-report-field="gastroAmount" value="${escapeHtml(item.gastroAmount || "")}">
      <input type="hidden" data-report-field="receiptName" value="${escapeHtml(singleReceipt?.receiptName || item.receiptName || "")}">
      <input type="hidden" data-report-field="receiptData" value="${escapeHtml(singleReceipt?.receiptData || item.receiptData || "")}">
      <input type="hidden" data-report-field="receiptPath" value="${escapeHtml(singleReceipt?.receiptPath || item.receiptPath || "")}">
      <input type="hidden" data-report-field="receiptUrl" value="${escapeHtml(singleReceipt?.receiptUrl || item.receiptUrl || "")}">
      <input type="hidden" data-report-field="bowlingReceiptName" value="${escapeHtml(item.bowlingReceiptName || "")}">
      <input type="hidden" data-report-field="bowlingReceiptData" value="${escapeHtml(item.bowlingReceiptData || "")}">
      <input type="hidden" data-report-field="bowlingReceiptPath" value="${escapeHtml(item.bowlingReceiptPath || "")}">
      <input type="hidden" data-report-field="bowlingReceiptUrl" value="${escapeHtml(item.bowlingReceiptUrl || "")}">
      <input type="hidden" data-report-field="gastroReceiptName" value="${escapeHtml(item.gastroReceiptName || "")}">
      <input type="hidden" data-report-field="gastroReceiptData" value="${escapeHtml(item.gastroReceiptData || "")}">
      <input type="hidden" data-report-field="gastroReceiptPath" value="${escapeHtml(item.gastroReceiptPath || "")}">
      <input type="hidden" data-report-field="gastroReceiptUrl" value="${escapeHtml(item.gastroReceiptUrl || "")}">
      <input type="hidden" data-report-field="invoiceReady" value="${isReady ? "true" : "false"}">
      <input type="hidden" data-report-field="invoiceReadyAt" value="${escapeHtml(item.invoiceReadyAt || "")}">
      <input type="hidden" data-report-field="invoiceDone" value="${item.invoiceDone ? "true" : "false"}">
      <input type="hidden" data-report-field="invoiceDoneAt" value="${escapeHtml(item.invoiceDoneAt || "")}">
      <input type="hidden" data-report-field="invoiceNotificationSentAt" value="${escapeHtml(item.invoiceNotificationSentAt || "")}">
      <input type="hidden" data-report-field="createdAt" value="${escapeHtml(item.createdAt || "")}">
      <div class="invoice-entry-actions">
        <button class="secondary" data-save-invoice-draft type="button">Zwischenspeichern</button>
        <button class="primary" data-mark-invoice-ready type="button">${isReady ? "Erneut an Chef senden" : "Fertig für Chef"}</button>
        <button class="secondary danger-lite" data-remove-report-entry type="button">Vollständig löschen</button>
      </div>
      </div>
    </details>
  `;
}

function expenseRowHtml(item = {}) {
  const id = item.id || cryptoId();
  const receipts = expenseReceiptEntries(item);
  return `
    <article class="report-entry" data-report-entry="expense" data-id="${escapeHtml(id)}">
      <div class="report-entry-grid">
        <label>Ausgabe<input data-report-field="name" value="${escapeHtml(item.name || "")}" placeholder="z.B. Penny Wasser"></label>
        <label>Kategorie<input data-report-field="category" value="${escapeHtml(item.category || "")}" placeholder="z.B. Einkauf"></label>
        <label>Betrag<input data-report-field="amount" type="number" min="0" step="0.01" value="${escapeHtml(item.amount || "")}" placeholder="0,00"></label>
      </div>
      <label>Notiz<input data-report-field="note" value="${escapeHtml(item.note || "")}" placeholder="optional"></label>
      <div class="expense-receipts">
        <div class="expense-receipt-list">
          ${receipts.length ? receipts.map((receipt, index) => `
            <div class="expense-receipt-saved" data-expense-receipt="${index}">
              <span>${escapeHtml(receipt.receiptName || `Beleg ${index + 1}`)}</span>
              ${receiptLinkHtml(receipt, "öffnen")}
              <input type="hidden" data-expense-receipt-field="receiptName" value="${escapeHtml(receipt.receiptName || "")}">
              <input type="hidden" data-expense-receipt-field="receiptData" value="${escapeHtml(receipt.receiptData || "")}">
              <input type="hidden" data-expense-receipt-field="receiptPath" value="${escapeHtml(receipt.receiptPath || "")}">
              <input type="hidden" data-expense-receipt-field="receiptUrl" value="${escapeHtml(receipt.receiptUrl || "")}">
            </div>
          `).join("") : `<p class="hint">Noch kein Beleg hochgeladen.</p>`}
        </div>
        <div class="expense-receipt-upload-list">
          ${expenseReceiptUploadHtml()}
        </div>
        <button class="secondary expense-add-receipt" data-add-expense-receipt type="button">+ Beleg hinzufügen</button>
      </div>
      <input type="hidden" data-report-field="receiptName" value="${escapeHtml(item.receiptName || "")}">
      <input type="hidden" data-report-field="receiptData" value="${escapeHtml(item.receiptData || "")}">
      <input type="hidden" data-report-field="receiptPath" value="${escapeHtml(item.receiptPath || "")}">
      <input type="hidden" data-report-field="receiptUrl" value="${escapeHtml(item.receiptUrl || "")}">
      <div class="report-entry-actions">
        <button class="primary" data-save-expense-entry type="button">Ausgabe speichern</button>
        <button class="secondary danger-lite" data-remove-report-entry type="button">Ausgabe löschen</button>
      </div>
    </article>
  `;
}

function expenseReceiptUploadHtml() {
  return `<label class="expense-receipt-upload">Beleg scannen/fotografieren<input data-expense-receipt-file type="file" accept="image/*,application/pdf" capture="environment"></label>`;
}

function cryptoId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function collectReportEntries(type) {
  return collectReportEntriesFrom(document, type);
}

function mergeReportItemsById(existing = [], current = []) {
  const merged = new Map();
  (Array.isArray(existing) ? existing : []).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const id = item.id || cryptoId();
    merged.set(id, { ...item, id });
  });
  (Array.isArray(current) ? current : []).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const id = item.id || cryptoId();
    const previous = merged.get(id) || {};
    const next = { ...previous, ...item, id };
    if (!expenseReceiptEntries(item).length && expenseReceiptEntries(previous).length) {
      next.receipts = previous.receipts;
      next.receiptName = previous.receiptName;
      next.receiptData = previous.receiptData;
      next.receiptPath = previous.receiptPath;
      next.receiptUrl = previous.receiptUrl;
    }
    merged.set(id, next);
  });
  return [...merged.values()];
}

async function collectExpenseReceipts(row) {
  const receipts = [];
  row.querySelectorAll("[data-expense-receipt]").forEach((receiptRow) => {
    const receipt = {};
    receiptRow.querySelectorAll("[data-expense-receipt-field]").forEach((field) => {
      receipt[field.dataset.expenseReceiptField] = field.value;
    });
    if (receipt.receiptName || receipt.receiptPath || receipt.receiptUrl || receipt.receiptData) receipts.push(receipt);
  });
  for (const field of [...row.querySelectorAll("[data-expense-receipt-file]")]) {
    const file = field.files?.[0];
    if (!file) continue;
    receipts.push({
      receiptName: file.name,
      receiptData: await fileToDataUrl(file),
      receiptPath: "",
      receiptUrl: ""
    });
  }
  return receipts;
}

async function collectReportEntriesFrom(root, type) {
  const selector = type === "invoice" ? '[data-report-entry="invoice"]' : '[data-report-entry="expense"]';
  const entries = [];
  for (const row of [...(root || document).querySelectorAll(selector)]) {
    const item = { id: row.dataset.id || cryptoId() };
    row.querySelectorAll("[data-report-field]").forEach((field) => {
      item[field.dataset.reportField] = field.value;
    });
    if (type === "expense") {
      item.receipts = await collectExpenseReceipts(row);
    } else {
      const genericFile = row.querySelector("[data-report-file]:not([data-report-file='bowling']):not([data-report-file='gastro'])")?.files?.[0];
      if (genericFile) {
        item.receiptName = genericFile.name;
        item.receiptData = await fileToDataUrl(genericFile);
      }
    }
    const bowlingFile = row.querySelector("[data-report-file='bowling']")?.files?.[0];
    if (bowlingFile) {
      item.bowlingReceiptName = bowlingFile.name;
      item.bowlingReceiptData = await fileToDataUrl(bowlingFile);
    }
    const gastroFile = row.querySelector("[data-report-file='gastro']")?.files?.[0];
    if (gastroFile) {
      item.gastroReceiptName = gastroFile.name;
      item.gastroReceiptData = await fileToDataUrl(gastroFile);
    }
    entries.push(item);
  }
  return entries.filter((item) => (
    item.name ||
    item.amount ||
    item.note ||
    item.address ||
    item.email ||
    item.contact ||
    item.phone ||
    item.tip ||
    item.category ||
    item.receiptData ||
    item.receiptPath ||
    expenseReceiptEntries(item).length ||
    item.bowlingReceiptData ||
    item.bowlingReceiptPath ||
    item.gastroReceiptData ||
    item.gastroReceiptPath
  ));
}

async function collectReportDocuments() {
  const documents = { penta: {}, handwriting: {}, ecCut: {} };
  $$("[data-report-document]").forEach((field) => {
    const key = field.dataset.reportDocument;
    const name = field.dataset.documentField;
    documents[key] ||= {};
    documents[key][name] = field.value;
  });
  const pentaFile = $("#reportDocumentPenta")?.files?.[0];
  if (pentaFile) {
    documents.penta.name = pentaFile.name;
    documents.penta.data = await fileToDataUrl(pentaFile);
  }
  const handwritingFile = $("#reportDocumentHandwriting")?.files?.[0];
  if (handwritingFile) {
    documents.handwriting.name = handwritingFile.name;
    documents.handwriting.data = await fileToDataUrl(handwritingFile);
  }
  const ecCutFile = $("#reportDocumentEcCut")?.files?.[0];
  if (ecCutFile) {
    documents.ecCut.name = ecCutFile.name;
    documents.ecCut.data = await fileToDataUrl(ecCutFile);
  }
  return documents;
}

async function collectDayReportPayload() {
  const tipResult = calculateTipDistribution(state.terminalDate || todayKey());
  return {
    action: "save-report",
    cashTotal: $("#reportCashTotal")?.value || "",
    cashExpenses: cashExpensesFromFormOrReport().toFixed(2),
    ecTerminal1: $("#reportEcTerminal1")?.value || "",
    ecTerminal2: $("#reportEcTerminal2")?.value || "",
    ecTotal: ecTotalFromFormOrReport().toFixed(2),
    personalConsumption: $("#reportPersonalConsumption")?.value || "",
    revenueBowling: $("#reportRevenueBowling")?.value || "",
    revenueDrinks: $("#reportRevenueDrinks")?.value || "",
    revenueFood: $("#reportRevenueFood")?.value || "",
    revenueOther: $("#reportRevenueOther")?.value || "",
    revenueGastro: gastroRevenueFromFormOrReport().toFixed(2),
    barBowling: $("#reportRevenueBowling")?.value || "",
    barGastro: gastroRevenueFromFormOrReport().toFixed(2),
    tipTotal: tipResult.tipTotal.toFixed(2),
    tipRemainder: tipResult.tipRemainder.toFixed(2),
    tipsByEmployee: Object.fromEntries(tipResult.rows.map((row) => [row.employee, row.tip.toFixed(2)])),
    openingHours: $("#terminalOpeningHours")?.value || "",
    shiftLeader: $("#terminalShiftLeader")?.value || "",
    handovers: state.terminalReport.handovers || [],
    invoiceCustomers: await collectReportEntries("invoice"),
    expenses: await collectReportEntries("expense"),
    documents: await collectReportDocuments(),
    notes: $("#reportNotes").value,
    extraEmployees: state.terminalReport.extraEmployees || [],
    removedEmployees: state.terminalReport.removedEmployees || [],
    taskCompletions: state.terminalReport.taskCompletions || {},
    cleaningCompletions: state.terminalReport.cleaningCompletions || {},
    toiletChecks: state.terminalReport.toiletChecks || [],
    reminderChecks: state.terminalReport.reminderChecks || []
  };
}

async function collectCustomerInvoiceDocuments() {
  const documents = cloneData(state.invoiceReport?.documents || { penta: {}, handwriting: {}, ecCut: {} });
  $$("[data-customer-report-document]").forEach((field) => {
    const key = field.dataset.customerReportDocument;
    const name = field.dataset.documentField;
    documents[key] ||= {};
    documents[key][name] = field.value;
  });
  const pentaFile = $("#customerReportDocumentPenta")?.files?.[0];
  if (pentaFile) {
    documents.penta ||= {};
    documents.penta.name = pentaFile.name;
    documents.penta.data = await fileToDataUrl(pentaFile);
  }
  const handwritingFile = $("#customerReportDocumentHandwriting")?.files?.[0];
  if (handwritingFile) {
    documents.handwriting ||= {};
    documents.handwriting.name = handwritingFile.name;
    documents.handwriting.data = await fileToDataUrl(handwritingFile);
  }
  const ecCutFile = $("#customerReportDocumentEcCut")?.files?.[0];
  if (ecCutFile) {
    documents.ecCut ||= {};
    documents.ecCut.name = ecCutFile.name;
    documents.ecCut.data = await fileToDataUrl(ecCutFile);
  }
  return documents;
}

async function collectCustomerInvoiceDeskPayload() {
  const report = state.invoiceReport || {};
  const root = $("#customerInvoiceStaffArea") || document;
  return {
    action: "save-report",
    date: state.invoiceDate || todayKey(),
    ecTotal: report.ecTotal || "",
    personalConsumption: report.personalConsumption || "",
    revenueBowling: report.revenueBowling || report.barBowling || "",
    revenueDrinks: report.revenueDrinks || "",
    revenueFood: report.revenueFood || "",
    revenueOther: report.revenueOther || "",
    revenueGastro: report.revenueGastro || report.barGastro || "",
    barBowling: report.barBowling || "",
    barGastro: report.barGastro || "",
    openingHours: report.openingHours || "",
    shiftLeader: report.shiftLeader || "",
    handovers: report.handovers || [],
    invoiceCustomers: await collectReportEntriesFrom(root, "invoice"),
    expenses: await collectReportEntriesFrom(root, "expense"),
    documents: await collectCustomerInvoiceDocuments(),
    notes: report.notes || "",
    taskCompletions: report.taskCompletions || {},
    cleaningCompletions: report.cleaningCompletions || {},
    toiletChecks: report.toiletChecks || [],
    reminderChecks: report.reminderChecks || []
  };
}

async function acknowledgeDashboardMessage(messageId, button) {
  if (!messageId || !state.employeeToken) {
    showToast("Bitte erneut mit Mitarbeiter-PIN anmelden.");
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Speichert...";
  }
  try {
    await api("/api/state", {
      method: "POST",
      body: JSON.stringify({
        action: "ack-message",
        employeeToken: state.employeeToken,
        messageId
      })
    });
    state.messages = (state.messages || []).map((message) => {
      if (message.id !== messageId) return message;
      return {
        ...message,
        readBy: {
          ...(message.readBy || {}),
          [state.activeEmployee]: new Date().toISOString()
        }
      };
    }).filter((message) => {
      if (message.id !== messageId) return true;
      const recipients = messageRecipientsClient(message);
      return !recipients.length || !recipients.every((employee) => message.readBy?.[employee]);
    });
    renderHome();
    renderChef();
    renderAdminMessages();
    showToast("Nachricht als gelesen bestätigt.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText || "Gelesen";
    }
  }
}

async function loadCustomerInvoiceDesk() {
  if (!state.invoiceTerminalToken) return;
  const result = await api("/api/day-terminal", {
    method: "POST",
    body: JSON.stringify({
      action: "load",
      date: state.invoiceDate || todayKey(),
      terminalToken: state.invoiceTerminalToken
    })
  });
  state.invoiceDate = result.date || state.invoiceDate || todayKey();
  state.invoiceReport = result.report || {};
  state.settings = normalizeSettings(result.settings || state.settings);
  state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
  renderCustomerInvoiceDesk();
}

async function saveCustomerInvoiceDeskReport(button, successText = "Tagesübersicht gespeichert.") {
  return saveCustomerInvoiceDeskReportWithOptions(button, successText);
}

async function saveCustomerInvoiceDeskReportWithOptions(button, successText = "Tagesübersicht gespeichert.", options = {}) {
  if (!state.invoiceTerminalToken) {
    showToast("Bitte Mitarbeiter-Code eingeben.");
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Speichert...";
  }
  if (button?.type === "file") {
    showToast("Dokument wird verkleinert und gespeichert...");
  }
  try {
    const payload = await collectCustomerInvoiceDeskPayload();
    if (options.mergeExpenses) {
      payload.expenses = mergeReportItemsById(state.invoiceReport?.expenses || [], payload.expenses || []);
      payload.mergeExpenses = true;
    }
    const result = await api("/api/day-terminal", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        sendInvoiceNotifications: Boolean(options.sendInvoiceNotifications),
        sendInvoiceNotificationId: String(options.sendInvoiceNotificationId || "").trim(),
        terminalToken: state.invoiceTerminalToken
      })
    });
    state.invoiceDate = result.date || state.invoiceDate || todayKey();
    state.invoiceReport = result.report || {};
    state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
    state.dayReports[state.invoiceDate] = state.invoiceReport;
    renderCustomerInvoiceDesk();
    const displayMessage = result?.mailMessage ? `${successText} ${result.mailMessage}` : successText;
    $("#customerInvoiceStaffStatus").textContent = displayMessage;
    showToast(displayMessage);
    return result;
  } catch (error) {
    showError(error);
    if (String(error.message || "").includes("Terminal-Code")) {
      state.invoiceTerminalToken = "";
      window.localStorage?.removeItem("invoiceTerminalToken");
      renderCustomerInvoiceDesk();
    }
  } finally {
    if (button) {
      button.textContent = oldText;
      button.disabled = false;
    }
  }
}

async function saveCustomerInvoiceDeskRow(button, markReady = false) {
  const row = button.closest('[data-report-entry="invoice"]');
  if (!row) return;
  if (markReady) {
    const problems = invoiceRowReadyProblems(row);
    if (problems.length) {
      showToast(`Noch offen: ${problems.join(", ")}.`);
      return;
    }
    setReportFieldValue(row, "invoiceReady", "true");
    setReportFieldValue(row, "invoiceReadyAt", new Date().toISOString());
  }
  await saveCustomerInvoiceDeskReport(button, markReady ? "Rechnung ist fertig für Chef." : "Rechnungskunde zwischengespeichert.", {
    sendInvoiceNotifications: markReady,
    sendInvoiceNotificationId: row.dataset.id || ""
  });
}

async function removeCustomerInvoiceDeskEntry(button) {
  const row = button.closest(".report-entry");
  if (!row) return;
  const isInvoice = row.dataset.reportEntry === "invoice";
  if (isInvoice && row.dataset.saved === "true" && !window.confirm("Rechnungskunden wirklich vollständig löschen? Der Eintrag verschwindet dann aus allen Ansichten.")) return;
  row.remove();
  await saveCustomerInvoiceDeskReport(button, isInvoice ? "Rechnungskunde gelöscht." : "Eintrag gelöscht.");
}

function reportFieldValue(row, name) {
  return row.querySelector(`[data-report-field="${name}"]`)?.value || "";
}

function setReportFieldValue(row, name, value) {
  const field = row.querySelector(`[data-report-field="${name}"]`);
  if (field) field.value = value;
}

function invoiceRowHasReceipt(row) {
  if (row.querySelector("[data-report-file]")?.files?.[0]) return true;
  return [
    "receiptData",
    "receiptPath",
    "receiptUrl",
    "bowlingReceiptData",
    "bowlingReceiptPath",
    "bowlingReceiptUrl",
    "gastroReceiptData",
    "gastroReceiptPath",
    "gastroReceiptUrl"
  ].some((field) => Boolean(reportFieldValue(row, field)));
}

function invoiceRowReadyProblems(row) {
  const problems = [];
  if (!reportFieldValue(row, "name")) problems.push("Firma/Name fehlt");
  if (!reportFieldValue(row, "address")) problems.push("Rechnungsadresse fehlt");
  if (!reportFieldValue(row, "email")) problems.push("E-Mail fehlt");
  const gastroAmount = reportFieldValue(row, "gastroAmount");
  const gastroDrinks = reportFieldValue(row, "gastroDrinksAmount");
  const gastroFood = reportFieldValue(row, "gastroFoodAmount");
  const gastroOther = reportFieldValue(row, "gastroOtherAmount");
  const amount = parseMoneyInput(reportFieldValue(row, "bowlingAmount")) + invoiceGastroSplit({
    gastroAmount,
    gastroDrinksAmount: gastroDrinks,
    gastroFoodAmount: gastroFood,
    gastroOtherAmount: gastroOther
  }).total;
  if (amount <= 0) problems.push("Bowling- oder Gastro-Betrag fehlt");
  if (reportMoneyNumber(gastroOther) > 0 && !reportFieldValue(row, "gastroOtherNote")) problems.push("Notiz für Sonstiges fehlt");
  if (!invoiceRowHasReceipt(row)) problems.push("Rechnungsbeleg fehlt");
  return problems;
}

async function saveInvoiceRow(button, markReady = false) {
  const row = button.closest('[data-report-entry="invoice"]');
  if (!row) return;
  if (markReady) {
    const problems = invoiceRowReadyProblems(row);
    if (problems.length) {
      showToast(`Noch offen: ${problems.join(", ")}.`);
      return;
    }
    setReportFieldValue(row, "invoiceReady", "true");
    setReportFieldValue(row, "invoiceReadyAt", new Date().toISOString());
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await terminalAction(await collectDayReportPayload());
    const toastMessage = markReady
      ? ["Rechnung ist fertig für Chef.", result?.mailMessage].filter(Boolean).join(" ")
      : "Rechnungskunde zwischengespeichert.";
    showToast(toastMessage);
  } catch (error) {
    if (markReady) setReportFieldValue(row, "invoiceReady", "false");
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

async function removeTerminalFinanceEntry(button) {
  const row = button.closest(".report-entry");
  if (!row || state.terminalReport?.closed) return;
  const isInvoice = row.dataset.reportEntry === "invoice";
  if (isInvoice && row.dataset.saved === "true" && !window.confirm("Rechnungskunden wirklich vollständig löschen? Der Eintrag verschwindet dann aus allen Ansichten.")) return;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Löscht...";
  row.remove();
  syncCashExpensesFromExpenseRows(true);
  updateReportBarTotal();
  try {
    await terminalAction(await collectDayReportPayload());
    showToast(isInvoice ? "Rechnungskunde gelöscht." : "Eintrag gelöscht.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

async function saveExpenseRow(button) {
  const row = button.closest('[data-report-entry="expense"]');
  if (!row || state.terminalReport?.closed) return;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  syncCashExpensesFromExpenseRows(true);
  updateReportBarTotal();
  try {
    const payload = await collectDayReportPayload();
    payload.expenses = mergeReportItemsById(state.terminalReport?.expenses || [], payload.expenses || []);
    payload.cashExpenses = payload.expenses.reduce((sum, item) => sum + parseMoneyInput(item.amount), 0).toFixed(2);
    payload.mergeExpenses = true;
    await terminalAction(payload);
    showToast("Ausgabe gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

async function fileToDataUrl(file) {
  if (file.type?.startsWith("image/")) {
    return compressImageFile(file);
  }
  if (file.size > 3 * 1024 * 1024) {
    throw new Error("PDF ist zu groß. Bitte Datei auf maximal 3 MB verkleinern oder als Foto hochladen.");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Beleg konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Beleg konnte nicht gelesen werden."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Bild konnte nicht verarbeitet werden."));
      image.onload = () => {
        const maxSide = 1500;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        let quality = 0.68;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > 1500000 && quality > 0.36) {
          quality -= 0.07;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        if (dataUrl.length > 1900000) {
          reject(new Error("Dokument ist trotz Verkleinerung zu groß. Bitte Foto näher zuschneiden oder etwas weniger Rand fotografieren."));
          return;
        }
        resolve(dataUrl);
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function terminalEmployeesForDay(dateKey) {
  const names = new Set();
  const removed = new Set(state.terminalReport?.removedEmployees || []);
  const schedule = state.terminalSchedule || {};
  Object.entries(schedule).forEach(([key, value]) => {
    if (!key.includes("__") && value) names.add(String(value));
  });
  (state.terminalReport?.extraEmployees || []).forEach((item) => {
    names.add(typeof item === "string" ? item : item.employee);
  });
  return [...names].filter((employee) => (state.settings.employees || []).includes(employee) && !removed.has(employee));
}

function terminalIsPlanned(employee) {
  return Object.entries(state.terminalSchedule || {}).some(([key, value]) => !key.includes("__") && value === employee);
}

function terminalPlannedShiftFor(employee) {
  for (const [position, value] of Object.entries(state.terminalSchedule || {})) {
    if (position.includes("__") || value !== employee) continue;
    return parsePlannedTime(state.terminalSchedule[`${position}__note`]);
  }
  return { from: "", to: "", hours: 0, label: "" };
}

function renderTerminalCosts(dateKey, employees) {
  const target = $("#terminalCostSummary");
  if (!target) return;
  const hourlyRate = currentHourlyRate();
  const planned = terminalPlannedCosts();
  const actualHours = employees.reduce((total, employee) => {
    const entry = state.terminalEntries?.[employee]?.[dateKey] || {};
    return total + paidHours(entry);
  }, 0);
  const actualCost = actualHours * hourlyRate;
  const difference = actualCost - planned.cost;
  const diffText = difference <= 0
    ? `${formatMoney(Math.abs(difference))} unter Prognose`
    : `${formatMoney(difference)} über Prognose`;
  target.innerHTML = `
    <article>
      <span>Plan</span>
      <strong>${formatMoney(planned.cost)}</strong>
      <small>${formatHours(planned.hours)}</small>
    </article>
    <article>
      <span>Ist</span>
      <strong>${formatMoney(actualCost)}</strong>
      <small>${formatHours(actualHours)}</small>
    </article>
    <article class="${difference <= 0 ? "cost-good" : "cost-high"}">
      <span>Delta</span>
      <strong>${diffText}</strong>
      <small>${formatMoney(hourlyRate)}/h</small>
    </article>
  `;
}

function renderTipDistribution() {
  renderDailyTipDistribution();
  renderTipPayoutOverview();
}

function renderDailyTipDistribution() {
  const summaryTargets = [$("#financeTipDaySummary")].filter(Boolean);
  const listTargets = [$("#financeTipDayDistributionList"), $("#dayReportTipDayDistribution")].filter(Boolean);
  if (!summaryTargets.length && !listTargets.length) return;
  const result = calculateTipDistribution(state.terminalDate || todayKey());
  const report = {
    ...(state.terminalReport || {}),
    cashTotal: result.cashTotal.toFixed(2),
    cashExpenses: result.cashExpenses.toFixed(2),
    ecTotal: result.ecTotal.toFixed(2),
    personalConsumption: result.personalConsumption.toFixed(2),
    revenueBowling: result.revenueBowling.toFixed(2),
    revenueDrinks: result.revenueDrinks.toFixed(2),
    revenueFood: result.revenueFood.toFixed(2),
    revenueOther: result.revenueOther.toFixed(2),
    revenueGastro: result.revenueGastro.toFixed(2),
    barBowling: result.revenueBowling.toFixed(2),
    barGastro: result.revenueGastro.toFixed(2),
    tipTotal: result.tipTotal.toFixed(2),
    tipRemainder: result.tipRemainder.toFixed(2),
    tipsByEmployee: Object.fromEntries(result.rows.map((row) => [row.employee, row.tip.toFixed(2)]))
  };
  const displayRows = dailyTipRowsForDisplay(result, state.terminalReport || {});
  const distributed = displayRows.reduce((sum, row) => sum + Number(row.tip || 0), 0);
  const chefHandover = reportChefHandoverTotal(report);
  const cashAfterExpenses = Math.max(0, result.cashTotal - result.cashExpenses);
  const summaryHtml = `
    <article>
      <span>Trinkgeld gesamt</span>
      <strong>${formatMoney(result.tipTotal)}</strong>
      <small>Bar + Ausgaben + EC - Umsatz nach Personalverzehr</small>
    </article>
    <article class="tip-summary-handover">
      <span>Abzugeben an Chef</span>
      <strong>${formatMoney(chefHandover)}</strong>
      <small>Umsatz minus EC, Rechnung und Ausgaben</small>
    </article>
    <article>
      <span>Bar nach Ausgaben</span>
      <strong>${formatMoney(cashAfterExpenses)}</strong>
      <small>Bar gesamt - ${formatMoney(result.cashExpenses)}</small>
    </article>
  `;
  const listHtml = displayRows.length ? `
    <section class="tip-group">
      <div class="terminal-task-group-head">
        <h4>Wer bekommt wie viel Trinkgeld?</h4>
        <span>${formatMoney(distributed)} verteilt</span>
      </div>
      <div class="tip-rows">
        <article class="tip-row tip-row-head">
          <strong>Mitarbeiter</strong>
          <span>Bereich</span>
          <span>Stunden</span>
          <span>Berechnung</span>
          <strong>Trinkgeld</strong>
        </article>
        ${displayRows.map((row) => `
          <article class="tip-row">
            <strong>${escapeHtml(row.employee)}</strong>
            <span>${escapeHtml(tipAreaLabel(row.area))}</span>
            <span>${formatHours(row.hours)}</span>
            <span class="tip-raw">${formatMoney(row.rawTip)} roh${row.factor !== 1 ? ` · Faktor ${String(row.factor).replace(".", ",")}` : ""}</span>
            <strong>${formatMoney(row.tip)}</strong>
          </article>
        `).join("")}
      </div>
    </section>
  ` : `<p class="hint">Noch keine Trinkgeld-Verteilung möglich. Dafür braucht es Arbeitszeiten mit Dienstende und Umsatzdetails.</p>`;
  summaryTargets.forEach((target) => { target.innerHTML = summaryHtml; });
  listTargets.forEach((target) => { target.innerHTML = listHtml; });
}

function dailyTipRowsForDisplay(result = {}, report = {}) {
  const calculatedRows = Array.isArray(result.rows) ? result.rows : [];
  if (calculatedRows.length) return calculatedRows;
  const savedRows = reportTipRows(report);
  if (!savedRows.length) return [];
  const dateKey = state.terminalDate || todayKey();
  return savedRows.map((row) => {
    const entry = state.terminalEntries?.[row.employee]?.[dateKey] || {};
    const hours = paidHoursAfterOpening(entry, tipOpeningTime(dateKey));
    return {
      employee: row.employee,
      area: tipAreaForEmployee(row.employee),
      hours,
      factor: 1,
      rawTip: row.amount,
      tip: row.amount
    };
  });
}

function tipAreaLabel(area) {
  if (!area) return "Trinkgeld";
  if (area === "Kueche") return "Küche";
  if (area === "Spueler") return "Spüler";
  return area || "Bereich offen";
}

function renderTipPayoutOverview() {
  const summary = $("#tipSummary");
  const list = $("#tipDistributionList");
  if (!summary || !list) return;
  const overview = normalizedTipOverview();
  const rows = overview.employees;
  const openRows = rows.filter((row) => reportMoneyNumber(row.openAmount) > 0);
  const status = $("#tipPayoutStatus");
  if (status) {
    status.textContent = openRows.length
      ? `${openRows.length} Mitarbeiter mit offener Auszahlung. Auszahlung setzt nur diese Übersicht zurück.`
      : "Keine offenen Trinkgeld-Auszahlungen. Mitarbeiter-App bleibt unverändert.";
  }
  summary.innerHTML = `
    <article>
      <span>Offen auszuzahlen</span>
      <strong>${formatMoney(overview.totalOpen)}</strong>
      <small>nur Terminal-Übersicht</small>
    </article>
    <article>
      <span>Bereits bestätigt</span>
      <strong>${formatMoney(overview.totalPaid)}</strong>
      <small>historische Mitarbeiterwerte bleiben erhalten</small>
    </article>
  `;
  list.innerHTML = rows.length ? `
    <section class="tip-group">
      <div class="terminal-task-group-head">
        <h4>Mitarbeiter</h4>
        <span>${formatMoney(overview.totalOpen)} offen</span>
      </div>
      <div class="tip-rows">
        ${rows.map((row) => {
          const openAmount = reportMoneyNumber(row.openAmount);
          const lastPaid = row.lastPaidAt ? formatDateTime(row.lastPaidAt) : "Noch keine Auszahlung";
          return `
            <article class="tip-payout-row ${openAmount > 0 ? "" : "is-paid"}">
              <strong>${escapeHtml(row.employee)}</strong>
              <span><small>Offen</small>${formatMoney(openAmount)}</span>
              <span><small>Gesamt</small>${formatMoney(row.earnedAmount)}</span>
              <span><small>Ausbezahlt</small>${formatMoney(row.paidAmount)}</span>
              <span><small>Letzte Auszahlung</small>${escapeHtml(lastPaid)}</span>
              <button class="primary" type="button" data-confirm-tip-payout-employee="${escapeHtml(row.employee)}" ${openAmount > 0 ? "" : "disabled"}>${openAmount > 0 ? "Ausbezahlt" : "0,00 €"}</button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  ` : `<p class="hint">Noch keine Mitarbeiter in der Trinkgeld-Übersicht.</p>`;
}

function normalizedTipOverview() {
  const overview = state.tipOverview || {};
  const rowsByEmployee = new Map((Array.isArray(overview.employees) ? overview.employees : []).map((row) => [row.employee, row]));
  (state.settings?.employees || []).forEach((employee) => {
    if (!rowsByEmployee.has(employee)) {
      rowsByEmployee.set(employee, { employee, earnedAmount: "0.00", paidAmount: "0.00", openAmount: "0.00", lastPaidAt: "", payoutCount: 0 });
    }
  });
  const employees = [...rowsByEmployee.values()].map((row) => ({
    employee: String(row.employee || ""),
    earnedAmount: moneyText(row.earnedAmount),
    paidAmount: moneyText(row.paidAmount),
    openAmount: moneyText(row.openAmount),
    lastPaidAt: row.lastPaidAt || "",
    payoutCount: Number(row.payoutCount || 0)
  })).filter((row) => row.employee).sort((a, b) => a.employee.localeCompare(b.employee, "de"));
  return {
    employees,
    totalEarned: moneyText(overview.totalEarned ?? employees.reduce((sum, row) => sum + reportMoneyNumber(row.earnedAmount), 0)),
    totalPaid: moneyText(overview.totalPaid ?? employees.reduce((sum, row) => sum + reportMoneyNumber(row.paidAmount), 0)),
    totalOpen: moneyText(overview.totalOpen ?? employees.reduce((sum, row) => sum + reportMoneyNumber(row.openAmount), 0))
  };
}

function moneyText(value) {
  return reportMoneyNumber(value).toFixed(2);
}

function calculateTipDistribution(dateKey) {
  const cashTotal = parseMoneyInput($("#reportCashTotal")?.value || state.terminalReport?.cashTotal || "");
  const cashExpenses = cashExpensesFromFormOrReport();
  const ecTotal = ecTotalFromFormOrReport();
  const personalConsumption = parseMoneyInput($("#reportPersonalConsumption")?.value || state.terminalReport?.personalConsumption || "");
  const revenueBowling = parseMoneyInput($("#reportRevenueBowling")?.value || state.terminalReport?.revenueBowling || state.terminalReport?.barBowling || "");
  const revenueFood = parseMoneyInput($("#reportRevenueFood")?.value || state.terminalReport?.revenueFood || "");
  const revenueGastro = gastroRevenueFromFormOrReport();
  const totalRevenue = Math.max(0, revenueBowling + revenueGastro - personalConsumption);
  const tipTotal = Math.max(0, cashTotal + cashExpenses + ecTotal - totalRevenue);
  const openingTime = tipOpeningTime(dateKey);
  const entries = state.terminalEntries || {};
  const employees = terminalTipEmployeesForDay(dateKey);
  let baseRows = employees.map((employee) => {
    const entry = entries[employee]?.[dateKey] || {};
    const area = tipAreaForEmployee(employee);
    const hours = paidHoursAfterOpening(entry, openingTime);
    return { employee, area, hours };
  }).filter((row) => employeeTipEligible(row.employee, row.area) && row.hours > 0);
  if (!baseRows.length) {
    baseRows = Object.entries(entries).map(([employee, employeeEntries]) => {
      const entry = employeeEntries?.[dateKey] || {};
      const area = tipAreaForEmployee(employee);
      const hours = paidHoursAfterOpening(entry, openingTime);
      return { employee, area, hours };
    }).filter((row) => employeeTipEligible(row.employee, row.area) && row.hours > 0);
  }
  const kitchenInfo = tipKitchenInfo(baseRows, revenueFood);
  const rowsWithWeight = baseRows.map((row) => {
    const factor = tipFactorForEmployee(row.employee, row.area, kitchenInfo);
    return { ...row, factor, weight: row.hours * factor };
  });
  const totalWeight = rowsWithWeight.reduce((sum, row) => sum + row.weight, 0);
  const exactTips = exactTipAmounts(rowsWithWeight, tipTotal);
  const rows = rowsWithWeight.map((row) => {
    const rawTip = totalWeight > 0 ? tipTotal * row.weight / totalWeight : 0;
    return {
      ...row,
      rawTip,
      tip: exactTips[row.employee] || 0
    };
  });
  const distributedTipTotal = rows.reduce((sum, row) => sum + row.tip, 0);
  const tipRemainder = Math.max(0, Math.round((tipTotal - distributedTipTotal) * 100) / 100);
  return {
    cashTotal,
    cashExpenses,
    cashAfterExpenses: Math.max(0, cashTotal - cashExpenses),
    ecTotal,
    personalConsumption,
    revenueBowling,
    revenueDrinks: parseMoneyInput($("#reportRevenueDrinks")?.value || state.terminalReport?.revenueDrinks || ""),
    revenueFood,
    revenueOther: parseMoneyInput($("#reportRevenueOther")?.value || state.terminalReport?.revenueOther || ""),
    revenueGastro,
    totalRevenue,
    tipTotal,
    distributedTipTotal,
    tipRemainder,
    cashToBoss: Math.max(0, cashTotal - tipTotal),
    rows
  };
}

function terminalTipEmployeesForDay(dateKey) {
  const names = new Set(terminalEmployeesForDay(dateKey));
  Object.entries(state.terminalEntries || {}).forEach(([employee, entries]) => {
    const entry = entries?.[dateKey] || {};
    if (entryHasAnyTime(entry)) names.add(employee);
  });
  return [...names].filter(Boolean);
}

function exactTipAmounts(rows = [], tipTotal = 0) {
  const totalCents = Math.round(Math.max(0, Number(tipTotal) || 0) * 100);
  const totalWeight = rows.reduce((sum, row) => sum + Number(row.weight || 0), 0);
  if (!rows.length || totalCents <= 0 || totalWeight <= 0) return {};
  const shares = rows.map((row) => {
    const rawCents = totalCents * Number(row.weight || 0) / totalWeight;
    const cents = Math.floor(rawCents);
    return { employee: row.employee, cents, rest: rawCents - cents };
  });
  let remaining = totalCents - shares.reduce((sum, row) => sum + row.cents, 0);
  shares
    .slice()
    .sort((a, b) => b.rest - a.rest || a.employee.localeCompare(b.employee, "de"))
    .forEach((row) => {
      if (remaining <= 0) return;
      row.cents += 1;
      remaining -= 1;
    });
  return Object.fromEntries(shares.map((row) => [row.employee, row.cents / 100]));
}

function employeeTipEligible(employee, area) {
  const setting = tipSettingForEmployee(employee);
  if (setting) return setting.eligible;
  return isTipEligibleArea(area);
}

function tipFactorForEmployee(employee, area, kitchenInfo = {}) {
  const groupFactor = kitchenGroupTipFactor(area, kitchenInfo);
  if (groupFactor !== null) return groupFactor;
  const setting = tipSettingForEmployee(employee);
  if (setting) return setting.eligible ? setting.factor : 0;
  return automaticTipFactor(area, kitchenInfo);
}

function automaticTipFactor(area, kitchenInfo = {}) {
  return kitchenGroupTipFactor(area, kitchenInfo) ?? 1;
}

function kitchenGroupTipFactor(area, kitchenInfo = {}) {
  if (!isKitchenTipArea(area)) return null;
  const cooks = Number(kitchenInfo.cooks || 0);
  const spuelers = Number(kitchenInfo.spuelers || 0);
  const kitchenRevenue = Number(kitchenInfo.kitchenRevenue || 0);
  if (cooks >= 2 && spuelers >= 1 && kitchenRevenue >= 2000) return 1;
  if (cooks >= 2 && spuelers >= 1) return 0.5;
  if (area === "Kueche" && cooks >= 2) return 0.75;
  return null;
}

function tipKitchenInfo(rows = [], kitchenRevenue = 0) {
  return {
    cooks: rows.filter((row) => row.area === "Kueche").length,
    spuelers: rows.filter((row) => row.area === "Spueler").length,
    kitchenRevenue: Number(kitchenRevenue || 0)
  };
}

function tipSettingForEmployee(employee) {
  return tipSettingFromSettings(state.settings || {}, employee);
}

function tipSettingFromSettings(settings = {}, employee = "") {
  const tipSettings = settings.employeeTipSettings || {};
  const exact = tipSettings[employee];
  if (exact) return normalizeEmployeeTipSetting(exact);
  const clean = String(employee || "").trim().toLowerCase();
  const match = Object.entries(tipSettings).find(([name]) => String(name || "").trim().toLowerCase() === clean);
  return match ? normalizeEmployeeTipSetting(match[1]) : null;
}

function normalizeEmployeeTipSettings(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .map(([employee, setting]) => [String(employee || "").trim(), normalizeEmployeeTipSetting(setting)])
    .filter(([employee]) => employee));
}

function normalizeEmployeeTipSetting(setting = {}) {
  return {
    eligible: setting?.eligible === true,
    factor: normalizeTipFactor(setting?.factor, 1)
  };
}

function normalizeTipFactor(value, fallback = 1) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  const base = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(0.1, Math.min(1, Math.round(base * 1000) / 1000));
}

function tipOpeningTime(dateKey) {
  const text = $("#terminalOpeningHours")?.value || state.terminalReport?.openingHours || openingHoursFor(dateKey) || "";
  const match = String(text).match(/(\d{1,2}):(\d{2})/);
  return match ? `${String(match[1]).padStart(2, "0")}:${match[2]}` : "00:00";
}

function paidHoursAfterOpening(entry = {}, openingTime = "00:00") {
  const opening = timeToMinutes(openingTime);
  return timeSegments(entry).reduce((sum, segment) => {
    if (!segment.from || !segment.to) return sum;
    const start = timeToMinutes(segment.from);
    let end = timeToMinutes(segment.to);
    if (end < start) end += 24 * 60;
    const effectiveStart = Math.max(start, opening);
    return sum + Math.max(0, end - effectiveStart) / 60;
  }, 0);
}

function laterTime(left, right) {
  return timeToMinutes(left) >= timeToMinutes(right) ? left : right;
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value || "00:00").split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function tipAreaForEmployee(employee) {
  for (const [position, value] of Object.entries(state.terminalSchedule || {})) {
    if (!position.includes("__") && value === employee) return tipAreaFromText(position);
  }
  const extra = (state.terminalReport?.extraEmployees || [])
    .map((item) => typeof item === "string" ? { employee: item, role: "" } : item)
    .find((item) => item.employee === employee);
  if (extra?.role) return tipAreaFromText(extra.role);
  const roleDepartment = tipAreaFromText(state.settings.employeeRoles?.[employee] || "");
  if (roleDepartment) return roleDepartment;
  const departments = departmentsForEmployee(state.settings.employeeDepartments || {}, employee).map(tipAreaFromText);
  return TIP_ELIGIBLE_AREAS.find((area) => departments.includes(area)) || "";
}

function tipAreaFromText(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  if (text.includes("spuel") || text.includes("spül")) return "Spueler";
  if (text.includes("counter")) return "Counter";
  if (text.includes("service")) return "Service";
  if (text.includes("kueche") || text.includes("kuche") || text.includes("küche") || text.includes("koch")) return "Kueche";
  return "";
}

function isTipEligibleArea(area) {
  return TIP_ELIGIBLE_AREAS.includes(area);
}

function isKitchenTipArea(area) {
  return area === "Kueche" || area === "Spueler";
}

function terminalPlannedCosts() {
  const hourlyRate = currentHourlyRate();
  const totalHours = Object.entries(state.terminalSchedule || {}).reduce((sum, [position, employee]) => {
    if (position.includes("__") || !employee) return sum;
    return sum + parsePlannedTime(state.terminalSchedule[`${position}__note`]).hours;
  }, 0);
  return { hours: totalHours, cost: totalHours * hourlyRate };
}

function parsePlannedTime(value) {
  const text = String(value || "").trim();
  const match = text.match(/(\d{1,2})(?::?(\d{2}))?\s*(?:-|–|bis|to)\s*(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) return { from: "", to: "", hours: 0, label: "" };
  const from = `${String(match[1]).padStart(2, "0")}:${String(match[2] || "00").padStart(2, "0")}`;
  const to = `${String(match[3]).padStart(2, "0")}:${String(match[4] || "00").padStart(2, "0")}`;
  return { from, to, hours: hoursBetween(from, to), label: `${from}-${to}` };
}

async function terminalAction(payload) {
  const result = await api("/api/day-terminal", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      date: payload.date || state.terminalDate || todayKey(),
      terminalToken: state.terminalToken
    })
  });
  if (result.settings) state.settings = normalizeSettings(result.settings);
  state.terminalDate = result.date || state.terminalDate || isoDate(new Date());
  state.terminalEntries = result.entries || {};
  state.terminalReport = result.report || {};
  state.tipOverview = result.tipOverview || state.tipOverview;
  state.dayReports[state.terminalDate] = state.terminalReport;
  state.terminalSchedule = result.schedule || {};
  state.assignmentTimes = normalizeAssignmentTimes(result.assignmentTimes || state.assignmentTimes || {});
  state.assignmentSchedules = result.assignmentSchedules || state.assignmentSchedules || {};
  state.terminalTasks = result.tasks || [];
  state.terminalReminders = normalizeReminderTemplates(result.reminders);
  state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.cleaningTemplates);
  state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || {};
  state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
  state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
  state.terminalDayMetaEditing = false;
  state.terminalCorrectionMode = Boolean(result.correctionMode || state.terminalReport?.correctionOpen);
  state.timesheets = result.entries || state.timesheets || {};
  renderTerminal();
  renderAdminEmployeeOverview();
  return result;
}

async function terminalLogin(code) {
  const result = await api("/api/day-terminal", {
    method: "POST",
    body: JSON.stringify({ action: "login", code, date: todayKey() })
  });
  state.terminalToken = result.token || "";
  state.settings = normalizeSettings(result.settings || state.settings);
  state.terminalDate = result.date || isoDate(new Date());
  state.terminalEntries = result.entries || {};
  state.terminalReport = result.report || {};
  state.tipOverview = result.tipOverview || state.tipOverview;
  state.dayReports[state.terminalDate] = state.terminalReport;
  state.terminalSchedule = result.schedule || {};
  state.assignmentTimes = normalizeAssignmentTimes(result.assignmentTimes || state.assignmentTimes || {});
  state.assignmentSchedules = result.assignmentSchedules || state.assignmentSchedules || {};
  state.terminalTasks = result.tasks || [];
  state.terminalReminders = normalizeReminderTemplates(result.reminders);
  state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.cleaningTemplates);
  state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || {};
  state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
  state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
  state.terminalCorrectionMode = false;
  state.timesheets = result.entries || state.timesheets || {};
  renderTerminal();
  showToast(isTodoMode() ? "TO DO geöffnet." : "Tages-Terminal geöffnet.");
}

async function openCorrectionReport(button) {
  if (!state.adminToken) {
    showToast("Bitte Admin-Bereich erneut entsperren.");
    return;
  }
  const date = $("#correctionDate")?.value || "";
  const reason = $("#correctionReason")?.value.trim() || "";
  if (!date) {
    showToast("Bitte Datum wählen.");
    return;
  }
  if (!reason) {
    showToast("Bitte Grund der Korrektur eintragen.");
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Öffnet...";
  }
  try {
    const result = await api("/api/day-terminal", {
      method: "POST",
      body: JSON.stringify({
        action: "admin-open-correction",
        adminToken: state.adminToken,
        date,
        reason
      })
    });
    state.terminalToken = result.token || "";
    state.terminalDate = result.date || date;
    state.settings = normalizeSettings(result.settings || state.settings);
    state.terminalEntries = result.entries || {};
    state.terminalReport = result.report || {};
    state.tipOverview = result.tipOverview || state.tipOverview;
    state.dayReports[state.terminalDate] = state.terminalReport;
    state.terminalSchedule = result.schedule || {};
    state.assignmentTimes = normalizeAssignmentTimes(result.assignmentTimes || state.assignmentTimes || {});
    state.assignmentSchedules = result.assignmentSchedules || state.assignmentSchedules || {};
    state.terminalTasks = result.tasks || [];
    state.terminalReminders = normalizeReminderTemplates(result.reminders);
    state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.cleaningTemplates);
    state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || {};
    state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
    state.terminalCorrectionMode = true;
    state.timesheets = result.entries || state.timesheets || {};
    const status = $("#correctionStatus");
    if (status) status.textContent = result.message || "Korrekturmodus geöffnet.";
    activateTab("terminal");
    renderTerminal();
    showToast("Korrekturmodus geöffnet.");
  } catch (error) {
    const status = $("#correctionStatus");
    if (status) status.textContent = error.message || String(error);
    showError(error);
  } finally {
    if (button) {
      button.textContent = oldText;
      button.disabled = false;
    }
  }
}

async function closeCorrectionReport(button) {
  if (!state.adminToken) {
    showToast("Bitte Admin-Bereich erneut entsperren.");
    return;
  }
  const date = $("#correctionDate")?.value || state.terminalDate || "";
  if (!date) {
    showToast("Bitte Datum wählen.");
    return;
  }
  if (!confirm(`Tagesbericht ${formatDate(date)} wieder abschließen?`)) return;
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Schließt...";
  }
  try {
    const result = await api("/api/day-terminal", {
      method: "POST",
      body: JSON.stringify({
        action: "admin-close-correction",
        adminToken: state.adminToken,
        date
      })
    });
    state.terminalDate = result.date || date;
    state.terminalReport = result.report || state.terminalReport || {};
    state.tipOverview = result.tipOverview || state.tipOverview;
    state.dayReports[state.terminalDate] = state.terminalReport;
    state.terminalCorrectionMode = false;
    if (state.terminalDate === date) {
      state.terminalEntries = result.entries || state.terminalEntries || {};
      state.terminalSchedule = result.schedule || state.terminalSchedule || {};
      state.assignmentTimes = normalizeAssignmentTimes(result.assignmentTimes || state.assignmentTimes || {});
      state.assignmentSchedules = result.assignmentSchedules || state.assignmentSchedules || {};
      state.terminalTasks = result.tasks || state.terminalTasks || [];
      state.terminalReminders = normalizeReminderTemplates(result.reminders || state.terminalReminders);
      state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.terminalCleaningTemplates);
      state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || state.terminalWeeklyCleaningCompletions || {};
      state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
    }
    const status = $("#correctionStatus");
    if (status) status.textContent = result.message || "Tagesbericht wieder abgeschlossen.";
    renderTerminal();
    showToast("Tagesbericht wieder abgeschlossen.");
  } catch (error) {
    const status = $("#correctionStatus");
    if (status) status.textContent = error.message || String(error);
    showError(error);
  } finally {
    if (button) {
      button.textContent = oldText;
      button.disabled = false;
    }
  }
}

async function saveAdminTimesheet(button) {
  if (!state.adminToken) {
    showToast("Bitte Admin-Bereich erneut entsperren.");
    return;
  }
  const employee = button.dataset.adminSaveTimesheet || "";
  const form = button.closest(".admin-timesheet-form");
  const field = (name) => form?.querySelector(`[data-admin-ts-field="${name}"]`)?.value || "";
  const date = field("date");
  const from = field("from");
  const to = field("to");
  const note = field("note");
  if (!date || !from || !to) {
    showToast("Bitte Datum, Beginn und Ende eintragen.");
    return;
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await api("/api/timesheet", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "admin-save-time",
        adminToken: state.adminToken,
        employee,
        month: date.slice(0, 7),
        date,
        from,
        to,
        note
      })
    });
    if (date.startsWith(state.selectedMonth)) {
      state.timesheets = result.timesheets || state.timesheets || {};
    } else {
      state.selectedMonth = date.slice(0, 7);
      $("#monthInput").value = state.selectedMonth;
      await loadState();
      showToast("Stunden nachgetragen. Monat wurde gewechselt.");
      return;
    }
    renderAdminEmployeeOverview();
    showToast("Stunden nur durch Admin nachgetragen.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

async function confirmToiletCheck() {
  if (!state.pendingReminder?.checkKey && !state.pendingToiletCheck) return { ok: true, message: "Keine offene Erinnerung." };
  const checkKey = state.pendingReminder?.checkKey || state.pendingToiletCheck;
  const text = state.pendingReminder?.text || "Toiletten-Kontrolle durchführen";
  const isToilet = pendingReminderIsToilet();
  const employee = $("#toiletCheckEmployee")?.value || "";
  if (isToilet && !employee) {
    throw new Error("Bitte Mitarbeiter auswählen.");
  }
  const result = await terminalAction({
    action: isToilet ? "confirm-toilet" : "confirm-reminder",
    checkKey,
    text,
    employee
  });
  state.pendingToiletCheck = "";
  state.pendingReminder = null;
  window.localStorage?.setItem(`toilet-check-${checkKey}`, "1");
  $("#toiletReminder")?.classList.add("hidden");
  renderToiletStatus(state.terminalReport);
  renderTerminalChecks(state.terminalReport);
  return result || { ok: true, message: "Kontrolle quittiert." };
}

function renderAdminPublishedList() {
  const container = $("#adminPublishedList");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  const schedules = Object.entries(state.allSchedules || {})
    .filter(([, schedule]) => schedule?.published)
    .sort(([a], [b]) => b.localeCompare(a));
  if (!schedules.length) {
    container.innerHTML = `<p class="hint">Keine veröffentlichten Dienstpläne vorhanden.</p>`;
    return;
  }
  container.innerHTML = schedules.map(([month, schedule]) => {
    const publishedWeekMap = schedule.publishedWeeks || {};
    const hasPublishedWeekMap = Object.keys(publishedWeekMap).some((key) => Boolean(publishedWeekMap[key]));
    const weeks = groupedMonthWeeks(month).filter((week) => (
      hasPublishedWeekMap ? Boolean(publishedWeekMap[week.key]) : Boolean(schedule.published)
    ));
    return `
      <article class="swap-card">
        <div>
          <strong>${formatMonth(month)}</strong>
          <span>${weeks.length ? `${weeks.length} Wochen veröffentlicht` : "Monat veröffentlicht"}</span>
        </div>
        <div class="week-actions">
          ${weeks.map((week) => `
            <button class="primary" data-edit-published-week="${month}|${week.key}">Woche ${weekLabel(week.dates)} ändern</button>
            <button class="secondary" data-unpublish-week="${month}|${week.key}">Woche ${weekLabel(week.dates)} löschen</button>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderAdminEmployeeOverview() {
  const container = $("#adminEmployeeOverview");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  container.innerHTML = employeeOverviewHtml({ allowCorrection: true });
}

function employeeOverviewHtml({ allowCorrection = false } = {}) {
  const defaultDate = adminTimesheetDefaultDate();
  return `
    <div class="employee-overview-head">
      <span>Name</span>
      <span>Rolle</span>
      <span>Gesamtstunden</span>
      <span>Gearbeitete Tage</span>
    </div>
    ${state.settings.employees.map((employee) => {
      const totals = totalsForEmployee(employee);
      const role = state.settings.employeeRoles?.[employee] || "Team";
      const shifts = timesheetDetailsForEmployee(employee);
      return `
        <details class="employee-overview-row">
          <summary class="employee-overview-summary">
            <strong>${escapeHtml(employee)}</strong>
            <span>${escapeHtml(role)}</span>
            <span>${formatHours(totals.hours)}</span>
            <span>${shifts.length ? `${shifts.length} Tage` : "Keine Stunden"}</span>
          </summary>
          <div class="employee-workdays">
            <div class="employee-workday-list">
              ${shifts.map((shift) => `
                <div class="employee-workday">
                  <strong>${formatDate(shift.date)}</strong>
                  <span>${escapeHtml(shift.timeText || "?")}</span>
                  <span>${formatHours(shift.hours)}</span>
                  ${shift.adminOnly ? `<small>Nur Admin${shift.adminNote ? ` | ${escapeHtml(shift.adminNote)}` : ""}</small>` : ""}
                </div>
              `).join("") || `<p class="hint">Keine Arbeitszeiten für diesen Monat erfasst.</p>`}
            </div>
            ${allowCorrection ? `<div class="admin-timesheet-form" data-admin-timesheet-form="${escapeHtml(employee)}">
              <p class="hint">Nur Admin: vergessene Stunden und Tage können auch bei abgeschlossenen Tagesberichten ergänzt werden.</p>
              <label>Datum<input type="date" data-admin-ts-field="date" value="${escapeHtml(defaultDate)}"></label>
              <label>Beginn<input type="time" data-admin-ts-field="from"></label>
              <label>Ende<input type="time" data-admin-ts-field="to"></label>
              <label>Hinweis<input data-admin-ts-field="note" placeholder="z.B. vergessen einzutragen"></label>
              <button class="primary" type="button" data-admin-save-timesheet="${escapeHtml(employee)}">Stunden nachtragen</button>
            </div>` : ""}
          </div>
        </details>
      `;
    }).join("")}
  `;
}

function adminTimesheetDefaultDate() {
  const today = todayKey();
  if (today.startsWith(state.selectedMonth)) return today;
  return `${state.selectedMonth}-01`;
}

function totalsForEmployee(employee) {
  const entries = state.timesheets?.[employee] || {};
  return Object.entries(entries).reduce((totals, [dateKey, entry]) => {
    if (!dateKey.startsWith(state.selectedMonth)) return totals;
    totals.hours += paidHours(entry);
    totals.tip += Number(entry.tip || 0);
    return totals;
  }, { hours: 0, tip: 0 });
}

function timesheetDetailsForEmployee(employee) {
  const entries = state.timesheets?.[employee] || {};
  return Object.entries(entries)
    .filter(([dateKey, entry]) => dateKey.startsWith(state.selectedMonth) && entryHasCompletedTime(entry))
    .map(([date, entry]) => ({
      date,
      from: entry.from || "",
      to: entry.to || "",
      timeText: dayReportShiftText(entry),
      hours: paidHours(entry),
      adminOnly: Boolean(entry.adminOnly || entry.source === "admin-manual"),
      adminNote: entry.adminNote || ""
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function renderAdminMonthlyNumbers() {
  const container = $("#adminMonthlyNumbers");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  container.innerHTML = monthlyNumbersHtml("admin");
}

function monthlyNumbersHtml(context = "chef") {
  const id = context === "admin" ? "adminNumbersMonth" : "chefNumbersMonth";
  const numbers = monthlyNumbersForMonth(state.selectedMonth);
  return `
    <section class="monthly-numbers-panel">
      <div class="chef-section-head">
        <h3>Monatszahlen</h3>
        <label>Monat<input id="${id}" type="month" value="${escapeHtml(state.selectedMonth)}"></label>
      </div>
      <div class="monthly-number-grid">
        <article><span>Gesamtumsatz</span><strong>${formatMoney(numbers.revenue.total)}</strong><small>Bowling + Gastro</small></article>
        <article><span>Arbeitsstunden</span><strong>${formatHours(numbers.hours.total)}</strong><small>Counter + Service + Küche + Sonstige</small></article>
        <article><span>Umsatz je Stunde</span><strong>${formatMoney(numbers.revenuePerHour)}</strong><small>Grundgerüst</small></article>
      </div>
      <div class="monthly-number-grid">
        <article><span>Counter</span><strong>${formatHours(numbers.hours.Counter)}</strong></article>
        <article><span>Service</span><strong>${formatHours(numbers.hours.Service)}</strong></article>
        <article><span>Küche</span><strong>${formatHours(numbers.hours.Kueche)}</strong></article>
        <article><span>Sonstige</span><strong>${formatHours(numbers.hours.Sonstige)}</strong></article>
      </div>
      <table class="monthly-number-table">
        <tbody>
          <tr><th>Umsatz Bowling</th><td>${formatMoney(numbers.revenue.bowling)}</td></tr>
          <tr><th>Umsatz Gastro</th><td>${formatMoney(numbers.revenue.gastro)}</td></tr>
          <tr><th>Getränke</th><td>${formatMoney(numbers.revenue.drinks)}</td></tr>
          <tr><th>Speisen</th><td>${formatMoney(numbers.revenue.food)}</td></tr>
          <tr><th>Sonstiges</th><td>${formatMoney(numbers.revenue.other)}</td></tr>
          <tr><th>EC gesamt</th><td>${formatMoney(numbers.revenue.ec)}</td></tr>
          <tr><th>Personalverzehr</th><td>${formatMoney(numbers.revenue.personalConsumption)}</td></tr>
          <tr><th>Rechnungskunden</th><td>${formatMoney(numbers.revenue.invoices)}</td></tr>
          <tr><th>Ausgaben</th><td>${formatMoney(numbers.revenue.expenses)}</td></tr>
        </tbody>
      </table>
      <p class="hint">Die Stunden werden nach Dienstplan-Position zugeordnet. Falls keine Position gefunden wird, nutzt die App die Mitarbeiter-Bereiche als Fallback.</p>
    </section>
  `;
}

function monthlyNumbersForMonth(month) {
  const hours = { Counter: 0, Service: 0, Kueche: 0, Sonstige: 0, total: 0 };
  Object.entries(state.timesheets || {}).forEach(([employee, entries]) => {
    Object.entries(entries || {}).forEach(([dateKey, entry]) => {
      if (!dateKey.startsWith(month) || !entry?.from || !entry?.to) return;
      const paid = paidHours(entry);
      const area = workAreaForEmployeeDate(employee, dateKey);
      hours[area] = (hours[area] || 0) + paid;
      hours.total += paid;
    });
  });
  const revenue = { bowling: 0, gastro: 0, drinks: 0, food: 0, other: 0, ec: 0, personalConsumption: 0, invoices: 0, expenses: 0, total: 0 };
  Object.entries(state.dayReports || {}).forEach(([dateKey, report]) => {
    if (!dateKey.startsWith(month) || !report || typeof report !== "object") return;
    const parts = reportGastroParts(report);
    revenue.bowling += reportMoneyNumber(report.revenueBowling || report.barBowling);
    revenue.drinks += parts.drinks;
    revenue.food += parts.food;
    revenue.other += parts.other;
    revenue.gastro += gastroRevenueTotal(report);
    revenue.ec += reportEcTotal(report);
    revenue.personalConsumption += reportPersonalConsumptionTotal(report);
    revenue.invoices += reportInvoiceTotal(report);
    revenue.expenses += reportCashExpensesTotal(report);
  });
  revenue.total = Math.max(0, revenue.bowling + revenue.gastro - revenue.personalConsumption);
  return {
    hours,
    revenue,
    revenuePerHour: hours.total > 0 ? revenue.total / hours.total : 0
  };
}

function workAreaForEmployeeDate(employee, dateKey) {
  const schedule = state.allSchedules?.[dateKey.slice(0, 7)] || state.schedule || {};
  const positions = Object.entries(schedule.days?.[dateKey] || {})
    .filter(([key, value]) => !key.includes("__") && value === employee)
    .map(([key]) => key);
  for (const position of positions) {
    const area = workAreaFromText(position);
    if (area !== "Sonstige") return area;
  }
  const departments = state.settings.employeeDepartments?.[employee] || [];
  for (const department of ["Counter", "Kueche", "Service"]) {
    if (departments.some((value) => normalizeDepartment(value) === department)) return department;
  }
  return workAreaFromText(state.settings.employeeRoles?.[employee] || departments[0] || "");
}

function workAreaFromText(value) {
  const text = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (text.includes("counter")) return "Counter";
  if (text.includes("kuche") || text.includes("kueche") || text.includes("koch") || text.includes("spul")) return "Kueche";
  if (text.includes("service")) return "Service";
  return "Sonstige";
}

function renderSettings() {
  $("#businessName").value = state.settings.businessName;
  $("#employeesText").value = state.settings.employees.join("\n");
  $("#employeePinsText").value = "";
  $("#terminalCodeSetting").value = "";
  if ($("#scheduleAutoDeleteDays")) $("#scheduleAutoDeleteDays").value = String(normalizeScheduleAutoDeleteDays(state.settings.scheduleAutoDeleteDays, 14));
  if ($("#hourlyRateSetting")) $("#hourlyRateSetting").value = String(normalizeHourlyRate(state.settings.hourlyRate, 25));
  if ($("#invoiceNotificationTo")) $("#invoiceNotificationTo").value = state.settings.invoiceNotificationTo || "";
  if ($("#availabilityTargetMonthSetting")) $("#availabilityTargetMonthSetting").value = availabilityMonthValue();
  if ($("#availabilitySubmissionOpenSetting")) $("#availabilitySubmissionOpenSetting").checked = state.settings.availabilitySubmissionOpen !== false;
  $("#employeePinsText").placeholder = "Nur neue oder geaenderte PINs eintragen, Format: Name=PIN";
  $("#adminEmployeesText").value = (state.settings.adminEmployees || []).join("\n");
  $("#employeeDepartmentsText").value = departmentsToText(state.settings.employeeDepartments || {});
  $("#employeeRolesText").value = rolesToText(state.settings.employeeRoles || {});
  $("#availabilityExemptText").value = (state.settings.availabilityExemptEmployees || []).join("\n");
  $("#positionsText").value = state.settings.positions.join("\n");
  renderEmployeeDirectory();
  renderPositionDirectory();
  $$("[data-chef-section]").forEach((input) => {
    input.checked = chefSectionEnabled(input.dataset.chefSection);
  });
  $$("[data-day-report-field]").forEach((input) => {
    input.checked = reportFieldEnabled(input.dataset.dayReportField);
  });
}

function renderEmployeeDirectory() {
  const target = $("#employeeDirectory");
  if (!target) return;
  const departments = textToDepartments($("#employeeDepartmentsText")?.value || departmentsToText(state.settings.employeeDepartments || {}));
  const roles = textToRoles($("#employeeRolesText")?.value || rolesToText(state.settings.employeeRoles || {}));
  const admins = new Set(linesToList($("#adminEmployeesText")?.value || (state.settings.adminEmployees || []).join("\n")));
  const exempt = new Set(linesToList($("#availabilityExemptText")?.value || (state.settings.availabilityExemptEmployees || []).join("\n")));
  const fixedEmployees = new Set((state.settings.fixedEmployees || []).map(String));
  const departmentOptions = departmentOptionsForEmployeeCards(departments);
  target.innerHTML = (state.settings.employees || []).map((name, index) => {
    const tipCard = employeeTipCardState(name, roles, departments);
    return `
    <details class="employee-card" data-employee-card="${index}" data-original-employee-name="${escapeHtml(name)}">
      <summary>
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(roles[name] || "Keine Rolle")} · ${(departments[name] || []).join(", ") || "Keine Bereiche"}${fixedEmployees.has(name) ? " · Festanstellung" : ""}${tipCard.eligible ? ` · Trinkgeld ${tipCard.factorLabel}` : " · Kein Trinkgeld"}</span>
      </summary>
      <div class="employee-card-grid">
        <label>Name<input data-employee-field="name" value="${escapeHtml(name)}"></label>
        <label>Neue PIN<input data-employee-field="pin" type="password" inputmode="numeric" placeholder="leer = unverändert"></label>
        <label>Rolle
          <select data-employee-field="role">
            ${["", "Mitarbeiter", "Service", "Serviceleitung", "Koch", "Kuechenchef", "Mechanik", "Chefmechaniker", "Reinigung", "Schichtleitung", "Betriebsleiter", "Chef"].map((role) => `<option value="${escapeHtml(role)}" ${roles[name] === role ? "selected" : ""}>${roleLabel(role)}</option>`).join("")}
          </select>
        </label>
        <div class="employee-card-checks">
          ${departmentOptions.map((department) => `
            <label><input type="checkbox" data-employee-department="${escapeHtml(department)}" ${(departments[name] || []).includes(department) ? "checked" : ""}> ${escapeHtml(departmentLabel(department))}</label>
          `).join("")}
          <label><input type="checkbox" data-employee-admin ${admins.has(name) ? "checked" : ""}> Admin-Rechte</label>
          <label><input type="checkbox" data-employee-fixed ${fixedEmployees.has(name) ? "checked" : ""}> Festanstellung</label>
          <label><input type="checkbox" data-employee-exempt ${exempt.has(name) ? "checked" : ""}> Keine Verfügbarkeit nötig</label>
        </div>
        <div class="employee-card-tip">
          <label class="employee-tip-toggle"><input type="checkbox" data-employee-tip-eligible ${tipCard.eligible ? "checked" : ""}> Trinkgeldberechtigt</label>
          <label>Trinkgeld-Faktor
            <input data-employee-tip-factor type="number" min="0.1" max="1" step="0.025" value="${escapeHtml(tipCard.factorValue)}" placeholder="Auto">
          </label>
          <small>Leer = automatische Regel. Faktor 0,1 bis 1,0. Küche automatisch: 1 Koch = 1, zwei Köche = 0,75, zwei Köche + Spüler = 0,5. Ab 2.000 Euro Speisen-Umsatz: Küche/Spüler wieder 1.</small>
        </div>
        <div class="employee-card-actions">
          <button class="primary" type="button" data-save-employees>Diese Karte speichern</button>
          <button class="secondary danger-button" type="button" data-remove-employee="${index}">Mitarbeiter entfernen</button>
        </div>
      </div>
    </details>
  `;
  }).join("") || `<p class="hint">Noch keine Mitarbeiter angelegt.</p>`;
}

function employeeTipCardState(employee, roles = {}, departments = {}) {
  const setting = tipSettingFromSettings(state.settings || {}, employee);
  const autoArea = tipAreaFromText(roles[employee] || "")
    || departmentsForEmployee(departments, employee).map(tipAreaFromText).find(isTipEligibleArea)
    || "";
  const eligible = setting ? setting.eligible : isTipEligibleArea(autoArea);
  const factorValue = setting && setting.eligible ? String(setting.factor) : "";
  return {
    eligible,
    factorValue,
    factorLabel: factorValue ? `x${factorValue}` : "(Auto)"
  };
}

function roleLabel(role) {
  if (!role) return "Keine Rolle";
  if (role === "Kuechenchef") return "Küchenchef";
  return role;
}

function departmentOptionsForEmployeeCards(departments = {}) {
  const positions = linesToList($("#positionsText")?.value || (state.settings.positions || []).join("\n"));
  const selected = Object.values(departments).flat().map(canonicalDepartmentChoice).filter(Boolean);
  const broad = ["Counter", "Service", "Kueche", "Reinigung", "Mechanik"];
  const options = [...broad];
  positions.forEach((position) => {
    const exact = canonicalDepartmentChoice(position);
    const group = departmentForPosition(position);
    if (group && !options.includes(group)) options.push(group);
    if (exact && !options.includes(exact)) options.push(exact);
  });
  selected.forEach((department) => {
    if (department && !options.includes(department)) options.push(department);
  });
  return options;
}

function departmentLabel(value) {
  const text = String(value || "").trim();
  if (text === "Kueche") return "Küche";
  if (text === "Kueche 1") return "Küche 1";
  if (text === "Kueche 2") return "Küche 2";
  if (text === "Spueler") return "Spüler";
  return text;
}

function syncEmployeeDirectoryToTextareas() {
  const employees = [];
  const pins = {};
  const roles = {};
  const departments = {};
  const tipSettings = {};
  const admins = [];
  const exempt = [];
  const fixed = [];
  $$(".employee-card").forEach((card) => {
    const name = card.querySelector('[data-employee-field="name"]')?.value.trim();
    if (!name) return;
    employees.push(name);
    const pin = card.querySelector('[data-employee-field="pin"]')?.value.trim();
    if (pin) {
      pins[name] = pin;
      const originalName = card.dataset.originalEmployeeName?.trim();
      if (originalName && originalName !== name) pins[originalName] = pin;
    }
    const role = card.querySelector('[data-employee-field="role"]')?.value.trim();
    if (role) roles[name] = role;
    const deps = [...card.querySelectorAll("[data-employee-department]")].filter((input) => input.checked).map((input) => input.dataset.employeeDepartment);
    departments[name] = deps;
    const tipEligible = card.querySelector("[data-employee-tip-eligible]")?.checked === true;
    const rawTipFactor = card.querySelector("[data-employee-tip-factor]")?.value.trim() || "";
    const autoArea = tipAreaFromText(role || "") || deps.map(tipAreaFromText).find(isTipEligibleArea) || "";
    const autoEligible = isTipEligibleArea(autoArea);
    if (tipEligible !== autoEligible || rawTipFactor) {
      tipSettings[name] = {
        eligible: tipEligible,
        factor: rawTipFactor ? normalizeTipFactor(rawTipFactor, 1) : 1
      };
    }
    if (card.querySelector("[data-employee-admin]")?.checked) admins.push(name);
    if (card.querySelector("[data-employee-fixed]")?.checked) fixed.push(name);
    if (card.querySelector("[data-employee-exempt]")?.checked) exempt.push(name);
  });
  $("#employeesText").value = employees.join("\n");
  $("#employeePinsText").value = Object.entries(pins).map(([name, pin]) => `${name}=${pin}`).join("\n");
  $("#employeeRolesText").value = Object.entries(roles).map(([name, role]) => `${name}=${role}`).join("\n");
  $("#employeeDepartmentsText").value = Object.entries(departments).map(([name, deps]) => `${name}=${deps.join(",")}`).join("\n");
  $("#adminEmployeesText").value = admins.join("\n");
  $("#availabilityExemptText").value = exempt.join("\n");
  state.settings.fixedEmployees = fixed;
  state.settings.employeeTipSettings = tipSettings;
}

function renderPositionDirectory() {
  const target = $("#positionDirectory");
  if (!target) return;
  const positions = linesToList($("#positionsText")?.value || (state.settings.positions || []).join("\n"));
  target.innerHTML = positions.map((position, index) => `
    <div class="position-row">
      <input data-position-name value="${escapeHtml(position)}" placeholder="z.B. Service 1">
      <button class="secondary danger-button" type="button" data-remove-position="${index}">Entfernen</button>
    </div>
  `).join("") || `<p class="hint">Noch keine Dienstbereiche angelegt.</p>`;
}

function syncPositionDirectoryToTextarea() {
  const positions = [...document.querySelectorAll("[data-position-name]")]
    .map((input) => input.value.trim())
    .filter(Boolean);
  $("#positionsText").value = [...new Set(positions)].join("\n");
}

function chefSectionEnabled(key) {
  return state.settings?.chefViewSections?.[key] !== false;
}

function reportFieldEnabled(key) {
  return state.settings?.dayReportFields?.[key] !== false;
}

function visibilityFromInputs(selector, attr) {
  return Object.fromEntries($$(selector).map((input) => [input.dataset[attr], Boolean(input.checked)]));
}

function rolesToText(roles) {
  return state.settings.employees
    .map((name) => `${name}=${roles[name] || ""}`)
    .join("\n");
}

function textToRoles(text) {
  const roles = {};
  text.split("\n").forEach((line) => {
    const [name, ...roleParts] = line.split("=");
    const cleanName = (name || "").trim();
    const role = roleParts.join("=").trim();
    if (cleanName && role) roles[cleanName] = role;
  });
  return roles;
}

function planningWeeks() {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const weeks = [];
  for (let weekOffset = 0; weekOffset < 4; weekOffset += 1) {
    const monday = weekStart(addDays(now, weekOffset * 7));
    const dates = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const date = addDays(monday, dayOffset);
      if (date >= now) dates.push(date);
    }
    weeks.push({ key: isoDate(monday), dates });
  }
  return weeks;
}

function weekFromKey(weekKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(weekKey || ""))) return null;
  const monday = new Date(`${weekKey}T12:00:00`);
  const dates = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    dates.push(addDays(monday, dayOffset));
  }
  return { key: weekKey, dates };
}

function isWeekOpenedForEdit(weekKey) {
  return (state.plannerEditWeeks || []).includes(weekKey);
}

function openWeekForEdit(weekKey) {
  if (!weekKey) return;
  state.plannerEditWeeks ||= [];
  if (!state.plannerEditWeeks.includes(weekKey)) state.plannerEditWeeks.push(weekKey);
}

function plannerVisibleWeeks() {
  const baseWeeks = planningWeeks();
  const seen = new Set(baseWeeks.map((week) => week.key));
  const manualWeeks = (state.plannerEditWeeks || [])
    .filter((weekKey) => !seen.has(weekKey))
    .map((weekKey) => weekFromKey(weekKey))
    .filter(Boolean);
  return [...baseWeeks, ...manualWeeks]
    .filter((week) => week.dates.length > 0)
    .sort((a, b) => a.key.localeCompare(b.key));
}

function scheduleForMonth(month) {
  if (state.schedule?.month === month) {
    return state.schedule;
  }
  return state.allSchedules?.[month] || { month, published: false, publishedWeeks: {}, days: {} };
}

function weekKeyForDate(dateKey) {
  return isoDate(weekStart(new Date(`${dateKey}T12:00:00`)));
}

function plannerDaySchedule(dateKey) {
  return scheduleForMonth(dateKey.slice(0, 7)).days?.[dateKey] || {};
}

function plannerDateIsPublished(dateKey) {
  const schedule = scheduleForMonth(dateKey.slice(0, 7));
  if (!schedule) return false;
  if (schedule.publishedWeeks && Object.keys(schedule.publishedWeeks).length) {
    return Boolean(schedule.publishedWeeks[weekKeyForDate(dateKey)]);
  }
  return Boolean(schedule.published);
}

function renderPlanner() {
  const weeksToPlan = plannerVisibleWeeks().filter((week) => !plannerWeekIsPublished(week) || isWeekOpenedForEdit(week.key));
  if (!weeksToPlan.length) {
    $("#planner").innerHTML = `<p class="hint">Alle nächsten 4 Wochen sind bereits veröffentlicht. Änderungen findest du unter „Veröffentlichte Wochen“.</p>`;
    return;
  }
  const weeksHtml = weeksToPlan.map((week) => `
    <details class="week-section planner-week" data-planner-week="${week.key}">
      <summary>
        <span>${weekLabel(week.dates)}</span>
        <span class="week-state">${plannerWeekState(week)}</span>
      </summary>
      <div class="week-actions">
        <button class="secondary" type="button" data-save-week="${week.key}">Woche speichern</button>
        <button class="primary" type="button" data-publish-week="${week.key}">Woche veröffentlichen</button>
        ${plannerWeekHasData(week)
          ? `<button class="primary danger-button" type="button" data-delete-planner-week="${week.key}">Woche löschen</button>`
          : ""}
      </div>
      <div class="week-days">
        ${week.dates.map((date) => renderPlannerDay(date)).join("")}
      </div>
    </details>
  `).join("");
  $("#planner").innerHTML = weeksHtml;
}

function plannerWeekState(week) {
  if (plannerWeekIsPublished(week) && isWeekOpenedForEdit(week.key)) return "veröffentlicht (Bearbeitung)";
  if (plannerWeekIsPublished(week)) return "veröffentlicht";
  return plannerWeekHasData(week) ? "Entwurf" : "leer";
}

function plannerWeekIsPublished(week) {
  return week.dates.length > 0 && week.dates.every((date) => plannerDateIsPublished(isoDate(date)));
}

function plannerWeekHasData(week) {
  return week.dates.some((date) => Object.keys(plannerDaySchedule(isoDate(date)) || {}).length > 0);
}

function renderPlannerDay(date) {
    const key = isoDate(date);
    const daySchedule = plannerDaySchedule(key);
    const holiday = holidayInfo(key);
    const coverage = plannerDayCoverage(daySchedule);
    const activePositions = activePlannerPositions(daySchedule);
    const addablePositions = state.settings.positions.filter((position) => !activePositions.includes(position));
    const templateAvailable = hasWeekdayTemplate(key);
    return `
      <article class="planner-day" data-date="${key}">
        <div class="day-header ${holiday.className}">
          <span>${formatDate(key)}</span>
          <span class="day-badges">
            ${holiday.label ? `<span class="day-badge">${escapeHtml(holiday.label)}</span>` : ""}
            <span class="day-badge planner-status-badge ${coverage.className}">${coverage.label}</span>
            <span class="day-badge">${availabilitySummary(key)}</span>
          </span>
        </div>
        <div class="position-grid">
          ${activePositions.map((position) => plannerPositionHtml(position, key, daySchedule)).join("") || `<p class="hint planner-empty-hint">Noch keine Position geplant.</p>`}
        </div>
        <div class="planner-add-row">
          ${addablePositions.map((position) => `
            <button class="secondary add-position-button ${positionClass(position)}" type="button" data-add-position="${escapeHtml(position)}">+ ${escapeHtml(position)}</button>
          `).join("")}
        </div>
        <label class="day-note">
          Tagesnotiz
          <textarea data-day-note placeholder="Notiz für diesen Tag, z.B. Veranstaltung, Feiertagsregel, besondere Zeiten">${escapeHtml(daySchedule.__dayNote || "")}</textarea>
        </label>
        <div class="planner-template-actions">
          <button class="secondary" type="button" data-save-weekday-template>Tag als Vorlage speichern</button>
          <button class="secondary" type="button" data-apply-weekday-template ${templateAvailable ? "" : "disabled"}>Vorlage anwenden</button>
        </div>
      </article>
    `;
}

function plannerDayCoverage(daySchedule) {
  const positions = activePlannerPositions(daySchedule);
  const total = positions.length;
  const assigned = positions.filter((position) => daySchedule[position]).length;
  if (total === 0 || assigned === 0) return { label: "offen", className: "status-open" };
  if (assigned < total) return { label: "knapp", className: "status-tight" };
  return { label: "voll", className: "status-full" };
}

function activePlannerPositions(daySchedule) {
  return state.settings.positions.filter((position) => (
    daySchedule[position] || daySchedule[`${position}__note`]
  ));
}

function plannerPositionHtml(position, dateKey, daySchedule = {}) {
  const plannedTime = parsePlannedTime(daySchedule[`${position}__note`] || "");
  return `
    <div class="position-cell planner-position-cell ${positionClass(position)}" data-planner-position="${escapeHtml(position)}">
      <div class="planner-position-head">
        <span class="position-name">${escapeHtml(position)}</span>
        <button class="icon-button remove-position-button" type="button" data-remove-position title="Position entfernen">×</button>
      </div>
      <select data-position="${escapeHtml(position)}">
        <option value="">Nicht besetzt</option>
        ${employeesForPosition(position).map((employee) => `
          <option value="${escapeHtml(employee)}" ${daySchedule[position] === employee ? "selected" : ""}>
            ${escapeHtml(employee)}${employeeHint(employee, dateKey)}
          </option>
        `).join("")}
      </select>
      <div class="plan-time-tools" data-note="${escapeHtml(position)}">
        <label title="Dienstbeginn">
          <span>Von</span>
          <input type="time" data-plan-from value="${escapeHtml(plannedTime.from)}" step="900">
        </label>
        <label title="Dienstende">
          <span>Bis</span>
          <input type="time" data-plan-to value="${escapeHtml(plannedTime.to)}" step="900">
        </label>
      </div>
    </div>
  `;
}

function availabilitySummary(dateKey) {
  const yes = [];
  const no = [];
  for (const [employee, days] of Object.entries(state.availability)) {
    const day = days?.[dateKey];
    if (!day) continue;
    if (day.status === "yes") yes.push(employee);
    if (day.status === "no") {
      no.push(`${employee}${day.note ? ` (${day.note})` : ""}`);
    }
  }
  const parts = [];
  if (yes.length) parts.push(`Kann: ${yes.join(", ")}`);
  if (no.length) parts.push(`Kann nicht: ${no.join(", ")}`);
  return parts.length ? parts.join(" | ") : "Keine Zusagen";
}

function employeeHint(employee, dateKey) {
  const day = state.availability[employee] ? state.availability[employee][dateKey] : null;
  if (!day) return "";
  if (day.status === "yes") {
    const time = day.from || day.to ? ` ${day.from || "?"}-${day.to || "?"}` : "";
    return ` (kann${time})`;
  }
  if (day.status === "no") {
    return ` (kann nicht${day.note ? `: ${day.note}` : ""})`;
  }
  return "";
}

function collectSchedule() {
  const days = {};
  $$("#planner .planner-day").forEach((dayEl) => {
    const dateKey = dayEl.dataset.date;
    days[dateKey] = collectDayAssignments(dayEl);
  });
  return days;
}

function collectDayAssignments(dayEl) {
  const assignments = {};
  dayEl.querySelectorAll("select[data-position]").forEach((select) => {
    if (select.value) assignments[select.dataset.position] = select.value;
  });
  dayEl.querySelectorAll("[data-note]").forEach((timeTools) => {
    const from = timeTools.querySelector("[data-plan-from]")?.value || "";
    const to = timeTools.querySelector("[data-plan-to]")?.value || "";
    if (from || to) assignments[`${timeTools.dataset.note}__note`] = `${from}-${to}`;
  });
  const dayNoteInput = dayEl.querySelector("[data-day-note]");
  const dayNote = dayNoteInput ? dayNoteInput.value.trim() : "";
  if (dayNote) assignments.__dayNote = dayNote;
  return assignments;
}

function plannerTemplateStoreKey() {
  return "planner_weekday_templates_v1";
}

function loadPlannerTemplates() {
  try {
    const raw = window.localStorage?.getItem(plannerTemplateStoreKey()) || "";
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function savePlannerTemplates(templates) {
  window.localStorage?.setItem(plannerTemplateStoreKey(), JSON.stringify(templates || {}));
}

function plannerWeekdayTemplateKey(dateKey) {
  return String(new Date(`${dateKey}T12:00:00`).getDay());
}

function hasWeekdayTemplate(dateKey) {
  const template = loadPlannerTemplates()[plannerWeekdayTemplateKey(dateKey)];
  return Boolean(template && typeof template === "object" && Object.keys(template).length);
}

function applyPlannerDayAssignments(dateKey, assignments) {
  const month = dateKey.slice(0, 7);
  const targetSchedule = state.schedule?.month === month
    ? state.schedule
    : (state.allSchedules[month] ||= { month, published: false, publishedWeeks: {}, days: {} });
  targetSchedule.days ||= {};
  targetSchedule.days[dateKey] = cloneData(assignments || {});
}

function setMonth(offset) {
  const [year, month] = state.selectedMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  state.selectedMonth = monthValue(date);
  loadState().catch(showError);
}

function formatMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}

function renderAdminLock() {
  const unlocked = state.adminUnlocked;
  $("#adminLocked").classList.toggle("hidden", unlocked);
  $("#adminContent").classList.toggle("hidden", !unlocked);
  $("#saveDraft").classList.add("hidden");
  $("#publishSchedule").classList.add("hidden");
  $("#adminLogout").classList.add("hidden");
  $("#adminPin").classList.toggle("hidden", true);
  $("#unlockAdmin").classList.toggle("hidden", true);
}

function pinsToText(pins) {
  return Object.entries(pins)
    .map(([name, pin]) => `${name}=${pin}`)
    .join("\n");
}

function textToPins(text) {
  const pins = {};
  text.split("\n").forEach((line) => {
    const [name, ...pinParts] = line.split("=");
    const cleanName = (name || "").trim();
    const pin = pinParts.join("=").trim();
    if (cleanName && pin) {
      pins[cleanName] = pin;
    }
  });
  return pins;
}

function departmentsToText(departments) {
  return state.settings.employees
    .map((name) => `${name}=${(departments[name] || []).join(",")}`)
    .join("\n");
}

function textToDepartments(text) {
  const departments = {};
  text.split("\n").forEach((line) => {
    const [name, ...departmentParts] = line.split("=");
    const cleanName = (name || "").trim();
    const values = departmentParts.join("=")
      .split(",")
      .map((item) => canonicalDepartmentChoice(item))
      .filter(Boolean);
    if (cleanName) {
      departments[cleanName] = [...new Set(values)];
    }
  });
  return departments;
}

function canonicalDepartmentChoice(value) {
  const text = String(value || "").trim();
  const clean = text.toLowerCase();
  if (!clean) return "";
  if (["counter", "service", "reinigung", "mechanik"].includes(clean)) return normalizeDepartment(text);
  if (["küche", "kueche", "kuche"].includes(clean)) return "Kueche";
  if (["spüler", "spueler", "spuler"].includes(clean)) return "Spueler";
  return text
    .replace(/^k[üu]che\b/i, "Kueche")
    .replace(/^sp[üu]ler\b/i, "Spueler");
}

function normalizeDepartment(value) {
  const clean = String(value || "").trim().toLowerCase();
  if (!clean) return "";
  if (clean.startsWith("counter")) return "Counter";
  if (clean.startsWith("service")) return "Service";
  if (clean.startsWith("küche") || clean.startsWith("kueche") || clean.startsWith("kuche")) return "Kueche";
  if (clean.includes("koch") || clean.includes("küchenchef") || clean.includes("kuechenchef") || clean.includes("kuchenchef")) return "Kueche";
  if (clean.startsWith("spüler") || clean.startsWith("spueler") || clean.startsWith("spuler")) return "Kueche";
  if (clean.startsWith("reinigung")) return "Reinigung";
  if (clean.startsWith("mechanik")) return "Mechanik";
  if (clean.includes("mechaniker")) return "Mechanik";
  return value.trim();
}

function departmentForPosition(position) {
  return normalizeDepartment(position.replace(/\s+\d+$/, ""));
}

function positionCategory(position) {
  const clean = String(position || "").trim().toLowerCase();
  if (clean.startsWith("spüler") || clean.startsWith("spueler") || clean.startsWith("spuler")) return "spueler";
  return departmentForPosition(position).toLowerCase();
}

function positionClass(position) {
  return `position-${positionCategory(position) || "sonstige"}`;
}

function employeeNameKeys(employee) {
  const clean = String(employee || "").trim();
  const parts = clean.replace(",", " ").split(/\s+/).filter(Boolean);
  const names = [clean];
  if (parts.length > 1) {
    names.push(parts[0], parts[parts.length - 1], `${parts[0]} ${parts[parts.length - 1]}`);
    names.push(`${parts[parts.length - 1]}, ${parts[0]}`);
    names.push(`${parts[parts.length - 1]} ${parts[0]}`);
  }
  return [...new Set(names.filter(Boolean))];
}

function departmentsForEmployee(departments, employee) {
  for (const key of employeeNameKeys(employee)) {
    if (Array.isArray(departments[key])) return departments[key];
  }
  return [];
}

function employeesForPosition(position) {
  const department = departmentForPosition(position);
  const positionName = canonicalDepartmentChoice(position);
  const departments = state.settings.employeeDepartments || {};
  const roles = state.settings.employeeRoles || {};
  const matching = state.settings.employees.filter((employee) => {
    const employeeDepartments = departmentsForEmployee(departments, employee).map(canonicalDepartmentChoice);
    const roleDepartment = normalizeDepartment(roles[employee] || "");
    return employeeDepartments.includes(department) || employeeDepartments.includes(positionName) || roleDepartment === department;
  });
  return matching.length ? matching : state.settings.employees;
}

function ensureRequiredPositions(positions) {
  const clean = [...new Set((positions || []).map(String).map((name) => name.trim()).filter(Boolean))];
  const hasCounterBase = clean.some((position) => normalizeDepartment(position) === "Counter");
  if (!hasCounterBase) clean.push("Counter 1");
  if (!clean.some((position) => position.toLowerCase() === "counter 2")) clean.push("Counter 2");
  if (!clean.some((position) => position.toLowerCase() === "kueche 2" || position.toLowerCase() === "küche 2")) clean.push("Kueche 2");
  if (!clean.some((position) => positionCategory(position) === "spueler")) clean.push("Spueler");
  if (!clean.some((position) => normalizeDepartment(position) === "Mechanik")) clean.push("Mechanik");
  return clean;
}

function easterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function holidayMap(year) {
  const easter = easterDate(year);
  const items = [
    [`${year}-01-01`, "Neujahr"],
    [`${year}-01-06`, "Hl. Drei Könige"],
    [isoDate(addDays(easter, -2)), "Karfreitag"],
    [isoDate(easter), "Ostersonntag"],
    [isoDate(addDays(easter, 1)), "Ostermontag"],
    [`${year}-05-01`, "Tag der Arbeit"],
    [isoDate(addDays(easter, 39)), "Christi Himmelfahrt"],
    [isoDate(addDays(easter, 49)), "Pfingstsonntag"],
    [isoDate(addDays(easter, 50)), "Pfingstmontag"],
    [isoDate(addDays(easter, 60)), "Fronleichnam"],
    [`${year}-08-15`, "Mariä Himmelfahrt"],
    [`${year}-10-03`, "Tag der Deutschen Einheit"],
    [`${year}-11-01`, "Allerheiligen"],
    [`${year}-12-25`, "1. Weihnachtstag"],
    [`${year}-12-26`, "2. Weihnachtstag"]
  ];
  return Object.fromEntries(items);
}

function holidayInfo(dateKey) {
  const year = Number(dateKey.slice(0, 4));
  const holidays = holidayMap(year);
  if (holidays[dateKey]) {
    return { label: holidays[dateKey], className: "holiday" };
  }
  const nextDay = isoDate(addDays(new Date(`${dateKey}T12:00:00`), 1));
  if (holidayMap(Number(nextDay.slice(0, 4)))[nextDay]) {
    return { label: "Tag vor Feiertag", className: "preholiday" };
  }
  return { label: "", className: "" };
}

function openingHoursFor(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  const info = holidayInfo(dateKey);
  const day = date.getDay();
  if (info.label && info.className === "holiday") return "14:00 bis 23:00 Uhr";
  if (info.className === "preholiday") return "14:00 bis 02:00 Uhr";
  if (day >= 1 && day <= 4) return "16:00 bis 00:00 Uhr";
  if (day === 5) return "15:00 bis 02:00 Uhr";
  if (day === 6) return "14:00 bis 02:00 Uhr";
  return "14:00 bis 23:00 Uhr";
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = germanDisplayText(message);
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function showError(error) {
  showToast(error.message || String(error));
}

async function employeeLogin(pin) {
  const login = await api("/api/employee-login", {
    method: "POST",
    body: JSON.stringify({ pin })
  });
  state.activeEmployee = login.employee || "";
  state.employeeToken = login.token || "";
  state.adminToken = login.adminToken || "";
  state.hasBackofficeAccess = Boolean(login.isAdmin);
  state.adminUnlocked = Boolean(login.isAdmin);
  state.pinChangeRequired = Boolean(login.mustChangePin);
  await loadState();
  if (!login.employee && login.isAdmin) {
    state.adminUnlocked = true;
    activateTab("admin");
    showToast("Admin-Bereich geöffnet.");
  } else if (state.pinChangeRequired) {
    activateTab("home");
    renderPinChangeOverlay();
    $("#newEmployeePin")?.focus();
    showToast("Bitte neuen PIN festlegen.");
  } else if (currentUserIsChef()) {
    activateTab("chef");
    showToast(`Hallo ${login.employee}. Chef-Übersicht geöffnet.`);
  } else {
    activateTab("home");
    showToast(login.isAdmin ? `Hallo ${login.employee}. Backoffice ist freigeschaltet.` : `Hallo ${login.employee}.`);
  }
}

function employeeLogout() {
  state.activeEmployee = "";
  state.employeeToken = "";
  state.adminToken = "";
  state.hasBackofficeAccess = false;
  state.pinChangeRequired = false;
  state.adminUnlocked = false;
  state.isChef = false;
  activateTab("home");
  renderAll();
}

function activateTab(name) {
  if (name === "admin" && state.hasBackofficeAccess && state.adminToken && !state.adminUnlocked) {
    state.adminUnlocked = true;
    renderAll();
  }
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
  $$(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === name));
  if (name === "timesheet" && state.employeeToken && !state.timesheetRefreshInFlight) {
    state.timesheetRefreshInFlight = true;
    loadState().catch(showError).finally(() => {
      state.timesheetRefreshInFlight = false;
    });
  }
}

async function adminLogin(pin) {
  const login = await api("/api/admin-login", {
    method: "POST",
    body: JSON.stringify({ pin })
  });
  state.adminToken = login.token;
  state.hasBackofficeAccess = true;
  state.adminUnlocked = true;
  await loadState();
  activateTab("admin");
  showToast("Admin entsperrt.");
}

async function saveNewEmployeePin(button) {
  const newPin = $("#newEmployeePin")?.value.trim() || "";
  const confirmPin = $("#confirmEmployeePin")?.value.trim() || "";
  if (!/^\d{4,10}$/.test(newPin)) {
    showToast("Der neue PIN muss aus 4 bis 10 Ziffern bestehen.");
    return;
  }
  if (newPin !== confirmPin) {
    showToast("Die PIN-Wiederholung stimmt nicht überein.");
    return;
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await api("/api/employee-login", {
      method: "POST",
      body: JSON.stringify({
        action: "change-pin",
        employeeToken: state.employeeToken,
        newPin,
        confirmPin
      })
    });
    state.employeeToken = result.token || state.employeeToken;
    state.adminToken = result.adminToken || state.adminToken;
    state.hasBackofficeAccess = Boolean(result.isAdmin);
    state.adminUnlocked = Boolean(result.isAdmin);
    state.pinChangeRequired = false;
    $("#newEmployeePin").value = "";
    $("#confirmEmployeePin").value = "";
    await loadState();
    activateTab(currentUserIsChef() ? "chef" : "home");
    showToast("PIN gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function saveSettings(button) {
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    syncEmployeeDirectoryToTextareas();
    syncPositionDirectoryToTextarea();
    const availabilityTargetMonth = normalizeMonthValue($("#availabilityTargetMonthSetting")?.value) || availabilityMonthValue();
    const availabilitySubmissionOpen = $("#availabilitySubmissionOpenSetting")?.checked !== false;
    state.settings.availabilityTargetMonth = availabilityTargetMonth;
    state.settings.availabilitySubmissionOpen = availabilitySubmissionOpen;
    await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        businessName: $("#businessName").value,
        adminPin: $("#newPin").value,
        terminalCode: $("#terminalCodeSetting").value,
        scheduleAutoDeleteDays: Number($("#scheduleAutoDeleteDays")?.value || 14),
        hourlyRate: Number($("#hourlyRateSetting")?.value || 25),
        invoiceNotificationTo: $("#invoiceNotificationTo")?.value.trim(),
        availabilityTargetMonth,
        availabilitySubmissionOpen,
        employees: $("#employeesText").value.split("\n"),
        employeePins: textToPins($("#employeePinsText").value),
        adminEmployees: linesToList($("#adminEmployeesText").value),
        employeeDepartments: textToDepartments($("#employeeDepartmentsText").value),
        employeeRoles: textToRoles($("#employeeRolesText").value),
        employeeTipSettings: state.settings.employeeTipSettings || {},
        fixedEmployees: state.settings.fixedEmployees || [],
        availabilityExemptEmployees: linesToList($("#availabilityExemptText").value),
        positions: $("#positionsText").value.split("\n"),
        chefViewSections: visibilityFromInputs("[data-chef-section]", "chefSection"),
        dayReportFields: visibilityFromInputs("[data-day-report-field]", "dayReportField")
      })
    });
    $("#newPin").value = "";
    $("#terminalCodeSetting").value = "";
    $("#employeePinsText").value = "";
    await loadState();
    button.textContent = "Gespeichert";
    showToast("Einstellungen gespeichert.");
    window.setTimeout(() => {
      button.textContent = oldText;
    }, 1400);
  } catch (error) {
    button.textContent = oldText;
    showError(error);
  } finally {
    window.setTimeout(() => {
      button.disabled = false;
    }, 300);
  }
}

async function sendInvoiceTestMail(button) {
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Sendet...";
  const status = $("#invoiceTestMailStatus");
  if (status) status.textContent = "";
  try {
    const result = await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "send-invoice-test-mail",
        to: $("#invoiceNotificationTo")?.value.trim()
      })
    });
    const message = result.message || (result.sent ? "Test-Mail versendet." : "Test-Mail nicht versendet.");
    if (status) status.textContent = message;
    showToast(message);
  } catch (error) {
    if (status) status.textContent = error.message || String(error);
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

function bindEvents() {
  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.tab);
    });
  });

  $("#prevMonth")?.addEventListener("click", () => setMonth(-1));
  $("#nextMonth")?.addEventListener("click", () => setMonth(1));
  $("#monthInput").addEventListener("change", (event) => {
    state.selectedMonth = event.target.value;
    loadState().catch(showError);
  });

  $("#unlockHome").addEventListener("click", async () => {
    try {
      await employeeLogin($("#homePin").value.trim());
      $("#homePin").value = "";
    } catch (error) {
      showError(error);
    }
  });

  $("#homeLogout")?.addEventListener("click", employeeLogout);
  $("#topLogout").addEventListener("click", employeeLogout);
  $("#cancelPinChange")?.addEventListener("click", employeeLogout);
  $("#saveNewEmployeePin")?.addEventListener("click", () => saveNewEmployeePin($("#saveNewEmployeePin")));
  ["#newEmployeePin", "#confirmEmployeePin"].forEach((selector) => {
    $(selector)?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") saveNewEmployeePin($("#saveNewEmployeePin"));
    });
  });

  $("#adminLogout").addEventListener("click", employeeLogout);

  $("#unlockEmployee").addEventListener("click", async () => {
    try {
      await employeeLogin($("#employeePin").value.trim());
      $("#employeePin").value = "";
    } catch (error) {
      showError(error);
    }
  });

  $("#switchEmployee")?.addEventListener("click", () => {
    employeeLogout();
  });

  $("#unlockSwap").addEventListener("click", async () => {
    try {
      await employeeLogin($("#swapPin").value.trim());
      $("#swapPin").value = "";
    } catch (error) {
      showError(error);
    }
  });

  $("#switchSwapEmployee")?.addEventListener("click", () => {
    employeeLogout();
  });

  $("#swaps").addEventListener("click", async (event) => {
    const offerButton = event.target.closest("[data-offer-swap-date]");
    if (offerButton) {
      const noteInput = offerButton.closest(".swap-card")?.querySelector("[data-swap-note]");
      await swapAction({
        action: "offer",
        month: state.selectedMonth,
        date: offerButton.dataset.offerSwapDate,
        position: offerButton.dataset.offerSwapPosition,
        note: noteInput ? noteInput.value : ""
      }, "Ersatzanfrage ist online.");
      return;
    }
    const claimButton = event.target.closest("[data-claim-swap]");
    if (claimButton) {
      const noteInput = $(`[data-claim-note="${claimButton.dataset.claimSwap}"]`);
      await swapAction({
        action: "claim",
        id: claimButton.dataset.claimSwap,
        note: noteInput ? noteInput.value : ""
      }, "Du bist als Ersatz gemeldet.");
      return;
    }
    const cancelButton = event.target.closest("[data-cancel-swap]");
    if (cancelButton) {
      await swapAction({ action: "cancel", id: cancelButton.dataset.cancelSwap }, "Ersatzanfrage zurueckgezogen.");
    }
  });

  $("#availabilityGrid").addEventListener("click", (event) => {
    if (availabilityIsSubmitted()) return;
    if (!event.target.matches("button[data-status]")) return;
    const wasActive = event.target.classList.contains("active");
    const card = event.target.closest(".day-card");
    const activeClass = card?.dataset.availabilityMode === "fixed" ? "cannot-work" : "can-work";
    event.target.classList.toggle("active", !wasActive);
    card?.classList.toggle(activeClass, !wasActive);
  });

  $("#publishedMonths").addEventListener("click", (event) => {
    if (!event.target.matches("[data-month]")) return;
    state.selectedMonth = event.target.dataset.month;
    loadState().catch(showError);
  });

  $("#homeContent").addEventListener("click", (event) => {
    const ackMessage = event.target.closest("[data-ack-message]");
    if (ackMessage) {
      acknowledgeDashboardMessage(ackMessage.dataset.ackMessage, ackMessage);
      return;
    }
    const pushButton = event.target.closest("[data-enable-push]");
    if (pushButton) {
      enablePushNotifications(pushButton);
      return;
    }
    if (event.target.closest("[data-open-backoffice]")) {
      state.adminUnlocked = true;
      renderAll();
      activateTab("admin");
      showToast("Backoffice geöffnet.");
      return;
    }
    if (event.target.closest("[data-open-timesheet]")) {
      activateTab("timesheet");
      return;
    }
    const swapShift = event.target.closest("[data-request-swap-date]");
    if (swapShift) {
      requestSwapFromSchedule(swapShift.dataset.requestSwapDate, swapShift.dataset.requestSwapPosition);
      return;
    }
    const chefTab = event.target.closest("[data-chef-tab]");
    if (chefTab) {
      state.chefTab = chefTab.dataset.chefTab;
      renderHome();
      return;
    }
    if (!event.target.closest("[data-open-swaps]")) return;
    activateTab("swaps");
  });

  $("#homeGreeting")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-backoffice]")) {
      state.adminUnlocked = true;
      renderAll();
      activateTab("admin");
      showToast("Backoffice geöffnet.");
      return;
    }
    if (!event.target.closest("[data-open-timesheet]")) return;
    activateTab("timesheet");
  });

  $("#publishedSchedule")?.addEventListener("click", (event) => {
    const swapShift = event.target.closest("[data-request-swap-date]");
    if (!swapShift) return;
    requestSwapFromSchedule(swapShift.dataset.requestSwapDate, swapShift.dataset.requestSwapPosition);
  });

  $("#chefDashboard")?.addEventListener("click", (event) => {
    const copyButton = event.target.closest("[data-copy-value]");
    if (copyButton) {
      copyText(copyButton.dataset.copyValue || "");
      return;
    }
    const completeInvoiceButton = event.target.closest("[data-complete-invoice]");
    if (completeInvoiceButton) {
      completeInvoice(completeInvoiceButton.dataset.completeInvoice, completeInvoiceButton);
      return;
    }
    const deleteInvoiceButton = event.target.closest("[data-delete-invoice]");
    if (deleteInvoiceButton) {
      deleteInvoiceCustomer(deleteInvoiceButton.dataset.deleteInvoice, deleteInvoiceButton);
      return;
    }
    const printReportButton = event.target.closest("[data-print-day-report]");
    if (printReportButton) {
      printDayReportFromChef(printReportButton.dataset.printDayReport, printReportButton);
      return;
    }
    const folderButton = event.target.closest("[data-export-report-folder]");
    if (folderButton) {
      exportReportFolder(folderButton.dataset.exportReportFolder);
      return;
    }
    const selectedFolderButton = event.target.closest("[data-export-selected-folder]");
    if (selectedFolderButton) {
      exportSelectedReportFolder(selectedFolderButton.dataset.exportSelectedFolder);
      return;
    }
    const singleFileButton = event.target.closest("[data-export-report-file]");
    if (singleFileButton) {
      exportSingleReportFile(singleFileButton.dataset.exportReportFile);
      return;
    }
    const previewButton = event.target.closest("[data-preview-report-file]");
    if (previewButton) {
      toggleReportFilePreview(previewButton.dataset.previewReportFile);
      return;
    }
    const chefTab = event.target.closest("[data-chef-tab]");
    if (!chefTab) return;
    state.chefTab = chefTab.dataset.chefTab;
    renderChef();
  });

  $("#chefDashboard")?.addEventListener("change", (event) => {
    if (!event.target.matches("#chefEmployeeMonth, #chefNumbersMonth")) return;
    state.selectedMonth = event.target.value;
    loadState().catch(showError);
  });

  $("#customerInvoiceForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = $("#submitCustomerInvoice");
    const status = $("#customerInvoiceStatus");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Sendet...";
    try {
      const customer = {
        name: $("#customerName").value,
        contact: $("#customerContact").value,
        phone: $("#customerPhone").value,
        email: $("#customerEmail").value,
        address: $("#customerAddress").value,
        tip: $("#customerTip").value,
        note: $("#customerNote").value
      };
      const result = await api("/api/state", {
        method: "POST",
        body: JSON.stringify({
          action: "customer-invoice",
          date: localDateValue(),
          customer
        })
      });
      event.target.reset();
      if ($("#customerInvoiceDate")) $("#customerInvoiceDate").value = formatDate(localDateValue());
      status.textContent = result.message || "Rechnungskunde gespeichert.";
      showToast(result.message || "Rechnungskunde angelegt.");
      if (state.invoiceTerminalToken) await loadCustomerInvoiceDesk();
    } catch (error) {
      status.textContent = error.message || String(error);
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
  });

  $("#unlockCustomerInvoiceStaff")?.addEventListener("click", async () => {
    const code = $("#customerInvoiceStaffCode")?.value || "";
    const button = $("#unlockCustomerInvoiceStaff");
    if (!code) {
      showToast("Bitte Mitarbeiter-Code eingeben.");
      return;
    }
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Öffnet...";
    try {
      const result = await api("/api/day-terminal", {
        method: "POST",
        body: JSON.stringify({ action: "login", code, date: todayKey() })
      });
      state.invoiceTerminalToken = result.token || "";
      state.invoiceDate = result.date || todayKey();
      state.invoiceReport = result.report || {};
      state.settings = normalizeSettings(result.settings || state.settings);
      state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
      window.localStorage?.setItem("invoiceTerminalToken", state.invoiceTerminalToken);
      $("#customerInvoiceStaffCode").value = "";
      renderCustomerInvoiceDesk();
      showToast("Tagesübersicht geöffnet.");
    } catch (error) {
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
  });

  $("#lockCustomerInvoiceStaff")?.addEventListener("click", () => {
    state.invoiceTerminalToken = "";
    state.invoiceReport = {};
    window.localStorage?.removeItem("invoiceTerminalToken");
    renderCustomerInvoiceDesk();
    showToast("Mitarbeiterbereich gesperrt.");
  });

  $("#addCustomerInvoiceWorkRow")?.addEventListener("click", () => {
    const list = $("#customerInvoiceWorkList");
    if (!list) return;
    if (list.querySelector(".hint")) list.innerHTML = "";
    list.insertAdjacentHTML("beforeend", invoiceRowHtml());
  });

  $("#customerMasterSearch")?.addEventListener("input", renderCustomerMaster);
  $("#customerMasterSelect")?.addEventListener("change", renderCustomerMaster);

  $("#addCustomerFromMaster")?.addEventListener("click", () => {
    const selectedId = $("#customerMasterSelect")?.value || "";
    const customer = normalizeCustomerDirectory(state.customerDirectory).find((item) => item.id === selectedId);
    if (!customer) {
      showToast("Bitte zuerst einen Kunden aus der Kartei auswählen.");
      return;
    }
    const list = $("#customerInvoiceWorkList");
    if (!list) return;
    if (list.querySelector(".hint")) list.innerHTML = "";
    list.insertAdjacentHTML("beforeend", invoiceRowHtml(customerMasterToInvoice(customer)));
    showToast(`${customer.name} wurde in den Tagesbericht übernommen.`);
  });

  $("#addCustomerExpenseWorkRow")?.addEventListener("click", () => {
    const list = $("#customerExpenseWorkList");
    if (!list) return;
    if (list.querySelector(".hint")) list.innerHTML = "";
    list.insertAdjacentHTML("beforeend", expenseRowHtml());
  });

  $("#saveCustomerInvoiceWork")?.addEventListener("click", (event) => {
    saveCustomerInvoiceDeskReport(event.currentTarget, "Rechnungen gespeichert.");
  });

  $("#saveCustomerExpenses")?.addEventListener("click", (event) => {
    saveCustomerInvoiceDeskReport(event.currentTarget, "Ausgaben gespeichert.");
  });

  $("#saveCustomerDocuments")?.addEventListener("click", (event) => {
    saveCustomerInvoiceDeskReport(event.currentTarget, "Dokumente gespeichert.");
  });

  $("#customerInvoiceStaffArea")?.addEventListener("change", (event) => {
    const input = event.target.closest("#customerReportDocumentPenta, #customerReportDocumentHandwriting, #customerReportDocumentEcCut");
    if (!input || !input.files?.length) return;
    saveCustomerInvoiceDeskReport(input, `${reportDocumentLabelForInput(input)} gespeichert.`);
  });

  $("#customerInvoiceStaffArea")?.addEventListener("click", (event) => {
    const draftButton = event.target.closest("[data-save-invoice-draft]");
    if (draftButton) {
      saveCustomerInvoiceDeskRow(draftButton, false);
      return;
    }
    const readyButton = event.target.closest("[data-mark-invoice-ready]");
    if (readyButton) {
      saveCustomerInvoiceDeskRow(readyButton, true);
      return;
    }
    const expenseSaveButton = event.target.closest("[data-save-expense-entry]");
    if (expenseSaveButton) {
      saveCustomerInvoiceDeskReportWithOptions(expenseSaveButton, "Ausgabe gespeichert.", { mergeExpenses: true });
      return;
    }
    const addExpenseReceiptButton = event.target.closest("[data-add-expense-receipt]");
    if (addExpenseReceiptButton) {
      const row = addExpenseReceiptButton.closest('[data-report-entry="expense"]');
      row?.querySelector(".expense-receipt-upload-list")?.insertAdjacentHTML("beforeend", expenseReceiptUploadHtml());
      return;
    }
    const removeButton = event.target.closest("[data-remove-report-entry]");
    if (!removeButton) return;
    removeCustomerInvoiceDeskEntry(removeButton);
  });

  $("#timesheetGrid").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-save-timesheet]");
    if (!button) return;
    const row = button.closest(".timesheet-row");
    const payload = { date: button.dataset.saveTimesheet, month: state.selectedMonth, employeeToken: state.employeeToken };
    row.querySelectorAll("[data-ts-field]").forEach((input) => {
      payload[input.dataset.tsField] = input.value;
    });
    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = "Speichert...";
    try {
      const result = await api("/api/timesheet", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      state.timesheets[state.activeEmployee] = result.entries || {};
      renderTimesheet();
      renderAccess();
      showToast("Trinkgeld gespeichert.");
    } catch (error) {
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
  });

  $("#saveAvailability").addEventListener("click", async () => {
    const button = $("#saveAvailability");
    const oldText = button.textContent;
    button.disabled = true;
    if (availabilityIsSubmitted()) {
      button.textContent = "Fragt an...";
      try {
        await api("/api/availability-change", {
          method: "POST",
          body: JSON.stringify({
            action: "request",
            month: availabilityMonthValue(),
            employeeToken: state.employeeToken,
            note: $("#availabilityChangeNote") ? $("#availabilityChangeNote").value : ""
          })
        });
        await loadState();
        showToast("Änderung wurde angefragt.");
      } catch (error) {
        showError(error);
      } finally {
        button.textContent = oldText;
        button.disabled = false;
      }
      return;
    }
    button.textContent = "Speichert...";
    try {
      const validation = availabilityValidationMessage();
      if (validation) {
        showToast(validation);
        button.textContent = oldText;
        button.disabled = false;
        return;
      }
      const employee = state.activeEmployee;
      await api("/api/availability", {
        method: "POST",
        body: JSON.stringify({
          month: availabilityMonthValue(),
          employeeToken: state.employeeToken,
          mode: employeeIsFixed(employee) ? "fixed" : "standard",
          days: collectAvailability()
        })
      });
      await loadState();
      state.activeEmployee = employee;
      button.textContent = "Gespeichert";
        showToast("Verfügbarkeit gespeichert.");
      window.setTimeout(() => {
        button.textContent = oldText;
      }, 1400);
    } catch (error) {
      button.textContent = oldText;
      showError(error);
    } finally {
      window.setTimeout(() => {
        button.disabled = false;
      }, 300);
    }
  });

  $("#unlockAdmin").addEventListener("click", async () => {
    try {
      await adminLogin($("#adminPin").value);
    } catch (error) {
      showError(error);
    }
  });

  $("#saveDraft").addEventListener("click", () => saveSchedule(false));
  $("#publishSchedule").addEventListener("click", () => saveSchedule(true));
  $("#planner").addEventListener("click", (event) => {
    const saveButton = event.target.closest("[data-save-week]");
    if (saveButton) {
      saveWeek(saveButton.dataset.saveWeek, false);
      return;
    }
    const publishButton = event.target.closest("[data-publish-week]");
    if (publishButton) {
      saveWeek(publishButton.dataset.publishWeek, true);
      return;
    }
    const deletePlannerWeek = event.target.closest("[data-delete-planner-week]");
    if (deletePlannerWeek) {
      deleteScheduleWeek("", deletePlannerWeek.dataset.deletePlannerWeek);
      return;
    }
    const saveTemplateButton = event.target.closest("[data-save-weekday-template]");
    if (saveTemplateButton) {
      const dayEl = saveTemplateButton.closest(".planner-day");
      const dateKey = dayEl?.dataset.date || "";
      if (!dateKey || !dayEl) return;
      const templates = loadPlannerTemplates();
      templates[plannerWeekdayTemplateKey(dateKey)] = collectDayAssignments(dayEl);
      savePlannerTemplates(templates);
      renderPlanner();
      showToast("Vorlage für diesen Wochentag gespeichert.");
      return;
    }
    const applyTemplateButton = event.target.closest("[data-apply-weekday-template]");
    if (applyTemplateButton) {
      const dayEl = applyTemplateButton.closest(".planner-day");
      const dateKey = dayEl?.dataset.date || "";
      if (!dateKey) return;
      const template = loadPlannerTemplates()[plannerWeekdayTemplateKey(dateKey)];
      if (!template) {
        showToast("Keine Vorlage für diesen Wochentag gefunden.");
        return;
      }
      applyPlannerDayAssignments(dateKey, template);
      renderPlanner();
      showToast("Vorlage angewendet.");
      return;
    }
    const addPositionButton = event.target.closest("[data-add-position]");
    if (addPositionButton) {
      const day = addPositionButton.closest(".planner-day");
      const grid = day?.querySelector(".position-grid");
      const position = addPositionButton.dataset.addPosition;
      if (!day || !grid || !position) return;
      grid.querySelector(".planner-empty-hint")?.remove();
      grid.insertAdjacentHTML("beforeend", plannerPositionHtml(position, day.dataset.date, {}));
      addPositionButton.remove();
      return;
    }
    const removePositionButton = event.target.closest("[data-remove-position]");
    if (removePositionButton) {
      const day = removePositionButton.closest(".planner-day");
      const row = removePositionButton.closest("[data-planner-position]");
      const grid = day?.querySelector(".position-grid");
      const addRow = day?.querySelector(".planner-add-row");
      const position = row?.dataset.plannerPosition;
      if (!day || !row || !grid || !addRow || !position) return;
      row.remove();
      addRow.insertAdjacentHTML("beforeend", `<button class="secondary add-position-button ${positionClass(position)}" type="button" data-add-position="${escapeHtml(position)}">+ ${escapeHtml(position)}</button>`);
      if (!grid.querySelector("[data-planner-position]")) {
        grid.innerHTML = `<p class="hint planner-empty-hint">Noch keine Position geplant.</p>`;
      }
    }
  });

  $("#adminPublishedList").addEventListener("click", async (event) => {
    const deleteMonth = event.target.closest("[data-delete-schedule-month]");
    const unpublishWeek = event.target.closest("[data-unpublish-week]");
    const editWeek = event.target.closest("[data-edit-published-week]");
    if (!deleteMonth && !unpublishWeek && !editWeek) return;
    try {
      if (editWeek) {
        const [month, weekKey] = editWeek.dataset.editPublishedWeek.split("|");
        openWeekForEdit(weekKey);
        const planner = $("#planner");
        const plannerBox = planner?.closest("details");
        if (plannerBox) plannerBox.open = true;
        renderPlanner();
        const weekDetails = $(`[data-planner-week="${weekKey}"]`);
        if (weekDetails) {
          weekDetails.open = true;
          weekDetails.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        const weekInfo = weekFromKey(weekKey);
        showToast(weekInfo ? `Woche ${weekLabel(weekInfo.dates)} zur Bearbeitung geöffnet.` : "Woche zur Bearbeitung geöffnet.");
      } else if (deleteMonth) {
        await deleteScheduleMonth(deleteMonth.dataset.deleteScheduleMonth, { skipConfirm: true });
      } else {
        const [month, weekKey] = unpublishWeek.dataset.unpublishWeek.split("|");
        await deleteScheduleWeek(month, weekKey, { skipConfirm: true });
      }
    } catch (error) {
      showError(error);
    }
  });

  $("#adminSwapList").addEventListener("click", async (event) => {
    const approveButton = event.target.closest("[data-approve-swap]");
    if (!approveButton) return;
    const select = $(`[data-admin-replacement="${approveButton.dataset.approveSwap}"]`);
    try {
      await api("/api/swaps", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: "approve",
          id: approveButton.dataset.approveSwap,
          replacement: select ? select.value : ""
        })
      });
      await loadState();
      showToast("Ersatz bestaetigt und Dienstplan aktualisiert.");
    } catch (error) {
      showError(error);
    }
  });

  $("#adminAvailabilityRequests").addEventListener("click", async (event) => {
    const approveButton = event.target.closest("[data-approve-availability]");
    if (!approveButton) return;
    try {
      await api("/api/availability-change", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: "approve",
          id: approveButton.dataset.approveAvailability
        })
      });
      await loadState();
      showToast("Verfügbarkeit ist wieder bearbeitbar.");
    } catch (error) {
      showError(error);
    }
  });

  $("#sendMessage")?.addEventListener("click", async () => {
    const text = $("#messageText").value.trim();
    const target = $("#messageTarget").value;
    const employees = target === "employees" ? selectedMessageEmployees() : [];
    if (!text) {
      showToast("Bitte Nachricht eingeben.");
      return;
    }
    if (target === "employees" && !employees.length) {
      showToast("Bitte mindestens einen Mitarbeiter auswählen.");
      return;
    }
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: "add-message",
          target,
          employees,
          text
        })
      });
      state.messages = result.messages || [];
      $("#messageText").value = "";
      $$("[data-message-employee]").forEach((input) => { input.checked = false; });
      renderAdminMessages();
      showToast("Nachricht veröffentlicht.");
    } catch (error) {
      showError(error);
    }
  });

  $("#messageTarget")?.addEventListener("change", renderMessageEmployeePicker);
  $("#pushTarget")?.addEventListener("change", renderPushEmployeePicker);

  $("#savePushSettings")?.addEventListener("click", async () => {
    const button = $("#savePushSettings");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Speichert...";
    try {
      const pushSettings = {
        schedulePublished: $("#pushAutoSchedule")?.checked !== false,
        assignmentsTomorrow: $("#pushAutoAssignment")?.checked !== false,
        messages: $("#pushAutoMessages")?.checked !== false,
        schedulePublishedTitle: $("#pushScheduleTitle")?.value.trim() || defaultData.settings.pushSettings.schedulePublishedTitle,
        schedulePublishedBody: $("#pushScheduleBody")?.value.trim() || defaultData.settings.pushSettings.schedulePublishedBody,
        assignmentsTomorrowTitle: $("#pushAssignmentTitle")?.value.trim() || defaultData.settings.pushSettings.assignmentsTomorrowTitle,
        assignmentsTomorrowBody: $("#pushAssignmentBody")?.value.trim() || defaultData.settings.pushSettings.assignmentsTomorrowBody,
        messagesTitle: $("#pushMessagesTitle")?.value.trim() || defaultData.settings.pushSettings.messagesTitle,
        messagesBody: $("#pushMessagesBody")?.value.trim() || defaultData.settings.pushSettings.messagesBody
      };
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({ action: "save-push-settings", pushSettings })
      });
      state.settings = normalizeSettings(result.settings || { ...state.settings, pushSettings });
      renderAdminPushControls();
      $("#pushAdminStatus").textContent = "Push-Einstellungen gespeichert.";
      showToast("Push-Einstellungen gespeichert.");
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });

  $("#sendPushNotification")?.addEventListener("click", async () => {
    const button = $("#sendPushNotification");
    const title = $("#pushTitle")?.value.trim() || "LA-Bowling TeamApp";
    const text = $("#pushText")?.value.trim() || "";
    const target = $("#pushTarget")?.value || "all";
    const employees = target === "employees" ? selectedPushEmployees() : [];
    if (!text) {
      showToast("Bitte Push-Nachricht eingeben.");
      return;
    }
    if (target === "employees" && !employees.length) {
      showToast("Bitte mindestens einen Mitarbeiter auswählen.");
      return;
    }
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Sendet...";
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: "send-push",
          title,
          text,
          target,
          employees
        })
      });
      $("#pushText").value = "";
      $("#pushAdminStatus").textContent = pushResultText(result);
      showToast("Push wurde gesendet.");
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });

  $("#adminMessagesList")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-message]");
    if (!button) return;
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({ action: "delete-message", id: button.dataset.deleteMessage })
      });
      state.messages = result.messages || [];
      renderAdminMessages();
      showToast("Nachricht gelöscht.");
    } catch (error) {
      showError(error);
    }
  });

  $("#sendTerminalMessage")?.addEventListener("click", async () => {
    const text = $("#terminalMessageText")?.value.trim() || "";
    if (!text) {
      showToast("Bitte Terminal-Nachricht eingeben.");
      return;
    }
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: "add-terminal-message",
          text
        })
      });
      state.terminalMessages = result.terminalMessages || [];
      $("#terminalMessageText").value = "";
      renderAdminTerminalMessages();
      renderTerminalLeaderMessages(state.terminalReport, Boolean(state.terminalReport?.closed));
      showToast("Terminal-Nachricht gesendet.");
    } catch (error) {
      showError(error);
    }
  });

  $("#adminTerminalMessagesList")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-terminal-message]");
    if (!button) return;
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({ action: "delete-terminal-message", id: button.dataset.deleteTerminalMessage })
      });
      state.terminalMessages = result.terminalMessages || [];
      renderAdminTerminalMessages();
      renderTerminalLeaderMessages(state.terminalReport, Boolean(state.terminalReport?.closed));
      showToast("Terminal-Nachricht gelöscht.");
    } catch (error) {
      showError(error);
    }
  });

  $("#runningTaskFrequency")?.addEventListener("change", updateRunningTaskFields);
  $("#prepTaskFrequency")?.addEventListener("change", updatePrepClosingTaskFields);
  $("#closingTaskFrequency")?.addEventListener("change", updatePrepClosingTaskFields);
  $("#taskCalendarMonth")?.addEventListener("change", renderTaskCalendar);
  $("#calendarTaskDate")?.addEventListener("change", (event) => {
    const month = String(event.target.value || "").slice(0, 7);
    if ($("#taskCalendarMonth") && month && $("#taskCalendarMonth").value !== month) $("#taskCalendarMonth").value = month;
    if (event.target.value) setCalendarTaskDate(event.target.value);
    renderTaskCalendar();
  });

  $("#closeCalendarTaskPopup")?.addEventListener("click", closeCalendarTaskPopup);
  $("#calendarTaskPopup")?.addEventListener("click", (event) => {
    if (event.target.id === "calendarTaskPopup") closeCalendarTaskPopup();
  });
  $("#calendarTaskPopupEnabled")?.addEventListener("change", updateCalendarPopupFields);

  $("#adminTaskCalendar")?.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-calendar-delete-task]");
    if (deleteButton) {
      event.stopPropagation();
      deleteAdminTask(deleteButton.dataset.calendarDeleteTask);
      return;
    }
    const day = event.target.closest("[data-calendar-date]");
    if (!day) return;
    $("#calendarTaskDate").value = day.dataset.calendarDate;
    const month = day.dataset.calendarDate.slice(0, 7);
    if ($("#taskCalendarMonth") && $("#taskCalendarMonth").value !== month) $("#taskCalendarMonth").value = month;
    renderTaskCalendar();
    openCalendarTaskPopup(day.dataset.calendarDate);
  });

  $("#addCalendarTask")?.addEventListener("click", async () => {
    const intervalDays = Number($("#calendarTaskInterval")?.value || 0);
    const date = $("#calendarTaskDate")?.value || todayKey();
    const saved = await addAdminTask({
      titleSelector: "#calendarTaskTitle",
      noteSelector: "#calendarTaskNote",
      category: "running",
      frequency: intervalDays > 0 ? "interval" : "once",
      date,
      startDate: date,
      endDate: $("#calendarTaskEndDate")?.value || "",
      intervalDays: intervalDays || 1,
      popupEnabled: $("#calendarTaskPopupEnabled")?.checked || false,
      popupTime: $("#calendarTaskPopupTime")?.value || ""
    });
    if (saved) closeCalendarTaskPopup();
  });

  $("#addPrepTask")?.addEventListener("click", async () => {
    const frequency = $("#prepTaskFrequency")?.value || "daily";
    await addAdminTask({
      titleSelector: "#prepTaskTitle",
      noteSelector: "#prepTaskNote",
      category: "preparation",
      frequency,
      weekdays: frequency === "weekly" ? [Number($("#prepTaskWeekday").value)] : []
    });
  });

  $("#addClosingTask")?.addEventListener("click", async () => {
    const frequency = $("#closingTaskFrequency")?.value || "daily";
    await addAdminTask({
      titleSelector: "#closingTaskTitle",
      noteSelector: "#closingTaskNote",
      category: "closing",
      frequency,
      weekdays: frequency === "weekly" ? [Number($("#closingTaskWeekday").value)] : []
    });
  });

  $("#addRunningTask")?.addEventListener("click", async () => {
    const frequency = $("#runningTaskFrequency").value;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await addAdminTask({
      titleSelector: "#runningTaskTitle",
      noteSelector: "#runningTaskNote",
      category: "running",
      frequency,
      weekdays: frequency === "weekly" ? [Number($("#runningTaskWeekday").value)] : [],
      dayOfMonth: frequency === "monthly" ? Number($("#runningTaskDayOfMonth").value || 1) : 1,
      date: frequency === "next-day" && !$("#runningTaskDate").value ? isoDate(tomorrow) : $("#runningTaskDate").value,
      startDate: frequency === "interval" ? ($("#runningTaskDate").value || todayKey()) : "",
      endDate: frequency === "interval" ? ($("#runningTaskEndDate").value || "") : "",
      intervalDays: frequency === "interval" ? Number($("#runningTaskInterval").value || 14) : 1
    });
  });

  async function addAdminTask(config) {
    const titleInput = $(config.titleSelector);
    const noteInput = $(config.noteSelector);
    const title = titleInput?.value.trim() || "";
    if (!title) {
      showToast("Bitte Aufgabe eingeben.");
      return false;
    }
    if (config.popupEnabled && !config.popupTime) {
      showToast("Bitte Popup-Uhrzeit eintragen.");
      return false;
    }
    const task = {
      title,
      frequency: config.frequency,
      category: config.category,
      note: noteInput?.value || "",
      date: config.date || "",
      startDate: config.startDate || "",
      endDate: config.endDate || "",
      intervalDays: config.intervalDays || 1,
      weekdays: config.weekdays || [],
      dayOfMonth: config.dayOfMonth || 1,
      popupEnabled: Boolean(config.popupEnabled),
      popupTime: config.popupEnabled ? config.popupTime : ""
    };
    try {
      state.taskTemplates = sortTaskTemplates([...(state.taskTemplates || []), withTaskDefaults(task)]);
      await saveAllTaskTemplates();
      if (titleInput) titleInput.value = "";
      if (noteInput) noteInput.value = "";
      if (config.category === "running" && $("#runningTaskDate")) $("#runningTaskDate").value = "";
      if (config.titleSelector === "#calendarTaskTitle") {
        $("#calendarTaskInterval").value = "";
        $("#calendarTaskEndDate").value = "";
        $("#calendarTaskPopupEnabled").checked = false;
        $("#calendarTaskPopupTime").value = "";
        updateCalendarPopupFields();
      }
      renderAdminTasks();
      await refreshTerminalTasks();
      showToast("Aufgabe gespeichert.");
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  }

  $("#adminTaskList")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-task]");
    if (!button) return;
    deleteAdminTask(button.dataset.deleteTask);
  });

  async function deleteAdminTask(id) {
    if (!id) return;
    try {
      state.taskTemplates = (state.taskTemplates || []).filter((task) => task.id !== id);
      await saveAllTaskTemplates();
      renderAdminTasks();
      await refreshTerminalTasks();
      showToast("Aufgabe gelöscht.");
    } catch (error) {
      showError(error);
    }
  }

  async function refreshTerminalTasks() {
    if (!state.terminalToken) return;
    try {
      await terminalAction({ action: "load" });
    } catch (error) {
      console.warn("Terminal-Aufgaben konnten nicht aktualisiert werden:", error);
    }
  }

  async function refreshTerminalCleaning() {
    if (!state.terminalToken) return;
    try {
      await terminalAction({ action: "load" });
    } catch (error) {
      console.warn("Reinigungsplan konnte nicht aktualisiert werden:", error);
    }
  }

  function withTaskDefaults(task) {
    return {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...task
    };
  }

  async function saveAllTaskTemplates() {
    state.taskTemplates = sortTaskTemplates(state.taskTemplates || []);
    await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({ taskTemplates: state.taskTemplates || [] })
    });
  }

  $("#addReminder")?.addEventListener("click", async () => {
    const text = $("#reminderText").value.trim();
    if (!text) return showToast("Bitte Erinnerungstext eingeben.");
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: "add-reminder",
          reminder: {
            text,
            startAfterOpeningMinutes: Number($("#reminderStart").value || 60),
            intervalMinutes: Number($("#reminderInterval").value || 60),
            active: $("#reminderActive").value !== "no"
          }
        })
      });
      state.reminderTemplates = result.reminderTemplates || [];
      $("#reminderText").value = "";
      renderAdminReminders();
      showToast("Erinnerung gespeichert.");
    } catch (error) {
      showError(error);
    }
  });

  $("#adminReminderList")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-reminder]");
    if (!button) return;
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({ action: "delete-reminder", id: button.dataset.deleteReminder })
      });
      state.reminderTemplates = result.reminderTemplates || [];
      renderAdminReminders();
      showToast("Erinnerung gelöscht.");
    } catch (error) {
      showError(error);
    }
  });

  $("#cleaningTaskFrequency")?.addEventListener("change", updateCleaningTaskFields);

  $("#addCleaningTask")?.addEventListener("click", async () => {
    const title = $("#cleaningTaskTitle")?.value.trim() || "";
    if (!title) return showToast("Bitte Reinigungsaufgabe eingeben.");
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: "add-cleaning-template",
          task: {
            title,
            frequency: "weekly",
            weekdays: [],
            note: $("#cleaningTaskNote")?.value || ""
          }
        })
      });
      state.cleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates);
      $("#cleaningTaskTitle").value = "";
      $("#cleaningTaskNote").value = "";
      renderAdminCleaningTasks();
      await refreshTerminalCleaning();
      showToast("Reinigungsaufgabe gespeichert.");
    } catch (error) {
      showError(error);
    }
  });

  $("#adminCleaningTaskTable")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-cleaning-task]");
    if (!button) return;
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({ action: "delete-cleaning-template", id: button.dataset.deleteCleaningTask })
      });
      state.cleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates);
      renderAdminCleaningTasks();
      await refreshTerminalCleaning();
      showToast("Reinigungsaufgabe gelöscht.");
    } catch (error) {
      showError(error);
    }
  });

  $("#adminEmployeeOverview")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-save-timesheet]");
    if (!button) return;
    saveAdminTimesheet(button);
  });

  $("#adminContent")?.addEventListener("change", (event) => {
    if (!event.target.matches("#adminNumbersMonth")) return;
    state.selectedMonth = event.target.value;
    if ($("#monthInput")) $("#monthInput").value = state.selectedMonth;
    loadState().catch(showError);
  });

  $("#addEmployeeCard")?.addEventListener("click", () => {
    syncEmployeeDirectoryToTextareas();
    const base = "Neuer Mitarbeiter";
    let name = base;
    let counter = 2;
    const existing = new Set($("#employeesText").value.split("\n").map((line) => line.trim()).filter(Boolean));
    while (existing.has(name)) {
      name = `${base} ${counter}`;
      counter += 1;
    }
    state.settings.employees = [...existing, name];
    state.settings.employeeDepartments = textToDepartments($("#employeeDepartmentsText").value);
    state.settings.employeeRoles = textToRoles($("#employeeRolesText").value);
    state.settings.adminEmployees = linesToList($("#adminEmployeesText").value);
    state.settings.availabilityExemptEmployees = linesToList($("#availabilityExemptText").value);
    renderEmployeeDirectory();
    const cards = $$(".employee-card");
    cards.at(-1)?.setAttribute("open", "");
    cards.at(-1)?.querySelector('[data-employee-field="name"]')?.focus();
  });

  $("#employeeDirectory")?.addEventListener("click", (event) => {
    const saveButton = event.target.closest("[data-save-employees]");
    if (saveButton) {
      saveSettings(saveButton);
      return;
    }
    const removeButton = event.target.closest("[data-remove-employee]");
    if (!removeButton) return;
    removeButton.closest(".employee-card")?.remove();
    syncEmployeeDirectoryToTextareas();
    showToast("Mitarbeiter entfernt. Bitte Einstellungen speichern.");
  });

  $("#employeeDirectory")?.addEventListener("input", syncEmployeeDirectoryToTextareas);
  $("#employeeDirectory")?.addEventListener("change", syncEmployeeDirectoryToTextareas);

  $("#addPositionRow")?.addEventListener("click", () => {
    syncPositionDirectoryToTextarea();
    const existing = linesToList($("#positionsText").value);
    let name = "Neuer Bereich";
    let counter = 2;
    while (existing.includes(name)) {
      name = `Neuer Bereich ${counter}`;
      counter += 1;
    }
    $("#positionsText").value = [...existing, name].join("\n");
    renderPositionDirectory();
    syncEmployeeDirectoryToTextareas();
    renderEmployeeDirectory();
    [...document.querySelectorAll("[data-position-name]")].at(-1)?.focus();
  });

  $("#positionDirectory")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-position]");
    if (!button) return;
    button.closest(".position-row")?.remove();
    syncPositionDirectoryToTextarea();
    syncEmployeeDirectoryToTextareas();
    renderEmployeeDirectory();
    showToast("Dienstbereich entfernt. Bitte Einstellungen speichern.");
  });

  $("#positionDirectory")?.addEventListener("input", () => {
    syncPositionDirectoryToTextarea();
    syncEmployeeDirectoryToTextareas();
    renderEmployeeDirectory();
  });

  $("#saveSettings").addEventListener("click", () => saveSettings($("#saveSettings")));
  $("#saveEmployees")?.addEventListener("click", () => saveSettings($("#saveEmployees")));
  $("#sendInvoiceTestMail")?.addEventListener("click", () => sendInvoiceTestMail($("#sendInvoiceTestMail")));

  $("#openCorrectionReport")?.addEventListener("click", (event) => {
    openCorrectionReport(event.currentTarget);
  });

  $("#closeCorrectionReport")?.addEventListener("click", (event) => {
    closeCorrectionReport(event.currentTarget);
  });

  $("#unlockTerminal")?.addEventListener("click", async () => {
    const button = $("#unlockTerminal");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Öffnet...";
    try {
      await terminalLogin($("#terminalCode").value.trim());
      $("#terminalCode").value = "";
    } catch (error) {
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
  });

  $("#terminalContent")?.addEventListener("click", async (event) => {
    const tab = event.target.closest("[data-terminal-tab]");
    if (tab) {
      state.terminalTab = tab.dataset.terminalTab;
      renderTerminal();
      return;
    }
    const saveAssignments = event.target.closest("#saveTerminalAssignments");
    if (saveAssignments) {
      const oldText = saveAssignments.textContent;
      saveAssignments.disabled = true;
      saveAssignments.textContent = "Speichert...";
      try {
        const result = await terminalAction({
          action: "save-assignment-times",
          assignmentTimes: collectTerminalAssignmentTimes()
        });
        showToast(result.message || "Einteilung gespeichert.");
        saveAssignments.textContent = "Gespeichert";
        window.setTimeout(() => {
          saveAssignments.textContent = oldText;
        }, 1400);
      } catch (error) {
        saveAssignments.textContent = oldText;
        showError(error);
      } finally {
        window.setTimeout(() => {
          saveAssignments.disabled = false;
        }, 300);
      }
      return;
    }
    const terminalMessageButton = event.target.closest("[data-confirm-terminal-message]");
    if (terminalMessageButton) {
      const oldText = terminalMessageButton.textContent;
      terminalMessageButton.disabled = true;
      terminalMessageButton.textContent = "Quittiert...";
      try {
        const result = await terminalAction({
          action: "confirm-terminal-message",
          messageId: terminalMessageButton.dataset.confirmTerminalMessage
        });
        showToast(result.message || "Nachricht quittiert.");
      } catch (error) {
        terminalMessageButton.disabled = false;
        terminalMessageButton.textContent = oldText;
        showError(error);
      }
      return;
    }
    const editDayMeta = event.target.closest("#editTerminalDayMeta");
    if (editDayMeta) {
      state.terminalDayMetaEditing = true;
      renderTerminal();
      return;
    }
    const returnToCorrection = event.target.closest("#returnToAdminCorrection");
    if (returnToCorrection) {
      state.adminUnlocked = true;
      renderAll();
      activateTab("admin");
      $$(".admin-workspace-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.adminWorkspaceTab === "correction"));
      $$(".admin-workspace").forEach((section) => section.classList.toggle("active", section.dataset.adminWorkspace === "correction"));
      showToast("Korrekturmodus im Admin-Bereich geöffnet.");
    }
  });

  $("#terminalContent")?.addEventListener("change", async (event) => {
    const taskInput = event.target.closest("[data-terminal-task]");
    if (!taskInput) return;
    const taskId = taskInput.dataset.terminalTask;
    const done = taskInput.checked;
    const previousCompletions = cloneData(state.terminalReport?.taskCompletions || {});
    state.terminalReport = {
      ...(state.terminalReport || {}),
      taskCompletions: {
        ...(state.terminalReport?.taskCompletions || {}),
        ...(done ? { [taskId]: { done: true, doneAt: new Date().toISOString() } } : {})
      }
    };
    if (!done) delete state.terminalReport.taskCompletions[taskId];
    renderTerminalTasks(state.terminalReport, Boolean(state.terminalReport?.closed));
    try {
      await terminalAction({ action: "complete-task", id: taskId, done });
      showToast(done ? "Aufgabe erledigt." : "Aufgabe wieder geöffnet.");
    } catch (error) {
      state.terminalReport = { ...(state.terminalReport || {}), taskCompletions: previousCompletions };
      renderTerminalTasks(state.terminalReport, Boolean(state.terminalReport?.closed));
      showError(error);
    }
  });

  $("#terminalContent")?.addEventListener("change", async (event) => {
    const cleaningInput = event.target.closest("[data-cleaning-task]");
    if (!cleaningInput) return;
    const taskId = cleaningInput.dataset.cleaningTask;
    const done = cleaningInput.checked;
    const employeeSelect = $(`[data-cleaning-employee="${cssEscape(taskId)}"]`);
    const employee = employeeSelect?.value || "";
    if (done && !employee) {
      cleaningInput.checked = false;
      showToast("Bitte ausführende Person auswählen.");
      return;
    }
    const previousCompletions = cloneData(state.terminalReport?.cleaningCompletions || {});
    const previousWeeklyCompletions = cloneData(state.terminalWeeklyCleaningCompletions || {});
    state.terminalReport = {
      ...(state.terminalReport || {}),
      cleaningCompletions: {
        ...(state.terminalReport?.cleaningCompletions || {}),
        ...(done ? { [taskId]: { done: true, employee, doneAt: new Date().toISOString() } } : {})
      }
    };
    if (done) {
      state.terminalWeeklyCleaningCompletions = {
        ...(state.terminalWeeklyCleaningCompletions || {}),
        [taskId]: state.terminalReport.cleaningCompletions[taskId]
      };
    } else {
      delete state.terminalReport.cleaningCompletions[taskId];
      delete state.terminalWeeklyCleaningCompletions[taskId];
    }
    renderTerminalTasks(state.terminalReport, Boolean(state.terminalReport?.closed));
    try {
      await terminalAction({ action: "complete-cleaning", id: taskId, employee, done });
      showToast(done ? "Reinigung dokumentiert." : "Reinigung wieder geöffnet.");
    } catch (error) {
      state.terminalReport = { ...(state.terminalReport || {}), cleaningCompletions: previousCompletions };
      state.terminalWeeklyCleaningCompletions = previousWeeklyCompletions;
      renderTerminalTasks(state.terminalReport, Boolean(state.terminalReport?.closed));
      showError(error);
    }
  });

  $("#confirmToiletCheck")?.addEventListener("click", async () => {
    if (!state.pendingToiletCheck) return;
    try {
      const result = await confirmToiletCheck();
      showToast(result.message || "Kontrolle quittiert.");
    } catch (error) {
      showError(error);
    }
  });

  $("#openHandover")?.addEventListener("click", () => {
    $("#handoverModal")?.classList.remove("hidden");
    const time = $("#handoverTime");
    if (time && !time.value) {
      const now = new Date();
      time.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }
  });

  $("#closeHandover")?.addEventListener("click", () => {
    $("#handoverModal")?.classList.add("hidden");
  });

  $("#saveTerminalDayMeta")?.addEventListener("click", async () => {
    const button = $("#saveTerminalDayMeta");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Speichert...";
    try {
      const result = await terminalAction({
        action: "save-day-meta",
        openingHours: $("#terminalOpeningHours")?.value || "",
        shiftLeader: $("#terminalShiftLeader")?.value || ""
      });
      state.terminalDayMetaEditing = false;
      renderTerminal();
      button.textContent = "Gespeichert";
      showToast(result.message || "Tageskopf gespeichert.");
      window.setTimeout(() => {
        button.textContent = oldText;
      }, 1400);
    } catch (error) {
      button.textContent = oldText;
      showError(error);
    } finally {
      window.setTimeout(() => {
        button.disabled = false;
      }, 300);
    }
  });

  $("#saveHandover")?.addEventListener("click", async () => {
    const button = $("#saveHandover");
    const oldText = button.textContent;
    const handover = {
      from: $("#handoverFrom")?.value || "",
      to: $("#handoverTo")?.value || "",
      time: $("#handoverTime")?.value || "",
      note: $("#handoverNote")?.value || ""
    };
    if (!handover.from || !handover.to || !handover.note.trim()) {
      showToast("Bitte Von, An und Übergabe-Notiz ausfüllen.");
      return;
    }
    button.disabled = true;
    button.textContent = "Speichert...";
    try {
      const result = await terminalAction({ action: "add-handover", handover });
      $("#handoverNote").value = "";
      $("#handoverTime").value = "";
      $("#handoverModal")?.classList.add("hidden");
      showToast(result.message || "Übergabe gespeichert.");
    } catch (error) {
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
  });

  $("#terminalEmployees")?.addEventListener("click", async (event) => {
    const addSegmentButton = event.target.closest("[data-add-time-segment]");
    if (addSegmentButton) {
      const card = addSegmentButton.closest(".terminal-employee");
      const list = card?.querySelector(".terminal-time-segments");
      if (!card || !list) return;
      const index = list.querySelectorAll("[data-terminal-segment-row]").length;
      list.insertAdjacentHTML("beforeend", terminalTimeSegmentRowHtml({}, index, false));
      refreshTerminalSegmentNumbers(card);
      list.querySelectorAll("[data-terminal-segment-row]").item(index)?.querySelector("input")?.focus();
      return;
    }
    const removeSegmentButton = event.target.closest("[data-remove-time-segment]");
    if (removeSegmentButton) {
      const card = removeSegmentButton.closest(".terminal-employee");
      removeSegmentButton.closest("[data-terminal-segment-row]")?.remove();
      if (card) refreshTerminalSegmentNumbers(card);
      return;
    }
    const removeButton = event.target.closest("[data-terminal-remove]");
    if (removeButton) {
      if (!window.confirm(`${removeButton.dataset.terminalRemove} aus der heutigen Arbeitszeit-Ansicht entfernen?`)) return;
      const oldText = removeButton.textContent;
      removeButton.disabled = true;
      removeButton.textContent = "Entfernt...";
      try {
        const result = await terminalAction({
          action: "remove-employee",
          employee: removeButton.dataset.terminalRemove
        });
        showToast(result.message || "Mitarbeiter entfernt.");
      } catch (error) {
        showError(error);
      } finally {
        removeButton.textContent = oldText;
        removeButton.disabled = false;
      }
      return;
    }
    const adjustButton = event.target.closest("[data-terminal-adjust]");
    if (adjustButton) {
      const card = adjustButton.closest(".terminal-employee");
      const oldText = adjustButton.textContent;
      adjustButton.disabled = true;
      adjustButton.textContent = "Speichert...";
      try {
        const result = await terminalAction({
          action: "adjust-time",
          employee: adjustButton.dataset.terminalAdjust,
          segments: collectTerminalTimeSegments(card)
        });
        showToast(result.message || "Zeiten korrigiert.");
      } catch (error) {
        showError(error);
      } finally {
        adjustButton.textContent = oldText;
        adjustButton.disabled = false;
      }
      return;
    }
    const button = event.target.closest("[data-terminal-punch]");
    if (!button) return;
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Speichert...";
    try {
      const result = await terminalAction({
        action: "punch",
        employee: button.dataset.terminalEmployee,
        punchType: button.dataset.terminalPunch
      });
      showToast(result.message || "Zeit gespeichert.");
    } catch (error) {
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
  });

  $("#addTerminalEmployee")?.addEventListener("click", async () => {
    const select = $("#terminalAddEmployee");
    if (!select?.value) {
      showToast("Bitte Mitarbeiter auswählen.");
      return;
    }
    const button = $("#addTerminalEmployee");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Fügt hinzu...";
    try {
      const result = await terminalAction({ action: "add-employee", employee: select.value });
      select.value = "";
      select.closest("details")?.removeAttribute("open");
      showToast(result.message || "Mitarbeiter hinzugefügt.");
    } catch (error) {
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
  });

  $("#addInvoiceCustomer")?.addEventListener("click", () => {
    const list = $("#invoiceCustomersList");
    if (!list) return;
    if (list.querySelector(".hint")) list.innerHTML = "";
    list.insertAdjacentHTML("beforeend", invoiceRowHtml());
  });

  $("#addExpense")?.addEventListener("click", () => {
    const list = $("#expensesList");
    if (!list) return;
    if (list.querySelector(".hint")) list.innerHTML = "";
    list.insertAdjacentHTML("beforeend", expenseRowHtml());
    syncCashExpensesFromExpenseRows(false);
    updateReportBarTotal();
  });

  $("#terminalFinanceSection")?.addEventListener("click", (event) => {
    const draftButton = event.target.closest("[data-save-invoice-draft]");
    if (draftButton) {
      saveInvoiceRow(draftButton, false);
      return;
    }
    const readyButton = event.target.closest("[data-mark-invoice-ready]");
    if (readyButton) {
      saveInvoiceRow(readyButton, true);
      return;
    }
    const expenseSaveButton = event.target.closest("[data-save-expense-entry]");
    if (expenseSaveButton) {
      saveExpenseRow(expenseSaveButton);
      return;
    }
    const addExpenseReceiptButton = event.target.closest("[data-add-expense-receipt]");
    if (addExpenseReceiptButton) {
      const row = addExpenseReceiptButton.closest('[data-report-entry="expense"]');
      row?.querySelector(".expense-receipt-upload-list")?.insertAdjacentHTML("beforeend", expenseReceiptUploadHtml());
      return;
    }
    const removeDocumentButton = event.target.closest("[data-remove-report-document]");
    if (removeDocumentButton) {
      const key = removeDocumentButton.dataset.removeReportDocument;
      if (!key) return;
      clearReportDocumentFields(key);
      saveReportDocumentsNow(removeDocumentButton, "Dokument entfernt.");
      return;
    }
    const removeButton = event.target.closest("[data-remove-report-entry]");
    if (!removeButton) return;
    removeTerminalFinanceEntry(removeButton);
  });

  $("#terminalFinanceSection")?.addEventListener("change", (event) => {
    const input = event.target.closest("#reportDocumentPenta, #reportDocumentHandwriting, #reportDocumentEcCut");
    if (!input || !input.files?.length) return;
    saveReportDocumentsNow(input, `${reportDocumentLabelForInput(input)} gespeichert.`);
  });

  $("#saveDayReport")?.addEventListener("click", async () => {
    const button = $("#saveDayReport");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Speichert...";
    try {
      await terminalAction(await collectDayReportPayload());
      button.textContent = "Gespeichert";
      showToast("Tagesbericht gespeichert.");
      window.setTimeout(() => {
        button.textContent = oldText;
      }, 1400);
    } catch (error) {
      button.textContent = oldText;
      showError(error);
    } finally {
      window.setTimeout(() => {
        button.disabled = false;
      }, 300);
    }
  });

  ["#reportCashTotal", "#reportCashExpenses", "#reportEcTerminal1", "#reportEcTerminal2", "#reportPersonalConsumption", "#reportRevenueBowling", "#reportRevenueDrinks", "#reportRevenueFood", "#reportRevenueOther", "#reportRevenueGastro"].forEach((selector) => {
    $(selector)?.addEventListener("input", updateReportBarTotal);
  });

  $("#expensesList")?.addEventListener("input", () => {
    syncCashExpensesFromExpenseRows(false);
    updateReportBarTotal();
  });

  $("#saveTipDistribution")?.addEventListener("click", async () => {
    const button = $("#saveTipDistribution");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Speichert...";
    try {
      const result = calculateTipDistribution(state.terminalDate || todayKey());
      await terminalAction({
        action: "save-tips",
        cashTotal: $("#reportCashTotal")?.value || "",
        cashExpenses: cashExpensesFromFormOrReport().toFixed(2),
        ecTerminal1: $("#reportEcTerminal1")?.value || "",
        ecTerminal2: $("#reportEcTerminal2")?.value || "",
        ecTotal: ecTotalFromFormOrReport().toFixed(2),
        personalConsumption: $("#reportPersonalConsumption")?.value || "",
        revenueBowling: $("#reportRevenueBowling")?.value || "",
        revenueDrinks: $("#reportRevenueDrinks")?.value || "",
        revenueFood: $("#reportRevenueFood")?.value || "",
        revenueOther: $("#reportRevenueOther")?.value || "",
        revenueGastro: gastroRevenueFromFormOrReport().toFixed(2),
        resetTipPayout: true,
        tipTotal: result.tipTotal.toFixed(2),
        tipRemainder: result.tipRemainder.toFixed(2),
        tipsByEmployee: Object.fromEntries(result.rows.map((row) => [row.employee, row.tip.toFixed(2)])),
        documents: await collectReportDocuments()
      });
      button.textContent = "Gespeichert";
      showToast("Umsatzdetails gespeichert.");
      window.setTimeout(() => {
        button.textContent = oldText;
      }, 1400);
    } catch (error) {
      button.textContent = oldText;
      showError(error);
    } finally {
      window.setTimeout(() => {
        button.disabled = false;
      }, 300);
    }
  });

  $("#tipDistributionList")?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-confirm-tip-payout-employee]");
    if (!button) return;
    const employee = button.dataset.confirmTipPayoutEmployee || "";
    const row = normalizedTipOverview().employees.find((item) => item.employee === employee);
    const amount = reportMoneyNumber(row?.openAmount);
    if (!employee || amount <= 0) {
      showToast("Kein Trinkgeld zum Auszahlen vorhanden.");
      return;
    }
    if (!confirm(`${employee}: Auszahlung von ${formatMoney(amount)} bestätigen? Nur der Terminal-Zähler springt auf 0,00 €, die Mitarbeiter-App bleibt unverändert.`)) return;
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Bestätigt...";
    try {
      await terminalAction({
        action: "confirm-employee-tip-payout",
        employee
      });
      showToast(`${employee}: Trinkgeld-Auszahlung bestätigt.`);
    } catch (error) {
      button.textContent = oldText;
      button.disabled = false;
      showError(error);
    }
  });

  $("#closeDayReport")?.addEventListener("click", async () => {
    if (!confirm("Tagesbericht abschließen? Danach kann er nicht mehr verändert werden.")) return;
    const button = $("#closeDayReport");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Schließt...";
    try {
      await terminalAction(await collectDayReportPayload());
      await terminalAction({ action: "close-report" });
      showToast("Tagesbericht abgeschlossen.");
    } catch (error) {
      button.textContent = oldText;
      button.disabled = false;
      showError(error);
    }
  });

  $("#printDayReport")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const report = $("#dayReportPrintArea");
    if (report) report.open = true;
    const hadTerminalMode = document.body.classList.contains("terminal-mode");
    document.body.classList.add("terminal-mode");
    const cleanup = () => {
      if (!hadTerminalMode) document.body.classList.remove("terminal-mode");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 1200);
  });
  $("#printCleaningPlan")?.addEventListener("click", () => {
    document.body.classList.add("print-cleaning-plan");
    window.setTimeout(() => window.print(), 20);
    window.setTimeout(() => document.body.classList.remove("print-cleaning-plan"), 800);
  });
  $("#printSchedule").addEventListener("click", () => window.print());
}

async function saveWeek(weekKey, published) {
  const week = plannerVisibleWeeks().find((item) => item.key === weekKey);
  if (!week) return;
  const dateKeys = week.dates.map(isoDate);
  if (published) {
    const conflicts = publishConflictsForDateKeys(dateKeys);
    if (conflicts.length) {
      const summary = conflicts.slice(0, 3).map((item) => `${formatDate(item.date)}: ${item.employee}`).join(" | ");
      const more = conflicts.length > 3 ? ` (+${conflicts.length - 3} weitere)` : "";
      $("#adminStatus").textContent = `Konflikt: Mitarbeiter doppelt am gleichen Tag eingeplant. ${summary}${more}`;
      showToast("Konflikt in der Wochenplanung gefunden.");
      return;
    }
  }
  const button = $(`[data-${published ? "publish" : "save"}-week="${weekKey}"]`);
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Speichert...";
  }
  $("#adminStatus").textContent = published ? "Woche wird veröffentlicht..." : "Woche wird gespeichert...";
  try {
    const grouped = groupDateKeysByMonth(dateKeys);
    for (const [month, monthDateKeys] of Object.entries(grouped)) {
      await api("/api/state", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: published ? "schedule-publish-week" : "schedule-save-week",
          month,
          weekKey,
          days: collectScheduleForDates(monthDateKeys)
        })
      });
    }
    await loadState();
    const message = published ? "Woche ist veröffentlicht." : "Woche gespeichert.";
    $("#adminStatus").textContent = message;
    showToast(message);
  } catch (error) {
    $("#adminStatus").textContent = "Fehler: " + (error.message || String(error));
    showError(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function deleteScheduleWeek(month, weekKey, options = {}) {
  if (!options.skipConfirm && !window.confirm("Diese Woche wirklich löschen?")) return;
  const button = $(`[data-delete-planner-week="${weekKey}"]`);
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Löscht...";
  }
  try {
    const weekDates = plannerVisibleWeeks().find((week) => week.key === weekKey)?.dates.map(isoDate) || [];
    const months = month
      ? [month]
      : Object.keys(groupDateKeysByMonth(weekDates));
    for (const monthKey of months) {
      await api("/api/state", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({ action: "schedule-delete-week", month: monthKey, weekKey })
      });
    }
    state.plannerEditWeeks = (state.plannerEditWeeks || []).filter((key) => key !== weekKey);
    await loadState();
    $("#adminStatus").textContent = "Woche wurde gelöscht.";
    showToast("Woche wurde gelöscht.");
  } catch (error) {
    $("#adminStatus").textContent = "Fehler: " + (error.message || String(error));
    showError(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function deleteScheduleMonth(month, options = {}) {
  if (!options.skipConfirm && !window.confirm("Den kompletten Dienstplan-Monat wirklich löschen?")) return;
  try {
    await api("/api/state", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({ action: "schedule-delete-month", month })
    });
    await loadState();
    $("#adminStatus").textContent = "Dienstplan-Monat geloescht.";
    showToast("Dienstplan-Monat geloescht.");
  } catch (error) {
    $("#adminStatus").textContent = "Fehler: " + (error.message || String(error));
    showError(error);
  }
}

function collectScheduleForDates(dateKeys) {
  const all = collectSchedule();
  const days = {};
  dateKeys.forEach((key) => {
    days[key] = all[key] || {};
  });
  return days;
}

function publishConflictsForDateKeys(dateKeys) {
  const days = collectScheduleForDates(dateKeys);
  const conflicts = [];
  for (const [dateKey, assignments] of Object.entries(days)) {
    const counts = {};
    Object.entries(assignments || {}).forEach(([position, employee]) => {
      if (!employee || position.includes("__")) return;
      counts[employee] = (counts[employee] || 0) + 1;
    });
    Object.entries(counts).forEach(([employee, count]) => {
      if (count > 1) conflicts.push({ date: dateKey, employee });
    });
  }
  return conflicts;
}

function groupDateKeysByMonth(dateKeys) {
  return dateKeys.reduce((acc, dateKey) => {
    const month = String(dateKey || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) return acc;
    acc[month] ||= [];
    acc[month].push(dateKey);
    return acc;
  }, {});
}

function linesToList(text) {
  return [...new Set(String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean))];
}

async function swapAction(payload, successMessage) {
  if (!state.employeeToken) {
    showToast("Bitte zuerst mit Mitarbeiter-PIN anmelden.");
    return;
  }
  try {
    await api("/api/swaps", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        employeeToken: state.employeeToken
      })
    });
    await loadState();
    showToast(successMessage);
  } catch (error) {
    showError(error);
  }
}

async function requestSwapFromSchedule(date, position) {
  if (!state.activeEmployee || !state.employeeToken) {
    showToast("Bitte zuerst mit Mitarbeiter-PIN anmelden.");
    return;
  }
  const alreadyOpen = (state.swaps.open || []).some((swap) => (
    swap.date === date && swap.position === position && swap.employee === state.activeEmployee
  ));
  if (alreadyOpen) {
    showToast("Für diesen Dienst gibt es bereits eine Anfrage.");
    return;
  }
  if (!confirm(`Anfrage zum Diensttausch?\n\n${formatDate(date)}\n${position}`)) return;
  await swapAction({
    action: "offer",
    month: date.slice(0, 7),
    date,
    position,
    note: ""
  }, "Diensttausch-Anfrage ist online.");
}

async function saveSchedule(published) {
  const button = published ? $("#publishSchedule") : $("#saveDraft");
  const oldText = button.textContent;
  if (published) {
    const conflicts = publishConflictsForDateKeys(Object.keys(collectSchedule()));
    if (conflicts.length) {
      const summary = conflicts.slice(0, 3).map((item) => `${formatDate(item.date)}: ${item.employee}`).join(" | ");
      const more = conflicts.length > 3 ? ` (+${conflicts.length - 3} weitere)` : "";
      $("#adminStatus").textContent = `Konflikt: Mitarbeiter doppelt am gleichen Tag eingeplant. ${summary}${more}`;
      showToast("Konflikt in der Planung gefunden.");
      return;
    }
  }
  $("#adminStatus").textContent = published ? "Dienstplan wird veröffentlicht..." : "Entwurf wird gespeichert...";
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    await api("/api/state", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({ action: "schedule-save-month", month: state.selectedMonth, published, days: collectSchedule() })
    });
    await loadState();
    const message = published ? "Dienstplan ist online." : "Entwurf gespeichert.";
    $("#adminStatus").textContent = message;
    button.textContent = published ? "Veröffentlicht" : "Gespeichert";
    showToast(message);
    window.setTimeout(() => {
      button.textContent = oldText;
    }, 1400);
  } catch (error) {
    $("#adminStatus").textContent = "Fehler: " + (error.message || String(error));
    button.textContent = oldText;
    showError(error);
  } finally {
    window.setTimeout(() => {
      button.disabled = false;
    }, 300);
  }
}

bindEvents();
window.setInterval(() => {
  if (state.terminalToken) refreshTerminalReminderState();
}, 30000);
window.addEventListener("focus", () => {
  if (state.terminalToken) refreshTerminalReminderState();
});
if (isTerminalMode()) document.body.classList.add("terminal-mode");
if (isTodoMode()) document.body.classList.add("todo-mode");
if (isCustomerInvoiceMode()) document.body.classList.add("customer-invoice-mode");
state.settings = cloneData(defaultData.settings);
state.availability = {};
state.schedule = { month: state.selectedMonth, published: false, days: {} };
state.allSchedules = {};
renderAll();
if (isTerminalMode() || isTodoMode()) activateTab("terminal");
if (isCustomerInvoiceMode()) activateTab("customerInvoice");
loadState().catch(showError);
if (isCustomerInvoiceMode() && state.invoiceTerminalToken) loadCustomerInvoiceDesk().catch((error) => {
  state.invoiceTerminalToken = "";
  window.localStorage?.removeItem("invoiceTerminalToken");
  showError(error);
  renderCustomerInvoiceDesk();
});
