# We2

Private Paar-App fuer Christian und Jenny.

## Wichtig vor GitHub und Vercel

Diese Version ist eine statische Browser-App. Sie speichert Spielstand, Profile und den privaten Medienbereich lokal im jeweiligen Browser. Die App hat noch keinen echten Online-Account, keine serverseitige Anmeldung und keine sichere Cloud-Synchronisation.

Das bedeutet:

- GitHub-Repository immer auf `Private` stellen.
- Keine echten Fotos, Videos, Exporte oder `.env`-Dateien committen.
- Vercel ist fuer Hosting ok, aber der 4-stellige App-Code ist kein echter Online-Schutz.
- Echte intime Medien erst online nutzen, wenn ein Backend mit echter Auth und geschuetztem Storage eingebaut ist.

## Backend

We2 hat jetzt eine erste Backend-Schicht:

- `/api/login` prueft Codes serverseitig.
- `/api/session` prueft die aktuelle Session.
- `/api/state` speichert und laedt den App-State serverseitig.
- `/api/codes` speichert neue Zugangscodes nur fuer den Kontrollbereich.
- Session laeuft ueber ein `HttpOnly` Cookie.

Lokal speichert das Backend nach `private/we2-backend.json`. Diese Datei ist in `.gitignore` ausgeschlossen.

Auf Vercel nutzt das Backend automatisch Upstash/Vercel KV, wenn diese Variablen gesetzt sind:

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
WE2_STORAGE_KEY=we2:state
```

Ohne KV funktioniert Login auf Vercel, aber serverseitig gespeicherte Daten sind nicht dauerhaft verlaesslich. Fuer echte Online-Nutzung also KV oder eine andere Datenbank aktivieren.

Fuer echte Browser-Push-Nachrichten brauchst du zusaetzlich Web-Push/VAPID-Schluessel:

- `WE2_PUSH_SUBJECT`
- `WE2_PUSH_PUBLIC_KEY`
- `WE2_PUSH_PRIVATE_KEY`

Ohne diese Werte laeuft die App weiter, aber Push bleibt auf der diskreten In-App-/Inbox-Schicht.

## Lokal starten

```bash
npm start
```

Standard-Port ist `4185`. Optional:

```bash
WE2_PORT=4184 npm start
```

## Pruefen

```bash
npm run check
```

## Vercel

Die Datei `vercel.json` setzt Sicherheitsheader:

- keine Einbettung in fremde Seiten
- keine fremden Skripte
- keine Kamera/Mikrofon/Ortungsrechte
- keine Referrer
- kein Cache fuer App-Dateien

Fuer echte private Nutzung zusaetzlich aktivieren:

- GitHub repo: `Private`
- Vercel project: nicht oeffentlich teilen
- Vercel Deployment Protection / Passwortschutz, wenn im Plan verfuegbar
- Vercel Environment Variables setzen:
  - `WE2_SESSION_SECRET`
  - `WE2_CODE_CHRISTIAN`
  - `WE2_CODE_JENNY`
  - `WE2_CODE_CONTROL`
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
- keine echten Medien in der statischen App verwenden, bis Backend/Storage fertig ist

## Naechster sicherer Ausbauschritt

Fuer vollstaendige Online-Nutzung braucht We2 als naechstes:

- Cloud-Medienbereich mit verschluesseltem Storage
- bessere Konfliktlogik, falls beide gleichzeitig spielen
- Backup/Export fuer den Backend-State
- serverseitige KI-/Content-Updates ohne private Rohdaten nach aussen zu geben
- Admin/Kontrollbereich nur mit eigener serverseitiger Berechtigung
