import { isPassed, MatchFn, MatchResult } from "../MatchOperator";

export const oneOf = (...fns: MatchFn[]) => (input: unknown): MatchResult => {
  let pass = false;

  for (const fn of fns) {
    const result = fn(input);
    if (isPassed(result)) {
      if (pass) {
        pass = false;
        break;
      }
      pass = true;
    }
  }

  return {
    name: "oneOf",
    pass
  };
};
