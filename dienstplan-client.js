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
  isChef: false,
  chefTab: "reports",
  timesheets: {},
  messages: [],
  dayReports: {},
  missingAvailability: [],
  swaps: { open: [], mine: [], myShifts: [], admin: [] },
  availabilityChangeRequests: [],
  weather: null,
  terminalToken: "",
  terminalTab: "tasks",
  terminalDate: "",
  terminalEntries: {},
  terminalReport: {},
  terminalSchedule: {},
  terminalTasks: [],
  terminalReminders: [],
  pendingToiletCheck: "",
  pendingReminder: null,
  taskTemplates: [],
  reminderTemplates: []
};

const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
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
    positions: ["Counter 1", "Counter 2", "Service 1", "Service 2", "Service 3", "Service 4", "Service 5", "Kueche 1", "Kueche 2", "Spueler", "Reinigung", "Mechanik"]
  },
  availability: {},
  schedules: {},
  timesheets: {},
  messages: [],
  dayReports: {},
  availabilityChangeRequests: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

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
  state.reminderTemplates = data.reminderTemplates || [];
  state.dayReports = data.dayReports || {};
  state.isChef = Boolean(data.isChef);
  state.missingAvailability = data.missingAvailability || [];
  state.availabilityChangeRequests = data.availabilityChangeRequests || [];
  renderAll();
  loadSwaps().catch(() => {});
  loadWeather().catch(() => {});
}

async function loadSwaps() {
  const params = new URLSearchParams({ month: state.selectedMonth });
  if (state.employeeToken) params.set("employeeToken", state.employeeToken);
  if (state.adminToken) params.set("adminToken", state.adminToken);
  state.swaps = await api(`/api/swaps?${params.toString()}`);
  renderHome();
  renderSwaps();
  renderAdminSwaps();
}

