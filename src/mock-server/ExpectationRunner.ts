import { executeAction } from "./actions";
import { Config } from "./Config";
import { request } from "./context-matchers";
import {
  ActionInput,
  ContextMatcherInput,
  Expectation,
  ExpectationConfig,
  RespondInput
} from "./Expectation";
import { Logger } from "./Logger";
// tslint:disable-next-line: no-circular-imports
import { RequestExpectationLogger } from "./loggers/RequestExpectationLogger";
import { response, Response } from "./Response";
import { isMatchResult, isPassed, MatchResult } from "./value-matchers";
import { ExpectationValue } from "./Values";

/*
 * TYPES
 */

export interface ExpectationRequestContext {
  expectationLogger: RequestExpectationLogger;
  expectationValue: ExpectationValue;
}

/*
 * EXPECTATION RUNNER
 */

export class ExpectationRunner {
  private static id = 0;
  private active = false;
  private id: string | number;
  private timesMatched = 0;
  private expectationConfig: ExpectationConfig;

  constructor(
    protected config: Config,
    private logger: Logger,
    private expectation: Expectation
  ) {
    this.expectationConfig = this.expectation.getConfig();
    this.id = this.expectationConfig.id || ++ExpectationRunner.id;
  }

  start() {
    this.active = true;
  }

  stop() {
    this.active = false;
    this.timesMatched = 0;
  }

  getId(): string | number {
    return this.id;
  }

  async onRequest(ctx: ExpectationRequestContext): Promise<boolean> {
    if (!this.active) {
      return false;
    }

    const { expectationValue } = ctx;

    const {
      afterRespondActions,
      next,
      respondInput,
      times,
      verifyFailedRespondInput,
      verifyMatchers,
      whenMatchers
    } = this.expectationConfig;

    expectationValue.times = this.timesMatched;

    const matchResult = await this.match(whenMatchers, ctx);
    ctx.expectationLogger.logMatchResult(matchResult);

    if (!isPassed(matchResult)) {
      return false;
    }

    this.timesMatched++;

    if (typeof times === "number" && this.timesMatched > times) {
      return false;
    }

    const verifyResult = await this.match(verifyMatchers, ctx);
    ctx.expectationLogger.logVerifyResult(verifyResult);

    if (!isPassed(verifyResult)) {
      this.logger.log("info", "Verify failed because:");
      this.logger.log("info", verifyResult);

      if (verifyFailedRespondInput !== undefined) {
        await this.respond(verifyFailedRespondInput, ctx);
      } else {
        await this.respond(response({ verifyResult }).status(400), ctx);
      }

      return true;
    }

    if (respondInput !== undefined) {
      await this.respond(respondInput, ctx);
    }

    this.afterRespond(afterRespondActions, ctx);

    return next ? false : true;
  }

  private async match(
    values: ContextMatcherInput[],
    ctx: ExpectationRequestContext
  ): Promise<MatchResult> {
    const { expectationValue } = ctx;

    let result: MatchResult = true;

    if (!values.length) {
      return result;
    }

    for (const value of values) {
      const output =
        typeof value === "function" ? value(expectationValue) : value;

      if (isMatchResult(output)) {
        result = output;
      } else if (typeof output === "string") {
        result = request(output).match(expectationValue);
      } else {
        result = output.match(expectationValue);
      }

      if (!isPassed(result)) {
        return result;
      }
    }

    return result;
  }

  private async respond(
    value: RespondInput,
    ctx: ExpectationRequestContext
  ): Promise<void> {
    const { expectationValue } = ctx;

    if (typeof value === "function") {
      value = value(expectationValue);
    }

    if (value instanceof Promise) {
      try {
        value = await value;
      } catch {
        value = "";
      }
    }

    const res = value instanceof Response ? value : new Response(value);

    await res._apply(expectationValue);
  }

  private async afterRespond(
    values: ActionInput[],
    ctx: ExpectationRequestContext
  ): Promise<void> {
    const { expectationValue } = ctx;

    for (const value of values) {
      const result =
        typeof value === "function" ? value(expectationValue) : value;

      if (result instanceof Promise) {
        await result;
      } else if (result) {
        await executeAction(result, expectationValue);
      }
    }
  }
}
