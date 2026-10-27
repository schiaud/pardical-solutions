import { Icon } from "./Icon";

export function ProofBand() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <p className="mx-auto flex max-w-6xl items-start justify-center gap-3 px-4 py-6 text-center text-sm text-slate-600 sm:items-center sm:px-6 sm:text-base">
        <Icon
          name="badgeCheck"
          className="mt-0.5 h-5 w-5 shrink-0 text-primary-light sm:mt-0"
        />
        <span>
          Built by a team that sells used OEM parts online every day —{" "}
          <strong className="font-semibold text-primary-dark">
            11,000+ parts sold on eBay.
          </strong>
        </span>
      </p>
    </div>
  );
}
