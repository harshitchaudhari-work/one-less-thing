import "server-only";

/**
 * Where waitlist emails go: a Google Sheet, via the Apps Script web app in
 * apps-script/Code.gs. To move to Supabase, Resend Audiences or similar later,
 * replace the body of `addSignup` and keep its contract.
 */

export type Signup = {
  email: string;
  source: "hero" | "closing";
  marketingConsent: boolean;
};
export type SignupResult = "created" | "duplicate";

export class SignupsNotConfiguredError extends Error {}

export async function addSignup(signup: Signup): Promise<SignupResult> {
  const url = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.GOOGLE_SCRIPT_SECRET;
  if (!url || !secret) throw new SignupsNotConfiguredError("GOOGLE_SCRIPT_URL / GOOGLE_SCRIPT_SECRET are not set");

  // Apps Script answers a POST with a redirect to the result, which fetch follows.
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...signup, secret }),
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error(
      `Apps Script responded ${res.status} (access denied): set the deployment's "Who has access" to "Anyone" and use that deployment's /exec URL`,
    );
  }
  if (!res.ok) throw new Error(`Apps Script responded ${res.status}`);

  // A Google sign-in page instead of JSON almost always means the deployment
  // isn't set to "Who has access: Anyone".
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    const hint = /<html/i.test(text) ? " (got an HTML page: check the deployment's access is 'Anyone')" : "";
    throw new Error(`Apps Script did not return JSON${hint}`);
  }

  if (data && typeof data === "object" && "status" in data) {
    const { status, error } = data as { status: unknown; error?: unknown };
    if (status === "created" || status === "duplicate") return status;
    if (status === "error") throw new Error(`Apps Script error: ${String(error ?? "unknown")}`);
  }
  throw new Error(`Apps Script returned an unexpected response: ${text.slice(0, 200)}`);
}
