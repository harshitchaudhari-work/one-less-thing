import { clientIp, rateLimit } from "@/lib/rateLimit";
import { addSignup, SignupsNotConfiguredError, type Signup } from "@/lib/signups";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SOURCES: Signup["source"][] = ["hero", "closing"];
const SUCCESS = "you're on the list. one less thing to remember.";

export async function POST(request: Request) {
  // 5 attempts per 10 minutes per visitor is plenty for a person, little for a script.
  const limited = rateLimit(clientIp(request), { limit: 5, windowMs: 10 * 60_000 });
  if (!limited.ok) {
    return Response.json(
      { message: "that's a lot of tries. wait a few minutes and give it another go." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return Response.json({ message: "something went wrong. try again." }, { status: 400 });
  }

  // Honeypot: people never see this field, bots fill it in. Pretend it worked.
  if (typeof body.company === "string" && body.company !== "") {
    return Response.json({ message: SUCCESS }, { status: 201 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) {
    return Response.json({ message: "that email doesn't look quite right. try name@example.com." }, { status: 400 });
  }
  if (!SOURCES.includes(body.source as Signup["source"])) {
    return Response.json({ message: "something went wrong. try again." }, { status: 400 });
  }
  // Consent must be an explicit yes; anything else is a no.
  const marketingConsent = body.marketingConsent === true;

  try {
    const result = await addSignup({ email, source: body.source as Signup["source"], marketingConsent });
    return result === "duplicate"
      ? Response.json({ message: "you're already on the list. we'll be in touch." }, { status: 200 })
      : Response.json({ message: SUCCESS }, { status: 201 });
  } catch (error) {
    if (error instanceof SignupsNotConfiguredError) {
      // Honest: nothing is stored until the sheet is connected.
      return Response.json({ message: "signups aren't open yet. check back very soon." }, { status: 503 });
    }
    console.error("[waitlist]", error);
    return Response.json({ message: "we couldn't add you just now. try again in a minute." }, { status: 502 });
  }
}

// Only POST is supported; answer anything else straight away.
export function GET() {
  return Response.json({ message: "use POST" }, { status: 405, headers: { Allow: "POST" } });
}
