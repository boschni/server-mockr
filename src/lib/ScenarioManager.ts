import { Config } from "./Config";
import { ScenarioRequestLog } from "./RequestLogManager";
import { Scenario, ScenarioRequestContext } from "./Scenario";
import { ScenarioDefinition } from "./ScenarioDefinition";
import { hasResponse } from "./valueHelpers";
import { ConfigValue, RequestValue, ResponseValue, StateValue } from "./Values";

export interface ScenarioManagerRequestContext {
  scenarioRequestLogs: ScenarioRequestLog[];
  request: RequestValue;
  response: ResponseValue;
}

export class ScenarioManager {
  protected config: Config;
  private activeScenarios: Scenario[] = [];
  private scenarioDefinitions: ScenarioDefinition[] = [];

  constructor(config: Config, defs: ScenarioDefinition[]) {
    this.config = config;
    this.scenarioDefinitions = defs;
  }

  public addScenario(def: ScenarioDefinition) {
    this.scenarioDefinitions.push(def);
  }

  public async startScenario(
    id: string,
    config?: ConfigValue,
    state?: StateValue,
    request?: RequestValue,
    response?: ResponseValue
  ) {
    const activeScenario = this.activeScenarios.find(x => x.id === id);

    if (activeScenario) {
      this.stopScenario(id);
    }

    const def = this.scenarioDefinitions.find(x => x.id === id);

    if (!def) {
      return;
    }

    const scenario = new Scenario(this.config, def);
    this.activeScenarios.push(scenario);

    return scenario.start(config, state, request, response);
  }

  public stopScenario(id: string) {
    const scenario = this.activeScenarios.find(x => x.id === id);

    if (!scenario) {
      return;
    }

    scenario.stop();

    this.activeScenarios = this.activeScenarios.filter(x => x.id !== id);
  }

  public getScenarios() {
    return this.scenarioDefinitions;
  }

  public getActiveScenarios() {
    return this.activeScenarios;
  }

  public getScenario(id: string) {
    return this.scenarioDefinitions.find(x => x.id === id);
  }

  public hasScenario(id: string) {
    return this.scenarioDefinitions.some(x => x.id === id);
  }

  public async onRequest(ctx: ScenarioManagerRequestContext): Promise<void> {
    for (const scenario of this.activeScenarios) {
      const scenarioRequestLog: ScenarioRequestLog = {
        expectations: [],
        id: scenario.id
      };

      ctx.scenarioRequestLogs.push(scenarioRequestLog);

      const scenarioRequestContext: ScenarioRequestContext = {
        request: ctx.request,
        response: ctx.response,
        scenarioRequestLog
      };

      await scenario.onRequest(scenarioRequestContext);

      if (hasResponse(ctx.response)) {
        return;
      }
    }
  }
}
