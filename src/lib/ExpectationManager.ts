import { ExpectationConfigBuilder } from "./builders/expectation";
import { Config } from "./Config";
import { Expectation, ExpectationRequestContext } from "./Expectation";
import { Logger } from "./Logger";
import { ExpectationRequestLog } from "./RequestLogManager";
import { hasResponse } from "./valueHelpers";
import { RequestValue, ResponseValue, StateValue } from "./Values";

export interface ExpectationManagerRequestContext {
  expectationRequestLogs: ExpectationRequestLog[];
  request: RequestValue;
  response: ResponseValue;
}

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
    const expectationConfig = builder.build();

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

  async onRequest(ctx: ExpectationManagerRequestContext): Promise<void> {
    if (!this.active) {
      return;
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

      await expectation.onRequest(expectationCtx);

      if (hasResponse(expectationCtx.res)) {
        return;
      }
    }
  }
}
