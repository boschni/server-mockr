import { Config } from "./Config";
import { ScenarioConfigBuilder } from "./config-builders/scenario";
import { Logger } from "./Logger";
import { ScenarioRequestLog } from "./RequestLogManager";
import { Scenario, ScenarioRequestContext } from "./Scenario";
import { RequestValue, ResponseValue, StateValue } from "./Values";

/*
 * TYPES
 */

export interface ScenarioManagerRequestContext {
  scenarioRequestLogs: ScenarioRequestLog[];
  request: RequestValue;
  response: ResponseValue;
}

/*
 * MANAGER
 */

export class ScenarioManager {
  private scenarios: Scenario[] = [];
  private active = false;

  constructor(private config: Config, private logger: Logger) {}

  start() {
    this.active = true;
  }

  stop() {
    this.active = false;
    this.stopScenarios();
  }

  clear() {
    this.scenarios = [];
  }

  addScenario(builder: ScenarioConfigBuilder) {
    const scenarioConfig = builder.getConfig();
    const scenario = new Scenario(this.config, this.logger, scenarioConfig);
    this.scenarios.push(scenario);
  }

  async startScenario(id: string, state?: StateValue) {
    const scenario = this.getScenario(id);

    if (!scenario) {
      return;
    }

    if (!this.config.multipleActiveScenarios) {
      this.stopScenarios();
    }

    if (scenario.isActive()) {
      scenario.stop();
    }

    return scenario.start(state);
  }

  stopScenario(id: string) {
    const scenario = this.getScenario(id);
    if (scenario && scenario.isActive()) {
      scenario.stop();
    }
  }

  stopScenarios() {
    for (const scenario of this.scenarios) {
      scenario.stop();
    }
  }

  resetScenario(id: string) {
    this.stopScenario(id);
    this.startScenario(id);
  }

  getScenarios() {
    return this.scenarios;
  }

  getScenario(id: string) {
    return this.scenarios.find(x => x.getId() === id);
  }

  async onRequest(ctx: ScenarioManagerRequestContext): Promise<boolean> {
    if (!this.active) {
      return false;
    }

    for (const scenario of this.scenarios) {
      const scenarioRequestContext: ScenarioRequestContext = {
        request: ctx.request,
        response: ctx.response,
        scenarioRequestLogs: ctx.scenarioRequestLogs
      };

      const handled = await scenario.onRequest(scenarioRequestContext);

      if (handled) {
        return true;
      }
    }

    return false;
  }
}
