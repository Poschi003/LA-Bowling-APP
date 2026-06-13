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
  isChef: false,
  chefTab: "reports",
  timesheets: {},
  messages: [],
  dayReports: {},
  missingAvailability: [],
  swaps: { open: [], mine: [], myShifts: [], admin: [] },
  availabilityChangeRequests: [],
  weather: null,
  weatherLoading: false,
  terminalToken: "",
  terminalTab: "service",
  terminalDate: "",
  terminalEntries: {},
  terminalReport: {},
  terminalSchedule: {},
  terminalTasks: [],
  terminalReminders: [],
  pendingToiletCheck: "",
  pendingReminder: null,
  terminalDayMetaEditing: false,
  terminalCorrectionMode: false,
  invoiceTerminalToken: window.localStorage?.getItem("invoiceTerminalToken") || "",
  invoiceDate: todayKey(),
  invoiceReport: {},
  taskTemplates: [],
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
    availabilityExemptEmployees: [],
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
    hourlyRate: 25
  },
  reminderTemplates: defaultReminderTemplates,
  availability: {},
  schedules: {},
  timesheets: {},
  messages: [],
  dayReports: {},
  availabilityChangeRequests: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const DAILY_FREE_BREAK_MINUTES = 30;

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
  if (task.frequency === "daily") return `${category} | Täglich`;
  if (task.frequency === "weekly") return `${category} | Wöchentlich ${((task.weekdays || []).map((day) => weekdays[Number(day)]).filter(Boolean).join(", ") || "")}`;
  if (task.frequency === "monthly") return `${category} | Monatlich am ${Number(task.dayOfMonth || 1)}.`;
  if (task.frequency === "interval") return `${category} | Alle ${Number(task.intervalDays || 1)} Tage ab ${task.startDate ? formatDate(task.startDate) : formatDate(task.date || todayKey())}${task.endDate ? ` bis ${formatDate(task.endDate)}` : ""}`;
  if (task.frequency === "next-day") return `${category} | Für nächsten Tag${task.date ? ` (${formatDate(task.date)})` : ""}`;
  if (task.frequency === "once") return `${category} | Einmalig${task.date ? ` (${formatDate(task.date)})` : ""}`;
  return "Aufgabe";
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
  const scheduleDays = state.schedule?.days || {};
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
        ${week.dates.map((date) => renderScheduleDay(date, { compact: true, collapsible: true })).join("")}
      </div>
    </details>
  `).join("");
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
  const params = new URLSearchParams({ month: state.selectedMonth, nextMonth: nextMonthValue() });
  if (state.employeeToken) params.set("employeeToken", state.employeeToken);
  if (state.adminToken) params.set("adminToken", state.adminToken);
  const data = await api(`/api/state?${params.toString()}`);
  state.settings = normalizeSettings(data.settings || cloneData(defaultData.settings));
  state.availability = data.availability || {};
  state.schedule = data.schedule || { month: state.selectedMonth, published: false, days: {} };
  state.allSchedules = data.schedules || {};
  state.timesheets = data.timesheets || {};
  state.messages = data.messages || [];
  state.taskTemplates = data.taskTemplates || [];
  state.reminderTemplates = normalizeReminderTemplates(data.reminderTemplates);
  state.dayReports = data.dayReports || {};
  state.weather = data.weather || state.weather;
  state.isChef = Boolean(data.isChef);
  state.missingAvailability = data.missingAvailability || [];
  state.availabilityChangeRequests = data.availabilityChangeRequests || [];
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
      availabilityExemptEmployees: incomingSettings.availabilityExemptEmployees || base.settings.availabilityExemptEmployees || []
      ,
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
      )
    },
    availability: value && value.availability ? value.availability : base.availability,
    schedules: value && value.schedules ? value.schedules : base.schedules,
    timesheets: value && value.timesheets ? value.timesheets : base.timesheets,
    messages: Array.isArray(value?.messages) ? value.messages : base.messages,
    dayReports: value && value.dayReports ? value.dayReports : base.dayReports,
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

function normalizeReminderTemplates(reminders) {
  const list = Array.isArray(reminders) ? reminders.filter((reminder) => reminder && reminder.active !== false) : [];
  return list.length ? list : cloneData(defaultReminderTemplates);
}

function renderAll() {
  $("#appTitle").textContent = isCustomerInvoiceMode() ? "Bezahlung auf Rechnung" : isTodoMode() ? "TO DO" : state.settings.businessName;
  if ($("#customerInvoiceDate")) $("#customerInvoiceDate").value = formatDate(localDateValue());
  $("#monthInput").value = state.selectedMonth;
  renderAccess();
  renderEmployeeSelect();
  renderAvailability();
  renderHome();
  renderPublished();
  renderSwaps();
  renderChef();
  renderTimesheet();
  renderSettings();
  renderPlanner();
  renderAdminLock();
  renderAdminEmployeeOverview();
  renderAdminPublishedList();
  renderAdminSwaps();
  renderAdminAvailabilityRequests();
  renderAdminMessages();
  renderAdminTasks();
  renderAdminReminders();
  renderAdminAvailabilityPreview();
  renderAdminCorrection();
  renderWeather();
  renderTerminal();
  renderCustomerInvoiceDesk();
}

function renderAccess() {
  if (isTerminalMode() || isTodoMode()) {
    $("#mainTabs")?.classList.add("hidden");
    $("#topLogout")?.classList.add("hidden");
    return;
  }
  if (isCustomerInvoiceMode()) {
    $("#mainTabs")?.classList.add("hidden");
    $("#topLogout")?.classList.add("hidden");
    return;
  }
  const loggedIn = Boolean(state.activeEmployee);
  const chef = currentUserIsChef();
  $("#mainTabs")?.classList.toggle("hidden", !loggedIn);
  $$(".employee-only").forEach((element) => element.classList.toggle("hidden", !loggedIn || chef));
  $('[data-tab="swaps"]')?.classList.add("hidden");
  $$(".chef-only").forEach((element) => element.classList.toggle("hidden", !chef));
  $("#homeLogin")?.classList.toggle("hidden", loggedIn);
  $("#homeGreeting")?.classList.toggle("hidden", !loggedIn);
  $("#topLogout")?.classList.toggle("hidden", !loggedIn && !state.adminToken);
  if ($("#homeEmployeeName")) {
    $("#homeEmployeeName").innerHTML = loggedIn ? renderEmployeeBadge() : "";
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
  const role = state.settings.employeeRoles?.[state.activeEmployee] || "Team";
  if (currentUserIsChef()) {
    return `
      <span class="employee-badge-name">${escapeHtml(state.activeEmployee)}</span>
      <span class="employee-badge-role">${escapeHtml(role)}</span>
      ${state.adminToken ? `<button class="employee-badge-stat compact" type="button" data-open-backoffice><small>Admin</small>Backoffice</button>` : ""}
    `;
  }
  const totals = timesheetTotals();
  return `
    <span class="employee-badge-name">${escapeHtml(state.activeEmployee)}</span>
    <span class="employee-badge-role">${escapeHtml(role)}</span>
    <button class="employee-badge-stat compact" type="button" data-open-timesheet><small>Std</small>${formatHours(totals.hours)}</button>
    <span class="employee-badge-stat compact"><small>TG</small>${formatMoney(totals.tip)}</span>
    ${state.adminToken ? `<button class="employee-badge-stat compact" type="button" data-open-backoffice><small>Admin</small>Backoffice</button>` : ""}
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
    <details class="today-section dashboard-today">
      <summary>Heutiger Tag</summary>
      ${renderScheduleDay(new Date(`${today}T12:00:00`), { today: true })}
    </details>
    ${state.activeEmployee ? renderHomeSwaps() : ""}
    ${state.adminUnlocked ? renderMissingAvailability() : ""}
  `;
  ensureWeatherVisible();
}

function renderDashboardMessages() {
  const messages = state.messages || [];
  if (!messages.length) return "";
  return `
    <section class="dashboard-messages">
      ${messages.slice(0, 5).map((message) => `
        <article class="dashboard-message">
          <strong>${messageTargetLabel(message)}</strong>
          <p>${escapeHtml(message.text)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function messageTargetLabel(message) {
  if (message.target === "all") return "Nachricht an alle";
  if (message.target === "employees") return "Nachricht";
  return `Nachricht ${message.target}`;
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
      ${employeeOverviewHtml()}
    </section>` : ""}
    ${chefSectionEnabled("schedule") ? `<section class="chef-section ${state.chefTab === "schedule" ? "active" : "hidden"}">
      <div class="chef-current-plan">
        <h3>Aktueller Dienstplan</h3>
        ${schedule.published
          ? renderPublishedWeekSections(state.selectedMonth)
          : `<p class="hint">Für ${formatMonth(state.selectedMonth)} ist noch kein Dienstplan veröffentlicht.</p>`}
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
          <button class="secondary" data-print-day-report="${escapeHtml(dateKey)}" type="button">Bericht drucken</button>
        </details>
      `).join("")}
    </div>
  `;
}

function dayReportSummaryLine(report = {}) {
  return [
    `Bar Gastro ${formatReportMoney(report.barGastro)}`,
    `Bar Bowling ${formatReportMoney(report.barBowling)}`,
    `Bar gesamt ${formatReportMoney(barTotal(report))}`,
    `Rechnung ${formatReportMoney(reportItemsTotal(report.invoiceCustomers))}`,
    `Ausgaben ${formatReportMoney(reportItemsTotal(report.expenses))}`
  ].join(" · ");
}

function dayReportValuesHtml(report = {}) {
  return `
    <div class="day-report-values">
      ${reportFieldEnabled("barGastro") ? `<span><small>Bar Gastro</small><strong>${formatReportMoney(report.barGastro)}</strong></span>` : ""}
      ${reportFieldEnabled("barBowling") ? `<span><small>Bar Bowling</small><strong>${formatReportMoney(report.barBowling)}</strong></span>` : ""}
      ${reportFieldEnabled("barTotal") ? `<span><small>Bar gesamt</small><strong>${formatReportMoney(barTotal(report))}</strong></span>` : ""}
      ${reportFieldEnabled("invoiceCustomers") ? `<span><small>Rechnung</small><strong>${formatReportMoney(reportItemsTotal(report.invoiceCustomers))}</strong></span>` : ""}
      ${reportFieldEnabled("expenses") ? `<span><small>Ausgaben</small><strong>${formatReportMoney(reportItemsTotal(report.expenses))}</strong></span>` : ""}
      ${reportFieldEnabled("ecTotal") ? `<span><small>EC gesamt</small><strong>${formatReportMoney(report.ecTotal)}</strong></span>` : ""}
    </div>
  `;
}

function dayReportA4Html(dateKey, report = {}) {
  const invoiceTotalValue = reportItemsTotal(report.invoiceCustomers);
  const expenseTotalValue = reportItemsTotal(report.expenses);
  const cashTotalValue = barTotal(report);
  const ecTotalValue = reportMoneyNumber(report.ecTotal);
  const totalRevenueValue = cashTotalValue + ecTotalValue - invoiceTotalValue;
  const cashToHandOverValue = cashTotalValue - expenseTotalValue;
  return `
    <section class="a4-report">
      <div class="a4-report-head">
        <div>
          <span>Tagesabschluss</span>
          <h3>${escapeHtml(formatDate(dateKey))}</h3>
        </div>
        <dl>
          <div><dt>Schichtleitung</dt><dd>${escapeHtml(report.shiftLeader || "-")}</dd></div>
          <div><dt>Öffnungszeit</dt><dd>${escapeHtml(report.openingHours || "-")}</dd></div>
          <div><dt>Status</dt><dd>${report.closed ? "Abgeschlossen" : "Offen"}</dd></div>
        </dl>
      </div>

      <div class="a4-report-kpis">
        ${reportFieldEnabled("barTotal") ? a4Kpi("Gesamt Bar", formatReportMoney(cashTotalValue)) : ""}
        ${reportFieldEnabled("ecTotal") ? a4Kpi("EC gesamt", formatReportMoney(report.ecTotal)) : ""}
        ${reportFieldEnabled("invoiceCustomers") ? a4Kpi("Auf Rechnung", formatReportMoney(invoiceTotalValue)) : ""}
        ${reportFieldEnabled("expenses") ? a4Kpi("Ausgaben", formatReportMoney(expenseTotalValue)) : ""}
        ${a4Kpi("Gesamtumsatz", formatReportMoney(totalRevenueValue))}
        ${a4Kpi("Bargeld abzugeben", formatReportMoney(cashToHandOverValue))}
      </div>

      <div class="a4-report-grid">
        <section class="a4-report-block a4-report-block-wide a4-report-staff">
          <h4>Personalzeiten</h4>
          ${dayReportEmployeeRowsHtml(dateKey, report) || `<p class="hint">Keine Arbeitszeiten erfasst.</p>`}
        </section>
        <section class="a4-report-block a4-report-block-wide">
          <h4>Abrechnung</h4>
          <table class="a4-report-table">
            <tbody>
              <tr><th>Gesamt Bar</th><td>${formatReportMoney(cashTotalValue)}</td></tr>
              <tr><th>Gesamt EC</th><td>${formatReportMoney(report.ecTotal)}</td></tr>
              <tr><th>Bezahlung auf Rechnung</th><td>- ${formatReportMoney(invoiceTotalValue)}</td></tr>
              <tr><th>Gesamtumsatz</th><td>${formatReportMoney(totalRevenueValue)}</td></tr>
              <tr><th>Ausgaben</th><td>- ${formatReportMoney(expenseTotalValue)}</td></tr>
              <tr><th>Bargeld abzugeben</th><td>${formatReportMoney(cashToHandOverValue)}</td></tr>
            </tbody>
          </table>
        </section>
        ${reportFieldEnabled("invoiceCustomers") ? a4InvoiceBlock(report.invoiceCustomers) : ""}
        ${reportFieldEnabled("expenses") ? a4ExpenseBlock(report.expenses) : ""}
        ${reportFieldEnabled("documents") ? a4DocumentsBlock(report.documents) : ""}
        ${reportFieldEnabled("handovers") ? a4HandoversBlock(report.handovers) : ""}
        ${reportFieldEnabled("notes") ? a4NotesBlock(report.notes) : ""}
      </div>
    </section>
  `;
}

function a4Kpi(label, value) {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function dayReportEmployeeRowsHtml(dateKey, report = {}) {
  const employees = reportEmployeesForDate(dateKey, report);
  if (!employees.length) return "";
  const rows = employees.map((employee) => {
    const entry = state.timesheets?.[employee]?.[dateKey] || state.terminalEntries?.[employee]?.[dateKey] || {};
    const hours = paidHours(entry);
    return `
      <tr>
        <th>${escapeHtml(employee)}</th>
        <td>${escapeHtml(entry.from || "--:--")}</td>
        <td>${escapeHtml(entry.to || "--:--")}</td>
        <td>${breakMinutes(entry) ? `${formatMinutes(breakMinutes(entry))} / Abzug ${formatMinutes(breakDeductionMinutes(entry))}` : "-"}</td>
        <td>${formatHours(hours)}</td>
      </tr>
    `;
  }).join("");
  return `
    <table class="a4-report-table">
      <thead><tr><th>Name</th><th>Von</th><th>Bis</th><th>Pause/Rauchen</th><th>Arbeitszeit</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function reportEmployeesForDate(dateKey, report = {}) {
  const names = new Set();
  Object.entries(state.timesheets || {}).forEach(([employee, entries]) => {
    const entry = entries?.[dateKey] || {};
    if (entry.from || entry.to) names.add(employee);
  });
  if (dateKey === state.terminalDate) {
    terminalEmployeesForDay(dateKey).forEach((employee) => names.add(employee));
  }
  (report.extraEmployees || []).forEach((item) => {
    const employee = typeof item === "string" ? item : item.employee;
    if (employee) names.add(employee);
  });
  return [...names].filter(Boolean).sort((a, b) => a.localeCompare(b, "de"));
}

