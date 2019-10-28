import { isPassed, MatchFn, MatchResult } from "../MatchOperator";

export const allOf = (...fns: MatchFn[]) => (input: unknown): MatchResult => {
  for (const fn of fns) {
    const result = fn(input);
    if (!isPassed(result)) {
      return result;
    }
  }
  return {
    name: "allOf",
    pass: true
  };
};
