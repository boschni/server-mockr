import { MatchFn, MatchResult } from "./MatchFn";

export const isGreaterThanOrEqual = (number: number) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const pass = Number(input) >= number;
    return {
      message: `${input} should be greater than or equal to ${number}`,
      name: "isGreaterThan",
      pass,
    };
  };

  matchFn.matchName = "isGreaterThanOrEqual";

  return matchFn;
};