function a4InvoiceBlock(items = []) {
  return `
    <section class="a4-report-block">
      <h4>Rechnungskunden</h4>
      ${items.length ? `<table class="a4-report-table">
        <thead><tr><th>Kunde</th><th>Bowling</th><th>Gastro</th><th>Gesamt</th></tr></thead>
        <tbody>${items.map((item, index) => `
          <tr>
            <th>${escapeHtml(item.name || `Kunde ${index + 1}`)}</th>
            <td>${formatReportMoney(item.bowlingAmount)}</td>
            <td>${formatReportMoney(item.gastroAmount)}</td>
            <td>${formatReportMoney(invoiceTotal(item))}</td>
          </tr>
        `).join("")}</tbody>
      </table>` : `<p class="hint">Keine Rechnungskunden.</p>`}
    </section>
  `;
}

function a4ExpenseBlock(items = []) {
  return `
    <section class="a4-report-block">
      <h4>Ausgaben</h4>
      ${items.length ? `<table class="a4-report-table">
        <thead><tr><th>Ausgabe</th><th>Kategorie</th><th>Betrag</th><th>Beleg</th></tr></thead>
        <tbody>${items.map((item, index) => `
          <tr>
            <th>${escapeHtml(item.name || `Ausgabe ${index + 1}`)}</th>
            <td>${escapeHtml(item.category || "-")}</td>
            <td>${formatReportMoney(item.amount)}</td>
            <td>${receiptLinkHtml(item) || "-"}</td>
          </tr>
        `).join("")}</tbody>
      </table>` : `<p class="hint">Keine Ausgaben.</p>`}
    </section>
  `;
}

