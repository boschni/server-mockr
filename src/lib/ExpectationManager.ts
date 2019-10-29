import { Config } from "./Config";
import { Expectation, ExpectationRequestContext } from "./Expectation";
import { ExpectationDefinition } from "./ExpectationDefinition";
import { ExpectationRequestLog } from "./RequestLogManager";
import {
  ExpectationsDefinition,
  ExpectationsFactoryContext
} from "./ScenarioDefinition";
import { hasResponse } from "./valueHelpers";
import { ConfigValue, RequestValue, ResponseValue, StateValue } from "./Values";

export interface ExpectationManagerRequestContext {
  expectationRequestLogs: ExpectationRequestLog[];
  request: RequestValue;
  response: ResponseValue;
}

export class ExpectationManager {
  public config: Config;
  private expectationsDefinition: ExpectationsDefinition;
  private expectations: Expectation[] = [];
  private expectationConfig: ConfigValue = {};
  private expectationState: StateValue = {};

  constructor(config: Config, def: ExpectationsDefinition) {
    this.config = config;
    this.expectationsDefinition = def;
  }

  public start(config?: ConfigValue, state?: StateValue) {
    this.expectationConfig = { ...config };
    this.expectationState = { ...state };

    let definitions: ExpectationDefinition[];

    if (typeof this.expectationsDefinition === "function") {
      const ctx: ExpectationsFactoryContext = {
        config: this.expectationConfig,
        globals: this.config.globals,
        state: this.expectationState
      };
      definitions = this.expectationsDefinition(ctx);
    } else if (Array.isArray(this.expectationsDefinition)) {
      definitions = this.expectationsDefinition;
    } else {
      definitions = [this.expectationsDefinition];
    }

    for (const def of definitions) {
      this.expectations.push(new Expectation(this.config, def));
    }
  }

  public stop() {
    this.expectationConfig = {};
    this.expectationState = {};

    for (const expectation of this.expectations) {
      expectation.reset();
    }
  }

  public addExpectation(def: ExpectationDefinition) {
    this.expectations.push(new Expectation(this.config, def));
  }

  public async onRequest(ctx: ExpectationManagerRequestContext): Promise<void> {
    for (const expectation of this.expectations) {
      const expectationRequestLog: ExpectationRequestLog = {
        id: expectation.id
      };

      ctx.expectationRequestLogs.push(expectationRequestLog);

      const expectationCtx: ExpectationRequestContext = {
        config: this.expectationConfig,
        expectationRequestLog,
        globals: this.config.globals,
        request: ctx.request,
        response: ctx.response,
        state: this.expectationState,
        times: 0
      };

      await expectation.onRequest(expectationCtx);

      if (hasResponse(expectationCtx.response)) {
        return;
      }
    }
  }
}
