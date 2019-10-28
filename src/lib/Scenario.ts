import { applyResponseBehaviours } from "./behaviours/responseBehaviour";
import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext
} from "./ExpectationManager";
import { ScenarioRequestLog } from "./RequestLogManager";
import {
  ScenarioDefinition,
  ScenarioOnStartDefinition
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

interface StartScenarioContext {
  config: ConfigValue;
  globals: GlobalsValue;
  request?: RequestValue;
  response?: ResponseValue;
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

  public async start(
    config?: ConfigValue,
    state?: StateValue,
    request?: RequestValue,
    response?: ResponseValue
  ) {
    const def = this.definition;

    const defaultedConfig = createDefaultedConfig(config, def.config);
    const defaultedState = createDefaultedState(state, def.state);

    if (def.onStart) {
      const ctx: StartScenarioContext = {
        config: defaultedConfig,
        globals: this.config.globals,
        request,
        response,
        state: defaultedState
      };
      await this.onStart(def.onStart, ctx);
    }

    this.expectationManager.start(defaultedConfig, defaultedState);
  }

  public stop() {
    this.expectationManager.stop();
  }

  public async onRequest(ctx: ScenarioRequestContext): Promise<void> {
    const expectationManagerCtx: ExpectationManagerRequestContext = {
      expectationRequestLogs: ctx.scenarioRequestLog.expectations,
      request: ctx.request,
      response: ctx.response
    };
    return this.expectationManager.onRequest(expectationManagerCtx);
  }

  private async onStart(
    def: NonNullable<ScenarioDefinition["onStart"]>,
    ctx: StartScenarioContext
  ): Promise<void> {
    if (def.response) {
      await this.onStartResponse(def.response, ctx);
    }
  }

  private async onStartResponse(
    def: NonNullable<ScenarioOnStartDefinition["response"]>,
    ctx: StartScenarioContext
  ): Promise<void> {
    if (!ctx.request || !ctx.response) {
      return;
    }

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