function a4DocumentsBlock(documents = {}) {
  const entries = [
    ["Penta", documents.penta],
    ["Handschrift", documents.handwriting]
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
  const bowling = Number(invoice.bowlingAmount || 0);
  const gastro = Number(invoice.gastroAmount || 0);
  const total = bowling + gastro || Number(invoice.amount || 0);
  const token = `${dateKey}|${invoice.id || index}`;
  const briefhead = invoiceBriefhead(invoice);
  return `
    <article class="open-invoice-card">
      <div class="open-invoice-head">
        <strong>${escapeHtml(invoice.name || `Rechnung ${index + 1}`)}</strong>
        <button class="primary" type="button" data-complete-invoice="${escapeHtml(token)}">Erledigt</button>
      </div>
      <div class="invoice-copy-grid">
        ${invoiceCopyField("Rechnungsdatum", formatDate(dateKey))}
        ${invoiceCopyField("Briefkopf", briefhead, "invoice-copy-field-wide")}
        ${invoiceCopyField("Betrag Bowling", formatReportMoney(bowling))}
        ${invoiceCopyField("Betrag Gastro", formatReportMoney(gastro))}
        ${invoiceCopyField("Betrag gesamt", formatReportMoney(total))}
      </div>
      <p class="hint">Ansprechpartner: ${escapeHtml(invoice.contact || "-")} · E-Mail: ${escapeHtml(invoice.email || "-")} · Telefon: ${escapeHtml(invoice.phone || "-")}</p>
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
  const folders = [
    ["expenses", "Ausgaben"],
    ["invoices", "Bezahlung auf Rechnung"],
    ["penta", "Penta"],
    ["handwriting", "Handschrift"]
  ];
  return `
    <section class="report-folders">
      <div class="report-folders-head">
        <div>
          <h3>Monatsordner</h3>
          <p>Tagesberichte und Dokumente monatsweise prüfen und exportieren.</p>
        </div>
      </div>
      ${sortedMonths.map((month) => `
        <details class="report-month-card">
          <summary class="report-month-summary">
            <span>
              <strong>${formatMonth(month)}</strong>
              <small>${monthReportDays(month)} Tagesberichte</small>
            </span>
            <b>${folders.reduce((sum, [key]) => sum + reportFolderItems(month, key).length, 0)} Dateien</b>
          </summary>
          <details class="report-month-section">
            <summary>Tagesberichte</summary>
            ${dayReportsForMonthHtml(month)}
          </details>
          ${chefSectionEnabled("reportFolders") ? `<details class="report-month-section">
            <summary>Dokumente</summary>
            <div class="report-folder-grid">
              ${folders.map(([key, label]) => reportFolderHtml(month, key, label)).join("")}
            </div>
          </details>` : ""}
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

function reportFolderItems(month, key) {
  const reports = Object.entries(state.dayReports || {})
    .filter(([dateKey]) => dateKey.startsWith(`${month}-`))
    .sort(([a], [b]) => a.localeCompare(b));
  const items = [];
  for (const [dateKey, report] of reports) {
    if (key === "expenses") {
      (report.expenses || []).forEach((expense, index) => {
        if (hasReceipt(expense)) items.push(receiptFolderItem(dateKey, expense, `Ausgabe ${index + 1}`, expense.name || "Ausgabe"));
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
  }
  return items;
}

function hasReceipt(item = {}) {
  return Boolean(item.receiptPath || item.receiptUrl || item.receiptData);
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

function invoiceIsReady(item = {}) {
  if (item.invoiceReady === true || item.invoiceReady === "true") return true;
  if (item.invoiceReady === false || item.invoiceReady === "false") return false;
  return invoiceTotal(item) > 0 && Boolean(invoiceReceipt(item));
}

function invoiceStatusText(item = {}) {
  if (item.invoiceDone) return "Erledigt";
  if (invoiceIsReady(item)) return "Fertig für Chef";
  return "Angelegt";
}

function invoiceStatusClass(item = {}) {
  if (item.invoiceDone) return "is-done";
  if (invoiceIsReady(item)) return "is-ready";
  return "is-draft";
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
          <span>Bowling ${formatReportMoney(item.bowlingAmount)} · Gastro ${formatReportMoney(item.gastroAmount)}</span>
          <span>Briefkopf</span>
          <p class="invoice-briefhead">${escapeHtml(invoiceBriefhead(item)).replace(/\n/g, "<br>")}</p>
          <span>Ansprechpartner: ${escapeHtml(item.contact || "-")}</span>
          <span>Telefon: ${escapeHtml(item.phone || "-")}</span>
          <span>Tipp: ${escapeHtml(item.tip || "-")}</span>
          <span>${escapeHtml(item.email || "Keine E-Mail")}</span>
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
          ${receiptLinkHtml(item)}
        </article>
      `).join("")}
    </div>
  `;
}

function reportDocumentsHtml(documents = {}) {
  const entries = [
    ["Penta", documents.penta],
    ["Handschrift", documents.handwriting]
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

function barTotal(report = {}) {
  return reportMoneyNumber(report.barBowling) + reportMoneyNumber(report.barGastro);
}

function reportMoneyNumber(value) {
  const number = Number(String(value || "").replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function invoiceTotal(item = {}) {
  const splitTotal = reportMoneyNumber(item.bowlingAmount) + reportMoneyNumber(item.gastroAmount);
  return splitTotal || reportMoneyNumber(item.amount);
}

function exportDayReport(dateKey) {
  const report = state.dayReports?.[dateKey];
  if (!report) return;
  const lineIf = (key, line) => reportFieldEnabled(key) ? [line] : [];
  const invoiceTotalValue = reportItemsTotal(report.invoiceCustomers);
  const expenseTotalValue = reportItemsTotal(report.expenses);
  const cashTotalValue = barTotal(report);
  const totalRevenueValue = cashTotalValue + reportMoneyNumber(report.ecTotal) - invoiceTotalValue;
  const cashToHandOverValue = cashTotalValue - expenseTotalValue;
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
      return `- ${employee} | ${entry.from || "--:--"} bis ${entry.to || "--:--"} | ${formatHours(paidHours(entry))}${breakMinutes(entry) ? ` | ${breakSummaryText(entry)}` : ""}`;
    }) : ["- Keine Arbeitszeiten erfasst."]),
    "",
    `Gesamt Bar: ${formatReportMoney(cashTotalValue)}`,
    `Gesamt EC: ${formatReportMoney(report.ecTotal)}`,
    `Bezahlung auf Rechnung: - ${formatReportMoney(invoiceTotalValue)}`,
    `Gesamtumsatz: ${formatReportMoney(totalRevenueValue)}`,
    `Ausgaben: - ${formatReportMoney(expenseTotalValue)}`,
    `Bargeld abzugeben: ${formatReportMoney(cashToHandOverValue)}`,
    ...(reportFieldEnabled("preparation") ? [reportPreparationLine(dateKey, report)] : []),
    "",
    ...(reportFieldEnabled("handovers") ? ["Übergaben:", ...(report.handovers || []).map((item) => `- ${item.time || "--:--"} | ${item.from || "-"} an ${item.to || "-"} | ${item.note || "-"}`)] : []),
    "",
    ...(reportFieldEnabled("invoiceCustomers") ? ["Rechnungskunden:", ...(report.invoiceCustomers || []).map((item) => [
      `- ${item.name || "Kunde"} | Bowling ${formatReportMoney(item.bowlingAmount)} | Gastro ${formatReportMoney(item.gastroAmount)} | Gesamt ${formatReportMoney(invoiceTotal(item))}`
    ].join("\n"))] : []),
    "",
    ...(reportFieldEnabled("expenses") ? ["Ausgaben:", ...(report.expenses || []).map((item) => `- ${item.name || "Ausgabe"} | ${item.category || "-"} | ${formatReportMoney(item.amount)} | Beleg: ${item.receiptName || "-"}`)] : []),
    "",
    ...(reportFieldEnabled("documents") ? ["Abschlussdokumente:", `- Penta: ${report.documents?.penta?.name || "-"}`, `- Handschrift: ${report.documents?.handwriting?.name || "-"}`] : []),
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
  return `
    <section class="login-reminder">
      <div class="dashboard-main">
        <span class="dashboard-label">Daily Reminder</span>
        <blockquote>${dailyQuote(dateKey)}</blockquote>
      </div>
    </section>
  `;
}

function renderEmployeeSelect() {
  const loggedIn = Boolean(state.activeEmployee);
  $("#employeeLogin").classList.toggle("hidden", loggedIn);
  $("#employeeActive").classList.toggle("hidden", !loggedIn);
  $("#saveAvailability").classList.toggle("hidden", !loggedIn);
  $("#activeEmployeeName").textContent = loggedIn ? state.activeEmployee : "";
  const locked = loggedIn && availabilityIsSubmitted();
  $("#employeeViewHint").textContent = loggedIn
    ? (locked ? "Verfügbarkeit wurde bereits abgegeben. Änderungen bitte anfragen." : "Markiere pro Tag, wann du kannst.")
    : "Mitarbeiter-PIN eingeben, um die eigene Verfügbarkeit zu bearbeiten.";
  $("#saveAvailability").textContent = locked ? "Änderung anfragen" : "Verfügbarkeit absenden";
}

function renderAvailability() {
  if (!state.activeEmployee) {
    $("#availabilityGrid").innerHTML = "";
    return;
  }
  const employee = state.activeEmployee;
  const employeeDays = state.availability[employee] || {};
  const locked = availabilityIsSubmitted();
  const requestOpen = hasOpenAvailabilityRequest();
  $("#availabilityGrid").innerHTML = renderWeekSections(state.selectedMonth, (date) => {
    const key = isoDate(date);
    const day = { ...emptyDay(), ...(employeeDays[key] || {}) };
    const holiday = holidayInfo(key);
    const canWork = day.status === "yes";
    return `
      <article class="day-card ${canWork ? "can-work" : ""}" data-date="${key}">
        <div class="day-title">
          <span>${availabilityDayLabel(date)}${holiday.label ? " *" : ""}</span>
          ${holiday.label ? `<span class="weekday">${escapeHtml(holiday.label)}</span>` : ""}
        </div>
        <div class="status-row single">
          <button data-status="yes" class="${canWork ? "active" : ""}" ${locked ? "disabled" : ""}>Kann</button>
        </div>
        <input type="text" data-field="note" value="${escapeHtml(day.note)}" placeholder="Notiz, z.B. nur frueh" ${locked ? "disabled" : ""}>
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
  return Object.keys(state.availability[state.activeEmployee] || {}).length > 0;
}

function hasOpenAvailabilityRequest() {
  return (state.availabilityChangeRequests || []).some((request) => (
    request.employee === state.activeEmployee && request.month === state.selectedMonth && request.status === "open"
  ));
}

function collectAvailability() {
  const days = {};
  $$("#availabilityGrid .day-card").forEach((card) => {
    const active = card.querySelector(".status-row button.active");
    if (!active) return;
    days[card.dataset.date] = {
      status: "yes",
      from: "",
      to: "",
      note: card.querySelector('[data-field="note"]').value.trim()
    };
  });
  return days;
}
function renderScheduleDay(date, options = {}) {
  const key = isoDate(date);
  const assignments = state.schedule && state.schedule.days && state.schedule.days[key] ? state.schedule.days[key] : {};
  const holiday = holidayInfo(key);
  const filled = state.settings.positions.filter((position) => assignments[position]);
  const visiblePositions = state.settings.positions.filter((position) => (
    !isOptionalServiceSlot(position) || assignments[position]
  ));
  const cells = visiblePositions.map((position) => {
    const assignedEmployee = assignments[position] || "";
    const ownShift = Boolean(state.activeEmployee && assignedEmployee === state.activeEmployee && !state.adminUnlocked);
    return `
          <div class="position-cell ${positionClass(position)} ${assignedEmployee ? "filled" : ""} ${ownShift ? "own-shift clickable-shift" : ""}"
            ${ownShift ? `data-request-swap-date="${key}" data-request-swap-position="${escapeHtml(position)}"` : ""}>
            <span class="position-name">${escapeHtml(position)}</span>
            <span class="assignment">${escapeHtml(assignedEmployee || "Noch offen")}</span>
            ${ownShift ? `<span class="assignment-note">Zum Diensttausch anklicken</span>` : ""}
          </div>
        `;
  });
  if (options.today) {
    cells.push(`<div class="position-cell weather-cell" data-weather-widget>Wetter wird geladen...</div>`);
  }
  const content = `
      <div class="day-header ${holiday.className}">
          <span>${formatDate(key)}</span>
          <span class="day-header-meta">
            ${options.today ? `<span class="opening-hours-inline">Geöffnet: ${openingHoursFor(key)}</span>` : ""}
            ${holiday.label ? `<span class="day-badge">${escapeHtml(holiday.label)}</span>` : ""}
          </span>
        </div>
      <div class="position-grid">
        ${cells.join("")}
      </div>
      ${options.today && filled.length === 0 ? `<div class="published-day-note">Es ist noch niemand eingeteilt.</div>` : ""}
      ${assignments.__dayNote ? `<div class="published-day-note">Tagesnotiz: ${escapeHtml(assignments.__dayNote)}</div>` : ""}
  `;
  if (options.collapsible) {
    return `
      <details class="schedule-day ${options.today ? "today-summary" : ""}">
        <summary class="day-header ${holiday.className}">
          <span>${formatDate(key)}</span>
          <span class="day-header-meta">
            ${filled.length ? `<span class="day-badge">${filled.length} Dienste</span>` : `<span class="day-badge">Noch offen</span>`}
            ${holiday.label ? `<span class="day-badge">${escapeHtml(holiday.label)}</span>` : ""}
          </span>
        </summary>
        <div class="position-grid">
          ${cells.join("")}
        </div>
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
  return `
    <section class="missing-section home-swaps">
      <h2>Offene Ersatzanfragen</h2>
      ${swaps.length
        ? `<div class="swap-list">${swaps.slice(0, 6).map((swap) => `
            <article class="swap-card compact-swap-card clickable-card" data-open-swaps>
              <strong>${formatDate(swap.date)} | ${escapeHtml(swap.position)}</strong>
              <span>${escapeHtml(swap.employee)} sucht Ersatz${swap.responses.length ? `, ${swap.responses.length} gemeldet` : ""}</span>
              <button class="primary" type="button">Öffnen</button>
            </article>
          `).join("")}</div>`
        : `<p>Keine offenen Ersatzanfragen.</p>`}
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
      </div>
      <button class="secondary" data-delete-message="${escapeHtml(message.id)}" type="button">Löschen</button>
    </article>
  `).join("") : `<p class="hint">Keine Nachrichten aktiv.</p>`;
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
  const tasks = state.taskTemplates || [];
  renderTaskTable("#prepTaskTable", tasks.filter((task) => task.category === "preparation"));
  renderTaskTable("#runningTaskTable", tasks.filter((task) => (task.category || "running") === "running"));
  renderTaskTable("#closingTaskTable", tasks.filter((task) => task.category === "closing"));
  renderTaskCalendar();
}

function renderTaskCalendar() {
  const target = $("#adminTaskCalendar");
  if (!target) return;
  const month = $("#taskCalendarMonth")?.value || state.selectedMonth;
  const weeks = groupedMonthWeeks(month);
  target.innerHTML = `
    <div class="admin-calendar-weekdays">${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => `<span>${day}</span>`).join("")}</div>
    <div class="admin-calendar-grid">
      ${weeks.map((week) => week.dates.map((date) => calendarDayHtml(isoDate(date))).join("")).join("")}
    </div>
  `;
}

function calendarDayHtml(dateKey) {
  const tasks = (state.taskTemplates || [])
    .filter((task) => (task.category || "running") === "running" && taskAppliesToDate(task, dateKey));
  return `
    <article class="admin-calendar-day" data-calendar-date="${dateKey}">
      <strong>${formatShortDate(new Date(`${dateKey}T12:00:00`))}</strong>
      ${tasks.map((task) => `
        <span class="calendar-task calendar-${task.category || "running"}">
          ${escapeHtml(task.title)}
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
  target.innerHTML = tasks.length ? `
    <div class="admin-task-row admin-task-row-head">
      <span>Aufgabe</span>
      <span>Wann</span>
      <span>Notiz</span>
      <span></span>
    </div>
    ${tasks.map((task) => `
      <div class="admin-task-row">
        <strong>${escapeHtml(task.title)}</strong>
        <span>${escapeHtml(taskFrequencyLabel(task).replace(`${taskCategoryLabel(task.category)} | `, ""))}</span>
        <span>${task.note ? escapeHtml(task.note) : "-"}</span>
        <button class="secondary" data-delete-task="${escapeHtml(task.id)}" type="button">Löschen</button>
      </div>
    `).join("")}
  ` : `<p class="hint">Noch keine Aufgaben eingetragen.</p>`;
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
  const dates = datesInMonth(state.selectedMonth);
  const employees = state.settings.employees || [];
  const cards = dates.map((date) => {
    const dateKey = isoDate(date);
    const available = employees.filter((employee) => state.availability?.[employee]?.[dateKey]?.status === "yes");
    return `
      <article class="availability-preview-card ${available.length ? "has-availability" : ""}">
        <strong>${formatShortDate(date)}</strong>
        <span>${weekdays[date.getDay()]}</span>
        <p>${available.length ? escapeHtml(available.join(", ")) : "Keine Zusagen"}</p>
      </article>
    `;
  }).join("");
  container.innerHTML = `
    <div class="availability-preview-head">
      <strong>${formatMonth(state.selectedMonth)}</strong>
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
      <h2>Fehlende Verfügbarkeit für ${formatMonth(nextMonthValue())}</h2>
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
    return `
      <article class="timesheet-row" data-date="${dateKey}">
        <div>
          <strong>${formatDate(dateKey)}</strong>
          <span>${escapeHtml(entry.from || "--:--")} bis ${escapeHtml(entry.to || "--:--")} · ${formatHours(hours)}${breakMinutes(entry) ? ` · ${escapeHtml(breakSummaryText(entry))}` : ""}</span>
        </div>
        <label>Trinkgeld<input type="number" min="0" step="0.01" data-ts-field="tip" value="${escapeHtml(entry.tip || "")}" placeholder="0,00"></label>
        <button class="secondary" data-save-timesheet="${dateKey}">Speichern</button>
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
    .filter(([dateKey, entry]) => dateKey.startsWith(month) && entry.from && entry.to)
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

function breaksForEntry(entry = {}) {
  return Array.isArray(entry.breaks)
    ? entry.breaks.filter((item) => item && (item.from || item.to))
    : [];
}

function breakMinutes(entry = {}) {
  return breaksForEntry(entry).reduce((total, item) => total + minutesBetween(item.from, item.to), 0);
}

function breakDeductionMinutes(entry = {}) {
  return Math.max(0, breakMinutes(entry) - DAILY_FREE_BREAK_MINUTES);
}

function paidHours(entry = {}) {
  const gross = hoursBetween(entry.from, entry.to);
  return Math.max(0, gross - breakDeductionMinutes(entry) / 60);
}

function hasOpenBreak(entry = {}) {
  return breaksForEntry(entry).some((item) => item.from && !item.to);
}

function formatMinutes(value) {
  const minutes = Math.max(0, Math.round(Number(value || 0)));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours} h ${String(rest).padStart(2, "0")} min` : `${rest} min`;
}

function breakSummaryText(entry = {}) {
  const total = breakMinutes(entry);
  const deduction = breakDeductionMinutes(entry);
  return `Pause/Rauchen ${formatMinutes(total)} | frei ${formatMinutes(DAILY_FREE_BREAK_MINUTES)} | Abzug ${formatMinutes(deduction)}`;
}

function breakListHtml(entry = {}) {
  const breaks = breaksForEntry(entry);
  if (!breaks.length) return `<span>Noch keine Pause/Rauchen dokumentiert.</span>`;
  return breaks.map((item, index) => `<span>${index + 1}. ${escapeHtml(item.from || "--:--")} bis ${escapeHtml(item.to || "läuft")}</span>`).join("");
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

function updateReportBarTotal() {
  const target = $("#reportBarTotal");
  if (!target) return;
  target.value = (parseMoneyInput($("#reportBarBowling")?.value) + parseMoneyInput($("#reportBarGastro")?.value))
    .toFixed(2)
    .replace(".", ",");
  renderDayReportA4Summary(state.terminalDate || todayKey(), reportPreviewFromForm());
}

function reportPreviewFromForm() {
  return {
    ...(state.terminalReport || {}),
    ecTotal: $("#reportEcTotal")?.value || state.terminalReport?.ecTotal || "",
    barBowling: $("#reportBarBowling")?.value || state.terminalReport?.barBowling || "",
    barGastro: $("#reportBarGastro")?.value || state.terminalReport?.barGastro || "",
    openingHours: $("#terminalOpeningHours")?.value || state.terminalReport?.openingHours || "",
    shiftLeader: $("#terminalShiftLeader")?.value || state.terminalReport?.shiftLeader || ""
  };
}

function renderTerminal() {
  const panel = $("#terminal");
  if (!panel) return;
  const todoMode = isTodoMode();
  if (todoMode) state.terminalTab = "tasks";
  if (!todoMode && state.terminalTab === "tasks") state.terminalTab = "service";
  if ($("#terminalTitle")) $("#terminalTitle").textContent = todoMode ? "TO DO" : "Tages-Terminal";
  if ($("#terminalCodeLabel")) $("#terminalCodeLabel").textContent = todoMode ? "TO-DO-Code" : "Terminal-Code";
  if ($("#unlockTerminal")) $("#unlockTerminal").textContent = todoMode ? "TO DO öffnen" : "Terminal öffnen";
  $("#printDayReport")?.classList.toggle("hidden", todoMode);
  $(".terminal-tabs")?.classList.toggle("hidden", todoMode);
  $("#terminalLogin")?.classList.toggle("hidden", Boolean(state.terminalToken));
  $("#terminalContent")?.classList.toggle("hidden", !state.terminalToken);
  const dateKey = state.terminalDate || todayKey();
  state.terminalDate = dateKey;
  $("#terminalDate").textContent = formatLongDate(dateKey);
  if (!state.terminalToken) return;

  const employees = terminalEmployeesForDay(dateKey);
  const entries = state.terminalEntries || {};
  const report = state.terminalReport || {};
  const reportClosed = Boolean(report.closed);
  renderTerminalTabs();
  renderTerminalDayMeta(dateKey, report, reportClosed);
  renderTerminalCorrectionBanner(dateKey, report);
  renderTerminalTasks(report, reportClosed);
  renderHandovers(report, reportClosed);
  renderToiletStatus(report);
  checkTerminalReminders(report, reportClosed);
  renderTerminalCosts(dateKey, employees);
  $(".terminal-add")?.classList.remove("hidden");
  $("#terminalEmployees").innerHTML = employees.length ? employees.map((employee) => {
    const entry = entries[employee]?.[dateKey] || {};
    const hours = paidHours(entry);
    const openBreak = hasOpenBreak(entry);
    const pauseMinutes = breakMinutes(entry);
    const planned = terminalIsPlanned(employee);
    const plannedShift = terminalPlannedShiftFor(employee);
    return `
      <article class="terminal-employee ${reportClosed ? "is-locked" : ""}">
        <div class="terminal-employee-head">
          <div>
          <strong>${escapeHtml(employee)}</strong>
            <span>${planned ? "Geplant" : "Zusätzlich"}${plannedShift.label ? ` · Plan ${escapeHtml(plannedShift.label)}` : ""}</span>
          </div>
          <strong class="terminal-shift-time">${escapeHtml(entry.from || "--:--")} bis ${escapeHtml(entry.to || "--:--")}</strong>
          ${hours ? `<span class="terminal-hours">${formatHours(hours)}</span>` : ""}
          ${pauseMinutes || openBreak ? `<span class="terminal-hours pause-pill">${escapeHtml(breakSummaryText(entry))}</span>` : ""}
        </div>
        <div class="terminal-time-edit">
          <label>Beginn<input type="time" data-terminal-time="from" value="${escapeHtml(entry.from || "")}" ${reportClosed ? "disabled" : ""}></label>
          <label>Ende<input type="time" data-terminal-time="to" value="${escapeHtml(entry.to || "")}" ${reportClosed ? "disabled" : ""}></label>
          <button class="secondary" data-terminal-adjust="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Korrigieren</button>
        </div>
        <div class="terminal-actions">
          <button class="primary" data-terminal-punch="start" data-terminal-employee="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Dienstbeginn</button>
          <button class="secondary" data-terminal-punch="end" data-terminal-employee="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Dienstende</button>
          <button class="secondary" data-terminal-break="start" data-terminal-employee="${escapeHtml(employee)}" ${reportClosed || openBreak ? "disabled" : ""}>Pause/Rauchen abmelden</button>
          <button class="primary" data-terminal-break="end" data-terminal-employee="${escapeHtml(employee)}" ${reportClosed || !openBreak ? "disabled" : ""}>Wieder anmelden</button>
        </div>
        ${pauseMinutes || openBreak ? `<div class="terminal-break-summary">
          <strong>${escapeHtml(breakSummaryText(entry))}</strong>
          <div>${breakListHtml(entry)}</div>
        </div>` : ""}
      </article>
    `;
  }).join("") : `<p class="hint">Für heute ist noch niemand im Dienstplan eingeteilt.</p>`;

  $("#reportEcTotal").value = report.ecTotal || "";
  $("#reportBarBowling").value = report.barBowling || "";
  $("#reportBarGastro").value = report.barGastro || "";
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
  const active = isTodoMode() ? "tasks" : (state.terminalTab || "service");
  $$(".terminal-tab").forEach((button) => button.classList.toggle("active", button.dataset.terminalTab === active));
  $("#terminalTasksSection")?.classList.toggle("hidden", active !== "tasks");
  $("#terminalServiceSection")?.classList.toggle("hidden", active !== "service");
  $("#dayReportPrintArea")?.classList.toggle("hidden", active !== "finance");
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
  const tasks = state.terminalTasks || [];
  if (!tasks.length) {
    target.innerHTML = `<p class="hint">Für heute sind keine Aufgaben eingetragen.</p>`;
    return;
  }
  const groups = [
    ["preparation", "Vorbereitung"],
    ["running", "Laufender Betrieb"],
    ["closing", "Schlussdienst"]
  ];
  target.innerHTML = groups.map(([category, label]) => {
    const items = tasks.filter((task) => (task.category || "running") === category);
    const openItems = items.filter((task) => !done[task.id]);
    const completed = items.filter((task) => done[task.id]).length;
    if (!openItems.length) return "";
    return `
      <section class="terminal-task-group terminal-task-${category}">
        <div class="terminal-task-group-head">
          <h4>${label}</h4>
          <span>${completed}/${items.length} erledigt</span>
        </div>
        <div class="terminal-task-items">
          ${openItems.map((task) => {
            return `
              <article class="terminal-task">
                <label>
                  <input type="checkbox" data-terminal-task="${escapeHtml(task.id)}" ${reportClosed ? "disabled" : ""}>
                  <span>
                    <strong>${escapeHtml(task.title)}</strong>
                    ${task.note ? `<small>${escapeHtml(task.note)}</small>` : ""}
                  </span>
                </label>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }).join("") || `<p class="hint">Alle To Do Aufgaben sind erledigt.</p>`;
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
  modal.classList.toggle("hidden", !due);
}

function dueReminder(dateKey, report, openingText = "") {
  const reminders = normalizeReminderTemplates(state.terminalReminders);
  const checks = [...(report.toiletChecks || []), ...(report.reminderChecks || [])];
  const match = String(openingText || openingHoursFor(dateKey)).match(/(\d{2}):(\d{2})/);
  if (!match) return null;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const checked = new Set((checks || []).map((item) => item.checkKey));
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

function setDayReportLocked(isLocked, report = {}) {
  const target = $("#dayReportPrintArea");
  if (!target) return;
  target.classList.toggle("is-locked", isLocked);
  $("#dayReportLockStatus").textContent = isLocked
    ? `Abgeschlossen${report.closedAt ? ` am ${formatDateTime(report.closedAt)}` : ""}. Keine Änderungen mehr möglich.`
    : "Vor dem Tagesabschluss speichern und prüfen.";
  target.querySelectorAll("input, textarea, select").forEach((field) => {
    field.disabled = isLocked;
  });
  target.querySelectorAll("#addInvoiceCustomer, #addExpense, [data-save-invoice-draft], [data-mark-invoice-ready], [data-remove-report-entry], #saveDayReport").forEach((button) => {
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
    ["Handschrift", documents.handwriting]
  ];
  target.innerHTML = rows.map(([label, document]) => `
    <article class="report-entry compact-report-entry">
      <strong>${escapeHtml(label)}</strong>
      ${document?.name ? `<span class="hint">${escapeHtml(document.name)}</span>` : `<span class="hint">Noch nicht hochgeladen.</span>`}
      ${document?.path || document?.url || document?.data ? reportDocumentLinkHtml(document, label) : ""}
      <input type="hidden" data-report-document="${label === "Penta" ? "penta" : "handwriting"}" data-document-field="name" value="${escapeHtml(document?.name || "")}">
      <input type="hidden" data-report-document="${label === "Penta" ? "penta" : "handwriting"}" data-document-field="path" value="${escapeHtml(document?.path || "")}">
      <input type="hidden" data-report-document="${label === "Penta" ? "penta" : "handwriting"}" data-document-field="url" value="${escapeHtml(document?.url || "")}">
      <input type="hidden" data-report-document="${label === "Penta" ? "penta" : "handwriting"}" data-document-field="data" value="${escapeHtml(document?.data || "")}">
    </article>
  `).join("");
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
  const expenseList = $("#customerExpenseWorkList");
  if (expenseList) {
    expenseList.innerHTML = expenses.map((item) => expenseRowHtml(item)).join("") || `<p class="hint">Noch keine Ausgaben für heute.</p>`;
  }
  renderCustomerInvoiceDocuments(report);
  const status = $("#customerInvoiceStaffStatus");
  if (status && !status.textContent) status.textContent = "Tagesübersicht geöffnet.";
}

function renderCustomerInvoiceDocuments(report = {}) {
  const target = $("#customerReportDocumentStatus");
  if (!target) return;
  const documents = report.documents || {};
  const rows = [
    ["Penta", "penta", documents.penta],
    ["Handschrift", "handwriting", documents.handwriting]
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
    <details class="report-entry invoice-entry ${statusClass}" data-report-entry="invoice" data-id="${escapeHtml(id)}" ${isReady ? "" : "open"}>
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
        <label>Gastro Betrag<input data-report-field="gastroAmount" type="number" min="0" step="0.01" value="${escapeHtml(item.gastroAmount || (item.area === "gastro" ? item.amount : ""))}" placeholder="0,00"></label>
      </div>
      <label>Rechnungsadresse<textarea data-report-field="address" rows="2" placeholder="Adresse für Rechnung">${escapeHtml(item.address || "")}</textarea></label>
      <label>Notiz<input data-report-field="note" value="${escapeHtml(item.note || "")}" placeholder="optional"></label>
      <label>Rechnungsbeleg scannen/fotografieren<input data-report-file type="file" accept="image/*,application/pdf" capture="environment"></label>
      ${singleReceipt?.receiptName ? `<span class="hint">Aktueller Rechnungsbeleg: ${escapeHtml(singleReceipt.receiptName)}</span>` : ""}
      ${legacyHint}
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
      <input type="hidden" data-report-field="createdAt" value="${escapeHtml(item.createdAt || "")}">
      <div class="invoice-entry-actions">
        <button class="secondary" data-save-invoice-draft type="button">Zwischenspeichern</button>
        <button class="primary" data-mark-invoice-ready type="button">${isReady ? "Erneut an Chef senden" : "Fertig für Chef"}</button>
        <button class="secondary" data-remove-report-entry type="button">Entfernen</button>
      </div>
      </div>
    </details>
  `;
}

function expenseRowHtml(item = {}) {
  const id = item.id || cryptoId();
  return `
    <article class="report-entry" data-report-entry="expense" data-id="${escapeHtml(id)}">
      <div class="report-entry-grid">
        <label>Ausgabe<input data-report-field="name" value="${escapeHtml(item.name || "")}" placeholder="z.B. Penny Wasser"></label>
        <label>Kategorie<input data-report-field="category" value="${escapeHtml(item.category || "")}" placeholder="z.B. Einkauf"></label>
        <label>Betrag<input data-report-field="amount" type="number" min="0" step="0.01" value="${escapeHtml(item.amount || "")}" placeholder="0,00"></label>
      </div>
      <label>Notiz<input data-report-field="note" value="${escapeHtml(item.note || "")}" placeholder="optional"></label>
      <label>Beleg scannen/fotografieren<input data-report-file type="file" accept="image/*,application/pdf" capture="environment"></label>
      ${item.receiptName ? `<span class="hint">Aktueller Beleg: ${escapeHtml(item.receiptName)}</span>` : ""}
      <input type="hidden" data-report-field="receiptName" value="${escapeHtml(item.receiptName || "")}">
      <input type="hidden" data-report-field="receiptData" value="${escapeHtml(item.receiptData || "")}">
      <input type="hidden" data-report-field="receiptPath" value="${escapeHtml(item.receiptPath || "")}">
      <input type="hidden" data-report-field="receiptUrl" value="${escapeHtml(item.receiptUrl || "")}">
      <button class="secondary" data-remove-report-entry type="button">Entfernen</button>
    </article>
  `;
}

function cryptoId() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function collectReportEntries(type) {
  return collectReportEntriesFrom(document, type);
}

async function collectReportEntriesFrom(root, type) {
  const selector = type === "invoice" ? '[data-report-entry="invoice"]' : '[data-report-entry="expense"]';
  const entries = [];
  for (const row of [...(root || document).querySelectorAll(selector)]) {
    const item = { id: row.dataset.id || cryptoId() };
    row.querySelectorAll("[data-report-field]").forEach((field) => {
      item[field.dataset.reportField] = field.value;
    });
    const genericFile = row.querySelector("[data-report-file]:not([data-report-file='bowling']):not([data-report-file='gastro'])")?.files?.[0];
    if (genericFile) {
      item.receiptName = genericFile.name;
      item.receiptData = await fileToDataUrl(genericFile);
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
    item.bowlingReceiptData ||
    item.bowlingReceiptPath ||
    item.gastroReceiptData ||
    item.gastroReceiptPath
  ));
}

async function collectReportDocuments() {
  const documents = { penta: {}, handwriting: {} };
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
  return documents;
}

async function collectDayReportPayload() {
  return {
    action: "save-report",
    ecTotal: $("#reportEcTotal").value,
    barBowling: $("#reportBarBowling").value,
    barGastro: $("#reportBarGastro").value,
    openingHours: $("#terminalOpeningHours")?.value || "",
    shiftLeader: $("#terminalShiftLeader")?.value || "",
    handovers: state.terminalReport.handovers || [],
    invoiceCustomers: await collectReportEntries("invoice"),
    expenses: await collectReportEntries("expense"),
    documents: await collectReportDocuments(),
    notes: $("#reportNotes").value
  };
}

async function collectCustomerInvoiceDocuments() {
  const documents = cloneData(state.invoiceReport?.documents || { penta: {}, handwriting: {} });
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
  return documents;
}

async function collectCustomerInvoiceDeskPayload() {
  const report = state.invoiceReport || {};
  const root = $("#customerInvoiceStaffArea") || document;
  return {
    action: "save-report",
    date: state.invoiceDate || todayKey(),
    ecTotal: report.ecTotal || "",
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
    toiletChecks: report.toiletChecks || [],
    reminderChecks: report.reminderChecks || []
  };
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
  renderCustomerInvoiceDesk();
}

async function saveCustomerInvoiceDeskReport(button, successText = "Tagesübersicht gespeichert.") {
  if (!state.invoiceTerminalToken) {
    showToast("Bitte Mitarbeiter-Code eingeben.");
    return;
  }
  const oldText = button?.textContent || "";
  if (button) {
    button.disabled = true;
    button.textContent = "Speichert...";
  }
  try {
    const result = await api("/api/day-terminal", {
      method: "POST",
      body: JSON.stringify({
        ...(await collectCustomerInvoiceDeskPayload()),
        terminalToken: state.invoiceTerminalToken
      })
    });
    state.invoiceDate = result.date || state.invoiceDate || todayKey();
    state.invoiceReport = result.report || {};
    state.dayReports[state.invoiceDate] = state.invoiceReport;
    renderCustomerInvoiceDesk();
    $("#customerInvoiceStaffStatus").textContent = successText;
    showToast(successText);
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
  await saveCustomerInvoiceDeskReport(button, markReady ? "Rechnung ist fertig für Chef." : "Rechnungskunde zwischengespeichert.");
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
  const amount = parseMoneyInput(reportFieldValue(row, "bowlingAmount")) + parseMoneyInput(reportFieldValue(row, "gastroAmount"));
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
    await terminalAction(await collectDayReportPayload());
    showToast(markReady ? "Rechnung ist fertig für Chef." : "Rechnungskunde zwischengespeichert.");
  } catch (error) {
    if (markReady) setReportFieldValue(row, "invoiceReady", "false");
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
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        let quality = 0.72;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > 2200000 && quality > 0.42) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        if (dataUrl.length > 2800000) {
          reject(new Error("Beleg ist trotz Verkleinerung zu groß. Bitte Foto näher zuschneiden."));
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
  const schedule = state.terminalSchedule || {};
  Object.entries(schedule).forEach(([key, value]) => {
    if (!key.includes("__") && value) names.add(String(value));
  });
  (state.terminalReport?.extraEmployees || []).forEach((item) => {
    names.add(typeof item === "string" ? item : item.employee);
  });
  return [...names].filter((employee) => (state.settings.employees || []).includes(employee));
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
  state.dayReports[state.terminalDate] = state.terminalReport;
  state.terminalSchedule = result.schedule || {};
  state.terminalTasks = result.tasks || [];
  state.terminalReminders = normalizeReminderTemplates(result.reminders);
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
  state.dayReports[state.terminalDate] = state.terminalReport;
  state.terminalSchedule = result.schedule || {};
  state.terminalTasks = result.tasks || [];
  state.terminalReminders = normalizeReminderTemplates(result.reminders);
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
    state.dayReports[state.terminalDate] = state.terminalReport;
    state.terminalSchedule = result.schedule || {};
    state.terminalTasks = result.tasks || [];
    state.terminalReminders = normalizeReminderTemplates(result.reminders);
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
    state.dayReports[state.terminalDate] = state.terminalReport;
    state.terminalCorrectionMode = false;
    if (state.terminalDate === date) {
      state.terminalEntries = result.entries || state.terminalEntries || {};
      state.terminalSchedule = result.schedule || state.terminalSchedule || {};
      state.terminalTasks = result.tasks || state.terminalTasks || [];
      state.terminalReminders = normalizeReminderTemplates(result.reminders || state.terminalReminders);
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
  const checks = [...(state.terminalReport?.toiletChecks || [])];
  const reminderChecks = [...(state.terminalReport?.reminderChecks || [])];
  if (!checks.some((item) => item.checkKey === checkKey)) {
    checks.push({ checkKey, checkedAt: new Date().toISOString() });
  }
  if (!reminderChecks.some((item) => item.checkKey === checkKey)) {
    reminderChecks.push({ checkKey, text, checkedAt: new Date().toISOString() });
  }
  state.terminalReport = { ...(state.terminalReport || {}), toiletChecks: checks, reminderChecks };
  state.pendingToiletCheck = "";
  state.pendingReminder = null;
  window.localStorage?.setItem(`toilet-check-${checkKey}`, "1");
  $("#toiletReminder")?.classList.add("hidden");
  renderToiletStatus(state.terminalReport);
  try {
    await terminalAction({
      action: "save-report",
      ecTotal: $("#reportEcTotal")?.value || state.terminalReport.ecTotal || "",
      barBowling: $("#reportBarBowling")?.value || state.terminalReport.barBowling || "",
      barGastro: $("#reportBarGastro")?.value || state.terminalReport.barGastro || "",
      openingHours: $("#terminalOpeningHours")?.value || state.terminalReport.openingHours || "",
      shiftLeader: $("#terminalShiftLeader")?.value || state.terminalReport.shiftLeader || "",
      handovers: state.terminalReport.handovers || [],
      invoiceCustomers: await collectReportEntries("invoice"),
      expenses: await collectReportEntries("expense"),
      notes: $("#reportNotes")?.value || state.terminalReport.notes || "",
      taskCompletions: state.terminalReport.taskCompletions || {},
      toiletChecks: checks,
      reminderChecks
    });
  } catch (error) {
    console.warn("Toiletten-Kontrolle lokal quittiert, Server-Speicherung fehlgeschlagen:", error);
  }
  return { ok: true, message: "Kontrolle quittiert." };
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
  container.innerHTML = employeeOverviewHtml();
}

function employeeOverviewHtml() {
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
                  <span>${escapeHtml(shift.from || "?")} - ${escapeHtml(shift.to || "?")}</span>
                  <span>${formatHours(shift.hours)}</span>
                  ${shift.breakMinutes ? `<small>${escapeHtml(shift.breakSummary)}</small>` : ""}
                  ${shift.adminOnly ? `<small>Nur Admin${shift.adminNote ? ` | ${escapeHtml(shift.adminNote)}` : ""}</small>` : ""}
                </div>
              `).join("") || `<p class="hint">Keine Arbeitszeiten für diesen Monat erfasst.</p>`}
            </div>
            <div class="admin-timesheet-form" data-admin-timesheet-form="${escapeHtml(employee)}">
              <p class="hint">Nur Admin: vergessene Stunden und Tage können auch bei abgeschlossenen Tagesberichten ergänzt werden.</p>
              <label>Datum<input type="date" data-admin-ts-field="date" value="${escapeHtml(defaultDate)}"></label>
              <label>Beginn<input type="time" data-admin-ts-field="from"></label>
              <label>Ende<input type="time" data-admin-ts-field="to"></label>
              <label>Hinweis<input data-admin-ts-field="note" placeholder="z.B. vergessen einzutragen"></label>
              <button class="primary" type="button" data-admin-save-timesheet="${escapeHtml(employee)}">Stunden nachtragen</button>
            </div>
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
    .filter(([dateKey, entry]) => dateKey.startsWith(state.selectedMonth) && entry.from && entry.to)
    .map(([date, entry]) => ({
      date,
      from: entry.from || "",
      to: entry.to || "",
      hours: paidHours(entry),
      breakMinutes: breakMinutes(entry),
      breakSummary: breakSummaryText(entry),
      adminOnly: Boolean(entry.adminOnly || entry.source === "admin-manual"),
      adminNote: entry.adminNote || ""
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function renderSettings() {
  $("#businessName").value = state.settings.businessName;
  $("#employeesText").value = state.settings.employees.join("\n");
  $("#employeePinsText").value = "";
  $("#terminalCodeSetting").value = "";
  if ($("#scheduleAutoDeleteDays")) $("#scheduleAutoDeleteDays").value = String(normalizeScheduleAutoDeleteDays(state.settings.scheduleAutoDeleteDays, 14));
  if ($("#hourlyRateSetting")) $("#hourlyRateSetting").value = String(normalizeHourlyRate(state.settings.hourlyRate, 25));
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
  const departmentOptions = departmentOptionsForEmployeeCards(departments);
  target.innerHTML = (state.settings.employees || []).map((name, index) => `
    <details class="employee-card" data-employee-card="${index}" data-original-employee-name="${escapeHtml(name)}">
      <summary>
        <strong>${escapeHtml(name)}</strong>
        <span>${escapeHtml(roles[name] || "Keine Rolle")} · ${(departments[name] || []).join(", ") || "Keine Bereiche"}</span>
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
          <label><input type="checkbox" data-employee-exempt ${exempt.has(name) ? "checked" : ""}> Keine Verfügbarkeit nötig</label>
        </div>
        <div class="employee-card-actions">
          <button class="primary" type="button" data-save-employees>Diese Karte speichern</button>
          <button class="secondary danger-button" type="button" data-remove-employee="${index}">Mitarbeiter entfernen</button>
        </div>
      </div>
    </details>
  `).join("") || `<p class="hint">Noch keine Mitarbeiter angelegt.</p>`;
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
  const admins = [];
  const exempt = [];
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
    if (card.querySelector("[data-employee-admin]")?.checked) admins.push(name);
    if (card.querySelector("[data-employee-exempt]")?.checked) exempt.push(name);
  });
  $("#employeesText").value = employees.join("\n");
  $("#employeePinsText").value = Object.entries(pins).map(([name, pin]) => `${name}=${pin}`).join("\n");
  $("#employeeRolesText").value = Object.entries(roles).map(([name, role]) => `${name}=${role}`).join("\n");
  $("#employeeDepartmentsText").value = Object.entries(departments).map(([name, deps]) => `${name}=${deps.join(",")}`).join("\n");
  $("#adminEmployeesText").value = admins.join("\n");
  $("#availabilityExemptText").value = exempt.join("\n");
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
  for (const [employee, days] of Object.entries(state.availability)) {
    if (days[dateKey] && days[dateKey].status === "yes") yes.push(employee);
  }
  return yes.length ? `Kann: ${yes.join(", ")}` : "Keine Zusagen";
}

function employeeHint(employee, dateKey) {
  const day = state.availability[employee] ? state.availability[employee][dateKey] : null;
  if (!day) return "";
  if (day.status === "yes") {
    const time = day.from || day.to ? ` ${day.from || "?"}-${day.to || "?"}` : "";
    return ` (kann${time})`;
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
  if (clean.startsWith("spüler") || clean.startsWith("spueler") || clean.startsWith("spuler")) return "Kueche";
  if (clean.startsWith("reinigung")) return "Reinigung";
  if (clean.startsWith("mechanik")) return "Mechanik";
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

function employeesForPosition(position) {
  const department = departmentForPosition(position);
  const positionName = canonicalDepartmentChoice(position);
  if (department === "Service") return state.settings.employees || [];
  const departments = state.settings.employeeDepartments || {};
  const roles = state.settings.employeeRoles || {};
  const matching = state.settings.employees.filter((employee) => {
    const employeeDepartments = (departments[employee] || []).map(canonicalDepartmentChoice);
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
    [`${year}-01-06`, "Hl. Drei Koenige"],
    [isoDate(addDays(easter, -2)), "Karfreitag"],
    [isoDate(addDays(easter, 1)), "Ostermontag"],
    [`${year}-05-01`, "Tag der Arbeit"],
    [isoDate(addDays(easter, 39)), "Christi Himmelfahrt"],
    [isoDate(addDays(easter, 50)), "Pfingstmontag"],
    [isoDate(addDays(easter, 60)), "Fronleichnam"],
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
  toast.textContent = message;
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
  state.adminUnlocked = false;
  await loadState();
  if (!login.employee && login.isAdmin) {
    state.adminUnlocked = true;
    activateTab("admin");
    showToast("Admin-Bereich geöffnet.");
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
  state.adminUnlocked = false;
  state.isChef = false;
  activateTab("home");
  renderAll();
}

function activateTab(name) {
  $$(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
  $$(".panel").forEach((panel) => panel.classList.toggle("active", panel.id === name));
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
    await api("/api/settings", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        businessName: $("#businessName").value,
        adminPin: $("#newPin").value,
        terminalCode: $("#terminalCodeSetting").value,
        scheduleAutoDeleteDays: Number($("#scheduleAutoDeleteDays")?.value || 14),
        hourlyRate: Number($("#hourlyRateSetting")?.value || 25),
        employees: $("#employeesText").value.split("\n"),
        employeePins: textToPins($("#employeePinsText").value),
        adminEmployees: linesToList($("#adminEmployeesText").value),
        employeeDepartments: textToDepartments($("#employeeDepartmentsText").value),
        employeeRoles: textToRoles($("#employeeRolesText").value),
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
    event.target.classList.toggle("active", !wasActive);
    event.target.closest(".day-card").classList.toggle("can-work", !wasActive);
  });

  $("#publishedMonths").addEventListener("click", (event) => {
    if (!event.target.matches("[data-month]")) return;
    state.selectedMonth = event.target.dataset.month;
    loadState().catch(showError);
  });

  $("#homeContent").addEventListener("click", (event) => {
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
    if (!event.target.matches("#chefEmployeeMonth")) return;
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
      await api("/api/state", {
        method: "POST",
        body: JSON.stringify({
          action: "customer-invoice",
          customer
        })
      });
      event.target.reset();
      status.textContent = "Danke, die Rechnungsdaten wurden für heute angelegt.";
      showToast("Rechnungskunde angelegt.");
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
    const removeButton = event.target.closest("[data-remove-report-entry]");
    if (!removeButton) return;
    removeButton.closest(".report-entry")?.remove();
    showToast("Eintrag entfernt. Bitte speichern.");
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
            month: state.selectedMonth,
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
      const employee = state.activeEmployee;
      await api("/api/availability", {
        method: "POST",
        body: JSON.stringify({
          month: state.selectedMonth,
          employeeToken: state.employeeToken,
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
    if (!text) {
      showToast("Bitte Nachricht eingeben.");
      return;
    }
    try {
      const result = await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
        body: JSON.stringify({
          action: "add-message",
          target: $("#messageTarget").value,
          employees: linesToList($("#messageEmployees").value),
          text
        })
      });
      state.messages = result.messages || [];
      $("#messageText").value = "";
      $("#messageEmployees").value = "";
      renderAdminMessages();
      showToast("Nachricht veröffentlicht.");
    } catch (error) {
      showError(error);
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

  $("#runningTaskFrequency")?.addEventListener("change", updateRunningTaskFields);
  $("#prepTaskFrequency")?.addEventListener("change", updatePrepClosingTaskFields);
  $("#closingTaskFrequency")?.addEventListener("change", updatePrepClosingTaskFields);
  $("#taskCalendarMonth")?.addEventListener("change", renderTaskCalendar);

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
    $$(".admin-calendar-day").forEach((item) => item.classList.toggle("selected", item === day));
  });

  $("#addCalendarTask")?.addEventListener("click", async () => {
    const intervalDays = Number($("#calendarTaskInterval")?.value || 0);
    const date = $("#calendarTaskDate")?.value || todayKey();
    await addAdminTask({
      titleSelector: "#calendarTaskTitle",
      noteSelector: "#calendarTaskNote",
      category: "running",
      frequency: intervalDays > 0 ? "interval" : "once",
      date,
      startDate: date,
      endDate: $("#calendarTaskEndDate")?.value || "",
      intervalDays: intervalDays || 1
    });
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
      return;
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
      dayOfMonth: config.dayOfMonth || 1
    };
    try {
      state.taskTemplates = [withTaskDefaults(task), ...(state.taskTemplates || [])];
      await saveAllTaskTemplates();
      if (titleInput) titleInput.value = "";
      if (noteInput) noteInput.value = "";
      if (config.category === "running" && $("#runningTaskDate")) $("#runningTaskDate").value = "";
      if (config.titleSelector === "#calendarTaskTitle") {
        $("#calendarTaskInterval").value = "";
        $("#calendarTaskEndDate").value = "";
      }
      renderAdminTasks();
      await refreshTerminalTasks();
      showToast("Aufgabe gespeichert.");
    } catch (error) {
      showError(error);
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

  function withTaskDefaults(task) {
    return {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...task
    };
  }

  async function saveAllTaskTemplates() {
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

  $("#adminEmployeeOverview")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-save-timesheet]");
    if (!button) return;
    saveAdminTimesheet(button);
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
          from: card.querySelector('[data-terminal-time="from"]')?.value || "",
          to: card.querySelector('[data-terminal-time="to"]')?.value || ""
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
  });

  $("#dayReportPrintArea")?.addEventListener("click", (event) => {
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
    const removeButton = event.target.closest("[data-remove-report-entry]");
    if (!removeButton) return;
    if (state.terminalReport?.closed) return;
    removeButton.closest(".report-entry")?.remove();
    showToast("Eintrag entfernt. Bitte Tagesbericht speichern.");
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

  $("#reportBarBowling")?.addEventListener("input", updateReportBarTotal);
  $("#reportBarGastro")?.addEventListener("input", updateReportBarTotal);
  $("#reportEcTotal")?.addEventListener("input", () => renderDayReportA4Summary(state.terminalDate || todayKey(), reportPreviewFromForm()));

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

  $("#printDayReport")?.addEventListener("click", () => {
    const report = $("#dayReportPrintArea");
    if (report) report.open = true;
    window.print();
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
  if (state.terminalToken) checkTerminalReminders(state.terminalReport || {}, Boolean(state.terminalReport?.closed));
}, 60000);
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
