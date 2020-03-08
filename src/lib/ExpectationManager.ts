import { Config } from "./Config";
import { Expectation } from "./Expectation";
import {
  ExpectationRequestContext,
  ExpectationRunner
} from "./ExpectationRunner";
import { Logger } from "./Logger";
import { ExpectationRequestLog } from "./RequestLogManager";
import { ConfigValue, RequestValue, ResponseValue, StateValue } from "./Values";

/*
 * TYPES
 */

export interface ExpectationManagerRequestContext {
  expectationRequestLogs: ExpectationRequestLog[];
  request: RequestValue;
  response: ResponseValue;
}

/*
 * MANAGER
 */

export class ExpectationManager {
  private active = false;
  private expectationRunners: ExpectationRunner[] = [];
  private expectationConfig: ConfigValue = {};
  private expectationState: StateValue = {};

  constructor(private config: Config, private logger: Logger) {}

  start(config?: ConfigValue, state?: StateValue) {
    this.active = true;

    this.expectationConfig = { ...config };
    this.expectationState = { ...state };

    for (const runner of this.expectationRunners) {
      runner.start();
    }
  }

  stop() {
    this.active = false;

    this.expectationState = {};

    for (const runner of this.expectationRunners) {
      runner.stop();
    }
  }

  clear() {
    this.expectationState = {};
    this.expectationRunners = [];
  }

  addExpectations(expectations: Expectation[]) {
    for (const expectation of expectations) {
      this.addExpectation(expectation);
    }
  }

  addExpectation(expectation: Expectation) {
    const runner = new ExpectationRunner(this.config, this.logger, expectation);

    this.expectationRunners.push(runner);

    if (this.active) {
      runner.start();
    }
  }

  getConfig(): ConfigValue {
    return this.expectationConfig;
  }

  getState(): StateValue {
    return this.expectationState;
  }

  async onRequest(ctx: ExpectationManagerRequestContext): Promise<boolean> {
    if (!this.active) {
      return false;
    }

    for (const runner of this.expectationRunners) {
      const expectationCtx: ExpectationRequestContext = {
        config: this.expectationConfig,
        expectationRequestLogs: ctx.expectationRequestLogs,
        globals: this.config.globals,
        req: ctx.request,
        res: ctx.response,
        state: this.expectationState,
        times: 0
      };

      const handled = await runner.onRequest(expectationCtx);

      if (handled) {
        return true;
      }
    }

    return false;
  }
}
