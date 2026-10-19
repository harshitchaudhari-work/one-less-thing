/**
 * One Less Thing: early-access signups → this Google Sheet.
 *
 * Paste into Extensions → Apps Script of the signups spreadsheet, set the
 * SECRET script property, and deploy as a web app (see README, "Email signups").
 * The website's server (/api/waitlist) posts
 *   { email, source, marketingConsent, secret }
 * and gets back { status: "created" | "duplicate" | "error", error? }.
 * The browser never sees this URL or the secret.
 */

const SHEET_NAME = "Signups";
const HEADERS = ["Signed up (IST)", "Email", "Source", "Marketing consent"];
const SOURCES = ["hero", "closing"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ status: "error", error: "bad request" });
  }

  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  if (!secret || data.secret !== secret) return reply({ status: "error", error: "unauthorized" });

  const email = String(data.email || "").trim().toLowerCase();
  // Reject anything a spreadsheet could read as a formula (=, +, -, @ at the start).
  if (!EMAIL.test(email) || email.length > 254 || /^[=+\-@]/.test(email)) {
    return reply({ status: "error", error: "invalid email" });
  }
  const source = SOURCES.indexOf(data.source) >= 0 ? data.source : "unknown";
  const consent = data.marketingConsent === true ? "Yes" : "No";

  // One write at a time, so two quick signups can't both pass the duplicate check.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const last = sheet.getLastRow();
    if (last > 1) {
      const existing = sheet
        .getRange(2, 2, last - 1, 1)
        .createTextFinder(email)
        .matchEntireCell(true)
        .findNext();
      if (existing) return reply({ status: "duplicate" });
    }
    sheet.appendRow([new Date(), email, source, consent]);
    return reply({ status: "created" });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange("A:A").setNumberFormat("dd mmm yyyy, hh:mm");
  } else if (sheet.getLastColumn() < HEADERS.length) {
    // Sheets made by the earlier version of this script lack the newer columns.
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
