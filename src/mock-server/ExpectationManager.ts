import { Config } from "./Config";
import { Expectation } from "./Expectation";
import {
  ExpectationRequestContext,
  ExpectationRunner,
} from "./ExpectationRunner";
import { Logger } from "./Logger";
import { RequestExpectationLogger } from "./request-logging/RequestExpectationLogger";
import { RequestLogger } from "./request-logging/RequestLogger";
import { RequestScenarioLogger } from "./request-logging/RequestScenarioLogger";
import {
  ConfigValue,
  ExpectationValue,
  RequestValue,
  ResponseValue,
  StateValue,
} from "./Values";

/*
 * TYPES
 */

export interface ExpectationManagerRequestContext {
  requestLogger?: RequestLogger;
  scenarioLogger?: RequestScenarioLogger;
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
      const expectationLogger = new RequestExpectationLogger(runner);

      if (ctx.scenarioLogger) {
        ctx.scenarioLogger.addExpectationLogger(expectationLogger);
      } else if (ctx.requestLogger) {
        ctx.requestLogger.addExpectationLogger(expectationLogger);
      }

      const expectationValue: ExpectationValue = {
        config: this.expectationConfig,
        globals: this.config.globals,
        req: ctx.request,
        res: ctx.response,
        state: this.expectationState,
        times: 0,
      };

      const expectationCtx: ExpectationRequestContext = {
        expectationValue,
        expectationLogger,
      };

      const handled = await runner.onRequest(expectationCtx);

      if (handled) {
        return true;
      }
    }

    return false;
  }
}
