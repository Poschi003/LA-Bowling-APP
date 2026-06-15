# Dienstplan lokal testen

## Starten

1. Doppelklick auf `lokal-starten.cmd`.
2. Wenn Windows nachfragt, Ausfuehren erlauben.
3. Im Browser oeffnen:
   - App: `http://localhost:3000/`
   - Terminal: `http://localhost:3000/?terminal=1`
   - Kundenansicht: `http://localhost:3000/?kunde=1`

## Beim ersten Start

Wenn `.env.local` noch fehlt, wird aus `.env.local.example` eine Vorlage kopiert.
Dann muessen dort die Supabase-Werte eingetragen werden.

Wichtig: Fuer lokales Testen ist `STATE_KEY=dienstplan-local` voreingestellt. Dadurch testest du getrennt von der echten Online-App.

## Update-ZIP bauen

Wenn alles lokal passt:

```powershell
npm run zip
```

Die ZIP landet im Ordner ueber dem Projekt und kann danach bei Vercel hochgeladen werden.
