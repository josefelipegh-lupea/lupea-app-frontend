const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

export function formatRelativeTime(date: string | Date): string {
  const diffSec = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  return rtf.format(Math.round(diffSec / 2592000), "month");
}
