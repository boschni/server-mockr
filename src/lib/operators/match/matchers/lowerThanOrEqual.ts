import { MatchResult } from "../MatchOperator";

export const lowerThanOrEqual = (number: number) => (
  input: string | number
): MatchResult => {
  const inputAsUnknown = input as unknown;
  const pass = Number(inputAsUnknown) <= number;
  return {
    message: `lower than or equal to "${number}"`,
    name: "lowerThanOrEqual",
    pass
  };
};
