import { MatchResult } from "../MatchOperator";

export const endsWith = (suffix: string) => (input: string): MatchResult => {
  const inputAsUnknown = input as unknown;

  if (typeof inputAsUnknown !== "string") {
    return {
      message: `be a string`,
      name: "endsWith",
      pass: false
    };
  }

  const pass = inputAsUnknown.endsWith(suffix);

  return {
    message: `end with "${suffix}"`,
    name: "endsWith",
    pass
  };
};
