import { MatchResult } from "../MatchOperator";

export const equalTo = (value: any) => (input: any): MatchResult => {
  const pass = input === value;
  return {
    message: `equals "${value}"`,
    name: "equalTo",
    pass
  };
};
