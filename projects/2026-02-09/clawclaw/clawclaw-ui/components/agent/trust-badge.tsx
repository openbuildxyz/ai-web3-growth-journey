"use client";

/**
 * TrustBadge displays a color-coded trust score indicator
 * Green for high trust (70+), Yellow for medium (40-69), Red for low (<40)
 */
export function TrustBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        No Score
      </span>
    );
  }

  const isHigh = score >= 70;
  const isMedium = score >= 40 && score < 70;

  const colorClass = isHigh
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : isMedium
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      {score.toFixed(1)}
    </span>
  );
}
