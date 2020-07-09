import { MatchFn, MatchResult } from "./MatchFn";

export const isGreaterThan = (number: number) => {
  const fn: MatchFn = (input: unknown): MatchResult => {
    const pass = Number(input) > number;
    return {
      message: `${input} should be greater than ${number}`,
      name: "isGreaterThan",
      pass,
    };
  };

  fn.matchName = "isGreaterThan";

  return fn;
};
