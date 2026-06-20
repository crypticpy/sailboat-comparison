// "On the market" — deep links into brokerage searches for a given make/model.
// Brokerage sites sit behind Cloudflare bot-protection, so we can't verify their
// internal search URLs from automation — but a human clicking from their browser
// reaches the live, filtered results. YachtWorld is the dominant aggregator for
// cruising sailboats; Apollo Duck adds international/expedition inventory that
// Boats Group sites miss; the Google catch-all surfaces everything else (European
// brokers, broker pages, boats.com) and is robust to any one site's redesign.
import type { Boat } from "../types/boat";

export interface MarketLink {
  label: string;
  host: string;
  url: string;
}

/** A clean "Make Model" search term: accent-stripped, trailing descriptors removed. */
export function marketQuery(b: Pick<Boat, "name">): string {
  const name = b.name.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return name
    .replace(/\s*\([^)]*\)/g, " ") // drop parentheticals like "(H48)"
    .replace(/\s*\b(deck salo?on|centre cockpit|center cockpit)\b\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function marketLinks(b: Pick<Boat, "name">): MarketLink[] {
  const q = marketQuery(b);
  const e = encodeURIComponent(q);
  return [
    {
      label: "YachtWorld",
      host: "yachtworld.com",
      url: `https://www.yachtworld.com/boats-for-sale/?keyword=${e}`,
    },
    {
      label: "Apollo Duck",
      host: "apolloduck.com",
      url: `https://www.apolloduck.com/boats-for-sale?q=${e}`,
    },
    {
      label: "All listings",
      host: "google",
      url: `https://www.google.com/search?q=${encodeURIComponent(q + " sailboat for sale")}`,
    },
  ];
}
