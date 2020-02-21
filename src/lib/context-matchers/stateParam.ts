import {
  allOf,
  isEqualTo,
  MatchFn,
  MatchResult,
  prop
} from "../value-matchers";
import { ExpectationValue, JSONValue } from "../Values";
import { ContextMatcher } from "./ContextMatcher";

/*
 * FACTORY
 */

export function stateParam(name: string, value: JSONValue): StateMatcher;
export function stateParam(name: string, fn: MatchFn): StateMatcher;
export function stateParam(
  name: string,
  matcher: MatchFn | JSONValue
): StateMatcher {
  return new StateMatcher(name, matcher);
}

/*
 * BUILDER
 */

export class StateMatcher implements ContextMatcher {
  private _matchers: MatchFn[] = [];

  constructor(name: string, matcher: MatchFn | JSONValue) {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._matchers.push(prop(name, matcher));
    return this;
  }

  match(ctx: ExpectationValue): MatchResult {
    return allOf(...this._matchers)(ctx.state);
  }
}
