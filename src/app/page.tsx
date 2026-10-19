import { FloatingCta } from "@/components/early-access/FloatingCta";
import { ScrollAssist } from "@/components/ScrollAssist";
import { Hero } from "@/components/hero/Hero";
import { EarlyAccess } from "@/components/sections/EarlyAccess";
import { FlowBand } from "@/components/sections/FlowBand";
import { Footer } from "@/components/sections/Footer";
import { Idea } from "@/components/sections/Idea";
import { Problem } from "@/components/sections/Problem";

export default function Home() {
  return (
    <>
      <main id="top">
        <Hero />
        <Problem />
        <FlowBand />
        <Idea />
        <EarlyAccess />
      </main>
      <Footer />
      <FloatingCta />
      <ScrollAssist />
    </>
  );
}
