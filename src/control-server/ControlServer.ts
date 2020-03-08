import bodyParser from "body-parser";
import ejs from "ejs";
import express, { Express, Request, Response } from "express";
import { Server } from "http";
import path from "path";

import { Config } from "../lib/Config";
import { Logger } from "../lib/Logger";
import { RequestLogManager } from "../lib/RequestLogManager";
import { Scenario } from "../lib/Scenario";
import { ScenarioManager } from "../lib/ScenarioManager";
import { ScenarioRunner } from "../lib/ScenarioRunner";
import {
  createResponseValue,
  incomingMessageToRequestValue,
  respondWithResponseValue
} from "../lib/valueHelpers";
import {
  ConfigDefinition,
  ConfigValue,
  QueryValue,
  StateDefinition,
  StateValue
} from "../lib/Values";

/*
 * TYPES
 */

interface ApiScenario {
  configDefinitions: ConfigDefinition[];
  description: string;
  id: string;
  runners: ApiScenarioRunner[];
  stateDefinitions: StateDefinition[];
  tags: string[];
}

interface ApiScenarioRunner {
  config: ConfigValue;
  id: string;
  scenarioId: string;
  state: StateValue;
}

/*
 * CONTROL SERVER
 */

export class ControlServer {
  private app: Express;
  private server?: Server;

  constructor(
    private config: Config,
    private logger: Logger,
    private requestLogManager: RequestLogManager,
    private scenarioManager: ScenarioManager
  ) {
    this.app = express();
    this.app.use("/static", express.static(path.join(__dirname, "static")));
    this.app.use(bodyParser.json());
    this.app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    this.app.get("/", this.handleGetRoot);
    this.app.get("/api/request-logs", this.handleGetRequestLogs);
    this.app.get("/api/scenarios", this.handleGetScenarios);
    this.app.get("/api/scenarios/:id", this.handleGetScenario);
    this.app.post("/api/scenarios/:id/start", this.handleGetStartScenario);
    this.app.post("/api/scenarios/:id/stop", this.handleGetStopScenario);
    this.app.post("/api/scenarios/:id/reset", this.handleGetResetScenario);
    this.app.get(
      "/api/scenarios/:id/bootstrap",
      this.handleGetBootstrapScenario
    );
    this.app.get(
      "/api/scenarios/:id/start-and-bootstrap",
      this.handleGetStartAndBootstrapScenario
    );

    this.app.get("/api/scenario-runners", this.handleGetScenarioRunners);
  }

  start() {
    this.server = this.app.listen(this.config.controlServerPort, () => {
      this.logger.log(
        "info",
        `server-mockr: Control server is running at http://localhost:${this.config.controlServerPort}/`
      );
    });
  }

  stop() {
    return new Promise(resolve => {
      if (this.server) {
        this.server.close(resolve);
      } else {
        resolve();
      }
    });
  }

  /**
   * This handler renders the UI
   */
  private handleGetRoot = async (_req: Request, res: Response) => {
    try {
      const scenarios = this.scenarioManager.getScenarioRunners();

      const data = {
        scenarioManager: this.scenarioManager,
        scenarios
      };

      const template = path.join(
        __dirname,
        "./templates/scenario-overview.ejs"
      );

      const page = await ejs.renderFile(template, data);
      res.send(page);
    } catch (e) {
      res.send(`server-mockr: ${e}`);
    }
  };

  /**
   * This handler lists all request logs.
   */
  private handleGetRequestLogs = async (_req: Request, res: Response) => {
    const logs = this.requestLogManager.getLogs();
    res.json(logs);
  };

  /**
   * This handler lists all available scenarios.
   */
  private handleGetScenarios = async (_req: Request, res: Response) => {
    const apiScenarios = this.scenarioManager
      .getScenarios()
      .map(scenario => this.scenarioToApiScenario(scenario));
    res.json(apiScenarios);
  };

  /**
   * This handler gets a specific scenarios.
   */
  private handleGetScenario = async (req: Request, res: Response) => {
    const { id } = req.params;

    const scenario = this.scenarioManager.getScenario(id);

    if (!scenario) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    const apiScenario = this.scenarioToApiScenario(scenario);

    res.json(apiScenario);
  };

