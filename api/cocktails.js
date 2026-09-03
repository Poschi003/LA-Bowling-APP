const fs = require("fs");
const path = require("path");

module.exports = function handler(req, res) {
  const file = path.join(process.cwd(), "index.html");
  if (!fs.existsSync(file)) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.end(JSON.stringify({ error: "Cocktail-Bar nicht gefunden." }));
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  return res.end(fs.readFileSync(file));
};
