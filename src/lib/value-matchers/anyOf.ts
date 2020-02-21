import { JSONValue } from "../Values";
import { isEqualTo } from "./isEqualTo";
import { addSubResult, isPassed, MatchFn, MatchResult } from "./MatchFn";

export const anyOf = (...matchers: Array<MatchFn | JSONValue>) => {
  const fns = matchers.map(x => (typeof x === "function" ? x : isEqualTo(x)));

  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const names = fns.map(x => x.matchName).join(", ");

    const result: MatchResult = {
      message: `${JSON.stringify(
        input
      )} should match any of these validators: ${names}`,
      name: "anyOf",
      pass: true
    };

    for (const fn of fns) {
      const subResult = fn(input);
      addSubResult(result, subResult);
      if (isPassed(subResult)) {
        return subResult;
      }
    }

    return result;
  };

  matchFn.matchName = "anyOf";

  return matchFn;
};
