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
  chefReportMonth: "",
  chefInvoiceFolder: "",
  chefInvoiceItemOpen: "",
  chefReportSearch: "",
  chefSearchScope: "all",
  chefSearchMonthOnly: false,
  chefSearchOpenInvoicesOnly: false,
  chefSearchMissingDocsOnly: false,
  chefExportMonth: "",
  adminReportDate: "",
  adminReportMonth: "",
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
  terminalTab: "today",
  terminalClosingStep: 1,
  terminalPentacodeCopied: {},
  terminalPentacodeComplete: false,
  terminalManualReportCopied: {},
  terminalManualReportComplete: false,
  terminalDocumentsComplete: false,
  terminalDate: "",
  terminalInvoiceToolView: "current",
  terminalInvoiceDate: "",
  terminalInvoiceHistory: [],
  terminalOpenDates: [],
  terminalOpenDaysExpanded: false,
  terminalEntries: {},
  terminalReport: {},
  terminalTableDraft: null,
  terminalTableQuickEntry: false,
  terminalTableConnectMode: false,
  terminalTableGroupDraft: null,
  terminalTableCustomDraft: null,
  adminTablePlanDraft: null,
  adminTablePlanZoneDraft: null,
  terminalTableConfig: { seatsByTable: {}, tableOverrides: {}, customTables: [], zoneOverrides: {} },
  terminalTableInfo: { todayDate: "", todayAvailable: false, todayItems: 0, selectedItems: 0, selectedAvailable: false },
  terminalTableSort: "time",
  terminalTableDragId: "",
  terminalTablePlanInteraction: null,
  terminalTablePlanSuppressClickUntil: 0,
  terminalTableStaffDraft: null,
  terminalTableView: "work",
  terminalSettingsModule: "controls",
  terminalTableFullscreen: false,
  adminTablePlanInteraction: null,
  adminTablePlanSuppressClickUntil: 0,
  tipOverview: { employees: [], totalEarned: "0.00", totalPaid: "0.00", totalOpen: "0.00" },
  terminalSchedule: {},
  terminalTasks: [],
  terminalTaskTemplates: [],
  terminalTaskAreas: [],
  terminalTaskCalendarMonth: currentMonthValue(),
  terminalTaskCalendarDate: todayKey(),
  terminalTaskCalendarView: "month",
  terminalTaskAreaFilter: "all",
  terminalTaskTypeFilter: "all",
  terminalTaskStatusFilter: "active",
  terminalTaskSearch: "",
  terminalTasksExpanded: false,
  terminalMessagesExpanded: false,
  terminalReminders: [],
  terminalCleaningTemplates: [],
  terminalWeeklyCleaningCompletions: {},
  pendingToiletCheck: "",
  pendingReminder: null,
  terminalReminderRefreshInFlight: false,
  timesheetRefreshInFlight: false,
  terminalControls: [],
  terminalControlDraftId: "",
  terminalControlDeleteId: "",
  terminalManualToiletCheckKey: "",
  terminalDayMetaEditing: false,
  terminalCorrectionMode: false,
  invoiceTerminalToken: window.localStorage?.getItem("invoiceTerminalToken") || "",
  invoiceDate: todayKey(),
  invoiceReport: {},
  invoiceDeskDraftId: "",
  invoiceDeskDraft: null,
  customerDirectory: [],
  invoiceSettings: null,
  invoices: [],
  invoiceAdminView: "overview",
  invoiceEditorId: "",
  invoiceEditorDraft: null,
  invoiceEditorDirty: false,
  invoiceSkipDomSync: false,
  invoiceSearch: "",
  offers: [],
  cocktails: [],
  cocktailMode: "recipes",
  cocktailCategory: "",
  cocktailSearch: "",
  offerDraft: null,
  offerDraftId: "",
  offerDraftDirty: false,
  offerCustomerSearch: "",
  offerEditorStep: 1,
  offerServiceExpanded: {},
  offerShoePersonsManual: false,
  taskTemplates: [],
  cleaningTemplates: [],
  reminderTemplates: [],
  plannerEditWeeks: []
};

const loadedTimesheetMonths = new Set();
const NEW_INVOICE_PROGRAM_ENABLED = false;

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
const TERMINAL_CONTROL_STORAGE_KEY = "la-bowling-terminal-controls-v1";
const defaultTerminalControls = [
  {
    id: "control-toilets",
    name: "Toiletten",
    icon: "WC",
    area: "Sanitär",
    intervalType: "hourly",
    intervalValue: 1,
    startTime: "17:00",
    responsible: "Service",
    active: true,
    status: "overdue",
    lastLabel: "13:25 Uhr",
    nextLabel: "14:25 Uhr"
  },
  {
    id: "control-softener",
    name: "Wasserenthärtung",
    icon: "◉",
    area: "Technik",
    intervalType: "daily",
    intervalValue: 1,
    startTime: "07:40",
    responsible: "Schichtleitung",
    active: true,
    status: "ok",
    lastLabel: "heute 07:40 Uhr",
    nextLabel: "morgen 07:40 Uhr"
  },
  {
    id: "control-compressor",
    name: "PC Kompressor",
    icon: "⚙",
    area: "Technik",
    intervalType: "weekly",
    intervalValue: 1,
    startTime: "10:00",
    responsible: "Mechanik",
    active: true,
    status: "ok",
    lastLabel: "Montag 10:00 Uhr",
    nextLabel: "nächsten Montag 10:00 Uhr"
  }
];

function normalizeTerminalControl(control = {}) {
  const status = ["ok", "due", "overdue"].includes(control.status) ? control.status : "due";
  return {
    id: String(control.id || `control-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    name: String(control.name || "Neue Kontrolle").trim(),
    icon: String(control.icon || "✓"),
    area: String(control.area || "").trim(),
    intervalType: ["once", "hourly", "daily", "weekly", "monthly"].includes(control.intervalType)
      ? control.intervalType
      : "daily",
    intervalValue: Math.max(1, Number(control.intervalValue || 1)),
    startTime: String(control.startTime || ""),
    responsible: String(control.responsible || "").trim(),
    active: control.active !== false,
    status,
    lastLabel: String(control.lastLabel || "noch nicht"),
    nextLabel: String(control.nextLabel || "offen")
  };
}

function loadTerminalControls() {
  if (state.terminalControls.length) return state.terminalControls;
  try {
    const stored = JSON.parse(window.localStorage?.getItem(TERMINAL_CONTROL_STORAGE_KEY) || "[]");
    state.terminalControls = (Array.isArray(stored) && stored.length ? stored : defaultTerminalControls)
      .map(normalizeTerminalControl);
  } catch (error) {
    state.terminalControls = defaultTerminalControls.map(normalizeTerminalControl);
  }
  return state.terminalControls;
}

function saveTerminalControls() {
  window.localStorage?.setItem(TERMINAL_CONTROL_STORAGE_KEY, JSON.stringify(state.terminalControls));
}
const TERMINAL_TABLE_ZONES = [
  { id: "lanes", label: "Bahnen 1-14", x: 1.5, y: 4, w: 13, h: 76, className: "is-lanes" },
  { id: "nz-small", label: "T50 · NZ Klein", x: 17, y: 4, w: 20, h: 10, className: "is-room" },
  { id: "main-left", label: "Gastraum", x: 17, y: 16, w: 21, h: 33, className: "is-open" },
  { id: "dj", label: "DJ-Bereich", x: 39.5, y: 19.5, w: 14, h: 37, className: "is-open" },
  { id: "main-bottom", label: "Gastraum unten", x: 17, y: 53, w: 24, h: 24, className: "is-open" },
  { id: "nz-big", label: "NZ groß", x: 55, y: 3, w: 43, h: 42, className: "is-room" },
  { id: "hut", label: "Hütte", x: 55, y: 50, w: 43, h: 45, className: "is-room" }
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
  { id: "T30", label: "T30", area: "DJ-Bereich", seats: 4, x: 41.5, y: 23.5, w: 6.6, h: 5.4, shape: "table" },
  { id: "T31", label: "T31", area: "DJ-Bereich", seats: 4, x: 41.5, y: 31.5, w: 6.6, h: 5.4, shape: "table" },
  { id: "T32", label: "T32", area: "DJ-Bereich", seats: 4, x: 41.5, y: 39.5, w: 6.6, h: 5.4, shape: "table" },
  { id: "T33", label: "T33", area: "DJ-Bereich", seats: 4, x: 41.5, y: 47.5, w: 6.6, h: 5.4, shape: "table" },
  { id: "T20", label: "T20", area: "Gastraum", seats: 4, x: 20.5, y: 56.5, w: 6.2, h: 5.6, shape: "table" },
  { id: "T21", label: "T21", area: "Gastraum", seats: 4, x: 20.5, y: 64.5, w: 6.2, h: 5.6, shape: "table" },
  { id: "T23", label: "T23", area: "Gastraum", seats: 4, x: 29.5, y: 56.5, w: 6.2, h: 5.6, shape: "table" },
  { id: "T22", label: "T22", area: "Gastraum", seats: 4, x: 29.5, y: 64.5, w: 6.2, h: 5.6, shape: "table" },
  { id: "T60", label: "T60", area: "Nebenraum groß", seats: 4, x: 58, y: 10, w: 6.6, h: 6.2, shape: "table" },
  { id: "T70", label: "T70", area: "Hütte", seats: 4, x: 58, y: 57, w: 6.6, h: 6.2, shape: "table" },
  { id: "T104", label: "T104", area: "Billard", seats: 4, x: 62, y: 76, w: 8.7, h: 6.1, shape: "table" },
  { id: "T101", label: "T101", area: "Billard", seats: 4, x: 79, y: 76, w: 8.7, h: 6.1, shape: "table" },
  { id: "T103", label: "T103", area: "Billard", seats: 4, x: 62, y: 86, w: 8.7, h: 6.1, shape: "table" },
  { id: "T102", label: "T102", area: "Billard", seats: 4, x: 79, y: 86, w: 8.7, h: 6.1, shape: "table" }
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
  invoiceSettings: createDefaultInvoiceSettingsClient(),
  invoices: [],
  offers: [],
  dayReports: {},
  assignmentTimes: {},
  assignmentSchedules: {},
  availabilityChangeRequests: []
};

function createDefaultInvoiceSettingsClient() {
  return {
    companyName: "LA-Bowling Peter Vorholzer",
    companyAddress: "Röntgenstraße 12 a\n84030 Landshut",
    taxNumber: "",
    vatId: "",
    iban: "",
    bankName: "",
    bic: "",
    paymentDays: 14,
    defaultText: "Rechnung zu beiliegenden Einzelbelegen",
    colors: {
      primary: "#111827",
      accent: "#d71e28",
      muted: "#6b7280",
      line: "#dbe2ea",
      highlight: "#f4f6f8"
    },
    logoData: ""
  };
}

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

function formatShortTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
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

function mergeTimesheetMonths(current = {}, incoming = {}) {
  const merged = { ...(current || {}) };
  Object.entries(incoming || {}).forEach(([employee, entries]) => {
    merged[employee] = {
      ...(merged[employee] || {}),
      ...(entries || {})
    };
  });
  return merged;
}

async function ensureTimesheetsForReportDate(dateKey = "") {
  const month = String(dateKey || "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month) || loadedTimesheetMonths.has(month)) return;
  if (!state.adminToken && !state.employeeToken) return;
  const params = new URLSearchParams({
    month,
    nextMonth: availabilityMonthValue(),
    availabilityMonth: availabilityMonthValue()
  });
  if (state.employeeToken) params.set("employeeToken", state.employeeToken);
  if (state.adminToken) params.set("adminToken", state.adminToken);
  const data = await api(`/api/state?${params.toString()}`);
  state.timesheets = mergeTimesheetMonths(state.timesheets, data.timesheets || {});
  loadedTimesheetMonths.add(month);
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
  state.timesheets = mergeTimesheetMonths(state.timesheets, data.timesheets || {});
  // Public state responses intentionally contain no timesheets. Do not cache
  // that empty response, otherwise the month is skipped after login.
  if (Object.prototype.hasOwnProperty.call(data, "timesheets")) {
    loadedTimesheetMonths.add(state.selectedMonth);
  }
  state.messages = data.messages || [];
  state.terminalMessages = data.terminalMessages || [];
  state.pushPublicKey = data.pushPublicKey || "";
  state.pushSubscriptionActive = Boolean(data.pushSubscriptionActive);
  state.taskTemplates = data.taskTemplates || [];
  state.cleaningTemplates = normalizeCleaningTemplates(data.cleaningTemplates);
  state.reminderTemplates = normalizeReminderTemplates(data.reminderTemplates);
  state.customerDirectory = normalizeCustomerDirectory(data.customerDirectory || state.customerDirectory || []);
  state.invoiceSettings = normalizeInvoiceSettingsClient(data.invoiceSettings || state.invoiceSettings || createDefaultInvoiceSettingsClient());
  state.invoices = normalizeInvoicesClient(data.invoices || state.invoices || [], state.invoiceSettings);
  if (!state.invoiceEditorDraft || !state.invoices.some((invoice) => invoice.id === state.invoiceEditorDraft?.id)) {
    state.invoiceEditorDraft = state.invoices[0] ? cloneData(state.invoices[0]) : createBlankInvoiceDraftClient(state.invoiceSettings);
    state.invoiceEditorId = state.invoiceEditorDraft.id;
  }
  state.invoiceEditorDirty = false;
  state.offers = normalizeOffersClient(data.offers || state.offers || []);
  if (!state.offerDraft || !state.offers.some((offer) => offer.id === state.offerDraft?.id)) {
    state.offerDraft = state.offers[0] ? cloneData(state.offers[0]) : createBlankOfferDraft();
    state.offerDraftId = state.offerDraft.id;
    state.offerShoePersonsManual = Number(state.offerDraft.bowling?.shoePersons || 0) > 0;
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
  if (state.adminToken || state.isChef) {
    const reportDate = ensureChefReportDateSelection();
    if (reportDate) await ensureTimesheetsForReportDate(reportDate);
  }
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
    invoiceSettings: normalizeInvoiceSettingsClient(value?.invoiceSettings || base.invoiceSettings || createDefaultInvoiceSettingsClient()),
    invoices: normalizeInvoicesClient(value?.invoices || base.invoices || [], value?.invoiceSettings || base.invoiceSettings || createDefaultInvoiceSettingsClient()),
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
  const sourceType = ["event", "advertising", "manual"].includes(String(item.sourceType || "").trim())
    ? String(item.sourceType || "").trim()
    : "event";
  return {
    id: String(item.id || customerDirectoryKey(item) || cryptoId()),
    name: String(item.name || "").trim().slice(0, 160),
    contact: String(item.contact || "").trim().slice(0, 160),
    phone: String(item.phone || "").trim().slice(0, 80),
    email: String(item.email || "").trim().slice(0, 180),
    address: String(item.address || "").trim().slice(0, 600),
    paymentMethod: String(item.paymentMethod || "").trim().slice(0, 40),
    sourceType,
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
const OFFER_CONFERENCE_BASE_PRICE = 1125;
const OFFER_CONFERENCE_INCLUDED_PERSONS = 25;
const OFFER_CONFERENCE_EXTRA_PERSON_PRICE = 29.9;
const OFFER_BMW_TREASURE_PACKAGES = {
  package1: {
    name: "Paket 1",
    pricePerPerson: 43,
    food: "Speisenauswahl nach Karte",
    details: "2 Stunden Bowling inklusive Leihschuhe, 2 Getränkemarken pro Person und Essen nach Vorauswahl aus der Schatzkisten-Speisekarte.",
    note: "Für maximal 30 Personen. Die Speisenauswahl wird separat abgestimmt."
  },
  package2: {
    name: "Paket 2",
    pricePerPerson: 45,
    food: "Pizzabuffet all you can eat",
    details: "2 Stunden Bowling inklusive Leihschuhe, 2 Getränkemarken pro Person und Pizzabuffet all you can eat.",
    note: "Personenzahl unbegrenzt. Bitte die Anzahl der Gäste ohne Schweinefleisch bei der Reservierung angeben."
  },
  package3: {
    name: "Paket 3",
    pricePerPerson: 48,
    food: "Buffet LA-Bowling",
    details: "2 Stunden Bowling inklusive Leihschuhe, 2 Getränkemarken pro Person und Buffet LA-Bowling mit Vorspeise, Hauptspeisen und Dessert.",
    note: "Verfügbar ab 15 Personen."
  }
};
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
  drinksByMenu: {
    label: "Getränke nach Karte",
    enabled: true,
    text: "Getränke werden nach Verbrauch gemäß der aktuellen Getränkekarte berechnet."
  },
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
  const conference = offer.conference && typeof offer.conference === "object" ? offer.conference : {};
  return {
    id: String(offer.id || `offer-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    archived: offer.archived === true,
    confirmed: offer.confirmed === true,
    confirmedAt: offer.confirmed === true ? String(offer.confirmedAt || offer.updatedAt || new Date().toISOString()) : "",
    offerType: offer.offerType === "bmw-treasure" ? "bmw-treasure" : "standard",
    bmwTreasurePackage: OFFER_BMW_TREASURE_PACKAGES[offer.bmwTreasurePackage] ? offer.bmwTreasurePackage : "",
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
    sparklingReceptionPrice: offer.sparklingReceptionPrice == null ? OFFER_SPARKLING_RECEPTION_PRICE : cleanOfferMoneyValue(offer.sparklingReceptionPrice),
    campfireTime: cleanOfferTimeValue(offer.campfireTime),
    campfirePrice: offer.campfirePrice == null ? OFFER_CAMPFIRE_PRICE : cleanOfferMoneyValue(offer.campfirePrice),
    drinksMode: offer.drinksMode === "custom" ? "custom" : "menu",
    drinksCustomText: String(offer.drinksCustomText || "").trim().slice(0, 600),
    drinksCustomPrice: cleanOfferMoneyValue(offer.drinksCustomPrice),
    reservedArea: String(offer.reservedArea || "").trim().slice(0, 200),
    reservedAreaPrice: cleanOfferMoneyValue(offer.reservedAreaPrice),
    reservedAreaCampfire: offer.reservedAreaCampfire === true,
    customerDirectoryId: String(offer.customerDirectoryId || "").trim().slice(0, 120),
    additionalInfo: String(offer.additionalInfo || "").trim().slice(0, 2000),
    internalNote: String(offer.internalNote || "").trim().slice(0, 2000),
    conference: {
      enabled: conference.enabled === true,
      morningSnackText: String(conference.morningSnackText || "Butterbrezen und Müsliriegel").trim().slice(0, 600),
      morningSnackTime: cleanOfferTimeValue(conference.morningSnackTime)
    },
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
  if (!text) return "";
  const compact = text.replace(/[^0-9]/g, "");
  let hours = "";
  let minutes = "";
  if (/^\d{1,2}$/.test(text)) {
    hours = text;
    minutes = "00";
  } else if (/^\d{3,4}$/.test(compact) && !text.includes(":")) {
    const padded = compact.padStart(4, "0");
    hours = padded.slice(0, 2);
    minutes = padded.slice(2);
  } else {
    const match = text.match(/^(\d{1,2}):([0-5]?\d)$/);
    if (!match) return "";
    hours = match[1];
    minutes = match[2].padStart(2, "0");
  }
  const hourNumber = Number(hours);
  const minuteNumber = Number(minutes);
  if (hourNumber > 23 || minuteNumber > 59) return "";
  return `${String(hourNumber).padStart(2, "0")}:${String(minuteNumber).padStart(2, "0")}`;
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
    offerType: "standard",
    bmwTreasurePackage: "",
    personsAdults: 0,
    personsChildren: 0,
    startTime: "",
    mealTime: "",
    sparklingReceptionTime: "",
    sparklingReceptionPrice: OFFER_SPARKLING_RECEPTION_PRICE,
    campfireTime: "",
    campfirePrice: OFFER_CAMPFIRE_PRICE,
    drinksMode: "menu",
    drinksCustomText: "",
    drinksCustomPrice: 0,
    reservedArea: "",
    reservedAreaPrice: 0,
    reservedAreaCampfire: false,
    customerDirectoryId: "",
    additionalInfo: "",
    internalNote: "",
    conference: {
      enabled: false,
      morningSnackText: "Butterbrezen und Müsliriegel",
      morningSnackTime: ""
    },
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
  state.offerShoePersonsManual = Number(state.offerDraft.bowling?.shoePersons || 0) > 0;
}

function offerWorkspaceRoot() {
  if (state.terminalToken && state.terminalTab === "offers" && $("#terminalOffersWorkspace")) {
    return $("#terminalOffersWorkspace");
  }
  return $("#adminOffers") || $("#terminalOffersWorkspace");
}

function currentOfferDraftFromDom() {
  const root = offerWorkspaceRoot();
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
    offerType: field("offerType")?.value === "bmw-treasure" ? "bmw-treasure" : "standard",
    bmwTreasurePackage: String(field("bmwTreasurePackage")?.value || "").trim(),
    personsAdults: cleanOfferIntegerValue(field("personsAdults")?.value),
    personsChildren: cleanOfferIntegerValue(field("personsChildren")?.value),
    startTime: cleanOfferTimeValue(field("startTime")?.value),
    mealTime: cleanOfferTimeValue(field("mealTime")?.value),
    sparklingReceptionTime: cleanOfferTimeValue(field("sparklingReceptionTime")?.value),
    sparklingReceptionPrice: cleanOfferMoneyValue(field("sparklingReceptionPrice")?.value ?? base.sparklingReceptionPrice),
    campfireTime: cleanOfferTimeValue(field("campfireTime")?.value || base.campfireTime),
    campfirePrice: cleanOfferMoneyValue(field("campfirePrice")?.value ?? base.campfirePrice),
    drinksMode: root.querySelector('[data-offer-field="drinksMode"]:checked')?.value === "custom" ? "custom" : "menu",
    drinksCustomText: String(field("drinksCustomText")?.value || "").trim(),
    drinksCustomPrice: cleanOfferMoneyValue(field("drinksCustomPrice")?.value),
    reservedArea: simpleText("reservedArea"),
    reservedAreaPrice: cleanOfferMoneyValue(field("reservedAreaPrice")?.value),
    reservedAreaCampfire: field("reservedAreaCampfire")?.checked === true,
    customerDirectoryId: simpleText("customerDirectoryId"),
    additionalInfo: String(field("additionalInfo")?.value || "").trim(),
    internalNote: String(field("internalNote")?.value || "").trim(),
    conference: {
      enabled: field("conferenceEnabled")?.checked === true,
      morningSnackText: String(field("conferenceMorningSnackText")?.value || "").trim(),
      morningSnackTime: cleanOfferTimeValue(field("conferenceMorningSnackTime")?.value)
    },
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
  draft.textBlocks.drinksByMenu.enabled = draft.drinksMode !== "custom" && !draft.conference?.enabled;
  draft.textBlocks.drinksByMenu.text = OFFER_TEXT_BLOCK_DEFAULTS.drinksByMenu.text;
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
  const sparklingReceptionPrice = cleanOfferMoneyValue(draft.sparklingReceptionPrice);
  const sparklingReceptionTotal = draft.buffet?.sparklingReception
    ? Math.round(chargedUnits * sparklingReceptionPrice * 100) / 100
    : 0;
  return {
    adults,
    children,
    chargedUnits,
    pricePerPerson,
    sparklingReceptionPrice,
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
  } else if (reservedArea === "grosses-nebenzimmer" && !draft.conference?.enabled && !buffetPricing.hasBuffet && !hasBowling) {
    roomFee = OFFER_LARGE_ROOM_ONLY_PRICE;
    roomFeeLabel = "Raummiete großes Nebenzimmer";
  }
  const campfireFee = draft.reservedAreaCampfire ? cleanOfferMoneyValue(draft.campfirePrice) : 0;
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

function offerBmwTreasurePricing(offer) {
  const packageKey = offer?.offerType === "bmw-treasure" ? String(offer?.bmwTreasurePackage || "") : "";
  const selectedPackage = OFFER_BMW_TREASURE_PACKAGES[packageKey] || null;
  const persons = offerPersonCount(offer);
  return {
    packageKey,
    selectedPackage,
    persons,
    total: selectedPackage ? Math.round(persons * selectedPackage.pricePerPerson * 100) / 100 : 0
  };
}

function offerTotals(offer) {
  const draft = normalizeOfferClient(offer || {});
  const personCount = offerPersonCount(draft);
  const buffetPricing = offerBuffetPricing(draft);
  const bowlingPricing = offerBowlingPricing(draft.eventDate, draft.bowling);
  const reservedAreaPricing = offerReservedAreaPricing(draft);
  const bmwTreasurePricing = offerBmwTreasurePricing(draft);
  const extraRows = (draft.costs || []).reduce((sum, row) => sum + (cleanOfferMoneyValue(row.quantity) * cleanOfferMoneyValue(row.unitPrice)), 0);
  const drinksTotal = draft.drinksMode === "custom" ? cleanOfferMoneyValue(draft.drinksCustomPrice) : 0;
  const conferenceExtraPersons = draft.conference?.enabled ? Math.max(0, personCount - OFFER_CONFERENCE_INCLUDED_PERSONS) : 0;
  const conferenceBaseTotal = draft.conference?.enabled ? OFFER_CONFERENCE_BASE_PRICE : 0;
  const conferenceExtraTotal = Math.round(conferenceExtraPersons * OFFER_CONFERENCE_EXTRA_PERSON_PRICE * 100) / 100;
  const conferenceTotal = conferenceBaseTotal + conferenceExtraTotal;
  const total = bmwTreasurePricing.total + conferenceTotal + buffetPricing.total + bowlingPricing.total + reservedAreaPricing.total + drinksTotal + extraRows;
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
    drinksTotal,
    conferenceBaseTotal,
    conferenceExtraPersons,
    conferenceExtraTotal,
    conferenceTotal,
    bmwTreasureTotal: bmwTreasurePricing.total,
    bmwTreasurePackage: bmwTreasurePricing.selectedPackage,
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
  if (draft.conference?.enabled) {
    push(draft.conference.morningSnackTime, "Vormittagssnack", draft.conference.morningSnackText || "", 15);
  }
  if (draft.buffet?.sparklingReception) {
    push(draft.sparklingReceptionTime, "Sektempfang", "Optional zum Buffet gebucht", 20);
  }
  if (draft.reservedAreaCampfire) {
    push(draft.campfireTime, "Lagerfeuer", "Lagerfeuerstelle mit Feuerholz", 35);
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
  $("#appTitle").textContent = isCustomerInvoiceMode() ? "Veranstaltungen auf Rechnung" : isTodoMode() ? "TO DO" : state.settings.businessName;
  if ($("#customerInvoiceDate")) $("#customerInvoiceDate").value = invoiceSafeDate(state.invoiceDate, todayKey());
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
  renderAdminInvoices();
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
  return params.has("terminal") || params.has("cocktails") || window.location.pathname.startsWith("/cocktails") || window.location.hash === "#terminal" || window.location.hash === "#cocktails";
}

function isCocktailOnlyMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has("cocktails") || window.location.pathname.startsWith("/cocktails") || window.location.hash === "#cocktails";
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
          ${reportCalendarHtml("chef", selectedChefReportDate)}
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
      <span>Noch nicht fertig für den Chef. In „Veranstaltungen auf Rechnung“ Betrag und Beleg ergänzen, dann „Fertig für Chef“ drücken.</span>
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
    state.chefReportMonth = "";
    return "";
  }
  if (!state.chefReportDate || !availableDates.has(state.chefReportDate)) {
    state.chefReportDate = defaultChefReportDate();
  }
  if (!/^\d{4}-\d{2}$/.test(String(state.chefReportMonth || ""))) {
    state.chefReportMonth = state.chefReportDate.slice(0, 7);
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
    state.adminReportMonth = "";
    return "";
  }
  if (!state.adminReportDate || !availableDates.has(state.adminReportDate)) {
    state.adminReportDate = defaultAdminReportDate();
  }
  if (!/^\d{4}-\d{2}$/.test(String(state.adminReportMonth || ""))) {
    state.adminReportMonth = state.adminReportDate.slice(0, 7);
  }
  return state.adminReportDate;
}

function reportCalendarMonthKey(mode = "chef") {
  return mode === "admin" ? "adminReportMonth" : "chefReportMonth";
}

function setReportCalendarSelection(mode = "chef", dateKey = "") {
  if (mode === "admin") {
    state.adminReportDate = dateKey || defaultAdminReportDate();
    state.adminReportMonth = (dateKey || state.adminReportDate || todayKey()).slice(0, 7);
    return;
  }
  state.chefReportDate = dateKey || defaultChefReportDate();
  state.chefReportMonth = (dateKey || state.chefReportDate || todayKey()).slice(0, 7);
}

function ensureReportCalendarMonth(mode = "chef", selectedDate = "") {
  const key = reportCalendarMonthKey(mode);
  const fallback = String(selectedDate || "").slice(0, 7) || reportMonthsSorted()[0] || currentMonthValue();
  if (!/^\d{4}-\d{2}$/.test(String(state[key] || ""))) {
    state[key] = fallback;
  }
  return state[key];
}

function reportCalendarHtml(mode = "chef", selectedDate = "") {
  const currentMonth = ensureReportCalendarMonth(mode, selectedDate);
  const weeks = calendarWeeksForMonth(currentMonth);
  const availableDates = new Set(sortedChefReportEntries().map(([dateKey]) => dateKey));
  return `
    <section class="report-mini-calendar" data-report-calendar="${mode}">
      <div class="report-mini-calendar-head">
        <button class="report-mini-calendar-nav" type="button" data-report-calendar-nav="${mode}|prev" aria-label="Vorheriger Monat">&#8249;</button>
        <strong>${escapeHtml(formatCalendarMonthLabel(currentMonth))}</strong>
        <button class="report-mini-calendar-nav" type="button" data-report-calendar-nav="${mode}|next" aria-label="Nächster Monat">&#8250;</button>
      </div>
      <div class="report-mini-calendar-weekdays">
        ${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => `<span>${day}</span>`).join("")}
      </div>
      <div class="report-mini-calendar-grid">
        ${weeks.map((week) => week.map((day) => reportCalendarDayHtml(mode, day, selectedDate, availableDates)).join("")).join("")}
      </div>
    </section>
  `;
}

function reportCalendarDayHtml(mode, day, selectedDate, availableDates = new Set()) {
  const dateKey = isoDate(day.date);
  const hasReport = availableDates.has(dateKey);
  const isSelected = selectedDate === dateKey;
  const isToday = todayKey() === dateKey;
  const classes = [
    "report-mini-calendar-day",
    day.inMonth ? "" : "is-outside-month",
    hasReport ? "has-report" : "is-empty",
    isSelected ? "selected" : "",
    isToday ? "is-today" : ""
  ].filter(Boolean).join(" ");
  return `
    <button
      class="${classes}"
      type="button"
      data-report-calendar-date="${mode}|${dateKey}"
      aria-pressed="${isSelected ? "true" : "false"}"
      aria-label="${escapeHtml(formatDate(dateKey))}${hasReport ? "" : " (kein Tagesbericht)"}"
      ${hasReport ? "" : "disabled"}
    >
      <span>${day.date.getDate()}</span>
      ${hasReport ? `<i class="report-mini-calendar-dot" aria-hidden="true"></i>` : ""}
    </button>
  `;
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
        ${reportCalendarHtml("admin", selectedDate)}
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
  const transferInvoiceTotal = reportTransferInvoiceTotal(report);
  return `
    <div class="day-report-values">
      <span><small>Umsatz Bowling</small><strong>${formatReportMoney(report.revenueBowling || report.barBowling)}</strong></span>
      <span><small>Umsatz Gastro</small><strong>${formatReportMoney(gastroRevenueTotal(report))}</strong></span>
      <span><small>Getränke</small><strong>${formatReportMoney(gastroParts.drinks || "")}</strong></span>
      <span><small>Speisen</small><strong>${formatReportMoney(gastroParts.food || "")}</strong></span>
      <span><small>Sonstiges</small><strong>${formatReportMoney(gastroParts.other || "")}</strong></span>
      <span><small>Umsatz gesamt</small><strong>${formatReportMoney(reportRevenueTotal(report))}</strong></span>
      ${reportFieldEnabled("invoiceCustomers") ? `<span><small>Rechnung</small><strong>${formatReportMoney(transferInvoiceTotal)}</strong></span>` : ""}
      <span><small>EC</small><strong>${formatReportMoney(reportEcTotal(report))}</strong></span>
      <span><small>Personalverzehr</small><strong>${formatReportMoney(reportPersonalConsumptionTotal(report))}</strong></span>
      ${reportFieldEnabled("expenses") ? `<span><small>Ausgaben Kasse</small><strong>${formatReportMoney(reportCashExpensesTotal(report))}</strong></span>` : ""}
      <span><small>Abzugeben an Chef</small><strong>${formatReportMoney(reportChefHandoverTotal(report))}</strong></span>
    </div>
  `;
}

function dayReportA4Html(dateKey, report = {}) {
  const printableInvoices = reportTransferInvoiceCustomers(report);
  const invoiceTotalValue = reportTransferInvoiceTotal(report);
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
  const total = reportItemsTotal(items);
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
        <div class="a4-compact-row a4-invoice-total-row">
          <strong>Gesamtsumme Rechnungen</strong>
          <strong>${formatReportMoney(total)}</strong>
        </div>
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
  const noteFields = [
    noteText !== "-" ? invoiceStaticField("Notiz", noteText, "invoice-copy-field-wide") : "",
    otherNoteText !== "-" ? invoiceStaticField("Sonstiges Notiz", otherNoteText, "invoice-copy-field-wide") : ""
  ].filter(Boolean);
  return `
    <article class="open-invoice-card ${isDemo ? "is-demo" : ""} ${expanded ? "is-open" : ""}">
      ${expanded ? "" : `<button class="open-invoice-summary" type="button" data-chef-invoice-item="${escapeHtml(chefInvoiceItemToken({ dateKey, invoice, index }, mode))}" data-chef-invoice-item-folder="${mode}" aria-expanded="false">
        <div class="open-invoice-summary-main">
          <strong>${escapeHtml(invoice.name || `Rechnung ${index + 1}`)}</strong>
          <span class="open-invoice-summary-date">${escapeHtml(formatDate(dateKey))}</span>
        </div>
        <div class="open-invoice-summary-side">
          <strong class="open-invoice-summary-total">${escapeHtml(formatReportMoney(total))}</strong>
        </div>
      </button>`}
      ${expanded ? `<div class="open-invoice-body">
        <div class="open-invoice-head">
          <div class="open-invoice-title-block"></div>
          <div class="open-invoice-actions">
            <button class="secondary" type="button" data-chef-invoice-item="${escapeHtml(chefInvoiceItemToken({ dateKey, invoice, index }, mode))}" data-chef-invoice-item-folder="${mode}">Schließen</button>
            ${primaryAction}
            ${!isDemo ? `<button class="secondary danger-lite" type="button" data-delete-invoice="${escapeHtml(token)}">Löschen</button>` : ""}
          </div>
        </div>
        <div class="invoice-copy-grid">
          ${invoiceAddressField(invoice, dateKey)}
          ${invoiceListField("Rechnungspositionen", [
            { label: "Bowling", value: formatReportMoney(bowling), copyValue: formatReportMoney(bowling) },
            { label: "Speisen", value: formatReportMoney(gastroSplit.food), copyValue: formatReportMoney(gastroSplit.food) },
            { label: "Getränke", value: formatReportMoney(gastroSplit.drinks), copyValue: formatReportMoney(gastroSplit.drinks) },
            { label: "Sonstiges", value: formatReportMoney(gastroSplit.other), copyValue: formatReportMoney(gastroSplit.other) },
            { label: "Tipp", value: tipText, copyValue: tipText },
            { label: "Zahlungsart", value: paymentMethod, copyValue: paymentMethod }
          ], "invoice-copy-field-wide invoice-position-field")}
          ${invoiceCopyField("Rechnungsbetrag", formatReportMoney(total), "invoice-copy-field-total invoice-copy-field-wide", true)}
          ${invoiceListField("Kontakt", [
            { label: "Ansprechpartner", value: invoice.contact || "-", copyValue: invoice.contact || "-" },
            { label: "Telefon", value: invoice.phone || "-", copyValue: invoice.phone || "-" }
          ], "invoice-copy-field-wide")}
          ${noteFields.join("")}
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
      <div class="invoice-field-head">
        <small>${escapeHtml(label)}</small>
        ${copyable ? copyIconButtonHtml(text, label) : ""}
      </div>
      <strong>${escapedText.replace(/\n/g, "<br>")}</strong>
    </div>
  `;
}

function invoiceStaticField(label, value, className = "") {
  return invoiceCopyField(label, value, className, false);
}

function invoiceListField(label, rows = [], className = "") {
  return `
    <div class="invoice-copy-field ${escapeHtml(className)}">
      <div class="invoice-field-head">
        <small>${escapeHtml(label)}</small>
      </div>
      <ul class="invoice-position-list">
        ${rows.map((row) => `
          <li class="invoice-position-row">
            <span>${escapeHtml(row.label || "")}</span>
            <div class="invoice-position-row-value">
              <strong>${escapeHtml(String(row.value || "-"))}</strong>
              ${row.copyValue !== undefined ? copyIconButtonHtml(String(row.copyValue || "-"), row.label || label) : ""}
            </div>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function invoiceAddressField(invoice = {}, dateKey = "") {
  const detailRows = [
    { label: "Rechnungsdatum", value: formatDate(dateKey), copyValue: formatDate(dateKey) },
    { label: "Rechnungsemail", value: invoice.email || "-", copyValue: invoice.email || "-" }
  ];
  if (invoice.invoiceDone || invoice.invoicePaid) {
    detailRows.push({ label: "Erledigt am", value: formatDateTime(invoice.invoicePaidAt || invoice.invoiceDoneAt || ""), copyValue: formatDateTime(invoice.invoicePaidAt || invoice.invoiceDoneAt || "") });
  }
  return `
    <div class="invoice-copy-field invoice-copy-field-wide invoice-copy-field-priority">
      <div class="invoice-field-head">
        <small>Rechnungsadresse</small>
        ${copyIconButtonHtml(invoiceBriefhead(invoice), "Rechnungsadresse")}
      </div>
      <strong>${escapeHtml(invoiceBriefhead(invoice)).replace(/\n/g, "<br>")}</strong>
      <ul class="invoice-position-list">
        ${detailRows.map((row) => `
          <li class="invoice-position-row">
            <span>${escapeHtml(row.label)}</span>
            <div class="invoice-position-row-value">
              <strong>${escapeHtml(String(row.value || "-"))}</strong>
              ${copyIconButtonHtml(String(row.copyValue || "-"), row.label)}
            </div>
          </li>
        `).join("")}
      </ul>
    </div>
  `;
}

function copyIconButtonHtml(value, label = "Wert") {
  return `<button class="invoice-copy-icon-button" type="button" data-copy-value="${escapeHtml(String(value || "-")).replace(/\n/g, "&#10;")}" aria-label="${escapeHtml(label)} kopieren" title="${escapeHtml(label)} kopieren"><span class="invoice-copy-icon" aria-hidden="true"></span></button>`;
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

function invoicePentacodeChoice(item = {}) {
  if (item.pentacodeEntered === true || item.pentacodeEntered === "true") return "yes";
  if (item.pentacodeEntered === false || item.pentacodeEntered === "false") return "no";
  return item.invoiceDone || item.invoiceReady || item.invoiceNotificationSentAt || item.invoicePaid ? "yes" : "";
}

function invoicePentacodeEntered(item = {}) {
  return invoicePentacodeChoice(item) === "yes";
}

function invoicePentacodeLabel(item = {}) {
  const choice = invoicePentacodeChoice(item);
  if (choice === "yes") return "Ja";
  if (choice === "no") return "Nein, nachträgliche Rechnung";
  return "Noch nicht gewählt";
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

function invoiceItemHasReceipt(item = {}) {
  if (invoiceReceipt(item)) return true;
  return [
    item.receiptData,
    item.receiptPath,
    item.receiptUrl,
    item.bowlingReceiptData,
    item.bowlingReceiptPath,
    item.bowlingReceiptUrl,
    item.gastroReceiptData,
    item.gastroReceiptPath,
    item.gastroReceiptUrl
  ].some((field) => Boolean(String(field || "").trim()));
}

function invoiceReadyProblemsFromData(item = {}) {
  const problems = [];
  if (!String(item.name || "").trim()) problems.push("Firma oder Name fehlt");
  if (!String(item.address || "").trim()) problems.push("Rechnungsadresse fehlt");
  if (!String(item.email || "").trim()) problems.push("Rechnungs-E-Mail fehlt");
  if (!invoicePentacodeChoice(item)) problems.push("Pentacode-Status fehlt");
  const amount = reportMoneyNumber(item.bowlingAmount) + invoiceGastroSplit(item).total;
  if (amount <= 0) problems.push("Beträge fehlen");
  if (!invoiceItemHasReceipt(item)) problems.push("Rechnungsbeleg fehlt");
  return problems;
}

function invoiceWorkflowState(item = {}, linkedInvoice = null) {
  const problems = invoiceReadyProblemsFromData(item);
  if (linkedInvoice && linkedInvoice.status !== "draft") {
    return {
      title: "Rechnung festgeschrieben",
      detail: "Dieser Rechnungskunde ist bereits mit einer festgeschriebenen Rechnung verknüpft."
    };
  }
  if (linkedInvoice && linkedInvoice.status === "draft") {
    return {
      title: "Rechnungsentwurf vorhanden",
      detail: problems.length
        ? `Du kannst weiter korrigieren. Nächster offener Punkt: ${problems[0]}.`
        : "Alles da. Öffne jetzt den Rechnungsentwurf für Vorschau, Festschreiben und Drucken."
    };
  }
  if (problems.length) {
    return {
      title: "Nächster Schritt",
      detail: problems[0]
    };
  }
  if (invoiceIsReady(item)) {
    return {
      title: "Bereit für den nächsten Schritt",
      detail: "Jetzt entweder an den Chef senden oder direkt die Rechnung erstellen."
    };
  }
  return {
    title: "Angaben prüfen",
    detail: "Du kannst alles hier ändern und zwischenspeichern, solange die Rechnung noch nicht festgeschrieben ist."
  };
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
          <span>In Pentacode eingetragen: ${invoicePentacodeLabel(item)}</span>
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

function reportTransferInvoiceCustomers(report = {}) {
  return reportInvoiceCustomers(report)
    .filter((item) => normalizedInvoicePaymentMethod(item.paymentMethod) === "ueberweisung");
}

function reportInvoiceTotal(report = {}) {
  return reportItemsTotal(reportInvoiceCustomers(report));
}

function normalizedInvoicePaymentMethod(value = "") {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "ueberweisung";
  if (text === "überweisung" || text === "ueberweisung") return "ueberweisung";
  if (text === "ec") return "ec";
  if (text === "bar") return "bar";
  return "";
}

function reportTransferInvoiceTotal(report = {}) {
  const automaticTotal = reportItemsTotal(reportTransferInvoiceCustomers(report));
  if (report.invoiceTransferAmountManual === true || report.invoiceTransferAmountManual === "true") {
    return reportMoneyNumber(report.invoiceTransferAmount);
  }
  return automaticTotal || reportMoneyNumber(report.invoiceTransferAmount);
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

function reportMiscIncomeTotal(report = {}) {
  return reportItemsTotal(Array.isArray(report.miscIncome) ? report.miscIncome : []);
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
  return Math.max(0, barTotal(report) + reportCashExpensesTotal(report) + reportEcTotal(report) + transferInvoiceTotal - revenueTotal - reportMiscIncomeTotal(report));
}

function reportChefHandoverTotal(report = {}) {
  return Math.max(
    0,
    reportRevenueTotal(report)
      - reportEcTotal(report)
      - reportTransferInvoiceTotal(report)
      - reportCashExpensesTotal(report)
      + reportMiscIncomeTotal(report)
  );
}

function currentTerminalFinanceInvoiceEntries() {
  const root = $("#terminalFinanceSection");
  if (!root) return [];
  return [...root.querySelectorAll('[data-report-entry="invoice"]')].map((row) => {
    const item = { id: row.dataset.id || cryptoId() };
    row.querySelectorAll("[data-report-field]").forEach((field) => {
      item[field.dataset.reportField] = field.type === "checkbox" ? (field.checked ? "true" : "") : field.value;
    });
    return item;
  }).filter((item) => item.name || item.amount || item.address || item.email || item.contact || item.phone || item.tip || item.paymentMethod);
}

function currentTerminalTransferInvoiceTotal(report = {}) {
  const manualField = $("#financeInvoiceTotal");
  if (manualField?.dataset.manualOverride === "true" && String(manualField.value || "").trim()) {
    return parseMoneyInput(manualField.value);
  }
  const currentEntries = currentTerminalFinanceInvoiceEntries();
  if (!currentEntries.length) return reportTransferInvoiceTotal(report);
  return reportItemsTotal(
    currentEntries
      .filter((item) => invoiceIsReady(item))
      .filter((item) => normalizedInvoicePaymentMethod(item.paymentMethod) === "ueberweisung")
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
  const printableInvoices = reportTransferInvoiceCustomers(report);
  const invoiceTotalValue = reportTransferInvoiceTotal(report);
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

function assignmentVisibleInSchedule(dateKey, position = "", employee = "") {
  if (!dateKey || !position || !employee) return false;
  if (!assignmentPositionIncluded(position)) return false;
  return assignmentDateKeys(todayKey()).includes(dateKey);
}

function assignmentScheduleMetaText(dateKey, employee, scheduleDay = {}, position = "") {
  if (!assignmentVisibleInSchedule(dateKey, position, employee)) return "";
  const time = assignmentTimeForEmployee(dateKey, employee, scheduleDay, position);
  const base = assignmentTimeText(time);
  const note = String(time?.note || "").trim();
  return note ? `${base} · ${note}` : base;
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
    const assignmentMeta = assignmentScheduleMetaText(key, assignedEmployee, assignments, position);
    return `
          <div class="position-cell ${positionClass(position)} ${assignedEmployee ? "filled" : ""} ${ownShift ? "own-shift clickable-shift" : ""}"
            ${ownShift ? `data-request-swap-date="${key}" data-request-swap-position="${escapeHtml(position)}"` : ""}>
            <span class="position-name">${escapeHtml(position)}</span>
            <span class="assignment">${escapeHtml(assignedEmployee)}</span>
            ${assignmentMeta ? `<span class="assignment-meta">${escapeHtml(assignmentMeta)}</span>` : ""}
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
  const container = offerWorkspaceRoot();
  if (!container) return;
  if (state.offerDraftDirty && container.querySelector("[data-offer-field]")) {
    state.offerCustomerSearch = container.querySelector("#offerCustomerSearch")?.value || state.offerCustomerSearch || "";
    state.offerDraft = currentOfferDraftFromDom();
    state.offerDraftId = state.offerDraft.id;
  }
  if (!state.adminUnlocked && !state.terminalToken) {
    container.innerHTML = `<p class="hint">Bitte Admin oder Terminal anmelden.</p>`;
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
  const fixedYears = [2024, 2025, 2026];
  const offerYear = (offer) => Number(String(offer.offerDate || offer.eventDate || offer.createdAt || "2026").slice(0, 4)) || 2026;
  const years = [...new Set([...fixedYears, ...offers.map(offerYear)])].sort((a, b) => a - b);
  const listHtml = years.map((year) => {
    const yearOffers = offers.filter((offer) => offerYear(offer) === year);
    return `
      <details class="offer-year-folder" ${year === 2026 ? "open" : ""}>
        <summary><span>${year}</span><small>${yearOffers.length} Angebot${yearOffers.length === 1 ? "" : "e"}</small></summary>
        <div class="offer-year-list">
          ${yearOffers.length ? yearOffers.map((offer) => renderOfferListItem(offer, activeId)).join("") : `<p class="hint">Noch keine Angebote in ${year}.</p>`}
        </div>
      </details>
    `;
  }).join("");
  container.innerHTML = `
    <nav class="offer-main-actions" aria-label="Angebotsnavigation">
      <button class="primary" type="button" data-offer-new>+ Neues Angebot erstellen</button>
      <button class="secondary" type="button" data-offer-scroll-saved>Gespeicherte Angebote ansehen</button>
    </nav>
    <div class="offer-toolbar">
      <div class="offer-toolbar-actions">
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
        <div id="offerSavedFolders" class="offer-sidebar-head">
          <strong>Gespeicherte Angebote</strong>
          <span>${offers.length} Einträge</span>
        </div>
        <div class="offer-list">${listHtml}</div>
      </aside>
      <section class="offer-editor">
        <div class="offer-editor-head">
          <div class="offer-editor-brand">
            <img src="la-bowling-print-logo.png" alt="LA Bowling">
            <div>
              <small>Angebotseditor</small>
              <h3>${escapeHtml(draft.title || "Angebot erstellen")}</h3>
              <p>${draft.archived ? "Archiviert" : "Aktiv"} · zuletzt ${draft.updatedAt ? escapeHtml(formatDateTime(draft.updatedAt)) : "noch nicht gespeichert"}</p>
            </div>
          </div>
          <div class="offer-head-badges">
            <span class="offer-badge">${escapeHtml(draft.offerDate ? formatDate(draft.offerDate) : "Datum offen")}</span>
            <span class="offer-badge">${escapeHtml(draft.eventDate ? formatDate(draft.eventDate) : "Veranstaltung offen")}</span>
          </div>
        </div>

        <section class="offer-section offer-bmw-template">
          <div class="offer-section-head">
            <div>
              <strong>Angebotsvorlage</strong>
              <span>Mit BMW Schatzkiste werden Leistungen und Preis automatisch eingesetzt.</span>
            </div>
          </div>
          <div class="offer-grid offer-grid-two">
            <label>Angebotsart
              <select data-offer-field="offerType">
                <option value="standard" ${draft.offerType !== "bmw-treasure" ? "selected" : ""}>Standardangebot</option>
                <option value="bmw-treasure" ${draft.offerType === "bmw-treasure" ? "selected" : ""}>BMW Schatzkiste</option>
              </select>
            </label>
            <label class="${draft.offerType === "bmw-treasure" ? "" : "hidden"}">Schatzkisten-Paket
              <select data-offer-field="bmwTreasurePackage">
                <option value="">Paket auswählen</option>
                ${Object.entries(OFFER_BMW_TREASURE_PACKAGES).map(([key, item]) => `<option value="${key}" ${draft.bmwTreasurePackage === key ? "selected" : ""}>${escapeHtml(item.name)} · ${formatMoney(item.pricePerPerson)} pro Person</option>`).join("")}
              </select>
            </label>
          </div>
          ${draft.offerType === "bmw-treasure" ? `<div class="offer-bmw-package-grid">${Object.entries(OFFER_BMW_TREASURE_PACKAGES).map(([key, item]) => `<button class="offer-bmw-package ${draft.bmwTreasurePackage === key ? "is-selected" : ""}" type="button" data-offer-bmw-package="${key}"><span>${escapeHtml(item.name)}</span><strong>${formatMoney(item.pricePerPerson)}</strong><small>pro Person</small><p>${escapeHtml(item.food)}</p></button>`).join("")}</div>${draft.bmwTreasurePackage ? `<p class="offer-pricing-note"><strong>${escapeHtml(OFFER_BMW_TREASURE_PACKAGES[draft.bmwTreasurePackage].name)}:</strong> ${escapeHtml(OFFER_BMW_TREASURE_PACKAGES[draft.bmwTreasurePackage].details)} ${escapeHtml(OFFER_BMW_TREASURE_PACKAGES[draft.bmwTreasurePackage].note)}</p>` : ""}` : ""}
        </section>

        <div class="offer-grid">
          <label>Bezeichnung<input data-offer-field="title" value="${escapeHtml(draft.title)}" placeholder="z.B. Angebot Stoll"></label>
          <label>Angebotsdatum<input data-offer-field="offerDate" type="date" value="${escapeHtml(draft.offerDate)}"></label>
          <label>Veranstaltungsdatum<input data-offer-field="eventDate" type="date" value="${escapeHtml(draft.eventDate)}"></label>
          <label class="offer-arrival-field">Eintreffen der Gäste<input data-offer-field="startTime" data-offer-time-input inputmode="numeric" maxlength="5" value="${escapeHtml(draft.startTime)}" placeholder="z. B. 18:00"></label>
          <label>Anlass<input data-offer-field="occasion" value="${escapeHtml(draft.occasion)}" placeholder="z.B. Hochzeitsfeier"></label>
          <label>Erwachsene<input data-offer-field="personsAdults" type="number" min="0" step="1" value="${escapeHtml(draft.personsAdults)}"></label>
          <label>Kinder<input data-offer-field="personsChildren" type="number" min="0" step="1" value="${escapeHtml(draft.personsChildren)}"></label>
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

        <div class="offer-grid offer-grid-two offer-contact-grid">
          <label>Firma oder Name<input data-offer-field="customerName" value="${escapeHtml(draft.customerName)}" placeholder="z. B. Musterfirma GmbH"></label>
          <label>Ansprechpartner<input data-offer-field="customerContact" value="${escapeHtml(draft.customerContact)}" placeholder="z. B. Max Mustermann"></label>
          <label>E-Mail-Adresse<input data-offer-field="customerEmail" value="${escapeHtml(draft.customerEmail)}" placeholder="name@firma.de"></label>
          <label>Telefonnummer<input data-offer-field="customerPhone" value="${escapeHtml(draft.customerPhone)}" placeholder="z. B. 0871 123456"></label>
          <label class="offer-grid-wide">Rechnungsanschrift<textarea data-offer-field="customerAddress" rows="3" placeholder="Straße und Hausnummer&#10;PLZ und Ort">${escapeHtml(draft.customerAddress)}</textarea></label>
        </div>

        <section class="offer-section offer-conference-section">
          <div class="offer-section-head">
            <div>
              <strong>Tagungspauschale</strong>
              <span>1.125,00 Euro bis 25 Personen, jede weitere Person 29,90 Euro.</span>
            </div>
          </div>
          <label class="offer-toggle-row">
            <span><strong>Tagungspauschale verwenden</strong><small>Buffet und Bowling können separat dazugebucht werden.</small></span>
            <input data-offer-field="conferenceEnabled" type="checkbox" ${draft.conference?.enabled ? "checked" : ""}>
          </label>
          <div class="offer-conference-details ${draft.conference?.enabled ? "" : "hidden"}">
            <div class="offer-conference-snack-grid">
              <label>Uhrzeit
                <input data-offer-field="conferenceMorningSnackTime" data-offer-time-input inputmode="numeric" maxlength="5" value="${escapeHtml(draft.conference?.morningSnackTime || "")}" placeholder="z. B. 10:00">
              </label>
              <label>Vormittagssnack
                <textarea data-offer-field="conferenceMorningSnackText" rows="3" placeholder="z. B. Butterbrezen und Müsliriegel">${escapeHtml(draft.conference?.morningSnackText || "")}</textarea>
              </label>
            </div>
            <div class="offer-bowling-summary">
              <span class="offer-stat"><small>Grundpauschale</small><strong>${formatMoney(OFFER_CONFERENCE_BASE_PRICE)}</strong></span>
              <span class="offer-stat"><small>Enthalten</small><strong>bis 25 Personen</strong></span>
              <span class="offer-stat"><small>Weitere Personen</small><strong>${totals.conferenceExtraPersons} × ${formatMoney(OFFER_CONFERENCE_EXTRA_PERSON_PRICE)}</strong></span>
              <span class="offer-stat offer-stat-total"><small>Tagung gesamt</small><strong>${formatMoney(totals.conferenceTotal)}</strong></span>
            </div>
            <p class="offer-pricing-note">Enthalten: WLAN, Sonderöffnung und Tagungsraumnutzung, Tagungsgetränke, Parkplätze, Beamer, Leinwand, Flipchart sowie Vormittagssnack.</p>
            <p class="offer-pricing-note">Das Mittagsbuffet wird separat nach den Buffetvorschlägen berechnet. Bowling kann zusätzlich gebucht werden.</p>
          </div>
        </section>

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
          </div>
          <div class="offer-bowling-summary">
            <span class="offer-stat"><small>Bereich</small><strong>${escapeHtml(reservedAreaPricing.reservedAreaLabel || "-")}</strong></span>
            <span class="offer-stat"><small>Raummiete</small><strong>${formatMoney(reservedAreaPricing.roomFee)}</strong></span>
            <span class="offer-stat"><small>Lagerfeuer</small><strong>${formatMoney(reservedAreaPricing.campfireFee)}</strong></span>
            <span class="offer-stat offer-stat-total"><small>Bereich gesamt</small><strong>${formatMoney(reservedAreaPricing.total)}</strong></span>
          </div>
          ${reservedAreaPricing.warning ? `<p class="offer-warning">${escapeHtml(reservedAreaPricing.warning)}</p>` : ""}
        </section>

        <section class="offer-section offer-drinks-section">
          <div class="offer-section-head">
            <div>
              <strong>Getränke</strong>
              <span>Standardsatz verwenden oder eine individuelle Vereinbarung eintragen.</span>
            </div>
          </div>
          <div class="offer-drinks-choice" role="radiogroup" aria-label="Getränkeabrechnung">
            <label class="offer-choice-card ${draft.drinksMode !== "custom" ? "is-selected" : ""}">
              <input data-offer-field="drinksMode" type="radio" name="offerDrinksMode" value="menu" ${draft.drinksMode !== "custom" ? "checked" : ""}>
              <span><strong>Standard</strong><small>Getränke werden laut Karte berechnet.</small></span>
            </label>
            <label class="offer-choice-card ${draft.drinksMode === "custom" ? "is-selected" : ""}">
              <input data-offer-field="drinksMode" type="radio" name="offerDrinksMode" value="custom" ${draft.drinksMode === "custom" ? "checked" : ""}>
              <span><strong>Sonderabsprache</strong><small>Eigener Text und freier Gesamtpreis</small></span>
            </label>
          </div>
          <div class="offer-drinks-custom ${draft.drinksMode === "custom" ? "" : "hidden"}">
            <label>Vereinbarung<textarea data-offer-field="drinksCustomText" rows="3" placeholder="z. B. Getränkepauschale laut Absprache">${escapeHtml(draft.drinksCustomText)}</textarea></label>
            <label>Preis gesamt<input data-offer-field="drinksCustomPrice" type="number" min="0" step="0.01" value="${escapeHtml(draft.drinksCustomPrice)}" placeholder="0,00"></label>
          </div>
          <input data-offer-field="textBlockEnabled-drinksByMenu" type="checkbox" class="hidden" tabindex="-1" ${draft.drinksMode !== "custom" ? "checked" : ""}>
          <input data-offer-field="textBlockText-drinksByMenu" type="hidden" value="${escapeHtml(OFFER_TEXT_BLOCK_DEFAULTS.drinksByMenu.text)}">
        </section>

        <section class="offer-section offer-special-services">
          <div class="offer-section-head">
            <div>
              <strong>Sonderleistungen</strong>
              <span>Sektempfang und Lagerfeuer mit Vorgabepreis, Uhrzeit und freier Anpassung.</span>
            </div>
          </div>
          <div class="offer-special-service-grid">
            <article class="offer-special-service-card ${draft.buffet?.sparklingReception ? "is-selected" : ""}">
              <label class="offer-toggle-row">
                <span><strong>Sektempfang</strong><small>Preis pro Person</small></span>
                <input data-offer-field="buffetSparklingReception" type="checkbox" ${draft.buffet?.sparklingReception ? "checked" : ""}>
              </label>
              <div class="offer-grid offer-grid-two">
                <label>Uhrzeit<input data-offer-field="sparklingReceptionTime" data-offer-time-input inputmode="numeric" maxlength="5" value="${escapeHtml(draft.sparklingReceptionTime)}" placeholder="z. B. 18:00"></label>
                <label>Preis pro Person<input data-offer-field="sparklingReceptionPrice" type="number" min="0" step="0.01" value="${escapeHtml(draft.sparklingReceptionPrice)}"></label>
              </div>
            </article>
            <article class="offer-special-service-card ${draft.reservedAreaCampfire ? "is-selected" : ""}">
              <label class="offer-toggle-row">
                <span><strong>Lagerfeuer</strong><small>Lagerfeuerstelle inklusive Feuerholz</small></span>
                <input data-offer-field="reservedAreaCampfire" type="checkbox" ${draft.reservedAreaCampfire ? "checked" : ""}>
              </label>
              <div class="offer-grid offer-grid-two">
                <label>Uhrzeit<input data-offer-field="campfireTime" data-offer-time-input inputmode="numeric" maxlength="5" value="${escapeHtml(draft.campfireTime)}" placeholder="z. B. 21:00"></label>
                <label>Pauschalpreis<input data-offer-field="campfirePrice" type="number" min="0" step="0.01" value="${escapeHtml(draft.campfirePrice)}"></label>
              </div>
            </article>
          </div>
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
            <label>Leihschuhe Personen<input data-offer-field="bowlingShoePersons" type="number" min="0" step="1" value="${escapeHtml(draft.bowling?.shoePersons)}"><small class="offer-field-help">Automatisch aus der Personenzahl, weiterhin frei änderbar.</small></label>
            <label>Bowling von<input data-offer-field="bowlingFromTime" data-offer-time-input inputmode="numeric" maxlength="5" value="${escapeHtml(draft.bowling?.fromTime)}" placeholder="HH:MM"></label>
            <label>Bowling bis<input data-offer-field="bowlingToTime" data-offer-time-input inputmode="numeric" maxlength="5" value="${escapeHtml(draft.bowling?.toTime)}" placeholder="HH:MM"></label>
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
            <label class="offer-meal-time-field">Essenszeit<input data-offer-field="mealTime" data-offer-time-input inputmode="numeric" maxlength="5" value="${escapeHtml(draft.mealTime)}" placeholder="z. B. 19:00"><small class="offer-field-help">Wird im Ablauf des Kundenangebots deutlich angezeigt.</small></label>
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
            <div class="offer-inline-tools">
              <button class="secondary" type="button" data-offer-add-special-opening>+ Sonderöffnung</button>
              <button class="secondary" type="button" data-offer-add-cost>+ Position hinzufügen</button>
            </div>
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
            ${Object.entries(draft.textBlocks || {}).filter(([key]) => key !== "drinksByMenu").map(([key, block]) => renderOfferTextBlockEditor(key, block)).join("")}
          </div>
        </section>

        <div class="offer-grid offer-grid-two">
          <label class="offer-grid-wide">Zusätzliche Informationen<textarea data-offer-field="additionalInfo" rows="4" placeholder="Für das Angebot sichtbar">${escapeHtml(draft.additionalInfo)}</textarea></label>
          <label class="offer-grid-wide">Interne Notiz<textarea data-offer-field="internalNote" rows="4" placeholder="Nur intern">${escapeHtml(draft.internalNote)}</textarea></label>
        </div>
      </section>
    </div>
  `;
  setupOfferGuidedEditor(container, draft);
}

function renderOfferListItem(offer, activeId) {
  const totals = offerTotals(offer);
  const title = offer.title || offer.customerName || "Angebot";
  const dateLine = [offer.eventDate ? formatDate(offer.eventDate) : "", offer.customerName].filter(Boolean).join(" · ");
  return `
    <article class="offer-list-entry ${offer.confirmed ? "is-confirmed" : ""}">
      <button class="offer-list-item ${offer.id === activeId ? "active" : ""}" type="button" data-select-offer="${escapeHtml(offer.id)}">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(dateLine || "Noch keine Details")}</span>
        <small>${formatMoney(totals.total)} · ${offer.archived ? "Archiviert" : offer.confirmed ? "Bestätigt" : "Offen"}</small>
      </button>
      <button class="offer-confirm-button ${offer.confirmed ? "is-confirmed" : ""}" type="button" data-offer-confirm="${escapeHtml(offer.id)}" aria-pressed="${offer.confirmed ? "true" : "false"}">${offer.confirmed ? "✓ Bestätigt" : "Bestätigen"}</button>
    </article>
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
      <input data-offer-timeline-time data-offer-time-input inputmode="numeric" maxlength="5" value="${escapeHtml(item.time)}" placeholder="HH:MM">
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
  if (String(item.label || "").trim().toLowerCase() === "sonderöffnung") {
    return `
      <div class="offer-special-opening-row" data-offer-cost-row data-offer-cost-id="${escapeHtml(item.id)}">
        <input data-offer-cost-label type="hidden" value="Sonderöffnung">
        <input data-offer-cost-quantity type="hidden" value="1">
        <div class="offer-special-opening-title">
          <span class="offer-special-opening-icon" aria-hidden="true">◷</span>
          <div><strong>Sonderöffnungsgebühr</strong><small>Öffnung außerhalb der regulären Öffnungszeiten</small></div>
        </div>
        <label>Freier Preis
          <input data-offer-cost-unit type="number" min="0" step="0.01" value="${escapeHtml(item.unitPrice)}" placeholder="0,00">
        </label>
        <label>Notiz <span class="optional-label">optional</span>
          <input data-offer-cost-note value="${escapeHtml(item.note)}" placeholder="z. B. Öffnung ab 10:00 Uhr">
        </label>
        <button class="secondary danger-lite" type="button" data-offer-remove-cost>Entfernen</button>
      </div>
    `;
  }
  return `
    <div class="offer-edit-row offer-cost-row-labeled" data-offer-cost-row data-offer-cost-id="${escapeHtml(item.id)}">
      <label>Bezeichnung<input data-offer-cost-label value="${escapeHtml(item.label)}" placeholder="z. B. Sektempfang"></label>
      <label>Menge<input data-offer-cost-quantity type="number" min="0" step="0.01" value="${escapeHtml(item.quantity)}" placeholder="1"></label>
      <label>Einzelpreis<input data-offer-cost-unit type="number" min="0" step="0.01" value="${escapeHtml(item.unitPrice)}" placeholder="0,00"></label>
      <label>Notiz <span class="optional-label">optional</span><input data-offer-cost-note value="${escapeHtml(item.note)}" placeholder="Zusatzinformation"></label>
      <div class="row-actions">
        <button class="secondary" type="button" data-offer-move-cost="up">↑</button>
        <button class="secondary" type="button" data-offer-move-cost="down">↓</button>
        <button class="secondary danger-lite" type="button" data-offer-remove-cost>Entfernen</button>
      </div>
    </div>
  `;
}

function offerEditorSectionByTitle(editor, title) {
  return [...editor.querySelectorAll(":scope > .offer-section")]
    .find((section) => section.querySelector(".offer-section-head strong")?.textContent.trim() === title) || null;
}

function renderOfferLiveSummary(draftValue) {
  const draft = normalizeOfferClient(draftValue || ensureOfferDraft());
  const totals = offerTotals(draft);
  const services = [
    totals.bmwTreasurePackage ? `BMW Schatzkiste ${totals.bmwTreasurePackage.name}` : "",
    draft.conference?.enabled ? `Tagungspauschale · ${formatMoney(totals.conferenceTotal)}` : "",
    offerHasBowlingBooking(draft) ? `${draft.bowling?.lanes || 0} Bowlingbahn${Number(draft.bowling?.lanes) === 1 ? "" : "en"}` : "",
    Number(draft.bowling?.shoePersons || 0) ? `${draft.bowling.shoePersons} Leihschuhe` : "",
    offerHasBuffet(draft) ? (draft.buffet?.name || "Buffet") : "",
    draft.buffet?.sparklingReception ? `Sektempfang ${formatMoney(draft.sparklingReceptionPrice)} pro Person${draft.sparklingReceptionTime ? ` · ${draft.sparklingReceptionTime} Uhr` : ""}` : "",
    draft.reservedAreaCampfire ? `Lagerfeuer ${formatMoney(draft.campfirePrice)}${draft.campfireTime ? ` · ${draft.campfireTime} Uhr` : ""}` : "",
    draft.reservedArea || "",
    draft.drinksMode === "custom"
      ? `${draft.drinksCustomText || "Getränke nach Sonderabsprache"} · ${formatMoney(draft.drinksCustomPrice)}`
      : draft.conference?.enabled ? "Tagungsgetränke inklusive" : "Getränke werden laut Karte berechnet",
    ...(draft.costs || []).map((item) => item.label).filter(Boolean)
  ].filter(Boolean);
  const timeline = offerTimelineEvents(draft).slice(0, 4);
  const costSummary = [
    totals.bmwTreasureTotal > 0 ? [`BMW Schatzkiste ${totals.bmwTreasurePackage?.name || ""}`, totals.bmwTreasureTotal] : null,
    totals.conferenceBaseTotal > 0 ? ["Tagungspauschale bis 25 Personen", totals.conferenceBaseTotal] : null,
    totals.conferenceExtraTotal > 0 ? [`${totals.conferenceExtraPersons} zusätzliche Personen`, totals.conferenceExtraTotal] : null,
    totals.bowlingTotal > 0 ? ["Bowling", totals.bowlingTotal] : null,
    totals.buffetTotal > 0 ? ["Buffet", totals.buffetTotal] : null,
    totals.reservedAreaTotal > 0 ? ["Bereich", totals.reservedAreaTotal] : null,
    totals.drinksTotal > 0 ? ["Getränke", totals.drinksTotal] : null,
    totals.extraRows > 0 ? ["Zusatzpositionen", totals.extraRows] : null
  ].filter(Boolean);
  return `
    <div class="offer-live-summary-head"><small>Live-Vorschau</small><strong>Angebot</strong><span>Aktualisiert sich während der Eingabe</span></div>
    <div class="offer-live-summary-customer">
      <small>Kundendaten</small>
      <strong>${escapeHtml(draft.customerName || "Kunde noch offen")}</strong>
      <span>${escapeHtml(draft.customerContact || draft.customerEmail || "Kontaktdaten noch offen")}</span>
    </div>
    <div class="offer-live-summary-section"><small>Veranstaltung</small><span><b>${escapeHtml(draft.eventDate ? formatDate(draft.eventDate) : "Datum offen")}</b> · ${totals.personCount} Personen</span>${draft.occasion ? `<span>${escapeHtml(draft.occasion)}</span>` : ""}${draft.startTime ? `<span><b>${escapeHtml(draft.startTime)} Uhr</b> Eintreffen</span>` : ""}</div>
    <div class="offer-live-summary-section"><small>Leistungen</small>${services.length ? services.slice(0, 6).map((item) => `<span>✓ ${escapeHtml(item)}</span>`).join("") : `<em>Noch keine Leistungen gewählt</em>`}</div>
    <div class="offer-live-summary-section"><small>Ablauf</small>${timeline.length ? timeline.map((item) => `<span><b>${escapeHtml(item.time || "--:--")}</b> ${escapeHtml(item.title || "Ablaufpunkt")}</span>`).join("") : `<em>Noch kein Ablauf</em>`}</div>
    <div class="offer-live-summary-section offer-live-summary-costs"><small>Kostenübersicht</small>${costSummary.length ? costSummary.map(([label, amount]) => `<span><b>${escapeHtml(label)}</b><strong>${formatMoney(amount)}</strong></span>`).join("") : `<em>Noch keine Kostenpositionen</em>`}</div>
    <div class="offer-live-summary-total"><span>Gesamt</span><strong>${formatMoney(totals.total)}</strong></div>
  `;
}

function setupOfferGuidedEditor(container, draft) {
  const editor = container.querySelector(".offer-editor");
  const editorHead = editor?.querySelector(":scope > .offer-editor-head");
  if (!editor || !editorHead) return;
  const step = Math.min(4, Math.max(1, Number(state.offerEditorStep || 1)));
  state.offerEditorStep = step;
  const timeline = offerTimelineEvents(draft);
  const done = {
    1: Boolean(draft.customerName && draft.eventDate),
    2: Boolean(offerHasBowlingBooking(draft) || offerHasBuffet(draft) || draft.reservedArea || draft.costs?.length),
    3: Boolean(timeline.length)
  };
  const wizard = document.createElement("nav");
  wizard.className = "offer-wizard-steps";
  wizard.setAttribute("aria-label", "Schritte zur Angebotserstellung");
  wizard.innerHTML = [[1, "Kunde & Veranstaltung"], [2, "Leistungen"], [3, "Ablauf"], [4, "Prüfen & Erstellen"]].map(([number, label]) => `
    <button class="offer-wizard-step ${step === number ? "active" : ""} ${done[number] || step > number ? "done" : ""}" data-offer-editor-step="${number}" type="button">
      <span>${done[number] || step > number ? "✓" : number}</span><strong>${label}</strong>
    </button>
  `).join("");
  editorHead.after(wizard);

  const directGrids = [...editor.querySelectorAll(":scope > .offer-grid")];
  const sections = {
    template: offerEditorSectionByTitle(editor, "Angebotsvorlage"),
    customer: offerEditorSectionByTitle(editor, "Kunde aus Kundenstamm"),
    conference: offerEditorSectionByTitle(editor, "Tagungspauschale"),
    area: offerEditorSectionByTitle(editor, "Bereich & Zusatzoptionen"),
    drinks: offerEditorSectionByTitle(editor, "Getränke"),
    specialServices: offerEditorSectionByTitle(editor, "Sonderleistungen"),
    bowling: offerEditorSectionByTitle(editor, "Bowling"),
    buffet: offerEditorSectionByTitle(editor, "Buffet"),
    timeline: offerEditorSectionByTitle(editor, "Ablauf"),
    costs: offerEditorSectionByTitle(editor, "Kostenübersicht"),
    texts: offerEditorSectionByTitle(editor, "Zusatztexte für das Angebot")
  };
  const guided = document.createElement("div");
  guided.className = "offer-guided-layout";
  const main = document.createElement("div");
  main.className = "offer-guided-main";
  const panels = [1, 2, 3, 4].map((number) => {
    const panel = document.createElement("section");
    panel.className = `offer-step-panel ${step === number ? "active" : ""}`;
    panel.dataset.offerStepPanel = String(number);
    const labels = {
      1: ["Kunde & Veranstaltung", "Kundendaten und Eckdaten der Veranstaltung"],
      2: ["Leistungen", "Nur benötigte Leistungen öffnen und bearbeiten"],
      3: ["Ablauf", "Zeiten prüfen und bei Bedarf ergänzen"],
      4: ["Prüfen & Erstellen", "Inhalte kontrollieren und Angebot ausgeben"]
    };
    panel.innerHTML = `<header class="offer-step-heading"><span>${number}</span><div><h4>${labels[number][0]}</h4><p>${labels[number][1]}</p></div></header>`;
    main.append(panel);
    return panel;
  });
  [sections.template, directGrids[0], sections.customer].filter(Boolean).forEach((node) => panels[0].append(node));
  if (directGrids[1]) {
    const contactHeading = document.createElement("div");
    contactHeading.className = "offer-subsection-title";
    contactHeading.innerHTML = `<div><strong>Kontaktdaten</strong><span>Angaben für Rückfragen und die Angebotsanschrift</span></div>`;
    panels[0].append(contactHeading, directGrids[1]);
  }
  [sections.conference, sections.area, sections.drinks, sections.specialServices, sections.bowling, sections.buffet, sections.costs].filter(Boolean).forEach((section) => {
    const title = section.querySelector(".offer-section-head strong")?.textContent.trim() || "Leistung";
    const serviceKey = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const selected = title === "Tagungspauschale" ? draft.conference?.enabled === true
      : title === "Bowling" ? offerHasBowlingBooking(draft)
      : title === "Buffet" ? offerHasBuffet(draft)
        : title === "Bereich & Zusatzoptionen" ? Boolean(draft.reservedArea)
          : title === "Getränke" ? true
          : title === "Sonderleistungen" ? Boolean(draft.buffet?.sparklingReception || draft.reservedAreaCampfire)
          : Boolean(draft.costs?.length);
    section.classList.add("offer-service-card");
    section.classList.toggle("is-selected", selected);
    section.classList.toggle("is-expanded", Boolean(state.offerServiceExpanded?.[serviceKey] ?? selected));
    const toggle = document.createElement("button");
    toggle.className = "offer-service-toggle";
    toggle.type = "button";
    toggle.dataset.offerServiceToggle = serviceKey;
    toggle.innerHTML = `<span>${selected ? "✓" : "+"}</span><b>${selected ? "Ausgewählt" : "Öffnen"}</b>`;
    section.querySelector(".offer-section-head")?.append(toggle);
    panels[1].append(section);
  });
  if (sections.timeline) panels[2].append(sections.timeline);
  const review = document.createElement("div");
  review.className = "offer-review-grid";
  const totals = offerTotals(draft);
  review.innerHTML = `
    <div><small>Kunde</small><strong>${escapeHtml(draft.customerName || "Noch offen")}</strong></div>
    <div><small>Datum</small><strong>${escapeHtml(draft.eventDate ? formatDate(draft.eventDate) : "Noch offen")}</strong></div>
    <div><small>Personen</small><strong>${totals.personCount}</strong></div>
    <div><small>Gesamtsumme</small><strong>${formatMoney(totals.total)}</strong></div>
  `;
  panels[3].append(review);
  [sections.texts, directGrids[2]].filter(Boolean).forEach((node) => panels[3].append(node));
  const reviewActions = document.createElement("div");
  reviewActions.className = "offer-review-actions";
  reviewActions.innerHTML = `<button class="secondary" type="button" data-offer-save>Entwurf speichern</button><button class="primary" type="button" data-offer-print>Vorschau / Drucken</button>`;
  panels[3].append(reviewActions);
  const footer = document.createElement("footer");
  footer.className = "offer-step-footer";
  footer.innerHTML = `<button class="secondary" type="button" data-offer-editor-step="${Math.max(1, step - 1)}" ${step === 1 ? "disabled" : ""}>Zurück</button><span>Schritt ${step} von 4</span><button class="primary" type="button" data-offer-editor-step="${Math.min(4, step + 1)}" ${step === 4 ? "disabled" : ""}>Weiter</button>`;
  main.append(footer);
  const summary = document.createElement("aside");
  summary.id = "offerLiveSummary";
  summary.className = "offer-live-summary";
  summary.innerHTML = renderOfferLiveSummary(draft);
  guided.append(main, summary);
  wizard.after(guided);
}

function refreshOfferLiveSummary() {
  const target = offerWorkspaceRoot()?.querySelector("#offerLiveSummary");
  if (target) target.innerHTML = renderOfferLiveSummary(currentOfferDraftFromDom());
}

function terminalTaskAreaById(id) {
  return (state.terminalTaskAreas || []).find((area) => area.id === id) || null;
}

function terminalTaskFilteredTemplates() {
  const query = String(state.terminalTaskSearch || "").trim().toLowerCase();
  return sortTaskTemplates(state.terminalTaskTemplates || []).filter((task) => {
    if (state.terminalTaskAreaFilter !== "all" && String(task.areaId || "") !== state.terminalTaskAreaFilter) return false;
    const recurring = !["once", "next-day"].includes(task.frequency);
    if (state.terminalTaskTypeFilter === "once" && recurring) return false;
    if (state.terminalTaskTypeFilter === "recurring" && !recurring) return false;
    if (state.terminalTaskStatusFilter === "active" && task.active === false) return false;
    if (state.terminalTaskStatusFilter === "inactive" && task.active !== false) return false;
    return !query || `${task.title || ""} ${task.note || ""} ${task.assignee || ""}`.toLowerCase().includes(query);
  });
}

function terminalTaskChipHtml(task) {
  const area = terminalTaskAreaById(task.areaId);
  const color = area?.color || "#7c3aed";
  return `<button class="terminal-task-chip" style="--task-area-color:${escapeHtml(color)}" type="button" data-terminal-task-edit="${escapeHtml(task.id)}"><span>${escapeHtml(task.dueTime || "")}</span>${escapeHtml(task.title)}</button>`;
}

function renderTerminalTaskCalendar() {
  const root = $("#terminalTaskCalendarSection");
  if (!root) return;
  const month = normalizeMonthValue(state.terminalTaskCalendarMonth) || currentMonthValue();
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(state.terminalTaskCalendarDate) ? state.terminalTaskCalendarDate : todayKey();
  const tasks = terminalTaskFilteredTemplates();
  const editorAreaValue = $("#terminalTaskArea")?.value || "";
  const areaOptions = [`<option value="all">Alle Bereiche</option>`, ...(state.terminalTaskAreas || []).map((area) => `<option value="${escapeHtml(area.id)}">${escapeHtml(area.name)}${area.active === false ? " (inaktiv)" : ""}</option>`)].join("");
  if ($("#terminalTaskAreaFilter")) {
    $("#terminalTaskAreaFilter").innerHTML = areaOptions;
    $("#terminalTaskAreaFilter").value = state.terminalTaskAreaFilter || "all";
  }
  const activeAreas = (state.terminalTaskAreas || []).filter((area) => area.active !== false);
  if ($("#terminalTaskWeekday") && !$("#terminalTaskWeekday").options.length) {
    $("#terminalTaskWeekday").innerHTML = [1, 2, 3, 4, 5, 6, 0].map((day) => `<option value="${day}">${escapeHtml(weekdays[day])}</option>`).join("");
  }
  if ($("#terminalTaskArea")) {
    $("#terminalTaskArea").innerHTML = `<option value="">Ohne Bereich</option>${activeAreas.map((area) => `<option value="${escapeHtml(area.id)}">${escapeHtml(area.name)}</option>`).join("")}`;
    $("#terminalTaskArea").value = editorAreaValue;
  }
  if ($("#terminalTaskAssignee")) {
    const value = $("#terminalTaskAssignee").value;
    $("#terminalTaskAssignee").innerHTML = `<option value="">Nicht festgelegt</option>${(state.settings?.employees || []).map((employee) => `<option value="${escapeHtml(employee)}">${escapeHtml(employee)}</option>`).join("")}`;
    $("#terminalTaskAssignee").value = value;
  }
  if ($("#terminalTaskAreaCount")) $("#terminalTaskAreaCount").textContent = String(activeAreas.length);
  if ($("#terminalTaskAreaList")) $("#terminalTaskAreaList").innerHTML = activeAreas.map((area) => `<button type="button" data-terminal-area-filter="${escapeHtml(area.id)}"><i style="background:${escapeHtml(area.color)}"></i><span>${escapeHtml(area.name)}</span><b>${tasks.filter((task) => task.areaId === area.id).length}</b></button>`).join("") || `<p class="task-empty-line">Keine Bereiche</p>`;
  if ($("#terminalTaskMonthTitle")) $("#terminalTaskMonthTitle").textContent = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00`));
  $$("[data-task-calendar-view]").forEach((button) => button.classList.toggle("active", button.dataset.taskCalendarView === state.terminalTaskCalendarView));
  const calendar = $("#terminalTaskCalendar");
  if (calendar) {
    if (state.terminalTaskCalendarView === "list") {
      calendar.innerHTML = `<div class="terminal-task-list-view">${tasks.map((task) => `<article><div>${terminalTaskChipHtml(task)}<small>${escapeHtml(taskFrequencyLabel(task))}${task.assignee ? ` · ${escapeHtml(task.assignee)}` : ""}</small></div><button type="button" data-terminal-task-edit="${escapeHtml(task.id)}">Bearbeiten</button></article>`).join("") || `<p class="task-empty-line">Keine Aufgaben gefunden</p>`}</div>`;
    } else {
      let days = calendarWeeksForMonth(month).flat();
      if (state.terminalTaskCalendarView === "week") {
        const chosen = new Date(`${selectedDate}T12:00:00`);
        const start = weekStart(chosen);
        days = Array.from({ length: 7 }, (_, index) => { const date = addDays(start, index); return { date, inMonth: true }; });
      }
      calendar.innerHTML = `<div class="terminal-task-weekdays">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => `<span>${day}</span>`).join("")}</div><div class="terminal-task-month-grid">${days.map((day) => {
        const dateKey = isoDate(day.date);
        const dayTasks = tasks.filter((task) => taskAppliesToDate(task, dateKey));
        return `<article class="terminal-task-day ${day.inMonth ? "" : "outside"} ${dateKey === selectedDate ? "selected" : ""} ${dateKey === todayKey() ? "today" : ""}" data-terminal-task-date="${dateKey}"><strong>${day.date.getDate()}</strong><div>${dayTasks.slice(0, 3).map(terminalTaskChipHtml).join("")}${dayTasks.length > 3 ? `<small>+${dayTasks.length - 3} weitere</small>` : ""}</div></article>`;
      }).join("")}</div>`;
    }
  }
  const selectedTasks = tasks.filter((task) => taskAppliesToDate(task, selectedDate));
  if ($("#terminalTaskSelectedDate")) $("#terminalTaskSelectedDate").textContent = formatLongDate(selectedDate);
  if ($("#terminalTaskSelectedList")) $("#terminalTaskSelectedList").innerHTML = selectedTasks.map((task) => {
    const area = terminalTaskAreaById(task.areaId);
    return `<button type="button" data-terminal-task-edit="${escapeHtml(task.id)}"><i style="background:${escapeHtml(area?.color || "#7c3aed")}"></i><span><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.dueTime || "Ohne Uhrzeit")}${area ? ` · ${escapeHtml(area.name)}` : ""}</small></span><b>&rsaquo;</b></button>`;
  }).join("") || `<p class="task-empty-line">Keine Aufgaben an diesem Tag</p>`;
  renderTerminalTaskAreaManager();
  updateTerminalTaskEditorFields();
}

function renderTerminalTaskAreaManager() {
  const target = $("#terminalTaskAreaManageList");
  if (!target) return;
  target.innerHTML = (state.terminalTaskAreas || []).map((area) => `<article><i style="background:${escapeHtml(area.color)}"></i><span><strong>${escapeHtml(area.name)}</strong><small>${area.active === false ? "Inaktiv" : "Aktiv"}</small></span><button type="button" data-terminal-task-area-edit="${escapeHtml(area.id)}">Bearbeiten</button><button class="danger-lite" type="button" data-terminal-task-area-delete="${escapeHtml(area.id)}">Löschen</button></article>`).join("");
}

function updateTerminalTaskEditorFields() {
  const frequency = $("#terminalTaskFrequency")?.value || "once";
  $("#terminalTaskDateField")?.classList.toggle("hidden", !["once", "interval"].includes(frequency));
  $("#terminalTaskWeekdayField")?.classList.toggle("hidden", frequency !== "weekly");
  $("#terminalTaskMonthdayField")?.classList.toggle("hidden", frequency !== "monthly");
  $("#terminalTaskIntervalField")?.classList.toggle("hidden", frequency !== "interval");
}

function resetTerminalTaskEditor(dateKey = state.terminalTaskCalendarDate || todayKey()) {
  if ($("#terminalTaskEditId")) $("#terminalTaskEditId").value = "";
  if ($("#terminalTaskTitle")) $("#terminalTaskTitle").value = "";
  if ($("#terminalTaskDescription")) $("#terminalTaskDescription").value = "";
  if ($("#terminalTaskFrequency")) $("#terminalTaskFrequency").value = "once";
  if ($("#terminalTaskDate")) $("#terminalTaskDate").value = dateKey;
  if ($("#terminalTaskDueTime")) $("#terminalTaskDueTime").value = "";
  if ($("#terminalTaskArea")) $("#terminalTaskArea").value = "";
  if ($("#terminalTaskAssignee")) $("#terminalTaskAssignee").value = "";
  if ($("#terminalTaskActive")) $("#terminalTaskActive").checked = true;
  $("#deleteTerminalTask")?.classList.add("hidden");
  if ($("#terminalTaskEditorKicker")) $("#terminalTaskEditorKicker").textContent = "Neue Aufgabe";
  if ($("#terminalTaskEditorTitle")) $("#terminalTaskEditorTitle").textContent = "Aufgabe planen";
  updateTerminalTaskEditorFields();
}

function loadTerminalTaskEditor(id) {
  const task = (state.terminalTaskTemplates || []).find((item) => item.id === id);
  if (!task) return;
  $("#terminalTaskEditId").value = task.id;
  $("#terminalTaskTitle").value = task.title || "";
  $("#terminalTaskDescription").value = task.note || "";
  $("#terminalTaskFrequency").value = ["next-day"].includes(task.frequency) ? "once" : task.frequency || "once";
  $("#terminalTaskDate").value = task.date || task.startDate || state.terminalTaskCalendarDate || todayKey();
  $("#terminalTaskWeekday").value = String(task.weekdays?.[0] ?? 1);
  $("#terminalTaskMonthday").value = String(task.dayOfMonth || 1);
  $("#terminalTaskInterval").value = String(task.intervalDays || 14);
  $("#terminalTaskDueTime").value = task.dueTime || task.popupTime || "";
  $("#terminalTaskArea").value = task.areaId || "";
  $("#terminalTaskAssignee").value = task.assignee || "";
  $("#terminalTaskActive").checked = task.active !== false;
  $("#deleteTerminalTask")?.classList.remove("hidden");
  $("#terminalTaskEditorKicker").textContent = "Aufgabe bearbeiten";
  $("#terminalTaskEditorTitle").textContent = task.title || "Aufgabe";
  updateTerminalTaskEditorFields();
}

function currentTerminalTaskEditorPayload() {
  const id = $("#terminalTaskEditId")?.value || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const existing = (state.terminalTaskTemplates || []).find((task) => task.id === id) || {};
  const frequency = $("#terminalTaskFrequency")?.value || "once";
  const date = $("#terminalTaskDate")?.value || state.terminalTaskCalendarDate || todayKey();
  return {
    ...existing,
    id,
    title: $("#terminalTaskTitle")?.value.trim() || "",
    note: $("#terminalTaskDescription")?.value.trim() || "",
    category: existing.category || "running",
    frequency,
    date: frequency === "once" ? date : "",
    startDate: frequency === "interval" ? date : "",
    endDate: existing.endDate || "",
    weekdays: frequency === "weekly" ? [Number($("#terminalTaskWeekday")?.value || 1)] : [],
    dayOfMonth: frequency === "monthly" ? Number($("#terminalTaskMonthday")?.value || 1) : 1,
    intervalDays: frequency === "interval" ? Number($("#terminalTaskInterval")?.value || 14) : 1,
    dueTime: $("#terminalTaskDueTime")?.value || "",
    areaId: $("#terminalTaskArea")?.value || "",
    assignee: $("#terminalTaskAssignee")?.value || "",
    active: $("#terminalTaskActive")?.checked !== false,
    createdAt: existing.createdAt || new Date().toISOString()
  };
}

async function saveTerminalCalendarTask(button) {
  const task = currentTerminalTaskEditorPayload();
  if (!task.title) return showToast("Bitte Aufgabenname eingeben.");
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    await terminalAction({ action: "save-task-template", task });
    resetTerminalTaskEditor(task.date || task.startDate || state.terminalTaskCalendarDate);
    renderTerminalTaskCalendar();
    showToast("Aufgabe gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.disabled = false;
    button.textContent = oldText;
  }
}

async function deleteTerminalCalendarTask(button) {
  const id = $("#terminalTaskEditId")?.value || "";
  const task = (state.terminalTaskTemplates || []).find((item) => item.id === id);
  if (!task || !confirm(`Aufgabe "${task.title}" löschen?`)) return;
  button.disabled = true;
  try {
    await terminalAction({ action: "delete-task-template", id });
    resetTerminalTaskEditor();
    renderTerminalTaskCalendar();
    showToast("Aufgabe gelöscht.");
  } catch (error) {
    showError(error);
  } finally {
    button.disabled = false;
  }
}

function openTerminalTaskAreaManager() {
  renderTerminalTaskAreaManager();
  $("#terminalTaskAreaModal")?.classList.remove("hidden");
}

function closeTerminalTaskAreaManager() {
  $("#terminalTaskAreaModal")?.classList.add("hidden");
  if ($("#terminalTaskAreaId")) $("#terminalTaskAreaId").value = "";
  if ($("#terminalTaskAreaName")) $("#terminalTaskAreaName").value = "";
  if ($("#terminalTaskAreaColor")) $("#terminalTaskAreaColor").value = "#7c3aed";
  if ($("#terminalTaskAreaActive")) $("#terminalTaskAreaActive").checked = true;
}

async function saveTerminalTaskArea(button) {
  const area = {
    id: $("#terminalTaskAreaId")?.value || `area-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: $("#terminalTaskAreaName")?.value.trim() || "",
    color: $("#terminalTaskAreaColor")?.value || "#7c3aed",
    active: $("#terminalTaskAreaActive")?.checked !== false
  };
  if (!area.name) return showToast("Bitte Bereichsname eingeben.");
  button.disabled = true;
  try {
    await terminalAction({ action: "save-task-area", area });
    closeTerminalTaskAreaManager();
    openTerminalTaskAreaManager();
    renderTerminalTaskCalendar();
    showToast("Bereich gespeichert.");
  } catch (error) {
    showError(error);
  } finally {
    button.disabled = false;
  }
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
    "offerType",
    "bmwTreasurePackage",
    "eventDate",
    "personsAdults",
    "personsChildren",
    "conferenceEnabled",
    "conferenceMorningSnackText",
    "conferenceMorningSnackTime",
    "startTime",
    "mealTime",
    "sparklingReceptionTime",
    "sparklingReceptionPrice",
    "campfireTime",
    "campfirePrice",
    "drinksMode",
    "drinksCustomText",
    "drinksCustomPrice",
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
  const container = offerWorkspaceRoot();
  if (container?.querySelector("[data-offer-field]")) {
    state.offerCustomerSearch = container.querySelector("#offerCustomerSearch")?.value || state.offerCustomerSearch || "";
    state.offerDraft = currentOfferDraftFromDom();
    state.offerDraftId = state.offerDraft.id;
  }
  renderAdminOffers();
  if (focusSelector) {
    const focusTarget = offerWorkspaceRoot()?.querySelector(focusSelector);
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
        terminalToken: state.terminalToken,
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
        terminalToken: state.terminalToken,
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
  state.offerShoePersonsManual = false;
  renderAdminOffers();
}

function applyBmwTreasurePackage(draftValue, packageKey) {
  const selectedPackage = OFFER_BMW_TREASURE_PACKAGES[packageKey];
  if (!selectedPackage) return normalizeOfferClient(draftValue);
  const draft = cloneData(draftValue);
  draft.offerType = "bmw-treasure";
  draft.bmwTreasurePackage = packageKey;
  draft.title = `BMW Schatzkiste ${selectedPackage.name}`;
  draft.occasion = "BMW Schatzkiste";
  draft.conference = { enabled: false, morningSnackText: "", morningSnackTime: "" };
  draft.bowling = { tournamentPackage: "", lanes: 0, shoePersons: 0, fromTime: "", toTime: "" };
  draft.buffet = { templateKey: "", name: "", pricePerPerson: 0, sparklingReception: false, categories: normalizeOfferBuffetCategoriesClient({}) };
  draft.drinksMode = "menu";
  draft.drinksCustomText = "";
  draft.drinksCustomPrice = 0;
  draft.reservedArea = "";
  draft.reservedAreaPrice = 0;
  draft.reservedAreaCampfire = false;
  draft.costs = [];
  return normalizeOfferClient(draft);
}

async function toggleOfferConfirmed(offerId, button) {
  let offer = normalizeOffersClient(state.offers || []).find((item) => item.id === offerId);
  if (!offer) return;
  if (state.offerDraft?.id === offerId && state.offerDraftDirty) offer = currentOfferDraftFromDom();
  if (!offer.confirmed && !offer.eventDate) {
    showToast("Bitte zuerst das Veranstaltungsdatum eintragen.");
    return;
  }
  const nextConfirmed = !offer.confirmed;
  if (!nextConfirmed && !window.confirm("Bestätigung für dieses Angebot zurücknehmen?")) return;
  const nextOffer = normalizeOfferClient({ ...offer, confirmed: nextConfirmed, confirmedAt: nextConfirmed ? new Date().toISOString() : "" });
  if (button) { button.disabled = true; button.textContent = "Speichert..."; }
  try {
    const result = await api("/api/state", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({ action: "save-offer", adminToken: state.adminToken, terminalToken: state.terminalToken, offer: nextOffer })
    });
    state.offers = normalizeOffersClient(result.offers || state.offers || []);
    if (state.offerDraft?.id === offerId) {
      state.offerDraft = cloneData(result.offer || nextOffer);
      state.offerDraftId = offerId;
      state.offerDraftDirty = false;
    }
    renderAdminOffers();
    renderTerminalExtras(state.terminalDate || todayKey());
    if (state.terminalTab === "events") renderTerminalEventCalendar();
    showToast(nextConfirmed ? "Angebot bestätigt und im Veranstaltungskalender eingetragen." : "Bestätigung zurückgenommen.");
  } catch (error) {
    showError(error);
    renderAdminOffers();
  }
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
  const grouped = [];
  timed.forEach((item) => {
    const last = grouped[grouped.length - 1];
    if (last && last.time === item.time) {
      last.events.push(item);
      return;
    }
    grouped.push({ time: item.time, events: [item] });
  });
  const minutes = grouped.map((item) => offerTimeMinutesValue(item.time)).filter((value) => value != null);
  const minMinutes = Math.min(...minutes);
  const maxMinutes = Math.max(...minutes);
  const span = Math.max(60, maxMinutes - minMinutes);
  const points = grouped.map((group, index) => {
    const value = offerTimeMinutesValue(group.time) ?? minMinutes;
    const ratio = grouped.length === 1 ? 0.5 : (value - minMinutes) / span;
    const left = 4 + Math.max(0, Math.min(1, ratio)) * 92;
    const palette = index % 3 === 1 ? "gold" : index % 3 === 2 ? "dark" : "red";
    const items = group.events.map((item) => `
      <div class="scale-entry">
        <div class="scale-label">${escapeHtml(item.title || "Ereignis")}</div>
        ${item.note ? `<div class="scale-note">${escapeHtml(item.note)}</div>` : ""}
      </div>
    `).join("");
    return `
      <div class="scale-point" style="left:${left}%">
        <div class="scale-time">${escapeHtml(group.time)}</div>
        <div class="scale-dot is-${palette}"></div>
        <div class="scale-stack">${items}</div>
      </div>
    `;
  }).join("");
  return `
    <div class="scale-wrap">
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
  const bmwTreasurePricing = offerBmwTreasurePricing(draft);
  const timelineEvents = offerTimelineEvents(draft);
  const templateBadge = offerTemplateBadgeLabel(draft);
  const includedTextBlocks = draft.textBlocks || {};
  const drinksByMenuText = bmwTreasurePricing.selectedPackage ? "" : (includedTextBlocks.drinksByMenu?.enabled ? includedTextBlocks.drinksByMenu.text : "");
  const drinksCustomText = draft.drinksMode === "custom" ? (draft.drinksCustomText || "Getränke nach Sonderabsprache") : "";
  const pricingNoticeText = bmwTreasurePricing.selectedPackage
    ? "Die spätestens 48 Stunden vor Veranstaltungsbeginn gemeldete Personenzahl ist die verbindliche Rechnungsgrundlage."
    : (includedTextBlocks.pricingNotice?.enabled ? includedTextBlocks.pricingNotice.text : "");
  const cancellationText = bmwTreasurePricing.selectedPackage
    ? "Bei Nichterscheinen zum reservierten Termin wird die Veranstaltung vollständig berechnet."
    : (includedTextBlocks.cancellationTerms?.enabled ? includedTextBlocks.cancellationTerms.text : "");
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
      <td><span class="cost-icon">+</span>${escapeHtml(item.label || "—")}</td>
      <td>${escapeHtml(item.note || item.label || "Zusatzleistung")}</td>
      <td>${escapeHtml(item.quantity || 0)}</td>
      <td>${formatMoney(item.unitPrice || 0)}</td>
      <td>${formatMoney((cleanOfferMoneyValue(item.quantity) * cleanOfferMoneyValue(item.unitPrice)))}</td>
    </tr>
  `).join("");
  const conferenceCostRows = draft.conference?.enabled
    ? `<tr><td><span class="cost-icon">T</span>Tagungspauschale</td><td>Pauschale für bis zu ${OFFER_CONFERENCE_INCLUDED_PERSONS} Personen</td><td>1 Pauschale</td><td>${formatMoney(OFFER_CONFERENCE_BASE_PRICE)}</td><td>${formatMoney(OFFER_CONFERENCE_BASE_PRICE)}</td></tr>
      ${totals.conferenceExtraPersons > 0 ? `<tr><td><span class="cost-icon">+</span>Zusätzliche Personen</td><td>Je weitere Person ab der 26. Person</td><td>${totals.conferenceExtraPersons} Pers.</td><td>${formatMoney(OFFER_CONFERENCE_EXTRA_PERSON_PRICE)}</td><td>${formatMoney(totals.conferenceExtraTotal)}</td></tr>` : ""}`
    : "";
  const bmwTreasureCostRows = bmwTreasurePricing.selectedPackage
    ? `<tr><td><span class="cost-icon">B</span>BMW Schatzkiste ${escapeHtml(bmwTreasurePricing.selectedPackage.name)}</td><td>${escapeHtml(bmwTreasurePricing.selectedPackage.food)}</td><td>${bmwTreasurePricing.persons} Pers.</td><td>${formatMoney(bmwTreasurePricing.selectedPackage.pricePerPerson)}</td><td>${formatMoney(bmwTreasurePricing.total)}</td></tr>`
    : "";
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
      ${bowling.laneCost > 0 ? `<tr><td><span class="cost-icon">B</span>Bowling</td><td>${escapeHtml(`${bowling.durationLabel} inkl. Bahnmiete`)}</td><td>${escapeHtml(`${draft.bowling?.lanes || 0} Bahn(en)`)}</td><td>laut Tarif</td><td>${formatMoney(bowling.laneCost)}</td></tr>` : ""}
      ${bowling.shoeCost > 0 ? `<tr><td><span class="cost-icon">S</span>Leihschuhe</td><td>Leihschuhe für die Gäste</td><td>${escapeHtml(`${draft.bowling?.shoePersons || 0} Pers.`)}</td><td>${formatMoney(OFFER_BOWLING_SHOE_PRICE)}</td><td>${formatMoney(bowling.shoeCost)}</td></tr>` : ""}
      ${bowling.tournamentCost > 0 ? `<tr><td><span class="cost-icon">T</span>${escapeHtml(bowling.tournamentPackageLabel || "Turnierpaket")}</td><td>${escapeHtml(bowling.tournamentPackageDescription || "Zusatzpaket")}</td><td>1</td><td>${formatMoney(bowling.tournamentCost)}</td><td>${formatMoney(bowling.tournamentCost)}</td></tr>` : ""}
    `
    : "";
  const buffetCostRows = buffetPricing.buffetBaseTotal > 0 || buffetPricing.sparklingReceptionTotal > 0
    ? `
      ${buffetPricing.adults > 0 && buffetPricing.pricePerPerson > 0 ? `<tr><td><span class="cost-icon">F</span>Buffet</td><td>${escapeHtml(draft.buffet?.name || "Buffet laut Beschreibung")}</td><td>${escapeHtml(`${buffetPricing.adults} Pers.`)}</td><td>${formatMoney(buffetPricing.pricePerPerson)}</td><td>${formatMoney(buffetPricing.adults * buffetPricing.pricePerPerson)}</td></tr>` : ""}
      ${buffetPricing.children > 0 && buffetPricing.pricePerPerson > 0 ? `<tr><td><span class="cost-icon">K</span>Buffet Kinder</td><td>Kinder unter 12 Jahren</td><td>${escapeHtml(`${buffetPricing.children} Pers.`)}</td><td>${formatMoney(buffetPricing.pricePerPerson * OFFER_CHILD_DISCOUNT_FACTOR)}</td><td>${formatMoney(buffetPricing.children * buffetPricing.pricePerPerson * OFFER_CHILD_DISCOUNT_FACTOR)}</td></tr>` : ""}
      ${draft.buffet?.sparklingReception && buffetPricing.adults > 0 ? `<tr><td><span class="cost-icon">W</span>Sektempfang</td><td>Welcome Drink bei Ankunft</td><td>${escapeHtml(`${buffetPricing.adults} Pers.`)}</td><td>${formatMoney(buffetPricing.sparklingReceptionPrice)}</td><td>${formatMoney(buffetPricing.adults * buffetPricing.sparklingReceptionPrice)}</td></tr>` : ""}
      ${draft.buffet?.sparklingReception && buffetPricing.children > 0 ? `<tr><td><span class="cost-icon">W</span>Sektempfang Kinder</td><td>Kinder unter 12 Jahren</td><td>${escapeHtml(`${buffetPricing.children} Pers.`)}</td><td>${formatMoney(buffetPricing.sparklingReceptionPrice * OFFER_CHILD_DISCOUNT_FACTOR)}</td><td>${formatMoney(buffetPricing.children * buffetPricing.sparklingReceptionPrice * OFFER_CHILD_DISCOUNT_FACTOR)}</td></tr>` : ""}
    `
    : "";
  const reservedAreaCostRows = reservedAreaPricing.roomFee > 0 || reservedAreaPricing.campfireFee > 0
    ? `
      ${reservedAreaPricing.roomFee > 0 ? `<tr><td><span class="cost-icon">R</span>Raumreservierung</td><td>${escapeHtml(reservedAreaPricing.roomFeeLabel || "Reservierter Bereich")}</td><td>1</td><td>${formatMoney(reservedAreaPricing.roomFee)}</td><td>${formatMoney(reservedAreaPricing.roomFee)}</td></tr>` : ""}
      ${reservedAreaPricing.campfireFee > 0 ? `<tr><td><span class="cost-icon">L</span>Lagerfeuerstelle</td><td>Inklusive Feuerholz</td><td>1</td><td>${formatMoney(reservedAreaPricing.campfireFee)}</td><td>${formatMoney(reservedAreaPricing.campfireFee)}</td></tr>` : ""}
    `
    : "";
  const drinksCostRows = draft.drinksMode === "custom" && totals.drinksTotal > 0
    ? `<tr><td><span class="cost-icon">G</span>Getränke</td><td>${escapeHtml(drinksCustomText)}</td><td>1</td><td>${formatMoney(totals.drinksTotal)}</td><td>${formatMoney(totals.drinksTotal)}</td></tr>`
    : "";
  const personsSummary = totals.children ? `${totals.adults} + ${totals.children} Kinder` : `${totals.personCount || 0}`;
  const venueInfo = [reservedAreaPricing.reservedAreaLabel, draft.additionalInfo].filter(Boolean).join("\n\n");
  const offerValidUntil = (() => {
    if (!draft.offerDate) return "-";
    const value = new Date(`${draft.offerDate}T12:00:00`);
    value.setDate(value.getDate() + 14);
    return formatDate(value.toISOString().slice(0, 10));
  })();
  const offerAreaLabel = draft.conference?.enabled
    ? "Tagungsraum"
    : (reservedAreaPricing.reservedAreaLabel || "LA-Bowling");
  const includedItems = [
    bmwTreasurePricing.selectedPackage ? { icon: "B", title: `BMW Schatzkiste ${bmwTreasurePricing.selectedPackage.name}`, text: `${bmwTreasurePricing.selectedPackage.details} ${bmwTreasurePricing.selectedPackage.note}` } : null,
    draft.conference?.enabled ? { icon: "T", title: "Tagungspauschale", text: `Bis 25 Personen inklusive · jede weitere Person ${formatMoney(OFFER_CONFERENCE_EXTRA_PERSON_PRICE)}` } : null,
    draft.conference?.enabled ? { icon: "V", title: "Vormittagssnack", text: `${draft.conference.morningSnackTime ? `${draft.conference.morningSnackTime} Uhr · ` : ""}${draft.conference.morningSnackText || "Nach Absprache"}` } : null,
    draft.conference?.enabled ? { icon: "R", title: "Reservierter Bereich", text: "Tagungsraum" } : null,
    draft.conference?.enabled ? { icon: "A", title: "Tagungsausstattung", text: "WLAN, Sonderöffnung, Parkplätze, Beamer, Leinwand und Flipchart" } : null,
    draft.conference?.enabled ? { icon: "W", title: "Wasser still / spritzig", text: "In der Tagungspauschale enthalten" } : null,
    draft.conference?.enabled ? { icon: "F", title: "Fruchtsäfte", text: "In der Tagungspauschale enthalten" } : null,
    draft.conference?.enabled ? { icon: "K", title: "Kaffee", text: "In der Tagungspauschale enthalten" } : null,
    draft.conference?.enabled ? { icon: "T", title: "Tee", text: "In der Tagungspauschale enthalten" } : null,
    bowling.total > 0 ? { icon: "B", title: "Bowling", text: `${bowling.durationLabel}${draft.bowling?.lanes ? ` · ${draft.bowling.lanes} Bahn(en)` : ""}` } : null,
    buffetPricing.buffetBaseTotal > 0 ? { icon: "F", title: draft.conference?.enabled ? "Mittagsbuffet" : "Buffet", text: `${draft.buffet?.name || "Buffet"} · ${formatMoney(draft.buffet?.pricePerPerson || 0)} pro Person` } : null,
    !draft.conference?.enabled && reservedAreaPricing.reservedAreaLabel ? { icon: "R", title: "Reservierter Bereich", text: reservedAreaPricing.reservedAreaLabel } : null,
    draft.buffet?.sparklingReception ? { icon: "S", title: "Sektempfang", text: `${formatMoney(draft.sparklingReceptionPrice)} pro Person${draft.sparklingReceptionTime ? ` · ${draft.sparklingReceptionTime} Uhr` : ""}` } : null,
    draft.reservedAreaCampfire ? { icon: "L", title: "Lagerfeuer", text: `${formatMoney(draft.campfirePrice)} pauschal${draft.campfireTime ? ` · ${draft.campfireTime} Uhr` : ""}` } : null,
    bmwTreasurePricing.selectedPackage ? null : draft.drinksMode === "custom"
      ? { icon: "G", title: "Getränke", text: `${drinksCustomText} · ${formatMoney(totals.drinksTotal)}` }
      : draft.conference?.enabled ? null : { icon: "G", title: "Getränke", text: "Werden laut Karte berechnet" }
  ].filter(Boolean);
  const conferenceDescription = draft.conference?.enabled ? `
    <section class="template-card conference-description">
      <h3 class="section-title">In der Tagungspauschale enthalten</h3>
      <p>Die Tagungspauschale umfasst die Sonderöffnung und Nutzung des Tagungsraums, kostenfreies WLAN, Parkplätze direkt am Center sowie Beamer, Leinwand und Flipchart.</p>
      <p>Inklusive sind außerdem Tagungsgetränke mit Wasser still und spritzig, Fruchtsäften, Kaffee und Tee sowie der Vormittagssnack${draft.conference.morningSnackTime ? ` um ${escapeHtml(draft.conference.morningSnackTime)} Uhr` : ""}${draft.conference.morningSnackText ? ` mit ${escapeHtml(draft.conference.morningSnackText)}` : " nach Absprache"}.</p>
      <p class="muted"><strong>Nicht in der Pauschale enthalten:</strong> Das Mittagsbuffet wird separat nach unseren Buffetvorschlägen berechnet. Bowling kann zusätzlich gebucht werden.</p>
    </section>
  ` : "";
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
          :root { --navy: #071b31; --navy-soft: #102b48; --red: #e30613; --line: #dce4ec; --muted: #64748b; }
          .sheet { width: 210mm; min-height: 297mm; height: 297mm; padding: 0 10mm 8mm; position: relative; background: #fff; display: flex; flex-direction: column; gap: 4mm; overflow: hidden; }
          .sheet + .sheet { page-break-before: always; margin-top: 0; }
          .header { margin: 0 -10mm 5mm; height: 31mm; padding: 6mm 10mm; display: flex; align-items: center; justify-content: space-between; overflow: hidden; background: linear-gradient(135deg, var(--navy) 0%, #0a233d 65%, #061425 100%); color: #fff; }
          .header-left { display: flex; align-items: center; }
          .header-right { min-width: 68mm; display: grid; gap: 1.4mm; font-size: 9px; line-height: 1.3; }
          .header-right span { display: flex; gap: 2.5mm; align-items: center; }
          .header-logo { width: 62mm; max-width: 100%; filter: brightness(0) invert(1); }
          .title-row { display: flex; align-items: center; justify-content: space-between; margin: 1mm 0 3mm; }
          .page-title { margin: 0; color: var(--navy); font-size: 25px; line-height: 1; font-weight: 800; }
          .date-card { display: flex; align-items: center; gap: 3mm; padding: 3mm 4mm; border: 1px solid var(--line); border-radius: 3mm; min-width: 50mm; }
          .date-icon, .round-icon { width: 9mm; height: 9mm; border-radius: 50%; background: var(--red); color: #fff; display: inline-grid; place-items: center; font-size: 11px; font-weight: 800; flex: none; }
          .date-card small { display: block; color: var(--muted); font-size: 8px; }
          .date-card strong { display: block; color: var(--navy); font-size: 11px; margin-top: 0.6mm; }
          .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 4.5mm; }
          .template-card { border: 1px solid var(--line); border-radius: 3mm; padding: 4mm 4.5mm; background: #fff; page-break-inside: avoid; }
          .template-card + .template-card { margin-top: 4.5mm; }
          .section-title { display: flex; align-items: center; gap: 2.5mm; margin: 0 0 3mm; color: var(--navy); font-size: 13px; font-weight: 800; }
          .section-title::before { content: attr(data-icon); width: 9mm; height: 9mm; border-radius: 50%; background: var(--red); color: #fff; display: inline-grid; place-items: center; flex: none; font-size: 10px; }
          .muted { color: var(--muted); }
          .event-grid { display: grid; grid-template-columns: 100px 1fr; row-gap: 4px; column-gap: 10px; font-size: 11px; }
          .event-grid strong { color: #77716a; font-size: 10px; text-transform: uppercase; letter-spacing: 0.03em; }
          .scale-wrap { position: relative; margin-top: 2.5mm; min-height: 46mm; padding: 6mm 3mm 0; }
          .scale-line { position: absolute; left: 4%; right: 4%; top: 18mm; height: 1px; background: var(--navy-soft); }
          .scale-point { position: absolute; top: 0; transform: translateX(-50%); width: 30mm; text-align: center; }
          .scale-time { font-size: 10px; font-weight: 700; margin-bottom: 6mm; }
          .scale-dot { width: 8mm; height: 8mm; border-radius: 999px; margin: 0 auto 4.5mm; border: 3px solid #fff; box-shadow: 0 0 0 1px rgba(0,0,0,0.08); }
          .scale-dot.is-red, .scale-dot.is-gold, .scale-dot.is-dark { background: var(--red); }
          .scale-stack { display: grid; gap: 2.5mm; }
          .scale-entry { display: grid; gap: 1px; }
          .scale-label { font-size: 9.6px; font-weight: 700; line-height: 1.25; }
          .scale-note { font-size: 8.7px; color: #6d6b68; line-height: 1.25; }
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
          .cost-table { width: 100%; border: 1px solid var(--line); border-collapse: separate; border-spacing: 0; border-radius: 3mm; overflow: hidden; margin-top: 3mm; font-size: 10px; }
          .cost-table th { text-align: left; font-size: 9px; color: var(--navy); background: #f5f8fb; padding: 2.7mm 2.5mm; border-bottom: 1px solid var(--line); }
          .cost-table td { padding: 2.7mm 2.5mm; vertical-align: middle; border-bottom: 1px solid var(--line); }
          .cost-table tbody tr:last-child td { border-bottom: 0; }
          .cost-table td:last-child, .cost-table th:last-child { text-align: right; }
          .cost-table td:nth-child(3), .cost-table th:nth-child(3), .cost-table td:nth-child(4), .cost-table th:nth-child(4) { text-align: center; }
          .cost-icon { width: 7mm; height: 7mm; margin-right: 2mm; display: inline-grid; place-items: center; border-radius: 50%; background: var(--red); color: #fff; font-size: 8px; font-weight: 800; vertical-align: middle; }
          .cost-note { margin-top: 3mm; font-size: 9px; color: #6d6b68; }
          .total-line { margin-top: 0; padding: 4mm 5mm; display: flex; justify-content: space-between; align-items: center; border-radius: 0 0 3mm 3mm; background: var(--navy); color: #fff; font-size: 13px; font-weight: 700; }
          .total-line strong { font-size: 22px; }
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
          .buffet-highlight { display: flex; align-items: center; justify-content: space-between; gap: 5mm; border-color: #f2b4b9; background: #fffafa; }
          .buffet-highlight-main { display: flex; align-items: center; gap: 3mm; }
          .buffet-highlight h3 { margin: 0 0 1mm; color: var(--navy); font-size: 14px; }
          .buffet-highlight p { margin: 0; font-size: 9px; color: var(--muted); }
          .buffet-price { color: var(--red); font-size: 20px; font-weight: 800; text-align: right; white-space: nowrap; }
          .buffet-price small { display: block; color: var(--navy); font-size: 8px; font-weight: 400; }
          .included-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
          .included-item { display: flex; gap: 2.5mm; padding: 1mm 3mm; min-height: 20mm; }
          .included-item + .included-item { border-left: 1px solid var(--line); }
          .included-item strong { display: block; margin: 1mm 0; color: var(--navy); font-size: 10px; }
          .included-item span:last-child { color: var(--muted); font-size: 8.5px; line-height: 1.35; }
          .conference-description { border-top: 2px solid var(--navy); }
          .conference-description p { margin: 0; font-size: 9px; line-height: 1.45; }
          .conference-description p + p { margin-top: 1.5mm; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
          .info-grid .info-card { margin: 0; min-height: 28mm; }
          .info-card .section-title { font-size: 11px; margin-bottom: 2mm; }
          .signature-grid { grid-template-columns: repeat(4, 1fr); gap: 7mm; }
          /* Professional customer document: calm, compact and print-safe. */
          .header { height: 29mm; padding-top: 5mm; padding-bottom: 5mm; align-items: flex-start; }
          .header-left { display: grid; gap: 2mm; }
          .header-logo { width: 54mm; }
          .sender-contact { font-size: 7.8px; line-height: 1.35; color: #d8e2ec; }
          .header-right { min-width: 61mm; gap: 1mm; text-align: right; font-size: 8.5px; }
          .header-right span { justify-content: space-between; gap: 5mm; }
          .header-right b { font-weight: 700; color: #fff; }
          .title-row { align-items: flex-end; margin: 0 0 3mm; padding-bottom: 3mm; border-bottom: 1px solid var(--line); }
          .title-copy small { display: block; margin-top: 1.5mm; color: var(--muted); font-size: 9px; }
          .page-title { font-size: 22px; letter-spacing: 0; }
          .date-card { display: none; }
          .template-card { border: 0; border-top: 1px solid var(--line); border-radius: 0; padding: 3mm 0; }
          .grid-two > .template-card { border-top: 2px solid var(--navy); }
          .section-title { margin-bottom: 2.5mm; font-size: 12px; }
          .section-title::before, .round-icon, .cost-icon { display: none; }
          .details-copy { font-size: 9.6px; line-height: 1.5; }
          .event-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0; border: 1px solid var(--line); }
          .event-detail { min-width: 0; padding: 2.5mm 3mm; border-bottom: 1px solid var(--line); }
          .event-detail:nth-child(odd) { border-right: 1px solid var(--line); }
          .event-detail.is-wide { grid-column: 1 / -1; border-right: 0; }
          .event-detail.is-wide:last-child { border-bottom: 0; }
          .event-detail small { display: block; margin-bottom: .8mm; color: var(--muted); font-size: 7.5px; text-transform: uppercase; }
          .event-detail strong { display: block; overflow-wrap: anywhere; color: var(--navy); font-size: 9.5px; line-height: 1.3; }
          .timeline-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
          .timeline-table th { padding: 2.2mm 2.5mm; border-bottom: 1px solid var(--navy); color: var(--muted); font-size: 7.5px; text-align: left; text-transform: uppercase; }
          .timeline-table td { padding: 2.5mm; border-bottom: 1px solid var(--line); vertical-align: top; line-height: 1.35; }
          .timeline-table tbody tr:last-child td { border-bottom: 0; }
          .timeline-table th:first-child, .timeline-table td:first-child { width: 25mm; color: var(--navy); font-weight: 700; }
          .timeline-table th:nth-child(2), .timeline-table td:nth-child(2) { width: 55mm; }
          .timeline-table td:nth-child(2) { font-weight: 700; }
          .timeline-table td:last-child { color: var(--muted); }
          .scale-wrap { min-height: 36mm; padding-top: 4mm; margin-top: 1mm; }
          .scale-line { top: 14mm; height: 1px; background: var(--navy); }
          .scale-point { width: 25mm; }
          .scale-time { margin-bottom: 4mm; color: var(--navy); font-size: 9px; }
          .scale-dot { width: 4.5mm; height: 4.5mm; margin-bottom: 3mm; border-width: 1.2mm; box-shadow: none; }
          .scale-label { font-size: 8.5px; line-height: 1.2; overflow-wrap: anywhere; }
          .scale-note { font-size: 7.5px; line-height: 1.2; overflow-wrap: anywhere; }
          .buffet-highlight { flex-wrap: wrap; padding: 3mm 0; background: #fff; border-color: var(--line); }
          .buffet-highlight-main { display: block; }
          .buffet-highlight h3 { font-size: 12px; }
          .buffet-price { font-size: 17px; }
          .buffet-menu { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 2.5mm; padding-top: 2.5mm; border-top: 1px solid var(--line); }
          .offer-print-buffet-group h4 { margin: 0 0 1mm; color: var(--navy); font-size: 8.5px; }
          .offer-print-buffet-group ul { margin: 0; padding: 0; list-style: none; color: var(--muted); font-size: 7.6px; line-height: 1.3; }
          .offer-print-buffet-group li + li { margin-top: .8mm; }
          .offer-print-buffet-group span { display: block; }
          .included-grid { grid-template-columns: repeat(2, 1fr); gap: 0 5mm; }
          .included-item { min-height: 0; padding: 2mm 0; border-bottom: 1px solid var(--line); }
          .included-item + .included-item { border-left: 0; }
          .included-item strong { margin: 0 0 .8mm; font-size: 9.5px; }
          .included-item span:last-child { font-size: 8px; }
          .cost-card { border-top: 0; padding-top: 0; }
          .cost-table { border: 0; border-radius: 0; font-size: 9px; }
          .cost-table th { padding: 2.6mm 2.3mm; background: var(--navy); color: #fff; font-size: 8px; }
          .cost-table td { padding: 2.5mm 2.3mm; }
          .cost-table td:nth-child(n+3) { white-space: nowrap; text-align: right; }
          .cost-table th:nth-child(n+3) { text-align: right; }
          .total-line { margin-top: 2mm; border-radius: 1.5mm; padding: 4.5mm 5mm; }
          .total-line span small { display: block; margin-top: 1mm; color: #d8e2ec; font-size: 7.5px; font-weight: 400; }
          .info-groups { display: grid; grid-template-columns: 1fr 1.12fr; gap: 6mm; }
          .info-group { border-top: 2px solid var(--navy); }
          .info-group > h3 { margin: 0; padding: 3mm 0 1mm; color: var(--navy); font-size: 11px; }
          .info-grid { display: block; }
          .info-grid .info-card { min-height: 0; margin: 0; padding: 2.5mm 0; border: 0; border-bottom: 1px solid var(--line); border-radius: 0; }
          .info-card .section-title { margin-bottom: 1mm; font-size: 9.5px; }
          .info-card p { font-size: 8.2px; line-height: 1.35; }
          .signature-card { margin-top: 1mm; padding: 3mm 0 4mm; border-width: 1px 0 0; border-radius: 0; }
          .signature-card.offer-acceptance { margin-top: auto; }
          .signature-card.offer-acceptance + .footer { margin-top: 0; }
          .signature-grid { margin-top: 7mm; }
          .signature-line { min-height: 11mm; }
          .footer { border-color: var(--line); color: var(--muted); font-size: 7.5px; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div class="header-left">
              <img class="header-logo" src="/la-bowling-print-logo.png" alt="LA Bowling">
              <div class="sender-contact">Röntgenstraße 12 a · 84030 Landshut · LA-Bowling Veranstaltungsservice</div>
            </div>
            <div class="header-right">
              <span>Angebot <b>${escapeHtml(draft.title || draft.customerName || "Veranstaltung")}</b></span>
              <span>Angebotsdatum <b>${escapeHtml(draft.offerDate ? formatDate(draft.offerDate) : "-")}</b></span>
              <span>Gültig bis <b>${escapeHtml(offerValidUntil)}</b></span>
            </div>
          </div>
          <div class="title-row">
            <div class="title-copy"><h2 class="page-title">Angebot für Ihre Veranstaltung</h2>${draft.occasion ? `<small>${escapeHtml(draft.occasion)}</small>` : ""}</div>
          </div>
          <div class="grid-two">
            <section class="template-card">
              <h3 class="section-title">Kundendaten</h3>
              <div class="details-copy"><strong>${escapeHtml(draft.customerName || "-")}</strong>${draft.customerContact ? `\n${escapeHtml(draft.customerContact)}` : ""}${draft.customerAddress ? `\n${escapeHtml(draft.customerAddress)}` : ""}${draft.customerPhone ? `\n\n${escapeHtml(draft.customerPhone)}` : ""}${draft.customerEmail ? `\n${escapeHtml(draft.customerEmail)}` : ""}</div>
            </section>
            <section class="template-card">
              <h3 class="section-title">Veranstaltungsdetails</h3>
              <div class="event-grid">
                <div class="event-detail"><small>Datum</small><strong>${escapeHtml(draft.eventDate ? formatDate(draft.eventDate) : "-")}</strong></div>
                <div class="event-detail"><small>Personen</small><strong>${escapeHtml(personsSummary)}</strong></div>
                <div class="event-detail"><small>Beginn</small><strong>${escapeHtml(draft.startTime || draft.bowling?.fromTime || "-")} Uhr</strong></div>
                <div class="event-detail"><small>Bereich</small><strong>${escapeHtml(offerAreaLabel)}</strong></div>
                <div class="event-detail is-wide"><small>Anlass</small><strong>${escapeHtml(draft.occasion || "-")}</strong></div>
              </div>
            </section>
          </div>
          ${timeline ? `<section class="template-card"><h3 class="section-title">Ablauf Ihrer Veranstaltung</h3><table class="timeline-table"><thead><tr><th>Uhrzeit</th><th>Programmpunkt</th><th>Hinweis</th></tr></thead><tbody>${timeline}</tbody></table></section>` : ""}
          ${buffetPricing.buffetBaseTotal > 0 ? `<section class="template-card buffet-highlight">
            <div class="buffet-highlight-main">
              <div><h3>${escapeHtml(draft.buffet?.name || templateBadge || "Buffet")}</h3><p>${escapeHtml(`${personsSummary} Personen · Buffet laut ausgewählter Zusammenstellung`)}</p></div>
            </div>
            <div class="buffet-price">${formatMoney(draft.buffet?.pricePerPerson || 0)}<small>pro Person</small></div>
            ${buffetSections ? `<div class="buffet-menu">${buffetSections}</div>` : ""}
          </section>` : ""}
          ${conferenceDescription}
          ${includedItems.length ? `<section class="template-card"><h3 class="section-title">Ihre Leistungen</h3><div class="included-grid">${includedItems.map((item) => `<div class="included-item"><span><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></span></div>`).join("")}</div></section>` : ""}
          <div class="footer">
            <span>LA Bowling · Röntgenstr. 12 · 84030 Landshut</span>
            <span>Seite 1 von 2</span>
          </div>
        </div>
        <div class="sheet">
          <div class="header">
            <div class="header-left">
              <img class="header-logo" src="/la-bowling-print-logo.png" alt="LA Bowling">
              <div class="sender-contact">Röntgenstraße 12 a · 84030 Landshut · LA-Bowling Veranstaltungsservice</div>
            </div>
            <div class="header-right">
              <span>Angebot <b>${escapeHtml(draft.title || draft.customerName || "Veranstaltung")}</b></span>
              <span>Angebotsdatum <b>${escapeHtml(draft.offerDate ? formatDate(draft.offerDate) : "-")}</b></span>
              <span>Gültig bis <b>${escapeHtml(offerValidUntil)}</b></span>
            </div>
          </div>
          <section class="template-card cost-card">
            <h2 class="page-title">Kostenübersicht</h2>
            <table class="cost-table">
              <thead><tr><th>Position</th><th>Beschreibung</th><th>Anzahl</th><th>Einzelpreis</th><th>Gesamtpreis</th></tr></thead>
              <tbody>
                ${bmwTreasureCostRows}
                ${conferenceCostRows}
                ${buffetCostRows}
                ${bowlingCostRows}
                ${reservedAreaCostRows}
                ${drinksCostRows}
                ${costs}
              </tbody>
            </table>
            ${vatNoticeText ? `<div class="cost-note">${escapeHtml(vatNoticeText)}</div>` : ""}
            <div class="total-line"><span>Gesamtbetrag<small>inkl. gesetzlicher MwSt.</small></span><strong>${formatMoney(totals.total)}</strong></div>
          </section>
          <div class="info-groups">
            <section class="info-group"><h3>Wichtige Hinweise</h3><div class="info-grid">
              <section class="info-card"><h3 class="section-title">Angebotsgültigkeit</h3><p>Dieses Angebot ist gültig bis ${escapeHtml(offerValidUntil)}.</p></section>
              ${(drinksByMenuText || drinksCustomText) ? `<section class="info-card"><h3 class="section-title">Getränke</h3><p>${escapeHtml(drinksCustomText || drinksByMenuText)}${draft.drinksMode === "custom" ? ` <strong>${formatMoney(totals.drinksTotal)}</strong>` : ""}</p></section>` : ""}
              ${vatNoticeText ? `<section class="info-card"><h3 class="section-title">Hinweise</h3><p>${escapeHtml(vatNoticeText)}</p></section>` : ""}
              ${pricingNoticeText ? `<section class="info-card"><h3 class="section-title">Preisgrundlage</h3><p>${escapeHtml(pricingNoticeText)}</p></section>` : ""}
            </div></section>
            <section class="info-group"><h3>Vertragsbedingungen</h3><div class="info-grid">
              ${cancellationText ? `<section class="info-card"><h3 class="section-title">Stornierungsbedingungen</h3><p>${escapeHtml(cancellationText)}</p></section>` : ""}
              ${reservationText ? `<section class="info-card"><h3 class="section-title">Reservierung / Bestätigung</h3><p>${escapeHtml(reservationText)}</p></section>` : ""}
            </div></section>
          </div>
          <section class="signature-card offer-acceptance">
            <h3 class="section-title">Angebot annehmen</h3>
            <p class="muted" style="font-size:9px;">Mit der Unterschrift bestätigen wir die Annahme dieses Angebots und die verbindliche Buchung.</p>
            <div class="signature-grid">
              <div class="signature-line">Ort</div>
              <div class="signature-line">Datum</div>
              <div class="signature-line">Firmenstempel</div>
              <div class="signature-line">Unterschrift</div>
            </div>
          </section>
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

function invoiceMoneyNumber(value) {
  const raw = String(value == null ? "" : value).trim();
  if (!raw) return 0;
  const compact = raw.replace(/\s+/g, "").replace(/[^\d,.-]/g, "");
  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  let normalized = compact;
  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      normalized = compact.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = compact.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    normalized = compact.replace(",", ".");
  } else if ((compact.match(/\./g) || []).length > 1) {
    const parts = compact.split(".");
    const fraction = parts.pop();
    normalized = `${parts.join("")}.${fraction}`;
  }
  const number = Number(normalized);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function invoiceTaxRateNumber(value) {
  const rate = invoiceMoneyNumber(value);
  if (rate <= 0) return 0;
  if (Math.abs(rate - 7) < 0.01) return 7;
  if (Math.abs(rate - 19) < 0.01) return 19;
  return Math.max(0, Math.min(100, rate));
}

function invoiceSafeDate(value, fallback = "") {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : fallback;
}

function invoiceAddDays(dateKey, days) {
  const base = invoiceSafeDate(dateKey, todayKey());
  const date = new Date(`${base}T12:00:00`);
  date.setDate(date.getDate() + Number(days || 0));
  return localDateValue(date);
}

function normalizeInvoicePositionClient(item = {}) {
  return {
    id: String(item.id || cryptoId()).trim(),
    articleNumber: String(item.articleNumber || item.articleNo || "").trim(),
    description: String(item.description || item.label || item.name || "").trim(),
    quantity: Math.max(0, invoiceMoneyNumber(item.quantity || 1)),
    unit: String(item.unit || "Stück").trim() || "Stück",
    unitPrice: Math.max(0, invoiceMoneyNumber(item.unitPrice || item.price || item.amount || 0)),
    taxRate: invoiceTaxRateNumber(item.taxRate)
  };
}

function normalizeInvoiceAttachmentClient(item = {}) {
  return {
    id: String(item.id || cryptoId()).trim(),
    label: String(item.label || "Anlage").trim() || "Anlage",
    name: String(item.name || item.filename || "").trim(),
    data: String(item.data || item.dataUrl || "").trim(),
    path: String(item.path || item.objectPath || "").trim(),
    url: String(item.url || "").trim(),
    mime: String(item.mime || "").trim()
  };
}

function normalizeInvoiceRecordClient(invoice = {}, settings = state.invoiceSettings || createDefaultInvoiceSettingsClient()) {
  const normalizedSettings = normalizeInvoiceSettingsClient(settings);
  const invoiceDate = invoiceSafeDate(invoice.invoiceDate, todayKey());
  return {
    id: String(invoice.id || cryptoId()).trim(),
    type: ["invoice", "correction", "storno"].includes(String(invoice.type || "").trim()) ? String(invoice.type).trim() : "invoice",
    sourceType: normalizeInvoiceSourceTypeClient(invoice),
    sourceDate: invoiceSafeDate(invoice.sourceDate),
    sourceCustomerId: String(invoice.sourceCustomerId || "").trim(),
    sourceCustomerStatus: String(invoice.sourceCustomerStatus || "").trim(),
    customerName: String(invoice.customerName || invoice.name || "").trim(),
    customerContact: String(invoice.customerContact || invoice.contact || "").trim(),
    customerEmail: String(invoice.customerEmail || invoice.email || "").trim(),
    customerPhone: String(invoice.customerPhone || invoice.phone || "").trim(),
    customerAddress: String(invoice.customerAddress || invoice.address || "").trim(),
    invoiceDate,
    serviceDate: invoiceSafeDate(invoice.serviceDate, invoiceDate),
    dueDate: invoiceSafeDate(invoice.dueDate, invoiceAddDays(invoiceDate, normalizedSettings.paymentDays)),
    paymentMethod: String(invoice.paymentMethod || "").trim(),
    paymentStatus: ["open", "paid", "cash-paid"].includes(String(invoice.paymentStatus || "").trim()) ? String(invoice.paymentStatus).trim() : "open",
    headline: String(invoice.headline || "Rechnung").trim() || "Rechnung",
    introText: String(invoice.introText || normalizedSettings.defaultText).trim() || normalizedSettings.defaultText,
    note: String(invoice.note || "").trim(),
    internalNote: String(invoice.internalNote || "").trim(),
    positions: (Array.isArray(invoice.positions) ? invoice.positions : []).map(normalizeInvoicePositionClient).filter((item) => item.description || item.unitPrice || item.quantity),
    attachments: (Array.isArray(invoice.attachments) ? invoice.attachments : []).map(normalizeInvoiceAttachmentClient).filter((item) => item.name || item.data || item.path || item.url),
    status: ["draft", "finalized", "sent", "archived"].includes(String(invoice.status || "").trim()) ? String(invoice.status).trim() : "draft",
    invoiceNumber: String(invoice.invoiceNumber || "").trim(),
    pdfData: String(invoice.pdfData || "").trim(),
    pdfFileName: String(invoice.pdfFileName || "").trim(),
    createdAt: String(invoice.createdAt || new Date().toISOString()).trim(),
    updatedAt: String(invoice.updatedAt || invoice.createdAt || new Date().toISOString()).trim(),
    finalizedAt: String(invoice.finalizedAt || "").trim(),
    sentAt: String(invoice.sentAt || "").trim(),
    archivedAt: String(invoice.archivedAt || "").trim(),
    emailMessageId: String(invoice.emailMessageId || "").trim(),
    auditLog: Array.isArray(invoice.auditLog) ? invoice.auditLog : []
  };
}

function normalizeInvoicesClient(invoices = [], settings = state.invoiceSettings || createDefaultInvoiceSettingsClient()) {
  return (Array.isArray(invoices) ? invoices : [])
    .map((invoice) => normalizeInvoiceRecordClient(invoice, settings))
    .sort((a, b) => {
      const rank = { draft: 0, finalized: 1, sent: 2, archived: 3 };
      const statusDiff = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
      if (statusDiff) return statusDiff;
      return (Date.parse(b.updatedAt || "") || 0) - (Date.parse(a.updatedAt || "") || 0);
    });
}

function createBlankInvoiceDraftClient(settings = state.invoiceSettings || createDefaultInvoiceSettingsClient()) {
  const normalizedSettings = normalizeInvoiceSettingsClient(settings);
  const today = todayKey();
  return normalizeInvoiceRecordClient({
    sourceType: "manual",
    headline: "Rechnung",
    introText: normalizedSettings.defaultText,
    invoiceDate: today,
    serviceDate: today,
    dueDate: invoiceAddDays(today, normalizedSettings.paymentDays),
    paymentMethod: "Überweisung",
    paymentStatus: "open",
    positions: [],
    attachments: [],
    status: "draft",
    auditLog: []
  }, normalizedSettings);
}

function normalizeInvoiceSourceTypeClient(invoice = {}) {
  const explicit = String(invoice.sourceType || "").trim();
  if (["event", "advertising", "manual"].includes(explicit)) return explicit;
  if (invoice.sourceDate || invoice.sourceCustomerId) return "event";
  return "manual";
}

function invoicePositionGrossClient(position = {}) {
  return Math.max(0, invoiceMoneyNumber(position.quantity || 0) * invoiceMoneyNumber(position.unitPrice || 0));
}

function invoicePositionNetClient(position = {}) {
  const gross = invoicePositionGrossClient(position);
  const rate = invoiceTaxRateNumber(position.taxRate);
  if (!rate) return gross;
  return Math.round((gross / (1 + rate / 100)) * 100) / 100;
}

function invoicePositionTaxClient(position = {}) {
  return Math.round((invoicePositionGrossClient(position) - invoicePositionNetClient(position)) * 100) / 100;
}

function invoiceTotalsClient(invoice = {}) {
  const groups = new Map();
  let grossTotal = 0;
  let netTotal = 0;
  let taxTotal = 0;
  (invoice.positions || []).forEach((position) => {
    const gross = invoicePositionGrossClient(position);
    const net = invoicePositionNetClient(position);
    const tax = invoicePositionTaxClient(position);
    const rate = invoiceTaxRateNumber(position.taxRate);
    grossTotal += gross;
    netTotal += net;
    taxTotal += tax;
    const group = groups.get(rate) || { rate, gross: 0, net: 0, tax: 0 };
    group.gross += gross;
    group.net += net;
    group.tax += tax;
    groups.set(rate, group);
  });
  return {
    grossTotal: Math.round(grossTotal * 100) / 100,
    netTotal: Math.round(netTotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    groups: [...groups.values()]
      .map((group) => ({
        rate: group.rate,
        gross: Math.round(group.gross * 100) / 100,
        net: Math.round(group.net * 100) / 100,
        tax: Math.round(group.tax * 100) / 100
      }))
      .sort((a, b) => b.rate - a.rate)
  };
}

function invoiceStatusLabelClient(status = "draft") {
  if (status === "finalized") return "Finalisiert";
  if (status === "sent") return "Versendet";
  if (status === "archived") return "Archiviert";
  return "Entwurf";
}

function invoiceTypeLabelClient(type = "invoice") {
  if (type === "correction") return "Korrekturrechnung";
  if (type === "storno") return "Stornorechnung";
  return "Rechnung";
}

function invoiceSourceTypeLabelClient(sourceType = "manual") {
  if (sourceType === "event") return "Veranstaltung";
  if (sourceType === "advertising") return "Werbekunde";
  return "Manuell";
}

function invoicePaymentStatusLabelClient(value = "open") {
  if (value === "paid") return "Bezahlt";
  if (value === "cash-paid") return "Bereits über Kasse bezahlt";
  return "Offen";
}

function invoiceStatusClassClient(status = "draft") {
  if (status === "sent") return "is-sent";
  if (status === "finalized") return "is-finalized";
  if (status === "archived") return "is-archived";
  return "is-draft";
}

function invoiceMatchesSourceTypeClient(invoice = {}, sourceType = "event") {
  return normalizeInvoiceSourceTypeClient(invoice) === sourceType;
}

function customerDirectoryMatchesSourceTypeClient(customer = {}, sourceType = "event") {
  const current = ["event", "advertising", "manual"].includes(String(customer.sourceType || "").trim())
    ? String(customer.sourceType || "").trim()
    : "event";
  if (sourceType === "non-advertising") return current !== "advertising";
  return current === sourceType;
}

function invoiceSearchMatches(invoice = {}, query = "") {
  const text = String(query || "").trim().toLowerCase();
  if (!text) return true;
  const totals = invoiceTotalsClient(invoice);
  const blob = [
    invoice.customerName,
    invoice.customerContact,
    invoice.customerEmail,
    invoice.customerAddress,
    invoice.invoiceNumber,
    invoice.invoiceDate,
    invoice.serviceDate,
    invoiceTypeLabelClient(invoice.type),
    invoiceStatusLabelClient(invoice.status),
    formatMoney(totals.grossTotal)
  ].join(" ").toLowerCase();
  return text.split(/\s+/).every((token) => blob.includes(token));
}

function ensureInvoiceDraft() {
  const settings = normalizeInvoiceSettingsClient(state.invoiceSettings || createDefaultInvoiceSettingsClient());
  const invoices = normalizeInvoicesClient(state.invoices || [], settings);
  const existingId = String(state.invoiceEditorDraft?.id || state.invoiceEditorId || "").trim();
  const selected = existingId ? invoices.find((invoice) => invoice.id === existingId) : null;
  if (selected) {
    state.invoiceEditorDraft = normalizeInvoiceRecordClient(cloneData(selected), settings);
    state.invoiceEditorId = state.invoiceEditorDraft.id;
    return state.invoiceEditorDraft;
  }
  const draft = state.invoiceEditorDraft
    ? normalizeInvoiceRecordClient(cloneData(state.invoiceEditorDraft), settings)
    : (invoices[0] ? normalizeInvoiceRecordClient(cloneData(invoices[0]), settings) : createBlankInvoiceDraftClient(settings));
  state.invoiceEditorDraft = draft;
  state.invoiceEditorId = draft.id;
  return draft;
}

function setInvoiceDraftFromInvoice(invoice) {
  const draft = normalizeInvoiceRecordClient(cloneData(invoice || createBlankInvoiceDraftClient(state.invoiceSettings)), state.invoiceSettings || createDefaultInvoiceSettingsClient());
  state.invoiceEditorDraft = draft;
  state.invoiceEditorId = draft.id;
  state.invoiceEditorDirty = false;
}

function currentInvoiceDraftFromDom() {
  const root = $("#adminInvoices");
  const base = normalizeInvoiceRecordClient(cloneData(state.invoiceEditorDraft || createBlankInvoiceDraftClient(state.invoiceSettings)), state.invoiceSettings || createDefaultInvoiceSettingsClient());
  if (!root) return base;
  const field = (name) => root.querySelector(`[data-invoice-field="${cssEscape(name)}"]`);
  const text = (name) => String(field(name)?.value || "").trim();
  base.customerName = text("customerName");
  base.customerContact = text("customerContact");
  base.customerEmail = text("customerEmail");
  base.customerPhone = text("customerPhone");
  base.customerAddress = text("customerAddress");
  base.invoiceDate = invoiceSafeDate(text("invoiceDate"), base.invoiceDate || todayKey());
  base.serviceDate = invoiceSafeDate(text("serviceDate"), base.serviceDate || base.invoiceDate);
  base.dueDate = invoiceSafeDate(text("dueDate"), base.dueDate || invoiceAddDays(base.invoiceDate, state.invoiceSettings?.paymentDays || 14));
  base.paymentMethod = text("paymentMethod");
  base.paymentStatus = text("paymentStatus") || "open";
  base.headline = text("headline") || "Rechnung";
  base.introText = String(field("introText")?.value || "").trim();
  base.note = String(field("note")?.value || "").trim();
  base.internalNote = String(field("internalNote")?.value || "").trim();
  base.positions = [...root.querySelectorAll("[data-invoice-position-row]")].map((row) => normalizeInvoicePositionClient({
    id: row.dataset.invoicePositionId || cryptoId(),
    articleNumber: row.querySelector('[data-invoice-position-field="articleNumber"]')?.value,
    description: row.querySelector('[data-invoice-position-field="description"]')?.value,
    quantity: row.querySelector('[data-invoice-position-field="quantity"]')?.value,
    unit: row.querySelector('[data-invoice-position-field="unit"]')?.value,
    unitPrice: row.querySelector('[data-invoice-position-field="unitPrice"]')?.value,
    taxRate: row.querySelector('[data-invoice-position-field="taxRate"]')?.value
  })).filter((item) => item.description || item.unitPrice || item.quantity);
  const attachmentMap = Object.fromEntries((base.attachments || []).map((item) => [item.id, item]));
  base.attachments = [...root.querySelectorAll("[data-invoice-attachment-row]")].map((row) => {
    const id = row.dataset.invoiceAttachmentId || cryptoId();
    return normalizeInvoiceAttachmentClient({
      ...(attachmentMap[id] || {}),
      id,
      label: row.querySelector('[data-invoice-attachment-field="label"]')?.value || attachmentMap[id]?.label || "Anlage"
    });
  }).filter((item) => item.name || item.data || item.path || item.url);
  return normalizeInvoiceRecordClient(base, state.invoiceSettings || createDefaultInvoiceSettingsClient());
}

function refreshInvoicePreviewOnly() {
  const preview = $("#invoicePreviewPanel");
  if (!preview) return;
  state.invoiceEditorDraft = currentInvoiceDraftFromDom();
  state.invoiceEditorId = state.invoiceEditorDraft.id;
  preview.innerHTML = invoicePreviewHtml(state.invoiceEditorDraft, state.invoiceSettings || createDefaultInvoiceSettingsClient());
  const dirtyHint = $("#invoiceEditorDirtyHint");
  if (dirtyHint) dirtyHint.textContent = state.invoiceEditorDirty ? "Ungespeicherte Änderungen." : "";
}

function invoiceReadySources() {
  const invoices = normalizeInvoicesClient(state.invoices || [], state.invoiceSettings || createDefaultInvoiceSettingsClient());
  return Object.entries(state.dayReports || {}).flatMap(([dateKey, report]) =>
    (report?.invoiceCustomers || [])
      .map((customer, index) => {
        const sourceCustomerId = String(customer.id || index);
        const existing = invoices.find((invoice) => invoice.sourceDate === dateKey && invoice.sourceCustomerId === sourceCustomerId && invoice.status !== "archived");
        return {
          dateKey,
          sourceCustomerId,
          customer,
          existing,
          total: invoiceTotal(customer)
        };
      })
      .filter((entry) => invoiceIsReady(entry.customer))
  ).sort((a, b) => String(b.dateKey).localeCompare(String(a.dateKey)));
}

function invoiceAttachmentHref(item = {}) {
  if (item.url) return item.url;
  if (item.path) return `/api/receipt?path=${encodeURIComponent(item.path)}&name=${encodeURIComponent(item.name || "anlage")}`;
  return item.data || "";
}

function renderInvoicePositionEditorRow(position = {}, readonly = false) {
  return `
    <div class="invoice-edit-row" data-invoice-position-row data-invoice-position-id="${escapeHtml(position.id)}">
      <input data-invoice-position-field="articleNumber" value="${escapeHtml(position.articleNumber)}" placeholder="Art.-Nr." ${readonly ? "disabled" : ""}>
      <input data-invoice-position-field="description" value="${escapeHtml(position.description)}" placeholder="Bezeichnung" ${readonly ? "disabled" : ""}>
      <input data-invoice-position-field="quantity" type="number" min="0" step="0.01" value="${escapeHtml(String(position.quantity || 0))}" placeholder="Menge" ${readonly ? "disabled" : ""}>
      <input data-invoice-position-field="unit" value="${escapeHtml(position.unit || "Stück")}" placeholder="Einheit" ${readonly ? "disabled" : ""}>
      <input data-invoice-position-field="unitPrice" type="number" min="0" step="0.01" value="${escapeHtml(String(position.unitPrice || 0))}" placeholder="Einzelpreis" ${readonly ? "disabled" : ""}>
      <select data-invoice-position-field="taxRate" ${readonly ? "disabled" : ""}>
        <option value="0" ${Number(position.taxRate || 0) === 0 ? "selected" : ""}>steuerfrei</option>
        <option value="7" ${Number(position.taxRate || 0) === 7 ? "selected" : ""}>7 %</option>
        <option value="19" ${Number(position.taxRate || 0) === 19 ? "selected" : ""}>19 %</option>
      </select>
      <div class="row-actions">
        ${readonly ? "" : `<button class="secondary" type="button" data-invoice-move-position="up">↑</button>
        <button class="secondary" type="button" data-invoice-move-position="down">↓</button>
        <button class="secondary danger-lite" type="button" data-invoice-remove-position>Entfernen</button>`}
      </div>
    </div>
  `;
}

function renderInvoiceAttachmentEditorRow(attachment = {}, readonly = false) {
  const href = invoiceAttachmentHref(attachment);
  return `
    <div class="invoice-attachment-row" data-invoice-attachment-row data-invoice-attachment-id="${escapeHtml(attachment.id)}">
      <input data-invoice-attachment-field="label" value="${escapeHtml(attachment.label || "Anlage")}" placeholder="Bezeichnung" ${readonly ? "disabled" : ""}>
      <div class="invoice-attachment-meta">
        <strong>${escapeHtml(attachment.name || "Anlage")}</strong>
        <small>${escapeHtml(attachment.mime || "Datei")}</small>
      </div>
      <div class="row-actions">
        ${href ? `<a class="secondary" href="${escapeHtml(href)}" target="_blank" rel="noopener">Öffnen</a>` : ""}
        ${readonly ? "" : `<button class="secondary danger-lite" type="button" data-invoice-remove-attachment>Entfernen</button>`}
      </div>
    </div>
  `;
}

function invoicePreviewHtml(invoice = {}, settings = createDefaultInvoiceSettingsClient()) {
  const normalizedSettings = normalizeInvoiceSettingsClient(settings);
  const draft = normalizeInvoiceRecordClient(invoice, normalizedSettings);
  const totals = invoiceTotalsClient(draft);
  const senderLine = `${normalizedSettings.companyName} · ${normalizedSettings.companyAddress.replace(/\n/g, " · ")}`;
  const rows = draft.positions.length
    ? draft.positions.map((position, index) => `
      <div class="invoice-preview-table-row">
        <span>${index + 1}</span>
        <span>${escapeHtml(position.articleNumber || "-")}</span>
        <span>${escapeHtml(position.description || "-")}</span>
        <span>${escapeHtml(String(position.quantity || 0))}</span>
        <span>${escapeHtml(position.unit || "-")}</span>
        <span>${escapeHtml(formatMoney(position.unitPrice || 0))}</span>
        <strong>${escapeHtml(formatMoney(invoicePositionGrossClient(position)))}</strong>
      </div>
    `).join("")
    : `<div class="invoice-preview-empty">Noch keine Positionen eingetragen.</div>`;
  const taxRows = totals.groups.filter((group) => group.rate > 0).map((group) => `
    <div class="invoice-preview-sum-row">
      <span>${String(group.rate).replace(".", ",")} % USt. auf EUR ${group.net.toFixed(2).replace(".", ",")}</span>
      <strong>${group.tax.toFixed(2).replace(".", ",")} Euro</strong>
    </div>
  `).join("");
  return `
    <div class="invoice-preview-sheet" style="--invoice-primary:${escapeHtml(normalizedSettings.colors.primary)};--invoice-accent:${escapeHtml(normalizedSettings.colors.accent)};--invoice-muted:${escapeHtml(normalizedSettings.colors.muted)};--invoice-line:${escapeHtml(normalizedSettings.colors.line)};--invoice-highlight:${escapeHtml(normalizedSettings.colors.highlight)};">
      <div class="invoice-preview-head">
        <div class="invoice-preview-brand">
          <img src="${escapeHtml(normalizedSettings.logoData || "la-bowling-print-logo.png")}" alt="LA Bowling">
          <span>${escapeHtml(senderLine)}</span>
        </div>
        <div class="invoice-preview-meta">
          <div><small>Belegnummer</small><strong>${escapeHtml(draft.invoiceNumber || "wird bei Finalisierung vergeben")}</strong></div>
          <div><small>Belegdatum</small><strong>${escapeHtml(draft.invoiceDate ? formatNumericDate(draft.invoiceDate) : "-")}</strong></div>
          <div><small>Leistungsdatum</small><strong>${escapeHtml(draft.serviceDate ? formatNumericDate(draft.serviceDate) : "-")}</strong></div>
          <div><small>Seite</small><strong>1 von 1</strong></div>
        </div>
      </div>
      <div class="invoice-preview-customer">
        <strong>${escapeHtml(draft.customerName || "Kunde / Firma")}</strong>
        <div>${escapeHtml(draft.customerAddress || "Kundenadresse").replace(/\n/g, "<br>")}</div>
      </div>
      <div class="invoice-preview-title-block">
        <h3>${escapeHtml(draft.headline || "Rechnung")}</h3>
        <p>${escapeHtml(draft.introText || normalizedSettings.defaultText)}</p>
        <div class="invoice-preview-taxline">
          <span>Steuernummer <strong>${escapeHtml(normalizedSettings.taxNumber || "-")}</strong></span>
          <span>USt-ID <strong>${escapeHtml(normalizedSettings.vatId || "-")}</strong></span>
        </div>
      </div>
      <div class="invoice-preview-table">
        <div class="invoice-preview-table-head">
          <span>Pos</span>
          <span>Art.-Nr.</span>
          <span>Bezeichnung</span>
          <span>Menge</span>
          <span>Einheit</span>
          <span>Einzelpreis</span>
          <span>Betrag EUR</span>
        </div>
        ${rows}
      </div>
      <div class="invoice-preview-bottom">
        <div class="invoice-preview-footer-copy">
          <div><small>Zahlungsziel</small><strong>${escapeHtml(draft.dueDate ? formatNumericDate(draft.dueDate) : "-")}</strong></div>
          <div><small>Zahlungsstatus</small><strong>${escapeHtml(invoicePaymentStatusLabelClient(draft.paymentStatus))}</strong></div>
          <div><small>Zahlungsart</small><strong>${escapeHtml(draft.paymentMethod || "-")}</strong></div>
          <div><small>Bank</small><strong>${escapeHtml(normalizedSettings.bankName || "-")}</strong></div>
          <div><small>IBAN</small><strong>${escapeHtml(normalizedSettings.iban || "-")}</strong></div>
          <div><small>BIC</small><strong>${escapeHtml(normalizedSettings.bic || "-")}</strong></div>
          ${draft.note ? `<div class="invoice-preview-note"><small>Hinweis</small><strong>${escapeHtml(draft.note)}</strong></div>` : ""}
          <p>Beiliegende Einzelbelege sind Bestandteil dieser Rechnung.</p>
        </div>
        <div class="invoice-preview-sums">
          <div class="invoice-preview-sum-row">
            <span>Summe</span>
            <strong>${escapeHtml(formatMoney(totals.grossTotal))}</strong>
          </div>
          ${taxRows}
          <div class="invoice-preview-sum-row">
            <span>Nettogesamtbetrag</span>
            <strong>${escapeHtml(formatMoney(totals.netTotal))}</strong>
          </div>
          <div class="invoice-preview-endtotal">
            <span>Endbetrag</span>
            <strong>${escapeHtml(formatMoney(totals.grossTotal))}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderInvoiceListSection(title, items, activeId) {
  if (!items.length) return "";
  return `
    <section class="invoice-list-section">
      <div class="invoice-list-section-head">
        <strong>${escapeHtml(title)}</strong>
        <span>${items.length}</span>
      </div>
      <div class="invoice-list-items">
        ${items.map((invoice) => renderInvoiceListItem(invoice, activeId)).join("")}
      </div>
    </section>
  `;
}

function renderInvoiceListItem(invoice, activeId) {
  const totals = invoiceTotalsClient(invoice);
  return `
    <button class="invoice-list-item ${invoice.id === activeId ? "active" : ""}" type="button" data-select-invoice="${escapeHtml(invoice.id)}">
      <div class="invoice-list-item-head">
        <strong>${escapeHtml(invoice.customerName || "Rechnung")}</strong>
        <span class="invoice-status-chip ${invoiceStatusClassClient(invoice.status)}">${escapeHtml(invoiceStatusLabelClient(invoice.status))}</span>
      </div>
      <span>${escapeHtml(invoice.invoiceNumber || invoiceTypeLabelClient(invoice.type))}</span>
      <small>${escapeHtml(invoice.invoiceDate ? formatNumericDate(invoice.invoiceDate) : "-")} · ${escapeHtml(formatMoney(totals.grossTotal))}</small>
    </button>
  `;
}

function renderInvoiceReadySourceItem(entry = {}) {
  const existing = entry.existing;
  return `
    <article class="invoice-source-item">
      <div>
        <strong>${escapeHtml(entry.customer?.name || "Kunde")}</strong>
        <span>${escapeHtml(formatDate(entry.dateKey))}</span>
        <small>${escapeHtml(formatMoney(entry.total || 0))}${existing ? ` · ${escapeHtml(invoiceStatusLabelClient(existing.status))}` : ""}</small>
      </div>
      <button class="secondary" type="button" data-invoice-import-ready="${escapeHtml(entry.dateKey)}|${escapeHtml(entry.sourceCustomerId)}">${existing ? "Öffnen" : "Übernehmen"}</button>
    </article>
  `;
}

function renderInvoiceAdminViewNav(currentView, counts = {}) {
  const items = [
    { key: "overview", label: "Zentrale" },
    { key: "events", label: "Veranstaltungen" },
    { key: "advertising", label: "Werbekunden" },
    { key: "directory", label: "Kundenstamm" },
    { key: "editor", label: "Rechnungen" }
  ];
  return `
    <div class="invoice-admin-nav" role="tablist" aria-label="Rechnungsbereiche">
      ${items.map((item) => `
        <button
          class="invoice-admin-nav-button ${currentView === item.key ? "active" : ""}"
          type="button"
          data-invoice-view="${item.key}"
          role="tab"
          aria-selected="${currentView === item.key ? "true" : "false"}"
        >
          <span>${escapeHtml(item.label)}</span>
          <small>${escapeHtml(String(counts[item.key] || 0))}</small>
        </button>
      `).join("")}
    </div>
  `;
}

function renderInvoiceOverviewCard(viewKey, title, body, count, buttonLabel = "Öffnen") {
  return `
    <article class="invoice-overview-card">
      <div class="invoice-overview-card-head">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(String(count || 0))}</span>
      </div>
      <p>${escapeHtml(body)}</p>
      <button class="secondary" type="button" data-invoice-view="${escapeHtml(viewKey)}">${escapeHtml(buttonLabel)}</button>
    </article>
  `;
}

function renderInvoiceDirectoryEntry(customer = {}) {
  const metaParts = [customer.contact, customer.email || customer.phone].filter(Boolean);
  return `
    <article class="invoice-source-item invoice-directory-entry">
      <div>
        <strong>${escapeHtml(customer.name || "Kunde")}</strong>
        <span>${escapeHtml(invoiceSourceTypeLabelClient(customer.sourceType || "event"))}</span>
        <small>${escapeHtml(metaParts.join(" · ") || customer.address || "Noch keine Zusatzdaten")}</small>
      </div>
      <button
        class="secondary"
        type="button"
        data-invoice-import-customer
        data-invoice-customer-id="${escapeHtml(customer.id || "")}"
        data-invoice-source-type="${escapeHtml(customer.sourceType || "event")}"
      >
        Übernehmen
      </button>
    </article>
  `;
}

function renderInvoiceAuditLog(invoice = {}) {
  const log = Array.isArray(invoice.auditLog) ? invoice.auditLog : [];
  if (!log.length) return `<p class="hint">Noch keine Einträge im Audit-Log.</p>`;
  return `
    <div class="invoice-audit-list">
      ${log.slice().reverse().map((entry) => `
        <article class="invoice-audit-item">
          <strong>${escapeHtml(entry.action || "Aktion")}</strong>
          <span>${escapeHtml(formatDateTime(entry.at || ""))}${entry.actor ? ` · ${escapeHtml(entry.actor)}` : ""}</span>
          ${entry.note ? `<p>${escapeHtml(entry.note)}</p>` : ""}
        </article>
      `).join("")}
    </div>
  `;
}

function renderInvoiceEditorShell(draft, totals, readonly) {
  return `
    <section class="invoice-editor-shell">
      <div class="invoice-editor-head">
        <div>
          <h3>${escapeHtml(draft.customerName || invoiceTypeLabelClient(draft.type))}</h3>
          <p>${escapeHtml(invoiceTypeLabelClient(draft.type))} · ${escapeHtml(invoiceSourceTypeLabelClient(draft.sourceType))} · ${escapeHtml(invoiceStatusLabelClient(draft.status))}${draft.invoiceNumber ? ` · ${escapeHtml(draft.invoiceNumber)}` : ""}</p>
        </div>
        <div class="invoice-head-badges">
          <span class="invoice-badge">${escapeHtml(draft.invoiceDate ? formatNumericDate(draft.invoiceDate) : "Belegdatum offen")}</span>
          <span class="invoice-badge">${escapeHtml(draft.serviceDate ? formatNumericDate(draft.serviceDate) : "Leistungsdatum offen")}</span>
          <span class="invoice-badge">${escapeHtml(formatMoney(totals.grossTotal))}</span>
        </div>
      </div>
      <p id="invoiceEditorDirtyHint" class="action-status">${state.invoiceEditorDirty ? "Ungespeicherte Änderungen." : ""}</p>
      <div class="invoice-editor-grid">
        <div class="invoice-editor-form">
          <section class="invoice-editor-section">
            <div class="invoice-section-head">
              <strong>Kundendaten</strong>
              <span>Entwurf bleibt bearbeitbar bis zur Finalisierung.</span>
            </div>
            <div class="invoice-grid invoice-grid-two">
              <label>Kunde / Firma<input data-invoice-field="customerName" value="${escapeHtml(draft.customerName)}" placeholder="Firma oder Name" ${readonly ? "disabled" : ""}></label>
              <label>Ansprechpartner<input data-invoice-field="customerContact" value="${escapeHtml(draft.customerContact)}" placeholder="Ansprechpartner" ${readonly ? "disabled" : ""}></label>
              <label>Rechnungs-E-Mail<input data-invoice-field="customerEmail" type="email" value="${escapeHtml(draft.customerEmail)}" placeholder="kunde@example.com" ${readonly ? "disabled" : ""}></label>
              <label>Telefon<input data-invoice-field="customerPhone" value="${escapeHtml(draft.customerPhone)}" placeholder="Telefonnummer" ${readonly ? "disabled" : ""}></label>
              <label class="invoice-grid-wide">Kundenadresse<textarea data-invoice-field="customerAddress" rows="4" placeholder="Adresse" ${readonly ? "disabled" : ""}>${escapeHtml(draft.customerAddress)}</textarea></label>
            </div>
          </section>

          <section class="invoice-editor-section">
            <div class="invoice-section-head">
              <strong>Rechnungsdaten</strong>
              <span>Fortlaufende Nummern werden erst bei Finalisierung fest vergeben.</span>
            </div>
            <div class="invoice-grid">
              <label>Typ
                <input value="${escapeHtml(invoiceTypeLabelClient(draft.type))}" disabled>
              </label>
              <label>Quelle
                <input value="${escapeHtml(invoiceSourceTypeLabelClient(draft.sourceType))}" disabled>
              </label>
              <label>Belegdatum<input data-invoice-field="invoiceDate" type="date" value="${escapeHtml(draft.invoiceDate)}" ${readonly ? "disabled" : ""}></label>
              <label>Leistungsdatum<input data-invoice-field="serviceDate" type="date" value="${escapeHtml(draft.serviceDate)}" ${readonly ? "disabled" : ""}></label>
              <label>Zahlungsziel<input data-invoice-field="dueDate" type="date" value="${escapeHtml(draft.dueDate)}" ${readonly ? "disabled" : ""}></label>
              <label>Zahlungsart
                <select data-invoice-field="paymentMethod" ${readonly ? "disabled" : ""}>
                  <option value="" ${!draft.paymentMethod ? "selected" : ""}>Bitte wählen</option>
                  <option value="Überweisung" ${draft.paymentMethod === "Überweisung" ? "selected" : ""}>Überweisung</option>
                  <option value="Bar" ${draft.paymentMethod === "Bar" ? "selected" : ""}>Bar</option>
                  <option value="EC" ${draft.paymentMethod === "EC" ? "selected" : ""}>EC</option>
                </select>
              </label>
              <label>Zahlungsstatus
                <select data-invoice-field="paymentStatus" ${readonly ? "disabled" : ""}>
                  <option value="open" ${draft.paymentStatus === "open" ? "selected" : ""}>offen</option>
                  <option value="paid" ${draft.paymentStatus === "paid" ? "selected" : ""}>bezahlt</option>
                  <option value="cash-paid" ${draft.paymentStatus === "cash-paid" ? "selected" : ""}>bereits über Kasse bezahlt</option>
                </select>
              </label>
              <label class="invoice-grid-wide">Überschrift<input data-invoice-field="headline" value="${escapeHtml(draft.headline)}" placeholder="Rechnung" ${readonly ? "disabled" : ""}></label>
              <label class="invoice-grid-wide">Einleitung<textarea data-invoice-field="introText" rows="3" placeholder="Rechnung zu beiliegenden Einzelbelegen" ${readonly ? "disabled" : ""}>${escapeHtml(draft.introText)}</textarea></label>
            </div>
          </section>

          <section class="invoice-editor-section">
            <div class="invoice-section-head">
              <strong>Positionen</strong>
              <span>Steuersatz je Position separat pflegen.</span>
            </div>
            <div class="invoice-row-list">
              ${(draft.positions || []).length ? draft.positions.map((position) => renderInvoicePositionEditorRow(position, readonly)).join("") : `<p class="hint">Noch keine Positionen angelegt.</p>`}
            </div>
            ${readonly ? "" : `<div class="day-report-actions"><button class="secondary" type="button" data-invoice-add-position>+ Position hinzufügen</button></div>`}
          </section>

          <section class="invoice-editor-section">
            <div class="invoice-section-head">
              <strong>Anlagen / Belege</strong>
              <span>PDFs und Scans bleiben dauerhaft an der Rechnung hängen.</span>
            </div>
            <div class="invoice-row-list">
              ${(draft.attachments || []).length ? draft.attachments.map((attachment) => renderInvoiceAttachmentEditorRow(attachment, readonly)).join("") : `<p class="hint">Noch keine Anlagen hochgeladen.</p>`}
            </div>
            ${readonly ? "" : `<label class="invoice-upload-field">Anlagen hochladen<input data-invoice-file type="file" accept="image/*,application/pdf" multiple capture="environment"></label>`}
          </section>

          <section class="invoice-editor-section">
            <div class="invoice-section-head">
              <strong>Hinweise</strong>
              <span>Hinweis wird im PDF angezeigt, interne Notiz nur im Backoffice.</span>
            </div>
            <div class="invoice-grid invoice-grid-two">
              <label class="invoice-grid-wide">Hinweis für Rechnung<textarea data-invoice-field="note" rows="3" placeholder="Optionaler Hinweis" ${readonly ? "disabled" : ""}>${escapeHtml(draft.note)}</textarea></label>
              <label class="invoice-grid-wide">Interne Notiz<textarea data-invoice-field="internalNote" rows="3" placeholder="Nur intern sichtbar" ${readonly ? "disabled" : ""}>${escapeHtml(draft.internalNote)}</textarea></label>
            </div>
          </section>

          <section class="invoice-editor-section">
            <div class="invoice-section-head">
              <strong>Audit-Log</strong>
              <span>Nach Finalisierung nur noch Storno oder Korrekturrechnung.</span>
            </div>
            ${renderInvoiceAuditLog(draft)}
            ${draft.status === "draft" ? "" : `<div class="day-report-actions">
              <button class="secondary" type="button" data-invoice-create-correction>Korrekturrechnung anlegen</button>
              <button class="secondary" type="button" data-invoice-create-storno>Stornorechnung anlegen</button>
            </div>`}
          </section>
        </div>
        <aside class="invoice-preview-stack">
          <div class="invoice-preview-actions">
            ${draft.pdfData ? `<a class="secondary" href="${escapeHtml(draft.pdfData)}" download="${escapeHtml(draft.pdfFileName || "rechnung.pdf")}">Aktuelle PDF herunterladen</a>` : `<span class="hint">Noch keine PDF gespeichert.</span>`}
          </div>
          <div id="invoicePreviewPanel" class="invoice-preview-panel">
            ${invoicePreviewHtml(draft, state.invoiceSettings)}
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderAdminInvoices() {
  const container = $("#adminInvoices");
  if (!container) return;
  if (!NEW_INVOICE_PROGRAM_ENABLED) {
    container.innerHTML = "";
    return;
  }
  if (!state.invoiceSkipDomSync && state.invoiceEditorDirty && container.querySelector("[data-invoice-field]")) {
    state.invoiceSearch = container.querySelector("#invoiceSearch")?.value || state.invoiceSearch || "";
    state.invoiceEditorDraft = currentInvoiceDraftFromDom();
    state.invoiceEditorId = state.invoiceEditorDraft.id;
  }
  state.invoiceSkipDomSync = false;
  if (!state.adminUnlocked) {
    container.innerHTML = `<p class="hint">Admin-Rechte erforderlich.</p>`;
    return;
  }
  state.invoiceSettings = normalizeInvoiceSettingsClient(state.invoiceSettings || createDefaultInvoiceSettingsClient());
  state.invoices = normalizeInvoicesClient(state.invoices || [], state.invoiceSettings);
  const invoices = state.invoices;
  const draft = ensureInvoiceDraft();
  const readySources = invoiceReadySources();
  const query = String(state.invoiceSearch || "").trim();
  const filtered = invoices.filter((invoice) => invoiceSearchMatches(invoice, query));
  const drafts = filtered.filter((invoice) => invoice.status === "draft");
  const finals = filtered.filter((invoice) => invoice.status === "finalized" || invoice.status === "sent");
  const archived = filtered.filter((invoice) => invoice.status === "archived");
  const eventInvoices = filtered.filter((invoice) => invoiceMatchesSourceTypeClient(invoice, "event"));
  const advertisingInvoices = filtered.filter((invoice) => invoiceMatchesSourceTypeClient(invoice, "advertising"));
  const manualInvoices = filtered.filter((invoice) => invoiceMatchesSourceTypeClient(invoice, "manual"));
  const eventDrafts = eventInvoices.filter((invoice) => invoice.status === "draft");
  const eventFinals = eventInvoices.filter((invoice) => invoice.status === "finalized" || invoice.status === "sent");
  const eventArchived = eventInvoices.filter((invoice) => invoice.status === "archived");
  const advertisingDrafts = advertisingInvoices.filter((invoice) => invoice.status === "draft");
  const advertisingFinals = advertisingInvoices.filter((invoice) => invoice.status === "finalized" || invoice.status === "sent");
  const advertisingArchived = advertisingInvoices.filter((invoice) => invoice.status === "archived");
  const readonly = draft.status !== "draft";
  const totals = invoiceTotalsClient(draft);
  const customerOptions = normalizeCustomerDirectory(state.customerDirectory || []);
  const eventCustomers = customerOptions.filter((customer) => customerDirectoryMatchesSourceTypeClient(customer, "non-advertising"));
  const advertisingCustomers = customerOptions.filter((customer) => customerDirectoryMatchesSourceTypeClient(customer, "advertising"));
  const view = ["overview", "events", "advertising", "directory", "editor"].includes(state.invoiceAdminView)
    ? state.invoiceAdminView
    : "overview";
  const navCounts = {
    overview: filtered.length,
    events: readySources.length + eventInvoices.length,
    advertising: advertisingCustomers.length + advertisingInvoices.length,
    directory: customerOptions.length,
    editor: filtered.length
  };
  const recentInvoices = filtered.slice(0, 6);
  const defaultNewButton = view === "advertising"
    ? `<button class="primary" type="button" data-invoice-new-advertising>+ Werbekunden-Entwurf</button>`
    : `<button class="primary" type="button" data-invoice-new>+ Neuer Entwurf</button>`;
  let workspaceMarkup = "";
  if (view === "overview") {
    workspaceMarkup = `
      <div class="invoice-overview-grid">
        ${renderInvoiceOverviewCard("events", "Veranstaltungen", "Bowling- und Veranstaltungsrechnungen bleiben direkt mit dem Tagesbericht verknüpft.", readySources.length, "Öffnen")}
        ${renderInvoiceOverviewCard("advertising", "Werbekunden", "Freie Firmen- und Werberechnungen laufen getrennt vom Tagesgeschäft, aber im selben Generator.", advertisingInvoices.length + advertisingCustomers.length, "Öffnen")}
        ${renderInvoiceOverviewCard("directory", "Kundenstamm", "Alle Kunden zentral pflegen und später gezielt in Rechnungen oder Angebote übernehmen.", customerOptions.length, "Öffnen")}
        ${renderInvoiceOverviewCard("editor", "Rechnungen", "Entwürfe bearbeiten, finalisieren, mailen und archivieren.", filtered.length, "Öffnen")}
      </div>
      <div class="invoice-directory-grid">
        <section class="invoice-side-section">
          <div class="invoice-side-head">
            <strong>Bereit aus Veranstaltungen</strong>
            <span>${readySources.length}</span>
          </div>
          <div class="invoice-source-list">
            ${readySources.length ? readySources.slice(0, 6).map(renderInvoiceReadySourceItem).join("") : `<p class="hint">Aktuell keine fertigen Veranstaltungskunden.</p>`}
          </div>
        </section>
        <section class="invoice-side-section">
          <div class="invoice-side-head">
            <strong>Letzte Rechnungen</strong>
            <span>${recentInvoices.length}</span>
          </div>
          <div class="invoice-list-items">
            ${recentInvoices.length ? recentInvoices.map((invoice) => renderInvoiceListItem(invoice, draft.id)).join("") : `<p class="hint">Noch keine Rechnungen vorhanden.</p>`}
          </div>
        </section>
      </div>
    `;
  } else if (view === "events") {
    workspaceMarkup = `
      <div class="invoice-workspace-grid">
        <aside class="invoice-sidebar">
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Veranstaltungen bereit für Rechnung</strong>
              <span>${readySources.length}</span>
            </div>
            <div class="invoice-source-list">
              ${readySources.length ? readySources.map(renderInvoiceReadySourceItem).join("") : `<p class="hint">Aktuell keine fertigen Veranstaltungskunden.</p>`}
            </div>
          </section>
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Bowling-Kundenstamm</strong>
              <span>${eventCustomers.length}</span>
            </div>
            <div class="invoice-source-list">
              ${eventCustomers.length ? eventCustomers.slice(0, 8).map(renderInvoiceDirectoryEntry).join("") : `<p class="hint">Noch keine Veranstaltungskunden im Stamm.</p>`}
            </div>
            ${eventCustomers.length > 8 ? `<button class="secondary" type="button" data-invoice-view="directory">Restlichen Kundenstamm öffnen</button>` : ""}
          </section>
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Veranstaltungsrechnungen</strong>
              <span>${eventInvoices.length}</span>
            </div>
            <input id="invoiceSearch" type="search" value="${escapeHtml(query)}" placeholder="Kunde, Nummer, Datum, Betrag">
            ${renderInvoiceListSection("Entwürfe", eventDrafts, draft.id)}
            ${renderInvoiceListSection("Final / versendet", eventFinals, draft.id)}
            ${renderInvoiceListSection("Archiv", eventArchived, draft.id)}
            ${!eventInvoices.length ? `<p class="hint">Noch keine Veranstaltungsrechnungen vorhanden.</p>` : ""}
          </section>
        </aside>
        ${renderInvoiceEditorShell(draft, totals, readonly)}
      </div>
    `;
  } else if (view === "advertising") {
    workspaceMarkup = `
      <div class="invoice-workspace-grid">
        <aside class="invoice-sidebar">
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Werbekunden separat führen</strong>
              <span>${advertisingInvoices.length}</span>
            </div>
            <p class="hint">Hier sammeln wir bewusst alles, was nichts mit dem Tagesbericht zu tun hat: Werbung, Sponsoren, Partner oder freie Firmenrechnungen.</p>
            <button class="primary" type="button" data-invoice-new-advertising>+ Werbekunden-Entwurf starten</button>
          </section>
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Werbekunden-Stamm</strong>
              <span>${advertisingCustomers.length}</span>
            </div>
            <div class="invoice-source-list">
              ${advertisingCustomers.length ? advertisingCustomers.map(renderInvoiceDirectoryEntry).join("") : `<p class="hint">Noch keine Werbekunden im Stamm. In Phase 2 bauen wir hier die volle Kundenpflege aus.</p>`}
            </div>
          </section>
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Werberechnungen</strong>
              <span>${advertisingInvoices.length + manualInvoices.length}</span>
            </div>
            <input id="invoiceSearch" type="search" value="${escapeHtml(query)}" placeholder="Kunde, Nummer, Datum, Betrag">
            ${renderInvoiceListSection("Entwürfe", advertisingDrafts, draft.id)}
            ${renderInvoiceListSection("Final / versendet", advertisingFinals, draft.id)}
            ${renderInvoiceListSection("Archiv", advertisingArchived, draft.id)}
            ${renderInvoiceListSection("Allgemein / manuell", manualInvoices, draft.id)}
            ${!(advertisingInvoices.length || manualInvoices.length) ? `<p class="hint">Noch keine Werberechnungen oder freien Entwürfe vorhanden.</p>` : ""}
          </section>
        </aside>
        ${renderInvoiceEditorShell(draft, totals, readonly)}
      </div>
    `;
  } else if (view === "directory") {
    workspaceMarkup = `
      <div class="invoice-directory-grid">
        <section class="invoice-side-section">
          <div class="invoice-side-head">
            <strong>Veranstaltungs-Kundenstamm</strong>
            <span>${eventCustomers.length}</span>
          </div>
          <div class="invoice-source-list">
            ${eventCustomers.length ? eventCustomers.map(renderInvoiceDirectoryEntry).join("") : `<p class="hint">Noch keine Veranstaltungskunden vorhanden.</p>`}
          </div>
        </section>
        <section class="invoice-side-section">
          <div class="invoice-side-head">
            <strong>Werbekunden-Stamm</strong>
            <span>${advertisingCustomers.length}</span>
          </div>
          <div class="invoice-source-list">
            ${advertisingCustomers.length ? advertisingCustomers.map(renderInvoiceDirectoryEntry).join("") : `<p class="hint">Noch keine Werbekunden vorhanden.</p>`}
          </div>
        </section>
      </div>
    `;
  } else {
    workspaceMarkup = `
      <div class="invoice-workspace-grid">
        <aside class="invoice-sidebar">
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Rechnungen</strong>
              <span>${filtered.length}</span>
            </div>
            <input id="invoiceSearch" type="search" value="${escapeHtml(query)}" placeholder="Kunde, Nummer, Datum, Betrag">
            ${renderInvoiceListSection("Entwürfe", drafts, draft.id)}
            ${renderInvoiceListSection("Final / versendet", finals, draft.id)}
            ${renderInvoiceListSection("Archiv", archived, draft.id)}
          </section>
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Bereit aus Veranstaltungen</strong>
              <span>${readySources.length}</span>
            </div>
            <div class="invoice-source-list">
              ${readySources.length ? readySources.map(renderInvoiceReadySourceItem).join("") : `<p class="hint">Aktuell keine fertigen Veranstaltungskunden.</p>`}
            </div>
          </section>
          <section class="invoice-side-section">
            <div class="invoice-side-head">
              <strong>Kundenstamm</strong>
              <span>${customerOptions.length}</span>
            </div>
            <div class="invoice-source-list">
              ${customerOptions.length ? customerOptions.slice(0, 8).map(renderInvoiceDirectoryEntry).join("") : `<p class="hint">Noch keine Kunden im Stamm.</p>`}
            </div>
            ${customerOptions.length > 8 ? `<button class="secondary" type="button" data-invoice-view="directory">Kompletten Kundenstamm öffnen</button>` : ""}
          </section>
        </aside>
        ${renderInvoiceEditorShell(draft, totals, readonly)}
      </div>
    `;
  }
  container.innerHTML = `
    <div class="invoice-toolbar">
      <div class="invoice-toolbar-actions">
        ${defaultNewButton}
        <button class="secondary" type="button" data-invoice-save ${readonly ? "disabled" : ""}>Entwurf speichern</button>
        <button class="secondary danger-lite" type="button" data-invoice-delete ${readonly ? "disabled" : ""}>Entwurf löschen</button>
        <button class="secondary" type="button" data-invoice-preview>PDF Vorschau</button>
        <button class="secondary" type="button" data-invoice-download>PDF herunterladen</button>
        <button class="secondary" type="button" data-invoice-finalize ${readonly ? "disabled" : ""}>Finalisieren</button>
        <button class="secondary" type="button" data-invoice-send ${draft.status === "draft" || draft.status === "archived" ? "disabled" : ""}>Per E-Mail senden</button>
        <button class="secondary" type="button" data-invoice-archive ${draft.status === "draft" || draft.status === "archived" ? "disabled" : ""}>Archivieren</button>
      </div>
      <div class="invoice-toolbar-stats">
        <span><small>Entwürfe</small><strong>${drafts.length}</strong></span>
        <span><small>Final / versendet</small><strong>${finals.length}</strong></span>
        <span><small>Archiv</small><strong>${archived.length}</strong></span>
        <span><small>Rechnungsbetrag</small><strong>${escapeHtml(formatMoney(totals.grossTotal))}</strong></span>
      </div>
    </div>
    ${renderInvoiceAdminViewNav(view, navCounts)}
    ${workspaceMarkup}
  `;
}

function downloadDataUrlFile(dataUrl, fileName = "datei") {
  if (!dataUrl) return;
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
}

async function runInvoiceMutation(action, extra = {}, fallbackMessage = "") {
  const result = await api("/api/state", {
    method: "POST",
    headers: { "x-admin-token": state.adminToken },
    body: JSON.stringify({
      action,
      adminToken: state.adminToken,
      ...extra
    })
  });
  state.invoiceSettings = normalizeInvoiceSettingsClient(result.invoiceSettings || state.invoiceSettings || createDefaultInvoiceSettingsClient());
  state.invoices = normalizeInvoicesClient(result.invoices || state.invoices || [], state.invoiceSettings);
  if (result.invoice) {
    setInvoiceDraftFromInvoice(result.invoice);
  } else if (state.invoiceEditorDraft) {
    const refreshed = state.invoices.find((invoice) => invoice.id === state.invoiceEditorDraft.id);
    if (refreshed) setInvoiceDraftFromInvoice(refreshed);
  }
  state.invoiceEditorDirty = false;
  renderAdminInvoices();
  if (result.message || fallbackMessage) showToast(result.message || fallbackMessage);
  return result;
}

async function createNewInvoiceDraft(button, overrides = null) {
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Erstellt...";
  }
  try {
    state.invoiceAdminView = "editor";
    const result = await runInvoiceMutation("invoice-new-draft", {}, "Neuer Rechnungsentwurf erstellt.");
    if (overrides && typeof overrides === "object") {
      const draft = normalizeInvoiceRecordClient({
        ...(result.invoice || state.invoiceEditorDraft || createBlankInvoiceDraftClient(state.invoiceSettings)),
        ...overrides
      }, state.invoiceSettings || createDefaultInvoiceSettingsClient());
      await runInvoiceMutation("invoice-save-draft", { invoice: draft }, "Rechnungsentwurf vorbereitet.");
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function importInvoiceReadySource(token, button) {
  const [sourceDate, sourceCustomerId] = String(token || "").split("|");
  if (!sourceDate || !sourceCustomerId) return;
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Öffnet...";
  }
  try {
    state.invoiceAdminView = "editor";
    await runInvoiceMutation("invoice-from-ready-customer", { sourceDate, sourceCustomerId }, "Rechnungskunde übernommen.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function importInvoiceFromCustomerDirectory(button) {
  const sourceType = String(button?.dataset.invoiceSourceType || "").trim();
  const selectId = String(button?.dataset.invoiceCustomerSelect || "").trim();
  const customerId = String(button?.dataset.invoiceCustomerId || "").trim() || (selectId ? ($(`#${selectId}`)?.value || "") : "");
  if (!customerId) {
    showToast("Bitte zuerst einen Kunden aus dem Stamm wählen.");
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Übernimmt...";
  }
  try {
    state.invoiceAdminView = "editor";
    await runInvoiceMutation("invoice-from-customer-directory", {
      customerId,
      ...(sourceType ? { sourceType } : {})
    }, "Kunde aus dem Stamm übernommen.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function saveCurrentInvoiceDraft(button) {
  const draft = currentInvoiceDraftFromDom();
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Speichert...";
  }
  try {
    await runInvoiceMutation("invoice-save-draft", { invoice: draft }, "Rechnungsentwurf gespeichert.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function deleteCurrentInvoiceDraft(button) {
  const draft = currentInvoiceDraftFromDom();
  if (!draft?.id) return;
  if (!window.confirm("Diesen Rechnungsentwurf wirklich löschen?")) return;
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Löscht...";
  }
  try {
    const result = await api("/api/state", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "invoice-delete-draft",
        adminToken: state.adminToken,
        invoiceId: draft.id
      })
    });
    state.invoices = normalizeInvoicesClient(result.invoices || [], state.invoiceSettings || createDefaultInvoiceSettingsClient());
    state.invoiceEditorDraft = state.invoices[0] ? cloneData(state.invoices[0]) : createBlankInvoiceDraftClient(state.invoiceSettings);
    state.invoiceEditorId = state.invoiceEditorDraft.id;
    state.invoiceEditorDirty = false;
    renderAdminInvoices();
    showToast(result.message || "Entwurf gelöscht.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function previewCurrentInvoicePdf(button, download = false) {
  const draft = currentInvoiceDraftFromDom();
  const oldText = button?.textContent || "";
  const dirtyState = state.invoiceEditorDirty;
  if (button) {
    button.disabled = true;
    button.textContent = download ? "Erstellt..." : "Lädt...";
  }
  try {
    const result = await api("/api/state", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "invoice-preview-pdf",
        adminToken: state.adminToken,
        invoice: draft
      })
    });
    state.invoiceEditorDraft = normalizeInvoiceRecordClient({
      ...draft,
      pdfData: result.pdfData || "",
      pdfFileName: result.pdfFileName || draft.pdfFileName
    }, state.invoiceSettings || createDefaultInvoiceSettingsClient());
    state.invoiceEditorId = state.invoiceEditorDraft.id;
    state.invoiceEditorDirty = dirtyState;
    state.invoiceSkipDomSync = true;
    renderAdminInvoices();
    if (download) {
      downloadDataUrlFile(result.pdfData, result.pdfFileName || "rechnung.pdf");
    } else if (result.pdfData) {
      window.open(result.pdfData, "_blank", "noopener");
    }
    showToast(download ? "PDF heruntergeladen." : "PDF Vorschau geöffnet.");
  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function finalizeCurrentInvoice(button) {
  const draft = currentInvoiceDraftFromDom();
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Finalisiert...";
  }
  try {
    const result = await runInvoiceMutation("invoice-finalize", { invoice: draft }, "Rechnung finalisiert.");
    if (result.pdfData) {
      state.invoiceEditorDraft = normalizeInvoiceRecordClient({
        ...(result.invoice || draft),
        pdfData: result.pdfData,
        pdfFileName: result.pdfFileName || result.invoice?.pdfFileName
      }, state.invoiceSettings || createDefaultInvoiceSettingsClient());
      state.invoiceEditorId = state.invoiceEditorDraft.id;
      state.invoiceSkipDomSync = true;
      renderAdminInvoices();
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function sendCurrentInvoiceEmail(button) {
  const draft = currentInvoiceDraftFromDom();
  const oldText = button?.textContent || "";
  if (!draft.id) return;
  if (button) {
    button.disabled = true;
    button.textContent = "Sendet...";
  }
  try {
    await runInvoiceMutation("invoice-send-email", { invoiceId: draft.id }, "Rechnung per E-Mail versendet.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function archiveCurrentInvoice(button) {
  const draft = currentInvoiceDraftFromDom();
  if (!draft.id) return;
  if (!window.confirm("Diese Rechnung wirklich archivieren?")) return;
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Archiviert...";
  }
  try {
    await runInvoiceMutation("invoice-archive", { invoiceId: draft.id }, "Rechnung archiviert.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function createInvoiceFollowUp(type, button) {
  const draft = currentInvoiceDraftFromDom();
  if (!draft.id) return;
  const action = type === "storno" ? "invoice-create-storno" : "invoice-create-correction";
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Erstellt...";
  }
  try {
    await runInvoiceMutation(action, { invoiceId: draft.id }, type === "storno" ? "Stornorechnung angelegt." : "Korrekturrechnung angelegt.");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function addInvoiceAttachmentsFromFiles(files = []) {
  const selected = [...files];
  if (!selected.length) return;
  showToast("Anlagen werden vorbereitet...");
  const newAttachments = [];
  for (const file of selected) {
    const data = await fileToDataUrl(file);
    newAttachments.push(normalizeInvoiceAttachmentClient({
      id: cryptoId(),
      label: file.name.replace(/\.[^.]+$/, "") || "Anlage",
      name: file.name,
      data,
      mime: file.type || ""
    }));
  }
  const draft = currentInvoiceDraftFromDom();
  draft.attachments = [...(draft.attachments || []), ...newAttachments];
  state.invoiceEditorDraft = normalizeInvoiceRecordClient(draft, state.invoiceSettings || createDefaultInvoiceSettingsClient());
  state.invoiceEditorId = state.invoiceEditorDraft.id;
  state.invoiceEditorDirty = true;
  state.invoiceSkipDomSync = true;
  renderAdminInvoices();
  showToast(`${newAttachments.length} Anlage${newAttachments.length === 1 ? "" : "n"} hinzugefügt.`);
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
  const expenseList = $("#expensesList");
  if (expenseList) return expenseRowsTotalFromDom();
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
  renderFinanceExpensePreview();
  renderDayReportA4Summary(state.terminalDate || todayKey(), reportPreviewFromForm());
}

function bowlingCashRevenueFromFormOrReport(report = state.terminalReport || {}) {
  return parseMoneyInput($("#reportBowlingCashRevenue")?.value || report.bowlingCashRevenue || "");
}

function gastroCashRevenueFromFormOrReport(report = state.terminalReport || {}) {
  return parseMoneyInput($("#reportGastroCashRevenue")?.value || report.gastroCashRevenue || "");
}

function dailyCashRevenueFromFormOrReport(report = state.terminalReport || {}) {
  return bowlingCashRevenueFromFormOrReport(report) + gastroCashRevenueFromFormOrReport(report);
}

function reportPreviewFromForm() {
  const cashTotal = $("#reportCashTotal")?.value || state.terminalReport?.cashTotal || "";
  const cashExpenses = cashExpensesFromFormOrReport().toFixed(2);
  const revenueBowling = $("#reportRevenueBowling")?.value || state.terminalReport?.revenueBowling || state.terminalReport?.barBowling || "";
  const revenueDrinks = $("#reportRevenueDrinks")?.value || state.terminalReport?.revenueDrinks || "";
  const revenueFood = $("#reportRevenueFood")?.value || state.terminalReport?.revenueFood || "";
  const revenueOther = $("#reportRevenueOther")?.value || state.terminalReport?.revenueOther || "";
  const bowlingCashRevenue = $("#reportBowlingCashRevenue")?.value || state.terminalReport?.bowlingCashRevenue || "";
  const gastroCashRevenue = $("#reportGastroCashRevenue")?.value || state.terminalReport?.gastroCashRevenue || "";
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
    bowlingCashRevenue,
    gastroCashRevenue,
    revenueGastro,
    invoiceTransferAmount: $("#financeInvoiceTotal")?.dataset.manualOverride === "true" ? ($("#financeInvoiceTotal")?.value || "") : "",
    invoiceTransferAmountManual: $("#financeInvoiceTotal")?.dataset.manualOverride === "true",
    miscIncome: miscIncomeFromFormOrReport(),
    barBowling: revenueBowling,
    barGastro: revenueGastro,
    tipTotal: tipResult.tipTotal.toFixed(2),
    tipRemainder: tipResult.tipRemainder.toFixed(2),
    tipsByEmployee: Object.fromEntries(tipResult.rows.map((row) => [row.employee, row.tip.toFixed(2)])),
    openingHours: $("#terminalOpeningHours")?.value || state.terminalReport?.openingHours || "",
    shiftLeader: $("#terminalShiftLeader")?.value || state.terminalReport?.shiftLeader || ""
  };
}

function terminalWorkspaceTab(value) {
  const legacyTabs = {
    tasks: "today",
    checks: "today",
    assignments: "employees",
    service: "employees",
    tables: "tables",
    finance: "closing",
    tips: "tips",
    report: "closing",
    cleaning: "today"
  };
  const tab = legacyTabs[String(value || "")] || String(value || "");
  return ["today", "tables", "employees", "closing", "orders", "offers", "events", "cocktails", "task-calendar", "invoices", "tips", "settings"].includes(tab) ? tab : "today";
}

function terminalCanManageSettings() {
  const managerText = `${state.terminalReport?.shiftLeader || ""} ${state.activeEmployee || ""}`.toLowerCase();
  return Boolean(state.terminalToken)
    || Boolean(state.adminToken)
    || /(christian|poschenrieder|kevin|dennis|schichtleitung|betriebsleitung)/i.test(managerText);
}

function terminalRelativeDate(offset = 0) {
  const date = new Date(`${todayKey()}T12:00:00`);
  date.setDate(date.getDate() + Number(offset || 0));
  return isoDate(date);
}

function terminalIsFuturePreview(dateKey) {
  return String(dateKey || "") > todayKey();
}

function renderTerminalDateNavigator(dateKey) {
  const picker = $("#terminalDatePicker");
  const sidebarPicker = $("#terminalSidebarDatePicker");
  const tomorrow = terminalRelativeDate(1);
  if (picker) {
    picker.value = dateKey;
    picker.max = tomorrow;
  }
  if (sidebarPicker) {
    sidebarPicker.value = dateKey;
    sidebarPicker.max = tomorrow;
  }
  $$('[data-terminal-date-shortcut]').forEach((button) => {
    const targetDate = button.dataset.terminalDateShortcut === "tomorrow" ? tomorrow : todayKey();
    button.classList.toggle("active", targetDate === dateKey);
  });
  const futureHint = $("#terminalFuturePreview");
  if (futureHint) {
    const preview = terminalIsFuturePreview(dateKey);
    futureHint.classList.toggle("hidden", !preview);
    futureHint.textContent = preview
      ? `${formatDate(dateKey)} · Vorschau`
      : "";
  }
}

function terminalExtrasForDate(dateKey) {
  return normalizeOffersClient(state.offers || [])
    .filter((offer) => !offer.archived && offer.confirmed && offer.eventDate === dateKey)
    .sort((a, b) => String(a.startTime || "99:99").localeCompare(String(b.startTime || "99:99")));
}

function terminalExtraTitle(offer = {}) {
  return offer.occasion || offer.title || offer.customerName || "Besonderheit";
}

function terminalExtraDescription(offer = {}) {
  const details = [];
  if (offer.customerName && offer.customerName !== terminalExtraTitle(offer)) details.push(offer.customerName);
  const persons = offerPersonCount(offer);
  if (persons) details.push(`${persons} Pers.`);
  if (offer.reservedArea) details.push(offer.reservedArea);
  return details.join(" · ") || "Angebot für diesen Tag";
}

function eventCalendarWeekStart(value) {
  const date = new Date(`${value || todayKey()}T12:00:00`);
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  return isoDate(date);
}

function confirmedEventOffers() {
  return normalizeOffersClient(state.offers || [])
    .filter((offer) => offer.confirmed && !offer.archived && offer.eventDate)
    .sort((a, b) => `${a.eventDate} ${a.startTime || "99:99"}`.localeCompare(`${b.eventDate} ${b.startTime || "99:99"}`));
}

function renderTerminalEventCalendar() {
  const target = $("#terminalEventsWorkspace");
  if (!target) return;
  const weekStart = eventCalendarWeekStart(state.terminalEventWeek || state.terminalDate || todayKey());
  state.terminalEventWeek = weekStart;
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${weekStart}T12:00:00`);
    date.setDate(date.getDate() + index);
    return isoDate(date);
  });
  const weekEnd = days[6];
  const allEvents = confirmedEventOffers();
  const weekEvents = allEvents.filter((offer) => offer.eventDate >= weekStart && offer.eventDate <= weekEnd);
  const guestCount = weekEvents.reduce((sum, offer) => sum + offerPersonCount(offer), 0);
  const buffetEvents = weekEvents.filter((offer) => offer.buffet?.name || offerHasBuffet(offer));
  const buffetGroups = new Map();
  const dishGroups = new Map();
  buffetEvents.forEach((offer) => {
    const guests = offerPersonCount(offer);
    const name = offer.buffet?.name || "Individuelles Buffet";
    const current = buffetGroups.get(name) || { events: 0, guests: 0 };
    buffetGroups.set(name, { events: current.events + 1, guests: current.guests + guests });
    Object.values(offer.buffet?.categories || {}).flat().forEach((dish) => {
      const dishName = String(dish?.name || dish?.title || "").trim();
      if (dishName) dishGroups.set(dishName, (dishGroups.get(dishName) || 0) + guests);
    });
  });
  const snackEvents = weekEvents.filter((offer) => offer.conference?.enabled && offer.conference?.morningSnackText);
  const upcoming = allEvents.filter((offer) => offer.eventDate >= todayKey()).slice(0, 30);
  const dayHtml = days.map((dateKey) => {
    const events = weekEvents.filter((offer) => offer.eventDate === dateKey);
    const date = new Date(`${dateKey}T12:00:00`);
    return `<section class="event-calendar-day ${events.length ? "has-events" : ""}">
      <header><span>${escapeHtml(date.toLocaleDateString("de-DE", { weekday: "short" }))}</span><strong>${escapeHtml(date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }))}</strong></header>
      ${events.length ? events.map((offer) => `<article class="event-calendar-item"><div><strong>${escapeHtml(offer.customerName || offer.title || "Veranstaltung")}</strong><span>${escapeHtml(offer.occasion || offer.title || "Bestätigtes Angebot")}</span></div><small>${escapeHtml(offer.startTime || "Zeit offen")} · ${offerPersonCount(offer)} Pers.${offer.reservedArea ? ` · ${escapeHtml(offer.reservedArea)}` : ""}</small></article>`).join("") : `<p>Keine Veranstaltung</p>`}
    </section>`;
  }).join("");
  const buffetRows = buffetGroups.size ? [...buffetGroups.entries()].map(([name, info]) => `<div class="event-kitchen-row"><strong>${escapeHtml(name)}</strong><span>${info.guests} Gäste · ${info.events} Veranstaltung${info.events === 1 ? "" : "en"}</span></div>`).join("") : `<p class="event-calendar-empty">In dieser Woche kein Buffet eingeplant.</p>`;
  target.innerHTML = `
    <header class="event-calendar-toolbar"><div><p class="terminal-card-kicker">Sicher eingeplant</p><h2>Veranstaltungskalender</h2><p>${escapeHtml(formatDate(weekStart))} bis ${escapeHtml(formatDate(weekEnd))}</p></div><div class="event-calendar-nav"><button class="secondary" type="button" data-event-week-step="-7" aria-label="Vorherige Woche">‹</button><button class="secondary" type="button" data-event-week-today>Diese Woche</button><button class="secondary" type="button" data-event-week-step="7" aria-label="Nächste Woche">›</button></div></header>
    <div class="event-calendar-kpis"><span><small>Veranstaltungen</small><strong>${weekEvents.length}</strong></span><span><small>Gäste gesamt</small><strong>${guestCount}</strong></span><span><small>Mit Buffet</small><strong>${buffetEvents.length}</strong></span><span><small>Tagungen</small><strong>${weekEvents.filter((offer) => offer.conference?.enabled).length}</strong></span></div>
    <div class="event-calendar-week">${dayHtml}</div>
    <section class="event-kitchen-panel"><header><div><p class="terminal-card-kicker">Wochenbedarf</p><h3>Küche &amp; Bestellung</h3></div><strong>${guestCount} Gäste</strong></header><div class="event-kitchen-grid"><div><h4>Buffets</h4>${buffetRows}</div><div><h4>Speisen nach Gästezahl</h4>${dishGroups.size ? [...dishGroups.entries()].map(([name, guests]) => `<div class="event-kitchen-row"><strong>${escapeHtml(name)}</strong><span>für ${guests} Gäste</span></div>`).join("") : `<p class="event-calendar-empty">Keine Speisen ausgewählt.</p>`}</div><div><h4>Vormittagssnacks</h4>${snackEvents.length ? snackEvents.map((offer) => `<div class="event-kitchen-row"><strong>${escapeHtml(offer.conference.morningSnackText)}</strong><span>${offerPersonCount(offer)} Gäste · ${escapeHtml(offer.conference.morningSnackTime || "Zeit offen")}</span></div>`).join("") : `<p class="event-calendar-empty">Keine Snacks eingeplant.</p>`}</div></div></section>
    <section class="event-upcoming-panel"><header><div><p class="terminal-card-kicker">Vorschau</p><h3>Alle kommenden bestätigten Veranstaltungen</h3></div><span>${upcoming.length} Einträge</span></header><div class="event-upcoming-list">${upcoming.length ? upcoming.map((offer) => `<article><time>${escapeHtml(formatDate(offer.eventDate))}${offer.startTime ? ` · ${escapeHtml(offer.startTime)}` : ""}</time><strong>${escapeHtml(offer.customerName || offer.title || "Veranstaltung")}</strong><span>${escapeHtml(offer.occasion || offer.title || "Bestätigtes Angebot")} · ${offerPersonCount(offer)} Pers.</span></article>`).join("") : `<p class="event-calendar-empty">Noch keine bestätigten Veranstaltungen.</p>`}</div></section>`;
}

function renderTerminalExtras(dateKey) {
  const target = $("#terminalEventOverview");
  const weekTarget = $("#terminalExtrasWeek");
  if (!target || !weekTarget) return;
  const selectedExtras = terminalExtrasForDate(dateKey);
  const overviewCard = target.closest(".terminal-overview-card");
  overviewCard?.classList.toggle("has-no-extras", selectedExtras.length === 0);
  overviewCard?.classList.toggle("has-extras", selectedExtras.length > 0);
  const date = new Date(`${dateKey}T12:00:00`);
  if ($("#terminalExtrasDateLabel")) {
    $("#terminalExtrasDateLabel").textContent = date.toLocaleDateString("de-DE", {
      weekday: "long", day: "2-digit", month: "2-digit"
    });
  }
  if ($("#terminalExtrasCount")) {
    $("#terminalExtrasCount").textContent = `${selectedExtras.length} Extra${selectedExtras.length === 1 ? "" : "s"}`;
    $("#terminalExtrasCount").classList.toggle("has-extras", selectedExtras.length > 0);
  }
  target.innerHTML = selectedExtras.length ? `
    <div class="terminal-extra-list">
      ${selectedExtras.slice(0, 5).map((offer) => `
        <article class="terminal-extra-item">
          <span class="terminal-extra-time">${escapeHtml(offer.startTime || "Ganztägig")}</span>
          <span class="terminal-extra-copy">
            <strong>${escapeHtml(terminalExtraTitle(offer))}</strong>
            <small>${escapeHtml(terminalExtraDescription(offer))}</small>
          </span>
          <span class="terminal-extra-kind">${offer.buffet?.name ? "Buffet" : offer.bowling?.lanes ? "Bowling" : "Angebot"}</span>
        </article>
      `).join("")}
      ${selectedExtras.length > 5 ? `<button class="terminal-extra-more" data-terminal-tab-target="offers" type="button">Alle ${selectedExtras.length} Extras öffnen</button>` : ""}
    </div>
  ` : `
    <div class="terminal-extras-empty">
      <span class="terminal-extras-empty-icon" aria-hidden="true">+</span>
      <span><strong>Keine Extras geplant</strong><small>Für diesen Tag sind keine besonderen Aktionen oder Hinweise hinterlegt.</small></span>
    </div>
  `;

  const weekDays = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(`${dateKey}T12:00:00`);
    day.setDate(day.getDate() + offset);
    const key = isoDate(day);
    return { key, day, extras: terminalExtrasForDate(key) };
  });
  weekTarget.innerHTML = weekDays.map(({ key, day, extras }) => `
    <button class="terminal-extra-day ${key === dateKey ? "active" : ""} ${extras.length ? "has-extras" : ""}" data-terminal-extra-date="${key}" type="button">
      <span class="terminal-extra-day-date"><strong>${day.toLocaleDateString("de-DE", { weekday: "short" })}</strong><small>${day.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</small></span>
      <span class="terminal-extra-day-summary"><strong>${extras.length} Extra${extras.length === 1 ? "" : "s"}</strong><small>${extras.slice(0, 2).map(terminalExtraTitle).join(" · ") || "Nichts geplant"}</small></span>
    </button>
  `).join("");
}

function renderTerminalDashboardKpis(dateKey, employees = [], entries = {}, report = {}) {
  const target = $("#terminalDashboardKpis");
  if (!target) return;
  const activeEmployees = employees.filter((employee) => {
    const entry = entries[employee]?.[dateKey] || {};
    return Boolean(entry.from && !entry.to);
  });
  const occupiedAreas = new Set(activeEmployees.map(terminalWorktimeArea).filter(Boolean));
  const controls = loadTerminalControls().filter((control) => control.active);
  const overdueControls = controls.filter((control) => control.status === "overdue").length;
  const reservations = terminalTableReservations(report).length;
  const completions = report.taskCompletions || {};
  const openTasks = sortTaskTemplates(state.terminalTasks || [])
    .filter((task) => (task.category || "running") === "running" && !completions[task.id]).length;
  const kpis = [
    { tone: "blue", icon: "&#9786;", value: activeEmployees.length, label: "Mitarbeiter im Dienst", detail: `${occupiedAreas.size} Bereiche besetzt` },
    { tone: overdueControls ? "red" : "green", icon: "&#9888;", value: overdueControls, label: overdueControls === 1 ? "Kontrolle überfällig" : "Kontrollen überfällig", detail: overdueControls ? "Bitte prüfen" : "Alles in Ordnung" },
    { tone: "purple", icon: "&#9638;", value: reservations, label: "Tischreservierungen", detail: "Heute" },
    { tone: openTasks ? "orange" : "green", icon: "&#10003;", value: openTasks, label: "Aufgaben offen", detail: "Heute" }
  ];
  target.innerHTML = kpis.map((item) => `
    <article class="terminal-dashboard-kpi is-${item.tone}">
      <span class="terminal-dashboard-kpi-icon" aria-hidden="true">${item.icon}</span>
      <strong>${escapeHtml(String(item.value))}</strong>
      <span class="terminal-dashboard-kpi-label">${escapeHtml(item.label)}</span>
      <small>${escapeHtml(item.detail)}</small>
    </article>
  `).join("");
  if ($("#terminalPremiumDate")) $("#terminalPremiumDate").textContent = formatLongDate(dateKey);
  if ($("#terminalDashboardUpdated")) {
    $("#terminalDashboardUpdated").textContent = `Aktualisiert: ${new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(new Date())} Uhr`;
  }
}

function renderTerminal() {
  const panel = $("#terminal");
  if (!panel) return;
  const todoMode = isTodoMode();
  const cocktailOnlyMode = isCocktailOnlyMode();
  panel.classList.toggle("terminal-dashboard-mode", Boolean(state.terminalToken) && isTerminalMode() && !todoMode);
  if (todoMode) state.terminalTab = "today";
  if (cocktailOnlyMode) {
    state.terminalTab = "cocktails";
    state.cocktailMode = "recipes";
  }
  if ($("#terminalTitle")) $("#terminalTitle").textContent = cocktailOnlyMode ? "Cocktail-Bar" : "Tages-Terminal";
  if ($("#terminalCodeLabel")) $("#terminalCodeLabel").textContent = todoMode ? "TO-DO-Code" : cocktailOnlyMode ? "Bar-Code" : "Terminal-Code";
  if ($("#terminalLoginHint")) $("#terminalLoginHint").textContent = todoMode
    ? "Willkommen bei der LA-Bowling To-do-App! Bitte melden Sie sich an."
    : cocktailOnlyMode
      ? "Willkommen in der LA-Bowling Cocktail-Bar. Bitte melden Sie sich an."
      : "Willkommen bei der LA-Bowling TerminalApp! Bitte melden Sie sich an.";
  if ($("#unlockTerminal")) $("#unlockTerminal").textContent = "Login";
  document.body.classList.toggle("terminal-login-mode", (isTerminalMode() || todoMode) && !state.terminalToken);
  $("#terminalLoginBrand")?.classList.toggle("hidden", Boolean(state.terminalToken));
  $("#terminalLogin")?.classList.toggle("hidden", Boolean(state.terminalToken));
  $("#terminalContent")?.classList.toggle("hidden", !state.terminalToken);
  const dateKey = state.terminalDate || todayKey();
  state.terminalDate = dateKey;
  state.terminalTab = terminalWorkspaceTab(state.terminalTab);
  $("#terminalDate").textContent = formatLongDate(dateKey);
  if (!state.terminalToken) {
    normalizeGermanDisplay();
    return;
  }

  const employees = terminalEmployeesForDay(dateKey);
  const entries = state.terminalEntries || {};
  const report = state.terminalReport || {};
  loadTerminalControls();
  const reportClosed = Boolean(report.closed);
  const reportLocked = reportClosed || terminalIsFuturePreview(dateKey);
  renderTerminalTabs();
  renderTerminalDateNavigator(dateKey);
  renderTerminalExtras(dateKey);
  renderTerminalDayMeta(dateKey, report, reportLocked);
  renderTerminalCorrectionBanner(dateKey, report);
  renderTerminalOpenDays(dateKey);
  renderTerminalLeaderMessages(report, reportLocked);
  renderTerminalTasks(report, reportLocked);
  renderHandovers(report, reportLocked);
  renderToiletStatus(report);
  renderTerminalChecks(report);
  renderTerminalTableLite();
  renderTerminalDashboardKpis(dateKey, employees, entries, report);
  renderTerminalAssignments(dateKey);
  renderTerminalTablePlan(dateKey, report, reportClosed);
  checkTerminalReminders(report, reportClosed);
  renderTipDistribution();
  $(".terminal-add")?.classList.toggle("hidden", reportLocked);
  const breakEmployees = employees.filter((employee) => (entries[employee]?.[dateKey]?.breaks || []).some((item) => item?.from && !item?.to));
  const activeEmployees = employees.filter((employee) => {
    const entry = entries[employee]?.[dateKey] || {};
    return Boolean(entry.from && !entry.to && !(entry.breaks || []).some((item) => item?.from && !item?.to));
  });
  const finishedEmployees = employees.filter((employee) => Boolean(entries[employee]?.[dateKey]?.to));
  const openEmployees = employees.filter((employee) => !entries[employee]?.[dateKey]?.from);
  renderTerminalWorktimePreview(dateKey, employees, entries, reportLocked);
  if ($("#terminalWorktimeDate")) $("#terminalWorktimeDate").textContent = formatLongDate(dateKey);
  if ($("#terminalWorktimeLeader")) $("#terminalWorktimeLeader").textContent = report.shiftLeader || "Nicht festgelegt";
  $$('[data-worktime-date-step="1"]').forEach((button) => {
    button.disabled = dateKey >= terminalRelativeDate(1);
  });
  if ($("#terminalPlannedEmployeeCount")) $("#terminalPlannedEmployeeCount").textContent = String(employees.filter((employee) => terminalIsPlanned(employee)).length);
  const activeEmployeeCount = $("#terminalActiveEmployeeCount");
  if (activeEmployeeCount) activeEmployeeCount.textContent = String(activeEmployees.length);
  if ($("#terminalBreakEmployeeCount")) $("#terminalBreakEmployeeCount").textContent = String(breakEmployees.length);
  if ($("#terminalOpenEmployeeCount")) $("#terminalOpenEmployeeCount").textContent = String(openEmployees.length);
  if ($("#terminalFinishedEmployeeCount")) $("#terminalFinishedEmployeeCount").textContent = String(finishedEmployees.length);
  $("#terminalEmployees").innerHTML = employees.length ? employees.map((employee) => {
    const entry = entries[employee]?.[dateKey] || {};
    const hours = paidHours(entry);
    const hasOpenBreak = (entry.breaks || []).some((item) => item?.from && !item?.to);
    const planned = terminalIsPlanned(employee);
    const plannedShift = terminalPlannedShiftFor(employee);
    const shiftText = dayReportShiftText(entry);
    const area = terminalWorktimeArea(employee);
    const initials = employee.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
    const status = entry.to ? "Beendet" : hasOpenBreak ? "Pause" : entry.from ? "Im Dienst" : planned ? "Geplant" : "Offen";
    const statusClass = entry.to ? "is-finished" : hasOpenBreak ? "is-break" : entry.from ? "is-active" : "is-planned";
    return `
      <article class="terminal-employee ${reportClosed ? "is-locked" : ""}" data-terminal-employee-card="${escapeHtml(employee)}">
        <div class="terminal-employee-head">
          <span class="worktime-avatar" aria-hidden="true">${escapeHtml(initials)}</span>
          <div class="worktime-employee-copy">
            <strong>${escapeHtml(employee)}</strong>
            <span>${escapeHtml(area)}${plannedShift.label ? ` · Plan ${escapeHtml(plannedShift.label)}` : ""}</span>
          </div>
          <span class="worktime-status-chip ${statusClass}">${escapeHtml(status)}</span>
          <span class="terminal-shift-time">${escapeHtml(shiftText)}</span>
          ${hours ? `<span class="terminal-hours">${formatHours(hours)}</span>` : ""}
        </div>
        <div class="terminal-time-edit">
          <div class="terminal-time-toolbar">
            <strong>Arbeitszeiten</strong>
            <div class="terminal-time-toolbar-actions">
              <button class="secondary terminal-add-segment-button" type="button" data-add-time-segment="${escapeHtml(employee)}" title="Zeitspanne hinzufügen" ${reportLocked ? "disabled" : ""}><span aria-hidden="true">+</span> Zeitspanne</button>
              <button class="secondary terminal-save-times-button" data-terminal-adjust="${escapeHtml(employee)}" ${reportLocked ? "disabled" : ""}>Speichern</button>
            </div>
          </div>
          <div class="terminal-time-segments">
            ${timeSegmentsForEdit(entry).map((segment, index) => terminalTimeSegmentRowHtml(segment, index, reportLocked)).join("")}
          </div>
        </div>
        <div class="terminal-actions">
          <button class="primary" data-terminal-punch="start" data-terminal-employee="${escapeHtml(employee)}" ${reportLocked ? "disabled" : ""}>Eintragen</button>
          <button class="secondary" data-terminal-punch="end" data-terminal-employee="${escapeHtml(employee)}" ${reportLocked ? "disabled" : ""}>Ausstempeln</button>
          <button class="secondary" data-terminal-break="${hasOpenBreak ? "end" : "start"}" data-terminal-employee="${escapeHtml(employee)}" ${reportLocked || !entry.from || Boolean(entry.to) ? "disabled" : ""}>${hasOpenBreak ? "Pause beenden" : "Pause"}</button>
          <button class="secondary danger-lite terminal-remove-button" data-terminal-remove="${escapeHtml(employee)}" title="Mitarbeiter entfernen" aria-label="${escapeHtml(employee)} entfernen" ${reportLocked ? "disabled" : ""}>&times;</button>
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
  $("#reportBowlingCashRevenue").value = report.bowlingCashRevenue || "";
  $("#reportGastroCashRevenue").value = report.gastroCashRevenue || "";
  $("#reportRevenueGastro").value = report.revenueGastro || report.barGastro || "";
  const invoiceTransferField = $("#financeInvoiceTotal");
  const storedManualInvoiceTotal = report.invoiceTransferAmountManual === true || report.invoiceTransferAmountManual === "true";
  invoiceTransferField.dataset.manualOverride = storedManualInvoiceTotal ? "true" : "";
  invoiceTransferField.value = storedManualInvoiceTotal ? (report.invoiceTransferAmount || "") : (reportTransferInvoiceTotal(report) || "");
  updateReportBarTotal();
  $("#reportNotes").value = report.notes || "";
  renderReportEntryLists(report);
  renderReportDocuments(report);
  renderDayReportA4Summary(dateKey, report);
  setDayReportLocked(reportLocked, report);
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

function renderTerminalWorktimePreview(dateKey, employees = [], entries = {}, reportLocked = false) {
  const target = $("#terminalWorktimePreviewList");
  if (!target) return;
  const groups = [
    ["Counter", []],
    ["Service", []],
    ["Küche", []],
    ["Reinigung", []],
    ["Nebenarbeiten", []]
  ];
  const groupMap = Object.fromEntries(groups);
  employees.forEach((employee) => {
    const area = terminalWorktimeArea(employee);
    groupMap[area].push(employee);
  });
  target.innerHTML = `
    <div class="terminal-worktime-groups">
      ${groups.map(([label, names]) => `
        <section class="terminal-worktime-group">
          <header>
            <strong>${escapeHtml(label)}</strong>
            <span>${names.length}</span>
          </header>
          ${names.length ? names.map((employee) => {
            const entry = entries[employee]?.[dateKey] || {};
            const start = timeSegments(entry).find((segment) => segment.from)?.from || "";
            return `
              <button class="terminal-dashboard-name" type="button" data-open-terminal-employees data-terminal-preview-employee="${escapeHtml(employee)}">
                <span aria-hidden="true"></span>
                <strong>${escapeHtml(employee)}</strong>
                <small>${start ? `seit ${escapeHtml(start)}` : "nicht aktiv"}</small>
              </button>
            `;
          }).join("") : `<p class="terminal-worktime-empty">Nicht besetzt</p>`}
        </section>
      `).join("")}
    </div>
  `;
}

function terminalWorktimeArea(employee) {
  for (const [position, value] of Object.entries(state.terminalSchedule || {})) {
    if (position.includes("__") || value !== employee) continue;
    return terminalWorktimeAreaFromText(position);
  }
  const extra = (state.terminalReport?.extraEmployees || [])
    .map((item) => typeof item === "string" ? { employee: item, role: "" } : item)
    .find((item) => item.employee === employee);
  if (extra?.role) return terminalWorktimeAreaFromText(extra.role);
  const source = [
    state.settings?.employeeRoles?.[employee] || "",
    ...(state.settings?.employeeDepartments?.[employee] || [])
  ].join(" ");
  return terminalWorktimeAreaFromText(source);
}

function terminalWorktimeAreaFromText(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("counter")) return "Counter";
  if (text.includes("service")) return "Service";
  if (text.includes("küche") || text.includes("kueche") || text.includes("koch") || text.includes("spül")) return "Küche";
  if (text.includes("reinigung")) return "Reinigung";
  return "Nebenarbeiten";
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
  const html = dayReportA4Html(dateKey, report);
  const target = $("#dayReportA4Summary");
  if (target) target.innerHTML = html;
  const preview = $("#financeDayReportPreview");
  if (preview) preview.innerHTML = html;
  const modalPreview = $("#dayReportModalPreview");
  if (modalPreview) modalPreview.innerHTML = html;
}

function applyDayReportVisibility() {
  $$("[data-report-field-box]").forEach((element) => {
    element.classList.toggle("hidden", !reportFieldEnabled(element.dataset.reportFieldBox));
  });
}

function renderTerminalTabs() {
  const canManage = terminalCanManageSettings();
  $("#terminalSettingsNav")?.classList.toggle("hidden", !canManage);
  $("#openTablePlanSettings")?.classList.toggle("hidden", !canManage);
  const requested = terminalWorkspaceTab(state.terminalTab);
  const active = requested === "settings" && !canManage ? "today" : requested;
  const tablePlanSettingsActive = active === "settings" && state.terminalSettingsModule === "table-plan";
  state.terminalTab = active;
  $$(".terminal-tab").forEach((button) => button.classList.toggle("active", button.dataset.terminalTab === active));
  $("#terminalTodaySection")?.classList.toggle("hidden", active !== "today");
  $("#terminalTasksSection")?.classList.toggle("hidden", active !== "today");
  $("#terminalChecksSection")?.classList.toggle("hidden", active !== "today");
  $("#terminalAssignmentsSection")?.classList.toggle("hidden", !(active === "closing" && Number(state.terminalClosingStep || 1) === 7));
  $("#terminalTablesSection")?.classList.toggle("hidden", active !== "tables" && !tablePlanSettingsActive);
  $("#terminalServiceSection")?.classList.toggle("hidden", active !== "employees");
  $("#terminalFinanceSection")?.classList.toggle("hidden", active !== "closing");
  $("#terminalTipsSection")?.classList.toggle("hidden", active !== "tips");
  $("#terminalInvoicesToolSection")?.classList.toggle("hidden", active !== "invoices");
  $("#dayReportPrintArea")?.classList.toggle("hidden", active !== "closing");
  $("#terminalOrdersSection")?.classList.toggle("hidden", active !== "orders");
  $("#terminalOffersSection")?.classList.toggle("hidden", active !== "offers");
  $("#terminalEventsSection")?.classList.toggle("hidden", active !== "events");
  $("#terminalCocktailsSection")?.classList.toggle("hidden", active !== "cocktails");
  $("#terminalTaskCalendarSection")?.classList.toggle("hidden", active !== "task-calendar");
  $("#terminalSettingsSection")?.classList.toggle("hidden", active !== "settings");
  $("#terminalSettingsSection")?.classList.toggle("is-table-plan-settings", tablePlanSettingsActive);
  $(".terminal-workspace-main")?.classList.toggle("is-table-plan-settings-active", tablePlanSettingsActive);
  $(".terminal-control-management")?.classList.toggle("hidden", active === "settings" && state.terminalSettingsModule !== "controls");
  $("#terminalClosureManagement")?.classList.toggle("hidden", active !== "settings" || state.terminalSettingsModule !== "closures");
  $$(".terminal-settings-module[data-terminal-settings-module]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.terminalSettingsModule === state.terminalSettingsModule);
  });
  if (active === "settings" && state.terminalSettingsModule === "controls") renderTerminalControlManagement();
  if (tablePlanSettingsActive) {
    state.terminalTableView = "manage";
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
  }
  if (active === "task-calendar") renderTerminalTaskCalendar();
  if (active === "offers") renderAdminOffers();
  if (active === "events") renderTerminalEventCalendar();
  if (active === "cocktails") renderCocktailTool();
  if (active === "invoices") mountTerminalInvoiceTool();
  if (active === "closing") renderTerminalClosingSteps();
}

const cocktailCategoryLabels = {
  all: "Alle",
  spritz: "Spritz",
  alkoholfrei: "Alkoholfrei",
  alkohol: "Mit Alkohol",
  longdrink: "Longdrinks"
};

function renderCocktailTool() {
  const list = $("#cocktailRecipeList");
  const categories = $("#cocktailCategories");
  if (!list || !categories) return;
  const search = String(state.cocktailSearch || "").trim().toLowerCase();
  const selectedCategory = String(state.cocktailCategory || "");
  const showResults = state.cocktailMode === "manage" || Boolean(search) || Boolean(selectedCategory);
  const recipes = (state.cocktails || []).filter((recipe) => {
    const categoryMatch = !selectedCategory || selectedCategory === "all" || recipe.category === selectedCategory;
    const searchMatch = !search || `${recipe.name} ${recipe.ingredients} ${recipe.garnish}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });
  categories.innerHTML = Object.entries(cocktailCategoryLabels).map(([key, label]) => {
    const count = key === "all" ? (state.cocktails || []).length : (state.cocktails || []).filter((item) => item.category === key).length;
    return `<button class="${state.cocktailCategory === key ? "is-active" : ""}" type="button" data-cocktail-category="${key}"><span>${escapeHtml(label)}</span><b>${count}</b></button>`;
  }).join("");
  list.innerHTML = recipes.length ? recipes.map((recipe) => `
    <button class="cocktail-recipe-card" type="button" data-open-cocktail="${escapeHtml(recipe.id)}">
      <span class="cocktail-recipe-mark" aria-hidden="true">${escapeHtml((recipe.name || "C").slice(0, 1).toUpperCase())}</span>
      <span><small>${escapeHtml(cocktailCategoryLabels[recipe.category] || "Cocktail")}</small><strong>${escapeHtml(recipe.name)}</strong><em>${escapeHtml(recipe.garnish ? `Garnitur: ${recipe.garnish}` : recipe.glass || "Rezept öffnen")}</em></span>
      <b aria-hidden="true">›</b>
    </button>`).join("") : `<div class="cocktail-empty"><strong>Kein Rezept gefunden</strong><span>Suchbegriff oder Kategorie ändern.</span></div>`;
  $("#cocktailResults")?.classList.toggle("hidden", !showResults);
  if ($("#cocktailResultsTitle")) {
    $("#cocktailResultsTitle").textContent = search
      ? `Suchergebnisse für „${state.cocktailSearch.trim()}“`
      : cocktailCategoryLabels[selectedCategory] || "Alle Rezepte";
  }
  $("#cocktailEditor")?.classList.toggle("hidden", state.cocktailMode !== "manage");
  $(".cocktail-layout")?.classList.toggle("is-manage", state.cocktailMode === "manage");
  $$('[data-cocktail-mode]').forEach((button) => {
    button.classList.toggle("primary", button.dataset.cocktailMode === state.cocktailMode);
    button.classList.toggle("secondary", button.dataset.cocktailMode !== state.cocktailMode);
  });
  const searchInput = $("#cocktailSearch");
  if (searchInput && searchInput.value !== state.cocktailSearch) searchInput.value = state.cocktailSearch;
  const select = $("#cocktailCategory");
  if (select && !select.options.length) select.innerHTML = Object.entries(cocktailCategoryLabels).filter(([key]) => key !== "all").map(([key, label]) => `<option value="${key}">${escapeHtml(label)}</option>`).join("");
}

function openCocktailRecipe(id) {
  const recipe = (state.cocktails || []).find((item) => item.id === id);
  if (!recipe) return;
  if (state.cocktailMode === "manage") {
    $("#cocktailId").value = recipe.id;
    $("#cocktailName").value = recipe.name || "";
    $("#cocktailCategory").value = recipe.category || "alkohol";
    $("#cocktailGlass").value = recipe.glass || "";
    $("#cocktailGarnish").value = recipe.garnish || "";
    $("#cocktailIngredients").value = recipe.ingredients || "";
    $("#cocktailSteps").value = recipe.steps || "";
    $("#cocktailEditorTitle").textContent = recipe.name;
    $("#deleteCocktail").classList.remove("hidden");
    $("#cocktailEditor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  $("#cocktailViewerName").textContent = recipe.name;
  $("#cocktailViewerCategory").textContent = cocktailCategoryLabels[recipe.category] || "Cocktail";
  $("#cocktailViewerMeta").textContent = [recipe.glass && `Glas: ${recipe.glass}`, recipe.garnish && `Garnitur: ${recipe.garnish}`].filter(Boolean).join(" · ");
  $("#cocktailViewerIngredients").innerHTML = String(recipe.ingredients || "").split(/\n+/).filter(Boolean).map((line) => `<div><span aria-hidden="true">+</span>${escapeHtml(line)}</div>`).join("");
  $("#cocktailViewerSteps").innerHTML = String(recipe.steps || "").split(/\n+/).filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  $("#cocktailViewer").classList.remove("hidden");
}

function resetCocktailForm() {
  $("#cocktailForm")?.reset();
  if ($("#cocktailId")) $("#cocktailId").value = "";
  if ($("#cocktailEditorTitle")) $("#cocktailEditorTitle").textContent = "Neues Rezept";
  $("#deleteCocktail")?.classList.add("hidden");
}

function bindCocktailEvents() {
  document.addEventListener("click", async (event) => {
    const mode = event.target.closest("[data-cocktail-mode]");
    if (mode) { state.cocktailMode = mode.dataset.cocktailMode; resetCocktailForm(); renderCocktailTool(); return; }
    const category = event.target.closest("[data-cocktail-category]");
    if (category) {
      state.cocktailCategory = category.dataset.cocktailCategory;
      $("#cocktailSearch")?.blur();
      document.body.classList.remove("cocktail-searching");
      renderCocktailTool();
      return;
    }
    if (event.target.closest("[data-reset-cocktail-selection]")) {
      state.cocktailCategory = "";
      state.cocktailSearch = "";
      renderCocktailTool();
      $("#cocktailSearch")?.focus();
      return;
    }
    if (event.target.closest("#cocktailFullscreen")) {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch (error) {
        showToast("Vollbild ist auf diesem Gerät nur über die Home-Bildschirm-App verfügbar.");
      }
      return;
    }
    const recipe = event.target.closest("[data-open-cocktail]");
    if (recipe) {
      $("#cocktailSearch")?.blur();
      document.body.classList.remove("cocktail-searching");
      openCocktailRecipe(recipe.dataset.openCocktail);
      return;
    }
    if (event.target.closest("[data-close-cocktail]")) { $("#cocktailViewer")?.classList.add("hidden"); return; }
    if (event.target.closest("[data-new-cocktail]")) { resetCocktailForm(); return; }
    if (event.target.closest("#deleteCocktail")) {
      const id = $("#cocktailId")?.value || "";
      if (!id || !confirm("Dieses Rezept wirklich löschen?")) return;
      await terminalAction({ action: "delete-cocktail", id });
      resetCocktailForm();
      showToast("Rezept gelöscht.");
    }
  });
  $("#cocktailSearch")?.addEventListener("focus", () => {
    if (isCocktailOnlyMode()) document.body.classList.add("cocktail-searching");
  });
  $("#cocktailSearch")?.addEventListener("input", (event) => {
    state.cocktailSearch = event.target.value;
    renderCocktailTool();
    if (state.cocktailSearch.trim()) {
      requestAnimationFrame(() => $("#cocktailResults")?.scrollIntoView({ block: "nearest" }));
    }
  });
  $("#cocktailSearch")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.currentTarget.blur();
    document.body.classList.remove("cocktail-searching");
    requestAnimationFrame(() => $("#cocktailResults")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  });
  document.addEventListener("fullscreenchange", () => {
    const button = $("#cocktailFullscreen");
    if (!button) return;
    const active = Boolean(document.fullscreenElement);
    button.querySelector("b").textContent = active ? "Vollbild beenden" : "Vollbild";
    button.setAttribute("aria-label", active ? "Vollbild beenden" : "Vollbild einschalten");
  });
  $("#cocktailForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const recipe = { id: $("#cocktailId").value, name: $("#cocktailName").value.trim(), category: $("#cocktailCategory").value, glass: $("#cocktailGlass").value.trim(), garnish: $("#cocktailGarnish").value.trim(), ingredients: $("#cocktailIngredients").value.trim(), steps: $("#cocktailSteps").value.trim() };
    await terminalAction({ action: "save-cocktail", recipe });
    resetCocktailForm();
    showToast("Rezept gespeichert.");
  });
}

function mountTerminalInvoiceTool() {
  const mount = $("#terminalInvoiceToolMount");
  const list = $("#invoiceCustomersList");
  const addButton = $("#addInvoiceCustomer");
  if (!mount || !list || !addButton) return;
  if (list.parentElement !== mount) mount.append(list);
  if (addButton.parentElement !== mount) mount.append(addButton);
  const date = $("#terminalInvoicesToolDate");
  if (!state.terminalInvoiceDate) state.terminalInvoiceDate = todayKey();
  if (date) {
    date.max = todayKey();
    date.value = state.terminalInvoiceDate;
  }
  renderTerminalInvoiceToolView();
}

function renderInvoicesForToolDate() {
  const list = $("#invoiceCustomersList");
  if (!list) return;
  const date = state.terminalInvoiceDate || todayKey();
  const customers = date === state.terminalDate
    ? (state.terminalReport?.invoiceCustomers || [])
    : (state.terminalInvoiceHistory || []).filter((entry) => entry.date === date).map((entry) => entry.customer);
  list.innerHTML = customers.length
    ? customers.map((customer) => invoiceRowHtml({ ...customer, sourceDate: date })).join("")
    : '<p class="hint">Keine Rechnungskunden für diesen Tag.</p>';
}

function renderTerminalInvoiceToolView() {
  const historyActive = state.terminalInvoiceToolView === "history";
  $("#terminalInvoiceToolMount")?.classList.toggle("hidden", historyActive);
  $("#terminalInvoiceHistory")?.classList.toggle("hidden", !historyActive);
  $$('[data-invoice-tool-view]').forEach((button) => {
    const active = button.dataset.invoiceToolView === state.terminalInvoiceToolView;
    button.classList.toggle("primary", active);
    button.classList.toggle("secondary", !active);
  });
  if (historyActive) renderTerminalInvoiceHistory();
  else renderInvoicesForToolDate();
}

function renderTerminalInvoiceHistory() {
  const target = $("#terminalInvoiceHistory");
  if (!target) return;
  const entries = Array.isArray(state.terminalInvoiceHistory) ? state.terminalInvoiceHistory : [];
  target.innerHTML = entries.length ? `
    <div class="terminal-invoice-history-head"><div><h3>Archiv</h3><p>Alle gespeicherten Rechnungskunden nach Datum.</p></div><strong>${entries.length} Einträge</strong></div>
    <div class="terminal-invoice-history-list">${entries.map((entry) => {
      const item = entry.customer || {};
      const total = invoiceTotal(item);
      const receipt = invoiceReceipt(item);
      return `<details class="terminal-invoice-history-item">
        <summary><span><strong>${escapeHtml(item.name || "Rechnungskunde")}</strong><small>${escapeHtml(formatDate(entry.date))}</small></span><b>${escapeHtml(formatReportMoney(total))}</b></summary>
        <div class="terminal-invoice-history-details">
          <section><small>Rechnungsadresse</small><strong>${escapeHtml(item.address || "-")}</strong></section>
          <section><small>Kontakt</small><strong>${escapeHtml(item.contact || "-")}</strong><span>${escapeHtml([item.phone, item.email].filter(Boolean).join(" · ") || "-")}</span></section>
          <section><small>Zahlungsart</small><strong>${escapeHtml(item.paymentMethod || "-")}</strong></section>
          <section class="history-invoice-amounts"><small>Positionen</small><span>Bowling <b>${formatReportMoney(item.bowlingAmount)}</b></span><span>Getränke <b>${formatReportMoney(item.gastroDrinksAmount)}</b></span><span>Speisen <b>${formatReportMoney(item.gastroFoodAmount)}</b></span><span>Sonstiges <b>${formatReportMoney(item.gastroOtherAmount)}</b></span><span>Tipp <b>${formatReportMoney(item.tip)}</b></span></section>
          ${item.note || item.gastroOtherNote ? `<section><small>Notizen</small><span>${escapeHtml([item.note, item.gastroOtherNote].filter(Boolean).join(" · "))}</span></section>` : ""}
          <section><small>Beleg</small><span>${receipt?.receiptName ? escapeHtml(receipt.receiptName) : "Kein Beleg hinterlegt"}</span>${receipt ? receiptLinkHtml(receipt, "Beleg öffnen") : ""}</section>
          <div class="invoice-entry-actions"><button class="primary" data-history-invoice-pdf data-invoice-date="${escapeHtml(entry.date)}" data-invoice-id="${escapeHtml(item.id || "")}" type="button">2 PDFs &amp; Outlook vorbereiten</button></div>
        </div>
      </details>`;
    }).join("")}</div>
  ` : `<div class="terminal-invoice-history-empty"><strong>Archiv ist leer</strong><span>Gespeicherte Rechnungskunden erscheinen hier automatisch.</span></div>`;
}

function showInvoiceWizardStep(row, step) {
  if (!row) return;
  const targetStep = Math.min(3, Math.max(1, Number(step || 1)));
  if (targetStep > 1 && !String(row.querySelector('[data-report-field="name"]')?.value || "").trim()) {
    showToast("Bitte zuerst einen Kunden auswählen oder einen Namen eintragen.");
    row.querySelector('[data-report-field="name"]')?.focus();
    return;
  }
  row.querySelectorAll("[data-invoice-step-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", Number(panel.dataset.invoiceStepPanel) !== targetStep);
  });
  const progress = row.querySelector("[data-invoice-current-step]");
  if (progress) progress.dataset.invoiceCurrentStep = String(targetStep);
  row.querySelectorAll("[data-invoice-step-go]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.invoiceStepGo) === targetStep);
  });
}

function applyCustomerMasterToInvoiceRow(row) {
  const selectedId = row?.querySelector("[data-invoice-customer-master]")?.value || "";
  const customer = normalizeCustomerDirectory(state.customerDirectory).find((item) => item.id === selectedId);
  if (!row || !customer) {
    showToast("Bitte zuerst einen Kunden aus dem Kundenstamm wählen.");
    return;
  }
  const values = customerMasterToInvoice(customer);
  ["name", "contact", "phone", "email", "address", "note", "paymentMethod"].forEach((field) => {
    const input = row.querySelector(`[data-report-field="${field}"]`);
    if (input) input.value = values[field] || "";
  });
  showToast(`${customer.name || "Kunde"} wurde übernommen.`);
}

function renderTerminalClosingSteps() {
  const dayReportMount = $("#terminalDayReportClosingMount");
  if (dayReportMount) {
    const preview = $(".finance-day-report-section");
    const actions = $(".finance-action-bar");
    if (preview && preview.parentElement !== dayReportMount) dayReportMount.append(preview);
    if (actions && actions.parentElement !== dayReportMount) dayReportMount.append(actions);
  }

  const tomorrowAssignmentsMount = $("#terminalTomorrowAssignmentsMount");
  const assignmentsSection = $("#terminalAssignmentsSection");
  if (tomorrowAssignmentsMount && assignmentsSection && assignmentsSection.parentElement !== tomorrowAssignmentsMount) {
    tomorrowAssignmentsMount.append(assignmentsSection);
  }

  const activeStep = Math.min(7, Math.max(1, Number(state.terminalClosingStep || 1)));
  assignmentsSection?.classList.toggle("hidden", activeStep !== 7);
  $$('[data-closing-step]').forEach((button) => {
    const step = Number(button.dataset.closingStep || 1);
    button.classList.toggle("is-active", step === activeStep);
    button.classList.toggle("is-complete", (step === 2 && Boolean(state.terminalPentacodeComplete)) || (step === 3 && Boolean(state.terminalDocumentsComplete)) || (step === 4 && Boolean(state.terminalManualReportComplete)));
    button.setAttribute("aria-current", step === activeStep ? "step" : "false");
  });
  $$('[data-closing-step-content]').forEach((section) => {
    section.classList.toggle("hidden", Number(section.dataset.closingStepContent || 1) !== activeStep);
  });
  if (activeStep === 2) renderPentacodeTransfer();
  if (activeStep === 3) renderClosingDocumentsStep();
  if (activeStep === 4) renderManualReportTransfer();
  if (activeStep === 6) renderDailyTipDistribution();
  if (activeStep === 7) {
    const tomorrow = assignmentDateKeys(state.terminalDate || todayKey())[1];
    if ($("#terminalTomorrowDate")) $("#terminalTomorrowDate").textContent = formatLongDate(tomorrow);
    if ($("#terminalTomorrowTableDate")) $("#terminalTomorrowTableDate").textContent = formatLongDate(tomorrow);
    renderTerminalAssignments(state.terminalDate || todayKey());
  }
}

function reportDocumentAttachments() {
  return Array.isArray(state.terminalReport?.documents?.attachments)
    ? state.terminalReport.documents.attachments
    : [];
}

function closingDocumentFixedKey(category = "") {
  return {
    Penta: "penta",
    Handschrift: "handwriting",
    "EC-Schnitt": "ecCut"
  }[category] || "";
}

function closingDocumentEntries() {
  const documents = state.terminalReport?.documents || {};
  const fixed = [
    ["Penta", "penta"],
    ["Handschrift", "handwriting"],
    ["EC-Schnitt", "ecCut"]
  ].flatMap(([category, key]) => {
    const document = documents[key] || {};
    return document.name || document.path || document.url || document.data
      ? [{ ...document, id: `fixed-${key}`, category, fixedKey: key }]
      : [];
  });
  return [...fixed, ...reportDocumentAttachments()];
}

function closingDocumentFormat(document = {}) {
  const format = String(document.format || document.name?.split(".").pop() || "Datei").toUpperCase();
  return format === "JPG" ? "JPEG" : format;
}

function renderClosingDocumentsStep() {
  const target = $("#closingDocumentsList");
  if (!target) return;
  const documents = closingDocumentEntries();
  const date = state.terminalDate || todayKey();
  if ($("#closingDocumentsDate")) $("#closingDocumentsDate").textContent = formatLongDate(date);
  if ($("#closingDocumentsCount")) $("#closingDocumentsCount").textContent = `${documents.length} Dokument${documents.length === 1 ? "" : "e"} gespeichert`;
  target.innerHTML = documents.length ? documents.map((document) => {
    const time = document.createdAt ? new Date(document.createdAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
    const href = document.url || document.data || "";
    return `<article class="closing-document-row">
      ${href ? `<a class="closing-document-icon" href="${escapeHtml(href)}" target="_blank" rel="noopener" title="Vorschau öffnen">${escapeHtml(closingDocumentFormat(document).slice(0, 4))}</a>` : `<span class="closing-document-icon">${escapeHtml(closingDocumentFormat(document).slice(0, 4))}</span>`}
      <div class="closing-document-copy"><strong>${escapeHtml(document.name || "Dokument")}</strong><small>${escapeHtml(document.category || "Sonstiges")} · ${escapeHtml(time)} · ${escapeHtml(closingDocumentFormat(document))}</small></div>
      <span class="closing-document-saved">Gespeichert</span>
      <button class="danger-lite closing-document-remove" type="button" data-remove-closing-document="${escapeHtml(document.id || "")}" title="Dokument entfernen" aria-label="Dokument entfernen">&times;</button>
    </article>`;
  }).join("") : `<p class="closing-documents-empty">Noch keine Dokumente hinzugefügt.</p>`;
}

function newClosingDocument(file, data, extra = {}) {
  return {
    id: extra.id || `document-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: extra.name || file?.name || "Dokument",
    category: extra.category || "Ausgabenbeleg",
    format: extra.format || file?.name?.split(".").pop() || file?.type?.split("/").pop() || "Datei",
    createdAt: extra.createdAt || new Date().toISOString(),
    data: data || extra.data || "",
    path: extra.path || "",
    url: extra.url || ""
  };
}

async function saveClosingDocument(document, source) {
  state.terminalReport.documents ||= {};
  state.terminalReport.documents.attachments ||= [];
  const fixedKey = closingDocumentFixedKey(document.category);
  const previous = fixedKey ? cloneData(state.terminalReport.documents[fixedKey] || {}) : null;
  if (fixedKey) {
    state.terminalReport.documents[fixedKey] = document;
  } else {
    state.terminalReport.documents.attachments.push(document);
  }
  renderClosingDocumentsStep();
  const saved = await saveReportDocumentsNow(source, "Dokument gespeichert.");
  if (!saved) {
    if (fixedKey) state.terminalReport.documents[fixedKey] = previous;
    else state.terminalReport.documents.attachments = state.terminalReport.documents.attachments.filter((item) => item.id !== document.id);
    renderClosingDocumentsStep();
  }
}

async function addClosingDocumentFiles(input, category = "Ausgabenbeleg") {
  const files = [...(input.files || [])];
  if (!files.length) return;
  input.disabled = true;
  try {
    for (const file of files) {
      const data = await fileToDataUrl(file);
      await saveClosingDocument(newClosingDocument(file, data, { category }), input);
    }
  } finally {
    input.value = "";
    input.disabled = false;
  }
}

function showClosingDocumentsHint(message) {
  const hint = $("#closingDocumentsHint");
  if (!hint) return;
  hint.textContent = message;
  hint.classList.remove("hidden");
}

const SCANNER_URL_STORAGE_KEY = "laBowlingScannerUrl";
const DEFAULT_NETWORK_SCANNER_URL = "http://192.168.2.199:5055";

function scannerAppUrl() {
  const saved = String(localStorage.getItem(SCANNER_URL_STORAGE_KEY) || "").trim();
  if (/^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(saved)) return saved.replace(/\/$/, "");
  return ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:5055"
    : DEFAULT_NETWORK_SCANNER_URL;
}

function scannerAppOrigin() {
  try {
    return new URL(scannerAppUrl()).origin;
  } catch (_) {
    return "";
  }
}

function configureScannerApp() {
  const value = window.prompt("Adresse des Scanner-PCs", scannerAppUrl());
  if (value == null) return false;
  const normalized = String(value || "").trim().replace(/\/$/, "");
  if (!/^https?:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(normalized)) {
    showToast("Bitte eine vollständige Scanner-Adresse eingeben, z.B. http://192.168.2.199:5055");
    return false;
  }
  localStorage.setItem(SCANNER_URL_STORAGE_KEY, normalized);
  showToast("Scanner-Adresse gespeichert.");
  return true;
}

window.addEventListener("message", (event) => {
  if (event.origin !== scannerAppOrigin() || event.data?.type !== "la-bowling-scanner-document") return;
  const invoiceRow = event.data.invoiceId
    ? $$("#invoiceCustomersList [data-report-entry='invoice']").find((item) => item.dataset.id === event.data.invoiceId)
    : null;
  const expectedDate = invoiceRow?.dataset.invoiceDate || state.terminalDate || todayKey();
  if (event.data.date && event.data.date !== expectedDate) {
    showClosingDocumentsHint("Das gescannte Dokument gehört zu einem anderen Tagesdatum und wurde nicht übernommen.");
    return;
  }
  const raw = event.data.document || {};
  if (!raw.data) {
    showClosingDocumentsHint("Der Scanner hat keine Datei zurückgegeben.");
    return;
  }
  if (event.data.invoiceId) {
    const row = invoiceRow;
    if (!row) {
      showToast("Der Rechnungskunde für diesen Beleg wurde nicht gefunden.");
      return;
    }
    const values = {
      receiptName: raw.name || "Rechnungsbeleg",
      receiptData: raw.data,
      receiptPath: raw.path || "",
      receiptUrl: raw.url || ""
    };
    Object.entries(values).forEach(([field, value]) => {
      const input = row.querySelector(`[data-report-field="${field}"]`);
      if (input) input.value = value;
    });
    const hint = row.querySelector("[data-invoice-receipt-status]");
    if (hint) hint.textContent = `Beleg übernommen: ${values.receiptName}`;
    const saveButton = row.querySelector("[data-save-invoice-draft]");
    if (saveButton) saveInvoiceRow(saveButton, false);
    return;
  }
  const document = newClosingDocument(null, raw.data, raw);
  saveClosingDocument(document, null).catch(showError);
});

function currentCashExpenseTransferItems() {
  const rows = $$("#expensesList [data-report-entry='expense']");
  const expenses = rows.length
    ? rows.map((row) => ({
        id: row.dataset.id || cryptoId(),
        name: row.querySelector("[data-report-field='name']")?.value || "Ausgabe",
        category: row.querySelector("[data-report-field='category']")?.value || "",
        amount: parseMoneyInput(row.querySelector("[data-report-field='amount']")?.value || "")
      }))
    : (state.terminalReport?.expenses || []).map((item) => ({
        id: item.id || cryptoId(),
        name: item.name || "Ausgabe",
        category: item.category || "",
        amount: reportMoneyNumber(item.amount)
      }));
  return expenses;
}

function manualReportTransferItems() {
  const result = calculateTipDistribution(state.terminalDate || todayKey());
  const miscIncome = miscIncomeFromFormOrReport();
  const expenses = currentCashExpenseTransferItems();
  return [
    { key: "cashGastro", label: "Gastro-Bar", value: gastroCashRevenueFromFormOrReport(), available: true },
    { key: "cashBowling", label: "Bar-Umsatz Bowling", value: bowlingCashRevenueFromFormOrReport(), available: true },
    { key: "consumption", label: "Personalverzehr", value: result.personalConsumption, available: true },
    ...miscIncome.map((item, index) => ({ key: `income:${item.id || index}`, label: `Sonstige Einnahme: ${item.name || "ohne Bezeichnung"}`, value: reportMoneyNumber(item.amount), available: true })),
    ...expenses.map((item, index) => ({ key: `receipt:${item.id || index}`, label: `Beleg: ${item.name || `Beleg ${index + 1}`}`, note: item.category || "", value: reportMoneyNumber(item.amount), available: true })),
    { key: "receipts-total", label: "Gesamtsumme Belege", value: result.cashExpenses, available: true }
  ];
}

function renderManualReportTransfer() {
  const target = $("#manualReportTransferList");
  if (!target) return;
  const items = manualReportTransferItems();
  const copied = state.terminalManualReportCopied || {};
  const completeCount = items.filter((item) => copied[item.key]).length;
  const nextItem = items.find((item) => !copied[item.key]);
  target.innerHTML = items.map((item, index) => {
    const isCopied = Boolean(copied[item.key]);
    return `<article class="manual-report-row ${isCopied ? "is-copied" : ""} ${nextItem?.key === item.key ? "is-next" : ""}">
      <span>${index + 1}</span>
      <div><strong>${escapeHtml(item.label)}</strong>${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}</div>
      <b>${item.available ? escapeHtml(formatMoney(item.value || 0)) : "Noch nicht verfügbar"}</b>
      <button class="${isCopied ? "is-copied" : ""}" type="button" data-check-manual-report="${escapeHtml(item.key)}">${isCopied ? "✓ übertragen" : item.available ? "Übertragen" : "Bestätigen"}</button>
    </article>`;
  }).join("");
  if ($("#manualReportProgressText")) $("#manualReportProgressText").textContent = `${completeCount} von ${items.length} übertragen`;
  if ($("#manualReportProgressBar")) $("#manualReportProgressBar").style.width = `${completeCount / items.length * 100}%`;
  if ($("#completeManualReport")) $("#completeManualReport").disabled = completeCount !== items.length;
}

function pentacodeTransferItems() {
  const result = calculateTipDistribution(state.terminalDate || todayKey());
  const expenses = currentCashExpenseTransferItems();
  const expenseItems = expenses.length
    ? expenses.map((item, index) => ({
        key: `expense:${item.id || index}`,
        group: "Ausgaben",
        label: item.name || `Kassenbeleg ${index + 1}`,
        detail: ["Beleg aus Kasse", item.category].filter(Boolean).join(" · "),
        value: item.amount,
        available: true
      }))
    : [{ key: "expenses", group: "Ausgaben", label: "Ausgaben aus der Kasse", value: result.cashExpenses, available: true }];
  const financeItems = [
    { key: "drinks", group: "Einnahmen", label: "Getränke", value: result.revenueDrinks, available: true },
    { key: "food", group: "Einnahmen", label: "Speisen", value: result.revenueFood, available: true },
    { key: "bowling", group: "Einnahmen", label: "Bowling", value: result.revenueBowling, available: true },
    { key: "rent", group: "Einnahmen", label: "Raummiete", value: result.revenueOther, available: true },
    { key: "card", group: "Unbare Zahlungen", label: "Kartenzahlung", value: result.ecTotal, available: true },
    { key: "consumption", group: "Unbare Zahlungen", label: "Personalverzehr", value: result.personalConsumption, available: true },
    { key: "invoice", group: "Auf Rechnung", label: "Rechnung / Überweisung", value: result.invoiceTotal, available: true },
    ...expenseItems,
    { key: "salaryAdvance", group: "Gehaltsvorschüsse", label: "Gehaltsvorschüsse", value: null, available: false },
    { key: "cashBalance", group: "Kassenstand", label: "Kassenstand Ist", value: null, available: false }
  ];
  const dateKey = state.terminalDate || todayKey();
  const entries = state.terminalEntries || {};
  const worktimeItems = terminalEmployeesForDay(dateKey).flatMap((employee) => {
    const segments = timeSegments(entries[employee]?.[dateKey] || {});
    const rows = segments.length ? segments : [{ from: "", to: "" }];
    return rows.map((segment, index) => ({
      key: `worktime:${employee}:${index}`,
      group: "Arbeitszeiten",
      label: rows.length > 1 ? `${employee} · Zeitspanne ${index + 1}` : employee,
      detail: terminalWorktimeArea(employee),
      value: segment.from && segment.to ? `${segment.from}-${segment.to}` : "",
      displayValue: segment.from || segment.to ? `${segment.from || "offen"} – ${segment.to || "offen"}` : "Noch keine Zeit erfasst",
      available: Boolean(segment.from && segment.to),
      kind: "worktime"
    }));
  });
  return [...financeItems, ...worktimeItems];
}

function pentacodeCopyValue(item) {
  if (item.kind === "worktime") return String(item.value || "");
  return reportMoneyNumber(item.value).toFixed(2).replace(".", ",");
}

function renderPentacodeTransfer() {
  const target = $("#pentacodeTransferList");
  if (!target) return;
  const items = pentacodeTransferItems();
  const copied = state.terminalPentacodeCopied || {};
  const completeCount = items.filter((item) => copied[item.key]).length;
  const nextItem = items.find((item) => !copied[item.key]);
  let currentGroup = "";
  target.innerHTML = items.map((item, index) => {
    const group = item.group !== currentGroup ? `<h5>${escapeHtml(item.group)}</h5>` : "";
    currentGroup = item.group;
    const isCopied = Boolean(copied[item.key]);
    return `${group}<article class="pentacode-transfer-row ${isCopied ? "is-copied" : ""} ${nextItem?.key === item.key ? "is-next" : ""}">
      <span class="pentacode-position">${index + 1}</span>
      <div><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.detail || (item.available ? "Wert aus Schritt 1" : "Noch nicht verfügbar"))}</small></div>
      <b>${item.kind === "worktime" ? escapeHtml(item.displayValue) : item.available ? escapeHtml(formatMoney(item.value || 0)) : "–"}</b>
      <button class="${isCopied ? "is-copied" : ""}" type="button" data-copy-pentacode-value="${escapeHtml(item.key)}">${isCopied ? "✓ kopiert" : item.available ? "Kopieren" : "Bestätigen"}</button>
    </article>`;
  }).join("");
  if ($("#pentacodeProgressText")) $("#pentacodeProgressText").textContent = `${completeCount} von ${items.length} übertragen`;
  if ($("#pentacodeProgressBar")) $("#pentacodeProgressBar").style.width = `${completeCount / items.length * 100}%`;
  if ($("#completePentacodeTransfer")) $("#completePentacodeTransfer").disabled = completeCount !== items.length;
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
  const layout = [...TERMINAL_TABLE_LAYOUT.map((table) => ({ ...table, ...(tableOverrides[table.id] || {}) })), ...customTables];
  const nzBigIds = layout
    .filter((table) => String(table.area || "").toLocaleLowerCase("de").match(/nebenraum (?:groß|gross)/))
    .sort((left, right) => String(left.id).localeCompare(String(right.id), "de", { numeric: true }))
    .map((table) => table.id);
  const hutIds = layout
    .filter((table) => String(table.area || "").toLocaleLowerCase("de").includes("hütte"))
    .sort((left, right) => String(left.id).localeCompare(String(right.id), "de", { numeric: true }))
    .map((table) => table.id);
  return layout
    .filter((table) => {
      const area = String(table.area || "").toLocaleLowerCase("de");
      return !["T101", "T102", "T103", "T104"].includes(String(table.id || ""))
        && !area.includes("billard");
    })
    .map((table) => {
      const area = String(table.area || "").toLocaleLowerCase("de");
      const legacyDjY = { T30: 19.5, T31: 27.5, T32: 35.5, T33: 43.5 };
      if (Object.prototype.hasOwnProperty.call(legacyDjY, table.id)
        && Math.abs(Number(table.x) - 41.5) < 0.2
        && Math.abs(Number(table.y) - legacyDjY[table.id]) < 0.2) {
        return { ...table, y: legacyDjY[table.id] + 4 };
      }
      const isLegacyNzBig = area.match(/nebenraum (?:groß|gross)/)
        && (Number(table.y) < 8 || Number(table.w) > 8 || Number(table.x) > 83);
      const isLegacyHut = area.includes("hütte")
        && (Number(table.y) < 50 || Number(table.w) > 8 || Number(table.x) > 98);
      if (isLegacyNzBig) {
        const index = Math.max(0, nzBigIds.indexOf(table.id));
        return {
          ...table,
          x: 58 + ((index % 5) * 7.7),
          y: 10 + (Math.floor(index / 5) * 9),
          w: 6.6,
          h: 6.2,
          shape: "table"
        };
      }
      if (isLegacyHut) {
        const index = Math.max(0, hutIds.indexOf(table.id));
        return {
          ...table,
          x: 58 + ((index % 5) * 7.7),
          y: 57 + (Math.floor(index / 5) * 9),
          w: 6.6,
          h: 6.2,
          shape: "table"
        };
      }
      return table;
    })
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
    .map((zone) => {
      const merged = { ...zone, ...(zoneOverrides[zone.id] || {}) };
      if (zone.id === "nz-big" && (Number(merged.w) <= 28 || Number(merged.h) < 40)) {
        return { ...merged, x: 55, y: 3, w: 43, h: 42 };
      }
      if (zone.id === "hut" && (Number(merged.w) <= 20 || Number(merged.y) < 45 || Number(merged.h) < 40)) {
        return { ...merged, x: 55, y: 50, w: 43, h: 45 };
      }
      if (zone.id === "dj" && (Number(merged.y) < 19.5 || Number(merged.w) < 14 || Number(merged.h) < 37)) {
        return { ...merged, x: 39.5, y: 19.5, w: 14, h: 37 };
      }
      if (zone.id === "main-bottom" && (Number(merged.w) < 24 || Number(merged.h) < 24)) {
        return { ...merged, x: 17, y: 53, w: 24, h: 24 };
      }
      return merged;
    })
    .filter((zone) => zone.id !== "billiard")
    .filter((zone) => includeHidden || zone.visible !== false);
}

function terminalTableZoneClassNames(zone = {}) {
  return [zone.className || "", `is-zone-${zone.id || "area"}`].filter(Boolean).join(" ");
}

function terminalTableZoneArchitectureHtml(zone = {}) {
  if (zone.id === "nz-big") {
    return `
      ${zone.hideArchitectureName ? "" : `<span class="table-plan-zone-name">${escapeHtml(zone.label || "NZ groß")}</span>`}
      <span class="table-plan-zone-window" aria-hidden="true">Fenster</span>
      <span class="table-plan-zone-door" aria-hidden="true">Tür</span>
    `;
  }
  if (zone.id === "hut") {
    return `
      ${zone.hideArchitectureName ? "" : `<span class="table-plan-zone-name">${escapeHtml(zone.label || "Hütte")}</span>`}
      <span class="table-plan-zone-door" aria-hidden="true">Tür</span>
    `;
  }
  return zone.hideArchitectureName ? "" : `<span class="table-plan-zone-name">${escapeHtml(zone.label || "Bereich")}</span>`;
}

function terminalTableIsLane(table = {}) {
  const id = String(table.id || "").trim();
  const area = String(table.area || "").trim().toLocaleLowerCase("de");
  return /^(?:[1-9]|1[0-4])$/.test(id) || area.includes("bahn");
}

function terminalPlanVisibleTables(config = state.terminalTableConfig) {
  return terminalVisibleTableLayout(config).filter((table) => !terminalTableIsLane(table));
}

function terminalPlanVisibleZones(config = state.terminalTableConfig) {
  return terminalVisibleZones(config).filter((zone) => zone.className !== "is-lanes" && zone.id !== "lanes");
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
  if (String(presetId || "").trim() === "nz-gross") {
    return terminalNzBigTables().map((table) => table.id);
  }
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

function beginTerminalTablePlanInteraction(event, tableValue = "", mode = "move") {
  if (state.terminalTableView !== "manage" || state.terminalReport?.closed) return;
  const tableIds = terminalTableIdsFromValue(tableValue);
  const tables = tableIds.map((id) => terminalTableDef(id)).filter(Boolean);
  const canvas = $("#tablePlanBoard .table-plan-canvas");
  if (!tables.length || !canvas) return;
  const canvasRect = canvas.getBoundingClientRect();
  state.terminalTablePlanInteraction = {
    tableIds,
    mode: mode === "resize" ? "resize" : "move",
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    canvasWidth: Math.max(1, canvasRect.width || 1),
    canvasHeight: Math.max(1, canvasRect.height || 1),
    origins: Object.fromEntries(tables.map((table) => [table.id, {
      x: Number(table.x || 0),
      y: Number(table.y || 0),
      w: Number(table.w || 6),
      h: Number(table.h || 6)
    }])),
    moved: false
  };
  event.currentTarget?.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function updateTerminalTablePlanInteraction(event) {
  const interaction = state.terminalTablePlanInteraction;
  if (!interaction || interaction.pointerId !== event.pointerId) return;
  const deltaX = ((event.clientX - interaction.startClientX) / interaction.canvasWidth) * 100;
  const deltaY = ((event.clientY - interaction.startClientY) / interaction.canvasHeight) * 100;
  if (!interaction.moved && (Math.abs(event.clientX - interaction.startClientX) > 3 || Math.abs(event.clientY - interaction.startClientY) > 3)) {
    interaction.moved = true;
  }
  if (!interaction.moved) return;
  interaction.tableIds.forEach((tableId) => {
    const origin = interaction.origins[tableId];
    if (!origin) return;
    const resizing = interaction.mode === "resize";
    const w = resizing
      ? Math.min(cleanTerminalPercent(origin.w + deltaX, 3.8, 40), Math.max(3.8, 98 - origin.x))
      : origin.w;
    const h = resizing
      ? Math.min(cleanTerminalPercent(origin.h + deltaY, 4.8, 30), Math.max(4.8, 98 - origin.y))
      : origin.h;
    const x = resizing ? origin.x : Math.min(cleanTerminalPercent(origin.x + deltaX, 0, 98), Math.max(0, 98 - origin.w));
    const y = resizing ? origin.y : Math.min(cleanTerminalPercent(origin.y + deltaY, 0, 98), Math.max(0, 98 - origin.h));
    const customIndex = (state.terminalTableConfig?.customTables || []).findIndex((table) => table.id === tableId);
    if (customIndex >= 0) {
      state.terminalTableConfig.customTables[customIndex] = {
        ...state.terminalTableConfig.customTables[customIndex],
        x,
        y,
        w,
        h
      };
    } else {
      state.terminalTableConfig.tableOverrides ||= {};
      state.terminalTableConfig.tableOverrides[tableId] = {
        ...(terminalTableDef(tableId) || {}),
        ...(state.terminalTableConfig.tableOverrides[tableId] || {}),
        x,
        y,
        w,
        h
      };
    }
  });
  renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
}

async function endTerminalTablePlanInteraction(event) {
  const interaction = state.terminalTablePlanInteraction;
  if (!interaction || interaction.pointerId !== event.pointerId) return;
  state.terminalTablePlanInteraction = null;
  if (!interaction.moved) return;
  state.terminalTablePlanSuppressClickUntil = Date.now() + 300;
  const tables = interaction.tableIds.map((tableId) => terminalTableDef(tableId)).filter(Boolean);
  if (!tables.length) return;
  try {
    for (const table of tables) {
      await terminalAction({
        action: "save-table-config",
        tableId: table.id,
        seats: Number(table.seats || terminalTableSeats(table.id) || 4),
        x: table.x,
        y: table.y,
        w: table.w,
        h: table.h,
        label: table.label,
        area: table.area,
        shape: table.shape
      });
    }
    const actionText = interaction.mode === "resize" ? "Größe gespeichert" : "Position gespeichert";
    showToast(tables.length > 1 ? `${actionText}: Tafel.` : `${actionText}: ${tables[0].label || tables[0].id}.`);
  } catch (error) {
    showError(error);
    await terminalAction({ action: "load" }).catch(() => {});
  }
}

async function rotateTerminalTable(tableId) {
  const table = terminalTableDef(tableId);
  if (!table || state.terminalReport?.closed) return;
  const next = {
    ...table,
    w: Math.max(3.8, Number(table.h || 6)),
    h: Math.max(3.8, Number(table.w || 6))
  };
  const customIndex = (state.terminalTableConfig?.customTables || []).findIndex((item) => item.id === table.id);
  if (customIndex >= 0) {
    state.terminalTableConfig.customTables[customIndex] = { ...state.terminalTableConfig.customTables[customIndex], w: next.w, h: next.h };
  } else {
    state.terminalTableConfig.tableOverrides ||= {};
    state.terminalTableConfig.tableOverrides[table.id] = {
      ...table,
      ...(state.terminalTableConfig.tableOverrides[table.id] || {}),
      w: next.w,
      h: next.h
    };
  }
  renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
  try {
    await terminalAction({
      action: "save-table-config",
      tableId: table.id,
      seats: Number(table.seats || terminalTableSeats(table.id) || 4),
      x: table.x,
      y: table.y,
      w: next.w,
      h: next.h,
      label: table.label,
      area: table.area,
      shape: table.shape
    });
    showToast(`${table.label || table.id} gedreht.`);
  } catch (error) {
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
        <button class="table-plan-zone admin-table-plan-zone ${escapeHtml(terminalTableZoneClassNames(zone))} ${selectedZoneId === zone.id ? "is-selected" : ""} ${zone.visible === false ? "is-hidden" : ""}" type="button" data-admin-zone-select="${escapeHtml(zone.id)}" style="left:${zone.x}%;top:${zone.y}%;width:${zone.w}%;height:${zone.h}%;">
          <span class="admin-table-plan-inline-edit" data-admin-inline-edit="1" data-admin-zone-quick="label" data-admin-zone-id="${escapeHtml(zone.id)}" title="Bereichsname ändern">${escapeHtml(zone.label)}</span>
          ${terminalTableZoneArchitectureHtml({ ...zone, hideArchitectureName: true })}
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
    timeEnd: reservation.timeEnd || "",
    name: reservation.name || "",
    people: reservation.people ? String(reservation.people) : "",
    marker: reservation.marker || "normal",
    status: reservation.status || "reserved",
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
    timeEnd: String(value.timeEnd || "").trim().slice(0, 5),
    name: String(value.name || "").trim().slice(0, 160),
    people: cleanTerminalTablePeople(value.people),
    marker: cleanTerminalTableMarker(value.marker),
    status: cleanTerminalTableReservationStatus(value.status),
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

function cleanTerminalTableReservationStatus(value) {
  const status = String(value || "").trim().toLowerCase();
  return ["reserved", "arrived", "blocked"].includes(status) ? status : "reserved";
}

function terminalTableReservationStatusLabel(value) {
  const status = cleanTerminalTableReservationStatus(value);
  if (status === "arrived") return "Abgerufen";
  if (status === "blocked") return "Gesperrt";
  return "Reserviert";
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

function terminalTableQuickMarkerOptionsHtml(selected = "normal") {
  return ["normal", "birthday", "setup"].map((id) => {
    const item = TERMINAL_TABLE_MARKERS[id];
    return `<option value="${escapeHtml(id)}"${id === cleanTerminalTableMarker(selected) ? " selected" : ""}>${escapeHtml(item.label)}</option>`;
  }).join("");
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
  const table = terminalTableLookup()[cleanTerminalTableId(id)] || terminalTableDef(id);
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
  state.terminalTableQuickEntry = false;
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
  if (previousDraft.id && tableIds.some((tableId) => previousDraft.tableIds.includes(tableId))) {
    state.terminalTableDraft = emptyTerminalTableDraft();
    syncTerminalTableGroupDraftSelection([]);
    return;
  }
  const booked = state.terminalTableConnectMode ? [] : sortTerminalTableReservations(
    terminalTableReservations().filter((reservation) => reservation.tableIds.some((tableId) => tableIds.includes(tableId))),
    "time"
  );
  if (booked.length) {
    state.terminalTableDraft = emptyTerminalTableDraft(booked[0]);
    state.terminalTableQuickEntry = false;
    syncTerminalTableGroupDraftSelection(booked[0].tableIds);
    return;
  }
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
  state.terminalTableQuickEntry = !state.terminalTableDraft.id && Boolean(nextIds.length);
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
  state.terminalTableQuickEntry = false;
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
  return "Mindestens 2 Tische auswählen";
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
            <strong>${escapeHtml(terminalTableTimeRange(reservation))} · ${escapeHtml(reservation.name || "Reservierung")}</strong>
            <span>${escapeHtml(String(reservation.people || 0))} Personen · ${escapeHtml(terminalTableLabelText(reservation.tableIds))} · ${escapeHtml(terminalTableReservationStatusLabel(reservation.status))}</span>
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

function terminalTableTimeRange(reservation = {}) {
  const start = reservation.time || "--:--";
  return reservation.timeEnd ? `${start}–${reservation.timeEnd}` : start;
}

function terminalTableOverviewReservation(draft = {}, reservations = []) {
  if (draft.id) {
    const exact = reservations.find((reservation) => reservation.id === draft.id);
    if (exact) return exact;
  }
  return terminalTableSelectedReservations(draft, reservations)[0] || null;
}

function terminalTableSelectedDetailHtml(draft = {}, reservations = []) {
  const reservation = terminalTableOverviewReservation(draft, reservations);
  if (!reservation) {
    if (draft.tableIds?.length || state.terminalTableQuickEntry) {
      return `
        <form class="table-plan-quick-form" data-table-plan-quick-form>
          <div class="table-plan-quick-tables">
            <span>Ausgewählte Tische</span>
            <strong>${draft.tableIds?.length ? escapeHtml(terminalTableLabelText(draft.tableIds)) : "Tisch im Plan auswählen"}</strong>
            <small>${draft.tableIds?.length ? `${escapeHtml(String(terminalTableSeatCount(draft.tableIds) || 0))} Plätze` : "Danach Uhrzeit und Name eintragen"}</small>
          </div>
          <div class="table-plan-quick-grid">
            <label>Von<input data-table-plan-field="time" type="time" value="${escapeHtml(draft.time || "")}"></label>
            <label>Bis<input data-table-plan-field="timeEnd" type="time" value="${escapeHtml(draft.timeEnd || "")}"></label>
            <label class="is-wide">Name<input data-table-plan-field="name" value="${escapeHtml(draft.name || "")}" placeholder="Name / Anlass"></label>
            <label>Personen<input data-table-plan-field="people" type="number" min="1" step="1" value="${escapeHtml(draft.people || "")}" placeholder="0"></label>
            <label>Typ<select data-table-plan-field="marker">${terminalTableQuickMarkerOptionsHtml(draft.marker || "normal")}</select></label>
          </div>
          <div class="table-plan-quick-actions">
            <button class="secondary" type="button" data-table-plan-quick-cancel>Abbrechen</button>
            <button class="primary" type="button" id="saveQuickTableReservation">Speichern</button>
          </div>
        </form>
      `;
    }
    return "";
  }
  const status = cleanTerminalTableReservationStatus(reservation.status);
  return `
    <article class="table-plan-reservation-detail is-${escapeHtml(status)}">
      <div class="table-plan-reservation-detail-head">
        <div>
          <span>${escapeHtml(terminalTableTimeRange(reservation))}</span>
          <h5>${escapeHtml(reservation.name || "Reservierung")}</h5>
        </div>
        <div class="table-plan-detail-badges">
          <span class="table-plan-status-chip is-${escapeHtml(status)}">${escapeHtml(terminalTableReservationStatusLabel(status))}</span>
          ${reservation.marker === "birthday" ? `<span class="table-plan-status-chip is-birthday">Kindergeburtstag</span>` : ""}
        </div>
      </div>
      <dl>
        <div><dt>Personen</dt><dd>${escapeHtml(String(reservation.people || 0))}</dd></div>
        <div><dt>Tisch</dt><dd>${escapeHtml(terminalTableLabelText(reservation.tableIds))}</dd></div>
        <div><dt>Bereich</dt><dd>${escapeHtml(terminalTableAreaText(reservation.tableIds))}</dd></div>
        <div><dt>Typ</dt><dd>${escapeHtml(terminalTableMarkerConfig(reservation.marker).label)}</dd></div>
      </dl>
      ${reservation.note ? `<p>${escapeHtml(reservation.note)}</p>` : ""}
      <div class="table-plan-detail-actions">
        <button class="secondary" type="button" data-table-plan-edit-manage="${escapeHtml(reservation.id)}">Bearbeiten</button>
        <button class="primary" type="button" data-table-plan-status-action="${status === "arrived" ? "reserved" : "arrived"}">${status === "arrived" ? "Zurück auf reserviert" : "Abrufen / Kunde ist da"}</button>
        <button class="secondary" type="button" data-table-plan-print-detail>Drucken</button>
        <button class="secondary danger-lite" type="button" data-table-plan-delete-detail>Löschen</button>
      </div>
    </article>
  `;
}

function terminalTableReservationOverviewHtml(reservations = []) {
  if (!reservations.length) {
    return `<div class="table-plan-empty-state"><strong>Keine Reservierungen</strong><span>Der Plan ist für diesen Tag frei.</span></div>`;
  }
  return `
    <div class="table-plan-overview-list">
      ${sortTerminalTableReservations(reservations, "time").map((reservation) => {
        const status = cleanTerminalTableReservationStatus(reservation.status);
        const statusLabel = status === "arrived" ? "Besetzt" : terminalTableReservationStatusLabel(status);
        return `
        <button class="table-plan-overview-row ${state.terminalTableDraft?.id === reservation.id ? "is-active" : ""}" type="button" data-table-plan-edit="${escapeHtml(reservation.id)}">
          <span class="table-plan-overview-row-head">
            <strong><i class="table-plan-status-dot is-${escapeHtml(status)}" aria-hidden="true"></i>${escapeHtml(terminalTableLabelText(reservation.tableIds))}</strong>
            <em>${escapeHtml(statusLabel)}</em>
          </span>
          <span class="table-plan-row-main">
            <strong>${escapeHtml(reservation.name || "Reservierung")}</strong>
            <small>${escapeHtml(terminalTableTimeRange(reservation))}${reservation.people ? ` · ${escapeHtml(String(reservation.people))} Pers.` : ""}</small>
          </span>
        </button>
      `;
      }).join("")}
    </div>
  `;
}

function terminalTableServiceOverviewHtml(assignments = [], employeeMeta = new Map()) {
  if (!assignments.length) {
    return `<div class="table-plan-empty-state"><strong>Noch nicht zugewiesen</strong><span>Servicebereiche in „Verwalten“ festlegen.</span></div>`;
  }
  return `
    <div class="table-plan-service-list">
      ${assignments.map((assignment) => {
        const preset = terminalTableStaffPreset(assignment.presetId);
        const meta = employeeMeta.get(assignment.employee) || {};
        return `
          <article style="--staff-color:${escapeHtml(assignment.color)};">
            <i aria-hidden="true"></i>
            <div>
              <strong>${escapeHtml(assignment.employee)}</strong>
              <span>${escapeHtml(preset?.label || assignment.presetId)}${meta.time?.from ? ` · ab ${escapeHtml(meta.time.from)}` : ""}</span>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function terminalTableStatusLegendHtml() {
  return `
    <div class="table-plan-status-legend">
      <span><i class="is-free"></i>Frei</span>
      <span><i class="is-reserved"></i>Reserviert</span>
      <span><i class="is-arrived"></i>Besetzt</span>
    </div>
  `;
}

function terminalNzBigTables() {
  return terminalVisibleTableLayout()
    .filter((table) => {
      const area = String(table.area || "").trim().toLocaleLowerCase("de");
      const label = String(table.label || "").trim().toUpperCase();
      return table.id === "T60"
        || /^T6[1-9]$/.test(table.id)
        || /^T6[1-9]$/.test(label)
        || /^T60-K/i.test(table.id)
        || area.includes("nebenraum groß")
        || area.includes("nebenraum gross");
    })
    .sort((left, right) => String(left.label || left.id).localeCompare(String(right.label || right.id), "de", { numeric: true }));
}

function terminalTableNzBigListHtml(tables = [], reportClosed = false) {
  return `
    <div class="table-plan-nz-chips">
      ${tables.map((table) => `
        <span>
          <strong>${escapeHtml(table.label || table.id)}</strong>
          <small>${escapeHtml(String(terminalTableSeats(table.id) || table.seats || 0))} P</small>
          ${table.id === "T60" ? "" : `<button type="button" data-remove-nz-big-table="${escapeHtml(table.id)}" aria-label="${escapeHtml(table.label || table.id)} entfernen"${reportClosed ? " disabled" : ""}>×</button>`}
        </span>
      `).join("")}
    </div>
  `;
}

function terminalHutTables() {
  return terminalVisibleTableLayout()
    .filter((table) => {
      const area = String(table.area || "").trim().toLocaleLowerCase("de");
      const label = String(table.label || "").trim().toUpperCase();
      return table.id === "T70"
        || /^T7[1-9]$/.test(table.id)
        || /^T7[1-9]$/.test(label)
        || /^T70-K/i.test(table.id)
        || area.includes("hütte")
        || area.includes("huette");
    })
    .sort((left, right) => String(left.label || left.id).localeCompare(String(right.label || right.id), "de", { numeric: true }));
}

function terminalTableHutListHtml(tables = [], reportClosed = false) {
  return `
    <div class="table-plan-nz-chips">
      ${tables.map((table) => `
        <span>
          <strong>${escapeHtml(table.label || table.id)}</strong>
          <small>${escapeHtml(String(terminalTableSeats(table.id) || table.seats || 0))} P</small>
          ${table.id === "T70" ? "" : `<button type="button" data-remove-hut-table="${escapeHtml(table.id)}" aria-label="${escapeHtml(table.label || table.id)} entfernen"${reportClosed ? " disabled" : ""}>×</button>`}
        </span>
      `).join("")}
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
  if (!terminalTableSelectionCanConnect(ids)) return "";
  const rect = terminalTableGroupRect({ tableIds: ids });
  if (!rect) return "";
  return `
    <div class="table-plan-group-draft-overlay" style="left:${rect.left}%;top:${rect.top}%;width:${rect.width}%;height:${rect.height}%;">
      <strong>Neue Tafel</strong>
      <span>${escapeHtml(terminalTableLabels(ids).join(" + "))}</span>
    </div>
  `;
}

function renderTerminalSavedGroupOverlays(groups = []) {
  const canvas = $("#tablePlanBoard .table-plan-canvas");
  if (!canvas) return;
  canvas.querySelectorAll(".table-plan-saved-group-overlay").forEach((item) => item.remove());
  const canvasRect = canvas.getBoundingClientRect();
  if (!canvasRect.width || !canvasRect.height) return;
  groups.forEach((group) => {
    const tables = [...canvas.querySelectorAll("[data-table-plan-group]")]
      .filter((table) => table.dataset.tablePlanGroup === group.id);
    if (tables.length < 2) return;
    const rects = tables.map((table) => table.getBoundingClientRect());
    const padding = 7;
    const left = Math.max(0, Math.min(...rects.map((rect) => rect.left)) - canvasRect.left - padding);
    const top = Math.max(0, Math.min(...rects.map((rect) => rect.top)) - canvasRect.top - padding);
    const right = Math.min(canvasRect.width, Math.max(...rects.map((rect) => rect.right)) - canvasRect.left + padding);
    const bottom = Math.min(canvasRect.height, Math.max(...rects.map((rect) => rect.bottom)) - canvasRect.top + padding);
    const overlay = document.createElement("div");
    overlay.className = "table-plan-saved-group-overlay";
    overlay.style.left = `${(left / canvasRect.width) * 100}%`;
    overlay.style.top = `${(top / canvasRect.height) * 100}%`;
    overlay.style.width = `${((right - left) / canvasRect.width) * 100}%`;
    overlay.style.height = `${((bottom - top) / canvasRect.height) * 100}%`;
    overlay.innerHTML = `<strong>${escapeHtml(group.label || terminalTableSuggestedGroupLabel(group.tableIds))}</strong>`;
    canvas.append(overlay);
  });
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
  if (shell) {
    shell.classList.toggle("is-work-view", state.terminalTableView === "work");
    shell.classList.toggle("is-manage-view", state.terminalTableView === "manage");
  }
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
        <small>Personalbereiche</small>
        <strong>${staffAssignments.length}</strong>
      </article>
      <article>
        <small>Freie Tische</small>
        <strong>${Math.max(0, terminalPlanVisibleTables().length - new Set(reservations.flatMap((item) => item.tableIds).filter((id) => !terminalTableIsLane(terminalTableDef(id)))).size)}</strong>
      </article>
      <article>
        <small>Status</small>
        <strong>${reportClosed ? "Abgeschlossen" : "Offen"}</strong>
      </article>
    `;
  }
  const board = $("#tablePlanBoard");
  if (board) {
    board.innerHTML = terminalTableBoardHtml(reservations, groups, draft, staffAssignments, employeeMeta);
    window.requestAnimationFrame(() => renderTerminalSavedGroupOverlays(groups));
  }
  const overviewReservation = $("#tablePlanReservationOverview");
  if (overviewReservation) overviewReservation.innerHTML = terminalTableReservationOverviewHtml(reservations);
  const manageReservationList = $("#tablePlanManageReservationList");
  if (manageReservationList) manageReservationList.innerHTML = terminalTableReservationOverviewHtml(reservations);
  if ($("#tablePlanReservationCount")) $("#tablePlanReservationCount").textContent = String(reservations.length);
  const selectedDetail = $("#tablePlanSelectedDetail");
  if (selectedDetail) selectedDetail.innerHTML = terminalTableSelectedDetailHtml(draft, reservations);
  const selectedCard = $(".table-plan-selected-card");
  const hasReservationSelection = Boolean(terminalTableOverviewReservation(draft, reservations));
  const hasQuickSelection = !hasReservationSelection && (Boolean(draft.tableIds.length) || state.terminalTableQuickEntry);
  if (selectedCard) selectedCard.classList.toggle("hidden", !hasReservationSelection && !hasQuickSelection);
  if ($("#tablePlanSelectedKicker")) $("#tablePlanSelectedKicker").textContent = hasQuickSelection ? "Schnell-Erfassung" : "Auswahl";
  if ($("#tablePlanSelectedTitle")) $("#tablePlanSelectedTitle").textContent = hasQuickSelection ? "Neue Reservierung" : "Ausgewählte Reservierung";
  const serviceOverview = $("#tablePlanServiceOverview");
  if (serviceOverview) serviceOverview.innerHTML = terminalTableServiceOverviewHtml(staffAssignments, employeeMeta);
  const statusLegend = $("#tablePlanStatusLegend");
  if (statusLegend) statusLegend.innerHTML = terminalTableStatusLegendHtml();
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
  if (reservationPanel && state.terminalTableView === "manage" && (draft.tableIds.length || draft.id)) reservationPanel.open = true;
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
  if ($("#tablePlanTimeEnd")) $("#tablePlanTimeEnd").value = draft.timeEnd || "";
  if ($("#tablePlanName")) $("#tablePlanName").value = draft.name || "";
  if ($("#tablePlanPeople")) $("#tablePlanPeople").value = draft.people || "";
  if ($("#tablePlanMarker")) $("#tablePlanMarker").innerHTML = terminalTableMarkerOptionsHtml(draft.marker || "normal");
  const statusDisplay = $("#tablePlanStatusDisplay");
  if (statusDisplay) {
    const currentStatus = cleanTerminalTableReservationStatus(draft.status);
    statusDisplay.textContent = terminalTableReservationStatusLabel(currentStatus);
    statusDisplay.className = `table-plan-status-chip is-${currentStatus}`;
  }
  if ($("#tablePlanNote")) $("#tablePlanNote").value = draft.note || "";
  if ($("#tablePlanReservationTitle")) $("#tablePlanReservationTitle").textContent = draft.id ? "Reservierung bearbeiten" : "Neue Reservierung";
  const markerLegend = $("#tablePlanMarkerLegend");
  if (markerLegend) markerLegend.innerHTML = terminalTableMarkerLegendHtml();
  if ($("#newTablePlanReservationForSelection")) $("#newTablePlanReservationForSelection").disabled = reportClosed || !draft.tableIds.length;
  if ($("#connectSelectedTables")) {
    $("#connectSelectedTables").disabled = reportClosed;
    $("#connectSelectedTables").textContent = selectedGroup
      ? "Tafel anpassen"
      : state.terminalTableConnectMode && draft.tableIds.length < 2
        ? `Tische auswählen (${draft.tableIds.length}/2)`
        : draft.tableIds.length >= 2
          ? "Auswahl verbinden"
          : "Tafeln verbinden";
  }
  if ($("#connectTablesFromToolbar")) {
    $("#connectTablesFromToolbar").disabled = reportClosed;
    $("#connectTablesFromToolbar").textContent = selectedGroup
      ? "Tafel anpassen"
      : state.terminalTableConnectMode && draft.tableIds.length < 2
        ? `Tische auswählen (${draft.tableIds.length}/2)`
        : draft.tableIds.length >= 2
          ? "Auswahl verbinden"
          : "Tafeln verbinden";
  }
  if ($("#disconnectTablesFromToolbar")) {
    $("#disconnectTablesFromToolbar").classList.toggle("hidden", !selectedGroup);
    $("#disconnectTablesFromToolbar").disabled = reportClosed || !selectedGroup;
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
  const nzBigTables = terminalNzBigTables();
  if ($("#tablePlanNzBigSummary")) $("#tablePlanNzBigSummary").textContent = `${nzBigTables.length} Tisch${nzBigTables.length === 1 ? "" : "e"}`;
  if ($("#tablePlanNzBigCount")) $("#tablePlanNzBigCount").textContent = `${nzBigTables.length} Tisch${nzBigTables.length === 1 ? "" : "e"}`;
  if ($("#tablePlanNzBigList")) $("#tablePlanNzBigList").innerHTML = terminalTableNzBigListHtml(nzBigTables, reportClosed);
  if ($("#addNzBigTable")) $("#addNzBigTable").disabled = reportClosed || nzBigTables.length >= 10;
  const hutTables = terminalHutTables();
  if ($("#tablePlanHutSummary")) $("#tablePlanHutSummary").textContent = `${hutTables.length} Tisch${hutTables.length === 1 ? "" : "e"}`;
  if ($("#tablePlanHutCount")) $("#tablePlanHutCount").textContent = `${hutTables.length} Tisch${hutTables.length === 1 ? "" : "e"}`;
  if ($("#tablePlanHutList")) $("#tablePlanHutList").innerHTML = terminalTableHutListHtml(hutTables, reportClosed);
  if ($("#addHutTable")) $("#addHutTable").disabled = reportClosed || hutTables.length >= 10;
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
  const mergedGroups = groups;
  const groupedIds = terminalTableGroupedIds(mergedGroups);
  const visibleTables = terminalPlanVisibleTables();
  const visibleZones = terminalPlanVisibleZones();
  const workZoneLabels = {
    "nz-small": "NZ Klein",
    "main-left": "Innenraum",
    dj: "30er Reihe",
    "main-bottom": "DJ",
    "nz-big": "NZ Groß",
    hut: "Hütte"
  };
  return `
    <div class="table-plan-canvas">
      ${visibleZones.map((zone) => `
        <div class="table-plan-zone ${escapeHtml(terminalTableZoneClassNames(zone))}" data-zone-label="${escapeHtml(zone.label || "")}" style="left:${zone.x}%;top:${zone.y}%;width:${zone.w}%;height:${zone.h}%;">
          ${terminalTableZoneArchitectureHtml({ ...zone, label: workZoneLabels[zone.id] || zone.label })}
        </div>
      `).join("")}
      ${terminalTableDraftOverlayHtml(draft, groups)}
      ${terminalTableStaffOverlayHtml(staffAssignments, employeeMeta)}
      ${mergedGroups.map((group) => {
        const booked = reservations.filter((reservation) => reservation.tableIds.some((tableId) => group.tableIds.includes(tableId)));
        const primary = booked[0] || null;
        const status = primary ? cleanTerminalTableReservationStatus(primary.status) : "free";
        const staff = group.tableIds.flatMap((tableId) => staffByTable.get(tableId) || []);
        const staffAssignment = staff[0] || null;
        const reservationTheme = terminalTableReservationThemeStyle(booked[0]);
        const isSelected = group.tableIds.every((tableId) => selected.has(tableId));
        return sortTerminalTableIds(group.tableIds).map((tableId, index) => {
          const table = terminalTableLookup()[tableId] || terminalTableDef(tableId);
          if (!table) return "";
          const classes = [
            "table-plan-table",
            "is-linked-group",
            `is-${table.shape || "table"}`,
            booked.length ? "is-occupied" : "",
            booked.length ? "has-booking" : "",
            `is-status-${status}`,
            booked.some((reservation) => reservation.marker === "birthday") ? "has-birthday" : "",
            staffAssignment ? "has-staff-area" : "",
            isSelected ? "is-selected" : ""
          ].filter(Boolean).join(" ");
          const style = [`left:${table.x}%`, `top:${table.y}%`, `width:${table.w}%`, `height:${table.h}%`];
          if (reservationTheme) style.push(reservationTheme);
          if (staffAssignment) style.push(`--staff-color:${staffAssignment.color}`);
          return `
            <button class="${classes}" type="button" draggable="${state.terminalTableView === "work"}" data-table-plan-select="${escapeHtml(group.tableIds.join(","))}" data-table-plan-table="${escapeHtml(table.id)}" data-table-plan-group="${escapeHtml(group.id)}" style="${style.join(";")}">
              ${primary && index === 0 ? `<span class="table-plan-table-times">${escapeHtml(primary.time || "Zeit offen")}</span>` : ""}
              <div class="table-plan-table-head">
                <strong>${escapeHtml(table.label || table.id)}</strong>
                ${primary?.name && index === 0 ? `<small class="table-plan-table-name">${escapeHtml(primary.name)}</small>` : ""}
              </div>
              <span class="table-plan-table-badge is-group-label">${escapeHtml(group.label)}</span>
              ${booked.some((reservation) => reservation.marker === "birthday") && index === 0 ? `<span class="table-plan-table-badge is-birthday">Geburtstag</span>` : ""}
              ${booked.length > 1 && index === 0 ? `<span class="table-plan-table-badge is-count">+${booked.length - 1}</span>` : ""}
              ${staffAssignment && index === 0 ? `<span class="table-plan-table-badge is-service">${escapeHtml(staffAssignment.employee)}</span>` : ""}
            </button>
          `;
        }).join("");
      }).join("")}
      ${visibleTables.map((table) => {
        if (groupedIds.has(table.id)) return "";
        const currentTable = terminalTableDef(table.id);
        const booked = occupancy.get(table.id) || [];
        const primary = booked[0] || null;
        const status = primary ? cleanTerminalTableReservationStatus(primary.status) : "free";
        const staffAssignment = (staffByTable.get(table.id) || [])[0] || null;
        const reservationTheme = terminalTableReservationThemeStyle(booked[0]);
        const classes = [
          "table-plan-table",
          `is-${table.shape || "table"}`,
          booked.length ? "is-occupied" : "",
          booked.length ? "has-booking" : "",
          `is-status-${status}`,
          booked.some((reservation) => reservation.marker === "birthday") ? "has-birthday" : "",
          staffAssignment ? "has-staff-area" : "",
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
        if (staffAssignment) style.push(`--staff-color:${staffAssignment.color}`);
        return `
          <div class="${classes}" role="button" tabindex="0" draggable="${state.terminalTableView === "work"}" data-table-plan-select="${escapeHtml(table.id)}" data-table-plan-table="${escapeHtml(table.id)}" style="${style.join(";")}">
            ${primary ? `<span class="table-plan-table-times">${escapeHtml(primary.time || "Zeit offen")}</span>` : ""}
            <div class="table-plan-table-head">
              <strong>${escapeHtml(currentTable?.label || table.label)}</strong>
              ${primary?.name ? `<small class="table-plan-table-name">${escapeHtml(primary.name)}</small>` : ""}
              ${primary ? `<small class="table-plan-table-people">${escapeHtml(String(primary.people || 0))} Personen</small>` : ""}
            </div>
            ${booked.some((reservation) => reservation.marker === "birthday") ? `<span class="table-plan-table-badge is-birthday">K</span>` : ""}
            ${booked.length > 1 ? `<span class="table-plan-table-badge is-count">+${booked.length - 1}</span>` : ""}
            ${staffAssignment ? `<span class="table-plan-table-badge is-service">${escapeHtml(staffAssignment.employee.split(" ")[0])}</span>` : ""}
            ${state.terminalTableView === "manage" ? `
              <button class="table-plan-rotate-control" type="button" data-table-plan-rotate="${escapeHtml(table.id)}" title="Tisch drehen" aria-label="${escapeHtml(table.label)} drehen">↻</button>
              <span class="table-plan-resize-control" data-table-plan-resize="${escapeHtml(table.id)}" title="Größe ziehen" aria-hidden="true"></span>
            ` : ""}
          </div>
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

function startNewTerminalTableReservation({ keepSelection = true, openManage = false } = {}) {
  const current = normalizeTerminalTableDraft(state.terminalTableDraft || {});
  state.terminalTableDraft = normalizeTerminalTableDraft({
    tableIds: keepSelection ? current.tableIds : [],
    status: "reserved",
    marker: "normal"
  });
  state.terminalTableQuickEntry = !openManage;
  if (openManage) state.terminalTableView = "manage";
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
                <td>${escapeHtml(terminalTableTimeRange(reservation))}</td>
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
  const existingGroup = terminalTableGroupForTableIds(payload.tableIds);
  if (
    !payload.id
    && payload.tableIds.length >= 3
    && !existingGroup
    && terminalTableSelectionCanConnect(payload.tableIds)
    && window.confirm(`${payload.tableIds.length} benachbarte Tische sind ausgewählt. Zu einer gemeinsamen Tafel verbinden?`)
  ) {
    const suggestedLabel = terminalTableSuggestedGroupLabel(payload.tableIds);
    const label = window.prompt("Welche Tischnummer oder Bezeichnung soll die Tafel bekommen?", suggestedLabel);
    if (label == null) return;
    if (!String(label).trim()) {
      showToast("Bitte eine Tischnummer oder Bezeichnung für die Tafel eingeben.");
      return;
    }
    try {
      await terminalAction({
        action: "save-table-group",
        group: {
          tableIds: payload.tableIds,
          label: String(label).trim()
        }
      });
    } catch (error) {
      showError(error);
      return;
    }
  }
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    const result = await terminalAction({
      action: "save-table-reservation",
      reservation: payload
    });
    const saved = sortTerminalTableReservations(terminalTableReservations(), "time").find((reservation) => (
      reservation.id === payload.id
      || (
        reservation.time === payload.time
        && reservation.name === payload.name
        && terminalTableSetKey(reservation.tableIds) === terminalTableSetKey(payload.tableIds)
      )
    ));
    state.terminalTableDraft = saved ? emptyTerminalTableDraft(saved) : emptyTerminalTableDraft();
    state.terminalTableQuickEntry = false;
    state.terminalTableView = "work";
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
    state.terminalTableConnectMode = true;
    state.terminalTableDraft = normalizeTerminalTableDraft({ tableIds });
    syncTerminalTableGroupDraftSelection(tableIds);
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast("Verbindungsmodus aktiv: Bitte mindestens zwei Tische im Plan auswählen.");
    $("#tablePlanBoard")?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    state.terminalTableConnectMode = false;
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

async function addTerminalNzBigTable(button) {
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Fügt hinzu...";
  try {
    const result = await terminalAction({ action: "add-nz-big-table" });
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tisch hinzugefügt.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed) || terminalNzBigTables().length >= 10;
  }
}

async function removeTerminalNzBigTable(button, tableId) {
  const cleanId = cleanTerminalRawTableId(tableId);
  const table = terminalNzBigTables().find((item) => item.id === cleanId);
  if (!table) return;
  const activeReservation = terminalTableReservations().find((reservation) => reservation.tableIds.includes(cleanId));
  if (activeReservation) {
    showToast(`${table.label || cleanId} ist für ${activeReservation.name || "eine Reservierung"} belegt und kann nicht entfernt werden.`);
    return;
  }
  if (!confirm(`${table.label || cleanId} aus NZ groß entfernen?`)) return;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "…";
  try {
    const result = await terminalAction({ action: "remove-nz-big-table", tableId: cleanId });
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tisch entfernt.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
  }
}

async function addTerminalHutTable(button) {
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Fügt hinzu...";
  try {
    const result = await terminalAction({ action: "add-hut-table" });
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tisch hinzugefügt.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed) || terminalHutTables().length >= 10;
  }
}

async function removeTerminalHutTable(button, tableId) {
  const cleanId = cleanTerminalRawTableId(tableId);
  const table = terminalHutTables().find((item) => item.id === cleanId);
  if (!table) return;
  const activeReservation = terminalTableReservations().find((reservation) => reservation.tableIds.includes(cleanId));
  if (activeReservation) {
    showToast(`${table.label || cleanId} ist für ${activeReservation.name || "eine Reservierung"} belegt und kann nicht entfernt werden.`);
    return;
  }
  if (!confirm(`${table.label || cleanId} aus der Hütte entfernen?`)) return;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "…";
  try {
    const result = await terminalAction({ action: "remove-hut-table", tableId: cleanId });
    renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
    showToast(result.message || "Tisch entfernt.");
  } catch (error) {
    showError(error);
  } finally {
    button.textContent = oldText;
    button.disabled = Boolean(state.terminalReport?.closed);
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
    date,
    manualDate: true
  });
  showToast(`Tischplan für ${formatLongDate(date)} geladen.`);
}

function renderTerminalAssignments(dateKey) {
  const target = $("#terminalAssignmentList");
  if (!target) return;
  if (target.closest("#terminalTomorrowAssignmentsMount")) {
    target.innerHTML = terminalAssignmentDayHtml(assignmentDateKeys(dateKey)[1], 1);
    return;
  }
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
  const showForm = Boolean(state.terminalDayMetaEditing);
  $("#terminalDayHeadForm")?.classList.toggle("hidden", !showForm);
  const display = $("#terminalDayMetaDisplay");
  const opening = report.openingHours || openingHoursFor(dateKey) || "Öffnung offen";
  const leader = report.shiftLeader || "Nicht festgelegt";
  const day = new Date(`${dateKey}T12:00:00`);
  if ($("#terminalSidebarWeekday")) {
    $("#terminalSidebarWeekday").textContent = dateKey === todayKey()
      ? "Heute"
      : day.toLocaleDateString("de-DE", { weekday: "long" });
  }
  if ($("#terminalSidebarDate")) {
    $("#terminalSidebarDate").textContent = day.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }
  if ($("#terminalSidebarOpening")) $("#terminalSidebarOpening").textContent = opening;
  if (display) {
    display.classList.remove("hidden");
    display.innerHTML = `
      <button id="editTerminalDayMeta" class="terminal-shift-leader-card" type="button" ${reportClosed ? "disabled" : ""}>
        <span class="terminal-shift-leader-icon" aria-hidden="true">S</span>
        <span class="terminal-shift-leader-copy">
          <small>Schichtleitung</small>
          <strong>${escapeHtml(leader)}</strong>
        </span>
        <span class="terminal-shift-leader-arrow" aria-hidden="true">&gt;</span>
      </button>
      <button class="terminal-handover-button" data-open-handover-dashboard type="button" ${reportClosed ? "disabled" : ""}>
        <span class="terminal-shift-leader-icon" aria-hidden="true">&#8644;</span>
        <span class="terminal-shift-leader-copy">
          <small>Schichtwechsel</small>
          <strong>Übergabe</strong>
        </span>
      </button>
    `;
  }
  const summary = $("#terminalDayMetaSummary");
  if (summary) {
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

function renderTerminalOpenDays(dateKey) {
  const target = $("#terminalOpenDaysNav");
  if (!target) return;
  if (!state.terminalToken) {
    target.classList.add("hidden");
    target.innerHTML = "";
    return;
  }
  if (!state.terminalCorrectionMode) {
    target.classList.add("hidden");
    target.innerHTML = "";
    return;
  }
  if (state.terminalCorrectionMode) {
    target.classList.remove("hidden");
    target.innerHTML = `
      <div class="terminal-open-days-head">
        <strong>Offene Tage</strong>
        <p>Im Korrekturmodus ist das Datum fix. Für andere offene Tage bitte zuerst den Korrekturmodus schließen.</p>
      </div>
    `;
    return;
  }
  const today = todayKey();
  const dates = [...new Set((Array.isArray(state.terminalOpenDates) ? state.terminalOpenDates : []).filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) && value <= today))].sort((a, b) => b.localeCompare(a));
  target.classList.remove("hidden");
  target.innerHTML = `
    <details id="terminalOpenDaysDetails" class="terminal-open-days-details" ${state.terminalOpenDaysExpanded ? "open" : ""}>
      <summary class="terminal-open-days-summary">
        <div class="terminal-open-days-head">
          <strong>Offene Tage</strong>
          <p>${dates.length} ${dates.length === 1 ? "Tag ist noch offen" : "Tage sind noch offen"}</p>
        </div>
      </summary>
      <div class="terminal-open-days-controls">
        <div class="terminal-open-days-list">
          ${dates.map((item) => `
            <button
              class="secondary terminal-open-day-chip ${item === dateKey ? "active" : ""}"
              type="button"
              data-open-terminal-date="${escapeHtml(item)}"
            >${escapeHtml(formatDate(item))}</button>
          `).join("")}
        </div>
        <label class="terminal-open-day-manual">
          <span>Datum öffnen</span>
          <input id="terminalJumpDate" type="date" max="${today}" value="${dateKey}">
        </label>
        <button id="loadTerminalDate" class="secondary" type="button">Tag laden</button>
      </div>
      <p class="terminal-open-days-hint">Abgeschlossene Tage bleiben geschützt und laufen weiter über den Admin-Korrekturmodus.</p>
    </details>
  `;
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
  const section = $("#terminalLeaderMessageSection");
  const checked = new Set((report.terminalMessageChecks || []).map((item) => item.messageId));
  const messages = (state.terminalMessages || []).filter((message) => message && message.active !== false && !checked.has(message.id));
  section?.classList.toggle("hidden", terminalWorkspaceTab(state.terminalTab) !== "today");
  if (!messages.length) {
    target.innerHTML = `
      <div class="terminal-message-summary">
        <strong class="terminal-message-count is-empty">0 neu</strong>
      </div>
      <p class="terminal-empty-state">Keine Hinweise</p>
    `;
    return;
  }
  const visibleMessages = state.terminalMessagesExpanded ? messages : messages.slice(0, 2);
  target.innerHTML = `
    <div class="terminal-message-summary">
      <strong class="terminal-message-count">${messages.length} neu</strong>
    </div>
    ${visibleMessages.map((message) => `
      <article class="terminal-leader-message">
        <p>${escapeHtml(message.text)}</p>
        <div>
          <small>${message.createdAt ? escapeHtml(formatDateTime(message.createdAt)) : ""}</small>
          <button class="primary" data-confirm-terminal-message="${escapeHtml(message.id)}" type="button" ${reportClosed ? "disabled" : ""}>Quittieren</button>
        </div>
      </article>
    `).join("")}
    ${messages.length > 2 ? `<div class="terminal-message-toggle"><button class="secondary" type="button" data-terminal-toggle-messages="${state.terminalMessagesExpanded ? "compact" : "all"}">${state.terminalMessagesExpanded ? "Weniger" : "Nachrichten öffnen"}</button></div>` : ""}
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
  const defaults = ["Leicht, Kevin", "Eberhardt, Dennis", "Poschenrieder, Christian"];
  const marcZettler = employees.find((name) => /(?:marc.*zettler|zettler.*marc)/i.test(name)) || "Marc Zettler";
  return [...new Set([...(matches.length ? matches : defaults), marcZettler])];
}

function openTerminalHandoverModal() {
  $("#handoverModal")?.classList.remove("hidden");
  const time = $("#handoverTime");
  if (time && !time.value) {
    const now = new Date();
    time.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  }
}

function renderTerminalTasks(report, reportClosed) {
  const target = $("#terminalTaskList");
  if (!target) return;
  const done = report.taskCompletions || {};
  const tasks = sortTaskTemplates(state.terminalTasks || [])
    .filter((task) => (task.category || "running") === "running");
  target.innerHTML = tasks.length ? `
    <div class="terminal-task-direct-list">
      ${tasks.map((task) => {
        const isDone = Boolean(done[task.id]);
        return `
        <article class="terminal-task ${isDone ? "is-done" : "is-open"}">
          <label>
            <input type="checkbox" data-terminal-task="${escapeHtml(task.id)}" ${isDone ? "checked" : ""} ${reportClosed ? "disabled" : ""}>
            <span>
              <strong>${escapeHtml(task.title)}</strong>
              ${task.popupEnabled && task.popupTime ? `<small>Popup ${escapeHtml(task.popupTime)}</small>` : ""}
              ${task.note ? `<small>${escapeHtml(task.note)}</small>` : ""}
            </span>
            <small class="terminal-task-status">${isDone ? "Erledigt" : "Offen"}</small>
          </label>
        </article>
      `;
      }).join("")}
    </div>
  ` : `
    <div class="terminal-dashboard-empty terminal-task-empty">
      <span aria-hidden="true">&#10003;</span>
      <strong>Alles erledigt</strong>
      <small>Für heute sind keine offenen Aufgaben geplant.</small>
    </div>
  `;
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
  const controlCards = loadTerminalControls().filter((control) => control.active);
  const toiletControl = controlCards.find((control) => control.id === "control-toilets" || String(control.name || "").toLowerCase().includes("toilet"));
  const standardControls = controlCards.filter((control) => control !== toiletControl);
  const toiletStatus = terminalToiletControlStatus(report, toiletControl);
  target.innerHTML = `
    <div class="terminal-dashboard-control-list">
      ${toiletControl ? `
        <article class="terminal-toilet-control is-${escapeHtml(toiletStatus.status)}">
          <button class="terminal-toilet-control-icon" type="button" data-open-terminal-toilet-check aria-label="Toiletten-Kontrolle bestätigen">WC</button>
          <div class="terminal-toilet-control-main">
            <strong>Toiletten</strong>
            ${toiletStatus.statusLabel ? `<span class="terminal-toilet-control-status">${escapeHtml(toiletStatus.statusLabel)}</span>` : ""}
            ${toiletStatus.hasCheck ? `<span class="terminal-toilet-control-last">${escapeHtml(toiletStatus.lastLabel)}</span>` : ""}
            ${toiletStatus.status === "overdue" && toiletStatus.nextLabel ? `<small>${escapeHtml(toiletStatus.nextLabel)}</small>` : ""}
          </div>
        </article>
      ` : ""}
      <div class="terminal-standard-control-list">
      ${standardControls.map((control) => `
        <article class="terminal-dashboard-control-row is-${escapeHtml(control.status)}">
          <span class="terminal-dashboard-control-icon" aria-hidden="true">${escapeHtml(control.icon)}</span>
          <div>
            <strong>${escapeHtml(control.name)}</strong>
            <small>Letzte Kontrolle: ${escapeHtml(control.lastLabel)}</small>
          </div>
          <span class="terminal-control-status">${terminalControlStatusLabel(control.status)}</span>
          <button class="terminal-control-complete" type="button" data-complete-terminal-control="${escapeHtml(control.id)}" aria-label="${escapeHtml(control.name)} als erledigt markieren">✓</button>
        </article>
      `).join("")}
      </div>
    </div>
  `;
}

function terminalControlIntervalMinutes(control = {}) {
  const value = Math.max(1, Number(control.intervalValue || 1));
  if (control.intervalType === "hourly") return value * 60;
  if (control.intervalType === "daily") return value * 24 * 60;
  if (control.intervalType === "weekly") return value * 7 * 24 * 60;
  if (control.intervalType === "monthly") return value * 30 * 24 * 60;
  return value * 60;
}

function terminalToiletControlStatus(report = {}, control = {}) {
  const checks = (Array.isArray(report.toiletChecks) ? report.toiletChecks : [])
    .filter((item) => item?.checkedAt && !Number.isNaN(new Date(item.checkedAt).getTime()))
    .sort((left, right) => new Date(right.checkedAt) - new Date(left.checkedAt));
  const latest = checks[0];
  if (!latest) {
    const existingStatus = control?.status === "overdue" ? "overdue" : control?.status === "due" ? "due" : "unknown";
    return {
      status: existingStatus,
      hasCheck: false,
      statusLabel: existingStatus === "overdue" ? "Überfällig" : existingStatus === "due" ? "Fällig" : "",
      lastLabel: "Keine Kontrolle dokumentiert",
      nextLabel: existingStatus === "overdue" ? "Kontrolle überfällig" : "Kontrolle offen"
    };
  }
  const checkedAt = new Date(latest.checkedAt);
  const lastTime = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" }).format(checkedAt);
  if ((state.terminalDate || todayKey()) !== todayKey()) {
    return {
      status: "ok",
      hasCheck: true,
      statusLabel: "Dokumentiert",
      lastLabel: `Letzte Kontrolle: ${lastTime} Uhr`,
      nextLabel: "Tageskontrolle erfasst"
    };
  }
  const intervalMinutes = terminalControlIntervalMinutes(control);
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - checkedAt.getTime()) / 60000));
  if (elapsedMinutes >= intervalMinutes) {
    return {
      status: "overdue",
      hasCheck: true,
      statusLabel: "Überfällig",
      lastLabel: `Letzte Kontrolle: ${lastTime} Uhr`,
      nextLabel: `Seit ${elapsedMinutes - intervalMinutes} Min. überfällig`
    };
  }
  const remaining = intervalMinutes - elapsedMinutes;
  return {
    status: remaining <= 10 ? "due" : "ok",
    hasCheck: true,
    statusLabel: remaining <= 10 ? "Bald fällig" : "In Ordnung",
    lastLabel: `Letzte Kontrolle: ${lastTime} Uhr`,
    nextLabel: `Nächste Kontrolle in ${remaining} Min.`
  };
}

function openTerminalToiletConfirm() {
  const modal = $("#terminalToiletConfirm");
  if (!modal) return;
  state.terminalManualToiletCheckKey = `${state.terminalDate || todayKey()}-toilet-manual-${Date.now()}`;
  modal.classList.remove("hidden");
  $("#confirmTerminalToiletCheck")?.focus();
}

function closeTerminalToiletConfirm() {
  $("#terminalToiletConfirm")?.classList.add("hidden");
  state.terminalManualToiletCheckKey = "";
}

function terminalControlStatusLabel(status) {
  return status === "ok" ? "In Ordnung" : status === "overdue" ? "Überfällig" : "Fällig";
}

function terminalControlIntervalLabel(control) {
  const value = Number(control.intervalValue || 1);
  const labels = {
    once: "Einmalig",
    hourly: value === 1 ? "Stündlich" : `Alle ${value} Stunden`,
    daily: value === 1 ? "Täglich" : `Alle ${value} Tage`,
    weekly: value === 1 ? "Wöchentlich" : `Alle ${value} Wochen`,
    monthly: value === 1 ? "Monatlich" : `Alle ${value} Monate`
  };
  return labels[control.intervalType] || "Täglich";
}

function renderTerminalControlManagement() {
  const target = $("#terminalControlManagementList");
  if (!target) return;
  const controls = loadTerminalControls();
  target.innerHTML = controls.map((control) => `
    <article class="terminal-control-admin-row ${control.active ? "" : "is-inactive"}">
      <span class="terminal-control-admin-icon" aria-hidden="true">${escapeHtml(control.icon)}</span>
      <div class="terminal-control-admin-main">
        <strong>${escapeHtml(control.name)}</strong>
        <small>${escapeHtml(control.area || "Ohne Bereich")} · ${escapeHtml(terminalControlIntervalLabel(control))}${control.startTime ? ` · ab ${escapeHtml(control.startTime)}` : ""}</small>
        <small>Letzte: ${escapeHtml(control.lastLabel)} · Nächste: ${escapeHtml(control.nextLabel)}</small>
      </div>
      <span class="terminal-control-status is-${escapeHtml(control.status)}">${control.active ? terminalControlStatusLabel(control.status) : "Inaktiv"}</span>
      <span class="terminal-control-responsible">${escapeHtml(control.responsible || "Offen")}</span>
      <div class="terminal-control-admin-actions">
        <button class="secondary" type="button" data-toggle-terminal-control="${escapeHtml(control.id)}">${control.active ? "Deaktivieren" : "Aktivieren"}</button>
        <button class="secondary" type="button" data-edit-terminal-control="${escapeHtml(control.id)}">Bearbeiten</button>
        <button class="secondary danger-button" type="button" data-delete-terminal-control="${escapeHtml(control.id)}">Löschen</button>
      </div>
    </article>
  `).join("") || `<p class="hint">Noch keine Kontrollen angelegt.</p>`;
}

function openTerminalControlForm(control = null) {
  const normalized = control ? normalizeTerminalControl(control) : normalizeTerminalControl({
    id: "",
    name: "",
    icon: "✓",
    intervalType: "daily",
    intervalValue: 1,
    active: true,
    status: "due"
  });
  state.terminalControlDraftId = control?.id || "";
  $("#terminalControlId").value = control?.id || "";
  $("#terminalControlName").value = control?.name || "";
  $("#terminalControlIcon").value = normalized.icon;
  $("#terminalControlArea").value = normalized.area;
  $("#terminalControlIntervalType").value = normalized.intervalType;
  $("#terminalControlIntervalValue").value = normalized.intervalValue;
  $("#terminalControlStartTime").value = normalized.startTime;
  $("#terminalControlResponsible").value = normalized.responsible;
  $("#terminalControlStatus").value = normalized.status;
  $("#terminalControlActive").checked = normalized.active;
  $("#terminalControlForm")?.classList.remove("hidden");
  $("#terminalControlName")?.focus();
}

function closeTerminalControlForm() {
  state.terminalControlDraftId = "";
  $("#terminalControlForm")?.classList.add("hidden");
  $("#terminalControlForm")?.reset();
}

function collectTerminalControlForm() {
  const existing = loadTerminalControls().find((control) => control.id === state.terminalControlDraftId) || {};
  return normalizeTerminalControl({
    ...existing,
    id: state.terminalControlDraftId || undefined,
    name: $("#terminalControlName")?.value,
    icon: $("#terminalControlIcon")?.value,
    area: $("#terminalControlArea")?.value,
    intervalType: $("#terminalControlIntervalType")?.value,
    intervalValue: $("#terminalControlIntervalValue")?.value,
    startTime: $("#terminalControlStartTime")?.value,
    responsible: $("#terminalControlResponsible")?.value,
    status: $("#terminalControlStatus")?.value,
    active: Boolean($("#terminalControlActive")?.checked)
  });
}

function renderTerminalTableLite() {
  const target = $("#terminalTableLitePreview");
  if (!target) return;
  const reservations = sortTerminalTableReservations(
    terminalTableReservations(state.terminalReport || {}),
    "time"
  );
  if (reservations.length) {
    target.innerHTML = `
      <div class="terminal-table-lite-table" role="table" aria-label="Aktuelle Tischreservierungen">
        <div class="terminal-table-lite-row is-head" role="row">
          <span>Zeit</span><span>Tisch</span><span>Name</span><span>Pers.</span>
        </div>
        ${reservations.slice(0, 6).map((reservation) => `
          <div class="terminal-table-lite-row" role="row">
            <span>${escapeHtml(terminalTableTimeRange(reservation))}</span>
            <span>${escapeHtml(terminalTableLabelText(reservation.tableIds))}</span>
            <span>${escapeHtml(reservation.name || "Reservierung")}</span>
            <span>${escapeHtml(String(reservation.people || 0))}</span>
          </div>
        `).join("")}
      </div>
    `;
    return;
  }
  target.innerHTML = `
    <div class="terminal-table-lite-empty" role="status">
      <span class="terminal-table-lite-empty-icon" aria-hidden="true">&#9638;</span>
      <strong>Noch kein Tischplan für heute</strong>
    </div>
  `;
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
  modal?.classList.add("hidden");
  state.pendingReminder = null;
  state.pendingToiletCheck = "";
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
    state.terminalOpenDates = Array.isArray(result.openTerminalDates) ? result.openTerminalDates : state.terminalOpenDates || [];
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
  $$("#addInvoiceCustomer, #addExpense, #openAddExpense, #addMiscIncome, [data-save-invoice-draft], [data-mark-invoice-ready], [data-save-expense-entry], [data-remove-report-entry], [data-remove-report-document], [data-remove-misc-income], #saveDayReport, #saveTipDistribution").forEach((button) => {
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
  const miscIncome = report.miscIncome || [];
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
  renderMiscIncomeList(miscIncome);
  renderFinanceInvoiceBreakdown(report);
  renderFinanceExpensePreview();
}

function renderFinanceInvoiceBreakdown(report = {}) {
  const target = $("#financeInvoiceBreakdown");
  if (!target) return;
  const invoices = reportTransferInvoiceCustomers(report);
  target.classList.toggle("hidden", !invoices.length);
  target.innerHTML = invoices.map((item, index) => `
    <div class="finance-invoice-breakdown-row">
      <strong>${escapeHtml(item.name || `Kunde ${index + 1}`)} · ${escapeHtml(formatReportMoney(invoiceTotal(item)))}</strong>
    </div>
  `).join("");
}

function miscIncomeRowHtml(item = {}) {
  return `
    <div class="finance-misc-income-row" data-report-entry="misc-income" data-id="${escapeHtml(item.id || cryptoId())}">
      <input data-report-field="name" value="${escapeHtml(item.name || "")}" placeholder="Bezeichnung, z.B. Automaten" aria-label="Bezeichnung sonstige Einnahme">
      <input data-report-field="amount" type="number" min="0" step="0.01" value="${escapeHtml(item.amount || "")}" placeholder="0,00" aria-label="Betrag sonstige Einnahme">
      <span>€</span>
      <button type="button" data-remove-misc-income aria-label="Sonstige Einnahme entfernen">&times;</button>
    </div>`;
}

function renderMiscIncomeList(items = []) {
  const target = $("#miscIncomeList");
  if (!target) return;
  target.innerHTML = items.length ? items.map((item) => miscIncomeRowHtml(item)).join("") : `<p class="finance-empty-row">Keine sonstigen Einnahmen</p>`;
  renderMiscIncomeTotal();
}

function currentMiscIncomeEntries() {
  return $$("#miscIncomeList [data-report-entry='misc-income']").map((row) => ({
    id: row.dataset.id || cryptoId(),
    name: row.querySelector("[data-report-field='name']")?.value.trim() || "",
    amount: row.querySelector("[data-report-field='amount']")?.value || ""
  })).filter((item) => item.name || item.amount);
}

function miscIncomeFromFormOrReport(report = state.terminalReport || {}) {
  const target = $("#miscIncomeList");
  return target ? currentMiscIncomeEntries() : (Array.isArray(report.miscIncome) ? report.miscIncome : []);
}

function renderMiscIncomeTotal() {
  setFinanceText("#financeMiscIncomeTotal", formatMoney(reportItemsTotal(currentMiscIncomeEntries())));
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
  const documents = report.documents || {};
  const rows = [
    ["Penta", "penta", "#reportDocumentPentaStatus", documents.penta],
    ["Handschrift", "handwriting", "#reportDocumentHandwritingStatus", documents.handwriting],
    ["EC-Schnitt", "ecCut", "#reportDocumentEcCutStatus", documents.ecCut]
  ];
  rows.forEach(([label, key, selector, document]) => {
    const target = $(selector);
    if (!target) return;
    const uploaded = Boolean(document?.path || document?.url || document?.data);
    target.innerHTML = `
      <div class="finance-document-status ${uploaded ? "is-uploaded" : ""}">
        <span>${uploaded ? "Hochgeladen" : "Noch nicht hochgeladen"}</span>
        ${document?.name ? `<small>${escapeHtml(document.name)}</small>` : ""}
        ${uploaded ? `<div>${reportDocumentLinkHtml(document, label)}<button class="danger-lite" data-remove-report-document="${key}" type="button">Entfernen</button></div>` : ""}
      </div>
      <input type="hidden" data-report-document="${key}" data-document-field="name" value="${escapeHtml(document?.name || "")}">
      <input type="hidden" data-report-document="${key}" data-document-field="path" value="${escapeHtml(document?.path || "")}">
      <input type="hidden" data-report-document="${key}" data-document-field="url" value="${escapeHtml(document?.url || "")}">
      <input type="hidden" data-report-document="${key}" data-document-field="data" value="${escapeHtml(document?.data || "")}">
    `;
  });
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
    return false;
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
    return true;
  } catch (error) {
    showError(error);
    return false;
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
  const invoiceList = $("#customerInvoiceWorkList");
  if (invoiceList) {
    invoiceList.innerHTML = invoices.map((item) => invoiceRowHtml(item)).join("") || `<p class="hint">Noch keine geplanten Rechnungen für dieses Datum.</p>`;
  }
  renderCustomerInvoiceBuilder();
  renderCustomerMaster();
  const status = $("#customerInvoiceStaffStatus");
  if (status && !status.textContent) status.textContent = "Mitarbeiterbereich geöffnet.";
  normalizeGermanDisplay();
}

function customerInvoiceLinkedRecord(item = {}) {
  const sourceCustomerId = String(item.id || "").trim();
  if (!sourceCustomerId) return null;
  const sourceDate = state.invoiceDate || todayKey();
  const settings = state.invoiceSettings || createDefaultInvoiceSettingsClient();
  return normalizeInvoicesClient(state.invoices || [], settings)
    .find((invoice) => invoice.sourceDate === sourceDate && invoice.sourceCustomerId === sourceCustomerId && invoice.status !== "archived") || null;
}

function setInvoiceDeskDraftFromInvoice(invoice) {
  if (!invoice) {
    state.invoiceDeskDraft = null;
    state.invoiceDeskDraftId = "";
    return null;
  }
  const settings = normalizeInvoiceSettingsClient(state.invoiceSettings || createDefaultInvoiceSettingsClient());
  state.invoiceDeskDraft = normalizeInvoiceRecordClient(invoice, settings);
  state.invoiceDeskDraftId = state.invoiceDeskDraft.id || "";
  return state.invoiceDeskDraft;
}

function clearInvoiceDeskDraft() {
  state.invoiceDeskDraftId = "";
  state.invoiceDeskDraft = null;
}

function currentInvoiceDeskDraft() {
  const settings = normalizeInvoiceSettingsClient(state.invoiceSettings || createDefaultInvoiceSettingsClient());
  const localDraft = state.invoiceDeskDraft
    ? normalizeInvoiceRecordClient(state.invoiceDeskDraft, settings)
    : null;
  if (!state.invoiceDeskDraftId) return localDraft;
  const refreshed = normalizeInvoicesClient(state.invoices || [], settings)
    .find((invoice) => invoice.id === state.invoiceDeskDraftId);
  if (!refreshed) return localDraft;
  state.invoiceDeskDraft = normalizeInvoiceRecordClient({
    ...refreshed,
    pdfData: localDraft?.pdfData || refreshed.pdfData || "",
    pdfFileName: localDraft?.pdfFileName || refreshed.pdfFileName || ""
  }, settings);
  return state.invoiceDeskDraft;
}

function renderCustomerInvoiceBuilder() {
  const section = $("#customerInvoiceBuilderSection");
  const panel = $("#customerInvoiceBuilderPanel");
  if (!section || !panel) return;
  const draft = currentInvoiceDeskDraft();
  if (!state.invoiceTerminalToken || !draft?.id) {
    section.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }
  const settings = normalizeInvoiceSettingsClient(state.invoiceSettings || createDefaultInvoiceSettingsClient());
  const totals = invoiceTotalsClient(draft);
  const readonly = draft.status !== "draft";
  section.classList.remove("hidden");
  section.open = true;
  panel.innerHTML = `
    <div class="customer-invoice-builder">
      <div class="customer-invoice-builder-head">
        <div>
          <strong>${escapeHtml(draft.customerName || "Rechnung")}</strong>
          <span>${escapeHtml(draft.invoiceDate ? formatNumericDate(draft.invoiceDate) : formatNumericDate(state.invoiceDate || todayKey()))} · ${escapeHtml(invoiceStatusLabelClient(draft.status))}</span>
        </div>
        <span class="invoice-pill ${invoiceStatusClassClient(draft.status)}">${escapeHtml(formatMoney(totals.grossTotal))}</span>
      </div>
      <div class="customer-invoice-builder-actions">
        <button class="secondary" type="button" data-close-customer-invoice-builder>Schließen</button>
        <button class="secondary" type="button" data-customer-invoice-preview>Vorschau</button>
        <button class="primary" type="button" data-customer-invoice-finalize-download ${readonly ? "disabled" : ""}>Festschreiben &amp; PDF herunterladen</button>
        <button class="secondary" type="button" data-customer-invoice-print ${draft.pdfData ? "" : "disabled"}>Drucken</button>
      </div>
      <p class="hint customer-invoice-builder-hint">Rechnung wird direkt aus diesem Rechnungskunden erzeugt: erst prüfen, dann festschreiben und anschließend drucken.</p>
      <div class="invoice-preview-panel customer-invoice-builder-preview">
        ${invoicePreviewHtml(draft, settings)}
      </div>
    </div>
  `;
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
    pentacodeEntered: "",
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
  const linkedInvoice = customerInvoiceLinkedRecord({ ...item, id });
  const singleReceipt = invoiceReceipt(item);
  const legacyReceipts = invoiceLegacyReceipts(item);
  const isReady = invoiceIsReady(item);
  const statusClass = invoiceStatusClass(item);
  const total = invoiceTotal(item);
  const pentacodeChoice = invoicePentacodeChoice(item);
  const workflow = invoiceWorkflowState({ ...item, id }, linkedInvoice);
  const suggestedStep = !item.name ? 1 : (!item.paymentMethod && total <= 0 ? 2 : 3);
  const customerOptions = normalizeCustomerDirectory(state.customerDirectory)
    .map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.name || "Kunde")}${customer.contact ? ` · ${escapeHtml(customer.contact)}` : ""}</option>`)
    .join("");
  const legacyHint = !singleReceipt && legacyReceipts.length
    ? `<span class="hint">Bisherige getrennte Belege: ${legacyReceipts.map(({ label, receipt }) => `${escapeHtml(label)} ${escapeHtml(receipt.receiptName || "")}`).join(" | ")}</span>`
    : "";
  return `
    <details class="report-entry invoice-entry ${statusClass}" data-report-entry="invoice" data-id="${escapeHtml(id)}" data-invoice-date="${escapeHtml(item.sourceDate || "")}" data-saved="${isSaved ? "true" : "false"}" ${isReady ? "" : "open"}>
      <summary class="invoice-entry-summary">
        <div>
          <strong>${escapeHtml(item.name || "Neuer Rechnungskunde")}</strong>
          <span>${escapeHtml(item.contact || "Kontakt offen")} · ${escapeHtml(item.email || "E-Mail offen")}</span>
          <small class="invoice-entry-next-step">${escapeHtml(workflow.title)}: ${escapeHtml(workflow.detail)}</small>
        </div>
        <span class="invoice-pill ${statusClass}">${escapeHtml(invoiceStatusText(item))}</span>
        <span class="invoice-entry-total">${formatReportMoney(total)}</span>
      </summary>
      <div class="invoice-entry-body">
        <div class="invoice-wizard-progress" data-invoice-current-step="${suggestedStep}">
          <button type="button" data-invoice-step-go="1" class="${suggestedStep === 1 ? "is-active" : ""}"><b>1</b><span>Kunde</span></button>
          <i></i>
          <button type="button" data-invoice-step-go="2" class="${suggestedStep === 2 ? "is-active" : ""}"><b>2</b><span>Beträge</span></button>
          <i></i>
          <button type="button" data-invoice-step-go="3" class="${suggestedStep === 3 ? "is-active" : ""}"><b>3</b><span>Beleg &amp; Abschluss</span></button>
        </div>
        <section class="invoice-workflow-block invoice-wizard-panel ${suggestedStep === 1 ? "" : "hidden"}" data-invoice-step-panel="1">
          <div class="invoice-workflow-head">
            <strong>1. Kunde wählen oder neu anlegen</strong>
            <span>Bestehenden Kunden übernehmen oder neue Rechnungsdaten eingeben.</span>
          </div>
          <div class="invoice-customer-source">
            <div>
              <strong>Aus Kundenstamm</strong>
              <select data-invoice-customer-master>
                <option value="">Kunde auswählen</option>
                ${customerOptions}
              </select>
              <button class="secondary" data-apply-invoice-customer type="button" ${customerOptions ? "" : "disabled"}>Kundendaten übernehmen</button>
            </div>
            <span>oder</span>
            <div><strong>Neuen Kunden anlegen</strong><small>Felder unten vollständig ausfüllen.</small></div>
          </div>
          <div class="report-entry-grid">
            <label>Kunde<input data-report-field="name" value="${escapeHtml(item.name || "")}" placeholder="Name/Firma"></label>
            <label>Ansprechpartner<input data-report-field="contact" value="${escapeHtml(item.contact || "")}" placeholder="optional"></label>
            <label>Telefon<input data-report-field="phone" type="tel" value="${escapeHtml(item.phone || "")}" placeholder="optional"></label>
            <label>E-Mail<input data-report-field="email" type="email" value="${escapeHtml(item.email || "")}" placeholder="rechnung@kunde.de"></label>
            <label class="invoice-grid-wide">Rechnungsadresse<textarea data-report-field="address" rows="2" placeholder="Adresse für Rechnung">${escapeHtml(item.address || "")}</textarea></label>
            <label class="invoice-grid-wide">Notiz<input data-report-field="note" value="${escapeHtml(item.note || "")}" placeholder="optional"></label>
          </div>
          <div class="invoice-wizard-actions"><button class="primary" data-invoice-step-go="2" type="button">Weiter zu Beträge</button></div>
        </section>
        <section class="invoice-workflow-block invoice-wizard-panel ${suggestedStep === 2 ? "" : "hidden"}" data-invoice-step-panel="2">
          <div class="invoice-workflow-head">
            <strong>2. Beträge und Zahlungsart</strong>
            <span>Hier kommt alles rein, was später auf die Rechnung soll.</span>
          </div>
          <div class="report-entry-grid">
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
          <div class="invoice-wizard-actions"><button class="secondary" data-invoice-step-go="1" type="button">Zurück</button><button class="primary" data-invoice-step-go="3" type="button">Weiter zu Beleg</button></div>
        </section>
        <section class="invoice-workflow-block invoice-wizard-panel ${suggestedStep === 3 ? "" : "hidden"}" data-invoice-step-panel="3">
          <div class="invoice-workflow-head">
            <strong>3. Beleg und Abschluss</strong>
            <span>Beleg hochladen, Pentacode-Status wählen und dann den nächsten Schritt auslösen.</span>
          </div>
          <label class="invoice-pentacode-choice">In Pentacode eingetragen
            <select data-report-field="pentacodeEntered">
              <option value=""${!pentacodeChoice ? " selected" : ""}>Bitte wählen</option>
              <option value="true"${pentacodeChoice === "yes" ? " selected" : ""}>Ja, eingetragen</option>
              <option value="false"${pentacodeChoice === "no" ? " selected" : ""}>Nein, nachträgliche Rechnung</option>
            </select>
          </label>
          <div class="invoice-receipt-actions">
            <button class="secondary" data-open-invoice-receipt-scanner type="button">Scanner-App öffnen</button>
            <label>Oder direkt auswählen<input data-report-file type="file" accept="image/*,application/pdf" capture="environment"></label>
          </div>
          <span class="hint" data-invoice-receipt-status>${singleReceipt?.receiptName ? `Aktueller Rechnungsbeleg: ${escapeHtml(singleReceipt.receiptName)}` : "Noch kein Rechnungsbeleg hinterlegt."}</span>
          ${legacyHint}
          <div class="invoice-entry-actions">
            <button class="secondary" data-invoice-step-go="2" type="button">Zurück</button>
            <button class="secondary" data-save-invoice-draft type="button">Änderungen speichern</button>
            <button class="primary" data-mark-invoice-ready type="button">${isReady ? "Erneut für Chef vorbereiten" : "Fertig für Chef"}</button>
            <button class="secondary danger-lite" data-remove-report-entry type="button">Vollständig löschen</button>
          </div>
        </section>
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
        <input type="hidden" data-report-field="invoiceGeneratedId" value="${escapeHtml(item.invoiceGeneratedId || linkedInvoice?.id || "")}">
        <input type="hidden" data-report-field="invoicePaid" value="${invoiceIsPaid(item) ? "true" : "false"}">
        <input type="hidden" data-report-field="invoicePaidAt" value="${escapeHtml(item.invoicePaidAt || "")}">
        <input type="hidden" data-report-field="invoiceNotificationSentAt" value="${escapeHtml(item.invoiceNotificationSentAt || "")}">
        <input type="hidden" data-report-field="createdAt" value="${escapeHtml(item.createdAt || "")}">
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
  const scope = root || document;
  const rows = scope.matches?.(selector) ? [scope] : [...scope.querySelectorAll(selector)];
  for (const row of rows) {
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
  const documents = {
    penta: {},
    handwriting: {},
    ecCut: {},
    attachments: cloneData(reportDocumentAttachments())
  };
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
  const miscIncome = currentMiscIncomeEntries();
  if (miscIncome.some((item) => reportMoneyNumber(item.amount) > 0 && !item.name)) {
    throw new Error("Bitte für jede sonstige Einnahme eine Bezeichnung eingeben.");
  }
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
    bowlingCashRevenue: $("#reportBowlingCashRevenue")?.value || "",
    gastroCashRevenue: $("#reportGastroCashRevenue")?.value || "",
    revenueGastro: gastroRevenueFromFormOrReport().toFixed(2),
    barBowling: $("#reportRevenueBowling")?.value || "",
    barGastro: gastroRevenueFromFormOrReport().toFixed(2),
    invoiceTransferAmount: $("#financeInvoiceTotal")?.dataset.manualOverride === "true" ? ($("#financeInvoiceTotal")?.value || "") : "",
    invoiceTransferAmountManual: $("#financeInvoiceTotal")?.dataset.manualOverride === "true",
    tipTotal: tipResult.tipTotal.toFixed(2),
    tipRemainder: tipResult.tipRemainder.toFixed(2),
    tipsByEmployee: Object.fromEntries(tipResult.rows.map((row) => [row.employee, row.tip.toFixed(2)])),
    openingHours: $("#terminalOpeningHours")?.value || "",
    shiftLeader: $("#terminalShiftLeader")?.value || "",
    handovers: state.terminalReport.handovers || [],
    invoiceCustomers: await collectReportEntries("invoice"),
    expenses: await collectReportEntries("expense"),
    miscIncome,
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

async function runCustomerInvoiceMutation(action, extra = {}, fallbackMessage = "", options = {}) {
  if (!state.invoiceTerminalToken) {
    showToast("Bitte Mitarbeiter-Code eingeben.");
    return null;
  }
  const result = await api("/api/state", {
    method: "POST",
    body: JSON.stringify({
      action,
      terminalToken: state.invoiceTerminalToken,
      ...extra
    })
  });
  state.invoiceSettings = normalizeInvoiceSettingsClient(result.invoiceSettings || state.invoiceSettings || createDefaultInvoiceSettingsClient());
  state.invoices = normalizeInvoicesClient(result.invoices || state.invoices || [], state.invoiceSettings);
  if (result.invoice) {
    setInvoiceDeskDraftFromInvoice(result.invoice);
  } else if (state.invoiceDeskDraftId) {
    const refreshed = state.invoices.find((invoice) => invoice.id === state.invoiceDeskDraftId);
    if (refreshed) setInvoiceDeskDraftFromInvoice(refreshed);
  }
  if (options.refreshReport) {
    await loadCustomerInvoiceDesk();
  } else {
    renderCustomerInvoiceDesk();
  }
  const message = result.message || fallbackMessage;
  if (message) {
    $("#customerInvoiceStaffStatus").textContent = message;
    showToast(message);
  }
  return result;
}

async function openCustomerInvoiceBuilderForRow(button) {
  const row = button.closest('[data-report-entry="invoice"]');
  if (!row) return;
  const sourceCustomerId = String(row.dataset.id || "").trim();
  if (!sourceCustomerId) {
    showToast("Bitte Rechnungskunde zuerst speichern.");
    return;
  }
  const problems = invoiceRowReadyProblems(row);
  if (problems.length) {
    showToast(`Noch offen: ${problems.join(", ")}.`);
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Öffnet...";
  }
  const readyWasSet = reportFieldValue(row, "invoiceReady") === "true";
  if (!readyWasSet) {
    setReportFieldValue(row, "invoiceReady", "true");
    if (!reportFieldValue(row, "invoiceReadyAt")) {
      setReportFieldValue(row, "invoiceReadyAt", new Date().toISOString());
    }
  }
  try {
    const saved = await saveCustomerInvoiceDeskReport(null, "Rechnungskunde für die Rechnung vorbereitet.");
    if (!saved) {
      if (!readyWasSet) setReportFieldValue(row, "invoiceReady", "false");
      return;
    }
    const result = await runCustomerInvoiceMutation(
      "invoice-from-ready-customer",
      { sourceDate: state.invoiceDate || todayKey(), sourceCustomerId },
      "Rechnungsentwurf geöffnet."
    );
    if (result?.invoice) {
      setInvoiceDeskDraftFromInvoice(result.invoice);
      renderCustomerInvoiceDesk();
      $("#customerInvoiceBuilderSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    if (!readyWasSet) setReportFieldValue(row, "invoiceReady", "false");
    showError(error);
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function previewCurrentDeskInvoicePdf(button, download = false) {
  const draft = currentInvoiceDeskDraft();
  if (!draft?.id) {
    showToast("Bitte zuerst einen Rechnungsentwurf öffnen.");
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = download ? "Erstellt..." : "Lädt...";
  }
  try {
    const result = await api("/api/state", {
      method: "POST",
      body: JSON.stringify({
        action: "invoice-preview-pdf",
        terminalToken: state.invoiceTerminalToken,
        invoice: draft
      })
    });
    setInvoiceDeskDraftFromInvoice({
      ...draft,
      pdfData: result.pdfData || "",
      pdfFileName: result.pdfFileName || draft.pdfFileName
    });
    renderCustomerInvoiceDesk();
    if (download) {
      downloadDataUrlFile(result.pdfData, result.pdfFileName || "rechnung.pdf");
      showToast("PDF heruntergeladen.");
    } else if (result.pdfData) {
      window.open(result.pdfData, "_blank", "noopener");
      showToast("PDF Vorschau geöffnet.");
    }
  } catch (error) {
    showError(error);
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function finalizeCurrentDeskInvoice(button, download = false) {
  const draft = currentInvoiceDeskDraft();
  if (!draft?.id) {
    showToast("Bitte zuerst einen Rechnungsentwurf öffnen.");
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Festschreibt...";
  }
  try {
    const result = await runCustomerInvoiceMutation(
      "invoice-finalize",
      { invoice: draft },
      "Rechnung festgeschrieben.",
      { refreshReport: true }
    );
    if (result?.invoice) {
      const finalizedInvoice = {
        ...(result.invoice || draft),
        pdfData: result.pdfData || result.invoice?.pdfData || "",
        pdfFileName: result.pdfFileName || result.invoice?.pdfFileName || draft.pdfFileName
      };
      setInvoiceDeskDraftFromInvoice(finalizedInvoice);
      renderCustomerInvoiceDesk();
      if (download && finalizedInvoice.pdfData) {
        downloadDataUrlFile(finalizedInvoice.pdfData, finalizedInvoice.pdfFileName || "rechnung.pdf");
        showToast("Rechnung festgeschrieben und als PDF heruntergeladen.");
      }
    }
  } catch (error) {
    showError(error);
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function printCurrentDeskInvoice(button) {
  const draft = currentInvoiceDeskDraft();
  if (!draft?.id) {
    showToast("Bitte zuerst einen Rechnungsentwurf öffnen.");
    return;
  }
  if (!draft.pdfData) {
    await previewCurrentDeskInvoicePdf(button, false);
    return;
  }
  window.open(draft.pdfData, "_blank", "noopener");
  showToast("PDF geöffnet. Dort kannst du direkt drucken.");
}

async function sendCustomerInvoiceReadyMail(invoiceId, button) {
  if (!state.invoiceTerminalToken) {
    showToast("Bitte Mitarbeiter-Code eingeben.");
    return null;
  }
  const targetId = String(invoiceId || "").trim();
  if (!targetId) {
    showToast("Rechnungskunde konnte für den Versand nicht gefunden werden.");
    return null;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Sende Mail...";
  }
  try {
    const result = await api("/api/day-terminal", {
      method: "POST",
      body: JSON.stringify({
        action: "send-ready-invoice-mail",
        date: state.invoiceDate || todayKey(),
        invoiceId: targetId,
        terminalToken: state.invoiceTerminalToken
      })
    });
    state.invoiceDate = result.date || state.invoiceDate || todayKey();
    state.invoiceReport = result.report || {};
    state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
    state.dayReports[state.invoiceDate] = state.invoiceReport;
    renderCustomerInvoiceDesk();
    const displayMessage = result?.mailMessage || "E-Mail wurde versendet.";
    $("#customerInvoiceStaffStatus").textContent = displayMessage;
    showToast(displayMessage);
    return result;
  } catch (error) {
    showError(error);
    return null;
  } finally {
    if (button) {
      button.textContent = oldText || "Fertig für Chef";
      button.disabled = false;
    }
  }
}

async function saveCustomerInvoiceDeskRow(button, markReady = false) {
  const row = button.closest('[data-report-entry="invoice"]');
  if (!row) return;
  const invoiceId = row.dataset.id || "";
  if (markReady) {
    const problems = invoiceRowReadyProblems(row);
    if (problems.length) {
      showToast(`Noch offen: ${problems.join(", ")}.`);
      return;
    }
    setReportFieldValue(row, "invoiceReady", "true");
    setReportFieldValue(row, "invoiceReadyAt", new Date().toISOString());
  }
  const result = await saveCustomerInvoiceDeskReport(
    button,
    markReady ? "Rechnung gespeichert." : "Rechnungskunde zwischengespeichert."
  );
  if (!result) {
    if (markReady) setReportFieldValue(row, "invoiceReady", "false");
    return;
  }
  if (markReady) {
    const invoiceDate = row.dataset.invoiceDate || state.terminalInvoiceDate || state.terminalDate || todayKey();
    await terminalInvoicePdf(invoiceDate, invoiceId, button);
  }
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
  if (!reportFieldValue(row, "pentacodeEntered")) problems.push("Pentacode-Status fehlt");
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
    const invoiceDate = row.dataset.invoiceDate || "";
    if (invoiceDate && invoiceDate !== (state.terminalDate || todayKey())) {
      const customer = (await collectReportEntriesFrom(row, "invoice"))[0];
      const result = await terminalAction({ action: "save-invoice-customer", invoiceDate, customer });
      showToast(markReady ? "Nachträgliche Rechnung ist fertig für Chef." : "Nachträglicher Rechnungskunde gespeichert.");
      if (markReady) await terminalInvoicePdf(invoiceDate, result?.customer?.id || customer?.id || row.dataset.id, button);
      return result;
    }
    const payload = await collectDayReportPayload();
    const result = await terminalAction(payload);
    const toastMessage = markReady
      ? ["Rechnung ist fertig für Chef.", result?.mailMessage].filter(Boolean).join(" ")
      : "Rechnungskunde zwischengespeichert.";
    showToast(toastMessage);
    if (markReady) await terminalInvoicePdf(invoiceDate || state.terminalDate || todayKey(), row.dataset.id || "", button);
    return result;
  } catch (error) {
    if (markReady) setReportFieldValue(row, "invoiceReady", "false");
    showError(error);
    return null;
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
  const displayRows = dailyTipRowsForDisplay(result, report);
  const distributed = displayRows.reduce((sum, row) => sum + Number(row.tip || 0), 0);
  const chefHandover = result.chefHandover;
  const summaryHtml = `
    <button class="tip-summary-card tip-detail-trigger" type="button" data-open-tip-distribution aria-haspopup="dialog">
      <span class="tip-summary-icon" aria-hidden="true">&#127873;</span>
      <span>Trinkgeld gesamt</span>
      <strong>${formatMoney(result.tipTotal)}</strong>
      <small>Wird laut Arbeitszeiten verteilt.</small>
    </button>
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
  renderFinanceDashboard(result);
  renderTipDistributionDetail(result, displayRows);
}

function setFinanceText(selector, value) {
  const target = $(selector);
  if (target) target.textContent = value;
}

function renderFinanceDashboard(result = calculateTipDistribution(state.terminalDate || todayKey())) {
  setFinanceText("#financeKpiCash", formatMoney(result.cashTotal || 0));
  setFinanceText("#financeKpiEc", formatMoney(result.ecTotal || 0));
  setFinanceText("#financeKpiExpenses", formatMoney(result.cashExpenses || 0));
  setFinanceText("#financeKpiHandover", formatMoney(result.chefHandover || 0));
  setFinanceText("#financeResultHandover", formatMoney(result.chefHandover || 0));
  const invoiceField = $("#financeInvoiceTotal");
  if (invoiceField && invoiceField.dataset.manualOverride !== "true" && document.activeElement !== invoiceField) {
    invoiceField.value = Number(result.invoiceTotal || 0).toFixed(2);
  }
  setFinanceText("#financeMiscIncomeTotal", formatMoney(result.miscIncomeTotal || 0));
  setFinanceText("#financeExpenseTotal", formatMoney(result.cashExpenses || 0));
  setFinanceText(
    "#financeResultFormula",
    `Umsatz ${formatMoney(result.totalRevenue || 0)} + sonstige Einnahmen ${formatMoney(result.miscIncomeTotal || 0)} − EC ${formatMoney(result.ecTotal || 0)} − Rechnung ${formatMoney(result.invoiceTotal || 0)} − Ausgaben ${formatMoney(result.cashExpenses || 0)}`
  );
  if (Number(state.terminalClosingStep || 1) === 2) renderPentacodeTransfer();
  if (Number(state.terminalClosingStep || 1) === 4) renderManualReportTransfer();
}

function renderFinanceExpensePreview() {
  const target = $("#financeExpensePreview");
  if (!target) return;
  const rows = $$("#expensesList [data-report-entry='expense']");
  if (!rows.length) {
    target.innerHTML = `<p class="finance-empty-row">Keine Ausgaben erfasst</p>`;
    setFinanceText("#financeExpenseTotal", formatMoney(0));
    return;
  }
  const total = rows.reduce((sum, row) => sum + parseMoneyInput(row.querySelector("[data-report-field='amount']")?.value || ""), 0);
  target.innerHTML = rows.map((row) => {
    const id = row.dataset.id || "";
    const name = row.querySelector("[data-report-field='name']")?.value || "Ausgabe";
    const amount = parseMoneyInput(row.querySelector("[data-report-field='amount']")?.value || "");
    return `
      <article class="finance-expense-row">
        <div><strong>${escapeHtml(name || "Ausgabe")}</strong><span>${formatMoney(amount)}</span></div>
        <div class="finance-expense-actions">
          <button type="button" data-edit-expense="${escapeHtml(id)}" aria-label="${escapeHtml(name || "Ausgabe")} bearbeiten">Bearbeiten</button>
          <button class="is-delete" type="button" data-delete-expense="${escapeHtml(id)}" aria-label="${escapeHtml(name || "Ausgabe")} löschen">&times;</button>
        </div>
      </article>
    `;
  }).join("");
  setFinanceText("#financeExpenseTotal", formatMoney(total));
}

function openFinanceModal(id) {
  $("#" + id)?.classList.remove("hidden");
}

function closeFinanceModal(id) {
  $("#" + id)?.classList.add("hidden");
}

function renderTipDistributionDetail(result = {}, displayRows = []) {
  const targets = [$("#tipDistributionDetail"), $("#closingTipDistributionDetail")].filter(Boolean);
  if (!targets.length) return;
  const distributed = displayRows.reduce((sum, row) => sum + Number(row.tip || 0), 0);
  const remainder = Math.max(0, Number(result.tipRemainder || 0));
  const html = `
    <div class="tip-detail-total">
      <span>Trinkgeld gesamt</span>
      <strong>${formatMoney(result.tipTotal || 0)}</strong>
      <small>Verteilung nach Arbeitszeit</small>
    </div>
    ${displayRows.length ? `
      <div class="tip-detail-table-wrap">
        <table class="tip-detail-table">
          <thead>
            <tr>
              <th>Mitarbeiter</th>
              <th>Arbeitsstunden</th>
              <th>Anteil</th>
              <th>Berechnung</th>
              <th>Trinkgeld</th>
            </tr>
          </thead>
          <tbody>
            ${displayRows.map((row) => {
              const amount = Number(row.tip || 0);
              const share = distributed > 0 ? (amount / distributed) * 100 : 0;
              return `
                <tr>
                  <td><strong>${escapeHtml(row.employee)}</strong><small>${escapeHtml(tipAreaLabel(row.area))}${row.factor !== 1 ? ` · Faktor ${String(row.factor).replace(".", ",")}` : ""}</small></td>
                  <td>${formatHours(row.hours)}</td>
                  <td>${share.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</td>
                  <td>${formatMoney(row.rawTip)}${row.factor !== 1 ? ` · Faktor ${String(row.factor).replace(".", ",")}` : ""}</td>
                  <td><strong>${formatMoney(amount)}</strong></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
      ${remainder > 0.005 ? `<p class="tip-detail-note">Rundungsrest: ${formatMoney(remainder)}</p>` : ""}
    ` : `
      <div class="tip-detail-empty">
        <strong>Noch keine Trinkgeld-Verteilung möglich.</strong>
        <span>Dafür braucht es Arbeitszeiten mit Dienstende und Umsatzdetails.</span>
      </div>
    `}
  `;
  targets.forEach((target) => { target.innerHTML = html; });
}

function openTipDistributionModal() {
  renderDailyTipDistribution();
  $("#tipDistributionModal")?.classList.remove("hidden");
  $("#closeTipDistributionModal")?.focus();
}

function closeTipDistributionModal() {
  $("#tipDistributionModal")?.classList.add("hidden");
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
  const transferInvoiceTotal = currentTerminalTransferInvoiceTotal(state.terminalReport || {});
  const bowlingCashRevenue = bowlingCashRevenueFromFormOrReport();
  const gastroCashRevenue = gastroCashRevenueFromFormOrReport();
  const dailyCashRevenue = bowlingCashRevenue + gastroCashRevenue;
  const miscIncome = miscIncomeFromFormOrReport();
  const miscIncomeTotal = reportItemsTotal(miscIncome);
  const totalRevenue = Math.max(0, revenueBowling + revenueGastro - personalConsumption);
  const tipTotal = Math.max(0, cashTotal + cashExpenses + ecTotal + transferInvoiceTotal - totalRevenue - miscIncomeTotal);
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
    bowlingCashRevenue,
    gastroCashRevenue,
    dailyCashRevenue,
    miscIncome,
    miscIncomeTotal,
    invoiceTotal: transferInvoiceTotal,
    totalRevenue,
    chefHandover: Math.max(0, totalRevenue + miscIncomeTotal - ecTotal - transferInvoiceTotal - cashExpenses),
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
  state.terminalOpenDates = Array.isArray(result.openTerminalDates) ? result.openTerminalDates : state.terminalOpenDates || [];
  state.terminalEntries = result.entries || {};
  state.terminalReport = result.report || {};
  state.tipOverview = result.tipOverview || state.tipOverview;
  state.dayReports[state.terminalDate] = state.terminalReport;
  state.terminalSchedule = result.schedule || {};
  state.assignmentTimes = normalizeAssignmentTimes(result.assignmentTimes || state.assignmentTimes || {});
  state.assignmentSchedules = result.assignmentSchedules || state.assignmentSchedules || {};
  state.assignmentAvailability = normalizeAssignmentAvailability(result.assignmentAvailability || state.assignmentAvailability || {});
  state.terminalTasks = result.tasks || [];
  state.terminalTaskTemplates = Array.isArray(result.taskTemplates) ? result.taskTemplates : state.terminalTaskTemplates;
  state.terminalTaskAreas = Array.isArray(result.taskAreas) ? result.taskAreas : state.terminalTaskAreas;
  state.terminalReminders = normalizeReminderTemplates(result.reminders);
  state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.cleaningTemplates);
  state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || {};
  state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
  state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
  state.terminalInvoiceHistory = Array.isArray(result.invoiceHistory) ? result.invoiceHistory : state.terminalInvoiceHistory;
  state.offers = normalizeOffersClient(result.offers || state.offers || []);
  state.cocktails = Array.isArray(result.cocktails) ? result.cocktails : state.cocktails;
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
  state.terminalOpenDates = Array.isArray(result.openTerminalDates) ? result.openTerminalDates : state.terminalOpenDates || [];
  state.terminalEntries = result.entries || {};
  state.terminalReport = result.report || {};
  state.tipOverview = result.tipOverview || state.tipOverview;
  state.dayReports[state.terminalDate] = state.terminalReport;
  state.terminalSchedule = result.schedule || {};
  state.assignmentTimes = normalizeAssignmentTimes(result.assignmentTimes || state.assignmentTimes || {});
  state.assignmentSchedules = result.assignmentSchedules || state.assignmentSchedules || {};
  state.assignmentAvailability = normalizeAssignmentAvailability(result.assignmentAvailability || state.assignmentAvailability || {});
  state.terminalTasks = result.tasks || [];
  state.terminalTaskTemplates = Array.isArray(result.taskTemplates) ? result.taskTemplates : [];
  state.terminalTaskAreas = Array.isArray(result.taskAreas) ? result.taskAreas : [];
  state.terminalReminders = normalizeReminderTemplates(result.reminders);
  state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.cleaningTemplates);
  state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || {};
  state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
  state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
  state.terminalInvoiceHistory = Array.isArray(result.invoiceHistory) ? result.invoiceHistory : state.terminalInvoiceHistory;
  state.offers = normalizeOffersClient(result.offers || state.offers || []);
  state.cocktails = Array.isArray(result.cocktails) ? result.cocktails : state.cocktails;
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
    state.terminalOpenDates = Array.isArray(result.openTerminalDates) ? result.openTerminalDates : state.terminalOpenDates || [];
    state.settings = normalizeSettings(result.settings || state.settings);
    state.terminalEntries = result.entries || {};
    state.terminalReport = result.report || {};
    state.tipOverview = result.tipOverview || state.tipOverview;
    state.dayReports[state.terminalDate] = state.terminalReport;
    state.terminalSchedule = result.schedule || {};
    state.assignmentTimes = normalizeAssignmentTimes(result.assignmentTimes || state.assignmentTimes || {});
    state.assignmentSchedules = result.assignmentSchedules || state.assignmentSchedules || {};
    state.terminalTasks = result.tasks || [];
    state.terminalTaskTemplates = Array.isArray(result.taskTemplates) ? result.taskTemplates : [];
    state.terminalTaskAreas = Array.isArray(result.taskAreas) ? result.taskAreas : [];
    state.terminalReminders = normalizeReminderTemplates(result.reminders);
    state.terminalCleaningTemplates = normalizeCleaningTemplates(result.cleaningTemplates || state.cleaningTemplates);
    state.terminalWeeklyCleaningCompletions = result.weeklyCleaningCompletions || {};
    state.terminalMessages = result.terminalMessages || state.terminalMessages || [];
    state.offers = normalizeOffersClient(result.offers || state.offers || []);
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
    state.terminalOpenDates = Array.isArray(result.openTerminalDates) ? result.openTerminalDates : state.terminalOpenDates || [];
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

async function terminalInvoicePdf(date, invoiceId, button) {
  if (!date || !invoiceId) {
    showToast("Rechnungskunde bitte zuerst speichern.");
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Unterlagen werden erstellt...";
  }
  try {
    const pdfResult = await api("/api/state", {
      method: "POST",
      body: JSON.stringify({ action: "invoice-export-package", terminalToken: state.terminalToken, sourceDate: date, sourceCustomerId: invoiceId })
    });
    const infoName = pdfResult.infoPdfFileName || `Rechnungsinformationen-${date}.pdf`;
    const receiptsName = pdfResult.receiptsPdfFileName || `Belege-${date}.pdf`;
    downloadDataUrlFile(pdfResult.infoPdfData, infoName);
    window.setTimeout(() => downloadDataUrlFile(pdfResult.receiptsPdfData, receiptsName), 180);
    const recipient = state.settings.invoiceNotificationTo || "pvo65@outlook.de";
    const customerName = pdfResult.customerName || "Rechnungskunde";
    const subject = `LA-Bowling Rechnung - ${customerName}`;
    const body = `Hallo Peter,\n\nim Anhang findest du die Rechnungsinformationen und die gescannten Belege für ${customerName} vom ${formatDate(date)}.\n\nBitte diese beiden Dateien anhängen:\n- ${infoName}\n- ${receiptsName}\n\nViele Grüße`;
    window.setTimeout(() => {
      window.location.href = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }, 450);
    showToast("Rechnungsinformationen und Belege erstellt. Outlook wird geöffnet; bitte beide PDFs anhängen.");
  } catch (error) {
    showError(error);
  } finally {
    if (button?.isConnected) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

async function terminalInvoicePdfForRow(button) {
  const row = button.closest('[data-report-entry="invoice"]');
  if (!row) return;
  const problems = invoiceRowReadyProblems(row);
  if (problems.length) {
    showToast(`Noch offen: ${problems.join(", ")}.`);
    return;
  }
  const invoiceDate = row.dataset.invoiceDate || state.terminalDate || todayKey();
  const customer = (await collectReportEntriesFrom(row, "invoice"))[0];
  const saved = await terminalAction({ action: "save-invoice-customer", invoiceDate, customer });
  const savedId = saved?.customer?.id || customer?.id || row.dataset.id;
  await terminalInvoicePdf(invoiceDate, savedId, button);
}

async function loadTerminalWorkDate(dateKey, button = null) {
  const requestedDate = String(dateKey || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    showToast("Bitte Datum wählen.");
    return null;
  }
  if (requestedDate > terminalRelativeDate(1)) {
    showToast("Bitte höchstens morgen wählen.");
    return null;
  }
  const previousDate = state.terminalDate || "";
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Lädt...";
  }
  try {
    const result = await terminalAction({ action: "load", date: requestedDate, manualDate: true });
    if (result.date && result.date !== requestedDate) {
      showToast("Dieser Tag ist bereits abgeschlossen. Bitte dafür den Admin-Korrekturmodus verwenden.");
    } else if (previousDate !== requestedDate) {
      showToast(`Terminal auf ${formatDate(requestedDate)} gewechselt.`);
    }
    return result;
  } catch (error) {
    showError(error);
    return null;
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

async function deleteAdminTimesheet(button) {
  if (!state.adminToken) {
    showToast("Bitte Admin-Bereich erneut entsperren.");
    return;
  }
  const employee = button.dataset.adminDeleteTimesheet || "";
  const date = button.dataset.timesheetDate || "";
  if (!employee || !date) return;
  if (!window.confirm(`Arbeitszeit von ${employee} am ${formatDate(date)} wirklich löschen?`)) return;
  button.disabled = true;
  button.textContent = "Löscht...";
  try {
    const result = await api("/api/state", {
      method: "POST",
      body: JSON.stringify({ action: "admin-delete-timesheet-entry", adminToken: state.adminToken, employee, date })
    });
    state.timesheets = result.timesheets || state.timesheets || {};
    renderAdminEmployeeOverview();
    showToast(`Arbeitszeit am ${formatDate(date)} gelöscht.`);
  } catch (error) {
    showError(error);
    button.disabled = false;
    button.textContent = "Löschen";
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
                  ${allowCorrection ? `<button class="danger-lite" type="button" data-admin-delete-timesheet="${escapeHtml(employee)}" data-timesheet-date="${escapeHtml(shift.date)}">Löschen</button>` : ""}
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
    revenue.invoices += reportTransferInvoiceTotal(report);
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
  populateInvoiceSettingsForm();
  renderEmployeeDirectory();
  renderPositionDirectory();
  $$("[data-chef-section]").forEach((input) => {
    input.checked = chefSectionEnabled(input.dataset.chefSection);
  });
  $$("[data-day-report-field]").forEach((input) => {
    input.checked = reportFieldEnabled(input.dataset.dayReportField);
  });
}

function normalizeInvoiceSettingsClient(value = {}) {
  const base = createDefaultInvoiceSettingsClient();
  const colors = value && typeof value === "object" ? value.colors || {} : {};
  return {
    companyName: String(value.companyName || base.companyName).trim() || base.companyName,
    companyAddress: String(value.companyAddress || base.companyAddress).trim() || base.companyAddress,
    taxNumber: String(value.taxNumber || "").trim(),
    vatId: String(value.vatId || "").trim(),
    iban: String(value.iban || "").trim(),
    bankName: String(value.bankName || "").trim(),
    bic: String(value.bic || "").trim(),
    paymentDays: Math.max(0, Math.min(120, Number(value.paymentDays ?? base.paymentDays) || base.paymentDays)),
    defaultText: String(value.defaultText || base.defaultText).trim() || base.defaultText,
    colors: {
      primary: normalizeColorHex(colors.primary, base.colors.primary),
      accent: normalizeColorHex(colors.accent, base.colors.accent),
      muted: normalizeColorHex(colors.muted, base.colors.muted),
      line: normalizeColorHex(colors.line, base.colors.line),
      highlight: normalizeColorHex(colors.highlight, base.colors.highlight)
    },
    logoData: String(value.logoData || "").trim()
  };
}

function normalizeColorHex(value, fallback = "#111827") {
  const text = String(value || "").trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(text) ? text : fallback;
}

function populateInvoiceSettingsForm() {
  const settings = normalizeInvoiceSettingsClient(state.invoiceSettings || createDefaultInvoiceSettingsClient());
  if ($("#invoiceCompanyName")) $("#invoiceCompanyName").value = settings.companyName;
  if ($("#invoiceCompanyAddress")) $("#invoiceCompanyAddress").value = settings.companyAddress;
  if ($("#invoiceTaxNumber")) $("#invoiceTaxNumber").value = settings.taxNumber;
  if ($("#invoiceVatId")) $("#invoiceVatId").value = settings.vatId;
  if ($("#invoiceIban")) $("#invoiceIban").value = settings.iban;
  if ($("#invoiceBankName")) $("#invoiceBankName").value = settings.bankName;
  if ($("#invoiceBic")) $("#invoiceBic").value = settings.bic;
  if ($("#invoicePaymentDays")) $("#invoicePaymentDays").value = String(settings.paymentDays || 14);
  if ($("#invoiceDefaultText")) $("#invoiceDefaultText").value = settings.defaultText;
  if ($("#invoiceColorPrimary")) $("#invoiceColorPrimary").value = settings.colors.primary;
  if ($("#invoiceColorAccent")) $("#invoiceColorAccent").value = settings.colors.accent;
  if ($("#invoiceColorMuted")) $("#invoiceColorMuted").value = settings.colors.muted;
  if ($("#invoiceColorLine")) $("#invoiceColorLine").value = settings.colors.line;
  if ($("#invoiceColorHighlight")) $("#invoiceColorHighlight").value = settings.colors.highlight;
  renderInvoiceLogoPreview(settings.logoData);
  if ($("#invoiceSettingsStatus")) $("#invoiceSettingsStatus").textContent = "";
}

function renderInvoiceLogoPreview(dataUrl = "") {
  const preview = $("#invoiceLogoPreview");
  if (!preview) return;
  const logoData = String(dataUrl || "").trim();
  preview.innerHTML = logoData
    ? `<img src="${escapeHtml(logoData)}" alt="Rechnungslogo">`
    : `<div class="invoice-logo-placeholder"><img src="la-bowling-print-logo.png" alt="LA Bowling"></div>`;
}

function currentInvoiceSettingsFromDom() {
  const current = normalizeInvoiceSettingsClient(state.invoiceSettings || createDefaultInvoiceSettingsClient());
  return normalizeInvoiceSettingsClient({
    ...current,
    companyName: $("#invoiceCompanyName")?.value || current.companyName,
    companyAddress: $("#invoiceCompanyAddress")?.value || current.companyAddress,
    taxNumber: $("#invoiceTaxNumber")?.value || "",
    vatId: $("#invoiceVatId")?.value || "",
    iban: $("#invoiceIban")?.value || "",
    bankName: $("#invoiceBankName")?.value || "",
    bic: $("#invoiceBic")?.value || "",
    paymentDays: $("#invoicePaymentDays")?.value || current.paymentDays,
    defaultText: $("#invoiceDefaultText")?.value || current.defaultText,
    colors: {
      primary: $("#invoiceColorPrimary")?.value || current.colors.primary,
      accent: $("#invoiceColorAccent")?.value || current.colors.accent,
      muted: $("#invoiceColorMuted")?.value || current.colors.muted,
      line: $("#invoiceColorLine")?.value || current.colors.line,
      highlight: $("#invoiceColorHighlight")?.value || current.colors.highlight
    },
    logoData: current.logoData || ""
  });
}

async function saveInvoiceSettings(button) {
  const oldText = button.textContent;
  const status = $("#invoiceSettingsStatus");
  button.disabled = true;
  button.textContent = "Speichert...";
  if (status) status.textContent = "";
  try {
    const invoiceSettings = currentInvoiceSettingsFromDom();
    const result = await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "save-invoice-settings",
        invoiceSettings
      })
    });
    state.invoiceSettings = normalizeInvoiceSettingsClient(result.invoiceSettings || invoiceSettings);
    if (state.invoiceEditorDraft) {
      state.invoiceEditorDraft = normalizeInvoiceRecordClient(state.invoiceEditorDraft, state.invoiceSettings);
      state.invoiceEditorId = state.invoiceEditorDraft.id;
    }
    if (status) status.textContent = "Rechnungseinstellungen gespeichert.";
    renderSettings();
    renderAdminInvoices();
    showToast("Rechnungseinstellungen gespeichert.");
  } catch (error) {
    if (status) status.textContent = error.message || String(error);
    showError(error);
  } finally {
    button.disabled = false;
    button.textContent = oldText;
  }
}

function resetInvoiceLogoSelection() {
  state.invoiceSettings = normalizeInvoiceSettingsClient({
    ...(state.invoiceSettings || createDefaultInvoiceSettingsClient()),
    logoData: ""
  });
  if ($("#invoiceLogoFile")) $("#invoiceLogoFile").value = "";
  renderInvoiceLogoPreview("");
  const status = $("#invoiceSettingsStatus");
  if (status) status.textContent = "Logo zurückgesetzt. Bitte noch speichern.";
  showToast("Logo zurückgesetzt. Bitte Rechnungseinstellungen speichern.");
}

async function applyInvoiceLogoFile(file) {
  if (!file) return;
  const dataUrl = await fileToDataUrl(file);
  state.invoiceSettings = normalizeInvoiceSettingsClient({
    ...(state.invoiceSettings || createDefaultInvoiceSettingsClient()),
    ...currentInvoiceSettingsFromDom(),
    logoData: dataUrl
  });
  renderInvoiceLogoPreview(dataUrl);
  const status = $("#invoiceSettingsStatus");
  if (status) status.textContent = "Neues Logo geladen. Bitte noch speichern.";
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

function formatCalendarMonthLabel(month) {
  const label = formatMonth(month || currentMonthValue());
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
}

function shiftMonthValue(month, offset) {
  const base = /^\d{4}-\d{2}$/.test(String(month || "")) ? String(month) : currentMonthValue();
  const [year, monthNumber] = base.split("-").map(Number);
  return monthValue(new Date(year, monthNumber - 1 + offset, 1));
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
  const recipient = $("#invoiceNotificationTo")?.value.trim() || "";
  if (status) status.textContent = "";
  try {
    if (recipient) {
      const savedSettings = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({ invoiceNotificationTo: recipient })
      });
      state.settings = normalizeSettings(savedSettings.settings || state.settings);
    }
    const result = await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        action: "send-invoice-test-mail",
        to: recipient
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

  $("#chefDashboard")?.addEventListener("click", async (event) => {
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
    const reportCalendarNav = event.target.closest("[data-report-calendar-nav]");
    if (reportCalendarNav) {
      const [mode, direction] = String(reportCalendarNav.dataset.reportCalendarNav || "").split("|");
      if (mode === "chef") {
        state.chefReportMonth = shiftMonthValue(ensureReportCalendarMonth("chef", ensureChefReportDateSelection()), direction === "prev" ? -1 : 1);
        renderChef();
      }
      return;
    }
    const reportCalendarDay = event.target.closest("[data-report-calendar-date]");
    if (reportCalendarDay) {
      const [mode, dateKey] = String(reportCalendarDay.dataset.reportCalendarDate || "").split("|");
      if (mode === "chef" && dateKey) {
        setReportCalendarSelection("chef", dateKey);
        await ensureTimesheetsForReportDate(dateKey);
        renderChef();
      }
      return;
    }
    const openReportButton = event.target.closest("[data-chef-open-report]");
    if (openReportButton) {
      state.chefTab = "reports";
      const reportDate = openReportButton.dataset.chefOpenReport || defaultChefReportDate();
      setReportCalendarSelection("chef", reportDate);
      await ensureTimesheetsForReportDate(reportDate);
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

  $("#chefDashboard")?.addEventListener("change", async (event) => {
    if (event.target.matches("#chefReportDate")) {
      const reportDate = event.target.value || defaultChefReportDate();
      setReportCalendarSelection("chef", reportDate);
      await ensureTimesheetsForReportDate(reportDate);
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
      const targetDate = invoiceSafeDate($("#customerInvoiceDate")?.value, state.invoiceDate || todayKey());
      const result = await api("/api/state", {
        method: "POST",
        body: JSON.stringify({
          action: "customer-invoice",
          date: targetDate,
          customer
        })
      });
      state.invoiceDate = result.date || targetDate || todayKey();
      event.target.reset();
      if ($("#customerInvoiceDate")) $("#customerInvoiceDate").value = invoiceSafeDate(state.invoiceDate, todayKey());
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
        body: JSON.stringify({ action: "login", code, date: invoiceSafeDate($("#customerInvoiceDate")?.value, state.invoiceDate || todayKey()) })
      });
      state.invoiceTerminalToken = result.token || "";
      state.invoiceDate = result.date || todayKey();
      state.invoiceReport = result.report || {};
      state.settings = normalizeSettings(result.settings || state.settings);
      state.customerDirectory = normalizeCustomerDirectory(result.customerDirectory || state.customerDirectory);
      clearInvoiceDeskDraft();
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
    clearInvoiceDeskDraft();
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

  $("#addCustomerFromMaster")?.addEventListener("click", async () => {
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
    await saveCustomerInvoiceDeskReport(null, `${customer.name} wurde als geplante Rechnung angelegt.`);
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
    const openInvoiceBuilderButton = event.target.closest("[data-open-invoice-builder]");
    if (openInvoiceBuilderButton) {
      openCustomerInvoiceBuilderForRow(openInvoiceBuilderButton);
      return;
    }
    const closeInvoiceBuilderButton = event.target.closest("[data-close-customer-invoice-builder]");
    if (closeInvoiceBuilderButton) {
      clearInvoiceDeskDraft();
      renderCustomerInvoiceDesk();
      return;
    }
    const previewInvoiceButton = event.target.closest("[data-customer-invoice-preview]");
    if (previewInvoiceButton) {
      previewCurrentDeskInvoicePdf(previewInvoiceButton, false);
      return;
    }
    const finalizeInvoiceButton = event.target.closest("[data-customer-invoice-finalize]");
    if (finalizeInvoiceButton) {
      finalizeCurrentDeskInvoice(finalizeInvoiceButton);
      return;
    }
    const finalizeDownloadInvoiceButton = event.target.closest("[data-customer-invoice-finalize-download]");
    if (finalizeDownloadInvoiceButton) {
      finalizeCurrentDeskInvoice(finalizeDownloadInvoiceButton, true);
      return;
    }
    const printInvoiceButton = event.target.closest("[data-customer-invoice-print]");
    if (printInvoiceButton) {
      printCurrentDeskInvoice(printInvoiceButton);
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

  $("#customerInvoiceDate")?.addEventListener("change", async (event) => {
    const nextDate = invoiceSafeDate(event.target.value, state.invoiceDate || todayKey());
    state.invoiceDate = nextDate;
    event.target.value = nextDate;
    const status = $("#customerInvoiceStatus");
    if (status) status.textContent = `Ausgewähltes Datum: ${formatDate(nextDate)}.`;
    if (state.invoiceTerminalToken) {
      await loadCustomerInvoiceDesk();
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
    const reportCalendarNav = event.target.closest("[data-report-calendar-nav]");
    if (reportCalendarNav) {
      const [mode, direction] = String(reportCalendarNav.dataset.reportCalendarNav || "").split("|");
      if (mode === "admin") {
        state.adminReportMonth = shiftMonthValue(ensureReportCalendarMonth("admin", ensureAdminReportDateSelection()), direction === "prev" ? -1 : 1);
        renderAdminReports();
      }
      return;
    }
    const reportCalendarDay = event.target.closest("[data-report-calendar-date]");
    if (reportCalendarDay) {
      const [mode, dateKey] = String(reportCalendarDay.dataset.reportCalendarDate || "").split("|");
      if (mode === "admin" && dateKey) {
        setReportCalendarSelection("admin", dateKey);
        renderAdminReports();
      }
      return;
    }
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
    const deleteButton = event.target.closest("[data-admin-delete-timesheet]");
    if (deleteButton) {
      deleteAdminTimesheet(deleteButton);
      return;
    }
    const button = event.target.closest("[data-admin-save-timesheet]");
    if (!button) return;
    saveAdminTimesheet(button);
  });

  $("#adminInvoices")?.addEventListener("input", (event) => {
    if (event.target.id === "invoiceSearch") {
      state.invoiceSearch = event.target.value || "";
      renderAdminInvoices();
      $("#invoiceSearch")?.focus();
      return;
    }
    if (
      event.target.matches("[data-invoice-field]") ||
      event.target.matches("[data-invoice-position-field]") ||
      event.target.matches("[data-invoice-attachment-field]")
    ) {
      state.invoiceEditorDirty = true;
      refreshInvoicePreviewOnly();
    }
  });

  $("#adminInvoices")?.addEventListener("change", async (event) => {
    if (
      event.target.matches("[data-invoice-field]") ||
      event.target.matches("[data-invoice-position-field]") ||
      event.target.matches("[data-invoice-attachment-field]")
    ) {
      state.invoiceEditorDirty = true;
      refreshInvoicePreviewOnly();
      return;
    }
    if (event.target.matches("[data-invoice-file]")) {
      try {
        await addInvoiceAttachmentsFromFiles(event.target.files || []);
      } catch (error) {
        showError(error);
      } finally {
        event.target.value = "";
      }
    }
  });

  $("#adminInvoices")?.addEventListener("click", async (event) => {
    try {
      const switchView = event.target.closest("[data-invoice-view]");
      if (switchView) {
        if (state.invoiceEditorDirty && $("#adminInvoices")?.querySelector("[data-invoice-field]")) {
          state.invoiceEditorDraft = currentInvoiceDraftFromDom();
          state.invoiceEditorId = state.invoiceEditorDraft.id;
        }
        state.invoiceAdminView = switchView.dataset.invoiceView || "overview";
        renderAdminInvoices();
        return;
      }

      const selectInvoice = event.target.closest("[data-select-invoice]");
      if (selectInvoice) {
        if (state.invoiceEditorDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
        const invoice = normalizeInvoicesClient(state.invoices || [], state.invoiceSettings || createDefaultInvoiceSettingsClient()).find((item) => item.id === selectInvoice.dataset.selectInvoice);
        if (!invoice) return;
        state.invoiceAdminView = "editor";
        setInvoiceDraftFromInvoice(invoice);
        renderAdminInvoices();
        return;
      }

      const newInvoice = event.target.closest("[data-invoice-new]");
      if (newInvoice) {
        if (state.invoiceEditorDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
        await createNewInvoiceDraft(newInvoice);
        return;
      }

      const newAdvertisingInvoice = event.target.closest("[data-invoice-new-advertising]");
      if (newAdvertisingInvoice) {
        if (state.invoiceEditorDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
        await createNewInvoiceDraft(newAdvertisingInvoice, { sourceType: "advertising" });
        return;
      }

      const importReady = event.target.closest("[data-invoice-import-ready]");
      if (importReady) {
        if (state.invoiceEditorDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
        await importInvoiceReadySource(importReady.dataset.invoiceImportReady, importReady);
        return;
      }

      const importCustomer = event.target.closest("[data-invoice-import-customer]");
      if (importCustomer) {
        if (state.invoiceEditorDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return;
        await importInvoiceFromCustomerDirectory(importCustomer);
        return;
      }

      const saveInvoice = event.target.closest("[data-invoice-save]");
      if (saveInvoice) {
        await saveCurrentInvoiceDraft(saveInvoice);
        return;
      }

      const deleteInvoice = event.target.closest("[data-invoice-delete]");
      if (deleteInvoice) {
        await deleteCurrentInvoiceDraft(deleteInvoice);
        return;
      }

      const previewInvoice = event.target.closest("[data-invoice-preview]");
      if (previewInvoice) {
        await previewCurrentInvoicePdf(previewInvoice, false);
        return;
      }

      const downloadInvoice = event.target.closest("[data-invoice-download]");
      if (downloadInvoice) {
        await previewCurrentInvoicePdf(downloadInvoice, true);
        return;
      }

      const finalizeInvoice = event.target.closest("[data-invoice-finalize]");
      if (finalizeInvoice) {
        await finalizeCurrentInvoice(finalizeInvoice);
        return;
      }

      const sendInvoice = event.target.closest("[data-invoice-send]");
      if (sendInvoice) {
        await sendCurrentInvoiceEmail(sendInvoice);
        return;
      }

      const archiveInvoice = event.target.closest("[data-invoice-archive]");
      if (archiveInvoice) {
        await archiveCurrentInvoice(archiveInvoice);
        return;
      }

      const addPosition = event.target.closest("[data-invoice-add-position]");
      if (addPosition) {
        const draft = currentInvoiceDraftFromDom();
        draft.positions.push(normalizeInvoicePositionClient({
          id: cryptoId(),
          articleNumber: "",
          description: "",
          quantity: 1,
          unit: "Stück",
          unitPrice: 0,
          taxRate: 19
        }));
        state.invoiceEditorDraft = normalizeInvoiceRecordClient(draft, state.invoiceSettings || createDefaultInvoiceSettingsClient());
        state.invoiceEditorId = state.invoiceEditorDraft.id;
        state.invoiceEditorDirty = true;
        state.invoiceSkipDomSync = true;
        renderAdminInvoices();
        return;
      }

      const removePosition = event.target.closest("[data-invoice-remove-position]");
      if (removePosition) {
        const row = removePosition.closest("[data-invoice-position-row]");
        const positionId = row?.dataset.invoicePositionId;
        if (!positionId) return;
        const draft = currentInvoiceDraftFromDom();
        draft.positions = (draft.positions || []).filter((item) => item.id !== positionId);
        state.invoiceEditorDraft = normalizeInvoiceRecordClient(draft, state.invoiceSettings || createDefaultInvoiceSettingsClient());
        state.invoiceEditorId = state.invoiceEditorDraft.id;
        state.invoiceEditorDirty = true;
        state.invoiceSkipDomSync = true;
        renderAdminInvoices();
        return;
      }

      const movePosition = event.target.closest("[data-invoice-move-position]");
      if (movePosition) {
        const row = movePosition.closest("[data-invoice-position-row]");
        const positionId = row?.dataset.invoicePositionId;
        if (!positionId) return;
        const draft = currentInvoiceDraftFromDom();
        draft.positions = moveOfferRow(draft.positions || [], positionId, movePosition.dataset.invoiceMovePosition);
        state.invoiceEditorDraft = normalizeInvoiceRecordClient(draft, state.invoiceSettings || createDefaultInvoiceSettingsClient());
        state.invoiceEditorId = state.invoiceEditorDraft.id;
        state.invoiceEditorDirty = true;
        state.invoiceSkipDomSync = true;
        renderAdminInvoices();
        return;
      }

      const removeAttachment = event.target.closest("[data-invoice-remove-attachment]");
      if (removeAttachment) {
        const row = removeAttachment.closest("[data-invoice-attachment-row]");
        const attachmentId = row?.dataset.invoiceAttachmentId;
        if (!attachmentId) return;
        const draft = currentInvoiceDraftFromDom();
        draft.attachments = (draft.attachments || []).filter((item) => item.id !== attachmentId);
        state.invoiceEditorDraft = normalizeInvoiceRecordClient(draft, state.invoiceSettings || createDefaultInvoiceSettingsClient());
        state.invoiceEditorId = state.invoiceEditorDraft.id;
        state.invoiceEditorDirty = true;
        state.invoiceSkipDomSync = true;
        renderAdminInvoices();
        return;
      }

      const correction = event.target.closest("[data-invoice-create-correction]");
      if (correction) {
        await createInvoiceFollowUp("correction", correction);
        return;
      }

      const storno = event.target.closest("[data-invoice-create-storno]");
      if (storno) {
        await createInvoiceFollowUp("storno", storno);
      }
    } catch (error) {
      showError(error);
    }
  });

  $$("#adminOffers, #terminalOffersWorkspace").forEach((offerContainer) => offerContainer.addEventListener("input", (event) => {
    if (event.target.id === "offerCustomerSearch") {
      state.offerCustomerSearch = event.target.value || "";
      renderAdminOffers();
      offerWorkspaceRoot()?.querySelector("#offerCustomerSearch")?.focus();
      return;
    }
    if (event.target.matches("[data-offer-time-input]")) {
      const rawTime = String(event.target.value || "").trim();
      if (/^\d{4}$/.test(rawTime)) event.target.value = cleanOfferTimeValue(rawTime);
    }
    const offerFieldName = event.target.dataset?.offerField || "";
    if (offerFieldName === "bowlingShoePersons") {
      state.offerShoePersonsManual = true;
    } else if (["personsAdults", "personsChildren"].includes(offerFieldName) && !state.offerShoePersonsManual) {
      const root = offerWorkspaceRoot();
      const adults = cleanOfferIntegerValue(root?.querySelector('[data-offer-field="personsAdults"]')?.value);
      const children = cleanOfferIntegerValue(root?.querySelector('[data-offer-field="personsChildren"]')?.value);
      const shoeInput = root?.querySelector('[data-offer-field="bowlingShoePersons"]');
      if (shoeInput) shoeInput.value = String(adults + children);
    }
    state.offerDraftDirty = true;
    window.requestAnimationFrame(refreshOfferLiveSummary);
  }));

  $$("#adminOffers, #terminalOffersWorkspace").forEach((offerContainer) => offerContainer.addEventListener("change", (event) => {
    state.offerDraftDirty = true;
    if (event.target.matches("[data-offer-time-input]")) {
      const normalizedTime = cleanOfferTimeValue(event.target.value);
      if (normalizedTime) event.target.value = normalizedTime;
      else if (String(event.target.value || "").trim()) {
        showToast("Bitte die Uhrzeit als HH:MM eingeben, zum Beispiel 18:00.");
        event.target.focus();
        return;
      }
    }
    if (event.target.dataset?.offerField === "bmwTreasurePackage" && event.target.value) {
      state.offerDraft = applyBmwTreasurePackage(currentOfferDraftFromDom(), event.target.value);
      state.offerDraftId = state.offerDraft.id;
      state.offerDraftDirty = true;
      renderAdminOffers();
      showToast(`${OFFER_BMW_TREASURE_PACKAGES[event.target.value].name} wurde vollständig übernommen.`);
      return;
    }
    if (offerFieldNeedsLiveRefresh(event.target)) {
      const fieldName = event.target.dataset?.offerField || "";
      const focusSelector = fieldName ? `[data-offer-field="${cssEscape(fieldName)}"]` : "";
      refreshOfferEditorComputedView(focusSelector);
    }
  }));

  $$("#adminOffers, #terminalOffersWorkspace").forEach((offerContainer) => offerContainer.addEventListener("click", async (event) => {
    const bmwPackage = event.target.closest("[data-offer-bmw-package]");
    if (bmwPackage) {
      state.offerDraft = applyBmwTreasurePackage(currentOfferDraftFromDom(), bmwPackage.dataset.offerBmwPackage);
      state.offerDraftId = state.offerDraft.id;
      state.offerDraftDirty = true;
      renderAdminOffers();
      showToast(`${OFFER_BMW_TREASURE_PACKAGES[bmwPackage.dataset.offerBmwPackage].name} wurde vollständig übernommen.`);
      return;
    }
    const editorStepButton = event.target.closest("[data-offer-editor-step]");
    if (editorStepButton) {
      state.offerCustomerSearch = offerWorkspaceRoot()?.querySelector("#offerCustomerSearch")?.value || state.offerCustomerSearch || "";
      state.offerDraft = currentOfferDraftFromDom();
      state.offerDraftId = state.offerDraft.id;
      state.offerDraftDirty = true;
      state.offerEditorStep = Number(editorStepButton.dataset.offerEditorStep || 1);
      renderAdminOffers();
      offerWorkspaceRoot()?.querySelector(".offer-wizard-steps")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const serviceToggle = event.target.closest("[data-offer-service-toggle]");
    if (serviceToggle) {
      const key = serviceToggle.dataset.offerServiceToggle;
      const section = serviceToggle.closest(".offer-service-card");
      state.offerServiceExpanded = { ...(state.offerServiceExpanded || {}), [key]: !section?.classList.contains("is-expanded") };
      section?.classList.toggle("is-expanded");
      serviceToggle.querySelector("b").textContent = section?.classList.contains("is-expanded") ? "Schließen" : (section?.classList.contains("is-selected") ? "Ausgewählt" : "Öffnen");
      return;
    }
    const scrollSavedOffers = event.target.closest("[data-offer-scroll-saved]");
    if (scrollSavedOffers) {
      offerWorkspaceRoot()?.querySelector(".offer-sidebar")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
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
      const templateKey = currentOfferDraftFromDom().buffet.templateKey || offerWorkspaceRoot()?.querySelector('[data-offer-field="buffetTemplateKey"]')?.value || "";
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
      const customerId = draft.customerDirectoryId || offerWorkspaceRoot()?.querySelector('[data-offer-field="customerDirectoryId"]')?.value || "";
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
    const confirmOffer = event.target.closest("[data-offer-confirm]");
    if (confirmOffer) {
      await toggleOfferConfirmed(confirmOffer.dataset.offerConfirm, confirmOffer);
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
    const addSpecialOpening = event.target.closest("[data-offer-add-special-opening]");
    if (addSpecialOpening) {
      const draft = currentOfferDraftFromDom();
      const existing = (draft.costs || []).find((item) => String(item.label || "").trim().toLowerCase() === "sonderöffnung");
      if (!existing) {
        draft.costs.push({
          id: cryptoId(),
          label: "Sonderöffnung",
          quantity: 1,
          unitPrice: 0,
          note: ""
        });
      }
      state.offerDraft = draft;
      state.offerDraftId = draft.id;
      state.offerDraftDirty = false;
      state.offerServiceExpanded.costs = true;
      renderAdminOffers();
      offerWorkspaceRoot()?.querySelector('.offer-special-opening-row [data-offer-cost-unit]')?.focus();
      if (existing) showToast("Die Sonderöffnungsgebühr ist bereits angelegt.");
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
  }));

  $("#adminContent")?.addEventListener("change", (event) => {
    if (event.target.matches("#adminReportDate")) {
      setReportCalendarSelection("admin", event.target.value || defaultAdminReportDate());
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
  $("#saveInvoiceSettings")?.addEventListener("click", () => saveInvoiceSettings($("#saveInvoiceSettings")));
  $("#resetInvoiceLogo")?.addEventListener("click", resetInvoiceLogoSelection);
  $("#invoiceLogoFile")?.addEventListener("change", async (event) => {
    const [file] = [...(event.target.files || [])];
    if (!file) return;
    try {
      await applyInvoiceLogoFile(file);
    } catch (error) {
      event.target.value = "";
      showError(error);
    }
  });

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

  $("#terminalTaskFrequency")?.addEventListener("change", updateTerminalTaskEditorFields);
  $("#terminalTaskAreaFilter")?.addEventListener("change", (event) => { state.terminalTaskAreaFilter = event.target.value; renderTerminalTaskCalendar(); });
  $("#terminalTaskTypeFilter")?.addEventListener("change", (event) => { state.terminalTaskTypeFilter = event.target.value; renderTerminalTaskCalendar(); });
  $("#terminalTaskStatusFilter")?.addEventListener("change", (event) => { state.terminalTaskStatusFilter = event.target.value; renderTerminalTaskCalendar(); });
  $("#terminalTaskSearch")?.addEventListener("input", (event) => { state.terminalTaskSearch = event.target.value; renderTerminalTaskCalendar(); });

  $("#terminalContent")?.addEventListener("click", async (event) => {
    if (event.target.closest("[data-open-terminal-toilet-check]")) {
      openTerminalToiletConfirm();
      return;
    }
    const taskView = event.target.closest("[data-task-calendar-view]");
    if (taskView) {
      state.terminalTaskCalendarView = taskView.dataset.taskCalendarView;
      renderTerminalTaskCalendar();
      return;
    }
    const taskMonthNav = event.target.closest("[data-task-month-nav]");
    if (taskMonthNav) {
      if (taskMonthNav.dataset.taskMonthNav === "today") {
        state.terminalTaskCalendarMonth = currentMonthValue();
        state.terminalTaskCalendarDate = todayKey();
      } else {
        const date = new Date(`${state.terminalTaskCalendarMonth || currentMonthValue()}-01T12:00:00`);
        date.setMonth(date.getMonth() + (taskMonthNav.dataset.taskMonthNav === "next" ? 1 : -1));
        state.terminalTaskCalendarMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }
      renderTerminalTaskCalendar();
      return;
    }
    const taskDate = event.target.closest("[data-terminal-task-date]");
    if (taskDate && !event.target.closest("[data-terminal-task-edit]")) {
      state.terminalTaskCalendarDate = taskDate.dataset.terminalTaskDate;
      renderTerminalTaskCalendar();
      return;
    }
    const taskEdit = event.target.closest("[data-terminal-task-edit]");
    if (taskEdit) {
      loadTerminalTaskEditor(taskEdit.dataset.terminalTaskEdit);
      return;
    }
    const areaFilter = event.target.closest("[data-terminal-area-filter]");
    if (areaFilter) {
      state.terminalTaskAreaFilter = areaFilter.dataset.terminalAreaFilter;
      renderTerminalTaskCalendar();
      return;
    }
    if (event.target.closest("#newTerminalCalendarTask")) {
      resetTerminalTaskEditor();
      $("#terminalTaskTitle")?.focus();
      return;
    }
    if (event.target.closest("#openTaskTemplates")) {
      state.terminalTaskCalendarView = "list";
      renderTerminalTaskCalendar();
      return;
    }
    if (event.target.closest("#resetTerminalTaskFilters")) {
      state.terminalTaskAreaFilter = "all";
      state.terminalTaskTypeFilter = "all";
      state.terminalTaskStatusFilter = "active";
      state.terminalTaskSearch = "";
      if ($("#terminalTaskSearch")) $("#terminalTaskSearch").value = "";
      renderTerminalTaskCalendar();
      return;
    }
    if (event.target.closest("#manageTerminalTaskAreas")) return openTerminalTaskAreaManager();
    if (event.target.closest("#closeTerminalTaskAreas")) return closeTerminalTaskAreaManager();
    if (event.target.id === "terminalTaskAreaModal") return closeTerminalTaskAreaManager();
    const areaEdit = event.target.closest("[data-terminal-task-area-edit]");
    if (areaEdit) {
      const area = (state.terminalTaskAreas || []).find((item) => item.id === areaEdit.dataset.terminalTaskAreaEdit);
      if (area) {
        $("#terminalTaskAreaId").value = area.id;
        $("#terminalTaskAreaName").value = area.name;
        $("#terminalTaskAreaColor").value = area.color;
        $("#terminalTaskAreaActive").checked = area.active !== false;
      }
      return;
    }
    const areaDelete = event.target.closest("[data-terminal-task-area-delete]");
    if (areaDelete) {
      const area = (state.terminalTaskAreas || []).find((item) => item.id === areaDelete.dataset.terminalTaskAreaDelete);
      if (!area || !confirm(`Bereich "${area.name}" löschen?`)) return;
      try {
        await terminalAction({ action: "delete-task-area", id: area.id });
        renderTerminalTaskCalendar();
        showToast("Bereich gelöscht.");
      } catch (error) { showError(error); }
      return;
    }
    const saveArea = event.target.closest("#saveTerminalTaskArea");
    if (saveArea) return saveTerminalTaskArea(saveArea);
    const saveTask = event.target.closest("#saveTerminalTask");
    if (saveTask) return saveTerminalCalendarTask(saveTask);
    const deleteTask = event.target.closest("#deleteTerminalTask");
    if (deleteTask) return deleteTerminalCalendarTask(deleteTask);
    if (event.target.closest("#cancelTerminalTask")) {
      resetTerminalTaskEditor();
      return;
    }
    const dateShortcut = event.target.closest("[data-terminal-date-shortcut]");
    if (dateShortcut) {
      const date = dateShortcut.dataset.terminalDateShortcut === "tomorrow" ? terminalRelativeDate(1) : todayKey();
      await loadTerminalWorkDate(date, dateShortcut);
      return;
    }
    const eventWeekStep = event.target.closest("[data-event-week-step]");
    if (eventWeekStep) {
      const date = new Date(`${state.terminalEventWeek || eventCalendarWeekStart(state.terminalDate || todayKey())}T12:00:00`);
      date.setDate(date.getDate() + Number(eventWeekStep.dataset.eventWeekStep || 0));
      state.terminalEventWeek = isoDate(date);
      renderTerminalEventCalendar();
      return;
    }
    if (event.target.closest("[data-event-week-today]")) {
      state.terminalEventWeek = eventCalendarWeekStart(todayKey());
      renderTerminalEventCalendar();
      return;
    }
    const extraDate = event.target.closest("[data-terminal-extra-date]");
    if (extraDate) {
      await loadTerminalWorkDate(extraDate.dataset.terminalExtraDate, extraDate);
      return;
    }
    const extraTabTarget = event.target.closest("[data-terminal-tab-target]");
    if (extraTabTarget) {
      state.terminalTab = terminalWorkspaceTab(extraTabTarget.dataset.terminalTabTarget);
      renderTerminalTabs();
      return;
    }
    const worktimeDateStep = event.target.closest("[data-worktime-date-step]");
    if (worktimeDateStep) {
      const current = new Date(`${state.terminalDate || todayKey()}T12:00:00`);
      current.setDate(current.getDate() + Number(worktimeDateStep.dataset.worktimeDateStep || 0));
      await loadTerminalWorkDate(isoDate(current), worktimeDateStep);
      return;
    }
    if (event.target.closest("[data-focus-terminal-date-picker]")) {
      const picker = $("#terminalSidebarDatePicker") || $("#terminalDatePicker");
      if (typeof picker?.showPicker === "function") picker.showPicker();
      else picker?.click();
      return;
    }
    const openEmployees = event.target.closest("[data-open-terminal-employees]");
    if (openEmployees) {
      const focusAction = openEmployees.dataset.terminalWorktimeFocus || "";
      const focusEmployee = openEmployees.dataset.terminalPreviewEmployee || "";
      state.terminalTab = "employees";
      renderTerminalTabs();
      window.requestAnimationFrame(() => {
        const serviceSection = $("#terminalServiceSection");
        const employeeCard = focusEmployee
          ? serviceSection?.querySelector(`[data-terminal-employee-card="${cssEscape(focusEmployee)}"]`)
          : null;
        (employeeCard || serviceSection)?.scrollIntoView({ behavior: "smooth", block: "start" });
        employeeCard?.classList.add("is-highlighted");
        if (employeeCard) window.setTimeout(() => employeeCard.classList.remove("is-highlighted"), 1600);
        const selector = focusAction === "start"
          ? '[data-terminal-punch="start"]:not(:disabled)'
          : focusAction === "end"
            ? '[data-terminal-punch="end"]:not(:disabled)'
            : focusAction === "break"
              ? '[data-terminal-break]:not(:disabled)'
              : "";
        if (selector) serviceSection?.querySelector(selector)?.focus();
      });
      return;
    }
    const settingsPlaceholder = event.target.closest("[data-terminal-settings-placeholder]");
    if (settingsPlaceholder) {
      const notice = $("#terminalSettingsInlineNotice");
      if (notice) {
        notice.textContent = `${settingsPlaceholder.dataset.terminalSettingsPlaceholder} wird später eingerichtet.`;
        notice.classList.remove("hidden");
      }
      return;
    }
    const settingsModule = event.target.closest("[data-terminal-settings-module]");
    if (settingsModule) {
      const requestedModule = settingsModule.dataset.terminalSettingsModule;
      state.terminalSettingsModule = ["table-plan", "closures"].includes(requestedModule) ? requestedModule : "controls";
      if (state.terminalSettingsModule === "table-plan") state.terminalTableView = "manage";
      if (state.terminalSettingsModule === "closures") {
        const today = todayKey();
        if (!$("#terminalClosureFrom")?.value) $("#terminalClosureFrom").value = today;
        if (!$("#terminalClosureTo")?.value) $("#terminalClosureTo").value = today;
        if (!$("#terminalReopenDate")?.value) $("#terminalReopenDate").value = today;
      }
      renderTerminalTabs();
      return;
    }
    const reopenTerminalDate = event.target.closest("#reopenTerminalDate");
    if (reopenTerminalDate) {
      const date = $("#terminalReopenDate")?.value || "";
      if (!date) { showToast("Bitte einen Tag auswählen."); return; }
      const oldText = reopenTerminalDate.textContent;
      reopenTerminalDate.disabled = true;
      reopenTerminalDate.textContent = "Wird geöffnet...";
      try {
        const result = await terminalAction({ action: "reopen-business-day", targetDate: date });
        const status = $("#terminalClosureStatus");
        if (status) { status.textContent = result.message; status.classList.remove("hidden"); }
        showToast(result.message);
      } catch (error) {
        showError(error);
      } finally {
        reopenTerminalDate.disabled = false;
        reopenTerminalDate.textContent = oldText;
      }
      return;
    }
    const newControl = event.target.closest("#newTerminalControl");
    if (newControl) {
      openTerminalControlForm();
      return;
    }
    const cancelControl = event.target.closest("#cancelTerminalControl");
    if (cancelControl) {
      closeTerminalControlForm();
      return;
    }
    const editControl = event.target.closest("[data-edit-terminal-control]");
    if (editControl) {
      const control = loadTerminalControls().find((item) => item.id === editControl.dataset.editTerminalControl);
      if (control) openTerminalControlForm(control);
      return;
    }
    const toggleControl = event.target.closest("[data-toggle-terminal-control]");
    if (toggleControl) {
      const control = loadTerminalControls().find((item) => item.id === toggleControl.dataset.toggleTerminalControl);
      if (control) {
        control.active = !control.active;
        saveTerminalControls();
        renderTerminalControlManagement();
        renderTerminalChecks(state.terminalReport || {});
      }
      return;
    }
    const deleteControl = event.target.closest("[data-delete-terminal-control]");
    if (deleteControl) {
      state.terminalControlDeleteId = deleteControl.dataset.deleteTerminalControl;
      const control = loadTerminalControls().find((item) => item.id === state.terminalControlDeleteId);
      const confirm = $("#terminalControlDeleteConfirm");
      if (confirm && control) {
        confirm.innerHTML = `
          <span><strong>${escapeHtml(control.name)}</strong> wirklich löschen?</span>
          <button class="danger-button" type="button" data-confirm-delete-terminal-control>Löschen</button>
          <button class="secondary" type="button" data-cancel-delete-terminal-control>Abbrechen</button>
        `;
        confirm.classList.remove("hidden");
      }
      return;
    }
    if (event.target.closest("[data-cancel-delete-terminal-control]")) {
      state.terminalControlDeleteId = "";
      $("#terminalControlDeleteConfirm")?.classList.add("hidden");
      return;
    }
    if (event.target.closest("[data-confirm-delete-terminal-control]")) {
      state.terminalControls = loadTerminalControls().filter((item) => item.id !== state.terminalControlDeleteId);
      state.terminalControlDeleteId = "";
      saveTerminalControls();
      $("#terminalControlDeleteConfirm")?.classList.add("hidden");
      renderTerminalControlManagement();
      renderTerminalChecks(state.terminalReport || {});
      return;
    }
    const completeControl = event.target.closest("[data-complete-terminal-control]");
    if (completeControl) {
      const control = loadTerminalControls().find((item) => item.id === completeControl.dataset.completeTerminalControl);
      if (control) {
        control.status = "ok";
        control.lastLabel = "gerade eben";
        control.nextLabel = terminalControlIntervalLabel(control);
        saveTerminalControls();
        renderTerminalChecks(state.terminalReport || {});
        showToast(`${control.name} erledigt.`);
      }
      return;
    }
    const checkManualReport = event.target.closest("[data-check-manual-report]");
    if (checkManualReport) {
      const key = checkManualReport.dataset.checkManualReport || "";
      if (!manualReportTransferItems().some((item) => item.key === key)) return;
      state.terminalManualReportCopied[key] = true;
      state.terminalManualReportComplete = false;
      renderManualReportTransfer();
      return;
    }
    if (event.target.closest("[data-reset-manual-report]")) {
      state.terminalManualReportCopied = {};
      state.terminalManualReportComplete = false;
      renderManualReportTransfer();
      return;
    }
    if (event.target.closest("[data-complete-manual-report]")) {
      const items = manualReportTransferItems();
      if (!items.every((item) => state.terminalManualReportCopied[item.key])) return;
      state.terminalManualReportComplete = true;
      state.terminalClosingStep = 5;
      renderTerminalClosingSteps();
      return;
    }
    const copyPentacodeValue = event.target.closest("[data-copy-pentacode-value]");
    if (copyPentacodeValue) {
      const key = copyPentacodeValue.dataset.copyPentacodeValue || "";
      const item = pentacodeTransferItems().find((entry) => entry.key === key);
      if (!item) return;
      if (item.available) await copyText(pentacodeCopyValue(item));
      state.terminalPentacodeCopied[key] = true;
      state.terminalPentacodeComplete = false;
      renderPentacodeTransfer();
      showToast(item.available ? `${item.label} kopiert.` : `${item.label} als nicht verfügbar bestätigt.`);
      return;
    }
    if (event.target.closest("[data-reset-pentacode-transfer]")) {
      state.terminalPentacodeCopied = {};
      state.terminalPentacodeComplete = false;
      renderPentacodeTransfer();
      return;
    }
    if (event.target.closest("[data-complete-pentacode-transfer]")) {
      const items = pentacodeTransferItems();
      if (!items.every((item) => state.terminalPentacodeCopied[item.key])) return;
      state.terminalPentacodeComplete = true;
      state.terminalClosingStep = 3;
      renderTerminalClosingSteps();
      return;
    }
    const closingStep = event.target.closest("[data-closing-step]");
    if (closingStep) {
      state.terminalClosingStep = Number(closingStep.dataset.closingStep || 1);
      renderTerminalClosingSteps();
      return;
    }
    const tab = event.target.closest("[data-terminal-tab]");
    if (tab) {
      state.terminalTab = tab.dataset.terminalTab;
      if (state.terminalTab === "closing") state.terminalClosingStep = 1;
      if (state.terminalTab === "tables") state.terminalTableView = "work";
      if (state.terminalTab === "settings") {
        state.terminalSettingsModule = tab.dataset.terminalSettingsTarget === "table-plan"
          ? "table-plan"
          : (state.terminalSettingsModule || "controls");
      }
      renderTerminal();
      return;
    }
    const tablePlanFullscreenPreview = event.target.closest("[data-open-table-plan-fullscreen]");
    if (tablePlanFullscreenPreview) {
      await loadTerminalTableDate(state.terminalDate || todayKey());
      state.terminalTab = "tables";
      state.terminalTableView = "work";
      state.terminalTableFullscreen = true;
      renderTerminal();
      return;
    }
    const tomorrowTablePlanButton = event.target.closest("[data-open-tomorrow-table-plan]");
    if (tomorrowTablePlanButton) {
      const tomorrow = assignmentDateKeys(state.terminalDate || todayKey())[1];
      await loadTerminalTableDate(tomorrow);
      state.terminalTab = "tables";
      state.terminalTableView = "work";
      renderTerminal();
      return;
    }
    const toggleTasks = event.target.closest("[data-terminal-toggle-tasks]");
    if (toggleTasks) {
      state.terminalTasksExpanded = toggleTasks.dataset.terminalToggleTasks === "all";
      renderTerminalTasks(state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const toggleMessages = event.target.closest("[data-terminal-toggle-messages]");
    if (toggleMessages) {
      state.terminalMessagesExpanded = toggleMessages.dataset.terminalToggleMessages === "all";
      renderTerminalLeaderMessages(state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const openTerminalDateButton = event.target.closest("[data-open-terminal-date]");
    if (openTerminalDateButton) {
      await loadTerminalWorkDate(openTerminalDateButton.dataset.openTerminalDate || "", openTerminalDateButton);
      return;
    }
    const loadTerminalDateButton = event.target.closest("#loadTerminalDate");
    if (loadTerminalDateButton) {
      await loadTerminalWorkDate($("#terminalJumpDate")?.value || "", loadTerminalDateButton);
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
    const openQuickTableReservationButton = event.target.closest("#openNewTableReservation");
    if (openQuickTableReservationButton) {
      startNewTerminalTableReservation({ keepSelection: false, openManage: false });
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      window.requestAnimationFrame(() => $("#tablePlanSelectedDetail [data-table-plan-field='time']")?.focus());
      return;
    }
    const newManagedTableReservationButton = event.target.closest("[data-table-plan-new-manage]");
    if (newManagedTableReservationButton) {
      startNewTerminalTableReservation({ keepSelection: false, openManage: true });
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      window.requestAnimationFrame(() => $("#tablePlanName")?.focus());
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
    const rotateTableButton = event.target.closest("[data-table-plan-rotate]");
    if (rotateTableButton) {
      await rotateTerminalTable(rotateTableButton.dataset.tablePlanRotate);
      return;
    }
    if (tableButton) {
      if (Date.now() < Number(state.terminalTablePlanSuppressClickUntil || 0)) {
        state.terminalTablePlanSuppressClickUntil = 0;
        return;
      }
      toggleTerminalTableSelection(String(tableButton.dataset.tablePlanSelect || "").split(","));
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const editReservationAndManageButton = event.target.closest("[data-table-plan-edit-manage]");
    if (editReservationAndManageButton) {
      loadTerminalTableDraft(editReservationAndManageButton.dataset.tablePlanEditManage);
      setTerminalTableView("manage");
      return;
    }
    const editReservationButton = event.target.closest("[data-table-plan-edit]");
    if (editReservationButton) {
      loadTerminalTableDraft(editReservationButton.dataset.tablePlanEdit);
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const quickReservationCancelButton = event.target.closest("[data-table-plan-quick-cancel]");
    if (quickReservationCancelButton) {
      resetTerminalTableDraft();
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const saveQuickTableReservationButton = event.target.closest("#saveQuickTableReservation");
    if (saveQuickTableReservationButton) {
      await saveTerminalTableReservation(saveQuickTableReservationButton);
      return;
    }
    const tablePlanStatusActionButton = event.target.closest("[data-table-plan-status-action]");
    if (tablePlanStatusActionButton) {
      updateTerminalTableDraftField("status", tablePlanStatusActionButton.dataset.tablePlanStatusAction);
      await saveTerminalTableReservation(tablePlanStatusActionButton);
      return;
    }
    const tablePlanPrintDetailButton = event.target.closest("[data-table-plan-print-detail]");
    if (tablePlanPrintDetailButton) {
      printTerminalTablePlanList();
      return;
    }
    const tablePlanDeleteDetailButton = event.target.closest("[data-table-plan-delete-detail]");
    if (tablePlanDeleteDetailButton) {
      await deleteTerminalTableReservation(tablePlanDeleteDetailButton);
      return;
    }
    const addNzBigTableButton = event.target.closest("#addNzBigTable");
    if (addNzBigTableButton) {
      await addTerminalNzBigTable(addNzBigTableButton);
      return;
    }
    const removeNzBigTableButton = event.target.closest("[data-remove-nz-big-table]");
    if (removeNzBigTableButton) {
      await removeTerminalNzBigTable(removeNzBigTableButton, removeNzBigTableButton.dataset.removeNzBigTable);
      return;
    }
    const addHutTableButton = event.target.closest("#addHutTable");
    if (addHutTableButton) {
      await addTerminalHutTable(addHutTableButton);
      return;
    }
    const removeHutTableButton = event.target.closest("[data-remove-hut-table]");
    if (removeHutTableButton) {
      await removeTerminalHutTable(removeHutTableButton, removeHutTableButton.dataset.removeHutTable);
      return;
    }
    const resetTablePlanButton = event.target.closest("#resetTablePlanDraft");
    if (resetTablePlanButton) {
      resetTerminalTableDraft();
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const focusTablePlanBoardButton = event.target.closest("#focusTablePlanBoard");
    if (focusTablePlanBoardButton) {
      $("#tablePlanBoard")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const newReservationForSelectionButton = event.target.closest("#newTablePlanReservationForSelection");
    if (newReservationForSelectionButton) {
      startNewTerminalTableReservation();
      renderTerminalTablePlan(state.terminalDate || todayKey(), state.terminalReport || {}, Boolean(state.terminalReport?.closed));
      return;
    }
    const connectSelectedTablesButton = event.target.closest("#connectSelectedTables, #connectTablesFromToolbar");
    if (connectSelectedTablesButton) {
      await connectSelectedTerminalTables(connectSelectedTablesButton);
      return;
    }
    const disconnectSelectedTablesButton = event.target.closest("#disconnectSelectedTables");
    if (disconnectSelectedTablesButton) {
      await disconnectSelectedTerminalTables(disconnectSelectedTablesButton);
      return;
    }
    const disconnectTablesFromToolbarButton = event.target.closest("#disconnectTablesFromToolbar");
    if (disconnectTablesFromToolbarButton) {
      await disconnectSelectedTerminalTables(disconnectTablesFromToolbarButton);
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
    const printTableReservationButton = event.target.closest("#printTablePlanReservation");
    if (printTableReservationButton) {
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
    const openDashboardHandover = event.target.closest("[data-open-handover-dashboard]");
    if (openDashboardHandover) {
      state.terminalTab = "employees";
      renderTerminalTabs();
      openTerminalHandoverModal();
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

  $("#terminalContent")?.addEventListener("toggle", (event) => {
    const details = event.target;
    if (!(details instanceof HTMLElement) || details.id !== "terminalOpenDaysDetails") return;
    state.terminalOpenDaysExpanded = details.hasAttribute("open");
  }, true);

  $("#terminalControlForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const control = collectTerminalControlForm();
    if (!control.name) {
      $("#terminalControlName")?.focus();
      return;
    }
    const index = loadTerminalControls().findIndex((item) => item.id === state.terminalControlDraftId);
    if (index >= 0) {
      state.terminalControls[index] = control;
    } else {
      state.terminalControls.push(control);
    }
    saveTerminalControls();
    closeTerminalControlForm();
    renderTerminalControlManagement();
    renderTerminalChecks(state.terminalReport || {});
    showToast("Kontrolle gespeichert.");
  });

  $("#terminalClosureForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const from = $("#terminalClosureFrom")?.value || "";
    const to = $("#terminalClosureTo")?.value || "";
    const label = $("#terminalClosureLabel")?.value.trim() || "Betriebsurlaub";
    if (!from || !to) {
      showToast("Bitte den gesamten Zeitraum auswählen.");
      return;
    }
    if (to < from) {
      showToast("Der letzte Tag muss nach dem ersten Tag liegen.");
      return;
    }
    if (!window.confirm(`${formatDate(from)} bis ${formatDate(to)} als ${label} schließen?`)) return;
    const button = $("#closeTerminalDateRange");
    const oldText = button?.textContent || "Zeitraum schließen";
    if (button) {
      button.disabled = true;
      button.textContent = "Wird geschlossen...";
    }
    try {
      const result = await terminalAction({ action: "close-business-range", from, to, label });
      const status = $("#terminalClosureStatus");
      if (status) {
        status.textContent = result.message;
        status.classList.remove("hidden");
      }
      showToast(result.message);
    } catch (error) {
      showError(error);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = oldText;
      }
    }
  });

  $("#terminalContent")?.addEventListener("change", async (event) => {
    const datePicker = event.target.closest("#terminalDatePicker, #terminalSidebarDatePicker");
    if (datePicker) {
      await loadTerminalWorkDate(datePicker.value, datePicker);
      return;
    }
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

  $("#openHandover")?.addEventListener("click", openTerminalHandoverModal);

  $("#closeHandover")?.addEventListener("click", () => {
    $("#handoverModal")?.classList.add("hidden");
  });

  $("#cancelTerminalToiletCheck")?.addEventListener("click", closeTerminalToiletConfirm);
  $("#terminalToiletConfirm")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeTerminalToiletConfirm();
  });
  $("#confirmTerminalToiletCheck")?.addEventListener("click", async () => {
    const button = $("#confirmTerminalToiletCheck");
    button.disabled = true;
    try {
      const result = await terminalAction({
        action: "confirm-toilet",
        checkKey: state.terminalManualToiletCheckKey,
        text: "Toiletten-Kontrolle durchführen"
      });
      $("#terminalToiletConfirm")?.classList.add("hidden");
      state.terminalManualToiletCheckKey = "";
      renderTerminalChecks(state.terminalReport || {});
      showToast(result.message || "Toiletten-Kontrolle quittiert.");
    } catch (error) {
      showError(error);
    } finally {
      button.disabled = false;
    }
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
    if (state.terminalTableView === "manage") {
      event.preventDefault();
      return;
    }
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

  $("#tablePlanBoard")?.addEventListener("pointerdown", (event) => {
    if (state.terminalTableView !== "manage") return;
    if (event.target.closest("[data-table-plan-rotate]")) {
      event.stopPropagation();
      return;
    }
    const table = event.target.closest("[data-table-plan-select]");
    if (!table) return;
    const resizeHandle = event.target.closest("[data-table-plan-resize]");
    beginTerminalTablePlanInteraction(event, table.dataset.tablePlanSelect, resizeHandle ? "resize" : "move");
  });

  window.addEventListener("pointermove", (event) => {
    updateTerminalTablePlanInteraction(event);
  });

  window.addEventListener("pointerup", async (event) => {
    await endTerminalTablePlanInteraction(event);
  });

  window.addEventListener("pointercancel", (event) => {
    endTerminalTablePlanInteraction(event);
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
    const breakButton = event.target.closest("[data-terminal-break]");
    if (breakButton) {
      const oldText = breakButton.textContent;
      breakButton.disabled = true;
      breakButton.textContent = "Speichert...";
      try {
        const result = await terminalAction({
          action: "break-punch",
          employee: breakButton.dataset.terminalEmployee,
          breakType: breakButton.dataset.terminalBreak
        });
        showToast(result.message || "Pause gespeichert.");
      } catch (error) {
        showError(error);
      } finally {
        breakButton.textContent = oldText;
        breakButton.disabled = false;
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
    list.insertAdjacentHTML("beforeend", invoiceRowHtml({ sourceDate: state.terminalInvoiceDate || todayKey() }));
  });

  $("#terminalInvoicesToolDate")?.addEventListener("change", (event) => {
    const date = String(event.target.value || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayKey()) {
      event.target.value = state.terminalInvoiceDate || todayKey();
      showToast("Bitte ein gültiges Datum bis heute wählen.");
      return;
    }
    state.terminalInvoiceDate = date;
    state.terminalInvoiceToolView = "current";
    renderTerminalInvoiceToolView();
  });

  $("#addExpense")?.addEventListener("click", () => {
    const list = $("#expensesList");
    if (!list) return;
    if (list.querySelector(".hint")) list.innerHTML = "";
    list.insertAdjacentHTML("beforeend", expenseRowHtml());
    syncCashExpensesFromExpenseRows(false);
    updateReportBarTotal();
  });

  $("#openAddExpense")?.addEventListener("click", () => {
    if (state.terminalReport?.closed) return;
    const list = $("#expensesList");
    if (!list) return;
    if (list.querySelector(".hint")) list.innerHTML = "";
    list.insertAdjacentHTML("beforeend", expenseRowHtml());
    syncCashExpensesFromExpenseRows(true);
    updateReportBarTotal();
    openFinanceModal("expenseDetailsModal");
    list.lastElementChild?.querySelector("[data-report-field='name']")?.focus();
  });

  $("#addMiscIncome")?.addEventListener("click", () => {
    const list = $("#miscIncomeList");
    if (!list || state.terminalReport?.closed) return;
    if (list.querySelector(".finance-empty-row")) list.innerHTML = "";
    list.insertAdjacentHTML("beforeend", miscIncomeRowHtml());
    list.lastElementChild?.querySelector("[data-report-field='name']")?.focus();
    renderMiscIncomeTotal();
  });

  $("#miscIncomeList")?.addEventListener("input", () => {
    renderMiscIncomeTotal();
    updateReportBarTotal();
  });

  $("#miscIncomeList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-misc-income]");
    if (!button || state.terminalReport?.closed) return;
    button.closest("[data-report-entry='misc-income']")?.remove();
    if (!$("#miscIncomeList")?.children.length) renderMiscIncomeList([]);
    updateReportBarTotal();
  });

  $("#terminalFinanceSection")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-invoice-details]")) {
      state.terminalTab = "invoices";
      renderTerminal();
      return;
    }
    const editExpense = event.target.closest("[data-edit-expense]");
    if (editExpense) {
      openFinanceModal("expenseDetailsModal");
      const row = $$("#expensesList [data-report-entry='expense']").find((item) => item.dataset.id === editExpense.dataset.editExpense);
      row?.scrollIntoView({ block: "center" });
      row?.querySelector("[data-report-field='name']")?.focus();
      return;
    }
    const deleteExpense = event.target.closest("[data-delete-expense]");
    if (deleteExpense) {
      const row = $$("#expensesList [data-report-entry='expense']").find((item) => item.dataset.id === deleteExpense.dataset.deleteExpense);
      const removeButton = row?.querySelector("[data-remove-report-entry]");
      if (removeButton && window.confirm("Ausgabe wirklich löschen?")) removeTerminalFinanceEntry(removeButton);
      return;
    }
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
    const removeClosingDocumentButton = event.target.closest("[data-remove-closing-document]");
    if (removeClosingDocumentButton) {
      const id = removeClosingDocumentButton.dataset.removeClosingDocument;
      if (!id || !window.confirm("Dokument wirklich entfernen?")) return;
      if (id.startsWith("fixed-")) {
        clearReportDocumentFields(id.slice(6));
      } else {
        state.terminalReport.documents.attachments = reportDocumentAttachments().filter((item) => item.id !== id);
      }
      renderClosingDocumentsStep();
      saveReportDocumentsNow(removeClosingDocumentButton, "Dokument entfernt.");
      return;
    }
    const removeButton = event.target.closest("[data-remove-report-entry]");
    if (!removeButton) return;
    removeTerminalFinanceEntry(removeButton);
  });

  $("#terminalFinanceSection")?.addEventListener("change", (event) => {
    if (event.target.matches("[data-closing-document-upload]")) {
      addClosingDocumentFiles(event.target, event.target.dataset.closingDocumentUpload).catch(showError);
      return;
    }
    const input = event.target.closest("#reportDocumentPenta, #reportDocumentHandwriting, #reportDocumentEcCut");
    if (!input || !input.files?.length) return;
    saveReportDocumentsNow(input, `${reportDocumentLabelForInput(input)} gespeichert.`);
  });

  $("#terminalInvoicesToolSection")?.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-invoice-tool-view]");
    if (viewButton) {
      state.terminalInvoiceToolView = viewButton.dataset.invoiceToolView || "current";
      renderTerminalInvoiceToolView();
      return;
    }
    const historyPdfButton = event.target.closest("[data-history-invoice-pdf]");
    if (historyPdfButton) {
      terminalInvoicePdf(historyPdfButton.dataset.invoiceDate, historyPdfButton.dataset.invoiceId, historyPdfButton);
      return;
    }
    const row = event.target.closest('[data-report-entry="invoice"]');
    const stepButton = event.target.closest("[data-invoice-step-go]");
    if (stepButton) {
      showInvoiceWizardStep(row, stepButton.dataset.invoiceStepGo);
      return;
    }
    const customerButton = event.target.closest("[data-apply-invoice-customer]");
    if (customerButton) {
      applyCustomerMasterToInvoiceRow(row);
      return;
    }
    const scannerButton = event.target.closest("[data-open-invoice-receipt-scanner]");
    if (scannerButton && row) {
      const params = new URLSearchParams({
        integration: "teamapp",
        date: row.dataset.invoiceDate || state.terminalDate || todayKey(),
        category: "Rechnungsbeleg",
        invoiceId: row.dataset.id || "",
        returnOrigin: window.location.origin
      });
      const scannerWindow = window.open(`${scannerAppUrl()}/?${params}`, "laBowlingInvoiceScanner", "popup,width=1180,height=820");
      if (!scannerWindow) showToast("Scanner konnte nicht geöffnet werden. Pop-ups bitte erlauben.");
      return;
    }
    const draftButton = event.target.closest("[data-save-invoice-draft]");
    if (draftButton) return void saveInvoiceRow(draftButton, false);
    const readyButton = event.target.closest("[data-mark-invoice-ready]");
    if (readyButton) return void saveInvoiceRow(readyButton, true);
    const pdfButton = event.target.closest("[data-open-invoice-builder]");
    if (pdfButton) return void terminalInvoicePdfForRow(pdfButton);
    const removeButton = event.target.closest("[data-remove-report-entry]");
    if (removeButton) return void removeTerminalFinanceEntry(removeButton);
    const copyCustomer = event.target.closest("[data-copy-invoice-customer]");
    if (copyCustomer) return void copyText(invoiceRowCustomerCopyValue(row));
    const copyTotal = event.target.closest("[data-copy-invoice-total]");
    if (copyTotal) copyText(invoiceRowTotalCopyValue(row));
  });

  $("#terminalDocumentsStep")?.addEventListener("click", (event) => {
    const scannerButton = event.target.closest("[data-open-document-scanner]");
    if (!scannerButton) return;
    const category = scannerButton.dataset.openDocumentScanner;
    const params = new URLSearchParams({
      integration: "teamapp",
      date: state.terminalDate || todayKey(),
      category,
      returnOrigin: window.location.origin
    });
    const scannerWindow = window.open(`${scannerAppUrl()}/?${params}`, "laBowlingScanner", "popup,width=1180,height=820");
    if (!scannerWindow) showClosingDocumentsHint("Scanner konnte nicht geöffnet werden. Pop-ups bitte erlauben.");
  });

  $$('[data-configure-scanner]').forEach((button) => {
    button.addEventListener("click", configureScannerApp);
  });

  $("#completeClosingDocuments")?.addEventListener("click", () => {
    if (!closingDocumentEntries().length) showClosingDocumentsHint("Keine Dokumente vorhanden. Schritt 4 wurde ohne Dokumente abgeschlossen.");
    state.terminalDocumentsComplete = true;
    state.terminalClosingStep = 4;
    renderTerminalClosingSteps();
  });

  $$("[data-close-finance-modal]").forEach((button) => {
    button.addEventListener("click", () => closeFinanceModal(button.dataset.closeFinanceModal));
  });
  ["invoiceDetailsModal", "expenseDetailsModal"].forEach((id) => {
    $("#" + id)?.addEventListener("click", (event) => {
      if (event.target.id === id) {
        closeFinanceModal(id);
        return;
      }
      const copyCustomerButton = event.target.closest("[data-copy-invoice-customer]");
      if (copyCustomerButton) {
        copyText(invoiceRowCustomerCopyValue(copyCustomerButton.closest('[data-report-entry="invoice"]')));
        return;
      }
      const copyTotalButton = event.target.closest("[data-copy-invoice-total]");
      if (copyTotalButton) {
        copyText(invoiceRowTotalCopyValue(copyTotalButton.closest('[data-report-entry="invoice"]')));
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
      const receiptButton = event.target.closest("[data-add-expense-receipt]");
      if (receiptButton) {
        receiptButton.closest('[data-report-entry="expense"]')?.querySelector(".expense-receipt-upload-list")?.insertAdjacentHTML("beforeend", expenseReceiptUploadHtml());
        return;
      }
      const removeButton = event.target.closest("[data-remove-report-entry]");
      if (removeButton) removeTerminalFinanceEntry(removeButton);
    });
  });

  async function saveClosingData(button) {
    if (!button) return;
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
  }

  $("#saveDayReport")?.addEventListener("click", () => saveClosingData($("#saveDayReport")));
  $("#saveClosingData")?.addEventListener("click", () => saveClosingData($("#saveClosingData")));

  $("#financeInvoiceTotal")?.addEventListener("input", (event) => {
    event.currentTarget.dataset.manualOverride = "true";
  });
  ["#reportCashTotal", "#reportCashExpenses", "#reportEcTerminal1", "#reportEcTerminal2", "#reportPersonalConsumption", "#reportRevenueBowling", "#reportRevenueDrinks", "#reportRevenueFood", "#reportRevenueOther", "#reportBowlingCashRevenue", "#reportGastroCashRevenue", "#reportRevenueGastro", "#financeInvoiceTotal"].forEach((selector) => {
    $(selector)?.addEventListener("input", updateReportBarTotal);
  });

  $("#expensesList")?.addEventListener("input", () => {
    syncCashExpensesFromExpenseRows(true);
    updateReportBarTotal();
  });

  $("#checkDayReport")?.addEventListener("click", () => {
    const documents = state.terminalReport?.documents || {};
    const missingDocuments = [documents.penta, documents.handwriting, documents.ecCut]
      .filter((document) => !(document?.path || document?.url || document?.data)).length;
    showToast(missingDocuments
      ? `Finanzdaten geprüft. ${missingDocuments} Abschlussdokument${missingDocuments === 1 ? " fehlt" : "e fehlen"}.`
      : "Finanzdaten und Abschlussdokumente sind vollständig erfasst.");
  });

  $$('[data-open-day-report-preview]').forEach((button) => {
    button.addEventListener("click", () => {
      renderDayReportA4Summary(state.terminalDate || todayKey(), reportPreviewFromForm());
      $("#dayReportPreviewModal")?.classList.remove("hidden");
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      button.click();
    });
  });
  $$('[data-close-day-report-preview]').forEach((button) => {
    button.addEventListener("click", () => $("#dayReportPreviewModal")?.classList.add("hidden"));
  });
  $("#dayReportPreviewModal")?.addEventListener("click", (event) => {
    if (event.target.id === "dayReportPreviewModal") event.currentTarget.classList.add("hidden");
  });
  $$('[data-print-day-report]').forEach((button) => {
    button.addEventListener("click", () => $("#printDayReport")?.click());
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
        bowlingCashRevenue: $("#reportBowlingCashRevenue")?.value || "",
        gastroCashRevenue: $("#reportGastroCashRevenue")?.value || "",
        revenueGastro: gastroRevenueFromFormOrReport().toFixed(2),
        miscIncome: currentMiscIncomeEntries(),
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

  $("#financeTipDaySummary")?.addEventListener("click", (event) => {
    if (!event.target.closest("[data-open-tip-distribution]")) return;
    state.terminalClosingStep = 6;
    renderTerminalClosingSteps();
  });
  $("[data-close-closing-tip]")?.addEventListener("click", () => {
    state.terminalClosingStep = 5;
    renderTerminalClosingSteps();
  });
  $("#closeTipDistributionModal")?.addEventListener("click", closeTipDistributionModal);
  $("#closeTipDistributionModalFooter")?.addEventListener("click", closeTipDistributionModal);
  $("#tipDistributionModal")?.addEventListener("click", (event) => {
    if (event.target.id === "tipDistributionModal") closeTipDistributionModal();
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
      if ((state.terminalDate || "") < todayKey()) {
        await terminalAction({ action: "load", date: todayKey(), manualDate: true });
      }
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
bindCocktailEvents();
window.setInterval(() => {
  if (state.terminalToken) refreshTerminalReminderState();
}, 30000);
window.addEventListener("focus", () => {
  if (state.terminalToken) refreshTerminalReminderState();
});
if (isTerminalMode()) document.body.classList.add("terminal-mode");
if (isCocktailOnlyMode()) document.body.classList.add("cocktail-only-mode");
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
