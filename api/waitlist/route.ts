import { NextRequest } from 'next/server';
import { digitsOnly, isValidEmail } from '../../lib/countries';

export const runtime = 'nodejs';

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

export async function POST(request: NextRequest) {
  if (!APPS_SCRIPT_URL) {
    return Response.json(
      { error: 'Waitlist is not configured.' },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Honeypot — pretend success so bots get no signal
  if (String(body.website ?? '').trim()) {
    return Response.json({ ok: true });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const company = String(body.company ?? '').trim();
  const countryCode = String(
    body.countryCode ?? body.country_code ?? ''
  ).trim();
  const phone = digitsOnly(
    String(body.phone ?? body.mobile ?? body.mobileNumber ?? body.phone_number ?? '')
  );

  if (!name) {
    return Response.json({ error: 'Full name is required.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return Response.json({ error: 'Enter a valid work email.' }, { status: 400 });
  }
  if (!countryCode.startsWith('+')) {
    return Response.json({ error: 'Select a country code.' }, { status: 400 });
  }
  if (phone.length < 7 || phone.length > 15) {
    return Response.json({ error: 'Enter a valid mobile number.' }, { status: 400 });
  }
  if (!company) {
    return Response.json({ error: 'Company name is required.' }, { status: 400 });
  }

  const payload = {
    name,
    email,
    company,
    countryCode,
    country_code: countryCode,
    phone,
    mobile: phone,
    mobileNumber: phone,
    phone_number: phone,
  };

  try {
    // Server-side POST avoids browser CORS; Apps Script may 302 — follow redirects
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    // Apps Script often returns 200 even after redirect; treat network completion as ok
    // unless we get a clear client/server error without redirect success.
    if (!res.ok && res.status >= 400 && res.status !== 302) {
      console.error('Apps Script error', res.status, await res.text().catch(() => ''));
      return Response.json(
        { error: 'Something went wrong — please try again.' },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, message: "You're on the list!" });
  } catch (err) {
    console.error('Waitlist forward failed', err);
    return Response.json(
      { error: 'Something went wrong — please try again.' },
      { status: 502 }
    );
  }
}
