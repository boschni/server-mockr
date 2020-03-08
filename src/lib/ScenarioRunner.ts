import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext
} from "./ExpectationManager";
import { ExpectationRequestContext } from "./ExpectationRunner";
import { Logger } from "./Logger";
import { ScenarioRequestLog } from "./RequestLogManager";
import { Scenario } from "./Scenario";
import { OnBootstrapScenarioContext, OnStartScenarioContext } from "./Scenario";
import { clone } from "./utils/clone";
import { createDefaultedConfig, createDefaultedState } from "./valueHelpers";
import { ConfigValue, RequestValue, ResponseValue, StateValue } from "./Values";

/*
 * TYPES
 */

export interface ScenarioRequestContext {
  scenarioRequestLogs: ScenarioRequestLog[];
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

  private id: string;
  private active = false;
  private expectationManager?: ExpectationManager;

  constructor(
    private config: Config,
    private logger: Logger,
    private scenario: Scenario
  ) {
    this.id = String(++ScenarioRunner.id);
  }

  start(params: StartScenarioParams = {}) {
    this.active = true;

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

    const expectationValue: ExpectationRequestContext = {
      config: ctx.config,
      expectationRequestLogs: [],
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

    const scenarioRequestLog: ScenarioRequestLog = {
      expectations: [],
      id: this.scenario.getId(),
      state: clone(this.getState())
    };

    ctx.scenarioRequestLogs.push(scenarioRequestLog);

    const expectationManagerCtx: ExpectationManagerRequestContext = {
      expectationRequestLogs: scenarioRequestLog.expectations,
      request: ctx.request,
      response: ctx.response
    };

    return this.expectationManager.onRequest(expectationManagerCtx);
  }

  getId(): string {
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

  isActive(): boolean {
    return this.active;
  }
}