async function loadWeather() {
  try {
    const data = await api("/api/weather");
    state.weather = data;
  } catch (error) {
    state.weather = { error: true };
  }
  renderWeather();
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
      positions: ensureRequiredPositions(incomingSettings.positions || base.settings.positions || [])
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

function renderAll() {
  $("#appTitle").textContent = isCustomerInvoiceMode() ? "Bezahlung auf Rechnung" : state.settings.businessName;
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
  renderWeather();
  renderTerminal();
}

function renderAccess() {
  if (isTerminalMode()) {
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
  $("#mainTabs")?.classList.toggle("hidden", !loggedIn || state.adminUnlocked);
  $$(".employee-only").forEach((element) => element.classList.toggle("hidden", !loggedIn || state.adminUnlocked || chef));
  $('[data-tab="swaps"]')?.classList.add("hidden");
  $$(".chef-only").forEach((element) => element.classList.toggle("hidden", !chef || state.adminUnlocked));
  $("#homeLogin")?.classList.toggle("hidden", loggedIn);
  $("#homeGreeting")?.classList.toggle("hidden", !loggedIn);
  $("#topLogout")?.classList.toggle("hidden", !loggedIn && !state.adminUnlocked);
  if ($("#homeEmployeeName")) {
    $("#homeEmployeeName").innerHTML = loggedIn ? renderEmployeeBadge() : "";
  }
}

function isTerminalMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has("terminal") || window.location.hash === "#terminal";
}

function isCustomerInvoiceMode() {
  const params = new URLSearchParams(window.location.search);
  return params.has("kunde") || params.has("rechnung") || window.location.hash === "#rechnung";
}

function currentUserIsChef() {
  if (!state.activeEmployee) return false;
  const role = String(state.settings?.employeeRoles?.[state.activeEmployee] || "").toLowerCase();
  return state.isChef || state.activeEmployee.trim().toLowerCase() === "peter" || role.includes("chef") || role.includes("betriebsleitung");
}

function renderEmployeeBadge() {
  const role = state.settings.employeeRoles?.[state.activeEmployee] || "Team";
  if (currentUserIsChef()) {
    return `
      <span class="employee-badge-name">${escapeHtml(state.activeEmployee)}</span>
      <span class="employee-badge-role">${escapeHtml(role)}</span>
    `;
  }
  const totals = timesheetTotals();
  return `
    <span class="employee-badge-name">${escapeHtml(state.activeEmployee)}</span>
    <span class="employee-badge-role">${escapeHtml(role)}</span>
    <button class="employee-badge-stat compact" type="button" data-open-timesheet><small>Std</small>${formatHours(totals.hours)}</button>
    <span class="employee-badge-stat compact"><small>TG</small>${formatMoney(totals.tip)}</span>
  `;
}

function renderHome() {
  const container = $("#homeContent");
  if (!container) return;
  const today = todayKey();
  if (!state.activeEmployee && !state.adminUnlocked) {
    container.innerHTML = renderLoginReminder(today);
    return;
  }
  if (currentUserIsChef()) {
    container.innerHTML = chefDashboardHtml();
    return;
  }
  container.innerHTML = `
    ${renderDashboardMessages()}
    ${renderHomeStats()}
    <details class="today-section dashboard-today" open>
      <summary>Heutiger Tag</summary>
      ${renderScheduleDay(new Date(`${today}T12:00:00`), { today: true })}
    </details>
    ${state.activeEmployee ? renderHomeSwaps() : ""}
    ${state.adminUnlocked ? renderMissingAvailability() : ""}
  `;
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
  return `
    ${renderDashboardMessages()}
    <section class="chef-current-day">
      <h3>Heutiger Tag</h3>
      ${renderScheduleDay(new Date(`${today}T12:00:00`), { today: true })}
    </section>
    <nav class="chef-tabs" aria-label="Chef-Bereiche">
      <button class="chef-tab ${state.chefTab === "reports" ? "active" : ""}" type="button" data-chef-tab="reports">Tagesberichte</button>
      <button class="chef-tab ${state.chefTab === "employees" ? "active" : ""}" type="button" data-chef-tab="employees">Mitarbeiterübersicht</button>
      <button class="chef-tab ${state.chefTab === "schedule" ? "active" : ""}" type="button" data-chef-tab="schedule">Dienstplan</button>
    </nav>
    <section class="chef-section ${state.chefTab === "reports" ? "active" : "hidden"}">
      ${dayReportFoldersByMonthHtml()}
      ${dayReportsHtml()}
    </section>
    <section class="chef-section ${state.chefTab === "employees" ? "active" : "hidden"}">
      <div class="chef-section-head">
        <h3>Mitarbeiterübersicht</h3>
        <label>
          Monat
          <input id="chefEmployeeMonth" type="month" value="${escapeHtml(state.selectedMonth)}">
        </label>
      </div>
      ${employeeOverviewHtml()}
    </section>
    <section class="chef-section ${state.chefTab === "schedule" ? "active" : "hidden"}">
      <div class="chef-current-plan">
        <h3>Aktueller Dienstplan</h3>
        ${schedule.published
          ? renderPublishedWeekSections(state.selectedMonth)
          : `<p class="hint">Für ${formatMonth(state.selectedMonth)} ist noch kein Dienstplan veröffentlicht.</p>`}
      </div>
    </section>
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
          <span>${report.closed ? "Abgeschlossen · " : ""}EC ${formatReportMoney(report.ecTotal)} · Rechnung ${formatReportMoney(reportItemsTotal(report.invoiceCustomers))} · Ausgaben ${formatReportMoney(reportItemsTotal(report.expenses))}</span>
          </summary>
          <div class="day-report-values">
            <span><small>EC gesamt</small><strong>${formatReportMoney(report.ecTotal)}</strong></span>
            <span><small>Bar Bowling</small><strong>${formatReportMoney(report.barBowling)}</strong></span>
            <span><small>Bar Gastro</small><strong>${formatReportMoney(report.barGastro)}</strong></span>
            <span><small>Bar gesamt</small><strong>${formatReportMoney(barTotal(report))}</strong></span>
            <span><small>Rechnungskunden</small><strong>${formatReportMoney(reportItemsTotal(report.invoiceCustomers))}</strong></span>
            <span><small>Ausgaben</small><strong>${formatReportMoney(reportItemsTotal(report.expenses))}</strong></span>
          </div>
          ${reportPreparationHtml(dateKey, report)}
          ${reportHandoversHtml(report.handovers)}
          ${reportInvoiceCustomersHtml(report.invoiceCustomers)}
          ${reportExpensesHtml(report.expenses)}
          ${reportDocumentsHtml(report.documents)}
          <button class="secondary" data-export-day-report="${escapeHtml(dateKey)}" type="button">Bericht exportieren</button>
          ${report.extraEmployees?.length ? `<p><strong>Zusätzlich:</strong> ${report.extraEmployees.map(escapeHtml).join(", ")}</p>` : ""}
          <p>${report.notes ? escapeHtml(report.notes) : "Keine Notizen."}</p>
        </details>
      `).join("")}
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
          <h3>Berichtsordner</h3>
          <p>Monatsweise Belege und Abschlussdokumente gesammelt exportieren.</p>
        </div>
      </div>
      ${sortedMonths.map((month) => `
        <details class="report-month-card" ${month === state.selectedMonth ? "open" : ""}>
          <summary class="report-month-summary">
            <span>
              <strong>${formatMonth(month)}</strong>
              <small>${monthReportDays(month)} Tagesberichte</small>
            </span>
            <b>${folders.reduce((sum, [key]) => sum + reportFolderItems(month, key).length, 0)} Dateien</b>
          </summary>
          <div class="report-folder-grid">
            ${folders.map(([key, label]) => reportFolderHtml(month, key, label)).join("")}
          </div>
        </details>
      `).join("")}
    </section>
  `;
}

function reportFolderHtml(month, key, label) {
  const items = reportFolderItems(month, key);
  return `
    <article class="report-folder-card">
      <header class="report-folder-card-head">
        <div>
          <strong>${escapeHtml(label)}</strong>
          <span>${items.length} Datei${items.length === 1 ? "" : "en"}</span>
        </div>
        <button class="secondary" type="button" data-export-report-folder="${escapeHtml(month)}|${escapeHtml(key)}" ${items.length ? "" : "disabled"}>Alle exportieren</button>
      </header>
      <div class="report-folder-files">
        ${items.length ? items.map((item) => `
          <div class="report-folder-file">
            <span>${escapeHtml(item.title)}</span>
            ${receiptLinkHtml(item, item.label)}
          </div>
        `).join("") : `<p class="hint">Keine Dateien in diesem Ordner.</p>`}
      </div>
    </article>
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
        const bowling = {
          receiptName: customer.bowlingReceiptName || customer.receiptName,
          receiptPath: customer.bowlingReceiptPath || customer.receiptPath,
          receiptUrl: customer.bowlingReceiptUrl || customer.receiptUrl,
          receiptData: customer.bowlingReceiptData || customer.receiptData
        };
        const gastro = {
          receiptName: customer.gastroReceiptName,
          receiptPath: customer.gastroReceiptPath,
          receiptUrl: customer.gastroReceiptUrl,
          receiptData: customer.gastroReceiptData
        };
        if (hasReceipt(bowling)) items.push(receiptFolderItem(dateKey, bowling, `${base} - Bowling`, "Beleg Bowling"));
        if (hasReceipt(gastro)) items.push(receiptFolderItem(dateKey, gastro, `${base} - Gastro`, "Beleg Gastro"));
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
          <span>Ansprechpartner: ${escapeHtml(item.contact || "-")}</span>
          <span>Telefon: ${escapeHtml(item.phone || "-")}</span>
          <span>Tipp: ${escapeHtml(item.tip || "-")}</span>
          <span>${escapeHtml(item.address || "Keine Rechnungsadresse")}</span>
          <span>${escapeHtml(item.email || "Keine E-Mail")}</span>
          ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
          ${receiptLinkHtml({ receiptData: item.bowlingReceiptData || item.receiptData, receiptPath: item.bowlingReceiptPath || item.receiptPath, receiptUrl: item.bowlingReceiptUrl || item.receiptUrl, receiptName: item.bowlingReceiptName || item.receiptName }, "Beleg Bowling")}
          ${receiptLinkHtml({ receiptData: item.gastroReceiptData, receiptPath: item.gastroReceiptPath, receiptUrl: item.gastroReceiptUrl, receiptName: item.gastroReceiptName }, "Beleg Gastro")}
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
  return Number(report.barBowling || 0) + Number(report.barGastro || 0);
}

