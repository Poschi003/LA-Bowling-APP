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
  chefReportDate: "",
  chefInvoiceFolder: "",
  chefInvoiceItemOpen: "",
  chefReportSearch: "",
  chefSearchScope: "all",
  chefSearchMonthOnly: false,
  chefSearchOpenInvoicesOnly: false,
  chefSearchMissingDocsOnly: false,
  chefExportMonth: "",
  adminReportDate: "",
  adminReportSearch: "",
  timesheets: {},
  messages: [],
  terminalMessages: [],
  pushPublicKey: "",
  pushSubscriptionActive: false,
  dayReports: {},
  assignmentTimes: {},
  assignmentSchedules: {},
  assignmentAvailability: {},
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
  terminalTableDraft: null,
  terminalTableGroupDraft: null,
  terminalTableCustomDraft: null,
  adminTablePlanDraft: null,
  adminTablePlanZoneDraft: null,
  terminalTableConfig: { seatsByTable: {}, tableOverrides: {}, customTables: [], zoneOverrides: {} },
  terminalTableInfo: { todayDate: "", todayAvailable: false, todayItems: 0, selectedItems: 0, selectedAvailable: false },
  terminalTableSort: "time",
  terminalTableDragId: "",
  terminalTableStaffDraft: null,
  terminalTableView: "manage",
  terminalTableFullscreen: false,
  adminTablePlanInteraction: null,
  adminTablePlanSuppressClickUntil: 0,
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
  offers: [],
  offerDraft: null,
  offerDraftId: "",
  offerDraftDirty: false,
  offerCustomerSearch: "",
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
const TERMINAL_TABLE_ZONES = [
  { id: "lanes", label: "Bahnen 1-14", x: 1.5, y: 4, w: 13, h: 76, className: "is-lanes" },
  { id: "nz-small", label: "T50 · NZ Klein", x: 17, y: 4, w: 20, h: 10, className: "is-room" },
  { id: "main-left", label: "Gastraum", x: 17, y: 16, w: 21, h: 33, className: "is-open" },
  { id: "dj", label: "DJ-Bereich", x: 42, y: 17, w: 9, h: 31, className: "is-open" },
  { id: "main-bottom", label: "Gastraum unten", x: 17, y: 54, w: 20, h: 17, className: "is-open" },
  { id: "nz-big", label: "T60 · NZ Groß", x: 56, y: 4, w: 27, h: 10, className: "is-room" },
  { id: "hut", label: "Hütte Außen · T70", x: 84.5, y: 4, w: 13, h: 10, className: "is-room" },
  { id: "billiard", label: "Billardtische", x: 60, y: 26, w: 26, h: 28, className: "is-open" }
];
const TERMINAL_TABLE_LAYOUT = [
  ...Array.from({ length: 14 }, (_, index) => ({
    id: String(index + 1),
    label: String(index + 1),
    area: "Bahn",
    seats: 6,
    x: 2,
    y: 74 - (index * 5.05),
    w: 11.5,
    h: 4.7,
    shape: "lane"
  })),
  { id: "T50", label: "T50", area: "Nebenraum klein", seats: 20, x: 18, y: 5, w: 18, h: 8.5, shape: "room" },
  { id: "T15", label: "T15", area: "Gastraum", seats: 4, x: 20, y: 17.5, w: 6.4, h: 5.4, shape: "table" },
  { id: "T16", label: "T16", area: "Gastraum", seats: 4, x: 20, y: 25, w: 6.4, h: 5.4, shape: "table" },
  { id: "T17", label: "T17", area: "Gastraum", seats: 4, x: 20, y: 32.5, w: 6.4, h: 5.4, shape: "table" },
  { id: "T18", label: "T18", area: "Gastraum", seats: 4, x: 20, y: 40, w: 6.4, h: 5.4, shape: "table" },
  { id: "T19", label: "T19", area: "Gastraum", seats: 4, x: 20, y: 47.5, w: 6.4, h: 5.4, shape: "table" },
  { id: "T28", label: "T28", area: "Gastraum", seats: 4, x: 30, y: 17.5, w: 6.4, h: 5.4, shape: "table" },
  { id: "T27", label: "T27", area: "Gastraum", seats: 4, x: 30, y: 25, w: 6.4, h: 5.4, shape: "table" },
  { id: "T26", label: "T26", area: "Gastraum", seats: 4, x: 30, y: 32.5, w: 6.4, h: 5.4, shape: "table" },
  { id: "T25", label: "T25", area: "Gastraum", seats: 4, x: 30, y: 40, w: 6.4, h: 5.4, shape: "table" },
  { id: "T24", label: "T24", area: "Gastraum", seats: 4, x: 30, y: 47.5, w: 6.4, h: 5.4, shape: "table" },
  { id: "T30", label: "T30", area: "DJ-Bereich", seats: 4, x: 41.5, y: 19.5, w: 6.6, h: 5.4, shape: "table" },
  { id: "T31", label: "T31", area: "DJ-Bereich", seats: 4, x: 41.5, y: 27.5, w: 6.6, h: 5.4, shape: "table" },
  { id: "T32", label: "T32", area: "DJ-Bereich", seats: 4, x: 41.5, y: 35.5, w: 6.6, h: 5.4, shape: "table" },
  { id: "T33", label: "T33", area: "DJ-Bereich", seats: 4, x: 41.5, y: 43.5, w: 6.6, h: 5.4, shape: "table" },
  { id: "T20", label: "T20", area: "Gastraum", seats: 4, x: 20.5, y: 56.5, w: 6.2, h: 5.6, shape: "table" },
  { id: "T21", label: "T21", area: "Gastraum", seats: 4, x: 20.5, y: 64.5, w: 6.2, h: 5.6, shape: "table" },
  { id: "T23", label: "T23", area: "Gastraum", seats: 4, x: 29.5, y: 56.5, w: 6.2, h: 5.6, shape: "table" },
  { id: "T22", label: "T22", area: "Gastraum", seats: 4, x: 29.5, y: 64.5, w: 6.2, h: 5.6, shape: "table" },
  { id: "T60", label: "T60", area: "Nebenraum groß", seats: 32, x: 57.5, y: 5.5, w: 24, h: 8.5, shape: "room" },
  { id: "T70", label: "T70", area: "Hütte außen", seats: 18, x: 86, y: 5.5, w: 10.5, h: 8.5, shape: "room" },
  { id: "T104", label: "T104", area: "Billard", seats: 4, x: 63.5, y: 29, w: 8.7, h: 6.1, shape: "table" },
  { id: "T101", label: "T101", area: "Billard", seats: 4, x: 77.5, y: 29, w: 8.7, h: 6.1, shape: "table" },
  { id: "T103", label: "T103", area: "Billard", seats: 4, x: 63.5, y: 43.5, w: 8.7, h: 6.1, shape: "table" },
  { id: "T102", label: "T102", area: "Billard", seats: 4, x: 77.5, y: 43.5, w: 8.7, h: 6.1, shape: "table" }
];
const TERMINAL_TABLE_LOOKUP = Object.fromEntries(TERMINAL_TABLE_LAYOUT.map((table) => [table.id, table]));
const TERMINAL_TABLE_ZONE_LOOKUP = Object.fromEntries(TERMINAL_TABLE_ZONES.map((zone) => [zone.id, zone]));
const TERMINAL_TABLE_ADJACENCY_TOLERANCE = 2.4;
const TERMINAL_TABLE_STAFF_COLOR_PRESETS = ["#e1172f", "#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#4f46e5", "#be123c", "#15803d"];
const TERMINAL_TABLE_STAFF_PRESETS = [
  { id: "lanes-1-7", label: "Bahn 1 bis 7", tableIds: Array.from({ length: 7 }, (_, index) => String(index + 1)) },
  { id: "lanes-8-14", label: "Bahn 8 bis 14", tableIds: Array.from({ length: 7 }, (_, index) => String(index + 8)) },
  { id: "gastraum-links", label: "Gastraum links", tableIds: ["T15", "T16", "T17", "T18", "T19", "T20", "T21"] },
  { id: "gastraum-rechts", label: "Gastraum rechts", tableIds: ["T28", "T27", "T26", "T25", "T24", "T23", "T22"] },
  { id: "dj-bereich", label: "DJ-Bereich", tableIds: ["T30", "T31", "T32", "T33"] },
  { id: "nz-klein", label: "Nebenraum klein · T50", tableIds: ["T50"] },
  { id: "nz-gross", label: "Nebenraum groß · T60", tableIds: ["T60"] },
  { id: "huette-aussen", label: "Hütte außen · T70", tableIds: ["T70"] },
  { id: "billard", label: "Billardtische", tableIds: ["T101", "T102", "T103", "T104"] }
];
const TERMINAL_TABLE_STAFF_PRESET_LOOKUP = Object.fromEntries(TERMINAL_TABLE_STAFF_PRESETS.map((preset) => [preset.id, preset]));
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
  offers: [],
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

function groupedCalendarWeeksForMonth(month) {
  const groups = [];
  const seen = new Set();
  for (const date of datesInMonth(month)) {
    const start = weekStart(date);
    const startKey = isoDate(start);
    if (seen.has(startKey)) continue;
    seen.add(startKey);
    const dates = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      dates.push(addDays(start, dayOffset));
    }
    groups.push({ key: startKey, dates });
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
  const baseSchedule = arguments.length > 1 ? arguments[1] : state.schedule;
  const schedule = { ...(baseSchedule || {}), days: publishedScheduleDays(baseSchedule || {}) };
  const scheduleDays = schedule?.days || {};
  const weeks = groupedCalendarWeeksForMonth(month).filter((week) => (
    week.dates.some((date) => scheduleDays[isoDate(date)])
  ));
  return weeks.map((week) => `
    <details class="week-section published-week print-week">
      <summary>
        <span>${weekLabel(week.dates)}</span>
        <span class="week-state">veröffentlicht</span>
      </summary>
      <div class="week-days">
        ${week.dates.map((date) => renderScheduleDay(date, { compact: true, collapsible: true, crossMonth: true, publishedOnly: true, schedule })).join("")}
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

function publishedScheduleDayAssignments(dateKey) {
  const schedule = scheduleForMonth(dateKey.slice(0, 7));
  if (!schedule?.days?.[dateKey]) return {};
  if (schedule.publishedWeeks && Object.keys(schedule.publishedWeeks).length) {
    return schedule.publishedWeeks[weekStartKey(dateKey)] ? schedule.days[dateKey] : {};
  }
  return schedule.published ? schedule.days[dateKey] : {};
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
  state.customerDirectory = normalizeCustomerDirectory(data.customerDirectory || state.customerDirectory || []);
  state.offers = normalizeOffersClient(data.offers || state.offers || []);
  if (!state.offerDraft || !state.offers.some((offer) => offer.id === state.offerDraft?.id)) {
    state.offerDraft = state.offers[0] ? cloneData(state.offers[0]) : createBlankOfferDraft();
    state.offerDraftId = state.offerDraft.id;
  }
  state.offerDraftDirty = false;
  state.dayReports = data.dayReports || {};
  state.assignmentTimes = normalizeAssignmentTimes(data.assignmentTimes || {});
  state.assignmentSchedules = data.assignmentSchedules || {};
  state.assignmentAvailability = normalizeAssignmentAvailability(data.assignmentAvailability || {});
  state.terminalTableConfig = normalizeTerminalTableConfig(data.tablePlanConfig || state.terminalTableConfig || {});
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
    offers: normalizeOffersClient(value?.offers || base.offers || []),
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

function normalizeAssignmentAvailability(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = {};
  Object.entries(value).forEach(([dateKey, employees]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || "")) || !employees || typeof employees !== "object" || Array.isArray(employees)) return;
    const day = {};
    Object.entries(employees).forEach(([employee, item]) => {
      const cleanEmployee = String(employee || "").trim();
      if (!cleanEmployee) return;
      day[cleanEmployee] = {
        status: String(item?.status || "").trim(),
        from: String(item?.from || "").trim(),
        to: String(item?.to || "").trim(),
        note: String(item?.note || "").trim()
      };
    });
    result[dateKey] = day;
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
    paymentMethod: String(item.paymentMethod || "").trim().slice(0, 40),
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

const OFFER_BUFFET_TEMPLATES = {
  tradition: {
    name: "Tradition",
    pricePerPerson: 39.9,
    categories: {
      vorspeise: [
        { name: "Obazda-Creme im Weckglas mit Laugen-Crunch" },
        { name: "Frischer Endiviensalat mit Birnenspalten, Walnüssen und Balsamico-Walnuss-Dressing" }
      ],
      hauptgericht: [
        { name: "Langsam geschmorter Schweinebraten von Wammerl und Hals in kräftiger Dunkelbiersauce" },
        { name: "Rahmschwammerl aus frischen Waldpilzen in feiner Kräuterrahmsoße mit hausgemachtem Semmelknödel" },
        { name: "Sous-vide gegarte Schweinefiletmedaillons in kräftiger Portwein-Schalottenjus mit Butter-Kartoffelstampf" }
      ],
      dessert: [
        { name: "Frisch gebackener Kaiserschmarrn mit Apfelmus" },
        { name: "Mousse Duo von dunkler und weißer Schokolade mit frischen Beeren" }
      ]
    }
  },
  elegant: {
    name: "Elegant",
    pricePerPerson: 36.9,
    categories: {
      vorspeise: [
        { name: "Feine Antipasti-Auswahl" },
        { name: "Räucherlachs mit Zitronencreme" },
        { name: "Blattsalat mit Balsamico-Dressing" }
      ],
      hauptgericht: [
        { name: "Kalbsrahmgeschnetzeltes mit feinen Champignons" },
        { name: "Hähnchenbrust mit Kräutersauce" },
        { name: "Gebratener Lachs auf Gemüsebett" },
        { name: "Gemüsegratin mit Kräuterkruste" }
      ],
      dessert: [
        { name: "Panna Cotta mit Beerenragout" }
      ]
    }
  },
  festlich: {
    name: "Festlich",
    pricePerPerson: 44.9,
    categories: {
      vorspeise: [
        { name: "Carpaccio vom Rind mit Parmesan" },
        { name: "Antipasti und Brotvariation" }
      ],
      hauptgericht: [
        { name: "Rinderbraten mit Portweinsauce" },
        { name: "Putenbraten mit feiner Rahmsauce" },
        { name: "Lachsfilet mit Kräuterkruste" },
        { name: "Mediterrane Gemüsevariation" }
      ],
      dessert: [
        { name: "Schokoladenmousse mit frischer Frucht" }
      ]
    }
  },
  modern: {
    name: "Modern",
    pricePerPerson: 37.9,
    categories: {
      vorspeise: [
        { name: "Bunte Salatbar" },
        { name: "Fingerfood mit Dips" }
      ],
      hauptgericht: [
        { name: "Zürcher Geschnetzeltes von der Pute in feiner Conjac-Rahmsoße mit frischen Champignons" },
        { name: "Spinatknödel in brauner Butter geschwenkt mit gehobeltem Parmesan" },
        { name: "Tagliatelle mit zartem Lachs in feinem Zitronen-Dill-Öl, veredelt mit frischen Kräutern" }
      ],
      dessert: [
        { name: "Classic New York Cheesecake mit fruchtigem Himbeer-Coulis" }
      ]
    }
  }
};
const OFFER_CATEGORY_ORDER = ["vorspeise", "hauptgericht", "dessert"];
const OFFER_CATEGORY_LABELS = {
  vorspeise: "Vorspeise",
  hauptgericht: "Hauptgerichte",
  dessert: "Dessert"
};
const OFFER_DISH_ASSORTMENT = {
  vorspeise: [
    { group: "Vorspeise", name: "Italienische Vorspeisen Variation (Vitello Tonnato, Antipasti, Bruschetta)" },
    { group: "Vorspeise", name: "Knödel Carpaccio in Honig-Senf-Marinade mit Balsamico-Pilzen und Rucola" },
    { group: "Vorspeise", name: "Kürbis Bruschetta" },
    { group: "Vorspeise", name: "Tomaten Carpaccio mit Büffelmozzarella an Basilikumpesto" },
    { group: "Vorspeise", name: "Geräucherter Lachs an Senf-Dillsoße" },
    { group: "Vorspeise", name: "Dreierlei bayerische Aufstriche mit Laugengebäck" },
    { group: "Vorspeise", name: "Salatbar mit buntem Blattsalat der Saison, Tomaten, Karotten, Gurken, Paprika und Croûtons" },
    { group: "Suppe", name: "Kartoffel-Lauchcremesuppe mit Kräuterschmand" },
    { group: "Suppe", name: "Süßkartoffel-Curry-Suppe" },
    { group: "Suppe", name: "Getrüffelte Maronencremesuppe" },
    { group: "Suppe", name: "Kürbis-Ingwercremesuppe" },
    { group: "Suppe", name: "Rinderkraftbrühe mit Leberspätzle und Schnittlauch" },
    { group: "Suppe", name: "Kokos-Curry-Suppe mit Champignons und Garnelen" },
    { group: "Suppe", name: "Knoblauch-Kräutersuppe mit Frischkäse" },
    { group: "Suppe", name: "Gazpacho - kalte spanische Gemüsesuppe" },
    { group: "Suppe", name: "Waldpilzcremesuppe mit Croutons" }
  ],
  hauptgericht: [
    { group: "Fleisch", name: "Souvide gegartes Schweinefiletmedaillons in kräftiger Portwein-Schalottenjus mit cremigem Butter-Kartoffelstampf und glaciertem Wurzelgemüse" },
    { group: "Fleisch", name: "Langsam geschmorter Schweinebraten von Wammerl und Hals in kräftiger Dunkelbiersoße mit bayerischem Sauerkraut, Kartoffelknödel und hausgemachtem Kartoffelsalat" },
    { group: "Fleisch", name: "Klassisches Wildgulasch vom heimischen Hirsch in aromatischer Wacholder-Rotweinsoße mit hausgemachten Brezenknödeln und Blaukraut" },
    { group: "Fleisch", name: "Knusprig zarte Hähnchenbrust an Knoblauch-Parmesan-Soße dazu Rosmarin-Ofenkartoffeln" },
    { group: "Fleisch", name: "Sauerbraten mit hausgemachten Eierspätzle, Blaukraut und Preiselbeeren" },
    { group: "Fleisch", name: "Schnitzel Wiener Art mit hausgemachtem Kartoffel-Gurkensalat und Preiselbeeren (Schwein oder Pute)" },
    { group: "Fleisch", name: "Knusprige Entenbrust auf Orangensoße mit Kartoffelknödel und Apfelblaukraut" },
    { group: "Fleisch", name: "Piccatta Milanese von der Hähnchenbrust in Parmesan-Ei-Hülle mit Tomaten-Sahne-Nudeln" },
    { group: "Fleisch", name: "Gelbes Kokos-Curry von der Putenbrust mit Wokgemüse und Jasminreis" },
    { group: "Fleisch", name: "Saltimbocca von der Hähnchenbrust auf Tomatenrisotto" },
    { group: "Fleisch", name: "Hausgemachte Lasagne Bolognese" },
    { group: "Fleisch", name: "Pfannengyros mit Djuvecreis, Krautsalat und Tzatziki" },
    { group: "Fisch", name: "Lachsfilet mit Zitronen-Kräuterkruste auf jungem Blattspinat dazu Rosmarin-Ofenkartoffeln" },
    { group: "Fisch", name: "Linguine in hausgemachtem Basilikumpesto mit geschmolzenen Kirschtomaten und gebratenen Riesengarnelen" },
    { group: "Fisch", name: "Souvide gegartes Lachsfilet mit Kräuter-Gnocchi und wildem Brokkoli" },
    { group: "Fisch", name: "Gebratenes Zanderfilet mit Zitronen-Thymianreis und Rieslingsoße" },
    { group: "Fisch", name: "Spaghetti in Limetten-Dillcreme, Kirschtomaten, Frühlingslauch und Räucherlachs" },
    { group: "Fisch", name: "Fisch-Curry von Lachs und Garnelen mit Wokgemüse und Duftreis" },
    { group: "Vegetarisch", name: "Ofengeröstetes Blumenkohlsteak mit feinem Kräuteröl und Joghurt-Knoblauch-Dip" },
    { group: "Vegetarisch", name: "Rahmschwammerl aus frischen Waldpilzen in feiner Kräuterrahmsoße mit hausgemachtem Semmelknödel" },
    { group: "Vegetarisch", name: "Pasta mit gebratenen Kräuterseitlingen in feinem Olivenöl, frischer Petersilie und gehobeltem Parmesan" },
    { group: "Vegetarisch", name: "Cannelloni mit Spinat-Ricotta-Füllung auf Kirschtomaten-Sugo" },
    { group: "Vegetarisch", name: "Spinatknödel mit brauner Butter, geschmolzenen Kirschtomaten und Parmesan" },
    { group: "Vegetarisch", name: "Linguine mit Champignons und Zucchini in Parmesan-Sahnesoße, verfeinert mit Trüffelöl" },
    { group: "Vegetarisch", name: "Gnocchi in fruchtiger Tomatensoße mit Kirschtomaten, Spinat und Babymozzarella" },
    { group: "Vegetarisch", name: "Caesar Salat mit gebratenen Gnocchi, Spinat und geschmolzenen Kirschtomaten" }
  ],
  dessert: [
    { group: "Dessert", name: "Frisch gebackener Kaiserschmarrn mit Apfelmus" },
    { group: "Dessert", name: "Mousse Duo von dunkler und weißer Schokolade, im Glas serviert, mit frischen Beeren" },
    { group: "Dessert", name: "Classic New York Cheesecake mit fruchtigem Himbeer-Coulis" },
    { group: "Dessert", name: "Panna Cotta mit Beerenragout" },
    { group: "Dessert", name: "Schokoladenmousse mit frischer Frucht" },
    { group: "Dessert", name: "Lebkuchenmousse mit fruchtigem Kirschragout" },
    { group: "Dessert", name: "Mousse au Chocolat" },
    { group: "Dessert", name: "Obstsalat" }
  ]
};
const OFFER_BOWLING_PRICE_URL = "https://www.la-bowling.de/%C3%B6ffnungszeiten";
const OFFER_BOWLING_SHOE_PRICE = 2.5;
const OFFER_SPARKLING_RECEPTION_PRICE = 2.5;
const OFFER_CAMPFIRE_PRICE = 50;
const OFFER_HUT_RENT_PRICE = 250;
const OFFER_LARGE_ROOM_ONLY_PRICE = 100;
const OFFER_CHILD_DISCOUNT_FACTOR = 0.5;
const OFFER_BOWLING_WEEKDAY_LABELS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const OFFER_RESERVED_AREA_OPTIONS = [
  { value: "", label: "Keine feste Bereichsauswahl" },
  { value: "kleines-nebenzimmer", label: "Unser kleines Nebenzimmer" },
  { value: "grosses-nebenzimmer", label: "Unser großes Nebenzimmer" },
  { value: "huette", label: "LA-Bowling Hütte" },
  { value: "komplettes-center", label: "Komplettes Center (geschlossene Gesellschaft)" }
];
const OFFER_RESERVED_AREA_LABELS = Object.fromEntries(OFFER_RESERVED_AREA_OPTIONS.map((item) => [item.value, item.label]));
const OFFER_TOURNAMENT_PACKAGES = {
  standard: {
    label: "Turnier Paket",
    description: "Pokale für Platz 1 bis 3, Turnierbegleitung und Ergebnisauswertung",
    price: 200
  },
  extended: {
    label: "Turnier Paket erweitert",
    description: "5 Pokale inklusive bester Einzelspieler männlich / weiblich",
    price: 250
  }
};
const OFFER_TEXT_BLOCK_DEFAULTS = {
  pricingNotice: {
    label: "Hinweis zur Preisangabe",
    enabled: true,
    text: "Der Buffetpreis kann einzeln pro Person abgerechnet werden. Jedoch gilt zu beachten, dass die 36 Stunden vor Veranstaltungsbeginn gemeldete Personenzahl als Berechnungsgrundlage dient und der Veranstalter für eventuelle Ausfälle aufkommen muss."
  },
  cancellationTerms: {
    label: "Stornierung & Rechnungsgrundlage",
    enabled: true,
    text: "Eine kostenfreie Stornierung der Veranstaltung ist bis 4 Wochen vor dem Veranstaltungstermin möglich. Bei einer späteren Stornierung berechnen wir 50 % der vereinbarten Auftragssumme.\n\nDie bis spätestens 36 Stunden vor Veranstaltungsbeginn gemeldete Personenzahl gilt als verbindliche Rechnungsgrundlage."
  },
  reservationConfirmation: {
    label: "Reservierungsbestätigung",
    enabled: true,
    text: "Dieses Angebot ist ab dem Ausstellungsdatum 14 Tage gültig.\n\nBitte senden Sie mir das Angebot unterschrieben als Reservierungsbestätigung zurück."
  },
  vatNotice: {
    label: "MwSt.-Hinweis",
    enabled: true,
    text: "Alle Preise verstehen sich inklusive gesetzlicher Mehrwertsteuer."
  }
};

function normalizeOffersClient(offers = []) {
  return (Array.isArray(offers) ? offers : [])
    .map((offer) => normalizeOfferClient(offer))
    .filter((offer) => offer.customerName || offer.title || offer.eventDate || offer.createdAt)
    .sort((a, b) => {
      const aTime = Date.parse(a.updatedAt || a.createdAt || "") || 0;
      const bTime = Date.parse(b.updatedAt || b.createdAt || "") || 0;
      if (a.archived !== b.archived) return a.archived ? 1 : -1;
      return bTime - aTime;
    });
}

function normalizeOfferClient(offer = {}) {
  const buffet = offer.buffet && typeof offer.buffet === "object" ? offer.buffet : {};
  return {
    id: String(offer.id || `offer-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    archived: offer.archived === true,
    createdAt: String(offer.createdAt || new Date().toISOString()),
    updatedAt: String(offer.updatedAt || offer.createdAt || new Date().toISOString()),
    title: String(offer.title || offer.customerName || "Angebot").trim().slice(0, 120),
    offerDate: cleanOfferDateValue(offer.offerDate),
    eventDate: cleanOfferDateValue(offer.eventDate),
    customerName: String(offer.customerName || "").trim().slice(0, 160),
    customerContact: String(offer.customerContact || "").trim().slice(0, 160),
    customerEmail: String(offer.customerEmail || "").trim().slice(0, 180),
    customerPhone: String(offer.customerPhone || "").trim().slice(0, 80),
    customerAddress: String(offer.customerAddress || "").trim().slice(0, 600),
    occasion: String(offer.occasion || "").trim().slice(0, 160),
    personsAdults: cleanOfferIntegerValue(offer.personsAdults),
    personsChildren: cleanOfferIntegerValue(offer.personsChildren),
    startTime: cleanOfferTimeValue(offer.startTime),
    mealTime: cleanOfferTimeValue(offer.mealTime),
    sparklingReceptionTime: cleanOfferTimeValue(offer.sparklingReceptionTime),
    reservedArea: String(offer.reservedArea || "").trim().slice(0, 200),
    reservedAreaPrice: cleanOfferMoneyValue(offer.reservedAreaPrice),
    reservedAreaCampfire: offer.reservedAreaCampfire === true,
    customerDirectoryId: String(offer.customerDirectoryId || "").trim().slice(0, 120),
    additionalInfo: String(offer.additionalInfo || "").trim().slice(0, 2000),
    internalNote: String(offer.internalNote || "").trim().slice(0, 2000),
    textBlocks: normalizeOfferTextBlocksClient(offer.textBlocks),
    bowling: normalizeOfferBowlingClient(offer.bowling),
    buffet: {
      templateKey: String(buffet.templateKey || "").trim().slice(0, 40),
      name: String(buffet.name || "").trim().slice(0, 160),
      pricePerPerson: cleanOfferMoneyValue(buffet.pricePerPerson),
      sparklingReception: buffet.sparklingReception === true,
      categories: normalizeOfferBuffetCategoriesClient(buffet.categories)
    },
    timeline: normalizeOfferTimelineClient(offer.timeline),
    costs: normalizeOfferCostsClient(offer.costs)
  };
}

function normalizeOfferTimelineClient(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      id: String(item?.id || `timeline-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      time: cleanOfferTimeValue(item?.time),
      title: String(item?.title || item?.label || "").trim().slice(0, 160),
      note: String(item?.note || "").trim().slice(0, 600)
    }))
    .filter((item) => item.time || item.title || item.note);
}

function normalizeOfferCostsClient(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      id: String(item?.id || `cost-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      label: String(item?.label || "").trim().slice(0, 160),
      quantity: cleanOfferMoneyValue(item?.quantity),
      unitPrice: cleanOfferMoneyValue(item?.unitPrice),
      note: String(item?.note || "").trim().slice(0, 400)
    }))
    .filter((item) => item.label || item.quantity || item.unitPrice || item.note);
}

function normalizeOfferBuffetCategoriesClient(categories = {}) {
  const source = categories && typeof categories === "object" ? categories : {};
  return {
    vorspeise: normalizeOfferBuffetItemsClient([
      ...(Array.isArray(source.vorspeise) ? source.vorspeise : []),
      ...(Array.isArray(source.vorspeisen) ? source.vorspeisen : []),
      ...(Array.isArray(source.suppen) ? source.suppen : [])
    ]),
    hauptgericht: normalizeOfferBuffetItemsClient([
      ...(Array.isArray(source.hauptgericht) ? source.hauptgericht : []),
      ...(Array.isArray(source.fleisch) ? source.fleisch : []),
      ...(Array.isArray(source.fisch) ? source.fisch : []),
      ...(Array.isArray(source.vegetarisch) ? source.vegetarisch : [])
    ]),
    dessert: normalizeOfferBuffetItemsClient([
      ...(Array.isArray(source.dessert) ? source.dessert : [])
    ])
  };
}

