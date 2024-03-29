import bodyParser from "body-parser";
import express, { Express, Request, Response } from "express";
import { Server } from "http";
import path from "path";

import { Config } from "../mock-server/Config";
import { Logger } from "../mock-server/Logger";
import { HAR } from "../mock-server/request-logging/HAR";
import { RequestLogManager } from "../mock-server/request-logging/RequestLogManager";
import { Scenario } from "../mock-server/Scenario";
import { ScenarioManager } from "../mock-server/ScenarioManager";
import { ScenarioRunner } from "../mock-server/ScenarioRunner";
import {
  createResponseValue,
  incomingMessageToRequestValue,
  respondWithResponseValue,
} from "../mock-server/valueHelpers";
import {
  ConfigDefinition,
  ConfigValue,
  QueryValue,
  StateDefinition,
  StateValue,
} from "../mock-server/Values";

/*
 * TYPES
 */

type ApiScenarioRunnerStatus = "STARTED" | "STOPPED";

export interface ApiScenario {
  configDefinitions: ConfigDefinition[];
  description: string;
  id: string;
  runners: ApiScenarioRunner[];
  stateDefinitions: StateDefinition[];
  tags: string[];
}

export interface ApiScenarioRunner {
  config: ConfigValue;
  id: number;
  scenarioId: string;
  startedDateTime?: string;
  state: StateValue;
  status: ApiScenarioRunnerStatus;
}

export interface ApiGetScenarioRunnerHARSuccessResponse extends HAR {}

