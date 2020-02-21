import expect from "expect";
import stripAnsi from "strip-ansi";

import { MatchFn, MatchResult } from "./MatchFn";

export const matchesObject = (value: unknown) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const result = {
      message: `${JSON.stringify(input)} should match object ${JSON.stringify(
        value
      )}`,
      name: "matchObject",
      pass: true
    };

    try {
      expect(input).toMatchObject(value as any);
    } catch (e) {
      result.pass = false;
      result.message = stripAnsi(e.toString());
    }

    return result;
  };

  matchFn.matchName = "matchesObject";

  return matchFn;
};