function normalizeOfferBuffetItemsClient(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      id: String(item?.id || `dish-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      name: String(item?.name || item?.title || "").trim().slice(0, 180),
      note: String(item?.note || "").trim().slice(0, 240)
    }))
    .filter((item) => item.name || item.note);
}

function normalizeOfferBowlingClient(bowling = {}) {
  return {
    tournamentPackage: String(bowling?.tournamentPackage || "").trim().slice(0, 40),
    lanes: cleanOfferIntegerValue(bowling?.lanes),
    shoePersons: cleanOfferIntegerValue(bowling?.shoePersons),
    fromTime: cleanOfferTimeValue(bowling?.fromTime),
    toTime: cleanOfferTimeValue(bowling?.toTime)
  };
}

function normalizeOfferTextBlocksClient(blocks = {}) {
  return Object.fromEntries(Object.entries(OFFER_TEXT_BLOCK_DEFAULTS).map(([key, config]) => {
    const source = blocks && typeof blocks === "object" ? blocks[key] || {} : {};
    return [key, {
      label: config.label,
      enabled: source.enabled == null ? config.enabled : source.enabled === true,
      text: String(source.text ?? config.text).trim().slice(0, 4000)
    }];
  }));
}

function cleanOfferDateValue(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function cleanOfferIntegerValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(9999, Math.floor(parsed))) : 0;
}

function cleanOfferMoneyValue(value) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, Math.min(999999, Math.round(parsed * 100) / 100)) : 0;
}

function cleanOfferTimeValue(value) {
  const text = String(value || "").trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : "";
}

function createBlankOfferDraft() {
  return normalizeOfferClient({
    title: "Neues Angebot",
    offerDate: todayKey(),
    eventDate: "",
    customerName: "",
    customerContact: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    occasion: "",
    personsAdults: 0,
    personsChildren: 0,
    startTime: "",
    mealTime: "",
    sparklingReceptionTime: "",
    reservedArea: "",
    reservedAreaPrice: 0,
    reservedAreaCampfire: false,
    customerDirectoryId: "",
    additionalInfo: "",
    internalNote: "",
    bowling: {
      tournamentPackage: "",
      lanes: 0,
      shoePersons: 0,
      fromTime: "",
      toTime: ""
    },
    buffet: {
      templateKey: "",
      name: "",
      pricePerPerson: 0,
      sparklingReception: false,
      categories: normalizeOfferBuffetCategoriesClient({})
    },
    timeline: [],
    costs: []
  });
}

function ensureOfferDraft() {
  if (!state.offerDraft || !state.offerDraft.id) {
    state.offerDraft = createBlankOfferDraft();
    state.offerDraftId = state.offerDraft.id;
  }
  return state.offerDraft;
}

function setOfferDraftFromOffer(offer) {
  state.offerDraft = cloneData(normalizeOfferClient(offer));
  state.offerDraftId = state.offerDraft.id;
  state.offerDraftDirty = false;
}

function currentOfferDraftFromDom() {
  const root = $("#adminOffers");
  if (!root) return normalizeOfferClient(state.offerDraft || createBlankOfferDraft());
  const base = cloneData(state.offerDraft || createBlankOfferDraft());
  const field = (name) => root.querySelector(`[data-offer-field="${cssEscape(name)}"]`);
  const simpleText = (name) => String(field(name)?.value || "").trim();
  const draft = {
    ...base,
    title: simpleText("title") || base.title,
    offerDate: cleanOfferDateValue(field("offerDate")?.value || base.offerDate),
    eventDate: cleanOfferDateValue(field("eventDate")?.value || base.eventDate),
    customerName: simpleText("customerName"),
    customerContact: simpleText("customerContact"),
    customerEmail: simpleText("customerEmail"),
    customerPhone: simpleText("customerPhone"),
    customerAddress: String(field("customerAddress")?.value || "").trim(),
    occasion: simpleText("occasion"),
    personsAdults: cleanOfferIntegerValue(field("personsAdults")?.value),
    personsChildren: cleanOfferIntegerValue(field("personsChildren")?.value),
    startTime: cleanOfferTimeValue(field("startTime")?.value),
    mealTime: cleanOfferTimeValue(field("mealTime")?.value),
    sparklingReceptionTime: cleanOfferTimeValue(field("sparklingReceptionTime")?.value),
    reservedArea: simpleText("reservedArea"),
    reservedAreaPrice: cleanOfferMoneyValue(field("reservedAreaPrice")?.value),
    reservedAreaCampfire: field("reservedAreaCampfire")?.checked === true,
    customerDirectoryId: simpleText("customerDirectoryId"),
    additionalInfo: String(field("additionalInfo")?.value || "").trim(),
    internalNote: String(field("internalNote")?.value || "").trim(),
    textBlocks: {},
    bowling: {
      tournamentPackage: String(field("bowlingTournamentPackage")?.value || "").trim(),
      lanes: cleanOfferIntegerValue(field("bowlingLanes")?.value),
      shoePersons: cleanOfferIntegerValue(field("bowlingShoePersons")?.value),
      fromTime: cleanOfferTimeValue(field("bowlingFromTime")?.value),
      toTime: cleanOfferTimeValue(field("bowlingToTime")?.value)
    },
    buffet: {
      ...base.buffet,
      templateKey: String(field("buffetTemplateKey")?.value || "").trim(),
      name: String(field("buffetName")?.value || "").trim(),
      pricePerPerson: cleanOfferMoneyValue(field("buffetPricePerPerson")?.value),
      sparklingReception: field("buffetSparklingReception")?.checked === true,
      categories: {}
    },
    timeline: [],
    costs: []
  };
  OFFER_CATEGORY_ORDER.forEach((category) => {
    draft.buffet.categories[category] = [...root.querySelectorAll(`[data-offer-dish-row="${category}"]`)].map((row) => ({
      id: row.dataset.offerDishId || cryptoId(),
      name: String(row.querySelector("[data-offer-dish-name]")?.value || "").trim(),
      note: String(row.querySelector("[data-offer-dish-note]")?.value || "").trim()
    })).filter((item) => item.name || item.note);
  });
  draft.timeline = [...root.querySelectorAll("[data-offer-timeline-row]")].map((row) => ({
    id: row.dataset.offerTimelineId || cryptoId(),
    time: cleanOfferTimeValue(row.querySelector("[data-offer-timeline-time]")?.value),
    title: String(row.querySelector("[data-offer-timeline-title]")?.value || "").trim(),
    note: String(row.querySelector("[data-offer-timeline-note]")?.value || "").trim()
  })).filter((item) => item.time || item.title || item.note);
  draft.costs = [...root.querySelectorAll("[data-offer-cost-row]")].map((row) => ({
    id: row.dataset.offerCostId || cryptoId(),
    label: String(row.querySelector("[data-offer-cost-label]")?.value || "").trim(),
    quantity: cleanOfferMoneyValue(row.querySelector("[data-offer-cost-quantity]")?.value),
    unitPrice: cleanOfferMoneyValue(row.querySelector("[data-offer-cost-unit]")?.value),
    note: String(row.querySelector("[data-offer-cost-note]")?.value || "").trim()
  })).filter((item) => item.label || item.quantity || item.unitPrice || item.note);
  Object.keys(OFFER_TEXT_BLOCK_DEFAULTS).forEach((key) => {
    draft.textBlocks[key] = {
      label: OFFER_TEXT_BLOCK_DEFAULTS[key].label,
      enabled: field(`textBlockEnabled-${key}`)?.checked === true,
      text: String(field(`textBlockText-${key}`)?.value || "").trim()
    };
  });
  return normalizeOfferClient(draft);
}

function applyOfferTemplate(templateKey) {
  const template = OFFER_BUFFET_TEMPLATES[templateKey];
  if (!template) return;
  const draft = cloneData(ensureOfferDraft());
  draft.buffet = {
    templateKey,
    name: template.name,
    pricePerPerson: template.pricePerPerson,
    categories: normalizeOfferBuffetCategoriesClient(template.categories)
  };
  state.offerDraft = normalizeOfferClient(draft);
  state.offerDraftDirty = false;
  renderAdminOffers();
  showToast(`Buffet-Vorlage ${template.name} übernommen.`);
}

function offerPersonCount(offer) {
  return cleanOfferIntegerValue(offer?.personsAdults) + cleanOfferIntegerValue(offer?.personsChildren);
}

function offerChargedPersonUnits(offer, childFactor = OFFER_CHILD_DISCOUNT_FACTOR) {
  const adults = cleanOfferIntegerValue(offer?.personsAdults);
  const children = cleanOfferIntegerValue(offer?.personsChildren);
  return adults + (children * childFactor);
}

function offerHasBuffet(offer) {
  const draft = normalizeOfferClient(offer || {});
  if (cleanOfferMoneyValue(draft.buffet?.pricePerPerson) > 0) return true;
  if (draft.buffet?.name || draft.buffet?.templateKey) return true;
  return OFFER_CATEGORY_ORDER.some((category) => (draft.buffet?.categories?.[category] || []).length > 0);
}

function offerHasBowlingBooking(offer) {
  const bowling = normalizeOfferBowlingClient(offer?.bowling);
  return Boolean(
    bowling.tournamentPackage ||
    bowling.lanes ||
    bowling.shoePersons ||
    bowling.fromTime ||
    bowling.toTime
  );
}

function offerBuffetPricing(offer) {
  const draft = normalizeOfferClient(offer || {});
  const adults = cleanOfferIntegerValue(draft.personsAdults);
  const children = cleanOfferIntegerValue(draft.personsChildren);
  const pricePerPerson = cleanOfferMoneyValue(draft.buffet?.pricePerPerson);
  const chargedUnits = offerChargedPersonUnits(draft);
  const buffetBaseTotal = Math.round(chargedUnits * pricePerPerson * 100) / 100;
  const sparklingReceptionTotal = draft.buffet?.sparklingReception
    ? Math.round(chargedUnits * OFFER_SPARKLING_RECEPTION_PRICE * 100) / 100
    : 0;
  return {
    adults,
    children,
    chargedUnits,
    pricePerPerson,
    sparklingReception: draft.buffet?.sparklingReception === true,
    buffetBaseTotal,
    sparklingReceptionTotal,
    total: Math.round((buffetBaseTotal + sparklingReceptionTotal) * 100) / 100,
    hasBuffet: offerHasBuffet(draft)
  };
}

function offerTimeMinutesValue(value) {
  const text = cleanOfferTimeValue(value);
  if (!text) return null;
  const [hours, minutes] = text.split(":").map(Number);
  return hours * 60 + minutes;
}

function offerDurationLabel(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return "-";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} Min`;
  if (!rest) return `${hours} Std`;
  return `${hours} Std ${rest} Min`;
}

function offerBowlingPricingPlan(dateKey) {
  if (!dateKey) {
    return {
      dayLabel: "",
      openingHours: "",
      warning: "Bitte Veranstaltungsdatum wählen, damit der Bowlingpreis berechnet werden kann.",
      segments: []
    };
  }
  const date = new Date(`${dateKey}T12:00:00`);
  const day = date.getDay();
  const info = holidayInfo(dateKey);
  const openingHours = openingHoursFor(dateKey);
  if (info.className === "holiday") {
    return {
      dayLabel: info.label || "Feiertag",
      openingHours,
      warning: "Feiertag: Laut Website bitte Tarif anfragen, daher keine automatische Preisberechnung.",
      segments: []
    };
  }
  if (day === 2) {
    return {
      dayLabel: "Dienstag",
      openingHours: "geschlossen",
      warning: "Dienstag ist laut Website Ruhetag.",
      segments: []
    };
  }
  if (info.className === "preholiday" || day === 6) {
    return {
      dayLabel: info.className === "preholiday" ? "Vorfeiertag" : "Samstag",
      openingHours,
      segments: [
        { start: 14 * 60, end: 19 * 60, rate: 30, label: "14:00 bis 19:00" },
        { start: 19 * 60, end: 26 * 60, rate: 37, label: "19:00 bis 02:00" }
      ],
      warning: ""
    };
  }
  if (day === 5) {
    return {
      dayLabel: "Freitag",
      openingHours,
      segments: [
        { start: 15 * 60, end: 19 * 60, rate: 30, label: "15:00 bis 19:00" },
        { start: 19 * 60, end: 26 * 60, rate: 35, label: "19:00 bis 02:00" }
      ],
      warning: ""
    };
  }
  if (day === 0) {
    return {
      dayLabel: "Sonntag",
      openingHours,
      segments: [
        { start: 14 * 60, end: 23 * 60, rate: 29, label: "14:00 bis 23:00" }
      ],
      warning: ""
    };
  }
  return {
    dayLabel: OFFER_BOWLING_WEEKDAY_LABELS[day] || "Wochentag",
    openingHours,
    segments: [
      { start: 16 * 60, end: 24 * 60, rate: 27, label: "16:00 bis 00:00" }
    ],
    warning: ""
  };
}

function offerBowlingPricing(dateKey, bowling = {}) {
  const normalized = normalizeOfferBowlingClient(bowling);
  const tournamentPackage = OFFER_TOURNAMENT_PACKAGES[normalized.tournamentPackage] || null;
  const plan = offerBowlingPricingPlan(dateKey);
  const fromMinutes = offerTimeMinutesValue(normalized.fromTime);
  const toMinutesRaw = offerTimeMinutesValue(normalized.toTime);
  const hasPartialTime = (fromMinutes == null) !== (toMinutesRaw == null);
  let durationMinutes = 0;
  let coveredMinutes = 0;
  let laneCostPerLane = 0;
  if (fromMinutes != null && toMinutesRaw != null) {
    let toMinutes = toMinutesRaw;
    if (toMinutes <= fromMinutes) toMinutes += 24 * 60;
    durationMinutes = toMinutes - fromMinutes;
    for (const segment of plan.segments) {
      const overlapStart = Math.max(fromMinutes, segment.start);
      const overlapEnd = Math.min(toMinutes, segment.end);
      const overlap = Math.max(0, overlapEnd - overlapStart);
      if (!overlap) continue;
      coveredMinutes += overlap;
      laneCostPerLane += (overlap / 60) * segment.rate;
    }
  }
  const laneCost = Math.round(laneCostPerLane * normalized.lanes * 100) / 100;
  const shoeCost = Math.round(normalized.shoePersons * OFFER_BOWLING_SHOE_PRICE * 100) / 100;
  const tournamentCost = cleanOfferMoneyValue(tournamentPackage?.price || 0);
  const gameTotal = Math.round((laneCost + shoeCost) * 100) / 100;
  const total = Math.round((gameTotal + tournamentCost) * 100) / 100;
  const rateLabel = plan.segments.length
    ? plan.segments.map((segment) => `${segment.label}: ${formatMoney(segment.rate)}/Std pro Bahn`).join(" · ")
    : "Tarif auf Anfrage";
  let warning = plan.warning || "";
  if (hasPartialTime) {
    warning = [warning, "Bitte Bowling von und bis vollständig eintragen."].filter(Boolean).join(" ");
  } else if (durationMinutes > 0 && coveredMinutes < durationMinutes && plan.segments.length) {
    warning = [warning, "Die eingetragene Spielzeit liegt teilweise außerhalb der regulären Öffnungszeit."].filter(Boolean).join(" ");
  }
  return {
    ...normalized,
    dayLabel: plan.dayLabel,
    openingHours: plan.openingHours,
    rateLabel,
    warning,
    durationMinutes,
    durationLabel: offerDurationLabel(durationMinutes),
    tournamentPackageLabel: tournamentPackage?.label || "",
    tournamentPackageDescription: tournamentPackage?.description || "",
    tournamentCost,
    laneCost,
    shoeCost,
    gameTotal,
    total
  };
}

function offerReservedAreaPricing(offer) {
  const draft = normalizeOfferClient(offer || {});
  const reservedArea = String(draft.reservedArea || "").trim();
  const buffetPricing = offerBuffetPricing(draft);
  const hasBowling = offerHasBowlingBooking(draft);
  let roomFee = 0;
  let roomFeeLabel = "";
  let warning = "";
  if (reservedArea === "huette") {
    roomFee = OFFER_HUT_RENT_PRICE;
    roomFeeLabel = "Raummiete LA-Bowling Hütte";
  } else if (reservedArea === "komplettes-center") {
    roomFee = cleanOfferMoneyValue(draft.reservedAreaPrice);
    roomFeeLabel = "Komplettes Center (geschlossene Gesellschaft)";
    if (roomFee <= 0) warning = "Bitte einen Preis für das komplette Center eintragen.";
  } else if (reservedArea === "grosses-nebenzimmer" && !buffetPricing.hasBuffet && !hasBowling) {
    roomFee = OFFER_LARGE_ROOM_ONLY_PRICE;
    roomFeeLabel = "Raummiete großes Nebenzimmer";
  }
  const campfireFee = draft.reservedAreaCampfire ? OFFER_CAMPFIRE_PRICE : 0;
  return {
    reservedArea,
    reservedAreaLabel: OFFER_RESERVED_AREA_LABELS[reservedArea] || reservedArea || "",
    campfireSelected: draft.reservedAreaCampfire === true,
    roomFee,
    roomFeeLabel,
    campfireFee,
    warning,
    total: Math.round((roomFee + campfireFee) * 100) / 100
  };
}

function offerTotals(offer) {
  const draft = normalizeOfferClient(offer || {});
  const personCount = offerPersonCount(draft);
  const buffetPricing = offerBuffetPricing(draft);
  const bowlingPricing = offerBowlingPricing(draft.eventDate, draft.bowling);
  const reservedAreaPricing = offerReservedAreaPricing(draft);
  const extraRows = (draft.costs || []).reduce((sum, row) => sum + (cleanOfferMoneyValue(row.quantity) * cleanOfferMoneyValue(row.unitPrice)), 0);
  const total = buffetPricing.total + bowlingPricing.total + reservedAreaPricing.total + extraRows;
  return {
    adults: buffetPricing.adults,
    children: buffetPricing.children,
    personCount,
    chargedUnits: buffetPricing.chargedUnits,
    buffetBaseTotal: buffetPricing.buffetBaseTotal,
    sparklingReceptionTotal: buffetPricing.sparklingReceptionTotal,
    buffetTotal: buffetPricing.total,
    bowlingGameTotal: bowlingPricing.gameTotal,
    tournamentTotal: bowlingPricing.tournamentCost,
    bowlingTotal: bowlingPricing.total,
    reservedAreaTotal: reservedAreaPricing.total,
    roomFee: reservedAreaPricing.roomFee,
    roomFeeLabel: reservedAreaPricing.roomFeeLabel,
    campfireFee: reservedAreaPricing.campfireFee,
    extraRows,
    total
  };
}

function formatOfferUnits(value) {
  const numeric = Math.round(Number(value || 0) * 100) / 100;
  return Number.isInteger(numeric) ? String(numeric) : String(numeric).replace(".", ",");
}

function offerTimelineEvents(offer) {
  const draft = normalizeOfferClient(offer || {});
  const events = [];
  const push = (time, title, note = "", sortOrder = 50) => {
    const clean = cleanOfferTimeValue(time);
    if (!clean) return;
    events.push({ id: cryptoId(), time: clean, title, note, sortOrder });
  };
  push(draft.startTime, "Eintreffen", "", 10);
  if (draft.buffet?.sparklingReception) {
    push(draft.sparklingReceptionTime, "Sektempfang", "Optional zum Buffet gebucht", 20);
  }
  push(draft.bowling?.fromTime, "Bowling Beginn", "", 30);
  push(draft.bowling?.toTime, "Bowling Ende", "", 35);
  push(draft.mealTime, "Essen / Buffet", draft.buffet?.name || "", 40);
  (draft.timeline || []).forEach((item, index) => {
    if (!item.time && !item.title && !item.note) return;
    events.push({
      id: item.id || cryptoId(),
      time: cleanOfferTimeValue(item.time),
      title: String(item.title || "").trim() || "Ereignis",
      note: String(item.note || "").trim(),
      sortOrder: 60 + index
    });
  });
  return events
    .filter((item) => item.time || item.title || item.note)
    .sort((a, b) => {
      const aMinutes = offerTimeMinutesValue(a.time);
      const bMinutes = offerTimeMinutesValue(b.time);
      if (aMinutes == null && bMinutes == null) return a.sortOrder - b.sortOrder;
      if (aMinutes == null) return 1;
      if (bMinutes == null) return -1;
      if (aMinutes !== bMinutes) return aMinutes - bMinutes;
      return a.sortOrder - b.sortOrder;
    });
}

function offerReservedAreaOptions(selectedValue = "") {
  const options = OFFER_RESERVED_AREA_OPTIONS.slice();
  if (selectedValue && !options.some((item) => item.value === selectedValue)) {
    options.push({ value: selectedValue, label: selectedValue });
  }
  return options.map((item) => `<option value="${escapeHtml(item.value)}" ${item.value === selectedValue ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
}

function offerTournamentPackageOptions(selectedValue = "") {
  const options = [{ value: "", label: "Kein Turnierpaket" }, ...Object.entries(OFFER_TOURNAMENT_PACKAGES).map(([value, item]) => ({ value, label: item.label }))];
  return options.map((item) => `<option value="${escapeHtml(item.value)}" ${item.value === selectedValue ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");
}

function offerCustomerDirectoryMatches(customer, query = "") {
  const lowered = String(query || "").trim().toLowerCase();
  if (!lowered) return true;
  return [
    customer.name,
    customer.contact,
    customer.email,
    customer.phone,
    customer.address
  ].some((value) => String(value || "").toLowerCase().includes(lowered));
}

function offerCustomerDirectoryOptions(customers = [], selectedId = "") {
  const options = customers.slice();
  if (selectedId && !options.some((customer) => customer.id === selectedId)) {
    const selected = normalizeCustomerDirectory(state.customerDirectory).find((customer) => customer.id === selectedId);
    if (selected) options.unshift(selected);
  }
  return options.length
    ? options.map((customer) => `<option value="${escapeHtml(customer.id)}" ${customer.id === selectedId ? "selected" : ""}>${escapeHtml(customer.name)}${customer.contact ? ` - ${escapeHtml(customer.contact)}` : ""}</option>`).join("")
    : `<option value="">Kein Kunde gefunden</option>`;
}

function offerTemplateOptions(selectedKey = "") {
  return Object.entries(OFFER_BUFFET_TEMPLATES).map(([key, template]) => `<option value="${escapeHtml(key)}" ${key === selectedKey ? "selected" : ""}>${escapeHtml(template.name)}</option>`).join("");
}

function offerDishAssortmentForCategory(category = "") {
  return Array.isArray(OFFER_DISH_ASSORTMENT[category]) ? OFFER_DISH_ASSORTMENT[category] : [];
}

function offerDishAssortmentOptions(category = "") {
  const items = offerDishAssortmentForCategory(category);
  if (!items.length) return `<option value="">Kein Sortiment hinterlegt</option>`;
  return `
    <option value="">Gericht aus Sortiment wählen</option>
    ${items.map((item, index) => `<option value="${index}">${escapeHtml(item.group ? `${item.group}: ${item.name}` : item.name)}</option>`).join("")}
  `;
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
  renderAdminReports();
  renderAdminEmployeeOverview();
  renderAdminPublishedList();
  renderAdminMonthlyNumbers();
  renderAdminSwaps();
  renderAdminAvailabilityRequests();
  renderMessageEmployeePicker();
  renderAdminOffers();
  renderAdminPushControls();
  renderAdminMessages();
  renderAdminTerminalMessages();
  renderAdminTasks();
  renderAdminCleaningTasks();
  renderAdminReminders();
  renderAdminAvailabilityPreview();
  renderAdminTablePlan();
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

function displayFirstName(name = "") {
  const text = String(name || "").trim();
  if (!text) return "Chef";
  if (text.includes(",")) {
    return text.split(",")[1]?.trim().split(/\s+/)[0] || text.split(",")[0].trim();
  }
  return text.split(/\s+/)[0] || text;
}

function motivationLineForName(name = "") {
  const lines = [
    "schön, dass du da bist - heute darf leicht, klar und gut werden.",
    "du bringst Ruhe, Richtung und gute Energie in den Tag.",
    "was du heute anpackst, darf gelingen und Freude machen.",
    "heute ist ein guter Tag, um mit Klarheit und Zuversicht voranzugehen."
  ];
  const text = String(name || "").trim();
  if (!text) return lines[0];
  let hash = 0;
  for (const char of text) hash = (hash + char.charCodeAt(0)) % lines.length;
  return lines[hash];
}

function chefStateText() {
  const firstName = displayFirstName(state.activeEmployee || "");
  return `Hallo ${firstName}: ${motivationLineForName(state.activeEmployee || firstName)}`;
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
  const stateText = $("#chefState");
  if (!container) return;
  if (!currentUserIsChef()) {
    if (stateText) stateText.textContent = "Diese Ansicht ist nur für die Geschäftsleitung sichtbar.";
    container.innerHTML = `<p class="hint">Diese Ansicht ist nur für die Geschäftsleitung sichtbar.</p>`;
    return;
  }
  if (stateText) stateText.textContent = chefStateText();
  container.innerHTML = chefDashboardHtml();
}

function chefDashboardHtml() {
  const today = todayKey();
  const openInvoiceCount = openInvoiceItems().length;
  const invoiceTabVisible = invoiceManagementVisible();
  const selectedChefReportDate = ensureChefReportDateSelection();
  const selectedChefExportMonth = ensureChefExportMonthSelection();
  const tabs = [
    ["reports", "Tagesberichte", chefSectionEnabled("reports")],
    ["invoices", "Rechnungen", invoiceTabVisible],
    ["schedule", "Dienstplan", chefSectionEnabled("schedule")],
    ["numbers", "Monatszahlen", true],
    ["exports", "Exporte", true],
    ["employees", "Mitarbeiterübersicht", chefSectionEnabled("employees")]
  ].filter(([, , visible]) => visible);
  if (!tabs.some(([key]) => key === state.chefTab)) state.chefTab = tabs[0]?.[0] || "";
  return `
    ${chefSectionEnabled("messages") ? renderDashboardMessages() : ""}
    ${chefSectionEnabled("today") ? `<details class="chef-current-day">
      <summary>Heutiger Tag</summary>
      ${renderScheduleDay(new Date(`${today}T12:00:00`), { today: true })}
    </details>` : ""}
    <nav class="chef-tabs" aria-label="Chef-Bereiche">
      ${tabs.map(([key, label]) => `<button class="chef-tab ${state.chefTab === key ? "active" : ""} ${key === "invoices" && openInvoiceCount ? "needs-attention" : ""}" type="button" data-chef-tab="${key}">${label}${key === "invoices" && openInvoiceCount ? ` <span>${openInvoiceCount}</span>` : ""}</button>`).join("")}
    </nav>
    ${chefSectionEnabled("reports") ? `<section class="chef-section ${state.chefTab === "reports" ? "active" : "hidden"}">
      <div class="chef-section-head">
        <h3>Tagesberichte</h3>
        <div class="chef-section-tools">
          <label>
            Datum
            <input id="chefReportDate" type="date" value="${escapeHtml(selectedChefReportDate || "")}">
          </label>
        </div>
      </div>
      ${chefSelectedDayReportHtml(selectedChefReportDate)}
    </section>` : ""}
    ${invoiceTabVisible ? `<section class="chef-section ${state.chefTab === "invoices" ? "active" : "hidden"}">
      ${openInvoicesHtml()}
    </section>` : ""}
    ${chefSectionEnabled("schedule") ? `<section class="chef-section ${state.chefTab === "schedule" ? "active" : "hidden"}">
      <div class="chef-current-plan">
        <h3>Veröffentlichte Dienstpläne</h3>
        ${chefPublishedSchedulesHtml()}
      </div>
    </section>` : ""}
    <section class="chef-section ${state.chefTab === "numbers" ? "active" : "hidden"}">
      ${monthlyNumbersHtml("chef")}
    </section>
    <section class="chef-section ${state.chefTab === "exports" ? "active" : "hidden"}">
      ${chefExportsHtml(selectedChefExportMonth)}
    </section>
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

function sortedChefReportEntries() {
  return Object.entries(state.dayReports || {})
    .filter(([dateKey, report]) => dateKey && report && typeof report === "object")
    .sort(([a], [b]) => b.localeCompare(a));
}

function reportMonthsSorted() {
  return [...new Set(sortedChefReportEntries().map(([dateKey]) => dateKey.slice(0, 7)))];
}

function defaultChefReportDate() {
  const reports = sortedChefReportEntries();
  const latestClosed = reports.find(([, report]) => report?.closed);
  return latestClosed?.[0] || reports[0]?.[0] || "";
}

function ensureChefReportDateSelection() {
  const reports = sortedChefReportEntries();
  const availableDates = new Set(reports.map(([dateKey]) => dateKey));
  if (!availableDates.size) {
    state.chefReportDate = "";
    return "";
  }
  if (!state.chefReportDate || !availableDates.has(state.chefReportDate)) {
    state.chefReportDate = defaultChefReportDate();
  }
  return state.chefReportDate;
}

function defaultChefExportMonth() {
  return reportMonthsSorted()[0] || currentMonthValue();
}

function ensureChefExportMonthSelection() {
  const months = reportMonthsSorted();
  if (!months.length) {
    state.chefExportMonth = currentMonthValue();
    return state.chefExportMonth;
  }
  if (!state.chefExportMonth || !months.includes(state.chefExportMonth)) {
    state.chefExportMonth = defaultChefExportMonth();
  }
  return state.chefExportMonth;
}

function chefSearchScopeOptions() {
  return [
    ["all", "Alle"],
    ["reports", "Tagesberichte"],
    ["invoices", "Rechnungen"],
    ["employees", "Mitarbeiter"],
    ["documents", "Dokumente"],
    ["schedule", "Dienstplan"]
  ];
}

function chefSearchIsActive() {
  return Boolean(
    String(state.chefReportSearch || "").trim()
    || state.chefSearchMonthOnly
    || state.chefSearchOpenInvoicesOnly
    || state.chefSearchMissingDocsOnly
  );
}

function chefSearchTopbarHtml(reportSearch = "") {
  return `
    <div class="chef-topbar">
      <div class="chef-search-controls">
        <div class="chef-search-chip-row">
          ${chefSearchScopeOptions().map(([key, label]) => `
            <button class="chef-search-chip ${state.chefSearchScope === key ? "active" : ""}" type="button" data-chef-search-scope="${key}">
              ${escapeHtml(label)}
            </button>
          `).join("")}
        </div>
        <div class="chef-search-chip-row">
          <button class="chef-search-chip ${state.chefSearchMonthOnly ? "active" : ""}" type="button" data-chef-search-toggle="month">
            Monat
          </button>
          <button class="chef-search-chip ${state.chefSearchOpenInvoicesOnly ? "active" : ""}" type="button" data-chef-search-toggle="open-invoices">
            Offene Rechnungen
          </button>
          <button class="chef-search-chip ${state.chefSearchMissingDocsOnly ? "active" : ""}" type="button" data-chef-search-toggle="missing-documents">
            Fehlende Dokumente
          </button>
          ${chefSearchIsActive() ? `<button class="chef-search-chip" type="button" data-clear-chef-search>Zurücksetzen</button>` : ""}
        </div>
      </div>
      <label class="chef-global-search">
        Suche
        <input id="chefReportSearch" type="search" value="${escapeHtml(reportSearch)}" placeholder="Kunde, Datum, Mitarbeiter, Dokument">
      </label>
    </div>
  `;
}

function chefSearchTokens(query = "") {
  return String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function chefMatchesSearch(values = [], query = "") {
  const tokens = chefSearchTokens(query);
  if (!tokens.length) return true;
  const blob = values.map((value) => String(value || "").trim().toLowerCase()).join(" ");
  return tokens.every((token) => blob.includes(token));
}

function chefSearchDateAllowed(dateKey = "") {
  if (!state.chefSearchMonthOnly) return true;
  return String(dateKey || "").startsWith(`${state.selectedMonth}-`);
}

function reportMissingDocumentLabels(report = {}) {
  const missing = [];
  if (!hasDocument(report.documents?.penta)) missing.push("Penta");
  if (!hasDocument(report.documents?.handwriting)) missing.push("Handschrift");
  if (!hasDocument(report.documents?.ecCut)) missing.push("EC-Schnitt");
  return missing;
}

function chefReportMatchesFilters(dateKey, report = {}) {
  if (!chefSearchDateAllowed(dateKey)) return false;
  if (state.chefSearchOpenInvoicesOnly && !(report.invoiceCustomers || []).some((item) => invoiceIsReady(item) && !item.invoiceDone && !invoiceIsPaid(item))) {
    return false;
  }
  if (state.chefSearchMissingDocsOnly && !reportMissingDocumentLabels(report).length) {
    return false;
  }
  return true;
}

function chefReportSearchEntries(query = "") {
  if (!chefSearchIsActive()) return [];
  const search = String(query || "").trim().toLowerCase();
  return sortedChefReportEntries().filter(([dateKey, report]) => (
    chefReportMatchesFilters(dateKey, report) && reportMatchesChefSearch(dateKey, report, search)
  ));
}

function reportMatchesChefSearch(dateKey, report = {}, query = "") {
  return chefMatchesSearch([
    dateKey,
    formatDate(dateKey),
    formatNumericDate(dateKey),
    report.shiftLeader || "",
    report.notes || "",
    ...(reportEmployeesForDate(dateKey, report) || []),
    ...((report.invoiceCustomers || []).flatMap((item) => [item.name || "", item.contact || "", item.email || "", item.note || ""])),
    ...((report.expenses || []).flatMap((item) => [item.name || "", item.category || "", item.note || ""]))
  ], query);
}

function chefInvoiceSearchEntries(query = "") {
  if (!chefSearchIsActive()) return [];
  const items = [];
  for (const [dateKey, report] of Object.entries(state.dayReports || {})) {
    if (!chefSearchDateAllowed(dateKey)) continue;
    (report.invoiceCustomers || []).forEach((invoice, index) => {
      const isOpen = invoiceIsReady(invoice) && !invoice.invoiceDone && !invoiceIsPaid(invoice);
      if (state.chefSearchOpenInvoicesOnly && !isOpen) return;
      if (state.chefSearchMissingDocsOnly && hasReceipt(invoice)) return;
      if (!chefMatchesSearch([
        dateKey,
        formatDate(dateKey),
        formatNumericDate(dateKey),
        invoice.name || "",
        invoice.contact || "",
        invoice.email || "",
        invoice.phone || "",
        invoice.address || "",
        invoice.note || "",
        invoice.paymentMethod || "",
        invoice.tip || "",
        invoice.gastroOtherNote || "",
        formatReportMoney(invoiceTotal(invoice))
      ], query)) return;
      items.push({ dateKey, invoice, index });
    });
  }
  return items.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function chefEmployeeSearchEntries(query = "") {
  if (!chefSearchIsActive()) return [];
  if (state.chefSearchOpenInvoicesOnly || state.chefSearchMissingDocsOnly) return [];
  return (state.settings.employees || []).filter((employee) => {
    const role = roleLabel(state.settings.employeeRoles?.[employee] || "Team");
    const departments = (state.settings.employeeDepartments?.[employee] || []).join(" ");
    return chefMatchesSearch([employee, role, departments], query);
  }).map((employee) => ({
    employee,
    role: roleLabel(state.settings.employeeRoles?.[employee] || "Team"),
    departments: state.settings.employeeDepartments?.[employee] || [],
    totals: totalsForEmployee(employee)
  }));
}

function chefDocumentSearchEntries(query = "") {
  if (!chefSearchIsActive()) return [];
  if (state.chefSearchOpenInvoicesOnly) return [];
  const items = [];
  for (const [dateKey, report] of Object.entries(state.dayReports || {})) {
    if (!chefSearchDateAllowed(dateKey)) continue;
    const docs = [
      ["Penta", report.documents?.penta],
      ["Handschrift", report.documents?.handwriting],
      ["EC-Schnitt", report.documents?.ecCut]
    ];
    docs.forEach(([label, document]) => {
      if (state.chefSearchMissingDocsOnly) {
        if (hasDocument(document)) return;
        if (!chefMatchesSearch([dateKey, formatDate(dateKey), formatNumericDate(dateKey), label, "fehlt"], query)) return;
        items.push({ dateKey, label, missing: true, document: {} });
        return;
      }
      if (!hasDocument(document)) return;
      if (!chefMatchesSearch([dateKey, formatDate(dateKey), formatNumericDate(dateKey), label, document.name || ""], query)) return;
      items.push({ dateKey, label, missing: false, document });
    });
  }
  return items.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function chefScheduleSearchEntries(query = "") {
  if (!chefSearchIsActive()) return [];
  if (state.chefSearchOpenInvoicesOnly || state.chefSearchMissingDocsOnly) return [];
  const items = [];
  for (const [month, schedule] of Object.entries(state.allSchedules || {})) {
    const publishedDays = publishedScheduleDays(schedule || {});
    for (const [dateKey, assignments] of Object.entries(publishedDays || {})) {
      if (!chefSearchDateAllowed(dateKey)) continue;
      const positions = state.settings.positions.filter((position) => assignments?.[position]);
      const employees = positions.map((position) => assignments[position]);
      if (!positions.length && !assignments?.__dayNote) continue;
      if (!chefMatchesSearch([
        month,
        dateKey,
        formatDate(dateKey),
        formatNumericDate(dateKey),
        assignments?.__dayNote || "",
        ...positions,
        ...employees
      ], query)) continue;
      items.push({ dateKey, assignments, positions, employees });
    }
  }
  return items.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function chefSearchSections(query = "") {
  const scope = state.chefSearchScope || "all";
  const sections = [];
  const allow = (key) => scope === "all" || scope === key;
  if (allow("reports")) {
    const items = chefReportSearchEntries(query);
    if (items.length) {
      sections.push({
        key: "reports",
        title: "Tagesberichte",
        count: items.length,
        html: `<div class="chef-search-card-grid">${items.slice(0, 8).map(([dateKey, report]) => chefReportSearchCardHtml(dateKey, report)).join("")}</div>${items.length > 8 ? `<p class="hint">+${items.length - 8} weitere Treffer</p>` : ""}`
      });
    }
  }
  if (allow("invoices")) {
    const items = chefInvoiceSearchEntries(query);
    if (items.length) {
      sections.push({
        key: "invoices",
        title: "Rechnungen",
        count: items.length,
        html: `<div class="open-invoice-list">${items.slice(0, 6).map((entry) => openInvoiceCardHtml(entry, { mode: entry.invoice.invoiceDone || invoiceIsPaid(entry.invoice) ? "done" : "write" })).join("")}</div>${items.length > 6 ? `<p class="hint">+${items.length - 6} weitere Treffer</p>` : ""}`
      });
    }
  }
  if (allow("employees")) {
    const items = chefEmployeeSearchEntries(query);
    if (items.length) {
      sections.push({
        key: "employees",
        title: "Mitarbeiter",
        count: items.length,
        html: `<div class="chef-search-card-grid">${items.slice(0, 8).map((item) => chefEmployeeSearchCardHtml(item)).join("")}</div>${items.length > 8 ? `<p class="hint">+${items.length - 8} weitere Treffer</p>` : ""}`
      });
    }
  }
  if (allow("documents")) {
    const items = chefDocumentSearchEntries(query);
    if (items.length) {
      sections.push({
        key: "documents",
        title: "Dokumente",
        count: items.length,
        html: `<div class="chef-search-card-grid">${items.slice(0, 8).map((item) => chefDocumentSearchCardHtml(item)).join("")}</div>${items.length > 8 ? `<p class="hint">+${items.length - 8} weitere Treffer</p>` : ""}`
      });
    }
  }
  if (allow("schedule")) {
    const items = chefScheduleSearchEntries(query);
    if (items.length) {
      sections.push({
        key: "schedule",
        title: "Dienstplan",
        count: items.length,
        html: `<div class="chef-search-card-grid">${items.slice(0, 8).map((item) => chefScheduleSearchCardHtml(item)).join("")}</div>${items.length > 8 ? `<p class="hint">+${items.length - 8} weitere Treffer</p>` : ""}`
      });
    }
  }
  return sections;
}

function chefSearchResultsPanelHtml(query = "") {
  const sections = chefSearchSections(query);
  const total = sections.reduce((sum, section) => sum + section.count, 0);
  return `
    <section class="chef-section chef-search-panel">
      <div class="chef-section-head">
        <div>
          <h3>Suche</h3>
          <p>${total ? `${total} Treffer in der Chefansicht.` : "Keine Treffer für diese Suche."}</p>
        </div>
        <button class="secondary" type="button" data-clear-chef-search>Zurücksetzen</button>
      </div>
      ${sections.length ? sections.map((section) => `
        <section class="chef-search-section">
          <div class="chef-search-section-head">
            <strong>${escapeHtml(section.title)}</strong>
            <span>${section.count}</span>
          </div>
          ${section.html}
        </section>
      `).join("") : `<p class="hint">Bitte andere Begriffe oder Filter ausprobieren.</p>`}
    </section>
  `;
}

function chefReportSearchCardHtml(dateKey, report = {}) {
  const missingDocs = reportMissingDocumentLabels(report);
  return `
    <article class="chef-search-card">
      <div>
        <strong>${escapeHtml(formatDate(dateKey))}</strong>
        <span>${escapeHtml(report.shiftLeader || "Keine Schichtleitung hinterlegt")}</span>
      </div>
      <p>${escapeHtml(report.notes || "Keine Notiz hinterlegt.")}</p>
      <div class="chef-search-card-meta">
        <span>${report.closed ? "Abgeschlossen" : "Offen"}</span>
        ${missingDocs.length ? `<span>Fehlt: ${escapeHtml(missingDocs.join(", "))}</span>` : `<span>Dokumente vollständig</span>`}
      </div>
      <button class="secondary" type="button" data-chef-open-report="${escapeHtml(dateKey)}">Bericht öffnen</button>
    </article>
  `;
}

function chefEmployeeSearchCardHtml(item = {}) {
  return `
    <article class="chef-search-card">
      <div>
        <strong>${escapeHtml(item.employee || "")}</strong>
        <span>${escapeHtml(item.role || "Team")}</span>
      </div>
      <p>${escapeHtml((item.departments || []).join(", ") || "Kein Bereich hinterlegt.")}</p>
      <div class="chef-search-card-meta">
        <span>${formatHours(item.totals?.hours || 0)}</span>
        <span>${item.totals?.days || 0} Tage</span>
      </div>
      <button class="secondary" type="button" data-chef-open-tab="employees">Mitarbeiterübersicht öffnen</button>
    </article>
  `;
}

function chefDocumentSearchCardHtml(item = {}) {
  return `
    <article class="chef-search-card">
      <div>
        <strong>${escapeHtml(item.label || "Dokument")}</strong>
        <span>${escapeHtml(formatDate(item.dateKey || ""))}</span>
      </div>
      <p>${item.missing ? "Dokument fehlt noch." : escapeHtml(item.document?.name || "Dokument vorhanden.")}</p>
      <div class="chef-search-card-meta">
        <span>${item.missing ? "Fehlt" : "Vorhanden"}</span>
      </div>
      <button class="secondary" type="button" data-chef-open-report="${escapeHtml(item.dateKey || "")}">Tag öffnen</button>
    </article>
  `;
}

function chefScheduleSearchCardHtml(item = {}) {
  return `
    <article class="chef-search-card">
      <div>
        <strong>${escapeHtml(formatDate(item.dateKey || ""))}</strong>
        <span>${item.positions?.length || 0} Dienste</span>
      </div>
      <p>${escapeHtml(item.employees?.join(", ") || item.assignments?.__dayNote || "Keine Namen hinterlegt.")}</p>
      <div class="chef-search-card-meta">
        <span>${escapeHtml(item.positions?.slice(0, 3).join(", ") || "Dienstplan")}</span>
      </div>
      <button class="secondary" type="button" data-chef-open-schedule-date="${escapeHtml(item.dateKey || "")}">Dienstplan öffnen</button>
    </article>
  `;
}

function chefReportSearchResultsHtml(query = "") {
  const matches = chefReportSearchEntries(query);
  if (!matches.length) {
    return `<p class="hint">Keine Tagesberichte für diese Suche gefunden.</p>`;
  }
  return `
    <div class="day-report-list chef-report-search-results">
      ${matches.map(([dateKey, report]) => `
        <details class="day-report-card chef-selected-report" open>
          <summary>
            <strong>${formatDate(dateKey)}</strong>
            <span>${dayReportSummaryLine(report)}</span>
          </summary>
          ${dayReportActionBarHtml(dateKey, report)}
          ${dayReportA4Html(dateKey, report)}
          ${chefDayReportAttachmentsHtml(dateKey, report)}
        </details>
      `).join("")}
    </div>
  `;
}

function chefSelectedDayReportHtml(dateKey) {
  if (!dateKey) return `<p class="hint">Noch keine Tagesberichte gespeichert.</p>`;
  const report = state.dayReports?.[dateKey];
  if (!report || typeof report !== "object") {
    return `<p class="hint">Für ${escapeHtml(formatDate(dateKey))} ist kein Tagesbericht gespeichert.</p>`;
  }
  return `
    <div class="day-report-list chef-report-single">
      <details class="day-report-card chef-selected-report" open>
        <summary>
          <strong>${formatDate(dateKey)}</strong>
          <span>${dayReportSummaryLine(report)}</span>
        </summary>
        ${dayReportActionBarHtml(dateKey, report)}
        ${dayReportA4Html(dateKey, report)}
        ${chefDayReportAttachmentsHtml(dateKey, report)}
      </details>
    </div>
  `;
}

function dayReportActionBarHtml(dateKey, report = {}) {
  return `
    <div class="day-report-actions chef-day-report-actions">
      <div class="chef-day-report-summary">
        <span>${report.closed ? "Tagesbericht abgeschlossen" : "Tagesbericht offen"}</span>
      </div>
      <div class="chef-day-report-buttons">
        <button class="secondary" type="button" data-export-day-report="${escapeHtml(dateKey)}">Export</button>
        <button class="primary" type="button" data-print-day-report="${escapeHtml(dateKey)}">Drucken</button>
      </div>
    </div>
  `;
}

function chefExportsHtml(month) {
  const selectedMonth = month || ensureChefExportMonthSelection();
  const totalFiles = ["penta", "handwriting", "ecCut"].reduce((sum, key) => sum + reportFolderItems(selectedMonth, key).length, 0);
  return `
    <div class="chef-section-head">
      <div>
        <h3>Exporte</h3>
        <p>Monatsweise Penta, Handschrift und EC-Schnitt einzeln oder gesammelt exportieren.</p>
      </div>
      <div class="chef-section-tools">
        <label>
          Monat
          <input id="chefExportMonth" type="month" value="${escapeHtml(selectedMonth)}">
        </label>
        <button class="secondary" type="button" data-export-chef-month="${escapeHtml(selectedMonth)}" ${totalFiles ? "" : "disabled"}>Monat komplett exportieren</button>
      </div>
    </div>
    ${totalFiles ? `
      <div class="report-folder-grid">
        ${reportFolderHtml(selectedMonth, "penta", "Penta")}
        ${reportFolderHtml(selectedMonth, "handwriting", "Handschrift")}
        ${reportFolderHtml(selectedMonth, "ecCut", "EC-Schnitt")}
      </div>
    ` : `<p class="hint">In diesem Monat wurden noch keine Penta-, Handschrift- oder EC-Dateien hochgeladen.</p>`}
  `;
}

function defaultAdminReportDate() {
  return defaultChefReportDate();
}

function ensureAdminReportDateSelection() {
  const reports = sortedChefReportEntries();
  const availableDates = new Set(reports.map(([dateKey]) => dateKey));
  if (!availableDates.size) {
    state.adminReportDate = "";
    return "";
  }
  if (!state.adminReportDate || !availableDates.has(state.adminReportDate)) {
    state.adminReportDate = defaultAdminReportDate();
  }
  return state.adminReportDate;
}

function renderAdminReports() {
  const container = $("#adminReports");
  if (!container) return;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  container.innerHTML = adminReportsHtml();
}

function adminReportsHtml() {
  const selectedDate = ensureAdminReportDateSelection();
  const reportSearch = String(state.adminReportSearch || "").trim();
  return `
    <div class="chef-section-head">
      <div>
        <h3>Tagesberichte</h3>
        <p>Bericht direkt per Datum wählen. Der zuletzt abgeschlossene Tagesbericht ist automatisch vorausgewählt.</p>
      </div>
      <div class="chef-section-tools">
        <label>
          Datum
          <input id="adminReportDate" type="date" value="${escapeHtml(selectedDate || "")}">
        </label>
        <label>
          Suche
          <input id="adminReportSearch" type="search" value="${escapeHtml(reportSearch)}" placeholder="Kunde, Datum, Mitarbeiter">
        </label>
      </div>
    </div>
    ${reportSearch ? adminReportSearchResultsHtml(reportSearch) : adminSelectedDayReportHtml(selectedDate)}
  `;
}

function adminReportSearchResultsHtml(query = "") {
  const matches = chefReportSearchEntries(query);
  if (!matches.length) {
    return `<p class="hint">Keine Tagesberichte für diese Suche gefunden.</p>`;
  }
  return `
    <div class="day-report-list chef-report-search-results">
      ${matches.map(([dateKey, report]) => `
        <details class="day-report-card chef-selected-report" open>
          <summary>
            <strong>${formatDate(dateKey)}</strong>
            <span></span>
          </summary>
          ${dayReportActionBarHtml(dateKey, report)}
          ${dayReportA4Html(dateKey, report)}
          ${chefDayReportAttachmentsHtml(dateKey, report)}
        </details>
      `).join("")}
    </div>
  `;
}

function adminSelectedDayReportHtml(dateKey) {
  if (!dateKey) return `<p class="hint">Noch keine Tagesberichte gespeichert.</p>`;
  const report = state.dayReports?.[dateKey];
  if (!report || typeof report !== "object") {
    return `<p class="hint">Für ${escapeHtml(formatDate(dateKey))} ist kein Tagesbericht gespeichert.</p>`;
  }
  return `
    <div class="day-report-list chef-report-single">
      <details class="day-report-card chef-selected-report" open>
        <summary>
          <strong>${formatDate(dateKey)}</strong>
          <span></span>
        </summary>
        ${dayReportActionBarHtml(dateKey, report)}
        ${dayReportA4Html(dateKey, report)}
        ${chefDayReportAttachmentsHtml(dateKey, report)}
      </details>
    </div>
  `;
}

function dayReportsForMonthHtml(month, selectedDate = "") {
  const reports = Object.entries(state.dayReports || {})
    .filter(([dateKey, report]) => dateKey.startsWith(`${month}-`) && report && typeof report === "object")
    .sort(([a], [b]) => b.localeCompare(a));
  if (!reports.length) {
    return `<p class="hint">In diesem Monat sind noch keine Tagesberichte gespeichert.</p>`;
  }
  const selectedInMonth = selectedDate.startsWith(`${month}-`) ? selectedDate : "";
  return `
    <div class="day-report-list">
      ${reports.map(([dateKey, report], index) => `
        <details class="day-report-card" ${dateKey === selectedInMonth || (!selectedInMonth && index === 0) ? "open" : ""}>
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
  return "";
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
              <small>Zahlungsart ${escapeHtml(item.paymentMethod || "-")} · Trinkgeld ${escapeHtml(item.tip || "-")}</small>
              ${item.gastroOtherNote ? `<small>Sonstiges Notiz: ${escapeHtml(item.gastroOtherNote)}</small>` : ""}
              ${item.note ? `<small>Notiz: ${escapeHtml(item.note)}</small>` : ""}
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
  const toWrite = openInvoiceItems();
  const done = completedInvoiceItems();
  const hasRealItems = toWrite.length || done.length;
  const activeFolder = normalizedChefInvoiceFolder(toWrite, done);
  return `
    <section class="open-invoices-panel">
      <div>
        <h3>Rechnung schreiben</h3>
        <p>Offene Rechnungen schreiben und danach als erledigt markieren.</p>
      </div>
      <div class="invoice-status-grid">
        ${invoiceStatusSectionHtml("Rechnung schreiben", "Fertig für Chef und wartet auf die Rechnung.", toWrite, "write", activeFolder === "write")}
        ${invoiceStatusSectionHtml("Erledigt", "Nur zum Nachsehen. Bereits erledigte Rechnungen.", done, "done", activeFolder === "done")}
      </div>
      ${!hasRealItems ? `<p class="hint">Noch keine Rechnungen in diesen Bereichen vorhanden.</p>` : ""}
      ${localInvoiceExamplesHtml()}
    </section>
  `;
}

function invoiceManagementVisible() {
  return openInvoiceItems().length > 0 || completedInvoiceItems().length > 0 || localInvoiceExamples().length > 0;
}

function openInvoiceItems() {
  const items = [];
  for (const [dateKey, report] of Object.entries(state.dayReports || {})) {
    (report.invoiceCustomers || []).forEach((invoice, index) => {
      if (invoiceIsPaid(invoice)) return;
      if (invoice.invoiceDone) return;
      if (!invoiceIsReady(invoice)) return;
      items.push({ dateKey, invoice, index });
    });
  }
  return items.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

function completedInvoiceItems() {
  const items = [];
  for (const [dateKey, report] of Object.entries(state.dayReports || {})) {
    (report.invoiceCustomers || []).forEach((invoice, index) => {
      if (!invoice.invoiceDone && !invoiceIsPaid(invoice)) return;
      items.push({ dateKey, invoice, index });
    });
  }
  return items.sort((a, b) => {
    const aKey = a.invoice?.invoicePaidAt || a.invoice?.invoiceDoneAt || a.dateKey;
    const bKey = b.invoice?.invoicePaidAt || b.invoice?.invoiceDoneAt || b.dateKey;
    return bKey.localeCompare(aKey);
  });
}

function normalizedChefInvoiceFolder(toWrite = [], done = []) {
  const available = new Set();
  if (toWrite.length) available.add("write");
  if (done.length) available.add("done");
  const validTokens = new Set([
    ...toWrite.map((entry) => chefInvoiceItemToken(entry, "write")),
    ...done.map((entry) => chefInvoiceItemToken(entry, "done"))
  ]);
  if (!validTokens.has(state.chefInvoiceItemOpen)) state.chefInvoiceItemOpen = "";
  if (!available.has(state.chefInvoiceFolder)) state.chefInvoiceFolder = "";
  return state.chefInvoiceFolder;
}

function chefInvoiceItemToken({ dateKey, invoice, index }, mode) {
  return `${mode}|${dateKey}|${invoice?.id || index}`;
}

function invoiceStatusSectionHtml(title, description, items, mode, isOpen = false) {
  return `
    <section class="invoice-status-section ${isOpen ? "is-open" : ""}">
      <button class="invoice-folder-toggle" type="button" data-chef-invoice-folder="${mode}" aria-expanded="${isOpen ? "true" : "false"}">
        <div class="invoice-folder-meta">
          <strong>${escapeHtml(title)}</strong>
          <span>${items.length ? `${items.length} Kunde${items.length === 1 ? "" : "n"}` : "Keine Einträge"}</span>
        </div>
        <span class="invoice-status-count">${items.length}</span>
      </button>
      ${isOpen ? `<div class="invoice-status-body">
        <p class="hint">${escapeHtml(description)}</p>
        ${items.length ? `<div class="open-invoice-list">
          ${items.map((entry) => openInvoiceCardHtml(entry, { mode })).join("")}
        </div>` : `<p class="hint">Keine Einträge.</p>`}
      </div>` : ""}
    </section>
  `;
}

function openInvoiceCardHtml({ dateKey, invoice, index }, options = {}) {
  const mode = options.mode || "write";
  const isDemo = Boolean(options.demo);
  const bowling = reportMoneyNumber(invoice.bowlingAmount || 0);
  const gastroSplit = invoiceGastroSplit(invoice);
  const total = invoiceTotal(invoice);
  const tipAmount = reportMoneyNumber(invoice.tip || 0);
  const tipText = formatReportMoney(tipAmount);
  const token = `${dateKey}|${invoice.id || index}`;
  const paymentMethod = String(invoice.paymentMethod || "").trim() || "-";
  const noteText = String(invoice.note || "").trim() || "-";
  const otherNoteText = String(gastroSplit.note || "").trim() || "-";
  const primaryAction = invoiceCardPrimaryAction(mode, token, isDemo);
  const expanded = state.chefInvoiceItemOpen === chefInvoiceItemToken({ dateKey, invoice, index }, mode);
  const statusBadgeHtml = mode === "done"
    ? `<span class="invoice-pill ${escapeHtml(invoiceStatusClass(invoice))}">${escapeHtml(invoiceStatusText(invoice))}${isDemo ? " · Demo" : ""}</span>`
    : "";
  const metaFields = [
    invoiceStaticField("Rechnungsdatum", formatDate(dateKey)),
    invoiceStaticField("Zahlungsart", paymentMethod),
    invoiceCopyField("Rechnungsemail", invoice.email || "-", "", true),
    invoiceStaticField("Ansprechpartner", invoice.contact || "-"),
    invoiceStaticField("Telefon", invoice.phone || "-")
  ];
  if (mode === "done") {
    metaFields.push(invoiceStaticField("Erledigt am", formatDateTime(invoice.invoicePaidAt || invoice.invoiceDoneAt || "")));
  }
  const amountFields = [
    invoiceStaticField("Bowling", formatReportMoney(bowling)),
    invoiceStaticField("Getränke", formatReportMoney(gastroSplit.drinks)),
    invoiceStaticField("Speisen", formatReportMoney(gastroSplit.food)),
    invoiceStaticField("Sonstiges", formatReportMoney(gastroSplit.other)),
    invoiceStaticField("Tipp", tipText),
    invoiceCopyField("Gesamtbetrag", formatReportMoney(total), "invoice-copy-field-total", true)
  ];
  return `
    <article class="open-invoice-card ${isDemo ? "is-demo" : ""} ${expanded ? "is-open" : ""}">
      <button class="open-invoice-summary" type="button" data-chef-invoice-item="${escapeHtml(chefInvoiceItemToken({ dateKey, invoice, index }, mode))}" data-chef-invoice-item-folder="${mode}" aria-expanded="${expanded ? "true" : "false"}">
        <div class="open-invoice-summary-main">
          <strong>${escapeHtml(invoice.name || `Rechnung ${index + 1}`)}</strong>
          <span class="open-invoice-summary-date">${escapeHtml(formatDate(dateKey))}</span>
        </div>
        <div class="open-invoice-summary-side">
          <strong class="open-invoice-summary-total">${escapeHtml(formatReportMoney(total))}</strong>
        </div>
      </button>
      ${expanded ? `<div class="open-invoice-body">
        <div class="open-invoice-head">
          <div class="open-invoice-title-block">${statusBadgeHtml}</div>
          <div class="open-invoice-actions">
            ${primaryAction}
            ${!isDemo ? `<button class="secondary danger-lite" type="button" data-delete-invoice="${escapeHtml(token)}">Löschen</button>` : ""}
          </div>
        </div>
        <div class="invoice-copy-grid">
          ${invoiceCopyField("Rechnungsadresse", invoice.address || "-", "invoice-copy-field-wide invoice-copy-field-priority", true)}
          ${metaFields.join("")}
          ${amountFields.join("")}
          ${invoiceStaticField("Rechnungslogik", "Bowling + Getränke + Speisen + Sonstiges + Tipp = Gesamtbetrag", "invoice-copy-field-wide invoice-formula-field")}
          ${invoiceStaticField("Notiz", noteText, "invoice-copy-field-wide")}
          ${invoiceStaticField("Sonstiges Notiz", otherNoteText, "invoice-copy-field-wide")}
        </div>
        ${invoiceReceiptLinksHtml(invoice)}
      </div>` : ""}
    </article>
  `;
}

function invoiceCardPrimaryAction(mode, token, isDemo = false) {
  if (mode === "write") {
    return `<button class="primary" type="button" ${isDemo ? "disabled" : `data-complete-invoice="${escapeHtml(token)}"`}>Als erledigt markieren</button>`;
  }
  return "";
}

function localInvoiceExamples() {
  const host = String(window.location.hostname || "").trim().toLowerCase();
  if (!["localhost", "127.0.0.1", "::1"].includes(host)) return [];
  return [
    {
      dateKey: "2026-06-20",
      invoice: {
        id: "demo-write",
        name: "Musterkunde Geburtstag",
        contact: "Anna Beispiel",
        phone: "+49 160 1234567",
        email: "demo1@la-bowling.de",
        address: "Beispielweg 1\n84034 Landshut",
        paymentMethod: "Überweisung",
        bowlingAmount: "180.00",
        gastroDrinksAmount: "120.00",
        gastroFoodAmount: "210.00",
        gastroOtherAmount: "50.00",
        gastroOtherNote: "Raummiete",
        tip: "20,00",
        note: "Lokales Beispiel für zu schreiben",
        invoiceReady: true,
        pentacodeEntered: true
      },
      mode: "write"
    },
    {
      dateKey: "2026-06-18",
      invoice: {
        id: "demo-sent",
        name: "Musterfirma Event GmbH",
        contact: "Peter Muster",
        phone: "+49 170 555000",
        email: "demo2@la-bowling.de",
        address: "Hauptstraße 22\n84034 Landshut",
        paymentMethod: "EC",
        bowlingAmount: "95.00",
        gastroDrinksAmount: "70.00",
        gastroFoodAmount: "140.00",
        gastroOtherAmount: "0.00",
        tip: "0,00",
        note: "Lokales Beispiel für erledigt",
        invoiceReady: true,
        invoiceDone: true,
        invoiceDoneAt: "2026-06-19T09:30:00.000Z",
        pentacodeEntered: true
      },
      mode: "done"
    },
    {
      dateKey: "2026-06-14",
      invoice: {
        id: "demo-paid",
        name: "Testkunde Verein",
        contact: "Julia Test",
        phone: "+49 151 222333",
        email: "demo3@la-bowling.de",
        address: "Testgasse 7\n84034 Landshut",
        paymentMethod: "Bar",
        bowlingAmount: "240.00",
        gastroDrinksAmount: "130.00",
        gastroFoodAmount: "200.00",
        gastroOtherAmount: "0.00",
        tip: "35,00",
        note: "Lokales Beispiel für erledigt",
        invoiceReady: true,
        invoiceDone: true,
        invoiceDoneAt: "2026-06-15T08:00:00.000Z",
        invoicePaid: true,
        invoicePaidAt: "2026-06-16T13:15:00.000Z",
        pentacodeEntered: true
      },
      mode: "done"
    }
  ];
}

function localInvoiceExamplesHtml() {
  const examples = localInvoiceExamples();
  if (!examples.length) return "";
  return `
    <section class="invoice-demo-panel">
      <div class="invoice-status-head">
        <div>
          <h4>Lokale Beispiele</h4>
          <p>Nur auf localhost sichtbar. Diese Karten ändern keine echten Rechnungen.</p>
        </div>
      </div>
      <div class="open-invoice-list">
        ${examples.map((entry, index) => openInvoiceCardHtml({ dateKey: entry.dateKey, invoice: entry.invoice, index }, { mode: entry.mode, demo: true })).join("")}
      </div>
    </section>
  `;
}

function invoiceBriefhead(invoice = {}) {
  return [
    invoice.name || "",
    invoice.address || ""
  ].map((line) => String(line || "").trim()).filter(Boolean).join("\n") || "-";
}

function invoiceCopyField(label, value, className = "", copyable = true) {
  const text = String(value || "-");
  const escapedText = escapeHtml(text);
  return `
    <div class="invoice-copy-field ${escapeHtml(className)}">
      <small>${escapeHtml(label)}</small>
      <strong>${escapedText.replace(/\n/g, "<br>")}</strong>
      ${copyable ? `<button class="secondary invoice-copy-button" type="button" data-copy-value="${escapedText.replace(/\n/g, "&#10;")}">Kopieren</button>` : ""}
    </div>
  `;
}

function invoiceStaticField(label, value, className = "") {
  return invoiceCopyField(label, value, className, false);
}

function formatCopyMoneyValue(value) {
  return Number(value || 0).toFixed(2).replace(".", ",");
}

function invoiceRowCustomerCopyValue(row) {
  return String(reportFieldValue(row, "name") || "").trim() || "Kunde";
}

function invoiceRowTotalValue(row) {
  return parseMoneyInput(reportFieldValue(row, "bowlingAmount")) + invoiceGastroSplit({
    gastroAmount: reportFieldValue(row, "gastroAmount"),
    gastroDrinksAmount: reportFieldValue(row, "gastroDrinksAmount"),
    gastroFoodAmount: reportFieldValue(row, "gastroFoodAmount"),
    gastroOtherAmount: reportFieldValue(row, "gastroOtherAmount")
  }).total + parseMoneyInput(reportFieldValue(row, "tip"));
}

function invoiceRowTotalCopyValue(row) {
  return formatCopyMoneyValue(invoiceRowTotalValue(row));
}

function dayReportFoldersByMonthHtml(selectedDate = "") {
  const months = Object.keys(state.dayReports || {})
    .filter((dateKey) => state.dayReports?.[dateKey] && typeof state.dayReports[dateKey] === "object")
    .map((dateKey) => dateKey.slice(0, 7));
  const sortedMonths = [...new Set(months)].sort((a, b) => b.localeCompare(a));
  if (!sortedMonths.length) return "";
  const selectedMonth = selectedDate?.slice(0, 7) || sortedMonths[0] || "";
  return `
    <section class="report-folders">
      <div class="report-folders-head">
        <div>
          <h3>Monatsordner</h3>
          <p>Tagesberichte monatsweise prüfen. Belege und Dokumente stehen direkt im jeweiligen Tagesbericht.</p>
        </div>
      </div>
      ${sortedMonths.map((month) => `
        <details class="report-month-card" ${month === selectedMonth ? "open" : ""}>
          <summary class="report-month-summary">
            <span>
              <strong>${formatMonth(month)}</strong>
              <small>${monthReportDays(month)} Tagesberichte</small>
            </span>
            <b>${monthReportAttachmentCount(month)} Dateien</b>
          </summary>
          <details class="report-month-section" ${month === selectedMonth ? "open" : ""}>
            <summary>Tagesberichte</summary>
            ${dayReportsForMonthHtml(month, selectedDate)}
          </details>
        </details>
      `).join("")}
    </section>
  `;
}

function reportFolderHtml(month, key, label) {
  const items = reportFolderItems(month, key);
  return `
    <section class="report-folder-card report-folder-card-static">
      <div class="report-folder-card-head">
        <div>
          <strong>${escapeHtml(label)}</strong>
          <span>${items.length} Datei${items.length === 1 ? "" : "en"}</span>
        </div>
        <div class="report-folder-actions">
          <button class="secondary" type="button" data-export-selected-folder="${escapeHtml(month)}|${escapeHtml(key)}" ${items.length ? "" : "disabled"}>Ausgewählte</button>
          <button class="secondary" type="button" data-export-report-folder="${escapeHtml(month)}|${escapeHtml(key)}" ${items.length ? "" : "disabled"}>Monat exportieren</button>
        </div>
      </div>
      <div class="report-folder-files compact-export-files">
        ${items.length ? items.map((item, index) => {
          const token = `${month}|${key}|${index}`;
          return `
          <div class="report-folder-file compact-export-file" data-report-file-row="${escapeHtml(token)}">
            <label class="report-file-select compact-export-select">
              <input type="checkbox" data-report-file="${escapeHtml(token)}">
              <span>${escapeHtml(item.title)}</span>
            </label>
            <div class="report-file-actions compact-export-actions">
              <button class="secondary" type="button" data-preview-report-file="${escapeHtml(token)}">Vorschau</button>
              <button class="secondary" type="button" data-export-report-file="${escapeHtml(token)}">Export</button>
            </div>
            <div class="report-file-preview hidden" data-report-file-preview="${escapeHtml(token)}"></div>
          </div>
        `}).join("") : `<p class="hint">Keine Dateien in diesem Monat.</p>`}
      </div>
    </section>
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

function invoiceIsPaid(item = {}) {
  return item.invoicePaid === true || item.invoicePaid === "true";
}

function invoicePentacodeEntered(item = {}) {
  if (item.pentacodeEntered === true || item.pentacodeEntered === "true") return true;
  if (item.pentacodeEntered === false || item.pentacodeEntered === "false") return false;
  return Boolean(item.invoiceDone || item.invoiceReady || item.invoiceNotificationSentAt || item.invoicePaid);
}

function invoiceStatusText(item = {}) {
  if (invoiceIsPaid(item) || item.invoiceDone) return "Erledigt";
  if (item.invoiceNotificationSentAt) return "An Chef gesendet";
  if (invoiceIsReady(item)) return "Fertig für Chef";
  return "Angelegt";
}

function invoiceStatusClass(item = {}) {
  if (invoiceIsPaid(item) || item.invoiceDone) return "is-done";
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
          <span>Zahlungsart: ${escapeHtml(item.paymentMethod || "-")}</span>
          <span>Trinkgeld: ${escapeHtml(item.tip || "-")}</span>
          <span>Briefkopf</span>
          <p class="invoice-briefhead">${escapeHtml(invoiceBriefhead(item)).replace(/\n/g, "<br>")}</p>
          <span>Ansprechpartner: ${escapeHtml(item.contact || "-")}</span>
          <span>Telefon: ${escapeHtml(item.phone || "-")}</span>
          <span>${escapeHtml(item.email || "Keine E-Mail")}</span>
          ${item.gastroOtherNote ? `<span>Sonstiges Notiz: ${escapeHtml(item.gastroOtherNote)}</span>` : ""}
          ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
          <span>In Pentacode eingetragen: ${invoicePentacodeEntered(item) ? "Ja" : "Nein"}</span>
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

function normalizedInvoicePaymentMethod(value = "") {
  const text = String(value || "").trim().toLowerCase();
  if (text === "überweisung" || text === "ueberweisung") return "ueberweisung";
  if (text === "ec") return "ec";
  if (text === "bar") return "bar";
  return "";
}

function reportTransferInvoiceTotal(report = {}) {
  return reportInvoiceCustomers(report)
    .filter((item) => normalizedInvoicePaymentMethod(item.paymentMethod) === "ueberweisung")
    .reduce((sum, item) => sum + invoiceTotal(item), 0);
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
  const transferInvoiceTotal = reportTransferInvoiceTotal(report);
  const revenueTotal = Math.max(0, revenueBowling + revenueGastro - reportPersonalConsumptionTotal(report));
  return Math.max(0, barTotal(report) + reportCashExpensesTotal(report) + reportEcTotal(report) + transferInvoiceTotal - revenueTotal);
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

function invoiceTipAmount(item = {}) {
  return reportMoneyNumber(item.tip);
}

function invoiceTotal(item = {}) {
  const splitTotal = reportMoneyNumber(item.bowlingAmount) + invoiceGastroSplit(item).total;
  const baseTotal = splitTotal || reportMoneyNumber(item.amount);
  return baseTotal + invoiceTipAmount(item);
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

function exportChefMonthDocuments(month) {
  const items = ["penta", "handwriting", "ecCut"]
    .flatMap((key) => reportFolderItems(month, key))
    .filter((item) => item.href);
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
    showToast("Rechnung als geschrieben markiert.");
  } catch (error) {
    button.textContent = oldText;
    button.disabled = false;
    showError(error);
  }
}

async function payInvoice(value, button) {
  const [date, invoiceId] = String(value || "").split("|");
  if (!date || !invoiceId) return;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    await api("/api/state", {
      method: "POST",
      body: JSON.stringify({
        action: "pay-invoice",
        date,
        invoiceId,
        employeeToken: state.employeeToken,
        adminToken: state.adminToken
      })
    });
    await loadState();
    showToast("Rechnung als bezahlt markiert.");
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

function assignmentAvailabilityForEmployee(dateKey, employee) {
  const direct = state.assignmentAvailability?.[dateKey]?.[employee];
  if (direct) return direct;
  return state.availability?.[employee]?.[dateKey] || null;
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
  const assignments = sourceSchedule?.days?.[key]
    || (options.crossMonth
      ? (options.publishedOnly ? publishedScheduleDayAssignments(key) : scheduleForMonth(key.slice(0, 7)).days?.[key])
      : null)
    || {};
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

function renderAdminOffers() {
  const container = $("#adminOffers");
  if (!container) return;
  if (state.offerDraftDirty && container.querySelector("[data-offer-field]")) {
    state.offerCustomerSearch = container.querySelector("#offerCustomerSearch")?.value || state.offerCustomerSearch || "";
    state.offerDraft = currentOfferDraftFromDom();
    state.offerDraftId = state.offerDraft.id;
  }
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  const draft = ensureOfferDraft();
  const totals = offerTotals(draft);
  const bowling = offerBowlingPricing(draft.eventDate, draft.bowling);
  const buffetPricing = offerBuffetPricing(draft);
  const reservedAreaPricing = offerReservedAreaPricing(draft);
  const timelineEvents = offerTimelineEvents(draft);
  const customerQuery = String(state.offerCustomerSearch || "").trim();
  const customerOptions = normalizeCustomerDirectory(state.customerDirectory).filter((customer) => offerCustomerDirectoryMatches(customer, customerQuery));
  const offers = normalizeOffersClient(state.offers || []);
  const activeId = state.offerDraft?.id || draft.id;
  const listHtml = offers.length ? offers.map((offer) => renderOfferListItem(offer, activeId)).join("") : `<p class="hint">Noch keine Angebote angelegt.</p>`;
  container.innerHTML = `
    <div class="offer-toolbar">
      <div class="offer-toolbar-actions">
        <button class="primary" type="button" data-offer-new>+ Neues Angebot</button>
        <button class="secondary" type="button" data-offer-save>Speichern</button>
        <button class="secondary" type="button" data-offer-duplicate>Duplizieren</button>
        <button class="secondary" type="button" data-offer-toggle-archive>${draft.archived ? "Archivierung aufheben" : "Archivieren"}</button>
        <button class="secondary danger-lite" type="button" data-offer-delete>Löschen</button>
        <button class="secondary" type="button" data-offer-print>PDF / Drucken</button>
      </div>
      <div class="offer-toolbar-stats">
        <span class="offer-stat"><small>Personen</small><strong>${totals.personCount}</strong></span>
        <span class="offer-stat"><small>Buffet</small><strong>${formatMoney(totals.buffetTotal)}</strong></span>
        <span class="offer-stat"><small>Bowling</small><strong>${formatMoney(totals.bowlingTotal)}</strong></span>
        <span class="offer-stat"><small>Bereich</small><strong>${formatMoney(totals.reservedAreaTotal)}</strong></span>
        <span class="offer-stat"><small>Zusatz</small><strong>${formatMoney(totals.extraRows)}</strong></span>
        <span class="offer-stat offer-stat-total"><small>Gesamt</small><strong>${formatMoney(totals.total)}</strong></span>
      </div>
    </div>
    <div class="offer-workspace-grid">
      <aside class="offer-sidebar">
        <div class="offer-sidebar-head">
          <strong>Angebotsliste</strong>
          <span>${offers.length} Einträge</span>
        </div>
        <div class="offer-list">${listHtml}</div>
      </aside>
      <section class="offer-editor">
        <div class="offer-editor-head">
          <div>
            <h3>${escapeHtml(draft.title || "Angebot")}</h3>
            <p>${draft.archived ? "Archiviert" : "Aktiv"} · zuletzt ${draft.updatedAt ? escapeHtml(formatDateTime(draft.updatedAt)) : "noch nicht gespeichert"}</p>
          </div>
          <div class="offer-head-badges">
            <span class="offer-badge">${escapeHtml(draft.offerDate ? formatDate(draft.offerDate) : "Datum offen")}</span>
            <span class="offer-badge">${escapeHtml(draft.eventDate ? formatDate(draft.eventDate) : "Veranstaltung offen")}</span>
          </div>
        </div>

        <div class="offer-grid">
          <label>Bezeichnung<input data-offer-field="title" value="${escapeHtml(draft.title)}" placeholder="z.B. Angebot Stoll"></label>
          <label>Angebotsdatum<input data-offer-field="offerDate" type="date" value="${escapeHtml(draft.offerDate)}"></label>
          <label>Veranstaltungsdatum<input data-offer-field="eventDate" type="date" value="${escapeHtml(draft.eventDate)}"></label>
          <label>Anlass<input data-offer-field="occasion" value="${escapeHtml(draft.occasion)}" placeholder="z.B. Hochzeitsfeier"></label>
          <label>Erwachsene<input data-offer-field="personsAdults" type="number" min="0" step="1" value="${escapeHtml(draft.personsAdults)}"></label>
          <label>Kinder<input data-offer-field="personsChildren" type="number" min="0" step="1" value="${escapeHtml(draft.personsChildren)}"></label>
          <label>Eintreffen<input data-offer-field="startTime" type="time" value="${escapeHtml(draft.startTime)}"></label>
        </div>

        <section class="offer-section">
          <div class="offer-section-head">
            <div>
              <strong>Kunde aus Kundenstamm</strong>
              <span>Bestehende Rechnungskunden aus der Kartei übernehmen und als Angebotsbasis verwenden.</span>
            </div>
          </div>
          <div class="offer-grid offer-grid-two">
            <label>Kundenstamm durchsuchen<input id="offerCustomerSearch" value="${escapeHtml(customerQuery)}" placeholder="Name, Firma, Ansprechpartner"></label>
            <label>Kunde auswählen
              <select data-offer-field="customerDirectoryId">
                ${offerCustomerDirectoryOptions(customerOptions, draft.customerDirectoryId)}
              </select>
            </label>
          </div>
          <div class="day-report-actions">
            <button class="secondary" type="button" data-offer-apply-customer>Stammdaten übernehmen</button>
          </div>
        </section>

        <div class="offer-grid offer-grid-two">
          <label>Kunde / Firma<input data-offer-field="customerName" value="${escapeHtml(draft.customerName)}" placeholder="Firma oder Name"></label>
          <label>Ansprechpartner<input data-offer-field="customerContact" value="${escapeHtml(draft.customerContact)}" placeholder="Ansprechpartner"></label>
          <label>E-Mail<input data-offer-field="customerEmail" value="${escapeHtml(draft.customerEmail)}" placeholder="E-Mail für Rückfragen"></label>
          <label>Telefon<input data-offer-field="customerPhone" value="${escapeHtml(draft.customerPhone)}" placeholder="Telefonnummer"></label>
          <label class="offer-grid-wide">Rechnungsadresse<textarea data-offer-field="customerAddress" rows="3" placeholder="Adresse">${escapeHtml(draft.customerAddress)}</textarea></label>
        </div>

        <section class="offer-section">
          <div class="offer-section-head">
            <div>
              <strong>Bereich & Zusatzoptionen</strong>
              <span>Raummiete wird automatisch ergänzt. Großes Nebenzimmer ohne Buffet und ohne Bowling = 100,00 Euro. LA-Bowling Hütte = 250,00 Euro.</span>
            </div>
          </div>
          <div class="offer-grid offer-grid-two">
            <label>Reservierter Bereich
              <select data-offer-field="reservedArea">
                ${offerReservedAreaOptions(draft.reservedArea)}
              </select>
            </label>
            <label>Preis komplettes Center
              <input data-offer-field="reservedAreaPrice" type="number" min="0" step="0.01" value="${escapeHtml(draft.reservedAreaPrice)}" placeholder="frei eingeben">
            </label>
            <label class="offer-toggle-row">
              <span>Lagerfeuerstelle mit Feuerholz</span>
              <input data-offer-field="reservedAreaCampfire" type="checkbox" ${draft.reservedAreaCampfire ? "checked" : ""}>
            </label>
          </div>
          <div class="offer-bowling-summary">
            <span class="offer-stat"><small>Bereich</small><strong>${escapeHtml(reservedAreaPricing.reservedAreaLabel || "-")}</strong></span>
            <span class="offer-stat"><small>Raummiete</small><strong>${formatMoney(reservedAreaPricing.roomFee)}</strong></span>
            <span class="offer-stat"><small>Lagerfeuer</small><strong>${formatMoney(reservedAreaPricing.campfireFee)}</strong></span>
            <span class="offer-stat offer-stat-total"><small>Bereich gesamt</small><strong>${formatMoney(reservedAreaPricing.total)}</strong></span>
          </div>
          ${reservedAreaPricing.warning ? `<p class="offer-warning">${escapeHtml(reservedAreaPricing.warning)}</p>` : ""}
        </section>

        <section class="offer-section">
          <div class="offer-section-head">
            <div>
              <strong>Bowling</strong>
              <span>Bahnen, Leihschuhe und Spielzeit werden automatisch anhand der Website-Preise berechnet.</span>
            </div>
            <a class="secondary" href="${OFFER_BOWLING_PRICE_URL}" target="_blank" rel="noreferrer">Preise öffnen</a>
          </div>
          <div class="offer-grid">
            <label>Turnierpaket
              <select data-offer-field="bowlingTournamentPackage">
                ${offerTournamentPackageOptions(draft.bowling?.tournamentPackage || "")}
              </select>
            </label>
            <label>Bahnen Anzahl<input data-offer-field="bowlingLanes" type="number" min="0" step="1" value="${escapeHtml(draft.bowling?.lanes)}"></label>
            <label>Leihschuhe Personen<input data-offer-field="bowlingShoePersons" type="number" min="0" step="1" value="${escapeHtml(draft.bowling?.shoePersons)}"></label>
            <label>Bowling von<input data-offer-field="bowlingFromTime" type="time" value="${escapeHtml(draft.bowling?.fromTime)}"></label>
            <label>Bowling bis<input data-offer-field="bowlingToTime" type="time" value="${escapeHtml(draft.bowling?.toTime)}"></label>
          </div>
          <div class="offer-bowling-summary">
            <span class="offer-stat"><small>Tag</small><strong>${escapeHtml(bowling.dayLabel || (draft.eventDate ? formatDate(draft.eventDate) : "-"))}</strong></span>
            <span class="offer-stat"><small>Öffnungszeit</small><strong>${escapeHtml(bowling.openingHours || "-")}</strong></span>
            <span class="offer-stat"><small>Spieldauer</small><strong>${escapeHtml(bowling.durationLabel)}</strong></span>
            <span class="offer-stat"><small>Bahnkosten</small><strong>${formatMoney(bowling.laneCost)}</strong></span>
            <span class="offer-stat"><small>Leihschuhe</small><strong>${formatMoney(bowling.shoeCost)}</strong></span>
            <span class="offer-stat"><small>Turnierpaket</small><strong>${formatMoney(bowling.tournamentCost)}</strong></span>
            <span class="offer-stat offer-stat-total"><small>Bowling gesamt</small><strong>${formatMoney(bowling.total)}</strong></span>
          </div>
          ${bowling.tournamentPackageLabel ? `<p class="offer-pricing-note"><strong>${escapeHtml(bowling.tournamentPackageLabel)}</strong>: ${escapeHtml(bowling.tournamentPackageDescription)}</p>` : ""}
          <p class="offer-pricing-note">${escapeHtml(bowling.rateLabel)}</p>
          ${bowling.warning ? `<p class="offer-warning">${escapeHtml(bowling.warning)}</p>` : ""}
        </section>

        <section class="offer-section">
          <div class="offer-section-head">
            <div>
              <strong>Buffet</strong>
              <span>Vorlage auswählen, danach einzelne Gerichte frei anpassen.</span>
            </div>
            <div class="offer-inline-tools">
              <select data-offer-field="buffetTemplateKey">
                <option value="">Vorlage wählen</option>
                ${offerTemplateOptions(draft.buffet?.templateKey || "")}
              </select>
              <button class="secondary" type="button" data-offer-apply-template>Vorlage übernehmen</button>
            </div>
          </div>
          <div class="offer-grid offer-grid-two">
            <label>Buffetname<input data-offer-field="buffetName" value="${escapeHtml(draft.buffet?.name)}" placeholder="Buffetname"></label>
            <label>Preis pro Person<input data-offer-field="buffetPricePerPerson" type="number" min="0" step="0.01" value="${escapeHtml(draft.buffet?.pricePerPerson)}"></label>
            <label class="offer-toggle-row">
              <span>Sektempfang dazubuchen</span>
              <input data-offer-field="buffetSparklingReception" type="checkbox" ${draft.buffet?.sparklingReception ? "checked" : ""}>
            </label>
            <label>Sektempfang Uhrzeit<input data-offer-field="sparklingReceptionTime" type="time" value="${escapeHtml(draft.sparklingReceptionTime)}"></label>
            <label>Essenszeit<input data-offer-field="mealTime" type="time" value="${escapeHtml(draft.mealTime)}"></label>
          </div>
          <div class="offer-bowling-summary">
            <span class="offer-stat"><small>Erwachsene</small><strong>${escapeHtml(String(totals.adults))}</strong></span>
            <span class="offer-stat"><small>Kinder unter 12</small><strong>${escapeHtml(String(totals.children))}</strong></span>
            <span class="offer-stat"><small>Berechnete Personen</small><strong>${escapeHtml(formatOfferUnits(totals.chargedUnits))}</strong></span>
            <span class="offer-stat"><small>Buffet</small><strong>${formatMoney(totals.buffetBaseTotal)}</strong></span>
            <span class="offer-stat"><small>Sektempfang</small><strong>${formatMoney(totals.sparklingReceptionTotal)}</strong></span>
            <span class="offer-stat offer-stat-total"><small>Buffet gesamt</small><strong>${formatMoney(totals.buffetTotal)}</strong></span>
          </div>
          <p class="offer-pricing-note">Kinder bis 12 Jahre werden beim Buffet und beim optionalen Sektempfang automatisch zum halben Preis berechnet.</p>
          <div class="offer-buffet-categories">
            ${OFFER_CATEGORY_ORDER.map((category) => renderOfferBuffetCategory(category, draft)).join("")}
          </div>
        </section>

        <section class="offer-section">
          <div class="offer-section-head">
            <div>
              <strong>Ablauf</strong>
              <span>Feste Zeiten und freie Ereignisse werden für den Kunden in einer klaren Reihenfolge dargestellt.</span>
            </div>
            <button class="secondary" type="button" data-offer-add-timeline>+ Ereignis hinzufügen</button>
          </div>
          <div class="offer-timeline-visual">
            ${timelineEvents.length ? timelineEvents.map((item) => `
              <article class="offer-timeline-card">
                <div class="offer-timeline-time">${escapeHtml(item.time || "--:--")}</div>
                <div class="offer-timeline-copy">
                  <strong>${escapeHtml(item.title || "Ereignis")}</strong>
                  ${item.note ? `<span>${escapeHtml(item.note)}</span>` : ""}
                </div>
              </article>
            `).join("") : `<p class="hint">Noch keine Ablaufpunkte hinterlegt.</p>`}
          </div>
          <div class="offer-row-list">
            ${(draft.timeline || []).length ? (draft.timeline || []).map((item, index) => renderOfferTimelineRow(item, index)).join("") : `<p class="hint">Noch keine Zeiten eingetragen.</p>`}
          </div>
        </section>

        <section class="offer-section">
          <div class="offer-section-head">
            <div>
              <strong>Kostenübersicht</strong>
              <span>Zusätzliche Positionen wie Sektempfang, Raummiete, Getränke oder Sonstiges.</span>
            </div>
            <button class="secondary" type="button" data-offer-add-cost>+ Position hinzufügen</button>
          </div>
          <div class="offer-row-list">
            ${(draft.costs || []).length ? (draft.costs || []).map((item, index) => renderOfferCostRow(item, index)).join("") : `<p class="hint">Noch keine Positionen angelegt.</p>`}
          </div>
        </section>

        <section class="offer-section">
          <div class="offer-section-head">
            <div>
              <strong>Zusatztexte für das Angebot</strong>
              <span>Standardtexte wie Preisangabe, Stornofrist und Reservierungsbestätigung können pro Angebot ein- oder ausgeblendet werden.</span>
            </div>
          </div>
          <div class="offer-row-list">
            ${Object.entries(draft.textBlocks || {}).map(([key, block]) => renderOfferTextBlockEditor(key, block)).join("")}
          </div>
        </section>

        <div class="offer-grid offer-grid-two">
          <label class="offer-grid-wide">Zusätzliche Informationen<textarea data-offer-field="additionalInfo" rows="4" placeholder="Für das Angebot sichtbar">${escapeHtml(draft.additionalInfo)}</textarea></label>
          <label class="offer-grid-wide">Interne Notiz<textarea data-offer-field="internalNote" rows="4" placeholder="Nur intern">${escapeHtml(draft.internalNote)}</textarea></label>
        </div>
      </section>
    </div>
  `;
}

function renderOfferListItem(offer, activeId) {
  const totals = offerTotals(offer);
  const title = offer.title || offer.customerName || "Angebot";
  const dateLine = [offer.eventDate ? formatDate(offer.eventDate) : "", offer.customerName].filter(Boolean).join(" · ");
  return `
    <button class="offer-list-item ${offer.id === activeId ? "active" : ""}" type="button" data-select-offer="${escapeHtml(offer.id)}">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(dateLine || "Noch keine Details")}</span>
      <small>${formatMoney(totals.total)} · ${offer.archived ? "Archiviert" : "Aktiv"}</small>
    </button>
  `;
}

function renderOfferBuffetCategory(category, draft) {
  const items = draft.buffet?.categories?.[category] || [];
  return `
    <section class="offer-category" data-offer-category="${escapeHtml(category)}">
      <div class="offer-category-head">
        <strong>${escapeHtml(OFFER_CATEGORY_LABELS[category] || category)}</strong>
        <div class="offer-inline-tools">
          <select data-offer-assortment-select="${escapeHtml(category)}">
            ${offerDishAssortmentOptions(category)}
          </select>
          <button class="secondary" type="button" data-offer-insert-assortment="${escapeHtml(category)}">Aus Sortiment</button>
          <button class="secondary" type="button" data-offer-add-dish="${escapeHtml(category)}">+ Leer</button>
        </div>
      </div>
      <div class="offer-row-list">
        ${items.length ? items.map((item) => renderOfferDishRow(category, item)).join("") : `<p class="hint">Noch keine Gerichte hinterlegt.</p>`}
      </div>
    </section>
  `;
}

function renderOfferDishRow(category, item) {
  return `
    <div class="offer-edit-row" data-offer-dish-row="${escapeHtml(category)}" data-offer-dish-id="${escapeHtml(item.id)}">
      <input data-offer-dish-name value="${escapeHtml(item.name)}" placeholder="Gericht">
      <input data-offer-dish-note value="${escapeHtml(item.note)}" placeholder="Notiz">
      <div class="row-actions">
        <button class="secondary" type="button" data-offer-move-dish="up">↑</button>
        <button class="secondary" type="button" data-offer-move-dish="down">↓</button>
        <button class="secondary danger-lite" type="button" data-offer-remove-dish>Entfernen</button>
      </div>
    </div>
  `;
}

function renderOfferTimelineRow(item) {
  return `
    <div class="offer-edit-row" data-offer-timeline-row data-offer-timeline-id="${escapeHtml(item.id)}">
      <input data-offer-timeline-time type="time" value="${escapeHtml(item.time)}">
      <input data-offer-timeline-title value="${escapeHtml(item.title)}" placeholder="Schritt / Ablaufpunkt">
      <input data-offer-timeline-note value="${escapeHtml(item.note)}" placeholder="Notiz">
      <div class="row-actions">
        <button class="secondary" type="button" data-offer-move-timeline="up">↑</button>
        <button class="secondary" type="button" data-offer-move-timeline="down">↓</button>
        <button class="secondary danger-lite" type="button" data-offer-remove-timeline>Entfernen</button>
      </div>
    </div>
  `;
}

function renderOfferCostRow(item) {
  return `
    <div class="offer-edit-row" data-offer-cost-row data-offer-cost-id="${escapeHtml(item.id)}">
      <input data-offer-cost-label value="${escapeHtml(item.label)}" placeholder="Bezeichnung">
      <input data-offer-cost-quantity type="number" min="0" step="0.01" value="${escapeHtml(item.quantity)}" placeholder="Menge">
      <input data-offer-cost-unit type="number" min="0" step="0.01" value="${escapeHtml(item.unitPrice)}" placeholder="Einzelpreis">
      <input data-offer-cost-note value="${escapeHtml(item.note)}" placeholder="Notiz">
      <div class="row-actions">
        <button class="secondary" type="button" data-offer-move-cost="up">↑</button>
        <button class="secondary" type="button" data-offer-move-cost="down">↓</button>
        <button class="secondary danger-lite" type="button" data-offer-remove-cost>Entfernen</button>
      </div>
    </div>
  `;
}

function renderOfferTextBlockEditor(key, block) {
  return `
    <article class="offer-text-block">
      <label class="offer-toggle-row">
        <span>${escapeHtml(block.label)}</span>
        <input data-offer-field="textBlockEnabled-${key}" type="checkbox" ${block.enabled ? "checked" : ""}>
      </label>
      <textarea data-offer-field="textBlockText-${key}" rows="4" placeholder="${escapeHtml(block.label)}">${escapeHtml(block.text || "")}</textarea>
    </article>
  `;
}

function offerFieldNeedsLiveRefresh(target) {
  if (!target) return false;
  const liveFields = new Set([
    "eventDate",
    "personsAdults",
    "personsChildren",
    "startTime",
    "mealTime",
    "sparklingReceptionTime",
    "reservedArea",
    "reservedAreaPrice",
    "reservedAreaCampfire",
    "customerDirectoryId",
    "bowlingTournamentPackage",
    "bowlingLanes",
    "bowlingShoePersons",
    "bowlingFromTime",
    "bowlingToTime",
    "buffetName",
    "buffetPricePerPerson",
    "buffetSparklingReception"
  ]);
  const fieldName = target.dataset?.offerField || "";
  if (liveFields.has(fieldName)) return true;
  return Boolean(
    target.closest("[data-offer-timeline-row]") ||
    target.closest("[data-offer-cost-row]")
  );
}

function refreshOfferEditorComputedView(focusSelector = "") {
  const container = $("#adminOffers");
  if (container?.querySelector("[data-offer-field]")) {
    state.offerCustomerSearch = container.querySelector("#offerCustomerSearch")?.value || state.offerCustomerSearch || "";
    state.offerDraft = currentOfferDraftFromDom();
    state.offerDraftId = state.offerDraft.id;
  }
  renderAdminOffers();
  if (focusSelector) {
    const focusTarget = $("#adminOffers")?.querySelector(focusSelector);
    focusTarget?.focus();
  }
}

async function saveCurrentOffer(button) {
  const draft = currentOfferDraftFromDom();
  const oldText = button?.textContent || "Speichern";
  if (button) {
    button.disabled = true;
    button.textContent = "Speichert...";
  }
  try {
    const result = await api("/api/state", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "save-offer",
        adminToken: state.adminToken,
        offer: draft
      })
    });
    state.offers = normalizeOffersClient(result.offers || state.offers || []);
    state.offerDraft = cloneData(result.offer || draft);
    state.offerDraftId = state.offerDraft.id;
    state.offerDraftDirty = false;
    renderAdminOffers();
    showToast("Angebot gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function deleteCurrentOffer(button) {
  const draft = currentOfferDraftFromDom();
  if (!draft?.id) return;
  if (!window.confirm("Dieses Angebot wirklich löschen?")) return;
  const oldText = button?.textContent || "Löschen";
  if (button) {
    button.disabled = true;
    button.textContent = "Löscht...";
  }
  try {
    const result = await api("/api/state", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "delete-offer",
        adminToken: state.adminToken,
        offerId: draft.id
      })
    });
    state.offers = normalizeOffersClient(result.offers || []);
    state.offerDraft = state.offers[0] ? cloneData(state.offers[0]) : createBlankOfferDraft();
    state.offerDraftId = state.offerDraft.id;
    state.offerDraftDirty = false;
    renderAdminOffers();
    showToast("Angebot gelöscht.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

function duplicateCurrentOffer() {
  const draft = currentOfferDraftFromDom();
  const clone = cloneData(draft);
  clone.id = cryptoId();
  clone.createdAt = new Date().toISOString();
  clone.updatedAt = clone.createdAt;
  clone.title = `${clone.title || "Angebot"} Kopie`;
  state.offerDraft = normalizeOfferClient(clone);
  state.offerDraftId = state.offerDraft.id;
  state.offerDraftDirty = false;
  renderAdminOffers();
  showToast("Angebot dupliziert.");
}

function toggleCurrentOfferArchive() {
  const draft = currentOfferDraftFromDom();
  state.offerDraft = normalizeOfferClient({ ...draft, archived: !draft.archived });
  state.offerDraftId = state.offerDraft.id;
  state.offerDraftDirty = false;
  renderAdminOffers();
}

function newOfferDraft() {
  state.offerDraft = createBlankOfferDraft();
  state.offerDraftId = state.offerDraft.id;
  state.offerDraftDirty = false;
  renderAdminOffers();
}

function moveOfferRow(list, rowId, direction) {
  const index = list.findIndex((item) => item.id === rowId);
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(nextIndex, 0, item);
  return copy;
}

function offerTemplateBadgeLabel(offer) {
  const templateName = OFFER_BUFFET_TEMPLATES[offer?.buffet?.templateKey || ""]?.name || "";
  return (templateName || offer?.buffet?.name || "").trim().toUpperCase();
}

function offerTimelineScaleMarkup(events = []) {
  const timed = (Array.isArray(events) ? events : []).filter((item) => cleanOfferTimeValue(item.time));
  if (!timed.length) return "";
  const minutes = timed.map((item) => offerTimeMinutesValue(item.time)).filter((value) => value != null);
  const minMinutes = Math.min(...minutes);
  const maxMinutes = Math.max(...minutes);
  const span = Math.max(60, maxMinutes - minMinutes);
  const points = timed.map((item, index) => {
    const value = offerTimeMinutesValue(item.time) ?? minMinutes;
    const left = timed.length === 1 ? 50 : Math.max(3, Math.min(97, ((value - minMinutes) / span) * 100));
    const palette = index % 3 === 1 ? "gold" : index % 3 === 2 ? "dark" : "red";
    return `
      <div class="scale-point" style="left:${left}%">
        <div class="scale-time">${escapeHtml(item.time)}</div>
        <div class="scale-dot is-${palette}"></div>
        <div class="scale-label">${escapeHtml(item.title || "Ereignis")}</div>
        ${item.note ? `<div class="scale-note">${escapeHtml(item.note)}</div>` : ""}
      </div>
    `;
  }).join("");
  return `
    <div class="scale-wrap">
      <div class="scale-line"></div>
      ${points}
    </div>
  `;
}

function printOfferDraft() {
  const draft = currentOfferDraftFromDom();
  const totals = offerTotals(draft);
  const bowling = offerBowlingPricing(draft.eventDate, draft.bowling);
  const buffetPricing = offerBuffetPricing(draft);
  const reservedAreaPricing = offerReservedAreaPricing(draft);
  const timelineEvents = offerTimelineEvents(draft);
  const timelineScale = offerTimelineScaleMarkup(timelineEvents);
  const templateBadge = offerTemplateBadgeLabel(draft);
  const includedTextBlocks = draft.textBlocks || {};
  const pricingNoticeText = includedTextBlocks.pricingNotice?.enabled ? includedTextBlocks.pricingNotice.text : "";
  const cancellationText = includedTextBlocks.cancellationTerms?.enabled ? includedTextBlocks.cancellationTerms.text : "";
  const reservationText = includedTextBlocks.reservationConfirmation?.enabled ? includedTextBlocks.reservationConfirmation.text : "";
  const vatNoticeText = includedTextBlocks.vatNotice?.enabled ? includedTextBlocks.vatNotice.text : "";
  const win = window.open("", "_blank", "width=1100,height=1400");
  if (!win) {
    showToast("Popup wurde blockiert. Bitte Popups erlauben.");
    return;
  }
  const buffetSections = OFFER_CATEGORY_ORDER.map((category) => {
    const items = draft.buffet?.categories?.[category] || [];
    if (!items.length) return "";
    return `
      <div class="offer-print-buffet-group">
        <h4>${escapeHtml(OFFER_CATEGORY_LABELS[category] || category)}</h4>
        <ul>${items.map((item) => `<li>${escapeHtml(item.name)}${item.note ? `<span>${escapeHtml(item.note)}</span>` : ""}</li>`).join("")}</ul>
      </div>
    `;
  }).filter(Boolean).join("");
  const timeline = timelineEvents.map((item) => `
    <tr>
      <td>${escapeHtml(item.time || "—")}</td>
      <td>${escapeHtml(item.title || "—")}</td>
      <td>${escapeHtml(item.note || "")}</td>
    </tr>
  `).join("");
  const costs = (draft.costs || []).map((item) => `
    <tr>
      <td>${escapeHtml(item.label || "—")}</td>
      <td>${escapeHtml(item.quantity || 0)}</td>
      <td>${formatMoney(item.unitPrice || 0)}</td>
      <td>${formatMoney((cleanOfferMoneyValue(item.quantity) * cleanOfferMoneyValue(item.unitPrice)))}</td>
    </tr>
  `).join("");
  const bowlingBox = (draft.bowling?.tournamentPackage || draft.bowling?.lanes || draft.bowling?.shoePersons || draft.bowling?.fromTime || draft.bowling?.toTime)
    ? `<div class="box">
          <h2>Bowling</h2>
          <div class="grid">
            <div class="kv"><strong>Turnierpaket</strong>${escapeHtml(bowling.tournamentPackageLabel || "-")}</div>
            <div class="kv"><strong>Bahnen</strong>${escapeHtml(String(draft.bowling?.lanes || 0))}</div>
            <div class="kv"><strong>Leihschuhe Personen</strong>${escapeHtml(String(draft.bowling?.shoePersons || 0))}</div>
            <div class="kv"><strong>Spielzeit</strong>${escapeHtml(draft.bowling?.fromTime || "-")} bis ${escapeHtml(draft.bowling?.toTime || "-")}</div>
            <div class="kv"><strong>Spieldauer</strong>${escapeHtml(bowling.durationLabel)}</div>
            <div class="kv"><strong>Öffnungszeit</strong>${escapeHtml(bowling.openingHours || "-")}</div>
            <div class="kv"><strong>Bowling gesamt</strong>${formatMoney(bowling.total)}</div>
          </div>
          ${bowling.tournamentPackageDescription ? `<p class="muted">${escapeHtml(bowling.tournamentPackageDescription)}</p>` : ""}
          <p class="muted">${escapeHtml(bowling.rateLabel)}</p>
          ${bowling.warning ? `<p class="muted">${escapeHtml(bowling.warning)}</p>` : ""}
        </div>`
    : "";
  const bowlingCostRows = bowling.laneCost > 0 || bowling.shoeCost > 0 || bowling.tournamentCost > 0
    ? `
      ${bowling.laneCost > 0 ? `<tr><td>Bowling Bahnen</td><td>${escapeHtml(`${draft.bowling?.lanes || 0} Bahn(en) · ${bowling.durationLabel}`)}</td><td>laut Tarif</td><td>${formatMoney(bowling.laneCost)}</td></tr>` : ""}
      ${bowling.shoeCost > 0 ? `<tr><td>Leihschuhe</td><td>${escapeHtml(String(draft.bowling?.shoePersons || 0))}</td><td>${formatMoney(OFFER_BOWLING_SHOE_PRICE)}</td><td>${formatMoney(bowling.shoeCost)}</td></tr>` : ""}
      ${bowling.tournamentCost > 0 ? `<tr><td>${escapeHtml(bowling.tournamentPackageLabel || "Turnierpaket")}</td><td>${escapeHtml(bowling.tournamentPackageDescription || "Zusatzpaket")}</td><td>pauschal</td><td>${formatMoney(bowling.tournamentCost)}</td></tr>` : ""}
    `
    : "";
  const buffetCostRows = buffetPricing.buffetBaseTotal > 0 || buffetPricing.sparklingReceptionTotal > 0
    ? `
      ${buffetPricing.adults > 0 && buffetPricing.pricePerPerson > 0 ? `<tr><td>Buffet Erwachsene</td><td>${escapeHtml(String(buffetPricing.adults))}</td><td>${formatMoney(buffetPricing.pricePerPerson)}</td><td>${formatMoney(buffetPricing.adults * buffetPricing.pricePerPerson)}</td></tr>` : ""}
      ${buffetPricing.children > 0 && buffetPricing.pricePerPerson > 0 ? `<tr><td>Buffet Kinder unter 12</td><td>${escapeHtml(String(buffetPricing.children))}</td><td>${formatMoney(buffetPricing.pricePerPerson * OFFER_CHILD_DISCOUNT_FACTOR)}</td><td>${formatMoney(buffetPricing.children * buffetPricing.pricePerPerson * OFFER_CHILD_DISCOUNT_FACTOR)}</td></tr>` : ""}
      ${draft.buffet?.sparklingReception && buffetPricing.adults > 0 ? `<tr><td>Sektempfang Erwachsene</td><td>${escapeHtml(String(buffetPricing.adults))}</td><td>${formatMoney(OFFER_SPARKLING_RECEPTION_PRICE)}</td><td>${formatMoney(buffetPricing.adults * OFFER_SPARKLING_RECEPTION_PRICE)}</td></tr>` : ""}
      ${draft.buffet?.sparklingReception && buffetPricing.children > 0 ? `<tr><td>Sektempfang Kinder unter 12</td><td>${escapeHtml(String(buffetPricing.children))}</td><td>${formatMoney(OFFER_SPARKLING_RECEPTION_PRICE * OFFER_CHILD_DISCOUNT_FACTOR)}</td><td>${formatMoney(buffetPricing.children * OFFER_SPARKLING_RECEPTION_PRICE * OFFER_CHILD_DISCOUNT_FACTOR)}</td></tr>` : ""}
    `
    : "";
  const reservedAreaCostRows = reservedAreaPricing.roomFee > 0 || reservedAreaPricing.campfireFee > 0
    ? `
      ${reservedAreaPricing.roomFee > 0 ? `<tr><td>${escapeHtml(reservedAreaPricing.roomFeeLabel || "Raummiete")}</td><td>1</td><td>${formatMoney(reservedAreaPricing.roomFee)}</td><td>${formatMoney(reservedAreaPricing.roomFee)}</td></tr>` : ""}
      ${reservedAreaPricing.campfireFee > 0 ? `<tr><td>Lagerfeuerstelle mit Feuerholz</td><td>1</td><td>${formatMoney(OFFER_CAMPFIRE_PRICE)}</td><td>${formatMoney(reservedAreaPricing.campfireFee)}</td></tr>` : ""}
    `
    : "";
  const personsSummary = totals.children ? `${totals.adults} + ${totals.children} Kinder` : `${totals.personCount || 0}`;
  const venueInfo = [reservedAreaPricing.reservedAreaLabel, draft.additionalInfo].filter(Boolean).join("\n\n");
  win.document.write(`
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Angebot ${escapeHtml(draft.customerName || draft.title || "")}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; color: #161616; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sheet { width: 210mm; min-height: 297mm; height: 297mm; padding: 0 11mm 8mm; position: relative; background: #fff; display: flex; flex-direction: column; gap: 4.5mm; overflow: hidden; }
          .sheet + .sheet { page-break-before: always; margin-top: 0; }
          .header { margin: 0 -11mm 6mm; height: 43mm; display: grid; grid-template-columns: 1.42fr 0.88fr; overflow: hidden; }
          .header-left { position: relative; background: linear-gradient(135deg, #111 0%, #1f1f1f 60%, #151515 100%); color: #fff; padding: 9mm 9mm 6mm 11mm; }
          .header-left::before { content: ""; position: absolute; inset: 0; background:
            linear-gradient(130deg, transparent 0 42%, rgba(168,136,72,0.22) 42% 49%, transparent 49% 100%),
            repeating-linear-gradient(130deg, transparent 0 18px, rgba(255,255,255,0.08) 18px 20px, transparent 20px 60px); pointer-events: none; }
          .header-left > * { position: relative; z-index: 1; }
          .header-right { position: relative; background: #b8202c; color: #fff; padding: 9mm 11mm 6mm 8mm; clip-path: polygon(16% 0, 100% 0, 100% 100%, 0 100%); display: flex; flex-direction: column; justify-content: flex-start; }
          .header-logo { width: 74mm; max-width: 100%; filter: brightness(0) invert(1); }
          .header-contact { margin-top: 6mm; font-size: 10px; letter-spacing: 0.02em; }
          .header-offer-title { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
          .header-offer-date { margin-top: 4mm; font-size: 10px; }
          .page-title { margin: 0 0 2mm; font-size: 22px; font-weight: 700; }
          .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 4.5mm; }
          .template-card { border: 1px solid #ddd3c8; border-radius: 6mm; padding: 4.5mm 5mm; background: #fff; page-break-inside: avoid; }
          .template-card + .template-card { margin-top: 4.5mm; }
          .section-title { display: flex; align-items: center; gap: 8px; margin: 0 0 3mm; font-size: 14px; font-weight: 700; }
          .section-title::before { content: ""; width: 6px; height: 24px; border-radius: 4px; background: linear-gradient(180deg, #ef4d59 0%, #be1d2b 100%); display: inline-block; flex: none; }
          .muted { color: #6d6b68; }
          .event-grid { display: grid; grid-template-columns: 100px 1fr; row-gap: 4px; column-gap: 10px; font-size: 11px; }
          .event-grid strong { color: #77716a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; }
          .scale-wrap { position: relative; margin-top: 3mm; min-height: 42mm; padding: 7mm 3mm 0; }
          .scale-line { position: absolute; left: 4%; right: 4%; top: 20mm; height: 2px; background: #c8a764; }
          .scale-point { position: absolute; top: 0; transform: translateX(-50%); width: 27mm; text-align: center; }
          .scale-time { font-size: 10px; font-weight: 700; margin-bottom: 7mm; }
          .scale-dot { width: 8mm; height: 8mm; border-radius: 999px; margin: 0 auto 5mm; border: 3px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); }
          .scale-dot.is-red { background: #be1d2b; }
          .scale-dot.is-gold { background: #c8a764; }
          .scale-dot.is-dark { background: #111; }
          .scale-label { font-size: 10px; font-weight: 700; }
          .scale-note { margin-top: 2px; font-size: 9px; color: #6d6b68; line-height: 1.3; }
          .buffet-layout { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4mm; align-items: start; }
          .buffet-col h4 { margin: 0 0 2mm; font-size: 12px; text-align: center; }
          .buffet-col ul { list-style: none; margin: 0; padding: 0; font-size: 10px; line-height: 1.45; text-align: center; }
          .buffet-col li + li { margin-top: 2.5mm; }
          .buffet-col span { display: block; font-size: 9px; color: #6d6b68; }
          .buffet-meta { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 3mm; }
          .buffet-badge { padding: 2.5mm 8mm; border-radius: 999px; background: #efe7da; color: #7c6962; font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; }
          .price-pill { margin-top: 4mm; text-align: right; font-size: 10px; font-weight: 700; }
          .price-pill small { display: block; font-size: 9px; color: #6d6b68; font-weight: 400; }
          .details-copy { white-space: pre-line; font-size: 10px; line-height: 1.45; }
          .footer { margin-top: auto; padding-top: 3mm; border-top: 1px solid #ddd3c8; display: flex; justify-content: space-between; font-size: 9px; color: #6d6b68; }
          .cost-card { margin-top: 0; }
          .cost-table { width: 100%; border-collapse: collapse; margin-top: 3mm; font-size: 11px; }
          .cost-table th { text-align: left; font-size: 10px; text-transform: uppercase; color: #77716a; padding: 0 0 2.5mm; }
          .cost-table td { padding: 1.5mm 0; vertical-align: top; border-bottom: 1px solid #f0ebe3; }
          .cost-table td:last-child, .cost-table th:last-child { text-align: right; }
          .cost-table td:nth-child(2), .cost-table th:nth-child(2),
          .cost-table td:nth-child(3), .cost-table th:nth-child(3) { text-align: center; }
          .cost-note { margin-top: 3mm; font-size: 9px; color: #6d6b68; }
          .total-line { margin-top: 5mm; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 700; }
          .big-heading { margin: 1mm 0 3mm; font-size: 22px; font-weight: 700; }
          .summary-strip { width: 100%; margin: 0 0 4mm; display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid #ddd3c8; border-radius: 5mm; overflow: hidden; }
          .summary-strip > div { padding: 3mm 4mm; text-align: center; }
          .summary-strip > div + div { border-left: 1px solid #e7ded2; }
          .summary-strip small { display: block; font-size: 9px; color: #77716a; text-transform: uppercase; margin-bottom: 1.5mm; }
          .summary-strip strong { font-size: 10px; }
          .info-card { border: 1px solid #ddd3c8; border-radius: 5mm; padding: 4mm 5mm; margin: 0 0 4mm; width: 100%; }
          .info-card p { margin: 0; white-space: pre-line; font-size: 10px; line-height: 1.45; }
          .signature-card { width: 100%; margin: 0 0 4mm; border: 1px solid #ddd3c8; border-radius: 5mm; padding: 4mm 5mm 6mm; }
          .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; margin-top: 8mm; }
          .signature-line { border-top: 1px solid #9f9b96; padding-top: 2mm; font-size: 9px; color: #6d6b68; min-height: 13mm; }
          .closing { width: 100%; margin: 2mm 0 0; font-size: 10px; }
          .closing strong { display: block; margin-top: 2mm; font-size: 13px; color: #161616; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="header-left">
              <img class="header-logo" src="/la-bowling-print-logo.png" alt="LA Bowling">
              <div class="header-contact">LA-Bowling · Röntgenstr. 12 · 84030 Landshut</div>
            </div>
            <div class="header-right">
              <h1 class="header-offer-title">Angebot</h1>
              <div class="header-offer-date">Angebotsdatum: ${escapeHtml(draft.offerDate ? formatDate(draft.offerDate) : "-")}</div>
            </div>
          </div>
          <h2 class="page-title">Angebot</h2>
          <div class="grid-two">
            <section class="template-card">
              <h3 class="section-title">Kunde</h3>
              <div class="details-copy">${escapeHtml(draft.customerName || "-")}${draft.customerContact ? `\n${escapeHtml(draft.customerContact)}` : ""}${draft.customerEmail ? `\n${escapeHtml(draft.customerEmail)}` : ""}${draft.customerPhone ? `\n${escapeHtml(draft.customerPhone)}` : ""}</div>
            </section>
            <section class="template-card">
              <h3 class="section-title">Veranstaltung</h3>
              <div class="event-grid">
                <strong>Datum</strong><span>${escapeHtml(draft.eventDate ? formatDate(draft.eventDate) : "-")}</span>
                <strong>Anlass</strong><span>${escapeHtml(draft.occasion || "-")}</span>
                <strong>Personen</strong><span>${escapeHtml(personsSummary)}</span>
                <strong>Bowling</strong><span>${escapeHtml(draft.bowling?.fromTime || "-")}${draft.bowling?.toTime ? ` - ${escapeHtml(draft.bowling?.toTime)}` : ""}</span>
                <strong>Essen</strong><span>${escapeHtml(draft.mealTime || "offen")}</span>
              </div>
            </section>
          </div>
          ${timelineScale ? `<section class="template-card"><h3 class="section-title">Ablauf</h3>${timelineScale}</section>` : ""}
          <section class="template-card">
            <div class="buffet-meta">
              <h3 class="section-title">Buffet</h3>
              ${templateBadge ? `<span class="buffet-badge">${escapeHtml(templateBadge)}</span>` : ""}
            </div>
            ${draft.buffet?.name ? `<p class="muted">${escapeHtml(draft.buffet.name)}</p>` : ""}
            <div class="buffet-layout">
              ${OFFER_CATEGORY_ORDER.map((category) => {
                const items = draft.buffet?.categories?.[category] || [];
                if (!items.length) return "";
                return `
                  <div class="buffet-col">
                    <h4>${escapeHtml(OFFER_CATEGORY_LABELS[category] || category)}</h4>
                    <ul>${items.map((item) => `<li>${escapeHtml(item.name)}${item.note ? `<span>${escapeHtml(item.note)}</span>` : ""}</li>`).join("")}</ul>
                  </div>
                `;
              }).filter(Boolean).join("")}
            </div>
            <div class="price-pill">${formatMoney(draft.buffet?.pricePerPerson || 0)}<small>pro Person</small></div>
          </section>
          <section class="template-card">
            <h3 class="section-title">Exklusiv für Sie reserviert</h3>
            <div class="details-copy">${escapeHtml(venueInfo || "-")}</div>
            ${draft.reservedAreaCampfire ? `<p class="muted" style="margin-top:4mm;">Lagerfeuerstelle mit Feuerholz ist zusätzlich gebucht.</p>` : ""}
          </section>
          <div class="footer">
            <span>LA Bowling · Röntgenstr. 12 · 84030 Landshut</span>
            <span>Seite 1 von 2</span>
          </div>
        </div>
        <div class="sheet">
          <div class="header">
            <div class="header-left">
              <img class="header-logo" src="/la-bowling-print-logo.png" alt="LA Bowling">
              <div class="header-contact">LA-Bowling · Röntgenstr. 12 · 84030 Landshut</div>
            </div>
            <div class="header-right">
              <h1 class="header-offer-title">Angebot</h1>
            </div>
          </div>
          <section class="template-card cost-card">
            <h3 class="section-title">Kostenübersicht</h3>
            <table class="cost-table">
              <thead><tr><th>Position</th><th>Menge</th><th>Einzel</th><th>Gesamt</th></tr></thead>
              <tbody>
                ${buffetCostRows}
                ${bowlingCostRows}
                ${reservedAreaCostRows}
                ${costs}
              </tbody>
            </table>
            ${vatNoticeText ? `<div class="cost-note">${escapeHtml(vatNoticeText)}</div>` : ""}
            <div class="total-line"><span>Gesamt:</span><span>${formatMoney(totals.total)}</span></div>
          </section>
          <h2 class="big-heading">Hinweise & Reservierungsbestätigung</h2>
          <div class="summary-strip">
            <div><small>Datum</small><strong>${escapeHtml(draft.eventDate ? formatDate(draft.eventDate) : "-")}</strong></div>
            <div><small>Personen</small><strong>${escapeHtml(personsSummary)}</strong></div>
            <div><small>Gesamtsumme</small><strong>${formatMoney(totals.total)}</strong></div>
          </div>
          ${pricingNoticeText ? `<section class="info-card"><h3 class="section-title">${escapeHtml(includedTextBlocks.pricingNotice.label)}</h3><p>${escapeHtml(pricingNoticeText)}</p></section>` : ""}
          ${cancellationText ? `<section class="info-card"><h3 class="section-title">${escapeHtml(includedTextBlocks.cancellationTerms.label)}</h3><p>${escapeHtml(cancellationText)}</p></section>` : ""}
          ${reservationText ? `<section class="info-card"><h3 class="section-title">${escapeHtml(includedTextBlocks.reservationConfirmation.label)}</h3><p>${escapeHtml(reservationText)}</p></section>` : ""}
          <section class="signature-card">
            <h3 class="section-title">Bestätigung</h3>
            <div class="signature-grid">
              <div class="signature-line">Ort, Datum</div>
              <div class="signature-line">Unterschrift / Firmenstempel</div>
            </div>
          </section>
          <div class="closing">
            <div>Mit freundlichen Grüßen</div>
            <strong>Christian Poschenrieder</strong>
            <div class="muted">Geschäftsleitung</div>
          </div>
          <div class="footer">
            <span>LA Bowling · Röntgenstr. 12 · 84030 Landshut</span>
            <span>Seite 2 von 2</span>
          </div>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
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
  renderTerminalTablePlan(dateKey, report, reportClosed);
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
  $("#terminalTablesSection")?.classList.toggle("hidden", active !== "tables");
  $("#terminalServiceSection")?.classList.toggle("hidden", active !== "service");
  $("#terminalFinanceSection")?.classList.toggle("hidden", active !== "finance");
  $("#terminalTipsSection")?.classList.toggle("hidden", active !== "tips");
  $("#dayReportPrintArea")?.classList.toggle("hidden", active !== "report");
}

function normalizeTerminalTableConfig(value = {}) {
  const customTables = (Array.isArray(value?.customTables) ? value.customTables : [])
    .map((item) => normalizeTerminalTableCustom(item))
    .filter((item) => item.id);
  const allowedIds = new Set([...Object.keys(TERMINAL_TABLE_LOOKUP), ...customTables.map((item) => item.id)]);
  const seatsByTable = {};
  const tableOverrides = {};
  const zoneOverrides = {};
  if (value?.tableOverrides && typeof value.tableOverrides === "object" && !Array.isArray(value.tableOverrides)) {
    Object.entries(value.tableOverrides).forEach(([tableId, entry]) => {
      const id = cleanTerminalRawTableId(tableId);
      if (!id || !Object.prototype.hasOwnProperty.call(TERMINAL_TABLE_LOOKUP, id)) return;
      const normalized = normalizeTerminalTableCustom({ id, ...(entry || {}) });
      if (!normalized.id) return;
      tableOverrides[id] = normalized;
    });
  }
  if (value?.seatsByTable && typeof value.seatsByTable === "object" && !Array.isArray(value.seatsByTable)) {
    Object.entries(value.seatsByTable).forEach(([tableId, seats]) => {
      const id = cleanTerminalRawTableId(tableId);
      const people = cleanTerminalTablePeople(seats);
      if (id && people && allowedIds.has(id)) seatsByTable[id] = people;
    });
  }
  if (value?.zoneOverrides && typeof value.zoneOverrides === "object" && !Array.isArray(value.zoneOverrides)) {
    Object.entries(value.zoneOverrides).forEach(([zoneId, entry]) => {
      const id = cleanTerminalTableZoneId(zoneId);
      if (!id || !Object.prototype.hasOwnProperty.call(TERMINAL_TABLE_ZONE_LOOKUP, id)) return;
      const normalized = normalizeTerminalTableZone({ id, ...(entry || {}) });
      if (!normalized.id) return;
      zoneOverrides[id] = normalized;
    });
  }
  return { seatsByTable, tableOverrides, customTables, zoneOverrides };
}

function cleanTerminalRawTableId(value) {
  const id = String(value || "").trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9_-]{0,15}$/.test(id) ? id : "";
}

function cleanTerminalPercent(value, min = 0, max = 100) {
  const number = Number(String(value ?? "").replace(",", "."));
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number * 10) / 10));
}

function normalizeTerminalTableCustom(value = {}) {
  const id = cleanTerminalRawTableId(value.id);
  return {
    id,
    label: String(value.label || "").trim().slice(0, 60) || id,
    area: String(value.area || "").trim().slice(0, 80),
    seats: cleanTerminalTablePeople(value.seats),
    x: cleanTerminalPercent(value.x, 0, 96),
    y: cleanTerminalPercent(value.y, 0, 96),
    w: cleanTerminalPercent(value.w, 2, 40),
    h: cleanTerminalPercent(value.h, 2, 30),
    shape: ["table", "room", "lane"].includes(String(value.shape || "").trim()) ? String(value.shape).trim() : "table"
  };
}

function cleanTerminalTableZoneId(value) {
  return String(value || "").trim().slice(0, 32);
}

function cleanTerminalTableZoneClass(value) {
  return ["is-lanes", "is-room", "is-open"].includes(String(value || "").trim()) ? String(value).trim() : "is-open";
}

function cleanTerminalTableBoolean(value, fallback = true) {
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return fallback;
}

function normalizeTerminalTableZone(value = {}) {
  const id = cleanTerminalTableZoneId(value.id);
  return {
    id,
    label: String(value.label || "").trim().slice(0, 60) || id,
    x: cleanTerminalPercent(value.x, 0, 98),
    y: cleanTerminalPercent(value.y, 0, 98),
    w: cleanTerminalPercent(value.w, 4, 98),
    h: cleanTerminalPercent(value.h, 4, 98),
    className: cleanTerminalTableZoneClass(value.className),
    visible: cleanTerminalTableBoolean(value.visible, true)
  };
}

function terminalVisibleTableLayout(config = state.terminalTableConfig) {
  const tableOverrides = config?.tableOverrides || {};
  const customTables = Array.isArray(config?.customTables) ? config.customTables : [];
  return [...TERMINAL_TABLE_LAYOUT.map((table) => ({ ...table, ...(tableOverrides[table.id] || {}) })), ...customTables]
    .map((table) => ({
      ...table,
      x: cleanTerminalPercent(table.x, 0, 96),
      y: cleanTerminalPercent(table.y, 0, 96),
      w: cleanTerminalPercent(table.w, 2, 40),
      h: cleanTerminalPercent(table.h, 2, 30)
    }))
    .sort((left, right) => {
      const topCompare = Number(left.y || 0) - Number(right.y || 0);
      if (Math.abs(topCompare) > 0.1) return topCompare;
      const leftCompare = Number(left.x || 0) - Number(right.x || 0);
      if (Math.abs(leftCompare) > 0.1) return leftCompare;
      return String(left.id || "").localeCompare(String(right.id || ""), "de", { numeric: true });
    });
}

function terminalVisibleZones(config = state.terminalTableConfig, options = {}) {
  const zoneOverrides = config?.zoneOverrides || {};
  const includeHidden = options.includeHidden === true;
  return TERMINAL_TABLE_ZONES
    .map((zone) => ({ ...zone, ...(zoneOverrides[zone.id] || {}) }))
    .filter((zone) => includeHidden || zone.visible !== false);
}

function terminalTableLookup(config = state.terminalTableConfig) {
  return Object.fromEntries(terminalVisibleTableLayout(config).map((table) => [table.id, table]));
}

function terminalTableSeats(id) {
  const tableId = cleanTerminalTableId(id);
  const overrideSeats = Number(state.terminalTableConfig?.tableOverrides?.[tableId]?.seats || 0);
  if (overrideSeats > 0) return overrideSeats;
  const configured = Number(state.terminalTableConfig?.seatsByTable?.[tableId] || 0);
  if (configured > 0) return configured;
  return Number(terminalTableLookup()[tableId]?.seats || 0);
}

function cleanTerminalColor(value) {
  const color = String(value || "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(color) ? color : TERMINAL_TABLE_STAFF_COLOR_PRESETS[0];
}

function terminalColorToRgba(color, alpha = 1) {
  const clean = cleanTerminalColor(color).slice(1);
  const red = Number.parseInt(clean.slice(0, 2), 16);
  const green = Number.parseInt(clean.slice(2, 4), 16);
  const blue = Number.parseInt(clean.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0, Math.min(1, alpha))})`;
}

function terminalTableStaffPreset(id) {
  return TERMINAL_TABLE_STAFF_PRESET_LOOKUP[String(id || "").trim()] || null;
}

function terminalTableStaffPresetTableIds(presetId) {
  return sortTerminalTableIds(terminalTableStaffPreset(presetId)?.tableIds || []);
}

function terminalTableStaffPresetRect(presetId) {
  const tableIds = terminalTableStaffPresetTableIds(presetId);
  if (!tableIds.length) return null;
  const rects = tableIds.map((tableId) => terminalTableRect(tableId)).filter(Boolean);
  if (!rects.length) return null;
  const padding = tableIds.length === 1 ? 1.3 : 1.8;
  const left = Math.max(0.5, Math.min(...rects.map((rect) => rect.left)) - padding);
  const top = Math.max(0.5, Math.min(...rects.map((rect) => rect.top)) - padding);
  const right = Math.min(99, Math.max(...rects.map((rect) => rect.right)) + padding);
  const bottom = Math.min(99, Math.max(...rects.map((rect) => rect.bottom)) + padding);
  return {
    left,
    top,
    width: Math.max(3, right - left),
    height: Math.max(3, bottom - top)
  };
}

function emptyTerminalTableStaffDraft(value = {}) {
  const assignment = normalizeTerminalTableStaffAssignment(value);
  return {
    id: assignment.id || "",
    employee: assignment.employee || "",
    presetId: assignment.presetId || "",
    color: assignment.color || TERMINAL_TABLE_STAFF_COLOR_PRESETS[0],
    note: assignment.note || "",
    createdAt: assignment.createdAt || "",
    updatedAt: assignment.updatedAt || ""
  };
}

function normalizeTerminalTableStaffAssignment(value = {}) {
  return {
    id: String(value.id || "").trim(),
    employee: String(value.employee || "").trim().slice(0, 160),
    presetId: String(value.presetId || "").trim().slice(0, 120),
    color: cleanTerminalColor(value.color),
    note: String(value.note || "").trim().slice(0, 240),
    createdAt: String(value.createdAt || "").trim(),
    updatedAt: String(value.updatedAt || "").trim()
  };
}

function normalizeTerminalTableStaffAssignments(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item) => normalizeTerminalTableStaffAssignment(item))
    .filter((item) => item.employee && terminalTableStaffPreset(item.presetId));
}

function terminalTableStaffAssignments(report = state.terminalReport) {
  return normalizeTerminalTableStaffAssignments(report?.tableStaffAssignments || []);
}

function terminalTableStaffAssignmentsByTable(assignments = []) {
  const map = new Map();
  normalizeTerminalTableStaffAssignments(assignments).forEach((assignment) => {
    terminalTableStaffPresetTableIds(assignment.presetId).forEach((tableId) => {
      const list = map.get(tableId) || [];
      list.push(assignment);
      map.set(tableId, list);
    });
  });
  return map;
}

function sortTerminalTableStaffAssignments(value = []) {
  return [...normalizeTerminalTableStaffAssignments(value)].sort((left, right) => {
    const presetCompare = String(terminalTableStaffPreset(left.presetId)?.label || left.presetId || "").localeCompare(
      String(terminalTableStaffPreset(right.presetId)?.label || right.presetId || ""),
      "de",
      { numeric: true }
    );
    if (presetCompare) return presetCompare;
    return String(left.employee || "").localeCompare(String(right.employee || ""), "de");
  });
}

function terminalTableEmployeeMeta(dateKey) {
  const byEmployee = new Map();
  assignmentEmployeeRowsForDate(dateKey).forEach((row) => {
    byEmployee.set(row.employee, {
      employee: row.employee,
      positions: [...(row.positions || [])],
      time: row.time || assignmentTimeForEmployee(dateKey, row.employee, assignmentScheduleForDate(dateKey))
    });
  });
  Object.entries(assignmentScheduleForDate(dateKey) || {}).forEach(([position, employee]) => {
    if (!employee || position.includes("__")) return;
    const current = byEmployee.get(employee) || {
      employee,
      positions: [],
      time: assignmentTimeForEmployee(dateKey, employee, assignmentScheduleForDate(dateKey))
    };
    if (!current.positions.includes(position)) current.positions.push(position);
    byEmployee.set(employee, current);
  });
  terminalEmployeesForDay(dateKey).forEach((employee) => {
    if (!byEmployee.has(employee)) {
      byEmployee.set(employee, {
        employee,
        positions: [],
        time: assignmentTimeForEmployee(dateKey, employee, assignmentScheduleForDate(dateKey))
      });
    }
  });
  return new Map([...byEmployee.entries()].sort((left, right) => left[0].localeCompare(right[0], "de")));
}

function terminalTableEmployeeOptionLabel(meta = {}) {
  const positions = Array.isArray(meta.positions) && meta.positions.length ? meta.positions.join(", ") : "ohne Bereich";
  const from = meta.time?.from ? `ab ${meta.time.from}` : "Start offen";
  return `${meta.employee} · ${positions} · ${from}`;
}

function syncTerminalTableStaffDraftFromReport(report = state.terminalReport) {
  const assignments = terminalTableStaffAssignments(report);
  if (!state.terminalTableStaffDraft) {
    state.terminalTableStaffDraft = emptyTerminalTableStaffDraft();
    return;
  }
  const draft = emptyTerminalTableStaffDraft(state.terminalTableStaffDraft);
  if (!draft.id) {
    state.terminalTableStaffDraft = draft;
    return;
  }
  const match = assignments.find((item) => item.id === draft.id);
  state.terminalTableStaffDraft = match ? emptyTerminalTableStaffDraft(match) : emptyTerminalTableStaffDraft();
}

function resetTerminalTableStaffDraft() {
  state.terminalTableStaffDraft = emptyTerminalTableStaffDraft();
}

function loadTerminalTableStaffDraft(id) {
  const assignment = terminalTableStaffAssignments().find((item) => item.id === id);
  state.terminalTableStaffDraft = assignment ? emptyTerminalTableStaffDraft(assignment) : emptyTerminalTableStaffDraft();
}

function updateTerminalTableStaffField(field, value) {
  const draft = emptyTerminalTableStaffDraft(state.terminalTableStaffDraft || {});
  draft[field] = field === "color" ? cleanTerminalColor(value) : String(value || "");
  state.terminalTableStaffDraft = emptyTerminalTableStaffDraft(draft);
}

function currentTerminalTableStaffPayload() {
  const draft = emptyTerminalTableStaffDraft(state.terminalTableStaffDraft || {});
  return {
    ...draft,
    color: cleanTerminalColor(draft.color)
  };
}

function terminalTableDef(id) {
  const tableId = cleanTerminalTableId(id);
  const base = terminalTableLookup()[tableId];
  if (!base) return null;
  return { ...base, seats: terminalTableSeats(tableId) };
}

function terminalCustomTableById(id) {
  const tableId = cleanTerminalRawTableId(id);
  return (state.terminalTableConfig?.customTables || []).find((item) => item.id === tableId) || null;
}

function baseTerminalTableById(id) {
  const tableId = cleanTerminalRawTableId(id);
  return TERMINAL_TABLE_LOOKUP[tableId] || null;
}

function terminalZoneDef(id, config = state.terminalTableConfig) {
  const zoneId = cleanTerminalTableZoneId(id);
  if (!zoneId || !Object.prototype.hasOwnProperty.call(TERMINAL_TABLE_ZONE_LOOKUP, zoneId)) return null;
  return { ...TERMINAL_TABLE_ZONE_LOOKUP[zoneId], ...(config?.zoneOverrides?.[zoneId] || {}) };
}

function adminTablePlanHasOverride(id) {
  const tableId = cleanTerminalRawTableId(id);
  return Boolean(tableId && state.terminalTableConfig?.tableOverrides?.[tableId]);
}

function adminTablePlanZoneHasOverride(id) {
  const zoneId = cleanTerminalTableZoneId(id);
  return Boolean(zoneId && state.terminalTableConfig?.zoneOverrides?.[zoneId]);
}

function emptyAdminTablePlanDraft(value = {}) {
  const table = normalizeTerminalTableCustom(value);
  const originalId = cleanTerminalRawTableId(value.originalId || table.id || "");
  const customTable = terminalCustomTableById(originalId || table.id || "");
  const baseTable = Boolean(value.baseTable ?? (baseTerminalTableById(originalId || table.id || "") && !customTable));
  return {
    originalId,
    baseTable,
    id: table.id || "",
    label: table.label || "",
    area: table.area || "",
    seats: table.seats ? String(table.seats) : "",
    shape: table.shape || "table",
    x: Number.isFinite(Number(table.x)) ? String(table.x) : "",
    y: Number.isFinite(Number(table.y)) ? String(table.y) : "",
    w: Number.isFinite(Number(table.w)) ? String(table.w) : "",
    h: Number.isFinite(Number(table.h)) ? String(table.h) : ""
  };
}

function resetAdminTablePlanDraft() {
  state.adminTablePlanDraft = emptyAdminTablePlanDraft();
}

function emptyAdminTablePlanZoneDraft(value = {}) {
  const zone = normalizeTerminalTableZone(value);
  const originalId = cleanTerminalTableZoneId(value.originalId || zone.id || "");
  return {
    originalId,
    id: zone.id || "",
    label: zone.label || "",
    x: Number.isFinite(Number(zone.x)) ? String(zone.x) : "",
    y: Number.isFinite(Number(zone.y)) ? String(zone.y) : "",
    w: Number.isFinite(Number(zone.w)) ? String(zone.w) : "",
    h: Number.isFinite(Number(zone.h)) ? String(zone.h) : "",
    className: zone.className || "is-open",
    visible: zone.visible !== false
  };
}

function resetAdminTablePlanZoneDraft() {
  state.adminTablePlanZoneDraft = emptyAdminTablePlanZoneDraft();
}

function loadAdminTablePlanDraft(id) {
  const tableId = cleanTerminalRawTableId(id);
  const merged = terminalTableDef(tableId);
  const custom = terminalCustomTableById(tableId);
  const base = baseTerminalTableById(tableId);
  state.adminTablePlanDraft = merged
    ? emptyAdminTablePlanDraft({ ...merged, originalId: tableId, baseTable: Boolean(base && !custom) })
    : emptyAdminTablePlanDraft();
}

function loadAdminTablePlanZoneDraft(id) {
  const zoneId = cleanTerminalTableZoneId(id);
  const zone = terminalZoneDef(zoneId);
  state.adminTablePlanZoneDraft = zone
    ? emptyAdminTablePlanZoneDraft({ ...zone, originalId: zoneId })
    : emptyAdminTablePlanZoneDraft();
}

function updateAdminTablePlanField(field, value) {
  const draft = emptyAdminTablePlanDraft(state.adminTablePlanDraft || {});
  draft[field] = String(value || "");
  state.adminTablePlanDraft = emptyAdminTablePlanDraft(draft);
}

function updateAdminTablePlanZoneField(field, value) {
  const draft = emptyAdminTablePlanZoneDraft(state.adminTablePlanZoneDraft || {});
  draft[field] = field === "visible" ? cleanTerminalTableBoolean(value, true) : String(value || "");
  state.adminTablePlanZoneDraft = emptyAdminTablePlanZoneDraft(draft);
}

function adminTablePlanDraftPayload() {
  const draft = emptyAdminTablePlanDraft(state.adminTablePlanDraft || {});
  return {
    originalId: draft.originalId || draft.id || "",
    baseTable: Boolean(draft.baseTable),
    id: cleanTerminalRawTableId(draft.id),
    label: String(draft.label || "").trim(),
    area: String(draft.area || "").trim(),
    seats: cleanTerminalTablePeople(draft.seats),
    shape: ["table", "room", "lane"].includes(String(draft.shape || "").trim()) ? String(draft.shape).trim() : "table",
    x: cleanTerminalPercent(draft.x, 0, 96),
    y: cleanTerminalPercent(draft.y, 0, 96),
    w: cleanTerminalPercent(draft.w, 2, 40),
    h: cleanTerminalPercent(draft.h, 2, 30)
  };
}

function adminTablePlanZonePayload(draft = state.adminTablePlanZoneDraft || {}) {
  const current = emptyAdminTablePlanZoneDraft(draft);
  return {
    originalId: current.originalId || current.id || "",
    id: cleanTerminalTableZoneId(current.id || current.originalId),
    label: String(current.label || "").trim(),
    x: cleanTerminalPercent(current.x, 0, 98),
    y: cleanTerminalPercent(current.y, 0, 98),
    w: cleanTerminalPercent(current.w, 4, 98),
    h: cleanTerminalPercent(current.h, 4, 98),
    className: cleanTerminalTableZoneClass(current.className),
    visible: cleanTerminalTableBoolean(current.visible, true)
  };
}

function adminTablePlanPreviewTable(draft = state.adminTablePlanDraft || {}) {
  const current = emptyAdminTablePlanDraft(draft);
  const payload = adminTablePlanDraftPayload();
  if (!payload.id) return null;
  return {
    id: payload.id,
    originalId: current.originalId || "",
    baseTable: Boolean(current.baseTable),
    label: payload.label || payload.id,
    area: payload.area || "",
    seats: payload.seats || 0,
    x: payload.x,
    y: payload.y,
    w: payload.w,
    h: payload.h,
    shape: payload.shape || "table"
  };
}

function adminTablePlanVisibleLayout(draft = state.adminTablePlanDraft || {}) {
  const preview = adminTablePlanPreviewTable(draft);
  const layout = terminalVisibleTableLayout().map((table) => ({ ...table }));
  if (!preview) return layout;
  const replaceId = cleanTerminalRawTableId(preview.originalId || preview.id);
  let replaced = false;
  const next = layout.map((table) => {
    if (table.id !== replaceId && table.id !== preview.id) return table;
    replaced = true;
    return {
      ...table,
      ...preview,
      id: preview.id,
      label: preview.label,
      area: preview.area,
      seats: preview.seats,
      x: preview.x,
      y: preview.y,
      w: preview.w,
      h: preview.h,
      shape: preview.shape
    };
  });
  if (!replaced) {
    next.push({
      id: preview.id,
      label: preview.label,
      area: preview.area,
      seats: preview.seats,
      x: preview.x,
      y: preview.y,
      w: preview.w,
      h: preview.h,
      shape: preview.shape
    });
  }
  return next.sort((left, right) => {
    const topCompare = Number(left.y || 0) - Number(right.y || 0);
    if (Math.abs(topCompare) > 0.1) return topCompare;
    const leftCompare = Number(left.x || 0) - Number(right.x || 0);
    if (Math.abs(leftCompare) > 0.1) return leftCompare;
    return String(left.id || "").localeCompare(String(right.id || ""), "de", { numeric: true });
  });
}

function adminTablePlanVisibleZones(draft = state.adminTablePlanZoneDraft || {}) {
  const preview = adminTablePlanZonePayload(draft);
  return TERMINAL_TABLE_ZONES.map((baseZone) => {
    const merged = terminalZoneDef(baseZone.id) || baseZone;
    return preview.id === baseZone.id ? { ...merged, ...preview } : merged;
  });
}

function nextAdminTablePlanCopyId(sourceId = "") {
  const baseId = cleanTerminalRawTableId(sourceId) || "TISCH";
  const existingIds = new Set(terminalVisibleTableLayout().map((table) => table.id));
  for (let index = 1; index <= 99; index += 1) {
    const candidate = cleanTerminalRawTableId(`${baseId}-K${index}`);
    if (candidate && !existingIds.has(candidate)) return candidate;
  }
  return cleanTerminalRawTableId(`${baseId}-${Date.now().toString().slice(-4)}`) || "";
}

function duplicateAdminTablePlanDraft() {
  const currentId = cleanTerminalRawTableId(state.adminTablePlanDraft?.originalId || state.adminTablePlanDraft?.id || "");
  const source = terminalTableDef(currentId) || adminTablePlanDraftPayload();
  if (!source?.id && !source?.label) {
    showToast("Bitte zuerst einen Tisch auswählen.");
    return;
  }
  const copyId = nextAdminTablePlanCopyId(source.id || currentId || "TISCH");
  state.adminTablePlanDraft = emptyAdminTablePlanDraft({
    ...source,
    originalId: "",
    baseTable: false,
    id: copyId,
    label: `${String(source.label || copyId).trim()} Kopie`.slice(0, 60),
    x: cleanTerminalPercent(Number(source.x || 0) + 1.2, 0, 96),
    y: cleanTerminalPercent(Number(source.y || 0) + 1.2, 0, 96)
  });
  renderAdminTablePlan();
  showToast("Tisch kopiert. Jetzt neue ID prüfen und bei Bedarf Größe ziehen.");
}

async function quickEditAdminTablePlanField(tableId, field) {
  loadAdminTablePlanDraft(tableId);
  const current = emptyAdminTablePlanDraft(state.adminTablePlanDraft || {});
  if (!current.id && !current.originalId) return false;
  const targetId = current.originalId || current.id || "";
  let promptLabel = "";
  let currentValue = "";
  if (field === "label") {
    promptLabel = "Tischnummer oder Anzeige ändern";
    currentValue = current.label || current.id || "";
  } else if (field === "area") {
    promptLabel = "Bereich ändern";
    currentValue = current.area || "";
  } else if (field === "seats") {
    promptLabel = "Standard-Personenzahl ändern";
    currentValue = current.seats || String(terminalTableSeats(targetId) || 0);
  } else {
    return false;
  }
  const input = window.prompt(promptLabel, currentValue);
  if (input == null) return false;
  const nextValue = String(input || "").trim();
  if (field === "seats" && !cleanTerminalTablePeople(nextValue)) {
    showToast("Bitte eine gültige Personenzahl eingeben.");
    return false;
  }
  if (field !== "seats" && !nextValue) {
    showToast(field === "area" ? "Bitte einen Bereich eingeben." : "Bitte eine Tischnummer eingeben.");
    return false;
  }
  const nextDraft = {
    ...current,
    [field]: nextValue
  };
  const before = field === "seats" ? String(cleanTerminalTablePeople(currentValue) || 0) : String(currentValue || "");
  const after = field === "seats" ? String(cleanTerminalTablePeople(nextValue) || 0) : nextValue;
  if (before === after) {
    renderAdminTablePlan();
    return false;
  }
  state.adminTablePlanDraft = emptyAdminTablePlanDraft(nextDraft);
  renderAdminTablePlan();
  try {
    await saveAdminTablePlanEntry();
    return true;
  } catch (error) {
    loadAdminTablePlanDraft(targetId);
    renderAdminTablePlan();
    showError(error);
    return false;
  }
}

async function quickEditAdminTablePlanZoneField(zoneId, field = "label") {
  loadAdminTablePlanZoneDraft(zoneId);
  const current = emptyAdminTablePlanZoneDraft(state.adminTablePlanZoneDraft || {});
  if (!current.id && !current.originalId) return false;
  if (field !== "label") return false;
  const targetId = current.originalId || current.id || "";
  const input = window.prompt("Bereichsname ändern", current.label || current.id || "");
  if (input == null) return false;
  const nextValue = String(input || "").trim();
  if (!nextValue || nextValue === String(current.label || "").trim()) {
    renderAdminTablePlan();
    return false;
  }
  state.adminTablePlanZoneDraft = emptyAdminTablePlanZoneDraft({
    ...current,
    label: nextValue
  });
  renderAdminTablePlan();
  try {
    await saveAdminTablePlanZone();
    return true;
  } catch (error) {
    loadAdminTablePlanZoneDraft(targetId);
    renderAdminTablePlan();
    showError(error);
    return false;
  }
}

function beginAdminTablePlanInteraction(event, mode = "drag", entityId = "", entityType = "table") {
  if (!state.adminUnlocked) return;
  const canvas = $("#adminTablePlanBoard .table-plan-canvas");
  if (!canvas) return;
  let id = "";
  let origin = null;
  if (entityType === "zone") {
    id = cleanTerminalTableZoneId(entityId);
    const source = terminalZoneDef(id);
    if (!id || !source) return;
    state.adminTablePlanZoneDraft = emptyAdminTablePlanZoneDraft({ ...source, originalId: id });
    origin = adminTablePlanZonePayload();
  } else {
    id = cleanTerminalRawTableId(entityId);
    const source = terminalTableDef(id);
    if (!id || !source) return;
    const customTable = terminalCustomTableById(id);
    const baseTable = Boolean(baseTerminalTableById(id) && !customTable);
    state.adminTablePlanDraft = emptyAdminTablePlanDraft({ ...source, originalId: id, baseTable });
    origin = adminTablePlanDraftPayload();
  }
  const canvasRect = canvas.getBoundingClientRect();
  state.adminTablePlanInteraction = {
    entityType,
    mode,
    entityId: id,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    canvasWidth: Math.max(1, canvasRect.width || 1),
    canvasHeight: Math.max(1, canvasRect.height || 1),
    origin,
    moved: false
  };
  event.preventDefault();
}

function updateAdminTablePlanInteraction(event) {
  const interaction = state.adminTablePlanInteraction;
  if (!interaction || interaction.pointerId !== event.pointerId) return;
  const deltaX = ((event.clientX - interaction.startClientX) / interaction.canvasWidth) * 100;
  const deltaY = ((event.clientY - interaction.startClientY) / interaction.canvasHeight) * 100;
  if (!interaction.moved && (Math.abs(event.clientX - interaction.startClientX) > 3 || Math.abs(event.clientY - interaction.startClientY) > 3)) {
    interaction.moved = true;
  }
  const next = { ...interaction.origin };
  const minSize = interaction.entityType === "zone" ? 4 : 2;
  const maxWidth = 98 - Number(interaction.origin.x || 0);
  const maxHeight = 98 - Number(interaction.origin.y || 0);
  if (interaction.mode === "resize") {
    next.w = cleanTerminalPercent(Number(interaction.origin.w || 0) + deltaX, minSize, Math.max(minSize, maxWidth));
    next.h = cleanTerminalPercent(Number(interaction.origin.h || 0) + deltaY, minSize, Math.max(minSize, maxHeight));
    next.w = Math.min(next.w, Math.max(minSize, maxWidth));
    next.h = Math.min(next.h, Math.max(minSize, maxHeight));
  } else {
    next.x = cleanTerminalPercent(Number(interaction.origin.x || 0) + deltaX, 0, 98);
    next.y = cleanTerminalPercent(Number(interaction.origin.y || 0) + deltaY, 0, 98);
    next.x = Math.min(next.x, Math.max(0, 98 - Number(interaction.origin.w || 0)));
    next.y = Math.min(next.y, Math.max(0, 98 - Number(interaction.origin.h || 0)));
  }
  if (interaction.entityType === "zone") state.adminTablePlanZoneDraft = emptyAdminTablePlanZoneDraft(next);
  else state.adminTablePlanDraft = emptyAdminTablePlanDraft(next);
  renderAdminTablePlan();
}

async function endAdminTablePlanInteraction(event) {
  const interaction = state.adminTablePlanInteraction;
  if (!interaction || (event && interaction.pointerId !== event.pointerId)) return;
  if (interaction.moved) state.adminTablePlanSuppressClickUntil = Date.now() + 250;
  state.adminTablePlanInteraction = null;
  if (!interaction.moved) return;
  try {
    if (interaction.entityType === "zone") await saveAdminTablePlanZone();
    else await saveAdminTablePlanEntry();
  } catch (error) {
    if (interaction.entityType === "zone") loadAdminTablePlanZoneDraft(interaction.entityId);
    else loadAdminTablePlanDraft(interaction.entityId);
    renderAdminTablePlan();
    showError(error);
  }
}

function adminTablePlanSummaryText(draft = state.adminTablePlanDraft || {}) {
  const current = emptyAdminTablePlanDraft(draft);
  if (current.originalId && current.baseTable) return `Grundtisch ${current.originalId} bearbeiten`;
  if (current.originalId) return `Eigener Tisch ${current.originalId} bearbeiten`;
  if (current.id) return `Neuen Tisch ${current.id} anlegen`;
  return "Tisch auswählen oder neuen Tisch anlegen";
}

function adminTablePlanDraftSummaryHtml(draft = state.adminTablePlanDraft || {}) {
  const current = emptyAdminTablePlanDraft(draft);
  if (!current.id && !current.originalId) {
    return `<p class="hint">Tisch im Plan anklicken. Name, Bereich und Plätze direkt auf der Kachel ändern. Verschieben und Größe werden automatisch gespeichert.</p>`;
  }
  const effective = adminTablePlanPreviewTable(current) || terminalTableDef(current.id || current.originalId) || current;
  return `
    <article>
      <small>Typ</small>
      <strong>${current.baseTable ? "Grundtisch" : current.originalId ? "Eigener Tisch" : "Neuer Tisch"}</strong>
    </article>
    <article>
      <small>Bereich</small>
      <strong>${escapeHtml(effective.area || "-")}</strong>
    </article>
    <article>
      <small>Plätze</small>
      <strong>${escapeHtml(String(effective.seats || 0))}</strong>
    </article>
  `;
}

function adminTablePlanZoneSummaryText(draft = state.adminTablePlanZoneDraft || {}) {
  const current = emptyAdminTablePlanZoneDraft(draft);
  if (current.originalId) return `Bereich ${current.originalId} bearbeiten`;
  if (current.id) return `Bereich ${current.id} bearbeiten`;
  return "Bereich im Plan anklicken";
}

function adminTablePlanZoneSummaryHtml(draft = state.adminTablePlanZoneDraft || {}) {
  const current = emptyAdminTablePlanZoneDraft(draft);
  if (!current.id && !current.originalId) {
    return `<p class="hint">Bereich im Plan anklicken, Namen bestätigen und danach direkt im Plan verschieben oder in der Größe anpassen.</p>`;
  }
  const effective = terminalZoneDef(current.id || current.originalId) || current;
  const preview = adminTablePlanZonePayload(current);
  return `
    <article>
      <small>Typ</small>
      <strong>${escapeHtml(preview.className === "is-lanes" ? "Bahnen" : preview.className === "is-room" ? "Raum" : "Offener Bereich")}</strong>
    </article>
    <article>
      <small>Sichtbar</small>
      <strong>${preview.visible ? "Ja" : "Nein"}</strong>
    </article>
    <article>
      <small>Name</small>
      <strong>${escapeHtml(preview.label || effective.label || "-")}</strong>
    </article>
  `;
}

function adminTablePlanCustomListHtml(customTables = []) {
  if (!customTables.length) return `<p class="hint">Noch keine zusätzlichen Tische angelegt.</p>`;
  return `
    <div class="table-plan-group-cards">
      ${customTables.map((table) => `
        <article class="table-plan-group-card ${state.adminTablePlanDraft?.originalId === table.id ? "is-active" : ""}">
          <div class="table-plan-group-card-head">
            <div>
              <strong>${escapeHtml(table.label)}</strong>
              <span>${escapeHtml(table.id)} · ${escapeHtml(table.area)}</span>
            </div>
            <small>${escapeHtml(String(table.seats || 0))} P</small>
          </div>
          <div class="table-plan-group-card-actions">
            <button class="secondary" type="button" data-admin-table-edit="${escapeHtml(table.id)}">Bearbeiten</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function adminTablePlanBoardHtml(draft = state.adminTablePlanDraft || {}) {
  const selectedId = cleanTerminalRawTableId(draft.originalId || draft.id || "");
  const selectedZoneId = cleanTerminalTableZoneId(state.adminTablePlanZoneDraft?.originalId || state.adminTablePlanZoneDraft?.id || "");
  const customIds = new Set((state.terminalTableConfig?.customTables || []).map((item) => item.id));
  const preview = adminTablePlanPreviewTable(draft);
  const visibleTables = adminTablePlanVisibleLayout(draft);
  const visibleZones = adminTablePlanVisibleZones(state.adminTablePlanZoneDraft || {});
  return `
    <div class="table-plan-canvas admin-table-plan-canvas">
      ${visibleZones.map((zone) => `
        <button class="table-plan-zone admin-table-plan-zone ${escapeHtml(zone.className || "")} ${selectedZoneId === zone.id ? "is-selected" : ""} ${zone.visible === false ? "is-hidden" : ""}" type="button" data-admin-zone-select="${escapeHtml(zone.id)}" style="left:${zone.x}%;top:${zone.y}%;width:${zone.w}%;height:${zone.h}%;">
          <span class="admin-table-plan-inline-edit" data-admin-inline-edit="1" data-admin-zone-quick="label" data-admin-zone-id="${escapeHtml(zone.id)}" title="Bereichsname ändern">${escapeHtml(zone.label)}</span>
          <i class="admin-table-plan-resize-handle" data-admin-zone-resize="${escapeHtml(zone.id)}" aria-hidden="true"></i>
        </button>
      `).join("")}
      ${visibleTables.map((table) => {
        const classes = [
          "table-plan-table",
          `is-${table.shape || "table"}`,
          selectedId === table.id ? "is-selected" : "",
          customIds.has(table.id) ? "is-connected" : "",
          preview && preview.id === table.id ? "is-preview" : ""
        ].filter(Boolean).join(" ");
        return `
          <button class="${classes}" type="button" data-admin-table-select="${escapeHtml(table.id)}" style="left:${table.x}%;top:${table.y}%;width:${table.w}%;height:${table.h}%;">
            <div class="table-plan-table-head">
              <strong class="admin-table-plan-inline-edit" data-admin-inline-edit="1" data-admin-table-quick="label" data-admin-table-id="${escapeHtml(table.id)}" title="Tischnummer ändern">${escapeHtml(table.label)}</strong>
              <span class="admin-table-plan-inline-edit" data-admin-inline-edit="1" data-admin-table-quick="seats" data-admin-table-id="${escapeHtml(table.id)}" title="Plätze ändern">${escapeHtml(String(table.seats || terminalTableSeats(table.id) || 0))} P</span>
            </div>
            <small class="admin-table-plan-inline-edit" data-admin-inline-edit="1" data-admin-table-quick="area" data-admin-table-id="${escapeHtml(table.id)}" title="Bereich ändern">${escapeHtml(table.area || "")}</small>
            <span class="admin-table-plan-resize-handle" data-admin-table-resize="${escapeHtml(table.id)}" aria-hidden="true"></span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderAdminTablePlan() {
  const board = $("#adminTablePlanBoard");
  if (!board) return;
  if (!state.adminUnlocked) {
    board.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  const draft = emptyAdminTablePlanDraft(state.adminTablePlanDraft || {});
  const zoneDraft = emptyAdminTablePlanZoneDraft(state.adminTablePlanZoneDraft || {});
  const currentId = cleanTerminalRawTableId(draft.originalId || draft.id || "");
  const currentZoneId = cleanTerminalTableZoneId(zoneDraft.originalId || zoneDraft.id || "");
  const preview = adminTablePlanPreviewTable(draft);
  const customTable = terminalCustomTableById(currentId);
  const isBaseTable = Boolean(currentId && baseTerminalTableById(currentId) && !customTable);
  const meta = $("#adminTablePlanBoardMeta");
  if (meta) {
    meta.innerHTML = `
      <article><small>Grundtische</small><strong>${Object.keys(TERMINAL_TABLE_LOOKUP).length}</strong></article>
      <article><small>Bereiche</small><strong>${terminalVisibleZones(state.terminalTableConfig, { includeHidden: true }).length}</strong></article>
      <article><small>Eigene Tische</small><strong>${(state.terminalTableConfig?.customTables || []).length}</strong></article>
      <article><small>Gewählt</small><strong>${escapeHtml(currentId || "-")}</strong></article>
      <article><small>Plätze</small><strong>${escapeHtml(String(preview?.seats || (currentId ? (terminalTableSeats(currentId) || 0) : 0)))}</strong></article>
    `;
  }
  board.innerHTML = adminTablePlanBoardHtml(draft);
  if ($("#adminTablePlanSelectionSummary")) $("#adminTablePlanSelectionSummary").textContent = adminTablePlanSummaryText(draft);
  const summary = $("#adminTablePlanDraftSummary");
  if (summary) summary.innerHTML = adminTablePlanDraftSummaryHtml(draft);
  if ($("#adminTablePlanId")) $("#adminTablePlanId").value = draft.id || "";
  if ($("#adminTablePlanId")) $("#adminTablePlanId").disabled = Boolean(draft.originalId);
  if ($("#adminTablePlanLabel")) $("#adminTablePlanLabel").value = draft.label || "";
  if ($("#adminTablePlanArea")) $("#adminTablePlanArea").value = draft.area || "";
  if ($("#adminTablePlanSeats")) $("#adminTablePlanSeats").value = draft.seats || "";
  if ($("#adminTablePlanShape")) $("#adminTablePlanShape").value = draft.shape || "table";
  if ($("#adminTablePlanX")) $("#adminTablePlanX").value = draft.x || "";
  if ($("#adminTablePlanY")) $("#adminTablePlanY").value = draft.y || "";
  if ($("#adminTablePlanW")) $("#adminTablePlanW").value = draft.w || "";
  if ($("#adminTablePlanH")) $("#adminTablePlanH").value = draft.h || "";
  const duplicateButton = $("#duplicateAdminTablePlanEntry");
  if (duplicateButton) duplicateButton.disabled = !currentId;
  const deleteButton = $("#deleteAdminTablePlanEntry");
  if (deleteButton) {
    deleteButton.disabled = !draft.originalId;
    deleteButton.textContent = isBaseTable
      ? (adminTablePlanHasOverride(currentId) ? "Standard wiederherstellen" : "Grundtisch auswählen")
      : "Tisch löschen";
    if (isBaseTable && !adminTablePlanHasOverride(currentId)) deleteButton.disabled = true;
  }
  const customList = $("#adminTablePlanCustomList");
  if (customList) customList.innerHTML = adminTablePlanCustomListHtml(state.terminalTableConfig?.customTables || []);
  if ($("#adminTablePlanZoneSelectionSummary")) $("#adminTablePlanZoneSelectionSummary").textContent = adminTablePlanZoneSummaryText(zoneDraft);
  const zoneSummary = $("#adminTablePlanZoneDraftSummary");
  if (zoneSummary) zoneSummary.innerHTML = adminTablePlanZoneSummaryHtml(zoneDraft);
  if ($("#adminTablePlanZoneId")) $("#adminTablePlanZoneId").value = zoneDraft.id || "";
  if ($("#adminTablePlanZoneId")) $("#adminTablePlanZoneId").disabled = true;
  if ($("#adminTablePlanZoneLabel")) $("#adminTablePlanZoneLabel").value = zoneDraft.label || "";
  if ($("#adminTablePlanZoneClass")) $("#adminTablePlanZoneClass").value = zoneDraft.className || "is-open";
  if ($("#adminTablePlanZoneVisible")) $("#adminTablePlanZoneVisible").checked = zoneDraft.visible !== false;
  if ($("#adminTablePlanZoneX")) $("#adminTablePlanZoneX").value = zoneDraft.x || "";
  if ($("#adminTablePlanZoneY")) $("#adminTablePlanZoneY").value = zoneDraft.y || "";
  if ($("#adminTablePlanZoneW")) $("#adminTablePlanZoneW").value = zoneDraft.w || "";
  if ($("#adminTablePlanZoneH")) $("#adminTablePlanZoneH").value = zoneDraft.h || "";
  const zoneDeleteButton = $("#deleteAdminTablePlanZone");
  if (zoneDeleteButton) zoneDeleteButton.disabled = !currentZoneId || !adminTablePlanZoneHasOverride(currentZoneId);
}

function emptyTerminalTableCustomDraft(value = {}) {
  const table = normalizeTerminalTableCustom(value);
  return {
    originalId: cleanTerminalRawTableId(value.originalId || table.id || ""),
    id: table.id || "",
    label: table.label || "",
    area: table.area || "",
    seats: table.seats ? String(table.seats) : "",
    shape: table.shape || "table",
    x: Number.isFinite(Number(table.x)) ? String(table.x) : "",
    y: Number.isFinite(Number(table.y)) ? String(table.y) : "",
    w: Number.isFinite(Number(table.w)) ? String(table.w) : "",
    h: Number.isFinite(Number(table.h)) ? String(table.h) : ""
  };
}

function terminalTableCustomDraftPayload() {
  const draft = emptyTerminalTableCustomDraft(state.terminalTableCustomDraft || {});
  return {
    originalId: draft.originalId || draft.id || "",
    id: cleanTerminalRawTableId(draft.id),
    label: String(draft.label || "").trim(),
    area: String(draft.area || "").trim(),
    seats: cleanTerminalTablePeople(draft.seats),
    shape: ["table", "room", "lane"].includes(String(draft.shape || "").trim()) ? String(draft.shape).trim() : "table",
    x: cleanTerminalPercent(draft.x, 0, 96),
    y: cleanTerminalPercent(draft.y, 0, 96),
    w: cleanTerminalPercent(draft.w, 2, 40),
    h: cleanTerminalPercent(draft.h, 2, 30)
  };
}

function resetTerminalTableCustomDraft() {
  state.terminalTableCustomDraft = emptyTerminalTableCustomDraft();
}

function loadTerminalTableCustomDraft(id) {
  const table = terminalCustomTableById(id) || terminalTableDef(id);
  state.terminalTableCustomDraft = table ? emptyTerminalTableCustomDraft({ ...table, originalId: table.id }) : emptyTerminalTableCustomDraft();
}

function updateTerminalTableCustomField(field, value) {
  const draft = emptyTerminalTableCustomDraft(state.terminalTableCustomDraft || {});
  draft[field] = String(value || "");
  state.terminalTableCustomDraft = emptyTerminalTableCustomDraft(draft);
}

function terminalTableUseSelectionForCustomDraft() {
  const tableId = singleSelectedTerminalTableId();
  const table = terminalTableDef(tableId);
  if (!table) {
    showToast("Bitte zuerst einen einzelnen Tisch im Plan auswählen.");
    return false;
  }
  state.terminalTableCustomDraft = emptyTerminalTableCustomDraft({
    id: terminalCustomTableById(table.id)?.id || "",
    originalId: terminalCustomTableById(table.id)?.id || "",
    label: table.label || "",
    area: table.area || "",
    seats: table.seats || "",
    shape: table.shape || "table",
    x: table.x,
    y: table.y,
    w: table.w,
    h: table.h
  });
  return true;
}

function emptyTerminalTableDraft(value = {}) {
  const reservation = normalizeTerminalTableReservation(value);
  return {
    id: reservation.id || "",
    tableIds: reservation.tableIds || [],
    time: reservation.time || "",
    name: reservation.name || "",
    people: reservation.people ? String(reservation.people) : "",
    marker: reservation.marker || "normal",
    note: reservation.note || "",
    createdAt: reservation.createdAt || "",
    updatedAt: reservation.updatedAt || ""
  };
}

function normalizeTerminalTableDraft(value = {}) {
  const draft = emptyTerminalTableDraft(value);
  draft.tableIds = sortTerminalTableIds(draft.tableIds);
  draft.people = cleanTerminalTablePeople(draft.people) ? String(cleanTerminalTablePeople(draft.people)) : "";
  return draft;
}

function normalizeTerminalTableReservation(value = {}) {
  return {
    id: String(value.id || "").trim(),
    tableIds: sortTerminalTableIds(value.tableIds),
    time: String(value.time || "").trim().slice(0, 5),
    name: String(value.name || "").trim().slice(0, 160),
    people: cleanTerminalTablePeople(value.people),
    marker: cleanTerminalTableMarker(value.marker),
    note: String(value.note || "").trim().slice(0, 500),
    createdAt: String(value.createdAt || "").trim(),
    updatedAt: String(value.updatedAt || "").trim()
  };
}

function normalizeTerminalTableReservations(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item) => normalizeTerminalTableReservation(item))
    .filter((item) => item.tableIds.length && (item.time || item.name || item.people || item.note));
}

const TERMINAL_TABLE_MARKERS = {
  normal: {
    id: "normal",
    label: "Normale Reservierung",
    hint: "Keine Färbung",
    tableSurface: "",
    tableBorder: "",
    bookingFill: "",
    bookingBorder: "",
    bookingInk: ""
  },
  birthday: {
    id: "birthday",
    label: "Kindergeburtstag",
    hint: "Pink",
    tableSurface: "#ffd8ee",
    tableBorder: "#ec4899",
    bookingFill: "rgba(255,255,255,0.92)",
    bookingBorder: "#ec4899",
    bookingInk: "#a21caf"
  },
  setup: {
    id: "setup",
    label: "Eindecken",
    hint: "Blau",
    tableSurface: "#d9ebff",
    tableBorder: "#2563eb",
    bookingFill: "rgba(255,255,255,0.92)",
    bookingBorder: "#2563eb",
    bookingInk: "#1d4ed8"
  }
};

function cleanTerminalTableMarker(value) {
  const marker = String(value || "").trim().toLowerCase();
  return TERMINAL_TABLE_MARKERS[marker] ? marker : "normal";
}

function terminalTableMarkerConfig(value) {
  return TERMINAL_TABLE_MARKERS[cleanTerminalTableMarker(value)] || TERMINAL_TABLE_MARKERS.normal;
}

function terminalTableMarkerOptionsHtml(selected = "normal") {
  const marker = cleanTerminalTableMarker(selected);
  return Object.values(TERMINAL_TABLE_MARKERS).map((item) => (
    `<option value="${escapeHtml(item.id)}"${item.id === marker ? " selected" : ""}>${escapeHtml(item.hint)} · ${escapeHtml(item.label)}</option>`
  )).join("");
}

function terminalTableMarkerLegendHtml() {
  return `
    <div class="table-plan-marker-legend">
      ${Object.values(TERMINAL_TABLE_MARKERS).map((item) => `
        <span class="table-plan-marker-pill is-${escapeHtml(item.id)}">
          <i aria-hidden="true"></i>
          ${escapeHtml(item.hint)}${item.id === "normal" ? " · normale Reservierung" : ` · ${escapeHtml(item.label)}`}
        </span>
      `).join("")}
    </div>
  `;
}

function terminalTableReservationThemeStyle(reservation = null) {
  const marker = terminalTableMarkerConfig(reservation?.marker);
  if (marker.id === "normal") return "";
  return [
    `--table-reservation-surface:${marker.tableSurface}`,
    `--table-reservation-border:${marker.tableBorder}`,
    `--table-reservation-fill:${marker.bookingFill}`,
    `--table-reservation-fill-border:${marker.bookingBorder}`,
    `--table-reservation-ink:${marker.bookingInk}`
  ].join(";");
}

function normalizeTerminalTableGroup(value = {}) {
  return {
    id: String(value.id || "").trim(),
    label: String(value.label || "").trim().slice(0, 120),
    tableIds: sortTerminalTableIds(value.tableIds),
    createdAt: String(value.createdAt || "").trim(),
    updatedAt: String(value.updatedAt || "").trim()
  };
}

function normalizeTerminalTableGroups(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item) => normalizeTerminalTableGroup(item))
    .filter((item) => item.label && item.tableIds.length >= 2);
}

function cleanTerminalTableId(value) {
  const id = cleanTerminalRawTableId(value);
  return terminalTableLookup()[id] ? id : "";
}

function sortTerminalTableIds(value = []) {
  return [...new Set((Array.isArray(value) ? value : []).map(cleanTerminalTableId).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, "de", { numeric: true }));
}

function terminalTableSetKey(value = []) {
  return sortTerminalTableIds(value).join("|");
}

function terminalTableIdsFromValue(value) {
  if (Array.isArray(value)) return sortTerminalTableIds(value);
  return sortTerminalTableIds(String(value || "").split(","));
}

function cleanTerminalTablePeople(value) {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) && number > 0 ? Math.round(number) : 0;
}

function terminalTableGroups(report = state.terminalReport) {
  return normalizeTerminalTableGroups(report?.tableGroups || []);
}

function terminalTableGroupedIds(groups = terminalTableGroups()) {
  return new Set(groups.flatMap((group) => group.tableIds));
}

function terminalTableGroupForTableIds(tableIds = [], groups = terminalTableGroups()) {
  const key = terminalTableSetKey(tableIds);
  return groups.find((group) => terminalTableSetKey(group.tableIds) === key) || null;
}

function terminalTableGroupRect(group = {}) {
  const rects = sortTerminalTableIds(group.tableIds).map((tableId) => terminalTableRect(tableId)).filter(Boolean);
  if (!rects.length) return null;
  const padding = 0.7;
  const left = Math.max(0.2, Math.min(...rects.map((rect) => rect.left)) - padding);
  const top = Math.max(0.2, Math.min(...rects.map((rect) => rect.top)) - padding);
  const right = Math.min(99.4, Math.max(...rects.map((rect) => rect.right)) + padding);
  const bottom = Math.min(99.4, Math.max(...rects.map((rect) => rect.bottom)) + padding);
  return {
    left,
    top,
    width: Math.max(3, right - left),
    height: Math.max(3, bottom - top)
  };
}

function terminalTableGroupShape(group = {}) {
  const rect = terminalTableGroupRect(group);
  if (!rect) return "table";
  if (rect.height > rect.width * 1.2) return "table-vertical";
  if (rect.width > rect.height * 1.35) return "table-horizontal";
  return "table";
}

function emptyTerminalTableGroupDraft(value = {}) {
  const group = normalizeTerminalTableGroup(value);
  return {
    id: group.id || "",
    label: group.label || "",
    tableIds: group.tableIds || [],
    createdAt: group.createdAt || "",
    updatedAt: group.updatedAt || ""
  };
}

function activeTerminalTableGroupDraft(draft = state.terminalTableGroupDraft, selection = state.terminalTableDraft?.tableIds || []) {
  const next = emptyTerminalTableGroupDraft(draft || {});
  if (!next.id) next.tableIds = sortTerminalTableIds(selection);
  return next;
}

function syncTerminalTableGroupDraftFromReport(report = state.terminalReport) {
  const groups = terminalTableGroups(report);
  if (!state.terminalTableGroupDraft) {
    state.terminalTableGroupDraft = emptyTerminalTableGroupDraft();
    return;
  }
  const draft = emptyTerminalTableGroupDraft(state.terminalTableGroupDraft);
  if (!draft.id) {
    state.terminalTableGroupDraft = activeTerminalTableGroupDraft(draft);
    return;
  }
  const match = groups.find((item) => item.id === draft.id);
  state.terminalTableGroupDraft = match ? emptyTerminalTableGroupDraft(match) : emptyTerminalTableGroupDraft();
}

function resetTerminalTableGroupDraft() {
  state.terminalTableGroupDraft = emptyTerminalTableGroupDraft();
}

function loadTerminalTableGroupDraft(id) {
  const group = terminalTableGroups().find((item) => item.id === id);
  state.terminalTableGroupDraft = group ? emptyTerminalTableGroupDraft(group) : emptyTerminalTableGroupDraft();
  if (!group) return;
  const reservationDraft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  reservationDraft.tableIds = sortTerminalTableIds(group.tableIds);
  state.terminalTableDraft = normalizeTerminalTableDraft(reservationDraft);
}

function updateTerminalTableGroupField(field, value) {
  const draft = activeTerminalTableGroupDraft(state.terminalTableGroupDraft || {});
  draft[field] = String(value || "").trim();
  state.terminalTableGroupDraft = emptyTerminalTableGroupDraft(draft);
}

function currentTerminalTableGroupPayload() {
  const draft = activeTerminalTableGroupDraft(state.terminalTableGroupDraft || {});
  return {
    ...draft,
    tableIds: sortTerminalTableIds(draft.tableIds)
  };
}

function terminalTableReservations(report = state.terminalReport) {
  return normalizeTerminalTableReservations(report?.tableReservations || []);
}

function terminalTableSeatCount(tableIds = []) {
  return sortTerminalTableIds(tableIds).reduce((sum, id) => sum + terminalTableSeats(id), 0);
}

function terminalTableLabels(tableIds = []) {
  return sortTerminalTableIds(tableIds).map((id) => terminalTableDef(id)?.label || id);
}

function terminalTableLabelText(tableIds = [], groups = terminalTableGroups()) {
  const match = terminalTableGroupForTableIds(tableIds, groups);
  if (match?.label) return match.label;
  const labels = terminalTableLabels(tableIds);
  return labels.length ? labels.join(" + ") : "Keine Tische ausgewählt";
}

function terminalTableAreas(tableIds = []) {
  return [...new Set(sortTerminalTableIds(tableIds).map((id) => terminalTableDef(id)?.area || "").filter(Boolean))];
}

function terminalTableAreaText(tableIds = [], groups = terminalTableGroups()) {
  const match = terminalTableGroupForTableIds(tableIds, groups);
  if (match) {
    const groupedAreas = terminalTableAreas(match.tableIds);
    if (groupedAreas.length) return groupedAreas.join(" · ");
  }
  const areas = terminalTableAreas(tableIds);
  return areas.length ? areas.join(" · ") : "Kein Bereich";
}

function terminalTableRect(id) {
  const table = terminalTableDef(id);
  if (!table) return null;
  return { left: table.x, top: table.y, right: table.x + table.w, bottom: table.y + table.h };
}

function terminalRangesNear(aStart, aEnd, bStart, bEnd, tolerance = TERMINAL_TABLE_ADJACENCY_TOLERANCE) {
  return Math.min(aEnd, bEnd) - Math.max(aStart, bStart) >= -tolerance;
}

function terminalTablesAreAdjacent(leftId, rightId) {
  const left = terminalTableDef(leftId);
  const right = terminalTableDef(rightId);
  if (!left || !right || left.id === right.id) return false;
  if (left.area !== right.area) return false;
  const a = terminalTableRect(left.id);
  const b = terminalTableRect(right.id);
  if (!a || !b) return false;
  const touchesHorizontally = Math.abs(a.right - b.left) <= TERMINAL_TABLE_ADJACENCY_TOLERANCE || Math.abs(b.right - a.left) <= TERMINAL_TABLE_ADJACENCY_TOLERANCE;
  const touchesVertically = Math.abs(a.bottom - b.top) <= TERMINAL_TABLE_ADJACENCY_TOLERANCE || Math.abs(b.bottom - a.top) <= TERMINAL_TABLE_ADJACENCY_TOLERANCE;
  const verticalOverlap = terminalRangesNear(a.top, a.bottom, b.top, b.bottom);
  const horizontalOverlap = terminalRangesNear(a.left, a.right, b.left, b.right);
  return (touchesHorizontally && verticalOverlap) || (touchesVertically && horizontalOverlap);
}

function singleSelectedTerminalTableId(draft = state.terminalTableDraft) {
  const ids = sortTerminalTableIds(draft?.tableIds || []);
  return ids.length === 1 ? ids[0] : "";
}

function terminalTableOccupancyMap(reservations = []) {
  const map = new Map();
  sortTerminalTableReservations(reservations, "time").forEach((reservation) => {
    reservation.tableIds.forEach((id) => {
      const list = map.get(id) || [];
      list.push(reservation);
      map.set(id, list);
    });
  });
  return map;
}

function terminalTableFirstId(tableIds = []) {
  return sortTerminalTableIds(tableIds)[0] || "";
}

function sortTerminalTableReservations(value = [], sortBy = "time") {
  const reservations = normalizeTerminalTableReservations(value);
  return [...reservations].sort((left, right) => {
    const leftArea = terminalTableAreaText(left.tableIds);
    const rightArea = terminalTableAreaText(right.tableIds);
    const leftTable = terminalTableFirstId(left.tableIds);
    const rightTable = terminalTableFirstId(right.tableIds);
    const leftTime = left.time || "99:99";
    const rightTime = right.time || "99:99";
    if (sortBy === "table") {
      const tableCompare = leftTable.localeCompare(rightTable, "de", { numeric: true });
      if (tableCompare) return tableCompare;
      const timeCompare = leftTime.localeCompare(rightTime);
      if (timeCompare) return timeCompare;
    } else if (sortBy === "area") {
      const areaCompare = leftArea.localeCompare(rightArea, "de", { numeric: true });
      if (areaCompare) return areaCompare;
      const timeCompare = leftTime.localeCompare(rightTime);
      if (timeCompare) return timeCompare;
    } else {
      const timeCompare = leftTime.localeCompare(rightTime);
      if (timeCompare) return timeCompare;
      const tableCompare = leftTable.localeCompare(rightTable, "de", { numeric: true });
      if (tableCompare) return tableCompare;
    }
    return String(left.name || "").localeCompare(String(right.name || ""), "de");
  });
}

function syncTerminalTableDraftFromReport(report = state.terminalReport) {
  const reservations = terminalTableReservations(report);
  if (!state.terminalTableDraft) {
    state.terminalTableDraft = emptyTerminalTableDraft();
    return;
  }
  const draft = normalizeTerminalTableDraft(state.terminalTableDraft);
  if (!draft.id) {
    state.terminalTableDraft = draft;
    return;
  }
  const match = reservations.find((item) => item.id === draft.id);
  state.terminalTableDraft = match ? emptyTerminalTableDraft(match) : emptyTerminalTableDraft();
}

function resetTerminalTableDraft() {
  state.terminalTableDraft = emptyTerminalTableDraft();
}

function updateTerminalTableDraftField(field, value) {
  const draft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  draft[field] = field === "people" ? String(value || "").trim() : String(value || "");
  state.terminalTableDraft = normalizeTerminalTableDraft(draft);
}

function syncTerminalTableGroupDraftSelection(tableIds = []) {
  const ids = sortTerminalTableIds(tableIds);
  const draft = emptyTerminalTableGroupDraft(state.terminalTableGroupDraft || {});
  if (draft.id) {
    draft.tableIds = ids;
    state.terminalTableGroupDraft = emptyTerminalTableGroupDraft(draft);
    return;
  }
  state.terminalTableGroupDraft = activeTerminalTableGroupDraft(draft, ids);
}

function toggleTerminalTableSelection(value) {
  const tableIds = terminalTableIdsFromValue(value);
  if (!tableIds.length) return;
  const previousDraft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  const selected = new Set(previousDraft.tableIds);
  const isCompleteSelection = tableIds.every((tableId) => selected.has(tableId));
  if (isCompleteSelection) tableIds.forEach((tableId) => selected.delete(tableId));
  else tableIds.forEach((tableId) => selected.add(tableId));
  const nextIds = sortTerminalTableIds([...selected]);
  const exactMatches = terminalTableExactSelectedReservations(nextIds);
  let nextDraft = normalizeTerminalTableDraft({ ...previousDraft, tableIds: nextIds });
  if (!isCompleteSelection && exactMatches.length === 1) {
    nextDraft = emptyTerminalTableDraft(exactMatches[0]);
  } else if (!isCompleteSelection && previousDraft.id) {
    nextDraft = normalizeTerminalTableDraft({ tableIds: nextIds });
  } else if (isCompleteSelection && !nextIds.length && previousDraft.id) {
    nextDraft = emptyTerminalTableDraft();
  }
  state.terminalTableDraft = normalizeTerminalTableDraft(nextDraft);
  syncTerminalTableGroupDraftSelection(nextIds);
}

function beginTerminalTableDrag(id) {
  const tableIds = terminalTableIdsFromValue(id);
  if (!tableIds.length) return;
  state.terminalTableDragId = tableIds.join(",");
}

function endTerminalTableDrag() {
  state.terminalTableDragId = "";
}

function terminalTableSetsAreAdjacent(leftValue, rightValue) {
  const left = terminalTableIdsFromValue(leftValue);
  const right = terminalTableIdsFromValue(rightValue);
  if (!left.length || !right.length) return false;
  if (left.some((tableId) => right.includes(tableId))) return false;
  return left.some((leftId) => right.some((rightId) => terminalTablesAreAdjacent(leftId, rightId)));
}

function connectTerminalTablesByDrag(sourceId, targetId) {
  const source = terminalTableIdsFromValue(sourceId);
  const target = terminalTableIdsFromValue(targetId);
  if (!source.length || !target.length) return false;
  if (!terminalTableSetsAreAdjacent(source, target)) return false;
  const draft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  const selected = new Set(draft.tableIds);
  source.concat(target).forEach((tableId) => selected.add(tableId));
  draft.tableIds = [...selected];
  state.terminalTableDraft = normalizeTerminalTableDraft(draft);
  syncTerminalTableGroupDraftSelection(draft.tableIds);
  return true;
}

function loadTerminalTableDraft(id) {
  const reservation = terminalTableReservations().find((item) => item.id === id);
  state.terminalTableDraft = reservation ? emptyTerminalTableDraft(reservation) : emptyTerminalTableDraft();
}

function currentTerminalTablePayload() {
  const draft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  return {
    ...draft,
    marker: cleanTerminalTableMarker(draft.marker),
    people: cleanTerminalTablePeople(draft.people)
  };
}

function currentTerminalTableConfigPayload() {
  const tableId = singleSelectedTerminalTableId();
  return {
    tableId,
    seats: cleanTerminalTablePeople($("#tablePlanDefaultSeats")?.value || "")
  };
}

function terminalTableInsetRect(rect, inset = 0) {
  return {
    left: rect.left + inset,
    top: rect.top + inset,
    width: Math.max(2, rect.width - (inset * 2)),
    height: Math.max(2, rect.height - (inset * 2))
  };
}

function terminalTableGroupSummaryText(draft = {}) {
  if (draft?.id) return `Bearbeiten · ${draft.label || "Tafel"}`;
  if ((draft?.tableIds || []).length >= 2) return `${draft.tableIds.length} Tische für neue Tafel ausgewählt`;
  return "Mindestens 2 benachbarte Tische auswählen";
}

function terminalTableSelectionCanConnect(tableIds = []) {
  const ids = sortTerminalTableIds(tableIds);
  if (ids.length < 2) return false;
  const visited = new Set([ids[0]]);
  const queue = [ids[0]];
  while (queue.length) {
    const current = queue.shift();
    ids.forEach((nextId) => {
      if (visited.has(nextId)) return;
      if (!terminalTablesAreAdjacent(current, nextId)) return;
      visited.add(nextId);
      queue.push(nextId);
    });
  }
  return visited.size === ids.length;
}

function terminalTableSuggestedGroupLabel(tableIds = []) {
  const labels = terminalTableLabels(tableIds);
  if (!labels.length) return "Neue Tafel";
  return labels.join("/");
}

function terminalTableGroupDraftSummaryHtml(draft = {}) {
  if ((draft?.tableIds || []).length < 2) {
    return `<p class="hint">Tische im Plan auswählen oder per Drag & Drop verbinden. Danach eine Tischnummer für die gemeinsame Tafel vergeben.</p>`;
  }
  return `
    <article>
      <small>Tische</small>
      <strong>${escapeHtml(terminalTableLabels(draft.tableIds).join(" + "))}</strong>
    </article>
    <article>
      <small>Bereich</small>
      <strong>${escapeHtml(terminalTableAreaText(draft.tableIds))}</strong>
    </article>
    <article>
      <small>Plätze gesamt</small>
      <strong>${escapeHtml(String(terminalTableSeatCount(draft.tableIds) || 0))}</strong>
    </article>
  `;
}

function terminalTableGroupListHtml(groups = []) {
  if (!groups.length) return `<p class="hint">Noch keine Tafeln gespeichert.</p>`;
  return `
    <div class="table-plan-group-cards">
      ${groups.map((group) => `
        <article class="table-plan-group-card ${state.terminalTableGroupDraft?.id === group.id ? "is-active" : ""}">
          <div class="table-plan-group-card-head">
            <div>
              <strong>${escapeHtml(group.label)}</strong>
              <span>${escapeHtml(terminalTableLabels(group.tableIds).join(" + "))}</span>
            </div>
            <small>${escapeHtml(String(terminalTableSeatCount(group.tableIds) || 0))} P</small>
          </div>
          <div class="table-plan-group-card-actions">
            <button class="secondary" type="button" data-table-plan-group-edit="${escapeHtml(group.id)}">Bearbeiten</button>
            <button class="secondary danger-lite" type="button" data-table-plan-group-delete="${escapeHtml(group.id)}">Löschen</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function terminalTableSelectedReservations(draft = {}, reservations = []) {
  const selected = new Set(sortTerminalTableIds(draft.tableIds || []));
  if (!selected.size) return [];
  return sortTerminalTableReservations(reservations, "time").filter((reservation) => (
    reservation.tableIds.some((id) => selected.has(id))
  ));
}

function terminalTableExactSelectedReservations(tableIds = [], reservations = terminalTableReservations()) {
  const ids = sortTerminalTableIds(tableIds);
  if (!ids.length) return [];
  const selectionKey = terminalTableSetKey(ids);
  return sortTerminalTableReservations(reservations, "time").filter((reservation) => {
    if (ids.length === 1) return reservation.tableIds.includes(ids[0]);
    return terminalTableSetKey(reservation.tableIds) === selectionKey;
  });
}

function terminalTableSelectionBookingsHtml(draft = {}, reservations = []) {
  if (!draft.tableIds.length) {
    return `<p class="hint">Tische im Plan anklicken. Danach kannst du direkt eine Reservierung anlegen oder vorhandene Einträge öffnen.</p>`;
  }
  const matches = terminalTableSelectedReservations(draft, reservations);
  if (!matches.length) {
    return `
      <div class="table-plan-selection-bookings-empty">
        <strong>Auf dieser Auswahl ist noch nichts eingetragen.</strong>
        <span>Mehrfachbelegungen sind möglich. Du kannst für denselben Tisch mehrere Reservierungen mit unterschiedlicher Uhrzeit speichern.</span>
      </div>
    `;
  }
  return `
    <div class="table-plan-selection-bookings-head">
      <strong>Bereits auf dieser Auswahl</strong>
      <span>${matches.length} Reservierung${matches.length === 1 ? "" : "en"}</span>
    </div>
    <div class="table-plan-selection-bookings-list">
      ${matches.map((reservation) => `
        <article class="table-plan-selection-booking ${state.terminalTableDraft?.id === reservation.id ? "is-active" : ""}">
          <div>
            <strong>${escapeHtml(reservation.time || "--:--")} · ${escapeHtml(reservation.name || "Reservierung")}</strong>
            <span>${escapeHtml(String(reservation.people || 0))} Personen · ${escapeHtml(terminalTableLabelText(reservation.tableIds))}</span>
            ${reservation.note ? `<small>${escapeHtml(reservation.note)}</small>` : ""}
          </div>
          <button class="secondary" type="button" data-table-plan-edit="${escapeHtml(reservation.id)}">Öffnen</button>
        </article>
      `).join("")}
    </div>
  `;
}

function terminalTableCustomListHtml(customTables = []) {
  if (!customTables.length) return `<p class="hint">Noch keine zusätzlichen Tische angelegt.</p>`;
  return `
    <div class="table-plan-group-cards">
      ${customTables.map((table) => `
        <article class="table-plan-group-card ${state.terminalTableCustomDraft?.originalId === table.id ? "is-active" : ""}">
          <div class="table-plan-group-card-head">
            <div>
              <strong>${escapeHtml(table.label)}</strong>
              <span>${escapeHtml(table.id)} · ${escapeHtml(table.area)}</span>
            </div>
            <small>${escapeHtml(String(table.seats || 0))} P</small>
          </div>
          <div class="table-plan-group-card-actions">
            <button class="secondary" type="button" data-table-plan-custom-edit="${escapeHtml(table.id)}">Bearbeiten</button>
            <button class="secondary danger-lite" type="button" data-table-plan-custom-delete="${escapeHtml(table.id)}">Löschen</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function terminalTableDateHintHtml(dateKey, info = state.terminalTableInfo || {}) {
  const todayDate = info.todayDate || todayKey();
  const parts = [];
  if (dateKey !== todayDate && info.selectedAvailable) {
    const items = Number(info.selectedItems || 0);
    parts.push(`Für <strong>${escapeHtml(formatLongDate(dateKey))}</strong> ist bereits ein Tischplan gespeichert${items ? ` (${items} Einträge)` : ""}.`);
  }
  if (dateKey !== todayDate && info.todayAvailable) {
    const items = Number(info.todayItems || 0);
    parts.push(`Hinweis: Für <strong>heute</strong> ist bereits ein Tischplan verfügbar${items ? ` (${items} Einträge)` : ""}.`);
  }
  if (dateKey === todayDate && info.selectedAvailable) {
    const items = Number(info.selectedItems || 0);
    parts.push(`Für <strong>heute</strong> ist bereits ein Tischplan gespeichert${items ? ` (${items} Einträge)` : ""}.`);
  }
  return parts.join(" ");
}

function terminalTableBookingSummaryHtml(booked = [], compact = false) {
  if (!booked.length) return "";
  const primary = booked[0];
  return `
    <div class="table-plan-table-bookings ${compact ? "is-compact" : ""}">
      <span class="table-plan-table-booking is-primary is-${escapeHtml(cleanTerminalTableMarker(primary.marker))}">
        <span class="table-plan-table-booking-top">
          <strong>${escapeHtml(primary.time || "--:--")}</strong>
        </span>
        <span class="table-plan-table-booking-name">${escapeHtml(primary.name || "Reservierung")}</span>
      </span>
      ${booked.length > 1 ? `<span class="table-plan-table-booking is-more">+${booked.length - 1}</span>` : ""}
    </div>
  `;
}

function terminalTableStaffSummaryText(assignments = [], draft = {}) {
  if (draft?.id) return `Bearbeiten · ${draft.employee || "Personalbereich"}`;
  if (assignments.length) return `${assignments.length} Personalbereiche gespeichert`;
  return "Noch kein Bereich zugewiesen";
}

function terminalTableStaffPositionsText(meta = {}) {
  return Array.isArray(meta.positions) && meta.positions.length ? meta.positions.join(", ") : "laut Tages-Einteilung";
}

function terminalTableStaffTimeText(meta = {}) {
  return meta.time?.from ? `ab ${meta.time.from}` : "Start offen";
}

function terminalTableStaffEmployeeOptionsHtml(employeeMeta = new Map(), selectedEmployee = "") {
  const options = [];
  if (!selectedEmployee || !employeeMeta.has(selectedEmployee)) {
    options.push(`<option value="">Mitarbeiter wählen</option>`);
  }
  if (selectedEmployee && !employeeMeta.has(selectedEmployee)) {
    options.push(`<option value="${escapeHtml(selectedEmployee)}">${escapeHtml(selectedEmployee)} · nicht mehr eingeteilt</option>`);
  }
  employeeMeta.forEach((meta, employee) => {
    options.push(`<option value="${escapeHtml(employee)}"${employee === selectedEmployee ? " selected" : ""}>${escapeHtml(terminalTableEmployeeOptionLabel(meta))}</option>`);
  });
  return options.join("");
}

function terminalTableStaffPresetOptionsHtml(selectedPreset = "") {
  return [
    `<option value="">Bereich wählen</option>`,
    ...TERMINAL_TABLE_STAFF_PRESETS.map((preset) => `<option value="${escapeHtml(preset.id)}"${preset.id === selectedPreset ? " selected" : ""}>${escapeHtml(preset.label)}</option>`)
  ].join("");
}

function terminalTableStaffListHtml(dateKey, assignments = [], employeeMeta = new Map()) {
  if (!assignments.length) return `<p class="hint">Noch kein Mitarbeiterbereich für ${escapeHtml(formatLongDate(dateKey))} angelegt.</p>`;
  return `
    <div class="table-plan-staff-cards">
      ${assignments.map((assignment) => {
        const preset = terminalTableStaffPreset(assignment.presetId);
        const meta = employeeMeta.get(assignment.employee) || { employee: assignment.employee, positions: [], time: {} };
        return `
          <article class="table-plan-staff-card ${state.terminalTableStaffDraft?.id === assignment.id ? "is-active" : ""}" style="--staff-color:${escapeHtml(assignment.color)};">
            <div class="table-plan-staff-card-head">
              <div>
                <strong>${escapeHtml(assignment.employee)}</strong>
                <span>${escapeHtml(preset?.label || assignment.presetId)}</span>
              </div>
              <span class="table-plan-staff-color-dot" style="background:${escapeHtml(assignment.color)};"></span>
            </div>
            <div class="table-plan-staff-card-meta">
              <small>${escapeHtml(terminalTableStaffPositionsText(meta))}</small>
              <small>${escapeHtml(terminalTableStaffTimeText(meta))}</small>
            </div>
            ${assignment.note ? `<p>${escapeHtml(assignment.note)}</p>` : ""}
            <div class="table-plan-staff-card-actions">
              <button class="secondary" type="button" data-table-plan-staff-edit="${escapeHtml(assignment.id)}">Bearbeiten</button>
              <button class="secondary danger-lite" type="button" data-table-plan-staff-delete="${escapeHtml(assignment.id)}">Löschen</button>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function terminalTableDraftOverlayHtml(draft = {}, groups = []) {
  const ids = sortTerminalTableIds(draft.tableIds || []);
  if (ids.length < 2) return "";
  if (terminalTableGroupForTableIds(ids, groups)) return "";
  const rect = terminalTableGroupRect({ tableIds: ids });
  if (!rect) return "";
  return `
    <div class="table-plan-group-draft-overlay" style="left:${rect.left}%;top:${rect.top}%;width:${rect.width}%;height:${rect.height}%;">
      <strong>Neue Tafel</strong>
      <span>${escapeHtml(terminalTableLabels(ids).join(" + "))}</span>
    </div>
  `;
}

function terminalTableStaffOverlayHtml(assignments = [], employeeMeta = new Map()) {
  const presetCounts = {};
  return assignments.map((assignment) => {
    const preset = terminalTableStaffPreset(assignment.presetId);
    const baseRect = terminalTableStaffPresetRect(assignment.presetId);
    if (!preset || !baseRect) return "";
    const order = presetCounts[assignment.presetId] || 0;
    presetCounts[assignment.presetId] = order + 1;
    const rect = terminalTableInsetRect(baseRect, order * 0.8);
    const meta = employeeMeta.get(assignment.employee) || { employee: assignment.employee, positions: [], time: {} };
    return `
      <div class="table-plan-staff-overlay" style="left:${rect.left}%;top:${rect.top}%;width:${rect.width}%;height:${rect.height}%;--staff-color:${escapeHtml(assignment.color)};--staff-color-soft:${escapeHtml(terminalColorToRgba(assignment.color, 0.14))};">
        <div class="table-plan-staff-overlay-head">
          <strong>${escapeHtml(assignment.employee)}</strong>
          <span>${escapeHtml(preset.label)}</span>
        </div>
        <small>${escapeHtml(terminalTableStaffPositionsText(meta))}${meta.time?.from ? ` · ${escapeHtml(terminalTableStaffTimeText(meta))}` : ""}</small>
        ${assignment.note ? `<small>${escapeHtml(assignment.note)}</small>` : ""}
      </div>
    `;
  }).join("");
}

function terminalTablePrintStaffHtml(dateKey, assignments = [], employeeMeta = new Map()) {
  if (!assignments.length) return "";
  return `
    <div class="table-plan-print-card">
      <div class="table-plan-print-head">
        <div>
          <strong>Personalbereiche</strong>
          <small>${escapeHtml(formatLongDate(dateKey))}</small>
        </div>
        <span>${escapeHtml(String(assignments.length))} Zuordnungen</span>
      </div>
      <table class="table-plan-print-table">
        <thead>
          <tr>
            <th>Mitarbeiter</th>
            <th>Bereich</th>
            <th>Positionen</th>
            <th>Start</th>
            <th>Hinweis</th>
          </tr>
        </thead>
        <tbody>
          ${assignments.map((assignment) => {
            const preset = terminalTableStaffPreset(assignment.presetId);
            const meta = employeeMeta.get(assignment.employee) || { employee: assignment.employee, positions: [], time: {} };
            return `
              <tr>
                <td>${escapeHtml(assignment.employee)}</td>
                <td>${escapeHtml(preset?.label || assignment.presetId)}</td>
                <td>${escapeHtml(terminalTableStaffPositionsText(meta))}</td>
                <td>${escapeHtml(terminalTableStaffTimeText(meta))}</td>
                <td>${escapeHtml(assignment.note || "-")}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderTerminalTablePlan(dateKey, report = {}, reportClosed = false) {
  syncTerminalTableDraftFromReport(report);
  syncTerminalTableGroupDraftFromReport(report);
  syncTerminalTableStaffDraftFromReport(report);
  const reservations = sortTerminalTableReservations(terminalTableReservations(report), state.terminalTableSort || "time");
  const groups = terminalTableGroups(report);
  const staffAssignments = sortTerminalTableStaffAssignments(terminalTableStaffAssignments(report));
  const draft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  const groupDraft = activeTerminalTableGroupDraft(state.terminalTableGroupDraft || {}, draft.tableIds);
  const customDraft = emptyTerminalTableCustomDraft(state.terminalTableCustomDraft || {});
  const staffDraft = emptyTerminalTableStaffDraft(state.terminalTableStaffDraft || {});
  const employeeMeta = terminalTableEmployeeMeta(dateKey);
  const selectedSeatCount = terminalTableSeatCount(draft.tableIds);
  const singleTableId = singleSelectedTerminalTableId(draft);
  const singleTable = terminalTableDef(singleTableId);
  const selectedGroup = terminalTableGroupForTableIds(draft.tableIds, groups);
  const shell = $(".table-plan-shell");
  if (shell) shell.classList.toggle("is-work-view", state.terminalTableView === "work");
  document.body.classList.toggle("table-plan-fullscreen", Boolean(state.terminalTableFullscreen));
  const boardMeta = $("#tablePlanBoardMeta");
  if (boardMeta) {
    boardMeta.innerHTML = `
      <article>
        <small>Datum</small>
        <strong>${escapeHtml(formatLongDate(dateKey))}</strong>
      </article>
      <article>
        <small>Reservierungen</small>
        <strong>${reservations.length}</strong>
      </article>
      <article>
        <small>Tafeln</small>
        <strong>${groups.length}</strong>
      </article>
      <article>
        <small>Personalbereiche</small>
        <strong>${staffAssignments.length}</strong>
      </article>
      <article>
        <small>Ausgewählte Plätze</small>
        <strong>${selectedSeatCount || 0}</strong>
      </article>
      <article>
        <small>Status</small>
        <strong>${reportClosed ? "Abgeschlossen" : "Offen"}</strong>
      </article>
    `;
  }
  const board = $("#tablePlanBoard");
  if (board) board.innerHTML = terminalTableBoardHtml(reservations, groups, draft, staffAssignments, employeeMeta);
  if ($("#tablePlanDate")) $("#tablePlanDate").value = dateKey;
  const dateHint = $("#tablePlanDateHint");
  if (dateHint) {
    const hintHtml = terminalTableDateHintHtml(dateKey, state.terminalTableInfo || {});
    dateHint.innerHTML = hintHtml;
    dateHint.classList.toggle("hidden", !hintHtml);
  }
  if ($("#loadTodayTablePlan")) $("#loadTodayTablePlan").classList.toggle("hidden", !(dateKey !== (state.terminalTableInfo?.todayDate || todayKey()) && state.terminalTableInfo?.todayAvailable));
  const summary = $("#tablePlanSelectionSummary");
  if (summary) {
    summary.textContent = draft.id
      ? `Bearbeiten · ${draft.name || terminalTableLabelText(draft.tableIds)}`
      : draft.tableIds.length
        ? terminalTableLabelText(draft.tableIds)
        : "Tische auswählen";
  }
  const draftSummary = $("#tablePlanDraftSummary");
  if (draftSummary) draftSummary.innerHTML = terminalTableDraftSummaryHtml(draft);
  const conflictHint = $("#tablePlanConflictHint");
  if (conflictHint) conflictHint.innerHTML = terminalTableConflictHtml(draft, reservations);
  const selectionBookings = $("#tablePlanSelectionBookings");
  if (selectionBookings) selectionBookings.innerHTML = terminalTableSelectionBookingsHtml(draft, reservations);
  const reservationPanel = $("#tablePlanReservationPanel");
  if (reservationPanel && (draft.tableIds.length || draft.id)) reservationPanel.open = true;
  if ($("#tablePlanGroupSummary")) $("#tablePlanGroupSummary").textContent = terminalTableGroupSummaryText(groupDraft);
  const groupDraftSummary = $("#tablePlanGroupDraftSummary");
  if (groupDraftSummary) groupDraftSummary.innerHTML = terminalTableGroupDraftSummaryHtml(groupDraft);
  if ($("#tablePlanGroupLabel")) $("#tablePlanGroupLabel").value = groupDraft.label || "";
  if ($("#saveTablePlanGroup")) $("#saveTablePlanGroup").disabled = reportClosed || groupDraft.tableIds.length < 2;
  if ($("#deleteTablePlanGroup")) $("#deleteTablePlanGroup").disabled = reportClosed || !groupDraft.id;
  const groupList = $("#tablePlanGroupList");
  if (groupList) groupList.innerHTML = terminalTableGroupListHtml(groups);
  const configPanel = $("#tablePlanConfigPanel");
  if (configPanel) configPanel.classList.toggle("hidden", state.terminalTableView === "work");
  if ($("#tablePlanConfigLabel")) $("#tablePlanConfigLabel").textContent = singleTable ? `${singleTable.label} · ${singleTable.area}` : "Standardplätze";
  if ($("#tablePlanDefaultSeats")) $("#tablePlanDefaultSeats").value = singleTable ? String(singleTable.seats || "") : "";
  if ($("#tablePlanDefaultSeats")) $("#tablePlanDefaultSeats").disabled = reportClosed || !singleTable;
  if ($("#saveTablePlanConfig")) $("#saveTablePlanConfig").disabled = reportClosed || !singleTable;
  if ($("#tablePlanCustomId")) $("#tablePlanCustomId").value = customDraft.id || "";
  if ($("#tablePlanCustomId")) $("#tablePlanCustomId").disabled = reportClosed || Boolean(customDraft.originalId);
  if ($("#tablePlanCustomLabel")) $("#tablePlanCustomLabel").value = customDraft.label || "";
  if ($("#tablePlanCustomArea")) $("#tablePlanCustomArea").value = customDraft.area || "";
  if ($("#tablePlanCustomSeats")) $("#tablePlanCustomSeats").value = customDraft.seats || "";
  if ($("#tablePlanCustomShape")) $("#tablePlanCustomShape").value = customDraft.shape || "table";
  if ($("#tablePlanCustomX")) $("#tablePlanCustomX").value = customDraft.x || "";
  if ($("#tablePlanCustomY")) $("#tablePlanCustomY").value = customDraft.y || "";
  if ($("#tablePlanCustomW")) $("#tablePlanCustomW").value = customDraft.w || "";
  if ($("#tablePlanCustomH")) $("#tablePlanCustomH").value = customDraft.h || "";
  if ($("#saveTablePlanCustom")) $("#saveTablePlanCustom").disabled = reportClosed;
  if ($("#resetTablePlanCustom")) $("#resetTablePlanCustom").disabled = reportClosed;
  if ($("#deleteTablePlanCustom")) $("#deleteTablePlanCustom").disabled = reportClosed || !customDraft.originalId;
  if ($("#fillTablePlanCustomFromSelection")) $("#fillTablePlanCustomFromSelection").disabled = reportClosed || !singleTable;
  const customList = $("#tablePlanCustomList");
  if (customList) customList.innerHTML = terminalTableCustomListHtml(state.terminalTableConfig?.customTables || []);
  if ($("#tablePlanTime")) $("#tablePlanTime").value = draft.time || "";
  if ($("#tablePlanName")) $("#tablePlanName").value = draft.name || "";
  if ($("#tablePlanPeople")) $("#tablePlanPeople").value = draft.people || "";
  if ($("#tablePlanMarker")) $("#tablePlanMarker").innerHTML = terminalTableMarkerOptionsHtml(draft.marker || "normal");
  if ($("#tablePlanNote")) $("#tablePlanNote").value = draft.note || "";
  const markerLegend = $("#tablePlanMarkerLegend");
  if (markerLegend) markerLegend.innerHTML = terminalTableMarkerLegendHtml();
  if ($("#newTablePlanReservationForSelection")) $("#newTablePlanReservationForSelection").disabled = reportClosed || !draft.tableIds.length;
  if ($("#connectSelectedTables")) {
    $("#connectSelectedTables").disabled = reportClosed || draft.tableIds.length < 2 || !terminalTableSelectionCanConnect(draft.tableIds);
    $("#connectSelectedTables").textContent = selectedGroup ? "Verbindung anpassen" : "Tische verbinden";
  }
  if ($("#disconnectSelectedTables")) {
    $("#disconnectSelectedTables").classList.toggle("hidden", !selectedGroup);
    $("#disconnectSelectedTables").disabled = reportClosed || !selectedGroup;
  }
  if ($("#tablePlanStaffSummary")) $("#tablePlanStaffSummary").textContent = terminalTableStaffSummaryText(staffAssignments, staffDraft);
  const staffPanel = $("#tablePlanStaffPanel");
  if (staffPanel && (staffDraft.id || staffDraft.employee || staffDraft.presetId || staffDraft.note)) staffPanel.open = true;
  if ($("#tablePlanStaffEmployee")) $("#tablePlanStaffEmployee").innerHTML = terminalTableStaffEmployeeOptionsHtml(employeeMeta, staffDraft.employee);
  if ($("#tablePlanStaffPreset")) $("#tablePlanStaffPreset").innerHTML = terminalTableStaffPresetOptionsHtml(staffDraft.presetId);
  if ($("#tablePlanStaffColor")) $("#tablePlanStaffColor").value = cleanTerminalColor(staffDraft.color);
  if ($("#tablePlanStaffNote")) $("#tablePlanStaffNote").value = staffDraft.note || "";
  if ($("#saveTablePlanStaff")) $("#saveTablePlanStaff").disabled = reportClosed || !employeeMeta.size;
  if ($("#deleteTablePlanStaff")) $("#deleteTablePlanStaff").disabled = reportClosed || !staffDraft.id;
  const staffList = $("#tablePlanStaffList");
  if (staffList) staffList.innerHTML = terminalTableStaffListHtml(dateKey, staffAssignments, employeeMeta);
  if ($("#tablePlanSort")) $("#tablePlanSort").value = state.terminalTableSort || "time";
  if ($("#saveTablePlanReservation")) $("#saveTablePlanReservation").disabled = reportClosed;
  if ($("#deleteTablePlanReservation")) $("#deleteTablePlanReservation").disabled = reportClosed || !draft.id;
  const list = $("#tablePlanPrintArea");
  if (list) list.innerHTML = terminalTablePrintListHtml(dateKey, reservations, staffAssignments, employeeMeta);
  if ($("#tablePlanManageView")) $("#tablePlanManageView").classList.toggle("active", state.terminalTableView === "manage");
  if ($("#tablePlanWorkView")) $("#tablePlanWorkView").classList.toggle("active", state.terminalTableView === "work");
  if ($("#toggleTablePlanFullscreen")) $("#toggleTablePlanFullscreen").textContent = state.terminalTableFullscreen ? "Vollbild schließen" : "Vollbild";
}

function terminalTableBoardHtml(reservations = [], groups = [], draft = {}, staffAssignments = [], employeeMeta = new Map()) {
  const occupancy = terminalTableOccupancyMap(reservations);
  const staffByTable = terminalTableStaffAssignmentsByTable(staffAssignments);
  const selected = new Set(sortTerminalTableIds(draft.tableIds));
  const groupedIds = terminalTableGroupedIds(groups);
  const visibleTables = terminalVisibleTableLayout();
  const visibleZones = terminalVisibleZones();
  return `
    <div class="table-plan-canvas">
      ${visibleZones.map((zone) => `
        <div class="table-plan-zone ${escapeHtml(zone.className || "")}" style="left:${zone.x}%;top:${zone.y}%;width:${zone.w}%;height:${zone.h}%;"></div>
      `).join("")}
      ${terminalTableDraftOverlayHtml(draft, groups)}
      ${terminalTableStaffOverlayHtml(staffAssignments, employeeMeta)}
      ${groups.map((group) => {
        const rect = terminalTableGroupRect(group);
        if (!rect) return "";
        const booked = reservations.filter((reservation) => reservation.tableIds.some((tableId) => group.tableIds.includes(tableId)));
        const reservationTheme = terminalTableReservationThemeStyle(booked[0]);
        const isSelected = group.tableIds.every((tableId) => selected.has(tableId));
        const classes = [
          "table-plan-table",
          "is-group",
          `is-${terminalTableGroupShape(group)}`,
          booked.length ? "is-occupied" : "",
          booked.length ? "has-booking" : "",
          isSelected ? "is-selected" : ""
        ].filter(Boolean).join(" ");
        const style = [
          `left:${rect.left}%`,
          `top:${rect.top}%`,
          `width:${rect.width}%`,
          `height:${rect.height}%`
        ];
        if (reservationTheme) style.push(reservationTheme);
        return `
          <button class="${classes}" type="button" data-table-plan-select="${escapeHtml(group.tableIds.join(","))}" data-table-plan-group="${escapeHtml(group.id)}" style="${style.join(";")}">
            <div class="table-plan-table-head">
              <strong>${escapeHtml(group.label)}</strong>
            </div>
            ${terminalTableBookingSummaryHtml(booked, false)}
          </button>
        `;
      }).join("")}
      ${visibleTables.map((table) => {
        if (groupedIds.has(table.id)) return "";
        const currentTable = terminalTableDef(table.id);
        const booked = occupancy.get(table.id) || [];
        const reservationTheme = terminalTableReservationThemeStyle(booked[0]);
        const classes = [
          "table-plan-table",
          `is-${table.shape || "table"}`,
          booked.length ? "is-occupied" : "",
          booked.length ? "has-booking" : "",
          selected.has(table.id) ? "is-selected" : "",
          booked.some((reservation) => reservation.tableIds.length > 1) ? "is-connected" : ""
        ].filter(Boolean).join(" ");
        const style = [
          `left:${table.x}%`,
          `top:${table.y}%`,
          `width:${table.w}%`,
          `height:${table.h}%`
        ];
        if (reservationTheme) style.push(reservationTheme);
        return `
          <button class="${classes}" type="button" data-table-plan-select="${escapeHtml(table.id)}" data-table-plan-table="${escapeHtml(table.id)}" style="${style.join(";")}">
            <div class="table-plan-table-head">
              <strong>${escapeHtml(currentTable?.label || table.label)}</strong>
            </div>
            ${terminalTableBookingSummaryHtml(booked, true)}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function terminalTableDraftSummaryHtml(draft = {}) {
  if (!draft.tableIds.length) return `<p class="hint">Tische im Plan anklicken, dann Uhrzeit, Name und Personen eintragen.</p>`;
  return `
    <article>
      <small>Tische</small>
      <strong>${escapeHtml(terminalTableLabelText(draft.tableIds))}</strong>
    </article>
    <article>
      <small>Bereich</small>
      <strong>${escapeHtml(terminalTableAreaText(draft.tableIds))}</strong>
    </article>
    <article>
      <small>Sitzplätze</small>
      <strong>${escapeHtml(String(terminalTableSeatCount(draft.tableIds) || 0))}</strong>
    </article>
  `;
}

function startNewTerminalTableReservation() {
  const current = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  state.terminalTableDraft = normalizeTerminalTableDraft({ tableIds: current.tableIds });
}

function terminalTableConflictHtml(draft = {}, reservations = []) {
  if (!draft.tableIds.length) return "Noch keine Tische ausgewählt.";
  const selected = new Set(sortTerminalTableIds(draft.tableIds));
  const overlaps = reservations.filter((reservation) => (
    reservation.id !== draft.id && reservation.tableIds.some((id) => selected.has(id))
  ));
  if (!overlaps.length) return "Auf den ausgewählten Tischen ist noch keine andere Reservierung gespeichert.";
  return `
    <strong>Bereits auf diesen Tischen vorhanden:</strong>
    ${overlaps.map((reservation) => `${escapeHtml(reservation.time || "--:--")} · ${escapeHtml(reservation.name || "Reservierung")} (${escapeHtml(terminalTableLabelText(reservation.tableIds))})`).join("<br>")}
  `;
}

function terminalTablePrintListHtml(dateKey, reservations = [], staffAssignments = [], employeeMeta = new Map()) {
  if (!reservations.length && !staffAssignments.length) {
    return `<p class="hint">Noch kein Tischplan für ${escapeHtml(formatLongDate(dateKey))}.</p>`;
  }
  return `
    ${reservations.length ? `
      <div class="table-plan-print-card">
        <div class="table-plan-print-head">
          <div>
            <strong>Reservierungsliste</strong>
            <small>${escapeHtml(formatLongDate(dateKey))}</small>
          </div>
          <span>${escapeHtml(String(reservations.length))} Einträge</span>
        </div>
        <table class="table-plan-print-table">
          <thead>
            <tr>
              <th>Uhrzeit</th>
              <th>Name</th>
              <th>Personen</th>
              <th>Tisch</th>
              <th>Bereich</th>
              <th>Notiz</th>
              <th class="table-plan-print-action-cell">Aktion</th>
            </tr>
          </thead>
          <tbody>
            ${reservations.map((reservation) => `
              <tr class="${state.terminalTableDraft?.id === reservation.id ? "is-active" : ""}">
                <td>${escapeHtml(reservation.time || "--:--")}</td>
                <td>${escapeHtml(reservation.name || "-")}</td>
                <td>${escapeHtml(String(reservation.people || 0))}</td>
                <td>${escapeHtml(terminalTableLabelText(reservation.tableIds))}</td>
                <td>${escapeHtml(terminalTableAreaText(reservation.tableIds))}</td>
                <td>${escapeHtml(reservation.note || "-")}</td>
                <td class="table-plan-print-action-cell">
                  <button class="secondary" type="button" data-table-plan-edit="${escapeHtml(reservation.id)}">Bearbeiten</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : ""}
    ${terminalTablePrintStaffHtml(dateKey, staffAssignments, employeeMeta)}
  `;
}

async function saveTerminalTableReservation(button) {
  const payload = currentTerminalTablePayload();
  if (!payload.tableIds.length) {
    showToast("Bitte mindestens einen Tisch auswählen.");
    return;
  }
  if (!payload.time) {
    showToast("Bitte Uhrzeit eintragen.");
    return;
  }
  if (!payload.name) {
    showToast("Bitte Reservierungsname eintragen.");
    return;
  }
  if (!payload.people) {
    showToast("Bitte Personenzahl eintragen.");
    return;
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await terminalAction({
      action: "save-table-reservation",
      reservation: payload
    });
    resetTerminalTableDraft();
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Reservierung gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
  }
}

async function connectSelectedTerminalTables(button) {
  const draft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  const tableIds = sortTerminalTableIds(draft.tableIds || []);
  if (tableIds.length < 2) {
    showToast("Bitte mindestens zwei Tische auswählen.");
    return;
  }
  if (!terminalTableSelectionCanConnect(tableIds)) {
    showToast("Bitte nur benachbarte Tische auswählen, die zusammen eine Tafel bilden.");
    return;
  }
  const existingGroup = terminalTableGroupForTableIds(tableIds);
  const label = window.prompt(
    existingGroup ? "Bezeichnung für die verbundene Tafel anpassen" : "Wie soll die verbundene Tafel heißen?",
    existingGroup?.label || terminalTableSuggestedGroupLabel(tableIds)
  );
  if (label == null) return;
  const payload = {
    ...(existingGroup || {}),
    tableIds,
    label: String(label || "").trim()
  };
  if (!payload.label) {
    showToast("Bitte eine Tischnummer oder Bezeichnung eingeben.");
    return;
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = existingGroup ? "Aktualisiert..." : "Verbindet...";
  try {
    const result = await terminalAction({
      action: "save-table-group",
      group: payload
    });
    state.terminalTableGroupDraft = emptyTerminalTableGroupDraft(payload);
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tische verbunden.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
  }
}

async function disconnectSelectedTerminalTables(button) {
  const draft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  const tableIds = sortTerminalTableIds(draft.tableIds || []);
  const group = terminalTableGroupForTableIds(tableIds);
  if (!group?.id) {
    showToast("Auf dieser Auswahl ist keine gespeicherte Tafel hinterlegt.");
    return;
  }
  if (!confirm(`Verbindung "${group.label || terminalTableLabels(group.tableIds).join(" + ")}" lösen?`)) return;
  await deleteTerminalTableGroup(button, group.id);
}

async function deleteTerminalTableReservation(button) {
  const draft = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  if (!draft.id) {
    showToast("Bitte zuerst eine gespeicherte Reservierung auswählen.");
    return;
  }
  if (!confirm(`Reservierung "${draft.name || terminalTableLabelText(draft.tableIds)}" löschen?`)) return;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Löscht...";
  try {
    const result = await terminalAction({
      action: "delete-table-reservation",
      id: draft.id
    });
    resetTerminalTableDraft();
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Reservierung gelöscht.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
  }
}

async function saveTerminalTableConfig(button) {
  const payload = currentTerminalTableConfigPayload();
  if (!payload.tableId) {
    showToast("Bitte genau einen Tisch auswählen.");
    return;
  }
  if (!payload.seats) {
    showToast("Bitte eine gültige Standard-Personenzahl eintragen.");
    return;
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await terminalAction({
      action: "save-table-config",
      tableId: payload.tableId,
      seats: payload.seats
    });
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Standardplätze gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
  }
}

async function saveAdminTablePlanEntry(button) {
  if (!state.adminToken) {
    showToast("Bitte Admin erneut entsperren.");
    return;
  }
  const payload = adminTablePlanDraftPayload();
  if (!payload.id || !payload.label || !payload.area) {
    showToast("Bitte Tisch-ID, Bezeichnung und Bereich ausfüllen.");
    return;
  }
  if (!payload.seats) {
    showToast("Bitte eine gültige Personenzahl eintragen.");
    return;
  }
  const oldText = button?.textContent || "";
  const status = $("#adminTablePlanStatus");
  if (status) status.textContent = "";
  if (button) {
    button.disabled = true;
    button.textContent = "Speichert...";
  }
  try {
    const result = await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "save-table-plan-entry",
        table: payload
      })
    });
    state.terminalTableConfig = normalizeTerminalTableConfig(result.tablePlanConfig || state.terminalTableConfig);
    loadAdminTablePlanDraft(payload.id);
    renderAdminTablePlan();
    if (state.terminalToken) renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    if (status) status.textContent = result.message || "Grundplan gespeichert.";
    showToast(result.message || "Grundplan gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.textContent = oldText;
      button.disabled = false;
    }
  }
}

async function deleteAdminTablePlanEntry(button) {
  if (!state.adminToken) {
    showToast("Bitte Admin erneut entsperren.");
    return;
  }
  const draft = emptyAdminTablePlanDraft(state.adminTablePlanDraft || {});
  const tableId = cleanTerminalRawTableId(draft.originalId || draft.id || "");
  if (!tableId) {
    showToast("Bitte zuerst einen Tisch auswählen.");
    return;
  }
  const custom = terminalCustomTableById(tableId);
  const base = baseTerminalTableById(tableId);
  const actionText = custom ? `Tisch ${tableId} löschen` : `Standardwerte für ${tableId} wiederherstellen`;
  if (!confirm(`${actionText}?`)) return;
  const oldText = button.textContent;
  const status = $("#adminTablePlanStatus");
  if (status) status.textContent = "";
  button.disabled = true;
  button.textContent = custom ? "Löscht..." : "Setzt zurück...";
  try {
    const result = await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "delete-table-plan-entry",
        tableId,
        baseTable: Boolean(base && !custom)
      })
    });
    state.terminalTableConfig = normalizeTerminalTableConfig(result.tablePlanConfig || state.terminalTableConfig);
    resetAdminTablePlanDraft();
    renderAdminTablePlan();
    if (state.terminalToken) renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    if (status) status.textContent = result.message || "Grundplan aktualisiert.";
    showToast(result.message || "Grundplan aktualisiert.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

async function saveAdminTablePlanZone(button) {
  if (!state.adminToken) {
    showToast("Bitte Admin erneut entsperren.");
    return;
  }
  const payload = adminTablePlanZonePayload();
  if (!payload.id || !payload.label) {
    showToast("Bitte zuerst einen Bereich auswählen und benennen.");
    return;
  }
  const oldText = button?.textContent || "";
  const status = $("#adminTablePlanZoneStatus");
  if (status) status.textContent = "";
  if (button) {
    button.disabled = true;
    button.textContent = "Speichert...";
  }
  try {
    const result = await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "save-table-plan-zone",
        zone: payload
      })
    });
    state.terminalTableConfig = normalizeTerminalTableConfig(result.tablePlanConfig || state.terminalTableConfig);
    loadAdminTablePlanZoneDraft(payload.id);
    renderAdminTablePlan();
    if (state.terminalToken) renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    if (status) status.textContent = result.message || "Bereich gespeichert.";
    showToast(result.message || "Bereich gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.textContent = oldText;
      button.disabled = false;
    }
  }
}

async function deleteAdminTablePlanZone(button) {
  if (!state.adminToken) {
    showToast("Bitte Admin erneut entsperren.");
    return;
  }
  const draft = emptyAdminTablePlanZoneDraft(state.adminTablePlanZoneDraft || {});
  const zoneId = cleanTerminalTableZoneId(draft.originalId || draft.id || "");
  if (!zoneId) {
    showToast("Bitte zuerst einen Bereich auswählen.");
    return;
  }
  if (!adminTablePlanZoneHasOverride(zoneId)) {
    showToast("Für diesen Bereich sind noch keine Änderungen gespeichert.");
    return;
  }
  if (!confirm(`Bereich ${zoneId} auf Standard zurücksetzen?`)) return;
  const oldText = button.textContent;
  const status = $("#adminTablePlanZoneStatus");
  if (status) status.textContent = "";
  button.disabled = true;
  button.textContent = "Setzt zurück...";
  try {
    const result = await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "delete-table-plan-zone",
        zoneId
      })
    });
    state.terminalTableConfig = normalizeTerminalTableConfig(result.tablePlanConfig || state.terminalTableConfig);
    loadAdminTablePlanZoneDraft(zoneId);
    renderAdminTablePlan();
    if (state.terminalToken) renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    if (status) status.textContent = result.message || "Bereich zurückgesetzt.";
    showToast(result.message || "Bereich zurückgesetzt.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = false;
  }
}

async function saveTerminalTableCustom(button) {
  const payload = terminalTableCustomDraftPayload();
  if (!payload.id || !payload.label || !payload.area) {
    showToast("Bitte Tisch-ID, Bezeichnung und Bereich ausfüllen.");
    return;
  }
  if (!payload.seats) {
    showToast("Bitte eine gültige Sitzplatzzahl eintragen.");
    return;
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await terminalAction({
      action: "save-custom-table-config",
      table: payload
    });
    state.terminalTableCustomDraft = emptyTerminalTableCustomDraft({ ...payload, originalId: payload.id });
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tisch gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
  }
}

async function deleteTerminalTableCustom(button, explicitId = "") {
  const draft = emptyTerminalTableCustomDraft(state.terminalTableCustomDraft || {});
  const tableId = cleanTerminalRawTableId(explicitId || draft.originalId || draft.id || "");
  if (!tableId) {
    showToast("Bitte zuerst einen angelegten Tisch auswählen.");
    return;
  }
  if (!confirm(`Tisch ${tableId} wirklich löschen?`)) return;
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Löscht...";
  }
  try {
    const result = await terminalAction({
      action: "delete-custom-table-config",
      tableId
    });
    resetTerminalTableCustomDraft();
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tisch gelöscht.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.textContent = oldText || "Tisch löschen";
      button.disabled = Boolean(state.terminalReport?.closed);
    }
  }
}

async function saveTerminalTableGroup(button) {
  const payload = currentTerminalTableGroupPayload();
  if (payload.tableIds.length < 2) {
    showToast("Bitte mindestens zwei benachbarte Tische auswählen.");
    return;
  }
  if (!payload.label) {
    showToast("Bitte eine Tischnummer oder Bezeichnung eintragen.");
    return;
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await terminalAction({
      action: "save-table-group",
      group: payload
    });
    resetTerminalTableGroupDraft();
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tafel gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
  }
}

async function deleteTerminalTableGroup(button, explicitId = "") {
  const draft = activeTerminalTableGroupDraft(state.terminalTableGroupDraft || {});
  const id = String(explicitId || draft.id || "").trim();
  if (!id) {
    showToast("Bitte zuerst eine gespeicherte Tafel auswählen.");
    return;
  }
  const current = terminalTableGroups().find((item) => item.id === id) || draft;
  if (!confirm(`Tafel "${current.label || terminalTableLabels(current.tableIds).join(" + ")}" löschen?`)) return;
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Löscht...";
  }
  try {
    const result = await terminalAction({
      action: "delete-table-group",
      id
    });
    resetTerminalTableGroupDraft();
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tafel gelöscht.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.textContent = oldText || "Löschen";
      button.disabled = Boolean(state.terminalReport?.closed);
    }
  }
}

