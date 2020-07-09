import { MatchFn, MatchResult } from "./MatchFn";

export const matchesRegex = (regexValue: string | RegExp): MatchFn => {
  const regex =
    typeof regexValue === "string" ? new RegExp(regexValue) : regexValue;

  const matchFn: MatchFn = (input: unknown): MatchResult => {
    if (typeof input !== "string") {
      return {
        message: `${JSON.stringify(input)} should be a string`,
        name: "regex",
        pass: false,
      };
    }

    const pass = regex.exec(input) !== null;

    return {
      message: `${JSON.stringify(input)} should match regex ${regexValue}`,
      name: "matchesRegex",
      pass,
    };
  };

  matchFn.matchName = "matchesRegex";

  return matchFn;
};
