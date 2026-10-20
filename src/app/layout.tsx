import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

// Muller Next trial files — swap for the licensed files (same weights) before launch.
const muller = localFont({
  src: [
    { path: "./fonts/MullerNextTrial-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/MullerNextTrial-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "./fonts/MullerNextTrial-Heavy.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-muller",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Absolute base for share images and canonical links. On Vercel (production and
// previews) this is the public address, so shared links always show the real site.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL ? site.url : "http://localhost:3000");

const shareTitle = "one less thing to worry about.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "One Less Thing | daily gut care, made simple",
  description:
    "One Less Thing is a daily fibre supplement that mixes into water: gut care that fits into your routine. Launching soon, starting with India. Join the waitlist for early access.",
  applicationName: site.name,
  keywords: ["gut health", "fibre supplement", "daily fibre", "digestion", "gut care", "India", "One Less Thing"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    locale: "en_IN",
    title: shareTitle,
    description: `${site.tagline} ${site.description}`,
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: `${site.tagline} ${site.description}`,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#D9C8F0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${muller.variable} ${dmSans.variable} antialiased`}>
      <head>
        {/* Always open on the hero: stop the browser restoring the old scroll position
            on refresh (runs before paint, so there's no jump). Links to a section,
            like /#early-access, still land on that section. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration="manual";if(!location.hash||location.hash==="#top")scrollTo(0,0);`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
