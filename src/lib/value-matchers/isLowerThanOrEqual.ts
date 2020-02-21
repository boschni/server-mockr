import { MatchFn, MatchResult } from "./MatchFn";

export const isLowerThanOrEqual = (number: number) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const pass = Number(input) <= number;
    return {
      message: `${input} should be lower than or equal to ${number}`,
      name: "isLowerThanOrEqual",
      pass
    };
  };

  matchFn.matchName = "isLowerThanOrEqual";

  return matchFn;
};