function invoiceTotal(item = {}) {
  const splitTotal = Number(item.bowlingAmount || 0) + Number(item.gastroAmount || 0);
  return splitTotal || Number(item.amount || 0);
}

function exportDayReport(dateKey) {
  const report = state.dayReports?.[dateKey];
  if (!report) return;
  const lines = [
    `Tagesbericht ${formatDate(dateKey)}`,
    "",
    `EC gesamt: ${formatReportMoney(report.ecTotal)}`,
    `Bar Bowling: ${formatReportMoney(report.barBowling)}`,
    `Bar Gastro: ${formatReportMoney(report.barGastro)}`,
    `Bar gesamt: ${formatReportMoney(barTotal(report))}`,
    `Rechnungskunden gesamt: ${formatReportMoney(reportItemsTotal(report.invoiceCustomers))}`,
    `Ausgaben gesamt: ${formatReportMoney(reportItemsTotal(report.expenses))}`,
    reportPreparationLine(dateKey, report),
    "",
    "Übergaben:",
    ...(report.handovers || []).map((item) => `- ${item.time || "--:--"} | ${item.from || "-"} an ${item.to || "-"} | ${item.note || "-"}`),
    "",
    "Rechnungskunden:",
    ...(report.invoiceCustomers || []).map((item) => [
      `- ${item.name || "Kunde"} | ${item.area === "gastro" ? "Gastro" : "Bowling"} | ${formatReportMoney(item.amount)}`,
      `  Adresse: ${item.address || "-"}`,
      `  Ansprechpartner: ${item.contact || "-"}`,
      `  Telefon: ${item.phone || "-"}`,
      `  Tipp: ${item.tip || "-"}`,
      `  E-Mail: ${item.email || "-"}`,
      `  Bowling: ${formatReportMoney(item.bowlingAmount)} | Beleg: ${item.bowlingReceiptName || item.receiptName || "-"}`,
      `  Gastro: ${formatReportMoney(item.gastroAmount)} | Beleg: ${item.gastroReceiptName || "-"}`
    ].join("\n")),
    "",
    "Ausgaben:",
    ...(report.expenses || []).map((item) => `- ${item.name || "Ausgabe"} | ${item.category || "-"} | ${formatReportMoney(item.amount)} | Beleg: ${item.receiptName || "-"}`),
    "",
    "Abschlussdokumente:",
    `- Penta: ${report.documents?.penta?.name || "-"}`,
    `- Handschrift: ${report.documents?.handwriting?.name || "-"}`,
    "",
    `Notizen: ${report.notes || "-"}`
  ];
  downloadText(`tagesbericht-${dateKey}.txt`, lines.join("\n"));
}

