import { MatchFn, MatchResult } from "./MatchFn";

export const endsWith = (suffix: string) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    if (typeof input !== "string") {
      return {
        message: `${JSON.stringify(input)} should be a string`,
        name: "endsWith",
        pass: false,
      };
    }

    const pass = input.endsWith(suffix);

    return {
      message: `${JSON.stringify(input)} should end with "${suffix}"`,
      name: "endsWith",
      pass,
    };
  };

  matchFn.matchName = "endsWith";

  return matchFn;
};
