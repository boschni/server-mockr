import { Config } from "./Config";
import { Logger } from "./Logger";
import { ScenarioRequestLog } from "./RequestLogManager";
import { Scenario } from "./Scenario";
import { ScenarioRequestContext, ScenarioRunner } from "./ScenarioRunner";
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
  private active = false;
  private scenarioRunners: ScenarioRunner[] = [];

  constructor(private config: Config, private logger: Logger) {}

  start() {
    this.active = true;
  }

  stop() {
    this.active = false;
    this.stopScenarios();
  }

  clear() {
    this.scenarioRunners = [];
  }

  addScenario(scenario: Scenario) {
    const runner = new ScenarioRunner(this.config, this.logger, scenario);
    this.scenarioRunners.push(runner);
  }

  async startScenario(id: string, state?: StateValue) {
    const runner = this.getScenarioRunner(id);

    if (!runner) {
      return;
    }

    if (!this.config.multipleActiveScenarios) {
      this.stopScenarios();
    }

    if (runner.isActive()) {
      runner.stop();
    }

    return runner.start(state);
  }

  stopScenario(id: string) {
    const runner = this.getScenarioRunner(id);

    if (runner && runner.isActive()) {
      runner.stop();
    }
  }

  stopScenarios() {
    for (const runner of this.scenarioRunners) {
      runner.stop();
    }
  }

  resetScenario(id: string) {
    this.stopScenario(id);
    this.startScenario(id);
  }

  getScenarioRunners() {
    return this.scenarioRunners;
  }

  getScenarioRunner(id: string) {
    return this.scenarioRunners.find(x => x.getId() === id);
  }

  async onRequest(ctx: ScenarioManagerRequestContext): Promise<boolean> {
    if (!this.active) {
      return false;
    }

    for (const runner of this.scenarioRunners) {
      const scenarioRequestContext: ScenarioRequestContext = {
        request: ctx.request,
        response: ctx.response,
        scenarioRequestLogs: ctx.scenarioRequestLogs
      };

      const handled = await runner.onRequest(scenarioRequestContext);

      if (handled) {
        return true;
      }
    }

    return false;
  }
}
