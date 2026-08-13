# Attnio Backend

Backend pieces for the Attnio waitlist flow.

## Contents

| Path | Purpose |
|------|---------|
| `api/waitlist/route.ts` | Next.js API route — validates waitlist submissions and forwards to Google Apps Script |
| `lib/countries.ts` | Country dial codes + email/phone helpers used by the waitlist API |
| `scripts/attnio-waitlist-apps-script.gs` | Google Apps Script that writes signups to a Google Sheet and emails a notification |

## Flow

```
Client form → POST /api/waitlist → Google Apps Script Web App → Google Sheet
```

## Google Apps Script setup

1. Create a Google Sheet with headers: `Timestamp | Name | Email | Company | Role | Country Code | Mobile`
2. Extensions → Apps Script → paste `scripts/attnio-waitlist-apps-script.gs`
3. Update `NOTIFY_EMAIL` and `ADMIN_KEY` in the script
4. Deploy → Web app → Anyone
5. Use the `/exec` URL in your app configuration

## Notes

These files currently power the Attnio landing waitlist. A fuller product backend (auth, campaigns, CRM) can be added here later.
