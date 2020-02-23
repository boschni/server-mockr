import { ControlServer } from "../control-server/ControlServer";
import { Config, createConfig, InitialConfig } from "./Config";
import { ExpectationConfigBuilder } from "./config-builders/expectation";
import { ScenarioConfigBuilder } from "./config-builders/scenario";
import { ContextMatcherInput } from "./Expectation";
import { ExpectationManager } from "./ExpectationManager";
import { Logger } from "./Logger";
import { RequestLogManager } from "./RequestLogManager";
import { ScenarioManager } from "./ScenarioManager";
import { ServerManager } from "./ServerManager";
import { StateValue } from "./Values";

/*
 * SERVER SETUP
 */

export class ServerMockr {
  private config: Config;
  private logger: Logger;
  private controlServer: ControlServer;
  private globalExpectationManager: ExpectationManager;
  private scenarioManager: ScenarioManager;
  private serverManager: ServerManager;
  private requestLogManager: RequestLogManager;

  constructor(config?: InitialConfig) {
    this.config = createConfig(config);

    this.logger = new Logger(this.config.logLevel);

    this.requestLogManager = new RequestLogManager(this.config);

    this.globalExpectationManager = new ExpectationManager(
      this.config,
      this.logger
    );

    this.scenarioManager = new ScenarioManager(this.config, this.logger);

    this.serverManager = new ServerManager(
      this.config,
      this.logger,
      this.requestLogManager,
      this.globalExpectationManager,
      this.scenarioManager
    );

    this.controlServer = new ControlServer(
      this.config,
      this.logger,
      this.requestLogManager,
      this.scenarioManager
    );
  }

  when(...matchers: ContextMatcherInput[]): ExpectationConfigBuilder {
    const builder = new ExpectationConfigBuilder(...matchers);
    this.globalExpectationManager.addExpectation(builder);
    return builder;
  }

  scenario(id: string) {
    const builder = new ScenarioConfigBuilder(id);
    this.scenarioManager.addScenario(builder);
    return builder;
  }

  addExpectation(builder: ExpectationConfigBuilder) {
    this.globalExpectationManager.addExpectation(builder);
  }

  addScenario(builder: ScenarioConfigBuilder) {
    this.scenarioManager.addScenario(builder);
  }

  startScenario(id: string, state?: StateValue) {
    this.scenarioManager.startScenario(id, state);
  }

  stopScenario(id: string) {
    this.scenarioManager.stopScenario(id);
  }

  start() {
    this.controlServer.start();
    // TEMP, multiple servers on different ports?
    this.serverManager.startServer(this.config.mockServerPort);
    this.globalExpectationManager.start();
    this.scenarioManager.start();
  }

  async stop() {
    this.globalExpectationManager.stop();
    this.scenarioManager.stop();
    await this.controlServer.stop();
    await this.serverManager.stop();
  }

  clear() {
    this.requestLogManager.clear();
    this.globalExpectationManager.clear();
    this.scenarioManager.clear();
  }
}
