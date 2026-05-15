const { handleError, readAppData, readJson, sendJson, signToken, verifyAdmin } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const body = await readJson(req);
    const appData = await readAppData();
    if (!verifyAdmin(appData.settings, body.pin)) return sendJson(res, 401, { error: "Falsche Admin-PIN." });
    sendJson(res, 200, { token: signToken({ type: "admin" }) });
  } catch (error) {
    handleError(res, error);
  }
};

