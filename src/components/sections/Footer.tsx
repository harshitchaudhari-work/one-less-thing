import { cacheLife } from "next/cache";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-lavender px-4 pt-8 pb-10 md:px-12 md:pb-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 pt-16">
        <a href="#top" aria-label="One Less Thing, back to top" className="group">
          <Logo className="h-20 w-auto text-ink md:h-28" />
        </a>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-ink/75">
          <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-ink hover:underline underline-offset-4">
            instagram
          </a>
          <a href={site.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-ink hover:underline underline-offset-4">
            linkedin
          </a>
          <a href={`mailto:${site.contactEmail}`} className="hover:text-ink hover:underline underline-offset-4">
            {site.contactEmail}
          </a>
          <Link href="/privacy" className="hover:text-ink hover:underline underline-offset-4">
            privacy policy
          </Link>
        </nav>
        <p className="text-center text-sm text-ink/60">
          based in {site.location}.
        </p>
        <p className="text-sm text-ink/60">© <Year /> One Less Thing</p>
      </div>
    </footer>
  );
}

async function Year() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
