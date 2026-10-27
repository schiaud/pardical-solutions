import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProofBand } from "@/components/marketing/ProofBand";
import { Problem } from "@/components/Problem";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { DemoBand } from "@/components/marketing/DemoBand";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pardical — Sell more used parts, faster",
  description:
    "For full-service auto recyclers: a new website and parts store on your own domain, plus listings on eBay, Google Shopping and Facebook. Market-based prices, real shipping costs and 24/7 answers for buyers. Done for you.",
  openGraph: {
    title: "Pardical — Sell more used parts, faster",
    description:
      "We put your yard's parts everywhere buyers shop: your own website and parts store, eBay, Facebook Marketplace and Google Shopping. Done for you.",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProofBand />
        <Problem />
        <Features />
        <HowItWorks />
        <DemoBand />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
