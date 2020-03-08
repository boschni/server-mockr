import { Config } from "./Config";
import { Logger } from "./Logger";
import { ScenarioRequestLog } from "./RequestLogManager";
import { Scenario } from "./Scenario";
import {
  ScenarioRequestContext,
  ScenarioRunner,
  StartScenarioParams
} from "./ScenarioRunner";
import { RequestValue, ResponseValue } from "./Values";

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
  private scenarios: Scenario[] = [];
  private scenarioRunners: ScenarioRunner[] = [];

  constructor(private config: Config, private logger: Logger) {}

  start(): void {
    this.active = true;
  }

  stop(): void {
    this.active = false;
    this.stopAllScenarios();
  }

  clear(): void {
    this.scenarios = [];
    this.scenarioRunners = [];
  }

  addScenario(scenario: Scenario): void {
    this.scenarios.push(scenario);
  }

  startScenario(
    id: string,
    params?: StartScenarioParams
  ): ScenarioRunner | undefined {
    const scenario = this.getScenario(id);

    if (!scenario) {
      return;
    }

    if (!this.config.multipleActiveScenarios) {
      this.stopAllScenarios();
    }

    const runner = new ScenarioRunner(this.config, this.logger, scenario);

    this.scenarioRunners.push(runner);

    runner.start(params);

    return runner;
  }

  stopScenario(id?: string): void {
    for (const runner of this.scenarioRunners) {
      if (runner.getScenarioId() === id) {
        this.stopScenarioRunner(runner.getId());
      }
    }
  }

  stopAllScenarios(): void {
    this.stopAllScenarioRunners();
  }

  stopScenarioRunner(id?: string): void {
    const runner = this.getScenarioRunner(id);

    if (runner && runner.isActive()) {
      runner.stop();
    }

    this.scenarioRunners = this.scenarioRunners.filter(x => x.isActive());
  }

  stopAllScenarioRunners(): void {
    for (const runner of this.scenarioRunners) {
      this.stopScenarioRunner(runner.getId());
    }
  }

  resetScenario(id: string) {
    this.stopScenario(id);
    this.startScenario(id);
  }

  getScenarioRunner(id?: string): ScenarioRunner | undefined {
    return this.scenarioRunners.find(x => x.getId() === id);
  }

  getScenarioRunners(): ScenarioRunner[] {
    return this.scenarioRunners;
  }

  getScenario(id: string): Scenario | undefined {
    return this.scenarios.find(x => x.getId() === id);
  }

  getScenarios(): Scenario[] {
    return this.scenarios;
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
