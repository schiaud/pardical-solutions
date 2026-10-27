import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BrokerHero, BrokerProofBand } from "@/components/brokers/BrokerHero";
import { BrokerProblems } from "@/components/brokers/BrokerProblems";
import { BrokerFeatures } from "@/components/brokers/BrokerFeatures";
import { BrokerHowItWorks } from "@/components/brokers/BrokerHowItWorks";
import { BrokerPricing } from "@/components/brokers/BrokerPricing";
import { BrokerCTA, RecyclerCrossLink } from "@/components/brokers/BrokerCTA";

const title = "Pardical for auto parts brokers — your eBay order desk, on autopilot";
const description =
  "For auto parts brokers on eBay: every order tracked from sale to delivery, yards and retailers handled, tracking on eBay before the ship-by date, buyer messages answered and prices checked against your real costs. It proposes, you approve.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "eBay auto parts broker",
    "eBay order management for auto parts",
    "drop ship used auto parts",
    "eBay repricing auto parts",
    "eBay buyer messages automation",
  ],
  openGraph: {
    title,
    description:
      "Your eBay order desk, on autopilot: sourcing, labels, tracking, buyer messages and repricing for auto parts brokers. Built and run on our own eBay parts business.",
    type: "website",
  },
};

export default function BrokersPage() {
  return (
    <>
      <Navbar audience="brokers" />
      <main>
        <BrokerHero />
        <BrokerProofBand />
        <BrokerProblems />
        <BrokerFeatures />
        <BrokerHowItWorks />
        <BrokerPricing />
        <BrokerCTA />
        <RecyclerCrossLink />
      </main>
      <Footer audience="brokers" />
    </>
  );
}
