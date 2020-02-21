import { Action } from "./actions/Action";
import { ResponseConfigBuilder } from "./builders/response";
import { Config } from "./Config";
import { ContextMatcher, request } from "./context-matchers";
import { Logger } from "./Logger";
import { ExpectationRequestLog } from "./RequestLogManager";
import { RespondAction } from "./response-actions";
import { isMatchResult, isPassed, MatchResult } from "./value-matchers/MatchFn";
import { hasResponse } from "./valueHelpers";
import { ExpectationValue } from "./Values";

/*
 * TYPES
 */

export type RespondInput =
  | ResponseConfigBuilder
  | RespondFactory
  | string
  | object;

type RespondFactory = (
  ctx: ExpectationValue
) => ResponseConfigBuilder | string | object;

export type ContextMatcherInput =
  | ContextMatcher
  | ContextMatcherFactory
  | string;

type ContextMatcherFactory = (
  ctx: ExpectationValue
) => MatchResult | ContextMatcher;

export type ActionInput = Action | ActionFn;
type ActionFn = (ctx: ExpectationRequestContext) => Action | void;

export interface ExpectationRequestContext extends ExpectationValue {
  expectationRequestLogs: ExpectationRequestLog[];
}

export interface ExpectationConfig {
  afterResponseActions: ActionInput[];
  id?: string;
  respondInput?: RespondInput;
  verifyMatchers: ContextMatcherInput[];
  whenMatchers: ContextMatcherInput[];
}

/*
 * EXPECTATION
 */

export class Expectation {
  private static id = 0;
  private active = false;
  private id: string | number;
  private timesMatched = 0;

  constructor(
    protected config: Config,
    private logger: Logger,
    private expectationConfig: ExpectationConfig
  ) {
    this.id = this.expectationConfig.id || ++Expectation.id;
  }

  start() {
    this.active = true;
  }

  stop() {
    this.active = false;
    this.timesMatched = 0;
  }

  async onRequest(ctx: ExpectationRequestContext): Promise<void> {
    if (!this.active) {
      return;
    }

    const {
      afterResponseActions,
      respondInput: respondAction,
      whenMatchers,
      verifyMatchers
    } = this.expectationConfig;

    const log: ExpectationRequestLog = {
      id: this.id
    };

    ctx.expectationRequestLogs.push(log);

    ctx.times = this.timesMatched;

    const matchResult = await this.when(whenMatchers, ctx);

    log.matchResult = matchResult;

    if (!isPassed(matchResult)) {
      return;
    }

    this.timesMatched++;

    if (verifyMatchers) {
      const verifyResult = await this.verify(verifyMatchers, ctx);
      log.verifyResult = verifyResult;
    }

    if (respondAction && !hasResponse(ctx.res)) {
      await this.response(respondAction, ctx);
    }

    await this.afterResponse(afterResponseActions, ctx);
  }

  private async verify(
    matcherValues: ContextMatcherInput[],
    ctx: ExpectationRequestContext
  ): Promise<MatchResult> {
    const result = await this.when(matcherValues, ctx);

    if (!isPassed(result)) {
      this.logger.log("info", "Verify failed because:");
      this.logger.log("info", result);
      ctx.res.status = 400;
      ctx.res.headers["Content-Type"] = "application/json";
      ctx.res.body = JSON.stringify(result);
    }

    return result;
  }

  private async when(
    values: ContextMatcherInput[],
    ctx: ExpectationRequestContext
  ): Promise<MatchResult> {
    let result: MatchResult = true;

    if (!values.length) {
      return result;
    }

    for (const value of values) {
      const output = typeof value === "function" ? value(ctx) : value;

      if (isMatchResult(output)) {
        result = output;
      } else if (typeof output === "string") {
        result = request(output).match(ctx);
      } else {
        result = output.match(ctx);
      }

      if (!isPassed(result)) {
        return result;
      }
    }

    return result;
  }

  private async response(
    value: RespondInput,
    ctx: ExpectationRequestContext
  ): Promise<void> {
    value = typeof value === "function" ? value(ctx) : value;

    if (!(value instanceof ResponseConfigBuilder)) {
      value = new ResponseConfigBuilder(value);
    }

    const config = (value as ResponseConfigBuilder).build();
    const action = new RespondAction(config);
    await action.execute(ctx);
  }

  private async afterResponse(
    values: ActionInput[],
    ctx: ExpectationRequestContext
  ): Promise<void> {
    for (const value of values) {
      const action = typeof value === "function" ? value(ctx) : value;
      if (action) {
        await action.execute(ctx);
      }
    }
  }
}
