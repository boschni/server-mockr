import { MatchResult } from "../MatchOperator";

export const greaterThanOrEqual = (number: number) => (
  input: string | number
): MatchResult => {
  const inputAsUnknown = input as unknown;
  const pass = Number(inputAsUnknown) >= number;
  return {
    message: `greater than or equal to "${number}"`,
    name: "greaterThan",
    pass
  };
};
