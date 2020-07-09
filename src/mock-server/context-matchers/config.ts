import {
  allOf,
  isEqualTo,
  MatchFn,
  MatchResult,
  prop,
} from "../value-matchers";
import { ExpectationValue, JSONValue } from "../Values";
import { ContextMatcher } from "./ContextMatcher";

/*
 * FACTORY
 */

export function config(name: string, value: JSONValue): ConfigMatcher;
export function config(name: string, fn: MatchFn): ConfigMatcher;
export function config(
  name: string,
  matcher: MatchFn | JSONValue
): ConfigMatcher {
  return new ConfigMatcher(name, matcher);
}

/*
 * BUILDER
 */

export class ConfigMatcher implements ContextMatcher {
  private _matchers: MatchFn[] = [];

  constructor(name: string, matcher: MatchFn | JSONValue) {
    matcher = typeof matcher === "function" ? matcher : isEqualTo(matcher);
    this._matchers.push(prop(name, matcher));
    return this;
  }

  match(ctx: ExpectationValue): MatchResult {
    return allOf(...this._matchers)(ctx.config);
  }
}
