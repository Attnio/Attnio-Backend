/**
 * Attnio Waitlist — Google Apps Script
 *
 * Sheet headers (any order — script maps by header name):
 * Timestamp | Name | Email | Company | Role | Country Code | Mobile / Moblie
 *
 * IMPORTANT: After updating this file, Deploy → Manage deployments →
 * Edit (pencil) → New version → Deploy. A new /exec URL is NOT required
 * if you update an existing deployment.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = parseBody_(e);

    // Honeypot — bots fill "website"; respond OK without writing or emailing
    if (data.website) {
      return json_({ status: 'ok' });
    }

    const countryCode = String(
      data.countryCode || data.country_code || data.dial || ''
    ).trim();
    const phone = String(
      data.phone || data.mobile || data.mobileNumber || data.phone_number || ''
    ).replace(/\D/g, '');

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(function (header) {
      const h = String(header || '')
        .toLowerCase()
        .trim();

      if (h === 'timestamp') return new Date();
      if (h === 'name') return data.name || '';
      if (h === 'email') return data.email || '';
      if (h === 'company') return data.company || '';
      if (h === 'role') return data.role || '';
      if (h.indexOf('country') !== -1) return countryCode;
      // Matches "Mobile", "Moblie" (typo), "Mobile Number", "Phone"
      if (
        h.indexOf('mobl') !== -1 ||
        h.indexOf('mobil') !== -1 ||
        h.indexOf('phone') !== -1
      ) {
        return phone;
      }
      return '';
    });

    sheet.appendRow(row);
    sendRegistrationNotification({
      name: data.name,
      email: data.email,
      company: data.company,
      countryCode: countryCode,
      phone: phone,
    });

    return json_({ status: 'success' });
  } catch (err) {
    return json_({ status: 'error', message: String(err) });
  }
}

function parseBody_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // fall through
    }
  }
  // Fallback for form-encoded posts
  const params = (e && e.parameter) || {};
  return params;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function sendRegistrationNotification(data) {
  const NOTIFY_EMAIL = 'you@yourcompany.com'; // ← replace with your inbox

  const phoneDisplay =
    (data.countryCode || '') + (data.phone ? ' ' + data.phone : '');

  const subject = 'New Attnio waitlist signup: ' + (data.company || data.name);
  const body =
    'A new customer just registered on the Attnio website.\n\n' +
    'Name: ' + (data.name || '-') + '\n' +
    'Email: ' + (data.email || '-') + '\n' +
    'Company: ' + (data.company || '-') + '\n' +
    'Phone: ' + (phoneDisplay.trim() || '-') + '\n' +
    'Submitted: ' + new Date().toLocaleString();

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function doGet(e) {
  const ADMIN_KEY = 'REPLACE_WITH_YOUR_OWN_SECRET'; // ← set a strong secret
  if (!e || e.parameter.key !== ADMIN_KEY) {
    return ContentService.createTextOutput('Not authorized');
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const rows = sheet.getDataRange().getValues();
  let html =
    '<table border="1" cellpadding="8" style="border-collapse:collapse;font-family:sans-serif">';
  rows.forEach(function (row) {
    html +=
      '<tr>' +
      row
        .map(function (cell) {
          return '<td>' + cell + '</td>';
        })
        .join('') +
      '</tr>';
  });
  html += '</table>';
  return HtmlService.createHtmlOutput(html);
}
