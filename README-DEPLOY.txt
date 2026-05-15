CLEAN DEPLOY PAKET (Vercel + GitHub)

Inhalt:
- api/*.js (12 Serverless Functions)
- server/data.js
- index.html, todo.html, teamapp-client.js, styles.css, terminal-roles-addon.js, la-bowling-logo.png
- package.json, vercel.json

Wichtig:
1) Im GitHub Repo zuerst alte Dateien entfernen.
2) Danach den gesamten INHALT dieses Ordners hochladen (nicht den Ordner selbst als ZIP-Datei).
3) In Vercel Redeploy mit deaktiviertem Build Cache.
4) Check: /api/state?month=2026-05&nextMonth=2026-06 muss JSON liefern (kein 500).
