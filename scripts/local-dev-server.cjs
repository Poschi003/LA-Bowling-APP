const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 3000);

loadEnv(path.join(root, ".env.local"));

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }
    serveStatic(res, url.pathname);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: error.message || "Lokaler Serverfehler" }));
  }
});

server.listen(port, () => {
  console.log(`Dienstplan lokal bereit: http://localhost:${port}/`);
  console.log(`Terminal: http://localhost:${port}/?terminal=1`);
  console.log("Zum Beenden dieses Fenster schliessen oder STRG+C druecken.");
});

function handleApi(req, res, url) {
  const name = path.basename(url.pathname);
  const file = path.join(root, "api", `${name}.js`);
  if (!fs.existsSync(file)) {
    sendJson(res, 404, { error: `API nicht gefunden: ${url.pathname}` });
    return;
  }
  clearApiRequireCache();
  req.query = Object.fromEntries(url.searchParams.entries());
  patchResponse(res);
  return require(file)(req, res);
}

function clearApiRequireCache() {
  const apiRoot = path.join(root, "api");
  const serverRoot = path.join(root, "server");
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(apiRoot) || key.startsWith(serverRoot)) {
      delete require.cache[key];
    }
  }
}

function patchResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (value) => {
    if (!res.headersSent) res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(value));
  };
  res.send = (value) => {
    if (typeof value === "object") return res.json(value);
    res.end(String(value || ""));
  };
}

function serveStatic(res, pathname) {
  const safePath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname).replace(/^\/+/, "");
  const file = path.resolve(root, safePath);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const index = path.join(root, "index.html");
    res.writeHead(200, { "Content-Type": mime[".html"] });
    res.end(fs.readFileSync(index));
    return;
  }
  res.writeHead(200, { "Content-Type": mime[path.extname(file).toLowerCase()] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

function sendJson(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (key && process.env[key] == null) process.env[key] = value;
  }
}