async function saveTerminalTableStaff(button) {
  const payload = currentTerminalTableStaffPayload();
  if (!payload.employee) {
    showToast("Bitte Mitarbeiter auswählen.");
    return;
  }
  if (!payload.presetId) {
    showToast("Bitte Bereich auswählen.");
    return;
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await terminalAction({
      action: "save-table-staff-assignment",
      assignment: payload
    });
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Personalbereich gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
  }
}

async function deleteTerminalTableStaff(button, explicitId = "") {
  const draft = emptyTerminalTableStaffDraft(state.terminalTableStaffDraft || {});
  const id = String(explicitId || draft.id || "").trim();
  if (!id) {
    showToast("Bitte zuerst einen gespeicherten Personalbereich auswählen.");
    return;
  }
  const current = terminalTableStaffAssignments().find((item) => item.id === id) || draft;
  if (!confirm(`Personalbereich für "${current.employee || "Mitarbeiter"}" löschen?`)) return;
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Löscht...";
  }
  try {
    const result = await terminalAction({
      action: "delete-table-staff-assignment",
      id
    });
    resetTerminalTableStaffDraft();
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Personalbereich gelöscht.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.textContent = oldText || "Löschen";
      button.disabled = Boolean(state.terminalReport?.closed);
    }
  }
}

