import { JSONValue } from "../Values";
import { isEqualTo } from "./isEqualTo";
import { isPassed, MatchFn, MatchResult } from "./MatchFn";

export const oneOf = (...matchers: (MatchFn | JSONValue)[]) => {
  const fns = matchers.map((x) => (typeof x === "function" ? x : isEqualTo(x)));

  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const names = fns.map((x) => x.matchName).join(", ");

    const result: MatchResult = {
      message: `${JSON.stringify(
        input
      )} should match exactly one of these validators: ${names}`,
      name: "oneOf",
      pass: false,
    };

    for (const fn of fns) {
      const subResult = fn(input);
      if (isPassed(subResult)) {
        if (result.pass) {
          result.pass = false;
          break;
        }
        result.pass = true;
      }
    }

    return result;
  };

  matchFn.matchName = "oneOf";

  return matchFn;
};
