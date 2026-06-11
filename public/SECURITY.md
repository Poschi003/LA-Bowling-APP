# Security

## Aktueller Schutz

We2 laeuft aktuell als statische App im Browser.

Vorhanden:

- serverseitige Anmeldung per Code, wenn die App ueber den Node-/Vercel-Backendpfad laeuft
- HttpOnly-Session-Cookie
- serverseitige Speicherung von App-State ueber lokale Datei oder KV
- verschluesselter privater Medienbereich im Browser per Web Crypto / IndexedDB
- Sicherheitsheader fuer lokalen Server und Vercel
- `.gitignore` gegen versehentliche Commits von Medien, Exports und Secrets

Nicht vorhanden:

- Cloud-Speicher fuer Fotos/Videos
- Ende-zu-Ende-Verschluesselung fuer Cloud-Medien
- robuste Konfliktloesung, wenn beide gleichzeitig online speichern
- Schutz, wenn jemand die statische Website-Dateien direkt kopiert

## Keine echten privaten Medien online speichern

Bis ein Cloud-Medienbereich mit geschuetztem Storage existiert, sollten echte intime Bilder oder Videos nicht in einer online gehosteten Version genutzt werden.

## Secrets

Nie in Git committen:

- API Keys
- Vercel Tokens
- OpenAI Keys
- Passwoerter
- Medien-Dateien
- lokale Exporte

Server-Secrets gehoeren spaeter nur in Vercel Environment Variables oder in einen vergleichbaren Secret Store.

Aktuell benoetigt der Backend-Betrieb:

- `WE2_SESSION_SECRET`
- `WE2_CODE_CHRISTIAN`
- `WE2_CODE_JENNY`
- `WE2_CODE_CONTROL`

Fuer dauerhafte Vercel-Speicherung:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- optional `WE2_STORAGE_KEY`

## Empfohlener naechster Schritt

Backend bauen:

- Cloud-Medien-Storage
- serverseitige Rollen weiter verfeinern: Christian, Jenny, Kontrolle
- Datenbank mit Row-Level-Security oder vergleichbarem Zugriffsschutz
- KI-Content-Updates nur mit anonymisierten Vorlieben, nicht mit echten Fotos/Videos
