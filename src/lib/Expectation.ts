import { Action } from "./actions";
import { ContextMatcher } from "./context-matchers";
import { MatchResult } from "./value-matchers";
import { ExpectationValue } from "./Values";

/*
 * TYPES
 */

export type RespondInput = Response | RespondFactory | string | object;

type RespondFactory = (ctx: ExpectationValue) => Response | string | object;

export type ContextMatcherInput =
  | ContextMatcher
  | ContextMatcherFactory
  | string;

type ContextMatcherFactory = (
  ctx: ExpectationValue
) => MatchResult | ContextMatcher;

export type ActionInput = Action | ActionFn;

type ActionFn = (ctx: ExpectationValue) => Action | void;

export interface ExpectationConfig {
  afterRespondActions: ActionInput[];
  id?: string;
  next: boolean;
  respondInput?: RespondInput;
  verifyMatchers: ContextMatcherInput[];
  verifyFailedRespondInput?: RespondInput;
  whenMatchers: ContextMatcherInput[];
}

/*
 * FACTORY
 */

export function expect(...matchers: ContextMatcherInput[]) {
  return new Expectation(...matchers);
}

/*
 * EXPECTATION
 */

export class Expectation {
  private _config: ExpectationConfig = {
    afterRespondActions: [],
    next: false,
    verifyMatchers: [],
    whenMatchers: []
  };

  constructor(...matchers: ContextMatcherInput[]) {
    this._config.whenMatchers.push(...matchers);
  }

  id(id: string) {
    this._config.id = id;
    return this;
  }

  verify(...matchers: ContextMatcherInput[]) {
    this._config.verifyMatchers.push(...matchers);
    return this;
  }

  verifyFailedRespond(input: RespondInput) {
    this._config.verifyFailedRespondInput = input;
    return this;
  }

  respond(input: RespondInput) {
    this._config.respondInput = input;
    return this;
  }

  afterRespond(...actions: ActionInput[]) {
    this._config.afterRespondActions = actions;
    return this;
  }

  next() {
    this._config.next = true;
    return this;
  }

  getConfig() {
    return this._config;
  }
}
