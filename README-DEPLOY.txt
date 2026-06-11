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

Zusatz fuer Rechnungskunden-Mailversand:
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE (optional, true/false)
- SMTP_USER
- SMTP_PASS
- EMAIL_FROM (optional, sonst SMTP_USER)
- INVOICE_NOTIFICATION_TO (optional, Standard: pvo65@outlook.de)

Wenn diese Mail-Variablen nicht gesetzt sind, wird der Rechnungskunde trotzdem gespeichert. Der Mailversand faellt dann nur im Backend-Log auf.
