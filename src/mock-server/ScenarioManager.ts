import { Config } from "./Config";
import { Logger } from "./Logger";
import { RequestLogger } from "./loggers/RequestLogger";
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
  requestLogger: RequestLogger;
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
    this.stopScenarioRunners();
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

    if (!this.config.multipleScenarioRunners) {
      this.stopScenarioRunners();
    }

    const runner = new ScenarioRunner(this.config, this.logger, scenario);
    this.scenarioRunners.push(runner);
    runner.start(params);

    return runner;
  }

  stopScenarioRunner(id?: number): void {
    const runner = this.getScenarioRunner(id);

    if (runner && runner.isActive()) {
      runner.stop();
    }
  }

  stopScenarioRunners(): void {
    for (const runner of this.scenarioRunners) {
      this.stopScenarioRunner(runner.getId());
    }
  }

  stopScenarioRunnersByScenarioId(scenarioId?: string): void {
    for (const runner of this.scenarioRunners) {
      if (runner.getScenarioId() === scenarioId) {
        this.stopScenarioRunner(runner.getId());
      }
    }
  }

  resetScenarioRunner(id: number) {
    const runner = this.getScenarioRunner(id);

    if (runner) {
      runner.stop();
      runner.start();
    }
  }

  getScenario(id: string): Scenario | undefined {
    return this.scenarios.find(x => x.getId() === id);
  }

  getScenarios(): Scenario[] {
    return this.scenarios;
  }

  getScenarioRunner(id?: number): ScenarioRunner | undefined {
    return this.scenarioRunners.find(x => x.getId() === id);
  }

  getScenarioRunners(): ScenarioRunner[] {
    return this.scenarioRunners;
  }

  getActiveScenarioRunners(): ScenarioRunner[] {
    return this.scenarioRunners.filter(x => x.isActive());
  }

  async onRequest(ctx: ScenarioManagerRequestContext): Promise<boolean> {
    if (!this.active) {
      return false;
    }

    for (const runner of this.getActiveScenarioRunners()) {
      const scenarioRequestContext: ScenarioRequestContext = {
        request: ctx.request,
        response: ctx.response,
        scenarioLogger: ctx.requestLogger.getScenarioLogger(runner)
      };

      const handled = await runner.onRequest(scenarioRequestContext);

      if (handled) {
        return true;
      }
    }

    return false;
  }
}
