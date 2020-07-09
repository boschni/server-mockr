import { ParamsValue, RequestValue } from "../Values";
import { isMatchesPathResult } from "./matchesPath";
import {
  addSubResult,
  ExtendedMatchResult,
  isExtendedMatchResult,
  isPassed,
  MatchFn,
  MatchResult,
} from "./MatchFn";
import { prop } from "./prop";

/*
 * TYPES
 */

export interface MatchRequestMatchResult extends ExtendedMatchResult {
  params: ParamsValue;
}

export interface RequestMatchDef {
  body: MatchFn[];
  cookies: MatchFn[];
  files: MatchFn[];
  headers: MatchFn[];
  method: MatchFn[];
  params: MatchFn[];
  path: MatchFn[];
  query: MatchFn[];
  url: MatchFn[];
}

/*
 * HELPERS
 */

export function isMatchRequestMatchResult(
  result: MatchResult
): result is MatchRequestMatchResult {
  return typeof result === "boolean" ? false : result.name === "matchesRequest";
}

const validationOrder: (keyof RequestMatchDef)[] = [
  "method",
  "path",
  "url",
  "query",
  "params",
  "cookies",
  "headers",
  "body",
  "files",
];

/*
 * VALIDATOR
 */

export const matchesRequest = (def: RequestMatchDef) => {
  const matchFn: MatchFn = (req: RequestValue): MatchResult => {
    const result: MatchRequestMatchResult = {
      message: `matches request`,
      name: "matchesRequest",
      params: {},
      pass: true,
    };

    const reqCopy = { ...req };

    for (const key of validationOrder) {
      for (const matcher of def[key]) {
        const subResult = prop(key, matcher)(reqCopy);

        addSubResult(result, subResult);

        if (isExtendedMatchResult(subResult)) {
          const matchPathResult = subResult.subResults?.find(
            isMatchesPathResult
          );

          if (matchPathResult && isMatchesPathResult(matchPathResult)) {
            result.params = matchPathResult.params;
            reqCopy.params = matchPathResult.params;
          }
        }

        if (!isPassed(result)) {
          return result;
        }
      }
    }

    return result;
  };

  matchFn.matchName = "matchesRequest";

  return matchFn;
};
