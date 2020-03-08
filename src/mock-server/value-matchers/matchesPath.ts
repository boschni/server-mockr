import { Key, pathToRegexp } from "path-to-regexp";

import { ParamsValue } from "../Values";
import { ExtendedMatchResult, MatchFn, MatchResult } from "./MatchFn";

/*
 * TYPES
 */

export type MatchesPathInput = string | string[] | RegExp;

export interface MatchesPathResult extends ExtendedMatchResult {
  params: ParamsValue;
}

/*
 * HELPERS
 */

export function isMatchesPathResult(
  result: MatchResult
): result is MatchesPathResult {
  return typeof result === "boolean" ? false : result.name === "matchesPath";
}

/*
 * VALIDATOR
 */

export const matchesPath = (value: MatchesPathInput) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const result: MatchesPathResult = {
      message: `path "${input}" should match "${value}"`,
      name: "matchesPath",
      params: {},
      pass: true
    };

    if (value === "*") {
      return result;
    }

    if (typeof input !== "string") {
      result.pass = false;
      return result;
    }

    try {
      const keys: Key[] = [];
      const regexp = pathToRegexp(value, keys);
      const match = regexp.exec(input);

      if (!match) {
        result.pass = false;
        return result;
      }

      for (let i = 1; i < match.length; i++) {
        const key = keys[i - 1];
        const prop = key.name;
        const val = decodeURIComponent(match[i]);
        result.params[prop] = val;
      }
    } catch (e) {
      result.pass = false;
    }

    return result;
  };

  matchFn.matchName = "matchesPath";

  return matchFn;
};
