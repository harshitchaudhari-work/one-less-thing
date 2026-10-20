import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy | One Less Thing",
  description: "How One Less Thing handles your email address.",
  robots: { index: false },
};

// Placeholder. Replace with a reviewed policy before collecting real signups.
export default function PrivacyPage() {
  return (
    <main className="min-h-svh bg-off-white px-4 py-8 md:px-12">
      <Link href="/" aria-label="One Less Thing, home">
        <Logo className="h-9 w-auto md:h-11" />
      </Link>
      <article className="mx-auto mt-16 flex max-w-2xl flex-col gap-6 text-lg leading-7 text-ink/80">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">privacy policy</h1>
        <p>
          This is a placeholder while we finalise our policy. In short: if you sign up for early access, we store your
          email address (in a Google Sheet only our team can access) to tell you when One Less Thing launches. We
          don&apos;t sell your email or share it for anyone else&apos;s marketing, and you can unsubscribe from any
          email.
        </p>
        <p>
          Questions or want your email removed? Write to{" "}
          <a className="underline underline-offset-4" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>
          .
        </p>
      </article>
    </main>
  );
}
