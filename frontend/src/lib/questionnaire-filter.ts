// frontend/src/lib/questionnaire-filter.ts
/**
 * Converts questionnaire answers into ListingsQuery filter params.
 *
 * Q1 (intent)     — no filter for now
 * Q2 (lifestyle)  — maps to `lifestyle` param (backend resolves to regions)
 * Q3 (who)        — maps to `min_bedrooms`
 * Q4 (timeline)   — no filter for now
 *
 * Answers are keyed 1–4 (string keys), matching the backend format:
 * { "1": "Relocation", "2": "Ocean", "3": "With Children", "4": "Now" }
 */

import type { ListingsQuery } from "./public-api";

// Q2 answer → lifestyle_tag value stored in the regions table
const LIFESTYLE_TAG: Record<string, string> = {
  "Ocean":       "ocean",
  "City":        "city",
  "Countryside": "countryside",
  "Wine Region": "wine_region",
};

// Q3 answer → minimum bedrooms
const MIN_BEDROOMS: Record<string, number> = {
  "Just Me":              1,
  "With Partner":         2,
  "With Children":        3,
  "With Extended Family": 4,
};

export type QuestionnaireAnswers = Record<string, string>;

/**
 * Derive a partial ListingsQuery from questionnaire answers.
 * Always adds status=available and a default limit.
 */
export function answersToQuery(answers: QuestionnaireAnswers): Partial<ListingsQuery> {
  const query: Partial<ListingsQuery> = {
    limit: 6,
  };

  // Q2 → lifestyle (backend resolves to matching regions)
  const lifestyle = LIFESTYLE_TAG[answers["2"]];
  if (lifestyle) query.lifestyle = lifestyle;

  // Q3 → min bedrooms
  const minBedrooms = MIN_BEDROOMS[answers["3"]];
  if (minBedrooms) query.min_bedrooms = minBedrooms;

  return query;
}

/**
 * Build a human-readable subtitle for the listings section heading.
 * e.g. "Ocean · 3+ Bedrooms" or "Curated for you"
 */
export function answersToLabel(answers: QuestionnaireAnswers): string {
  const parts: string[] = [];

  if (answers["2"] && answers["2"] !== "Just Exploring") {
    parts.push(answers["2"]);
  }
  if (answers["3"]) {
    const bed = MIN_BEDROOMS[answers["3"]];
    if (bed) parts.push(`${bed}+ Bedrooms`);
  }

  return parts.length > 0 ? parts.join(" · ") : "Curated for you";
}
