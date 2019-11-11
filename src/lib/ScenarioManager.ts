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
    state?: StateValue
  ) {
    const activeScenario = this.getActiveScenario(id);

    if (activeScenario) {
      this.stopScenario(activeScenario.id);
    }

    if (!this.config.multipleActiveScenarios) {
      this.stopAllScenarios();
    }

    const def = this.scenarioDefinitions.find(x => x.id === id);

    if (!def) {
      return;
    }

    const scenario = new Scenario(this.config, def);
    this.activeScenarios.push(scenario);

    return scenario.start(config, state);
  }

  public stopScenario(id: string) {
    const scenario = this.getActiveScenario(id);

    if (!scenario) {
      return;
    }

    scenario.stop();

    this.activeScenarios = this.activeScenarios.filter(x => x.id !== id);
  }

  public stopAllScenarios() {
    for (const scenario of this.activeScenarios) {
      this.stopScenario(scenario.id);
    }
  }

  public async bootstrapScenario(
    id: string,
    request: RequestValue,
    response: ResponseValue
  ) {
    const activeScenario = this.getActiveScenario(id);

    if (activeScenario) {
      return activeScenario.bootstrap(request, response);
    }
  }

  public resetScenario(id: string) {
    this.stopScenario(id);
    this.startScenario(id);
  }

  public getScenarios() {
    return this.scenarioDefinitions;
  }

  public getActiveScenario(id: string) {
    return this.activeScenarios.find(x => x.id === id);
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

  public isScenarioActive(id: string) {
    return this.activeScenarios.some(x => x.id === id);
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