function exportReportFolder(value) {
  const [month, key] = String(value || "").split("|");
  const items = reportFolderItems(month, key).filter((item) => item.href);
  if (!items.length) {
    showToast("In diesem Ordner sind keine Dateien zum Exportieren.");
    return;
  }
  items.forEach((item, index) => {
    window.setTimeout(() => downloadFileLink(item.href, item.receiptName || `${item.label}-${index + 1}`), index * 350);
  });
  showToast(`${items.length} Datei${items.length === 1 ? "" : "en"} werden exportiert.`);
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
    cells.push(`<div class="position-cell weather-cell" id="weatherReport">Wetter wird geladen...</div>`);
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
  const targets = $$("#weatherReport");
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
        <span class="assignment">Nicht verfügbar</span>
        <span class="assignment-note">Bitte später erneut versuchen.</span>
      `;
    });
    return;
  }
  const daily = state.weather.daily || {};
  const current = state.weather.current || {};
  targets.forEach((target) => {
    target.innerHTML = `
      <span class="position-name">Wetterbericht</span>
      <span class="assignment">${weatherText(daily.weatherCode)}</span>
      <span class="assignment-note">Jetzt ${roundValue(current.temperature_2m)} C, Wind ${roundValue(current.wind_speed_10m)} km/h</span>
      <span class="assignment-note">Heute ${roundValue(daily.tempMin)}-${roundValue(daily.tempMax)} C, Regen ${roundValue(daily.precipitation)} mm</span>
      <span class="hint">${escapeHtml(state.weather.location || "Roentgenstrasse 12, 84034 Landshut")}</span>
    `;
  });
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
    const hours = hoursBetween(entry.from, entry.to);
    return `
      <article class="timesheet-row" data-date="${dateKey}">
        <div>
          <strong>${formatDate(dateKey)}</strong>
          <span>${escapeHtml(entry.from || "--:--")} bis ${escapeHtml(entry.to || "--:--")} · ${formatHours(hours)}</span>
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
    totals.hours += hoursBetween(entry.from, entry.to);
    totals.tip += Number(entry.tip || 0);
    return totals;
  }, { hours: 0, tip: 0 });
}

function hoursBetween(from, to) {
  if (!from || !to) return 0;
  const [fromH, fromM] = from.split(":").map(Number);
  const [toH, toM] = to.split(":").map(Number);
  let start = fromH * 60 + fromM;
  let end = toH * 60 + toM;
  if (end < start) end += 24 * 60;
  return Math.max(0, (end - start) / 60);
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
}

