import { JSONValue } from "../Values";
import { isEqualTo } from "./isEqualTo";
import { isPassed, MatchFn, MatchResult } from "./MatchFn";

export const not = (matcher: MatchFn | JSONValue): MatchFn => {
  const fn = typeof matcher === "function" ? matcher : isEqualTo(matcher);

  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const matchResult = fn(input);
    const pass = !isPassed(matchResult);
    return {
      message: `${JSON.stringify(input)} should not match validator ${fn.name}`,
      name: "not",
      pass,
    };
  };

  matchFn.matchName = "not";

  return matchFn;
};
