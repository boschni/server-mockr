import { MatchResult } from "../MatchOperator";

export const startsWith = (prefix: string) => (input: string): MatchResult => {
  const inputAsUnknown = input as unknown;

  if (typeof inputAsUnknown !== "string") {
    return {
      message: `be a string`,
      name: "startsWith",
      pass: false
    };
  }

  const pass = inputAsUnknown.startsWith(prefix);

  return {
    message: `start with "${prefix}"`,
    name: "startsWith",
    pass
  };
};
