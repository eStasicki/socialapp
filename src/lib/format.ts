export const fullName = (p: { first_name: string; last_name: string }) => `${p.first_name} ${p.last_name}`;

export function timeAgo(iso: string, locale: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (minutes > -1) return rtf.format(0, "second"); // „teraz”
  if (minutes > -60) return rtf.format(minutes, "minute");
  if (minutes > -60 * 24) return rtf.format(Math.round(minutes / 60), "hour");
  return rtf.format(Math.round(minutes / 60 / 24), "day");
}

// Tylko to, co wolno wysłać do komponentów klienckich (bez emaila, urodzin itd.).
export type PublicPerson = { public_id: string; first_name: string; last_name: string; avatar_url: string | null };

// Bez wewnętrznego UUID — do przeglądarki trafia tylko publiczne ID.
export const publicPerson = ({ public_id, first_name, last_name, avatar_url }: PublicPerson): PublicPerson =>
  ({ public_id, first_name, last_name, avatar_url });

export const profileHref = (p: { public_id: string }) => `/profile/${p.public_id}`;
