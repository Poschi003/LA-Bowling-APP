const {
  createPinHash,
  handleError,
  publicSettings,
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

    if (Array.isArray(body.employees)) {
      appData.settings.employees = [...new Set(body.employees.map(String).map((name) => name.trim()).filter(Boolean))];
    }
    if (body.employeePins && typeof body.employeePins === "object") {
      appData.settings.employeePinHashes ||= {};
      for (const [name, pin] of Object.entries(body.employeePins)) {
        if (String(pin).trim()) {
          appData.settings.employeePinHashes[name] = createPinHash(String(pin).trim());
          delete appData.settings.employeePins?.[name];
        }
      }
    }
    if (body.employeeDepartments && typeof body.employeeDepartments === "object") {
      appData.settings.employeeDepartments = body.employeeDepartments;
    }
    if (body.employeeRoles && typeof body.employeeRoles === "object") {
      appData.settings.employeeRoles = body.employeeRoles;
    }
    if (Array.isArray(body.availabilityExemptEmployees)) {
      appData.settings.availabilityExemptEmployees = [...new Set(body.availabilityExemptEmployees.map(String).map((name) => name.trim()).filter(Boolean))];
    }
    if (Array.isArray(body.adminEmployees)) {
      appData.settings.adminEmployees = [...new Set(body.adminEmployees.map(String).map((name) => name.trim()).filter(Boolean))];
    }
    if (Array.isArray(body.positions)) {
      appData.settings.positions = ensureRequiredPositions(body.positions);
    }
    if (typeof body.businessName === "string" && body.businessName.trim()) {
      appData.settings.businessName = body.businessName.trim();
    }
    if (typeof body.adminPin === "string" && body.adminPin.trim()) {
      appData.settings.adminPinHash = createPinHash(body.adminPin.trim());
      delete appData.settings.adminPin;
    }
    if (typeof body.terminalCode === "string" && body.terminalCode.trim()) {
      appData.settings.terminalCodeHash = createPinHash(body.terminalCode.trim());
      delete appData.settings.terminalCode;
    }

    await writeAppData(appData);
    sendJson(res, 200, { ok: true, settings: publicSettings(appData.settings) });
  } catch (error) {
    handleError(res, error);
  }
};

function ensureRequiredPositions(positions) {
  const clean = [...new Set((positions || []).map(String).map((name) => name.trim()).filter(Boolean))];
  if (!clean.some((position) => String(position).trim().toLowerCase().replace(/\s+\d+$/, "") === "mechanik")) {
    clean.push("Mechanik");
  }
  return clean;
}
