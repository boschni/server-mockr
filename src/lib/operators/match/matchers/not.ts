import { isPassed, MatchFn, MatchResult } from "../MatchOperator";

export const not = (fn: MatchFn): MatchFn => (input: unknown): MatchResult => {
  const matchResult = fn(input);
  const pass = !isPassed(matchResult);
  return {
    message: `not`,
    name: "not",
    pass
  };
};