function printTerminalTablePlanList() {
  document.body.classList.add("print-table-plan");
  window.print();
  window.setTimeout(() => {
    document.body.classList.remove("print-table-plan");
  }, 300);
}

function setTerminalTableView(mode) {
  state.terminalTableView = mode === "work" ? "work" : "manage";
  renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
}

function toggleTerminalTableFullscreen() {
  state.terminalTableFullscreen = !state.terminalTableFullscreen;
  renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
}

async function loadTerminalTableDate(dateValue = "") {
  const date = String(dateValue || $("#tablePlanDate")?.value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    showToast("Bitte ein gültiges Datum auswählen.");
    return;
  }
  resetTerminalTableDraft();
  resetTerminalTableGroupDraft();
  resetTerminalTableCustomDraft();
  resetTerminalTableStaffDraft();
  await terminalAction({
    action: "load",
    date
  });
  showToast(`Tischplan für ${formatLongDate(date)} geladen.`);
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
      time: assignmentTimeForEmployee(dateKey, row.employee, assignmentScheduleForDate(dateKey), row.position),
      availability: assignmentAvailabilityForEmployee(dateKey, row.employee)
    };
    existing.positions.push(row.position);
    byEmployee.set(row.employee, existing);
  });
  return [...byEmployee.values()];
}

