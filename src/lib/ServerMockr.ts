import { ControlServer } from "../control-server/ControlServer";
import { Config, createConfig, InitialConfig } from "./Config";
import { ExpectationDefinition } from "./ExpectationDefinition";
import { ExpectationManager } from "./ExpectationManager";
import { RequestLogManager } from "./RequestLogManager";
import { ScenarioDefinition } from "./ScenarioDefinition";
import { ScenarioManager } from "./ScenarioManager";
import { ServerManager } from "./ServerManager";
import { ConfigValue, StateValue } from "./Values";

/*
 * SERVER SETUP
 */

export class ServerMockr {
  private config: Config;
  private controlServer: ControlServer;
  private globalExpectationManager: ExpectationManager;
  private scenarioManager: ScenarioManager;
  private serverManager: ServerManager;
  private requestLogManager: RequestLogManager;

  constructor(config?: InitialConfig) {
    this.config = createConfig(config);

    this.requestLogManager = new RequestLogManager(this.config);

    this.globalExpectationManager = new ExpectationManager(
      this.config,
      this.config.expectations
    );

    this.scenarioManager = new ScenarioManager(
      this.config,
      this.config.scenarios
    );

    this.serverManager = new ServerManager(
      this.config,
      this.requestLogManager,
      this.globalExpectationManager,
      this.scenarioManager
    );

    this.controlServer = new ControlServer(
      this.config,
      this.requestLogManager,
      this.scenarioManager
    );
  }

  public addExpectation(def: ExpectationDefinition) {
    this.globalExpectationManager.addExpectation(def);
  }

  public addScenario(def: ScenarioDefinition) {
    this.scenarioManager.addScenario(def);
  }

  public startScenario(id: string, config?: ConfigValue, state?: StateValue) {
    this.scenarioManager.startScenario(id, config, state);
  }

  public start() {
    this.controlServer.start();
    // TEMP
    this.serverManager.startServer(this.config.mockServerPort);
  }

  public stop() {
    this.controlServer.stop();
    this.serverManager.stop();
  }
}
