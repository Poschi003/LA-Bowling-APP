const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleApiRequest } = require("./server/we2-backend");

const root = __dirname;
const port = Number(process.env.WE2_PORT || 4185);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const securityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; "),
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY"
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    handleApiRequest(req, res);
    return;
  }

  let target = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  if (!target) target = "index.html";

  const file = path.resolve(root, target);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(file, (statError, stat) => {
    const finalFile = !statError && stat.isDirectory() ? path.join(file, "index.html") : file;
    fs.readFile(finalFile, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        ...securityHeaders,
        "Content-Type": types[path.extname(finalFile).toLowerCase()] || "application/octet-stream",
      });
      res.end(data);
    });
  });
});

server.listen(port, "0.0.0.0");
