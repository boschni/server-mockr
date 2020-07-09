import { MatchFn, MatchResult } from "./MatchFn";

export const startsWith = (prefix: string) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    if (typeof input !== "string") {
      return {
        message: `${JSON.stringify(input)} should be a string`,
        name: "startsWith",
        pass: false,
      };
    }

    const pass = input.startsWith(prefix);

    return {
      message: `${JSON.stringify(input)} should start with "${prefix}"`,
      name: "startsWith",
      pass,
    };
  };

  matchFn.matchName = "startsWith";

  return matchFn;
};
