import type { Boat, BudgetTier } from "../types/boat";

export const budgeClass = (b: BudgetTier) =>
  b === "fit" ? "b-fit" : b === "tight" ? "b-tight" : "b-over";
export const budgeLabel = (b: BudgetTier) =>
  b === "fit" ? "Fits budget" : b === "tight" ? "Tight" : "Over budget";

/** True when the cockpit offers hard shelter (pilothouse / deck saloon / etc.). */
export function isShelter(b: Boat): boolean {
  return /pilothouse|doghouse|deck saloon|deck-saloon|windscreen|enclosed|watch station/i.test(
    b.cockpit + " " + b.cockpitType,
  );
}

/** Strip the parenthetical from a spec string, e.g. `51'7" (15.72 m)` → `51'7"`. */
export const headline = (s: string) => s.split(" (")[0];
