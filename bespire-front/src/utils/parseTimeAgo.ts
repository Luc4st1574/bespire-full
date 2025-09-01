export function parseTimeAgo(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  if (hours < 24)   return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7)     return `${days} day${days === 1 ? "" : "s"} ago`;

  // Si es hace más de una semana, muestra la fecha simple (puedes customizar)
  return date.toLocaleDateString(undefined, { dateStyle: "medium" });
}