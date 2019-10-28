import expect from "expect";
import stripAnsi from "strip-ansi";

import { MatchResult } from "../MatchOperator";

export const matchObject = (value: any) => (input: string): MatchResult => {
  const inputAsUnknown = input as unknown;

  const result = {
    message: `matches object "${JSON.stringify(value)}"`,
    name: "matchObject",
    pass: true
  };

  try {
    expect(inputAsUnknown).toMatchObject(value);
  } catch (e) {
    result.pass = false;
    result.message = stripAnsi(e.toString());
  }

  return result;
};
