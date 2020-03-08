import { Action } from "./actions";
import { ContextMatcher } from "./context-matchers";
import { Response } from "./Response";
import { MatchResult } from "./value-matchers";
import { ExpectationValue } from "./Values";

/*
 * TYPES
 */

type RespondValue = Response | string | object;

export type RespondInput = RespondValue | RespondFactory;

type RespondFactory = (
  ctx: ExpectationValue
) => RespondValue | Promise<RespondValue>;

export type ContextMatcherInput =
  | ContextMatcher
  | ContextMatcherFactory
  | string;

type ContextMatcherFactory = (
  ctx: ExpectationValue
) => MatchResult | ContextMatcher;

export type ActionInput = Action | ActionFactory;

type ActionFactory = (ctx: ExpectationValue) => Action | void;

export interface ExpectationConfig {
  afterRespondActions: ActionInput[];
  id?: string;
  next: boolean;
  respondInput?: RespondInput;
  times?: number;
  verifyFailedRespondInput?: RespondInput;
  verifyMatchers: ContextMatcherInput[];
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

  id(id: string): this {
    this._config.id = id;
    return this;
  }

  times(times: number): this {
    this._config.times = times;
    return this;
  }

  verify(...matchers: ContextMatcherInput[]): this {
    this._config.verifyMatchers.push(...matchers);
    return this;
  }

  verifyFailedRespond(input: RespondInput): this {
    this._config.verifyFailedRespondInput = input;
    return this;
  }

  respond(code?: number): this;
  respond(code?: number, input?: RespondInput): this;
  respond(input?: RespondInput): this;
  respond(codeOrBody?: number | RespondInput, input?: RespondInput): this {
    if (
      typeof codeOrBody === "number" &&
      (typeof input === "undefined" ||
        typeof input === "string" ||
        typeof input === "object")
    ) {
      this._config.respondInput = new Response(input).status(codeOrBody);
    } else if (typeof codeOrBody !== "number") {
      this._config.respondInput = codeOrBody;
    }
    return this;
  }

  afterRespond(...actions: ActionInput[]): this {
    this._config.afterRespondActions = actions;
    return this;
  }

  next(): this {
    this._config.next = true;
    return this;
  }

  getConfig() {
    return this._config;
  }
}
