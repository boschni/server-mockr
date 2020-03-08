import { get, has } from "json-pointer";

import { JSONValue } from "../Values";
import { isEqualTo } from "./isEqualTo";
import { addSubResult, MatchFn, MatchResult } from "./MatchFn";

export const pointer = (ptr: string, matcher: MatchFn | JSONValue) => {
  const fn = typeof matcher === "function" ? matcher : isEqualTo(matcher);

  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const result: MatchResult = {
      message: `json pointer "${ptr}" in ${JSON.stringify(
        input
      )} should match validator ${fn.matchName}`,
      name: "pointer",
      pass: true
    };

    const value =
      typeof input === "object" && input !== null && has(input, ptr)
        ? get(input, ptr)
        : undefined;

    const subResult = fn(value);

    addSubResult(result, subResult);

    return result;
  };

  matchFn.matchName = "pointer";

  return matchFn;
};
