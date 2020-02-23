import { Action } from "./actions/Action";
import { Config } from "./Config";
import { response, ResponseConfigBuilder } from "./config-builders/response";
import { ContextMatcher, request } from "./context-matchers";
import { Logger } from "./Logger";
import { ExpectationRequestLog } from "./RequestLogManager";
import { RespondAction } from "./response-actions";
import { isMatchResult, isPassed, MatchResult } from "./value-matchers/MatchFn";
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
  afterRespondActions: ActionInput[];
  id?: string;
  next: boolean;
  respondInput?: RespondInput;
  verifyMatchers: ContextMatcherInput[];
  verifyFailedRespondInput?: RespondInput;
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

  async onRequest(ctx: ExpectationRequestContext): Promise<boolean> {
    if (!this.active) {
      return false;
    }

    const log: ExpectationRequestLog = {
      id: this.id
    };
    ctx.expectationRequestLogs.push(log);

    const {
      afterRespondActions,
      next,
      respondInput,
      verifyMatchers,
      verifyFailedRespondInput,
      whenMatchers
    } = this.expectationConfig;

    ctx.times = this.timesMatched;

    const matchResult = await this.match(whenMatchers, ctx);
    log.matchResult = matchResult;

    if (!isPassed(matchResult)) {
      return false;
    }

    this.timesMatched++;

    const verifyResult = await this.match(verifyMatchers, ctx);
    log.verifyResult = verifyResult;

    if (!isPassed(verifyResult)) {
      this.logger.log("info", "Verify failed because:");
      this.logger.log("info", verifyResult);

      if (verifyFailedRespondInput !== undefined) {
        await this.response(verifyFailedRespondInput, ctx);
      } else {
        await this.response(response(verifyResult).status(400), ctx);
      }

      return true;
    }

    if (respondInput !== undefined) {
      await this.response(respondInput, ctx);
    }

    await this.afterRespond(afterRespondActions, ctx);

    return next ? false : true;
  }

  private async match(
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

    const config = (value as ResponseConfigBuilder).getConfig();
    const action = new RespondAction(config);
    await action.execute(ctx);
  }

  private async afterRespond(
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
