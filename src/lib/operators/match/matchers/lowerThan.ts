import { MatchResult } from "../MatchOperator";

export const lowerThan = (number: number) => (
  input: string | number
): MatchResult => {
  const inputAsUnknown = input as unknown;
  const pass = Number(inputAsUnknown) < number;
  return {
    message: `lower than "${number}"`,
    name: "lowerThan",
    pass
  };
};
