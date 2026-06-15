const { employeeByPin, handleError, readAppData, readJson, sendJson, signToken } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    const appData = await readAppData();
    const employee = employeeByPin(appData.settings, body.pin);
    if (!employee) return sendJson(res, 401, { error: "Falscher Mitarbeiter-PIN." });
    sendJson(res, 200, { employee, token: signToken({ type: "employee", employee }) });
  } catch (error) {
    handleError(res, error);
  }
};
