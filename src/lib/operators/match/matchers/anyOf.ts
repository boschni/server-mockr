import { isPassed, MatchFn, MatchResult } from "../MatchOperator";

export const anyOf = (...fns: MatchFn[]) => (input: unknown): MatchResult => {
  for (const fn of fns) {
    const result = fn(input);
    if (isPassed(result)) {
      return result;
    }
  }
  return {
    name: "anyOf",
    pass: false
  };
};
