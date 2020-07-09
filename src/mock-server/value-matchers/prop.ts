import { JSONValue } from "../Values";
import { isEqualTo } from "./isEqualTo";
import { addSubResult, MatchFn, MatchResult } from "./MatchFn";

export const prop = (name: string, matcher: MatchFn | JSONValue) => {
  const fn = typeof matcher === "function" ? matcher : isEqualTo(matcher);

  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const result: MatchResult = {
      message: `property "${name}" in ${JSON.stringify(
        input
      )} should match validator ${fn.matchName}`,
      name: "prop",
      pass: true,
    };

    const value =
      Array.isArray(input) || (typeof input === "object" && input !== null)
        ? (input as any)[name]
        : undefined;

    const subResult = fn(value);

    addSubResult(result, subResult);

    return result;
  };

  matchFn.matchName = "prop";

  return matchFn;
};
