import { RoastResult } from '../types';

/**
 * Serializes a roast result to a JSON string suitable for machine consumption.
 * Dates are converted to ISO strings so the output is round-trippable.
 */
export function renderToJSON(result: RoastResult): string {
  return JSON.stringify(result, null, 2);
}
