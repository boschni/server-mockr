/*
 * TYPES
 */

export interface MatchFn {
  (input: any): MatchResult;
  matchName?: string;
}

export type MatchResult = ExtendedMatchResult | boolean;

export interface ExtendedMatchResult {
  message?: string;
  name?: string;
  options?: any;
  pass: boolean;
  subResults?: MatchResult[];
}

/*
 * HELPERS
 */

export function isMatchResult(input: unknown): input is MatchResult {
  return typeof input === "boolean" || isExtendedMatchResult(input);
}

export function isExtendedMatchResult(
  input: unknown
): input is ExtendedMatchResult {
  return (
    typeof input === "object" &&
    input !== null &&
    typeof (input as ExtendedMatchResult).pass === "boolean"
  );
}

export function isPassed(result: MatchResult): boolean {
  return typeof result === "boolean" ? result : result.pass;
}

export function addSubResult(
  result: MatchResult,
  subResult: MatchResult
): MatchResult {
  if (typeof result === "boolean") {
    return subResult;
  }

  if (result.subResults) {
    result.subResults.push(subResult);
  } else {
    result.subResults = [subResult];
  }

  result.pass = isPassed(subResult);

  return result;
}
