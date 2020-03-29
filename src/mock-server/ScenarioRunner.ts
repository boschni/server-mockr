import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext
} from "./ExpectationManager";
import { Logger } from "./Logger";
// tslint:disable-next-line: no-circular-imports
import { RequestScenarioLogger } from "./request-logging/RequestScenarioLogger";
import { Scenario } from "./Scenario";
import { OnBootstrapScenarioContext, OnStartScenarioContext } from "./Scenario";
import { createDefaultedConfig, createDefaultedState } from "./valueHelpers";
import {
  ConfigValue,
  ExpectationValue,
  RequestValue,
  ResponseValue,
  StateValue
} from "./Values";

/*
 * TYPES
 */

export interface ScenarioRequestContext {
  scenarioLogger: RequestScenarioLogger;
  request: RequestValue;
  response: ResponseValue;
}

export interface StartScenarioParams {
  config?: ConfigValue;
  state?: StateValue;
}

/*
 * SCENARIO RUNNER
 */

export class ScenarioRunner {
  private static id = 0;

  private id: number;
  private active = false;
  private expectationManager?: ExpectationManager;
  private startedDateTime?: string;

  constructor(
    private config: Config,
    private logger: Logger,
    private scenario: Scenario
  ) {
    this.id = ++ScenarioRunner.id;
  }

  start(params: StartScenarioParams = {}) {
    this.active = true;
    this.startedDateTime = new Date().toISOString();

    const scenario = this.scenario;

    const defaultedConfig = createDefaultedConfig(
      params.config,
      scenario.getConfigParams()
    );

    const defaultedState = createDefaultedState(
      params.state,
      scenario.getStateParams()
    );

    const expectationManager = new ExpectationManager(this.config, this.logger);
    expectationManager.addExpectations(scenario.getExpectations());
    this.expectationManager = expectationManager;

    const onStart = scenario.getOnStartCallback();

    if (onStart) {
      const runtimeScenario = new Scenario(scenario.getId());

      const ctx: OnStartScenarioContext = {
        config: defaultedConfig,
        globals: this.config.globals,
        scenario: runtimeScenario,
        state: defaultedState
      };

      onStart(ctx);

      expectationManager.addExpectations(runtimeScenario.getExpectations());
    }

    expectationManager.start(defaultedConfig, defaultedState);
  }

  stop() {
    if (!this.active || !this.expectationManager) {
      return;
    }

    this.active = false;
    this.expectationManager.stop();
    this.expectationManager = undefined;
  }

  async bootstrap(req: RequestValue, res: ResponseValue) {
    if (!this.active || !this.expectationManager) {
      return;
    }

    const onBootstrap = this.scenario.getOnBootstrapCallback();

    if (!onBootstrap) {
      return;
    }

    const ctx: OnBootstrapScenarioContext = {
      config: this.expectationManager.getConfig(),
      globals: this.config.globals,
      req,
      res,
      state: this.expectationManager.getState()
    };

    const response = onBootstrap(ctx);

    if (!response) {
      return;
    }

    const expectationValue: ExpectationValue = {
      config: ctx.config,
      globals: ctx.globals,
      req: ctx.req,
      res: ctx.res,
      state: ctx.state,
      times: 1
    };

    await response._apply(expectationValue);
  }

  async onRequest(ctx: ScenarioRequestContext): Promise<boolean> {
    if (!this.active || !this.expectationManager) {
      return false;
    }

    const expectationManagerCtx: ExpectationManagerRequestContext = {
      scenarioLogger: ctx.scenarioLogger,
      request: ctx.request,
      response: ctx.response
    };

    return this.expectationManager.onRequest(expectationManagerCtx);
  }

  getId(): number {
    return this.id;
  }

  getScenarioId(): string {
    return this.scenario.getId();
  }

  getConfig(): ConfigValue {
    return this.expectationManager?.getConfig() ?? {};
  }

  getState(): StateValue {
    return this.expectationManager?.getState() ?? {};
  }

  getStartedDateTime(): string | undefined {
    return this.startedDateTime;
  }

  isActive(): boolean {
    return this.active;
  }
}
