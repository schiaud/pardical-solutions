import { ogCard, ogSize } from "@/lib/og";

export const alt = "Pardical — sell more used parts, faster";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard(
    "For full-service auto recyclers",
    "Sell more parts,",
    "faster.",
    "Your own website and parts store, plus eBay, Facebook and Google — priced from the market.",
  );
}