  /**
   * This handler starts a specific scenario.
   */
  private handleGetStartScenario = async (req: Request, res: Response) => {
    const { id } = req.params;

    const request = incomingMessageToRequestValue(req);
    const config = this.queryParamToObject<ConfigValue>(
      "config",
      request.query
    );
    const state = this.queryParamToObject<StateValue>("state", request.query);
    const runner = this.scenarioManager.startScenario(id, { config, state });

    if (!runner) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    res.setHeader("Cache-Control", "no-cache");
    res.send({ scenarioId: id, runnerId: runner.getId(), state: "STARTED" });
  };

  /**
   * This handler stops a specific scenario.
   */
  private handleGetStopScenario = async (req: Request, res: Response) => {
    const { id } = req.params;

    const scenario = this.scenarioManager.getScenario(id);

    if (!scenario) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    this.scenarioManager.stopScenario(id);

    res.setHeader("Cache-Control", "no-cache");
    res.send("server-mockr: Scenario stopped");
  };

  /**
   * This handler reset a specific scenario.
   */
  private handleGetResetScenario = async (req: Request, res: Response) => {
    const { id } = req.params;

    const scenario = this.scenarioManager.getScenario(id);

    if (!scenario) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    this.scenarioManager.resetScenario(id);

    res.setHeader("Cache-Control", "no-cache");
    res.send("server-mockr: Scenario reset");
  };

  /**
   * This handler bootstraps a client for a specific scenario.
   */
  private handleGetBootstrapScenario = async (req: Request, res: Response) => {
    const { id } = req.params;

    const runner = this.scenarioManager.getScenarioRunner(id);

    if (!runner) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    const request = incomingMessageToRequestValue(req);
    const response = createResponseValue();

    response.headers["Cache-Control"] = "no-cache";
    response.body = "server-mockr: Scenario bootstrapped";

    await runner.bootstrap(request, response);
    await respondWithResponseValue(res, response);
  };

  /**
   * This handler starts a scenario and bootstraps a client for a specific scenario.
   */
  private handleGetStartAndBootstrapScenario = async (
    req: Request,
    res: Response
  ) => {
    const { id } = req.params;
    const request = incomingMessageToRequestValue(req);
    const config = this.queryParamToObject<ConfigValue>(
      "config",
      request.query
    );
    const state = this.queryParamToObject<StateValue>("state", request.query);
    const response = createResponseValue();

    const runner = this.scenarioManager.startScenario(id, {
      config,
      state
    });

    if (!runner) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    response.headers["Cache-Control"] = "no-cache";
    response.body = "server-mockr: Scenario bootstrapped";

    await runner.bootstrap(request, response);
    await respondWithResponseValue(res, response);
  };

  /**
   * This handler lists all scenarios runners.
   */
  private handleGetScenarioRunners = async (_req: Request, res: Response) => {
    const apiScenarios = this.scenarioManager
      .getScenarioRunners()
      .map(runner => this.scenarioRunnerToApiScenarioRunner(runner));
    res.json(apiScenarios);
  };

  private queryParamToObject = <T extends object>(
    param: string,
    query: QueryValue
  ): T => {
    const obj: any = {};

    for (const [key, value] of Object.entries(query)) {
      const match = key.match(`${param}\\[([a-zA-Z0-9]+)\\]`);
      if (match) {
        obj[match[1]] = value;
      }
    }

    return obj;
  };

  private scenarioToApiScenario(scenario: Scenario): ApiScenario {
    const id = scenario.getId();
    const allRunners = this.scenarioManager.getScenarioRunners();
    const runners = allRunners
      .filter(x => x.getScenarioId() === id)
      .map(x => this.scenarioRunnerToApiScenarioRunner(x));
    return {
      configDefinitions: scenario.getVisibleConfigParams(),
      description: scenario.getFormattedDescription(),
      id,
      runners,
      stateDefinitions: scenario.getVisibleStateParams(),
      tags: scenario.getTags()
    };
  }

  private scenarioRunnerToApiScenarioRunner(
    runner: ScenarioRunner
  ): ApiScenarioRunner {
    return {
      id: runner.getId(),
      scenarioId: runner.getScenarioId(),
      config: runner.getConfig(),
      state: runner.getState()
    };
  }
}