export interface ApiCreateScenarioRunnerSuccessResponse
  extends ApiScenarioRunner {}

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
        extended: true,
      })
    );
    this.app.get("/", this.handleGetRoot);
    this.app.get("/api/logging/har", this.handleGetLoggingHAR);

    // Scenarios
    this.app.get("/api/scenarios", this.handleGetScenarios);
    this.app.get("/api/scenarios/:id", this.handleGetScenario);
    this.app.post(
      "/api/scenarios/:id/scenario-runners",
      this.handlePostScenarioScenarioRunners
    );
    this.app.get(
      "/api/scenarios/:id/scenario-runners/create-and-bootstrap",
      this.handleGetScenarioScenarioRunnersCreateAndBootstrap
    );
    this.app.post(
      "/api/scenarios/:id/scenario-runners/stop",
      this.handlePostStopScenarioScenarioRunners
    );

    // Scenario runners
    this.app.get("/api/scenario-runners", this.handleGetScenarioRunners);
    this.app.get(
      "/api/scenario-runners/:id/bootstrap",
      this.handleGetBootstrapScenarioRunner
    );
    this.app.post(
      "/api/scenario-runners/:id/stop",
      this.handlePostStopScenarioRunner
    );
    this.app.post(
      "/api/scenario-runners/:id/reset",
      this.handlePostResetScenarioRunner
    );
    this.app.get(
      "/api/scenario-runners/:id/har",
      this.handleGetScenarioRunnerHAR
    );
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
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(resolve);
      } else {
        resolve(undefined);
      }
    });
  }

  /**
   * This handler renders the UI
   */
  private handleGetRoot = async (_req: Request, res: Response) => {
    res.send(`<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Server Mockr</title>
        </head>
        <body>
          <div id="app"></div>
          <script type="text/javascript" src="/static/main.js"></script>
        </body>
      </html>`);
  };

  /**
   * This handler lists all request logs.
   */
  private handleGetLoggingHAR = async (_req: Request, res: Response) => {
    const har = this.requestLogManager.getHAR();
    res.json(har);
  };

  /**
   * This handler lists all available scenarios.
   */
  private handleGetScenarios = async (_req: Request, res: Response) => {
    const apiScenarios = this.scenarioManager
      .getScenarios()
      .map((scenario) => this.scenarioToApiScenario(scenario));
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
   * This handler creates and starts a scenario runner.
   */
  private handlePostScenarioScenarioRunners = async (
    req: Request,
    res: Response
  ) => {
    const request = incomingMessageToRequestValue(req);

    const scenarioId = req.params.id;
    let config: ConfigValue;
    let state: StateValue;

    if (req.headers["content-type"] === "application/json") {
      config = req.body.config;
      state = req.body.state;
    } else {
      config = this.queryParamToObject<ConfigValue>("config", request.query);
      state = this.queryParamToObject<StateValue>("state", request.query);
    }

    const runner = this.scenarioManager.createScenarioRunner(scenarioId, {
      config,
      state,
    });

    if (!runner) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    res.send(this.scenarioRunnerToApiScenarioRunner(runner));
  };

  /**
   * This handler stops all scenario runner.
   */
  private handlePostStopScenarioScenarioRunners = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const scenario = this.scenarioManager.getScenario(id);

    if (!scenario) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    this.scenarioManager.stopScenarioRunnersByScenarioId(id);

    res.send("server-mockr: Scenario runners stopped");
  };

  /**
   * This handler bootstraps a client for a specific scenario.
   */
  private handleGetBootstrapScenarioRunner = async (
    req: Request,
    res: Response
  ) => {
    const id = Number(req.params.id);

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
  private handleGetScenarioScenarioRunnersCreateAndBootstrap = async (
    req: Request,
    res: Response
  ) => {
    const scenarioId = req.params.id;
    const request = incomingMessageToRequestValue(req);
    const config = this.queryParamToObject<ConfigValue>(
      "config",
      request.query
    );
    const state = this.queryParamToObject<StateValue>("state", request.query);
    const response = createResponseValue();

    const runner = this.scenarioManager.createScenarioRunner(scenarioId, {
      config,
      state,
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
      .map((runner) => this.scenarioRunnerToApiScenarioRunner(runner));
    res.json(apiScenarios);
  };

  /**
   * This handler stops a specific scenario runner.
   */
  private handlePostStopScenarioRunner = async (
    req: Request,
    res: Response
  ) => {
    const id = Number(req.params.id);
    const scenario = this.scenarioManager.getScenarioRunner(id);

    if (!scenario) {
      res.status(404).send("server-mockr: Scenario runner not found");
      return;
    }

    this.scenarioManager.stopScenarioRunner(id);

    res.send("server-mockr: Scenario runner stopped");
  };

  /**
   * This handler reset a specific scenario runner.
   */
  private handlePostResetScenarioRunner = async (
    req: Request,
    res: Response
  ) => {
    const id = Number(req.params.id);
    const scenario = this.scenarioManager.getScenarioRunner(id);

    if (!scenario) {
      res.status(404).send("server-mockr: Scenario runner not found");
      return;
    }

    this.scenarioManager.resetScenarioRunner(id);

    res.send("server-mockr: Scenario runner reset");
  };

  /**
   * This handler lists all request logs for a specific scenario runner.
   */
  private handleGetScenarioRunnerHAR = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const har = this.requestLogManager.getHARForScenarioRunner(id);
    res.json(har);
  };

  private queryParamToObject = <T extends object>(
    param: string,
    query: QueryValue
  ): T => {
    const obj: Record<string, string | string[] | undefined> = {};

    for (const [key, value] of Object.entries(query)) {
      const match = key.match(`${param}\\[([a-zA-Z0-9]+)\\]`);
      if (match) {
        obj[match[1]] = value;
      }
    }

    return obj as T;
  };

  private scenarioToApiScenario(scenario: Scenario): ApiScenario {
    const id = scenario.getId();
    const allRunners = this.scenarioManager.getActiveScenarioRunners();
    const runners = allRunners
      .filter((x) => x.getScenarioId() === id)
      .map((x) => this.scenarioRunnerToApiScenarioRunner(x));
    return {
      configDefinitions: scenario.getVisibleConfigParams(),
      description: scenario.getFormattedDescription(),
      id,
      runners,
      stateDefinitions: scenario.getVisibleStateParams(),
      tags: scenario.getTags(),
    };
  }

  private scenarioRunnerToApiScenarioRunner(
    runner: ScenarioRunner
  ): ApiScenarioRunner {
    return {
      config: runner.getConfig(),
      id: runner.getId(),
      scenarioId: runner.getScenarioId(),
      startedDateTime: runner.getStartedDateTime(),
      state: runner.getState(),
      status: runner.isActive() ? "STARTED" : "STOPPED",
    };
  }
}
