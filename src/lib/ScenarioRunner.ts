import MarkdownIt from "markdown-it";

import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext
} from "./ExpectationManager";
import { ExpectationRequestContext } from "./ExpectationRunner";
import { Logger } from "./Logger";
import { ScenarioRequestLog } from "./RequestLogManager";
import { Scenario } from "./Scenario";
import {
  OnBootstrapScenarioContext,
  OnStartScenarioContext,
  ScenarioConfig
} from "./Scenario";
import { clone } from "./utils/clone";
import { createDefaultedState } from "./valueHelpers";
import { RequestValue, ResponseValue, StateConfig, StateValue } from "./Values";

/*
 * TYPES
 */

export interface ScenarioRequestContext {
  scenarioRequestLogs: ScenarioRequestLog[];
  request: RequestValue;
  response: ResponseValue;
}

/*
 * HELPERS
 */

const md = new MarkdownIt({
  html: true
});

/*
 * SCENARIO RUNNER
 */

export class ScenarioRunner {
  private active = false;
  private expectationManager?: ExpectationManager;
  private scenarioConfig: ScenarioConfig;

  constructor(
    private config: Config,
    private logger: Logger,
    private scenario: Scenario
  ) {
    this.scenarioConfig = this.scenario.getConfig();
  }

  async start(state?: StateValue) {
    this.active = true;

    const { expectations, stateConfigs, onStart } = this.scenarioConfig;
    const defaultedState = createDefaultedState(state, stateConfigs);

    const expectationManager = new ExpectationManager(this.config, this.logger);
    expectationManager.addExpectations(expectations);
    this.expectationManager = expectationManager;

    if (onStart) {
      const runtimeScenario = new Scenario(this.getId());

      const ctx: OnStartScenarioContext = {
        globals: this.config.globals,
        scenario: runtimeScenario,
        state: defaultedState
      };

      onStart(ctx);

      const runtimeScenarioConfig = runtimeScenario.getConfig();
      expectationManager.addExpectations(runtimeScenarioConfig.expectations);
    }

    expectationManager.start(defaultedState);
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

    const { onBootstrap } = this.scenarioConfig;

    if (!onBootstrap) {
      return;
    }

    const ctx: OnBootstrapScenarioContext = {
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
      id: this.scenarioConfig.id,
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
    return this.scenarioConfig.id;
  }

  getDescription(): string {
    return this.scenarioConfig.description;
  }

  getFormattedDescription(): string {
    let description = this.getDescription().trim();
    if (typeof description === "string") {
      for (const [key, value] of Object.entries(this.config.globals)) {
        description = description.replace(`{{globals.${key}}}`, value);
      }

      description = md.render(description);
    }

    return description;
  }

  getTags(): string[] {
    return this.scenarioConfig.tags;
  }

  getVisibleStateParams(): StateConfig[] {
    return this.scenarioConfig.stateConfigs.filter(x => !x.schema.hidden);
  }

  getState(): StateValue {
    return this.expectationManager?.getState() ?? {};
  }

  isActive(): boolean {
    return this.active;
  }
}
