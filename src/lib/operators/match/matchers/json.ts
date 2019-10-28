import { MatchFn, MatchResult } from "../MatchOperator";

export const json = (fn?: MatchFn) => (input: string): MatchResult => {
  let output: any;

  try {
    output = JSON.parse(input);
  } catch {
    return {
      message: `be valid JSON`,
      name: "json",
      pass: false
    };
  }

  return fn ? fn(output) : output;
};