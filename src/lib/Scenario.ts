import { applyResponseBehaviours } from "./behaviours/responseBehaviour";
import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext
} from "./ExpectationManager";
import { ScenarioRequestLog } from "./RequestLogManager";
import {
  ScenarioDefinition,
  ScenarioOnBootstrapDefinition
} from "./ScenarioDefinition";
import { createDefaultedConfig, createDefaultedState } from "./valueHelpers";
import {
  ConfigValue,
  ExpectationValue,
  GlobalsValue,
  RequestValue,
  ResponseValue,
  StateValue
} from "./Values";

export interface ScenarioRequestContext {
  scenarioRequestLog: ScenarioRequestLog;
  request: RequestValue;
  response: ResponseValue;
}

interface BootstrapScenarioContext {
  config: ConfigValue;
  globals: GlobalsValue;
  request: RequestValue;
  response: ResponseValue;
  state: StateValue;
}

export class Scenario {
  public id: string;

  private config: Config;
  private definition: ScenarioDefinition;
  private expectationManager: ExpectationManager;

  constructor(config: Config, def: ScenarioDefinition) {
    this.config = config;
    this.id = def.id;
    this.definition = def;
    this.expectationManager = new ExpectationManager(
      this.config,
      def.expectations
    );
  }

  public async start(config?: ConfigValue, state?: StateValue) {
    const def = this.definition;
    const defaultedConfig = createDefaultedConfig(config, def.config);
    const defaultedState = createDefaultedState(state, def.state);
    this.expectationManager.start(defaultedConfig, defaultedState);
  }

  public stop() {
    this.expectationManager.stop();
  }

  public async bootstrap(request: RequestValue, response: ResponseValue) {
    const def = this.definition;

    if (def.onBootstrap) {
      const ctx: BootstrapScenarioContext = {
        config: this.expectationManager.getConfig(),
        globals: this.config.globals,
        request,
        response,
        state: this.expectationManager.getState()
      };
      await this.onBootstrap(def.onBootstrap, ctx);
    }
  }

  public async onRequest(ctx: ScenarioRequestContext): Promise<void> {
    const expectationManagerCtx: ExpectationManagerRequestContext = {
      expectationRequestLogs: ctx.scenarioRequestLog.expectations,
      request: ctx.request,
      response: ctx.response
    };
    return this.expectationManager.onRequest(expectationManagerCtx);
  }

  private async onBootstrap(
    def: NonNullable<ScenarioDefinition["onBootstrap"]>,
    ctx: BootstrapScenarioContext
  ): Promise<void> {
    if (def.response) {
      await this.onBootstrapResponse(def.response, ctx);
    }
  }

  private async onBootstrapResponse(
    def: NonNullable<ScenarioOnBootstrapDefinition["response"]>,
    ctx: BootstrapScenarioContext
  ): Promise<void> {
    const expectationValue: ExpectationValue = {
      config: ctx.config,
      globals: ctx.globals,
      request: ctx.request,
      response: ctx.response,
      state: ctx.state,
      times: 1
    };

    await applyResponseBehaviours(def, expectationValue);
  }
}
