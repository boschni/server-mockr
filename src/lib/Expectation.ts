import { applyAfterResponseBehaviours } from "./behaviours/afterResponseBehaviour";
import { applyResponseBehaviours } from "./behaviours/responseBehaviour";
import { Config } from "./Config";
import { ExpectationDefinition } from "./ExpectationDefinition";
import { definitionToMatcher } from "./operators/adapters";
import { isPassed, MatchResult } from "./operators/match/MatchOperator";
import { ExpectationRequestLog } from "./RequestLogManager";
import { hasResponse } from "./valueHelpers";
import { ExpectationValue } from "./Values";

export interface ExpectationRequestContext extends ExpectationValue {
  expectationRequestLog: ExpectationRequestLog;
}

export class Expectation {
  private static id = 0;
  public id: string | number;

  protected config: Config;
  private definition: ExpectationDefinition;
  private timesMatched = 0;

  constructor(config: Config, definition: ExpectationDefinition) {
    this.config = config;
    this.definition = definition;
    this.id = this.definition.id || ++Expectation.id;
  }

  public async onRequest(ctx: ExpectationRequestContext): Promise<void> {
    const def = this.definition;

    ctx.times = this.timesMatched;

    const matchResult = await this.match(def.match, ctx);

    ctx.expectationRequestLog.matchResult = matchResult;

    if (!isPassed(matchResult)) {
      return;
    }

    this.timesMatched++;

    if (def.verify) {
      const verifyResult = await this.verify(def.verify, ctx);
      ctx.expectationRequestLog.verifyResult = verifyResult;
    }

    if (def.response && !hasResponse(ctx.response)) {
      await this.response(def.response, ctx);
    }

    if (def.afterResponse) {
      await this.afterResponse(def.afterResponse, ctx);
    }
  }

  public reset() {
    this.timesMatched = 0;
  }

  private async verify(
    def: NonNullable<ExpectationDefinition["verify"]>,
    ctx: ExpectationRequestContext
  ): Promise<MatchResult> {
    const result = await this.match(def, ctx);

    if (!isPassed(result)) {
      // tslint:disable-next-line: no-console
      console.log("Verify failed because:");
      // tslint:disable-next-line: no-console
      console.log(result);
      ctx.response.status = 400;
      ctx.response.headers["Content-Type"] = "application/json";
      ctx.response.body = JSON.stringify(result);
    }

    return result;
  }

  private async match(
    def: ExpectationDefinition["match"],
    ctx: ExpectationRequestContext
  ): Promise<MatchResult> {
    let result: MatchResult = true;

    if (!def) {
      return result;
    }

    if (def.globals) {
      result = this.matchValue(def.globals, ctx.globals);
      if (!isPassed(result)) {
        return result;
      }
    }

    if (def.config) {
      result = this.matchValue(def.config, ctx.config);
      if (!isPassed(result)) {
        return result;
      }
    }

    if (def.state) {
      result = this.matchValue(def.state, ctx.state);
      if (!isPassed(result)) {
        return result;
      }
    }

    if (def.times !== undefined) {
      result = this.matchValue(def.times, ctx.times);
      if (!isPassed(result)) {
        return result;
      }
    }

    if (def.request) {
      if (typeof def.request === "function") {
        return def.request(ctx.request);
      }

      result = this.matchValue(def.request.path, ctx.request.path);
      if (!isPassed(result)) {
        return result;
      }

      result = this.matchValue(def.request.url, ctx.request.url);
      if (!isPassed(result)) {
        return result;
      }

      result = this.matchValue(def.request.method, ctx.request.method);
      if (!isPassed(result)) {
        return result;
      }

      result = this.matchValue(def.request.query, ctx.request.query);
      if (!isPassed(result)) {
        return result;
      }

      result = this.matchValue(def.request.headers, ctx.request.headers);
      if (!isPassed(result)) {
        return result;
      }

      result = this.matchValue(def.request.cookies, ctx.request.cookies);
      if (!isPassed(result)) {
        return result;
      }

      result = this.matchValue(def.request.body, ctx.request.body);
      if (!isPassed(result)) {
        return result;
      }
    }

    return result;
  }

  private matchValue(def: any, value: any): MatchResult {
    if (!def) {
      return true;
    } else if (typeof def === "function") {
      return def(value);
    } else {
      const matcher = definitionToMatcher(def);
      return matcher ? matcher(value) : false;
    }
  }

  private async afterResponse(
    def: NonNullable<ExpectationDefinition["afterResponse"]>,
    ctx: ExpectationRequestContext
  ): Promise<void> {
    await applyAfterResponseBehaviours(def, ctx);
  }

  private async response(
    def: NonNullable<ExpectationDefinition["response"]>,
    ctx: ExpectationRequestContext
  ): Promise<void> {
    await applyResponseBehaviours(def, ctx);
  }
}
