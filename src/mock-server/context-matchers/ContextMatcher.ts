import { MatchResult } from "../value-matchers/MatchFn";
import { ExpectationValue } from "../Values";

/*
 * TYPES
 */

export interface ContextMatcher {
  match(ctx: ExpectationValue): MatchResult;
}
