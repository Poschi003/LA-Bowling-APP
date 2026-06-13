const {
  createPinHash,
  employeeByPin,
  employeeIsAdmin,
  handleError,
  readAppData,
  readJson,
  sendJson,
  signToken,
  verifyAdmin,
  verifyToken,
  writeAppData
} = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    if (body.action === "change-pin") return changeEmployeePin(body, res);

    const appData = await readAppData();
    const employee = employeeByPin(appData.settings, body.pin);
    if (employee) {
      const isAdmin = employeeIsAdmin(appData.settings, employee);
      return sendJson(res, 200, {
        employee,
        token: signToken({ type: "employee", employee }),
        isAdmin,
        adminToken: isAdmin ? signToken({ type: "admin", employee }) : "",
        mustChangePin: employeeMustChangePin(appData.settings, employee)
      });
    }
    if (verifyAdmin(appData.settings, body.pin)) {
      return sendJson(res, 200, {
        employee: "",
        token: "",
        isAdmin: true,
        adminToken: signToken({ type: "admin" }),
        mustChangePin: false
      });
    }
    sendJson(res, 401, { error: "Falscher PIN." });
  } catch (error) {
    handleError(res, error);
  }
};

async function changeEmployeePin(body, res) {
  const session = verifyToken(body.employeeToken, "employee");
  if (!session?.employee) return sendJson(res, 401, { error: "Bitte erneut mit Mitarbeiter-PIN anmelden." });

  const newPin = String(body.newPin || "").trim();
  const confirmPin = String(body.confirmPin || "").trim();
  if (!/^\d{4,10}$/.test(newPin)) {
    return sendJson(res, 400, { error: "Der neue PIN muss aus 4 bis 10 Ziffern bestehen." });
  }
  if (newPin !== confirmPin) return sendJson(res, 400, { error: "Die PIN-Wiederholung stimmt nicht Ã¼berein." });

  const appData = await readAppData();
  const employee = session.employee;
  if (!(appData.settings.employees || []).includes(employee)) {
    return sendJson(res, 400, { error: "Mitarbeiter nicht gefunden." });
  }

  appData.settings.employeePinHashes ||= {};
  appData.settings.employeePinHashes[employee] = createPinHash(newPin);
  delete appData.settings.employeePins?.[employee];
  appData.settings.employeePinChangeCompleted ||= {};
  appData.settings.employeePinChangeCompleted[employee] = new Date().toISOString();
  await writeAppData(appData);

  const isAdmin = employeeIsAdmin(appData.settings, employee);
  sendJson(res, 200, {
    ok: true,
    employee,
    token: signToken({ type: "employee", employee }),
    isAdmin,
    adminToken: isAdmin ? signToken({ type: "admin", employee }) : "",
    mustChangePin: false
  });
}

function employeeMustChangePin(settings = {}, employee = "") {
  if (!employee || pinChangeExempt(employee)) return false;
  return !settings.employeePinChangeCompleted?.[employee];
}

function pinChangeExempt(employee) {
  const normalized = String(employee || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
  return [
    "kevinleicht",
    "leichtkevin",
    "christianposchenrieder",
    "poschenriederchristian",
    "petervorholzer",
    "vorholzerpeter"
  ].includes(normalized);
}
