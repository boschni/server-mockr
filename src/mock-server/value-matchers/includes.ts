import { MatchFn, MatchResult } from "./MatchFn";

export const includes = (searchString: string) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    if (typeof input !== "string") {
      return {
        message: `${JSON.stringify(input)} should be a string`,
        name: "includes",
        pass: false,
      };
    }

    const pass = input.includes(searchString);

    return {
      message: `${JSON.stringify(input)} should include "${searchString}"`,
      name: "includes",
      pass,
    };
  };

  matchFn.matchName = "includes";

  return matchFn;
};
