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

export function globalParam(name: string, value: JSONValue): GlobalsMatcher;
export function globalParam(name: string, fn: MatchFn): GlobalsMatcher;
export function globalParam(
  name: string,
  matcher: MatchFn | JSONValue
): GlobalsMatcher {
  return new GlobalsMatcher(name, matcher);
}

/*
 * BUILDER
 */

export class GlobalsMatcher implements ContextMatcher {
  private _matchers: MatchFn[] = [];

  constructor(name: string, matcher: MatchFn | JSONValue) {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._matchers.push(prop(name, matcher as MatchFn));
    return this;
  }

  match(ctx: ExpectationValue): MatchResult {
    return allOf(...this._matchers)(ctx.globals);
  }
}
