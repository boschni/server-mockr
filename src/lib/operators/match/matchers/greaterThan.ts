import { MatchResult } from "../MatchOperator";

export const greaterThan = (number: number) => (
  input: string | number
): MatchResult => {
  const inputAsUnknown = input as unknown;
  const pass = Number(inputAsUnknown) > number;
  return {
    message: `greater than "${number}"`,
    name: "greaterThan",
    pass
  };
};
