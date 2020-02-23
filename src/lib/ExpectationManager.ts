import { Config } from "./Config";
import { ExpectationConfigBuilder } from "./config-builders/expectation";
import { Expectation, ExpectationRequestContext } from "./Expectation";
import { Logger } from "./Logger";
import { ExpectationRequestLog } from "./RequestLogManager";
import { RequestValue, ResponseValue, StateValue } from "./Values";

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
  private expectations: Expectation[] = [];
  private expectationState: StateValue = {};

  constructor(
    private config: Config,
    private logger: Logger,
    builders?: ExpectationConfigBuilder[]
  ) {
    if (builders) {
      this.addExpectations(builders);
    }
  }

  start(state?: StateValue) {
    this.active = true;

    this.expectationState = { ...state };

    for (const expectation of this.expectations) {
      expectation.start();
    }
  }

  stop() {
    this.active = false;

    this.expectationState = {};

    for (const expectation of this.expectations) {
      expectation.stop();
    }
  }

  clear() {
    this.expectationState = {};
    this.expectations = [];
  }

  addExpectation(builder: ExpectationConfigBuilder) {
    const expectationConfig = builder.getConfig();

    const expectation = new Expectation(
      this.config,
      this.logger,
      expectationConfig
    );

    this.expectations.push(expectation);

    if (this.active) {
      expectation.start();
    }
  }

  addExpectations(builders: ExpectationConfigBuilder[]) {
    for (const builder of builders) {
      this.addExpectation(builder);
    }
  }

  getState(): StateValue {
    return this.expectationState;
  }

  async onRequest(ctx: ExpectationManagerRequestContext): Promise<boolean> {
    if (!this.active) {
      return false;
    }

    for (const expectation of this.expectations) {
      const expectationCtx: ExpectationRequestContext = {
        expectationRequestLogs: ctx.expectationRequestLogs,
        globals: this.config.globals,
        req: ctx.request,
        res: ctx.response,
        state: this.expectationState,
        times: 0
      };

      const handled = await expectation.onRequest(expectationCtx);

      if (handled) {
        return true;
      }
    }

    return false;
  }
}
