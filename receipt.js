const { downloadReceipt, handleError, sendJson } = require("./_data");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") return sendJson(res, 405, { error: "Methode nicht erlaubt." });
    const url = new URL(req.url || "/api/receipt", "http://localhost");
    const objectPath = String(url.searchParams.get("path") || "").trim();
    const filename = String(url.searchParams.get("name") || "beleg").replace(/[\\/:*?"<>|]+/g, "-");
    if (!objectPath || objectPath.includes("..")) return sendJson(res, 400, { error: "Beleg fehlt." });
    const file = await downloadReceipt(objectPath);
    res.statusCode = 200;
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename || "beleg"}"`);
    res.setHeader("Cache-Control", "private, max-age=300");
    res.end(file.buffer);
  } catch (error) {
    handleError(res, error);
  }
};
