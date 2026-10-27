import { ogCard, ogSize } from "@/lib/og";

export const alt = "Pardical for auto parts brokers — your eBay order desk, on autopilot";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard(
    "For auto parts brokers on eBay",
    "Your eBay order desk,",
    "on autopilot.",
    "Orders, shipments, buyer messages and repricing — handled, with you in control.",
  );
}
