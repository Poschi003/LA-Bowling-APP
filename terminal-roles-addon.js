(() => {
  const roleOptions = ["Counter", "Counter 2", "Service", "Kueche", "Kueche 2", "Reinigung", "Mechanik"];
  const oldRenderTerminal = renderTerminal;
  const oldTerminalEmployeesForDay = terminalEmployeesForDay;

  function extras() {
    return (state.terminalReport?.extraEmployees || []).map((item) => (
      typeof item === "string" ? { employee: item, role: "Zusatz" } : item
    )).filter((item) => item?.employee);
  }

  function roleFor(employee) {
    const extra = extras().find((item) => item.employee === employee);
    if (extra?.role) return extra.role;
    for (const [position, value] of Object.entries(state.terminalSchedule || {})) {
      if (!position.includes("__") && value === employee) return position.replace(/\s+\d+$/, "");
    }
    return "Zusatz";
  }

  window.terminalEmployeesForDay = function patchedTerminalEmployeesForDay(dateKey) {
    return [...new Set([...oldTerminalEmployeesForDay(dateKey), ...extras().map((item) => item.employee)])];
  };

  window.renderTerminal = function patchedRenderTerminal() {
    oldRenderTerminal();
    if (!state.terminalToken) return;
    const reportClosed = Boolean(state.terminalReport?.closed);
    const addBox = document.querySelector(".terminal-add");
    const employeeSelect = document.querySelector("#terminalAddEmployee");
    if (addBox) addBox.classList.toggle("hidden", reportClosed);
    if (employeeSelect) {
      const current = new Set(window.terminalEmployeesForDay(state.terminalDate || isoDate(new Date())));
      employeeSelect.innerHTML = `<option value="">Mitarbeiter auswaehlen</option>` + (state.settings.employees || [])
        .filter((name) => !current.has(name))
        .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
        .join("");
    }
    if (addBox && !document.querySelector("#terminalAddRole")) {
      employeeSelect.insertAdjacentHTML("afterend", `<select id="terminalAddRole">${roleOptions.map((role) => `<option>${role}</option>`).join("")}</select>`);
    }
    document.querySelectorAll(".terminal-employee").forEach((card) => {
      const name = card.querySelector("[data-terminal-employee]")?.dataset.terminalEmployee;
      const meta = card.querySelector(".terminal-employee-head span");
      if (name && meta && !meta.dataset.rolePatched) {
        meta.textContent = `${roleFor(name)} · ${meta.textContent}`;
        meta.dataset.rolePatched = "1";
      }
    });
  };

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("#addTerminalEmployee");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const select = document.querySelector("#terminalAddEmployee");
    const role = document.querySelector("#terminalAddRole")?.value || "Zusatz";
    if (!select?.value) return showToast("Bitte Mitarbeiter auswaehlen.");
    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Fuegt hinzu...";
    try {
      const result = await terminalAction({ action: "add-employee", employee: select.value, role });
      showToast(result.message || "Mitarbeiter hinzugefuegt.");
    } catch (error) {
      showError(error);
    } finally {
      button.textContent = oldText;
      button.disabled = false;
    }
  }, true);

  renderTerminal();
})();
