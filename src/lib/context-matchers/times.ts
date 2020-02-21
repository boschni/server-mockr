import {
  allOf,
  isLowerThanOrEqual,
  MatchFn,
  MatchResult
} from "../value-matchers";
import { ExpectationValue } from "../Values";
import { ContextMatcher } from "./ContextMatcher";

/*
 * FACTORY
 */

export function times(number: number): TimesMatcher;
export function times(fn: MatchFn): TimesMatcher;
export function times(matcher: number | MatchFn): TimesMatcher {
  return new TimesMatcher(matcher as any);
}

/*
 * BUILDER
 */

export class TimesMatcher implements ContextMatcher {
  private _matchers: MatchFn[] = [];

  constructor(number: number);
  constructor(matcher: number | MatchFn) {
    matcher =
      typeof matcher === "function" ? matcher : isLowerThanOrEqual(matcher - 1);
    this._matchers.push(matcher);
    return this;
  }

  match(ctx: ExpectationValue): MatchResult {
    return allOf(...this._matchers)(ctx.times);
  }
}
