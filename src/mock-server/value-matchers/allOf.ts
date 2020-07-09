import { JSONValue } from "../Values";
import { isEqualTo } from "./isEqualTo";
import { addSubResult, isPassed, MatchFn, MatchResult } from "./MatchFn";

export const allOf = (...matchers: (MatchFn | JSONValue)[]) => {
  const fns = matchers.map((x) => (typeof x === "function" ? x : isEqualTo(x)));

  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const names = fns.map((x) => x.matchName).join(", ");

    const result: MatchResult = {
      message: `${JSON.stringify(
        input
      )} should match all of these validators: ${names}`,
      name: "allOf",
      pass: true,
    };

    for (const fn of fns) {
      const subResult = fn(input);
      addSubResult(result, subResult);
      if (!isPassed(subResult)) {
        return result;
      }
    }

    return result;
  };

  matchFn.matchName = "allOf";

  return matchFn;
};
