/*
 * TYPES
 */

export type MatchFn = (input: any) => MatchResult;

export type MatchResult = ExtendedMatchResult | boolean;

export interface ExtendedMatchResult {
  message?: string;
  name?: string;
  options?: any;
  pass: boolean;
}

/*
 * HELPERS
 */

export function isPassed(result: MatchResult): boolean {
  return typeof result === "boolean" ? result : result.pass;
}