function terminalAssignmentRowHtml(row) {
  const time = row.time || {};
  const availability = row.availability || {};
  const availabilityNote = String(availability.note || "").trim();
  return `
    <div class="terminal-assignment-row" data-assignment-date="${escapeHtml(row.dateKey)}" data-assignment-employee="${escapeHtml(row.employee)}">
      <div>
        <strong>${escapeHtml(row.employee)}</strong>
        <span>${escapeHtml(row.positions.join(", "))}</span>
        ${availabilityNote ? `<small class="terminal-assignment-availability-note">Verfügbarkeit: ${escapeHtml(availabilityNote)}</small>` : ""}
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
  const ready = invoices.filter((item) => invoiceIsReady(item) && !item.invoiceDone && !invoiceIsPaid(item)).length;
  const draft = invoices.filter((item) => !invoiceIsReady(item) && !item.invoiceDone).length;
  const done = invoices.filter((item) => item.invoiceDone || invoiceIsPaid(item)).length;
  const total = invoices.reduce((sum, item) => sum + invoiceTotal(item), 0);
  return `
    <div class="invoice-day-overview">
      <div>
        <small>Tagesübersicht Rechnung</small>
        <strong>${invoices.length} Kunde${invoices.length === 1 ? "" : "n"}</strong>
      </div>
      <span class="invoice-pill is-draft">${draft} angelegt</span>
      <span class="invoice-pill is-ready">${ready} zu schreiben</span>
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
    const ready = invoices.filter((item) => invoiceIsReady(item) && !item.invoiceDone && !invoiceIsPaid(item)).length;
    const draft = invoices.filter((item) => !invoiceIsReady(item) && !item.invoiceDone).length;
    const done = invoices.filter((item) => item.invoiceDone || invoiceIsPaid(item)).length;
    const total = invoices.reduce((sum, item) => sum + invoiceTotal(item), 0);
    summary.innerHTML = `
      <div>
        <small>${escapeHtml(formatDate(state.invoiceDate || todayKey()))}</small>
        <strong>${invoices.length} Rechnungskunde${invoices.length === 1 ? "" : "n"}</strong>
      </div>
      <span class="invoice-pill is-draft">${draft} offen</span>
      <span class="invoice-pill is-ready">${ready} zu schreiben</span>
      <span class="invoice-pill is-done">${done} erledigt</span>
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
    paymentMethod: customer.paymentMethod || "",
    tip: customer.tip || "",
    note: customer.note || "",
    pentacodeEntered: false,
    createdAt: new Date().toISOString(),
    invoiceReady: false,
    invoiceReadyAt: "",
    invoiceDone: false,
    invoiceDoneAt: "",
    invoicePaid: false,
    invoicePaidAt: "",
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
  const pentacodeEntered = invoicePentacodeEntered(item);
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
        <label>Zahlungsart
          <select data-report-field="paymentMethod">
            <option value=""${!item.paymentMethod ? " selected" : ""}>Bitte wählen</option>
            <option value="Bar"${item.paymentMethod === "Bar" ? " selected" : ""}>Bar</option>
            <option value="EC"${item.paymentMethod === "EC" ? " selected" : ""}>EC</option>
            <option value="Überweisung"${item.paymentMethod === "Überweisung" ? " selected" : ""}>Überweisung</option>
          </select>
        </label>
      </div>
      <div class="report-entry-grid invoice-amount-grid">
        <label>Bowling Betrag<input data-report-field="bowlingAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.bowlingAmount || (item.area === "bowling" ? item.amount : ""))}" placeholder="0,00"></label>
        <label>Gastro Getränke<input data-report-field="gastroDrinksAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.gastroDrinksAmount || "")}" placeholder="0,00"></label>
        <label>Gastro Speisen<input data-report-field="gastroFoodAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.gastroFoodAmount || "")}" placeholder="0,00"></label>
        <label>Gastro Sonstiges<input data-report-field="gastroOtherAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.gastroOtherAmount || "")}" placeholder="z.B. Raummiete"></label>
        <label class="invoice-tip-field">Tipp
          <input data-report-field="tip" value="${escapeHtml(item.tip || "")}" placeholder="optional">
          <small class="invoice-field-hint">Achtung: Wenn Tip boniert ist, steht er separat auf dem Gastro-Beleg.</small>
        </label>
        <label class="invoice-other-note-field">Sonstiges Notiz<textarea data-report-field="gastroOtherNote" rows="2" placeholder="z.B. Raummiete oder Sonderleistung">${escapeHtml(item.gastroOtherNote || "")}</textarea></label>
      </div>
      <label>Rechnungsadresse<textarea data-report-field="address" rows="2" placeholder="Adresse für Rechnung">${escapeHtml(item.address || "")}</textarea></label>
      <label>Notiz<input data-report-field="note" value="${escapeHtml(item.note || "")}" placeholder="optional"></label>
      <label class="invoice-pentacode-check"><input data-report-field="pentacodeEntered" type="checkbox" value="true" ${pentacodeEntered ? "checked" : ""}> In Pentacode eingetragen</label>
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
      <input type="hidden" data-report-field="invoicePaid" value="${invoiceIsPaid(item) ? "true" : "false"}">
      <input type="hidden" data-report-field="invoicePaidAt" value="${escapeHtml(item.invoicePaidAt || "")}">
      <input type="hidden" data-report-field="invoiceNotificationSentAt" value="${escapeHtml(item.invoiceNotificationSentAt || "")}">
      <input type="hidden" data-report-field="createdAt" value="${escapeHtml(item.createdAt || "")}">
      <div class="invoice-entry-actions">
        <button class="secondary" data-copy-invoice-customer type="button">Kunde kopieren</button>
        <button class="secondary" data-copy-invoice-total type="button">Betrag kopieren</button>
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
      item[field.dataset.reportField] = field.type === "checkbox" ? (field.checked ? "true" : "") : field.value;
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
  const field = row.querySelector(`[data-report-field="${name}"]`);
  if (!field) return "";
  return field.type === "checkbox" ? (field.checked ? "true" : "") : field.value || "";
}

function setReportFieldValue(row, name, value) {
  const field = row.querySelector(`[data-report-field="${name}"]`);
  if (!field) return;
  if (field.type === "checkbox") {
    field.checked = value === true || value === "true" || value === 1 || value === "1";
    return;
  }
  field.value = value;
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
  if (!reportFieldValue(row, "pentacodeEntered")) problems.push("In Pentacode eingetragen fehlt");
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
    const payload = await collectDayReportPayload();
    if (markReady) {
      payload.sendInvoiceNotifications = true;
      payload.sendInvoiceNotificationId = row.dataset.id || "";
    }
    const result = await terminalAction(payload);
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
      <small>Bar + Ausgaben + EC + Rechnung per Überweisung - Umsatz nach Personalverzehr</small>
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
  const transferInvoiceTotal = reportTransferInvoiceTotal(state.terminalReport || {});
  const totalRevenue = Math.max(0, revenueBowling + revenueGastro - personalConsumption);
  const tipTotal = Math.max(0, cashTotal + cashExpenses + ecTotal + transferInvoiceTotal - totalRevenue);
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
    invoiceTotal: transferInvoiceTotal,
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
  state.assignmentAvailability = normalizeAssignmentAvailability(result.assignmentAvailability || state.assignmentAvailability || {});
  state.terminalTasks = result.tasks || [];
  state.terminalReminders = normalizeReminderTemplates(result.reminders);
  state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.cleaningTemplates);
  state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || {};
  state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
  state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
  state.terminalTableConfig = normalizeTerminalTableConfig(result.tablePlanConfig || state.terminalTableConfig);
  state.terminalTableInfo = result.tablePlanInfo || state.terminalTableInfo;
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
  state.assignmentAvailability = normalizeAssignmentAvailability(result.assignmentAvailability || state.assignmentAvailability || {});
  state.terminalTasks = result.tasks || [];
  state.terminalReminders = normalizeReminderTemplates(result.reminders);
  state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.cleaningTemplates);
  state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || {};
  state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
  state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
  state.terminalTableConfig = normalizeTerminalTableConfig(result.tablePlanConfig || state.terminalTableConfig);
  state.terminalTableInfo = result.tablePlanInfo || state.terminalTableInfo;
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
    state.terminalTableConfig = normalizeTerminalTableConfig(result.tablePlanConfig || state.terminalTableConfig);
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
      state.terminalTableConfig = normalizeTerminalTableConfig(result.tablePlanConfig || state.terminalTableConfig);
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
    const weeks = groupedCalendarWeeksForMonth(month).filter((week) => (
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
    const invoiceFolderButton = event.target.closest("[data-chef-invoice-folder]");
    if (invoiceFolderButton) {
      const nextFolder = invoiceFolderButton.dataset.chefInvoiceFolder || "write";
      const closing = state.chefInvoiceFolder === nextFolder;
      state.chefInvoiceFolder = closing ? "" : nextFolder;
      if (closing) {
        state.chefInvoiceItemOpen = "";
      } else if (!state.chefInvoiceItemOpen.startsWith(`${nextFolder}|`)) {
        state.chefInvoiceItemOpen = "";
      }
      renderChef();
      return;
    }
    const invoiceItemButton = event.target.closest("[data-chef-invoice-item]");
    if (invoiceItemButton) {
      const token = invoiceItemButton.dataset.chefInvoiceItem || "";
      const folder = invoiceItemButton.dataset.chefInvoiceItemFolder || state.chefInvoiceFolder || "write";
      state.chefInvoiceFolder = folder;
      state.chefInvoiceItemOpen = state.chefInvoiceItemOpen === token ? "" : token;
      renderChef();
      return;
    }
    const searchScopeButton = event.target.closest("[data-chef-search-scope]");
    if (searchScopeButton) {
      state.chefSearchScope = searchScopeButton.dataset.chefSearchScope || "all";
      renderChef();
      return;
    }
    const searchToggleButton = event.target.closest("[data-chef-search-toggle]");
    if (searchToggleButton) {
      const toggle = searchToggleButton.dataset.chefSearchToggle || "";
      if (toggle === "month") state.chefSearchMonthOnly = !state.chefSearchMonthOnly;
      if (toggle === "open-invoices") state.chefSearchOpenInvoicesOnly = !state.chefSearchOpenInvoicesOnly;
      if (toggle === "missing-documents") state.chefSearchMissingDocsOnly = !state.chefSearchMissingDocsOnly;
      renderChef();
      return;
    }
    const clearSearchButton = event.target.closest("[data-clear-chef-search]");
    if (clearSearchButton) {
      state.chefReportSearch = "";
      state.chefSearchScope = "all";
      state.chefSearchMonthOnly = false;
      state.chefSearchOpenInvoicesOnly = false;
      state.chefSearchMissingDocsOnly = false;
      renderChef();
      return;
    }
    const openReportButton = event.target.closest("[data-chef-open-report]");
    if (openReportButton) {
      state.chefTab = "reports";
      state.chefReportDate = openReportButton.dataset.chefOpenReport || defaultChefReportDate();
      renderChef();
      return;
    }
    const openTabButton = event.target.closest("[data-chef-open-tab]");
    if (openTabButton) {
      state.chefTab = openTabButton.dataset.chefOpenTab || "reports";
      renderChef();
      return;
    }
    const openScheduleButton = event.target.closest("[data-chef-open-schedule-date]");
    if (openScheduleButton) {
      const dateKey = openScheduleButton.dataset.chefOpenScheduleDate || "";
      if (dateKey) state.selectedMonth = dateKey.slice(0, 7);
      state.chefTab = "schedule";
      renderChef();
      return;
    }
    const copyButton = event.target.closest("[data-copy-value]");
    if (copyButton) {
      copyText(copyButton.dataset.copyValue || "");
      return;
    }
    const exportDayButton = event.target.closest("[data-export-day-report]");
    if (exportDayButton) {
      exportDayReport(exportDayButton.dataset.exportDayReport);
      return;
    }
    const completeInvoiceButton = event.target.closest("[data-complete-invoice]");
    if (completeInvoiceButton) {
      completeInvoice(completeInvoiceButton.dataset.completeInvoice, completeInvoiceButton);
      return;
    }
    const payInvoiceButton = event.target.closest("[data-pay-invoice]");
    if (payInvoiceButton) {
      payInvoice(payInvoiceButton.dataset.payInvoice, payInvoiceButton);
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
    const monthButton = event.target.closest("[data-export-chef-month]");
    if (monthButton) {
      exportChefMonthDocuments(monthButton.dataset.exportChefMonth);
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

  $("#chefDashboard")?.addEventListener("input", (event) => {
    if (!event.target.matches("#chefReportSearch")) return;
    const nextValue = event.target.value || "";
    state.chefReportSearch = nextValue;
    renderChef();
    const field = $("#chefReportSearch");
    if (field) {
      field.focus();
      const end = nextValue.length;
      try {
        field.setSelectionRange(end, end);
      } catch (error) {
        // Ignore browsers without setSelectionRange for search inputs.
      }
    }
  });

  $("#chefDashboard")?.addEventListener("change", (event) => {
    if (event.target.matches("#chefReportDate")) {
      state.chefReportDate = event.target.value || defaultChefReportDate();
      renderChef();
      return;
    }
    if (event.target.matches("#chefExportMonth")) {
      state.chefExportMonth = event.target.value || defaultChefExportMonth();
      renderChef();
      return;
    }
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
    const copyCustomerButton = event.target.closest("[data-copy-invoice-customer]");
    if (copyCustomerButton) {
      const row = copyCustomerButton.closest('[data-report-entry="invoice"]');
      copyText(invoiceRowCustomerCopyValue(row));
      return;
    }
    const copyTotalButton = event.target.closest("[data-copy-invoice-total]");
    if (copyTotalButton) {
      const row = copyTotalButton.closest('[data-report-entry="invoice"]');
      copyText(invoiceRowTotalCopyValue(row));
      return;
    }
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

  $("#adminContent")?.addEventListener("input", (event) => {
    const zoneField = event.target.closest("[data-admin-zone-field]");
    if (zoneField) {
      updateAdminTablePlanZoneField(zoneField.dataset.adminZoneField, zoneField.type === "checkbox" ? zoneField.checked : zoneField.value);
      renderAdminTablePlan();
      return;
    }
    const field = event.target.closest("[data-admin-table-field]");
    if (!field) return;
    updateAdminTablePlanField(field.dataset.adminTableField, field.value);
    renderAdminTablePlan();
  });

  $("#adminContent")?.addEventListener("change", (event) => {
    const zoneField = event.target.closest("[data-admin-zone-field]");
    if (zoneField) {
      updateAdminTablePlanZoneField(zoneField.dataset.adminZoneField, zoneField.type === "checkbox" ? zoneField.checked : zoneField.value);
      renderAdminTablePlan();
      return;
    }
    const field = event.target.closest("[data-admin-table-field]");
    if (!field) return;
    updateAdminTablePlanField(field.dataset.adminTableField, field.value);
    renderAdminTablePlan();
  });

  $("#adminContent")?.addEventListener("input", (event) => {
    if (!event.target.matches("#adminReportSearch")) return;
    const nextValue = event.target.value || "";
    state.adminReportSearch = nextValue;
    renderAdminReports();
    const field = $("#adminReportSearch");
    if (field) {
      field.focus();
      const end = nextValue.length;
      try {
        field.setSelectionRange(end, end);
      } catch (error) {
        // Ignore browsers without setSelectionRange for search inputs.
      }
    }
  });

  $("#adminContent")?.addEventListener("click", async (event) => {
    const exportDayButton = event.target.closest("[data-export-day-report]");
    if (exportDayButton) {
      exportDayReport(exportDayButton.dataset.exportDayReport);
      return;
    }
    const printReportButton = event.target.closest("[data-print-day-report]");
    if (printReportButton) {
      printDayReportFromChef(printReportButton.dataset.printDayReport, printReportButton);
      return;
    }
    const quickZoneField = event.target.closest("[data-admin-zone-quick]");
    if (quickZoneField) {
      await quickEditAdminTablePlanZoneField(quickZoneField.dataset.adminZoneId, quickZoneField.dataset.adminZoneQuick);
      return;
    }
    const quickTableField = event.target.closest("[data-admin-table-quick]");
    if (quickTableField) {
      await quickEditAdminTablePlanField(quickTableField.dataset.adminTableId, quickTableField.dataset.adminTableQuick);
      return;
    }
    if (Date.now() < Number(state.adminTablePlanSuppressClickUntil || 0) && event.target.closest("[data-admin-table-select]")) {
      state.adminTablePlanSuppressClickUntil = 0;
      return;
    }
    if (Date.now() < Number(state.adminTablePlanSuppressClickUntil || 0) && event.target.closest("[data-admin-zone-select]")) {
      state.adminTablePlanSuppressClickUntil = 0;
      return;
    }
    if (event.target.closest("[data-admin-table-resize]") || event.target.closest("[data-admin-zone-resize]")) return;
    const tableButton = event.target.closest("[data-admin-table-select]");
    if (tableButton) {
      loadAdminTablePlanDraft(tableButton.dataset.adminTableSelect);
      renderAdminTablePlan();
      return;
    }
    const zoneButton = event.target.closest("[data-admin-zone-select]");
    if (zoneButton) {
      loadAdminTablePlanZoneDraft(zoneButton.dataset.adminZoneSelect);
      renderAdminTablePlan();
      return;
    }
    const editCustomButton = event.target.closest("[data-admin-table-edit]");
    if (editCustomButton) {
      loadAdminTablePlanDraft(editCustomButton.dataset.adminTableEdit);
      renderAdminTablePlan();
      return;
    }
    if (event.target.closest("#resetAdminTablePlanDraft")) {
      resetAdminTablePlanDraft();
      renderAdminTablePlan();
      return;
    }
    if (event.target.closest("#duplicateAdminTablePlanEntry")) {
      duplicateAdminTablePlanDraft();
      return;
    }
    const saveAdminTableButton = event.target.closest("#saveAdminTablePlanEntry");
    if (saveAdminTableButton) {
      await saveAdminTablePlanEntry(saveAdminTableButton);
      return;
    }
    const deleteAdminTableButton = event.target.closest("#deleteAdminTablePlanEntry");
    if (deleteAdminTableButton) {
      await deleteAdminTablePlanEntry(deleteAdminTableButton);
      return;
    }
    const saveAdminZoneButton = event.target.closest("#saveAdminTablePlanZone");
    if (saveAdminZoneButton) {
      await saveAdminTablePlanZone(saveAdminZoneButton);
      return;
    }
    const deleteAdminZoneButton = event.target.closest("#deleteAdminTablePlanZone");
    if (deleteAdminZoneButton) {
      await deleteAdminTablePlanZone(deleteAdminZoneButton);
    }
  });

  $("#adminTablePlanBoard")?.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-admin-inline-edit]")) return;
    const zoneResizeHandle = event.target.closest("[data-admin-zone-resize]");
    if (zoneResizeHandle) {
      beginAdminTablePlanInteraction(event, "resize", zoneResizeHandle.dataset.adminZoneResize, "zone");
      return;
    }
    const zoneButton = event.target.closest("[data-admin-zone-select]");
    if (zoneButton) {
      beginAdminTablePlanInteraction(event, "drag", zoneButton.dataset.adminZoneSelect, "zone");
      return;
    }
    const resizeHandle = event.target.closest("[data-admin-table-resize]");
    if (resizeHandle) {
      beginAdminTablePlanInteraction(event, "resize", resizeHandle.dataset.adminTableResize);
      return;
    }
    const tableButton = event.target.closest("[data-admin-table-select]");
    if (!tableButton) return;
    beginAdminTablePlanInteraction(event, "drag", tableButton.dataset.adminTableSelect);
  });

  window.addEventListener("pointermove", (event) => {
    updateAdminTablePlanInteraction(event);
  });

  window.addEventListener("pointerup", async (event) => {
    await endAdminTablePlanInteraction(event);
  });

  window.addEventListener("pointercancel", (event) => {
    endAdminTablePlanInteraction(event);
  });

  $("#adminEmployeeOverview")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-save-timesheet]");
    if (!button) return;
    saveAdminTimesheet(button);
  });

  $("#adminOffers")?.addEventListener("input", (event) => {
    if (event.target.id === "offerCustomerSearch") {
      state.offerCustomerSearch = event.target.value || "";
      renderAdminOffers();
      $("#offerCustomerSearch")?.focus();
      return;
    }
    state.offerDraftDirty = true;
  });

  $("#adminOffers")?.addEventListener("change", (event) => {
    state.offerDraftDirty = true;
    if (offerFieldNeedsLiveRefresh(event.target)) {
      const fieldName = event.target.dataset?.offerField || "";
      const focusSelector = fieldName ? `[data-offer-field="${cssEscape(fieldName)}"]` : "";
      refreshOfferEditorComputedView(focusSelector);
    }
  });

  $("#adminOffers")?.addEventListener("click", async (event) => {
    const selectOffer = event.target.closest("[data-select-offer]");
    if (selectOffer) {
      if (state.offerDraftDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
      const offer = normalizeOffersClient(state.offers || []).find((item) => item.id === selectOffer.dataset.selectOffer);
      if (!offer) return;
      setOfferDraftFromOffer(offer);
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const newOffer = event.target.closest("[data-offer-new]");
    if (newOffer) {
      if (state.offerDraftDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
      newOfferDraft();
      return;
    }
    const saveOffer = event.target.closest("[data-offer-save]");
    if (saveOffer) {
      await saveCurrentOffer(saveOffer);
      return;
    }
    const duplicateOffer = event.target.closest("[data-offer-duplicate]");
    if (duplicateOffer) {
      duplicateCurrentOffer();
      return;
    }
    const archiveOffer = event.target.closest("[data-offer-toggle-archive]");
    if (archiveOffer) {
      toggleCurrentOfferArchive();
      return;
    }
    const deleteOffer = event.target.closest("[data-offer-delete]");
    if (deleteOffer) {
      await deleteCurrentOffer(deleteOffer);
      return;
    }
    const printOffer = event.target.closest("[data-offer-print]");
    if (printOffer) {
      printOfferDraft();
      return;
    }
    const applyTemplate = event.target.closest("[data-offer-apply-template]");
    if (applyTemplate) {
      const templateKey = currentOfferDraftFromDom().buffet.templateKey || $("#adminOffers")?.querySelector('[data-offer-field="buffetTemplateKey"]')?.value || "";
      if (!templateKey) {
        showToast("Bitte eine Buffet-Vorlage wählen.");
        return;
      }
      applyOfferTemplate(templateKey);
      return;
    }
    const applyCustomer = event.target.closest("[data-offer-apply-customer]");
    if (applyCustomer) {
      const draft = currentOfferDraftFromDom();
      const customerId = draft.customerDirectoryId || $("#adminOffers")?.querySelector('[data-offer-field="customerDirectoryId"]')?.value || "";
      const customer = normalizeCustomerDirectory(state.customerDirectory).find((item) => item.id === customerId);
      if (!customer) {
        showToast("Bitte zuerst einen Kunden aus dem Kundenstamm wählen.");
        return;
      }
      draft.customerDirectoryId = customer.id;
      draft.customerName = customer.name || draft.customerName;
      draft.customerContact = customer.contact || draft.customerContact;
      draft.customerEmail = customer.email || draft.customerEmail;
      draft.customerPhone = customer.phone || draft.customerPhone;
      draft.customerAddress = customer.address || draft.customerAddress;
      if (!draft.title || draft.title === "Neues Angebot") {
        draft.title = `Angebot ${customer.name || "Kunde"}`;
      }
      state.offerDraft = normalizeOfferClient(draft);
      state.offerDraftId = state.offerDraft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      showToast("Kundendaten aus dem Stamm übernommen.");
      return;
    }
    const addDish = event.target.closest("[data-offer-add-dish]");
    if (addDish) {
      const draft = currentOfferDraftFromDom();
      const category = addDish.dataset.offerAddDish;
      draft.buffet.categories[category] ||= [];
      draft.buffet.categories[category].push({ id: cryptoId(), name: "", note: "" });
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const insertAssortment = event.target.closest("[data-offer-insert-assortment]");
    if (insertAssortment) {
      const draft = currentOfferDraftFromDom();
      const category = insertAssortment.dataset.offerInsertAssortment;
      const section = insertAssortment.closest("[data-offer-category]");
      const select = section?.querySelector(`[data-offer-assortment-select="${cssEscape(category || "")}"]`);
      const assortmentIndex = Number(select?.value ?? -1);
      const assortment = offerDishAssortmentForCategory(category);
      const selectedDish = Number.isInteger(assortmentIndex) && assortmentIndex >= 0 ? assortment[assortmentIndex] : null;
      if (!category || !selectedDish) {
        showToast("Bitte zuerst ein Gericht aus dem Sortiment wählen.");
        return;
      }
      draft.buffet.categories[category] ||= [];
      draft.buffet.categories[category].push({ id: cryptoId(), name: selectedDish.name, note: "" });
      state.offerDraft = normalizeOfferClient(draft);
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      showToast("Gericht aus dem Sortiment eingefügt.");
      return;
    }
    const removeDish = event.target.closest("[data-offer-remove-dish]");
    if (removeDish) {
      const row = removeDish.closest("[data-offer-dish-row]");
      const category = row?.dataset.offerDishRow;
      const id = row?.dataset.offerDishId;
      if (!category || !id) return;
      const draft = currentOfferDraftFromDom();
      draft.buffet.categories[category] = (draft.buffet.categories[category] || []).filter((item) => item.id !== id);
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const moveDish = event.target.closest("[data-offer-move-dish]");
    if (moveDish) {
      const row = moveDish.closest("[data-offer-dish-row]");
      const category = row?.dataset.offerDishRow;
      const id = row?.dataset.offerDishId;
      if (!category || !id) return;
      const draft = currentOfferDraftFromDom();
      draft.buffet.categories[category] = moveOfferRow(draft.buffet.categories[category] || [], id, moveDish.dataset.offerMoveDish);
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const addTimeline = event.target.closest("[data-offer-add-timeline]");
    if (addTimeline) {
      const draft = currentOfferDraftFromDom();
      draft.timeline.push({ id: cryptoId(), time: "", title: "", note: "" });
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const removeTimeline = event.target.closest("[data-offer-remove-timeline]");
    if (removeTimeline) {
      const row = removeTimeline.closest("[data-offer-timeline-row]");
      const id = row?.dataset.offerTimelineId;
      if (!id) return;
      const draft = currentOfferDraftFromDom();
      draft.timeline = (draft.timeline || []).filter((item) => item.id !== id);
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const moveTimeline = event.target.closest("[data-offer-move-timeline]");
    if (moveTimeline) {
      const row = moveTimeline.closest("[data-offer-timeline-row]");
      const id = row?.dataset.offerTimelineId;
      if (!id) return;
      const draft = currentOfferDraftFromDom();
      draft.timeline = moveOfferRow(draft.timeline || [], id, moveTimeline.dataset.offerMoveTimeline);
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const addCost = event.target.closest("[data-offer-add-cost]");
    if (addCost) {
      const draft = currentOfferDraftFromDom();
      draft.costs.push({ id: cryptoId(), label: "", quantity: 0, unitPrice: 0, note: "" });
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const removeCost = event.target.closest("[data-offer-remove-cost]");
    if (removeCost) {
      const row = removeCost.closest("[data-offer-cost-row]");
      const id = row?.dataset.offerCostId;
      if (!id) return;
      const draft = currentOfferDraftFromDom();
      draft.costs = (draft.costs || []).filter((item) => item.id !== id);
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
      return;
    }
    const moveCost = event.target.closest("[data-offer-move-cost]");
    if (moveCost) {
      const row = moveCost.closest("[data-offer-cost-row]");
      const id = row?.dataset.offerCostId;
      if (!id) return;
      const draft = currentOfferDraftFromDom();
      draft.costs = moveOfferRow(draft.costs || [], id, moveCost.dataset.offerMoveCost);
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      renderAdminOffers();
    }
  });

  $("#adminContent")?.addEventListener("change", (event) => {
    if (event.target.matches("#adminReportDate")) {
      state.adminReportDate = event.target.value || defaultAdminReportDate();
      renderAdminReports();
      return;
    }
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
    const tablePlanViewButton = event.target.closest("[data-table-plan-view]");
    if (tablePlanViewButton) {
      setTerminalTableView(tablePlanViewButton.dataset.tablePlanView);
      return;
    }
    const tablePlanFullscreenButton = event.target.closest("#toggleTablePlanFullscreen");
    if (tablePlanFullscreenButton) {
      toggleTerminalTableFullscreen();
      return;
    }
    const loadTodayTablePlanButton = event.target.closest("#loadTodayTablePlan");
    if (loadTodayTablePlanButton) {
      await loadTerminalTableDate(state.terminalTableInfo?.todayDate || todayKey());
      return;
    }
    const tableButton = event.target.closest("[data-table-plan-select]");
    if (tableButton) {
      toggleTerminalTableSelection(String(tableButton.dataset.tablePlanSelect || "").split(","));
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const editReservationButton = event.target.closest("[data-table-plan-edit]");
    if (editReservationButton) {
      loadTerminalTableDraft(editReservationButton.dataset.tablePlanEdit);
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const resetTablePlanButton = event.target.closest("#resetTablePlanDraft");
    if (resetTablePlanButton) {
      resetTerminalTableDraft();
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const newReservationForSelectionButton = event.target.closest("#newTablePlanReservationForSelection");
    if (newReservationForSelectionButton) {
      startNewTerminalTableReservation();
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const connectSelectedTablesButton = event.target.closest("#connectSelectedTables");
    if (connectSelectedTablesButton) {
      await connectSelectedTerminalTables(connectSelectedTablesButton);
      return;
    }
    const disconnectSelectedTablesButton = event.target.closest("#disconnectSelectedTables");
    if (disconnectSelectedTablesButton) {
      await disconnectSelectedTerminalTables(disconnectSelectedTablesButton);
      return;
    }
    const resetTablePlanGroupButton = event.target.closest("#resetTablePlanGroupDraft");
    if (resetTablePlanGroupButton) {
      resetTerminalTableGroupDraft();
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const resetTablePlanStaffButton = event.target.closest("#resetTablePlanStaffDraft");
    if (resetTablePlanStaffButton) {
      resetTerminalTableStaffDraft();
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const saveTablePlanButton = event.target.closest("#saveTablePlanReservation");
    if (saveTablePlanButton) {
      await saveTerminalTableReservation(saveTablePlanButton);
      return;
    }
    const deleteTablePlanButton = event.target.closest("#deleteTablePlanReservation");
    if (deleteTablePlanButton) {
      await deleteTerminalTableReservation(deleteTablePlanButton);
      return;
    }
    const saveTablePlanConfigButton = event.target.closest("#saveTablePlanConfig");
    if (saveTablePlanConfigButton) {
      await saveTerminalTableConfig(saveTablePlanConfigButton);
      return;
    }
    const fillTablePlanCustomFromSelectionButton = event.target.closest("#fillTablePlanCustomFromSelection");
    if (fillTablePlanCustomFromSelectionButton) {
      if (terminalTableUseSelectionForCustomDraft()) {
        renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      }
      return;
    }
    const resetTablePlanCustomButton = event.target.closest("#resetTablePlanCustom");
    if (resetTablePlanCustomButton) {
      resetTerminalTableCustomDraft();
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const saveTablePlanCustomButton = event.target.closest("#saveTablePlanCustom");
    if (saveTablePlanCustomButton) {
      await saveTerminalTableCustom(saveTablePlanCustomButton);
      return;
    }
    const deleteTablePlanCustomButton = event.target.closest("#deleteTablePlanCustom");
    if (deleteTablePlanCustomButton) {
      await deleteTerminalTableCustom(deleteTablePlanCustomButton);
      return;
    }
    const editTablePlanCustomButton = event.target.closest("[data-table-plan-custom-edit]");
    if (editTablePlanCustomButton) {
      loadTerminalTableCustomDraft(editTablePlanCustomButton.dataset.tablePlanCustomEdit);
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const deleteTablePlanCustomCardButton = event.target.closest("[data-table-plan-custom-delete]");
    if (deleteTablePlanCustomCardButton) {
      await deleteTerminalTableCustom(deleteTablePlanCustomCardButton, deleteTablePlanCustomCardButton.dataset.tablePlanCustomDelete);
      return;
    }
    const editTablePlanGroupButton = event.target.closest("[data-table-plan-group-edit]");
    if (editTablePlanGroupButton) {
      loadTerminalTableGroupDraft(editTablePlanGroupButton.dataset.tablePlanGroupEdit);
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const deleteTablePlanGroupCardButton = event.target.closest("[data-table-plan-group-delete]");
    if (deleteTablePlanGroupCardButton) {
      await deleteTerminalTableGroup(deleteTablePlanGroupCardButton, deleteTablePlanGroupCardButton.dataset.tablePlanGroupDelete);
      return;
    }
    const saveTablePlanGroupButton = event.target.closest("#saveTablePlanGroup");
    if (saveTablePlanGroupButton) {
      await saveTerminalTableGroup(saveTablePlanGroupButton);
      return;
    }
    const deleteTablePlanGroupButton = event.target.closest("#deleteTablePlanGroup");
    if (deleteTablePlanGroupButton) {
      await deleteTerminalTableGroup(deleteTablePlanGroupButton);
      return;
    }
    const editTablePlanStaffButton = event.target.closest("[data-table-plan-staff-edit]");
    if (editTablePlanStaffButton) {
      loadTerminalTableStaffDraft(editTablePlanStaffButton.dataset.tablePlanStaffEdit);
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const deleteTablePlanStaffCardButton = event.target.closest("[data-table-plan-staff-delete]");
    if (deleteTablePlanStaffCardButton) {
      await deleteTerminalTableStaff(deleteTablePlanStaffCardButton, deleteTablePlanStaffCardButton.dataset.tablePlanStaffDelete);
      return;
    }
    const saveTablePlanStaffButton = event.target.closest("#saveTablePlanStaff");
    if (saveTablePlanStaffButton) {
      await saveTerminalTableStaff(saveTablePlanStaffButton);
      return;
    }
    const deleteTablePlanStaffButton = event.target.closest("#deleteTablePlanStaff");
    if (deleteTablePlanStaffButton) {
      await deleteTerminalTableStaff(deleteTablePlanStaffButton);
      return;
    }
    const printTablePlanButton = event.target.closest("#printTablePlanList");
    if (printTablePlanButton) {
      printTerminalTablePlanList();
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

  $("#terminalTablesSection")?.addEventListener("input", (event) => {
    const field = event.target.closest("[data-table-plan-field]");
    if (field) {
      updateTerminalTableDraftField(field.dataset.tablePlanField, field.value);
      return;
    }
    const groupField = event.target.closest("[data-table-plan-group-field]");
    if (groupField) {
      updateTerminalTableGroupField(groupField.dataset.tablePlanGroupField, groupField.value);
      return;
    }
    const customField = event.target.closest("[data-table-plan-custom-field]");
    if (customField) {
      updateTerminalTableCustomField(customField.dataset.tablePlanCustomField, customField.value);
      return;
    }
    const staffField = event.target.closest("[data-table-plan-staff-field]");
    if (!staffField) return;
    updateTerminalTableStaffField(staffField.dataset.tablePlanStaffField, staffField.value);
  });

  $("#terminalTablesSection")?.addEventListener("change", (event) => {
    const tableDateInput = event.target.closest("#tablePlanDate");
    if (tableDateInput) {
      loadTerminalTableDate(tableDateInput.value || "");
      return;
    }
    const sortSelect = event.target.closest("#tablePlanSort");
    if (sortSelect) {
      state.terminalTableSort = sortSelect.value || "time";
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const groupField = event.target.closest("[data-table-plan-group-field]");
    if (groupField) {
      updateTerminalTableGroupField(groupField.dataset.tablePlanGroupField, groupField.value);
      return;
    }
    const customField = event.target.closest("[data-table-plan-custom-field]");
    if (customField) {
      updateTerminalTableCustomField(customField.dataset.tablePlanCustomField, customField.value);
      return;
    }
    const staffField = event.target.closest("[data-table-plan-staff-field]");
    if (!staffField) return;
    updateTerminalTableStaffField(staffField.dataset.tablePlanStaffField, staffField.value);
  });

  $("#tablePlanBoard")?.addEventListener("dragstart", (event) => {
    const table = event.target.closest("[data-table-plan-select]");
    if (!table) return;
    const selection = String(table.dataset.tablePlanSelect || "").split(",");
    beginTerminalTableDrag(selection);
    try {
      event.dataTransfer?.setData("text/plain", String(table.dataset.tablePlanSelect || ""));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "copy";
    } catch {}
  });

  $("#tablePlanBoard")?.addEventListener("dragover", (event) => {
    const target = event.target.closest("[data-table-plan-select]");
    if (!target) return;
    const sourceId = state.terminalTableDragId || "";
    const targetId = String(target.dataset.tablePlanSelect || "");
    if (!terminalTableSetsAreAdjacent(sourceId, targetId)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  });

  $("#tablePlanBoard")?.addEventListener("drop", (event) => {
    const target = event.target.closest("[data-table-plan-select]");
    if (!target) return;
    event.preventDefault();
    const sourceId = state.terminalTableDragId || "";
    const targetId = String(target.dataset.tablePlanSelect || "");
    if (connectTerminalTablesByDrag(sourceId, targetId)) {
      showToast("Tische verbunden. Jetzt Tafel speichern und eine Tischnummer vergeben.");
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    }
    endTerminalTableDrag();
  });

  $("#tablePlanBoard")?.addEventListener("dragend", () => {
    endTerminalTableDrag();
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
    const copyCustomerButton = event.target.closest("[data-copy-invoice-customer]");
    if (copyCustomerButton) {
      const row = copyCustomerButton.closest('[data-report-entry="invoice"]');
      copyText(invoiceRowCustomerCopyValue(row));
      return;
    }
    const copyTotalButton = event.target.closest("[data-copy-invoice-total]");
    if (copyTotalButton) {
      const row = copyTotalButton.closest('[data-report-entry="invoice"]');
      copyText(invoiceRowTotalCopyValue(row));
      return;
    }
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
