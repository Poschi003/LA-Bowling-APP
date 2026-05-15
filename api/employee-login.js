const { employeeByPin, employeeIsAdmin, handleError, readAppData, readJson, sendJson, signToken, verifyAdmin } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    const appData = await readAppData();
    const employee = employeeByPin(appData.settings, body.pin);
    if (employee) {
      const isAdmin = employeeIsAdmin(appData.settings, employee);
      return sendJson(res, 200, {
        employee,
        token: signToken({ type: "employee", employee }),
        isAdmin,
        adminToken: isAdmin ? signToken({ type: "admin", employee }) : ""
      });
    }
    if (verifyAdmin(appData.settings, body.pin)) {
      return sendJson(res, 200, {
        employee: "",
        token: "",
        isAdmin: true,
        adminToken: signToken({ type: "admin" })
      });
    }
    sendJson(res, 401, { error: "Falscher PIN." });
  } catch (error) {
    handleError(res, error);
  }
};

