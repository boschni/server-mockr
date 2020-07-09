import { MatchFn, MatchResult } from "./MatchFn";

export const isLowerThan = (number: number) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const pass = Number(input) < number;
    return {
      message: `${input} should be lower than ${number}`,
      name: "isLowerThan",
      pass,
    };
  };

  matchFn.matchName = "isLowerThan";

  return matchFn;
};