function renderTerminal() {
  const panel = $("#terminal");
  if (!panel) return;
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
  renderTerminalTasks(report, reportClosed);
  renderHandovers(report, reportClosed);
  renderToiletStatus(report);
  checkTerminalReminders(report, reportClosed);
  renderTerminalCosts(dateKey, employees);
  $(".terminal-add")?.classList.remove("hidden");
  $("#terminalEmployees").innerHTML = employees.length ? employees.map((employee) => {
    const entry = entries[employee]?.[dateKey] || {};
    const hours = hoursBetween(entry.from, entry.to);
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
        </div>
        <div class="terminal-time-edit">
          <label>Beginn<input type="time" data-terminal-time="from" value="${escapeHtml(entry.from || "")}" ${reportClosed ? "disabled" : ""}></label>
          <label>Ende<input type="time" data-terminal-time="to" value="${escapeHtml(entry.to || "")}" ${reportClosed ? "disabled" : ""}></label>
          <button class="secondary" data-terminal-adjust="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Korrigieren</button>
        </div>
        <div class="terminal-actions">
          <button class="primary" data-terminal-punch="start" data-terminal-employee="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Dienstbeginn</button>
          <button class="secondary" data-terminal-punch="end" data-terminal-employee="${escapeHtml(employee)}" ${reportClosed ? "disabled" : ""}>Dienstende</button>
        </div>
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
  setDayReportLocked(reportClosed, report);

  const select = $("#terminalAddEmployee");
  if (select) {
    const planned = new Set(employees);
    const options = (state.settings.employees || []).filter((employee) => !planned.has(employee));
    select.innerHTML = `<option value="">Ungeplanten Mitarbeiter auswählen</option>${options.map((employee) => `<option value="${escapeHtml(employee)}">${escapeHtml(employee)}</option>`).join("")}`;
  }
}

function renderTerminalTabs() {
  const active = state.terminalTab || "tasks";
  $$(".terminal-tab").forEach((button) => button.classList.toggle("active", button.dataset.terminalTab === active));
  $("#terminalTasksSection")?.classList.toggle("hidden", active !== "tasks");
  $("#terminalServiceSection")?.classList.toggle("hidden", active !== "service");
  $("#dayReportPrintArea")?.classList.toggle("hidden", active !== "finance");
}

function renderTerminalDayMeta(dateKey, report, reportClosed) {
  const dateInput = $("#terminalWorkDate");
  const openingInput = $("#terminalOpeningHours");
  const leaderSelect = $("#terminalShiftLeader");
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
  const handovers = report.handovers || [];
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
  $("#terminalReminderTitle").textContent = due?.title || "Erinnerung";
  $("#terminalReminderText").textContent = due?.text || "Bitte quittieren.";
  modal.classList.toggle("hidden", !due);
}

function dueReminder(dateKey, report, openingText = "") {
  const reminders = (state.terminalReminders || []).filter((reminder) => reminder.active !== false);
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
      if (!checked.has(key) && window.localStorage?.getItem(`toilet-check-${key}`) !== "1") {
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
  target.querySelectorAll("#addInvoiceCustomer, #addExpense, [data-remove-report-entry], #saveDayReport").forEach((button) => {
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
    invoiceTarget.innerHTML = invoices.map((item) => invoiceRowHtml(item)).join("") || `<p class="hint">Keine Rechnungskunden erfasst.</p>`;
  }
  if (expenseTarget) {
    expenseTarget.innerHTML = expenses.map((item) => expenseRowHtml(item)).join("") || `<p class="hint">Keine Ausgaben erfasst.</p>`;
  }
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

function invoiceRowHtml(item = {}) {
  const id = item.id || cryptoId();
  return `
    <article class="report-entry" data-report-entry="invoice" data-id="${escapeHtml(id)}">
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
      <div class="report-entry-grid">
        <label>Beleg Bowling<input data-report-file="bowling" type="file" accept="image/*,application/pdf"></label>
        <label>Beleg Gastro<input data-report-file="gastro" type="file" accept="image/*,application/pdf"></label>
      </div>
      ${item.bowlingReceiptName || item.receiptName ? `<span class="hint">Bowling-Beleg: ${escapeHtml(item.bowlingReceiptName || item.receiptName)}</span>` : ""}
      ${item.gastroReceiptName ? `<span class="hint">Gastro-Beleg: ${escapeHtml(item.gastroReceiptName)}</span>` : ""}
      <input type="hidden" data-report-field="bowlingReceiptName" value="${escapeHtml(item.bowlingReceiptName || item.receiptName || "")}">
      <input type="hidden" data-report-field="bowlingReceiptData" value="${escapeHtml(item.bowlingReceiptData || item.receiptData || "")}">
      <input type="hidden" data-report-field="bowlingReceiptPath" value="${escapeHtml(item.bowlingReceiptPath || item.receiptPath || "")}">
      <input type="hidden" data-report-field="bowlingReceiptUrl" value="${escapeHtml(item.bowlingReceiptUrl || item.receiptUrl || "")}">
      <input type="hidden" data-report-field="gastroReceiptName" value="${escapeHtml(item.gastroReceiptName || "")}">
      <input type="hidden" data-report-field="gastroReceiptData" value="${escapeHtml(item.gastroReceiptData || "")}">
      <input type="hidden" data-report-field="gastroReceiptPath" value="${escapeHtml(item.gastroReceiptPath || "")}">
      <input type="hidden" data-report-field="gastroReceiptUrl" value="${escapeHtml(item.gastroReceiptUrl || "")}">
      <button class="secondary" data-remove-report-entry type="button">Entfernen</button>
    </article>
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
      <label>Beleg<input data-report-file type="file" accept="image/*,application/pdf"></label>
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
  const selector = type === "invoice" ? '[data-report-entry="invoice"]' : '[data-report-entry="expense"]';
  const entries = [];
  for (const row of $$(selector)) {
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
  const planned = terminalPlannedCosts();
  const actualHours = employees.reduce((total, employee) => {
    const entry = state.terminalEntries?.[employee]?.[dateKey] || {};
    return total + hoursBetween(entry.from, entry.to);
  }, 0);
  const actualCost = actualHours * 25;
  const difference = actualCost - planned.cost;
  const diffText = difference <= 0
    ? `${formatMoney(Math.abs(difference))} unter Prognose`
    : `${formatMoney(difference)} über Prognose`;
  target.innerHTML = `
    <article>
      <span>Prognose</span>
      <strong>${formatMoney(planned.cost)}</strong>
      <small>${formatHours(planned.hours)} geplant</small>
    </article>
    <article>
      <span>Ist-Kosten</span>
      <strong>${formatMoney(actualCost)}</strong>
      <small>${formatHours(actualHours)} gestempelt</small>
    </article>
    <article class="${difference <= 0 ? "cost-good" : "cost-high"}">
      <span>Differenz</span>
      <strong>${diffText}</strong>
      <small>Berechnet mit 25 Euro pro Arbeitsstunde</small>
    </article>
  `;
}

function terminalPlannedCosts() {
  const totalHours = Object.entries(state.terminalSchedule || {}).reduce((sum, [position, employee]) => {
    if (position.includes("__") || !employee) return sum;
    return sum + parsePlannedTime(state.terminalSchedule[`${position}__note`]).hours;
  }, 0);
  return { hours: totalHours, cost: totalHours * 25 };
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
  state.terminalSchedule = result.schedule || {};
  state.terminalTasks = result.tasks || [];
  state.terminalReminders = result.reminders || [];
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
  state.terminalSchedule = result.schedule || {};
  state.terminalTasks = result.tasks || [];
  state.terminalReminders = result.reminders || [];
  state.timesheets = result.entries || state.timesheets || {};
  renderTerminal();
  showToast("Tages-Terminal geöffnet.");
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
    const weeks = groupedMonthWeeks(month).filter((week) => schedule.publishedWeeks?.[week.key] || (!schedule.publishedWeeks && schedule.published));
    return `
      <article class="swap-card">
        <div>
          <strong>${formatMonth(month)}</strong>
          <span>${weeks.length ? `${weeks.length} Wochen veröffentlicht` : "Monat veröffentlicht"}</span>
        </div>
        <div class="week-actions">
          ${weeks.map((week) => `<button class="secondary" data-unpublish-week="${month}|${week.key}">Woche ${weekLabel(week.dates)} löschen</button>`).join("")}
          <button class="primary danger-button" data-delete-schedule-month="${month}">Ganzen Monat löschen</button>
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
                </div>
              `).join("") || `<p class="hint">Keine Arbeitszeiten für diesen Monat erfasst.</p>`}
            </div>
          </div>
        </details>
      `;
    }).join("")}
  `;
}

function totalsForEmployee(employee) {
  const entries = state.timesheets?.[employee] || {};
  return Object.entries(entries).reduce((totals, [dateKey, entry]) => {
    if (!dateKey.startsWith(state.selectedMonth)) return totals;
    totals.hours += hoursBetween(entry.from, entry.to);
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
      hours: hoursBetween(entry.from, entry.to)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function renderSettings() {
  $("#businessName").value = state.settings.businessName;
  $("#employeesText").value = state.settings.employees.join("\n");
  $("#employeePinsText").value = "";
  $("#terminalCodeSetting").value = "";
  $("#employeePinsText").placeholder = "Nur neue oder geaenderte PINs eintragen, Format: Name=PIN";
  $("#adminEmployeesText").value = (state.settings.adminEmployees || []).join("\n");
  $("#employeeDepartmentsText").value = departmentsToText(state.settings.employeeDepartments || {});
  $("#employeeRolesText").value = rolesToText(state.settings.employeeRoles || {});
  $("#availabilityExemptText").value = (state.settings.availabilityExemptEmployees || []).join("\n");
  $("#positionsText").value = state.settings.positions.join("\n");
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

function renderPlanner() {
  const scheduleDays = state.schedule && state.schedule.days ? state.schedule.days : {};
  $("#planner").innerHTML = groupedMonthWeeks(state.selectedMonth).map((week) => `
    <details class="week-section planner-week">
      <summary>
        <span>${weekLabel(week.dates)}</span>
        <span class="week-state">${state.schedule && state.schedule.publishedWeeks && state.schedule.publishedWeeks[week.key] ? "veröffentlicht" : "Entwurf"}</span>
      </summary>
      <div class="week-actions">
        <button class="secondary" data-save-week="${week.key}">Woche speichern</button>
        <button class="primary" data-publish-week="${week.key}">Woche veroeffentlichen</button>
      </div>
      <div class="week-days">
        ${week.dates.map((date) => renderPlannerDay(date, scheduleDays)).join("")}
      </div>
    </details>
  `).join("");
}

function renderPlannerDay(date, scheduleDays) {
    const key = isoDate(date);
    const daySchedule = scheduleDays[key] || {};
    const holiday = holidayInfo(key);
    const activePositions = activePlannerPositions(daySchedule);
    const addablePositions = state.settings.positions.filter((position) => !activePositions.includes(position));
    return `
      <article class="planner-day" data-date="${key}">
        <div class="day-header ${holiday.className}">
          <span>${formatDate(key)}</span>
          <span class="day-badges">
            ${holiday.label ? `<span class="day-badge">${escapeHtml(holiday.label)}</span>` : ""}
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
      </article>
    `;
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
    if (dayNote) {
      assignments.__dayNote = dayNote;
    }
    days[dateKey] = assignments;
  });
  return days;
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
  $("#saveDraft").classList.toggle("hidden", !unlocked);
  $("#publishSchedule").classList.toggle("hidden", !unlocked);
  $("#adminLogout").classList.toggle("hidden", !unlocked);
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
      .map((item) => normalizeDepartment(item))
      .filter(Boolean);
    if (cleanName) {
      departments[cleanName] = [...new Set(values)];
    }
  });
  return departments;
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
  if (department === "Service") return state.settings.employees || [];
  const departments = state.settings.employeeDepartments || {};
  const roles = state.settings.employeeRoles || {};
  const matching = state.settings.employees.filter((employee) => {
    const employeeDepartments = departments[employee] || [];
    const roleDepartment = normalizeDepartment(roles[employee] || "");
    return employeeDepartments.includes(department) || roleDepartment === department;
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
  state.adminUnlocked = Boolean(login.isAdmin);
  await loadState();
  if (login.isAdmin) {
    activateTab("admin");
    showToast(login.employee ? `Hallo ${login.employee}. Admin-Bereich geöffnet.` : "Admin-Bereich geöffnet.");
  } else if (currentUserIsChef()) {
    activateTab("chef");
    showToast(`Hallo ${login.employee}. Chef-Übersicht geöffnet.`);
  } else {
    showToast(`Hallo ${login.employee}.`);
  }
}

function employeeLogout() {
  state.activeEmployee = "";
  state.employeeToken = "";
  state.adminToken = "";
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
    if (!event.target.closest("[data-open-timesheet]")) return;
    activateTab("timesheet");
  });

  $("#publishedSchedule")?.addEventListener("click", (event) => {
    const swapShift = event.target.closest("[data-request-swap-date]");
    if (!swapShift) return;
    requestSwapFromSchedule(swapShift.dataset.requestSwapDate, swapShift.dataset.requestSwapPosition);
  });

  $("#chefDashboard")?.addEventListener("click", (event) => {
    const exportButton = event.target.closest("[data-export-day-report]");
    if (exportButton) {
      exportDayReport(exportButton.dataset.exportDayReport);
      return;
    }
    const folderButton = event.target.closest("[data-export-report-folder]");
    if (folderButton) {
      exportReportFolder(folderButton.dataset.exportReportFolder);
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
      status.textContent = "Danke, die Rechnungsdaten wurden übermittelt.";
      showToast("Rechnungsdaten gespeichert.");
    } catch (error) {
      status.textContent = error.message || String(error);
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
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
    if (!deleteMonth && !unpublishWeek) return;
    try {
      if (deleteMonth) {
        await api("/api/schedule", {
          method: "POST",
          headers: { "x-admin-token": state.adminToken },
          body: JSON.stringify({ action: "delete-month", month: deleteMonth.dataset.deleteScheduleMonth })
        });
        showToast("Dienstplan-Monat geloescht.");
      } else {
        const [month, weekKey] = unpublishWeek.dataset.unpublishWeek.split("|");
        await api("/api/schedule", {
          method: "POST",
          headers: { "x-admin-token": state.adminToken },
          body: JSON.stringify({ action: "unpublish-week", month, weekKey })
        });
        showToast("Woche wurde geloescht.");
      }
      await loadState();
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

  $("#saveSettings").addEventListener("click", async () => {
    const button = $("#saveSettings");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Speichert...";
    try {
      await api("/api/settings", {
        method: "POST",
        headers: { "x-admin-token": state.adminToken },
          body: JSON.stringify({
            businessName: $("#businessName").value,
            adminPin: $("#newPin").value,
            terminalCode: $("#terminalCodeSetting").value,
            employees: $("#employeesText").value.split("\n"),
            employeePins: textToPins($("#employeePinsText").value),
            adminEmployees: linesToList($("#adminEmployeesText").value),
            employeeDepartments: textToDepartments($("#employeeDepartmentsText").value),
            employeeRoles: textToRoles($("#employeeRolesText").value),
            availabilityExemptEmployees: linesToList($("#availabilityExemptText").value),
          positions: $("#positionsText").value.split("\n")
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
    const taskInput = event.target.closest("[data-terminal-task]");
    if (taskInput) {
      try {
        await terminalAction({ action: "complete-task", id: taskInput.dataset.terminalTask, done: taskInput.checked });
      } catch (error) {
        showError(error);
      }
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

  $("#printDayReport")?.addEventListener("click", () => window.print());
  $("#printSchedule").addEventListener("click", () => window.print());
}

async function saveWeek(weekKey, published) {
  const week = groupedMonthWeeks(state.selectedMonth).find((item) => item.key === weekKey);
  if (!week) return;
  $("#adminStatus").textContent = published ? "Woche wird veröffentlicht..." : "Woche wird gespeichert...";
  try {
    await api("/api/schedule", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({
        month: state.selectedMonth,
        weekKey,
        published,
        days: collectScheduleForDates(week.dates.map(isoDate))
      })
    });
    await loadState();
    const message = published ? "Woche ist veröffentlicht." : "Woche gespeichert.";
    $("#adminStatus").textContent = message;
    showToast(message);
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
  $("#adminStatus").textContent = published ? "Dienstplan wird veröffentlicht..." : "Entwurf wird gespeichert...";
  button.disabled = true;
  button.textContent = "Speichert...";
  try {
    await api("/api/schedule", {
      method: "POST",
      headers: { "x-admin-token": state.adminToken },
      body: JSON.stringify({ month: state.selectedMonth, published, days: collectSchedule() })
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
if (isCustomerInvoiceMode()) document.body.classList.add("customer-invoice-mode");
state.settings = cloneData(defaultData.settings);
state.availability = {};
state.schedule = { month: state.selectedMonth, published: false, days: {} };
state.allSchedules = {};
renderAll();
if (isTerminalMode()) activateTab("terminal");
if (isCustomerInvoiceMode()) activateTab("customerInvoice");
loadState().catch(showError);
