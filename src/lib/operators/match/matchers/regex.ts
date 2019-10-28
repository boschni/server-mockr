import { MatchFn, MatchResult } from "../MatchOperator";

export const regex = (regexString: string): MatchFn => (
  input: string
): MatchResult => {
  const inputAsUnknown = input as unknown;

  if (typeof inputAsUnknown !== "string") {
    return {
      message: `be a string`,
      name: "regex",
      pass: false
    };
  }

  const pass = new RegExp(regexString).exec(inputAsUnknown) !== null;

  return {
    message: `pass regex`,
    name: "regex",
    pass
  };
};
