import expect from "expect";

import { MatchFn, MatchResult } from "./MatchFn";

export const isEqualTo = (value: unknown) => {
  const matchFn: MatchFn = (input: unknown): MatchResult => {
    const result: MatchResult = {
      message: `${JSON.stringify(input)} should be equal to ${JSON.stringify(
        value
      )}`,
      name: "equalTo",
      pass: true,
    };

    try {
      expect(input).toEqual(value);
    } catch (e) {
      result.pass = false;
    }

    return result;
  };

  matchFn.matchName = "equalTo";

  return matchFn;
};
