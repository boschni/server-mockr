import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import ejs from "ejs";
import express, { Express, Request, Response } from "express";
import { Server } from "http";
import path from "path";

import { Config } from "../lib/Config";
import { Logger } from "../lib/Logger";
import { RequestLogManager } from "../lib/RequestLogManager";
import { ScenarioManager } from "../lib/ScenarioManager";
import {
  createResponseValue,
  incomingMessageToRequestValue,
  queryParamToObject,
  respondWithResponseValue
} from "../lib/valueHelpers";
import { StateValue } from "../lib/Values";

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
    this.app.use(cookieParser());
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
    this.app.get("/api/scenarios/:id/start", this.handleGetStartScenario);
    this.app.get("/api/scenarios/:id/stop", this.handleGetStopScenario);
    this.app.get("/api/scenarios/:id/reset", this.handleGetResetScenario);
    this.app.get(
      "/api/scenarios/:id/bootstrap",
      this.handleGetBootstrapScenario
    );
    this.app.get(
      "/api/scenarios/:id/start-and-bootstrap",
      this.handleGetStartAndBootstrapScenario
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
      const scenarios = this.scenarioManager.getScenarios();

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
    const scenarios = this.scenarioManager.getScenarios();

    const json = JSON.parse(
      JSON.stringify(scenarios, (_, val) =>
        typeof val === "function" ? val.toString() : val
      )
    );

    res.json(json);
  };

  /**
   * This handler gets a specific scenarios.
   */
  private handleGetScenario = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!this.scenarioManager.getScenario(id)) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    const scenario = this.scenarioManager.getScenario(id);

    res.json(scenario);
  };

  /**
   * This handler starts a specific scenario.
   */
  private handleGetStartScenario = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!this.scenarioManager.getScenario(id)) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    const request = incomingMessageToRequestValue(req);
    const state = queryParamToObject<StateValue>("state", request.query);

    await this.scenarioManager.startScenario(id, state);

    res.setHeader("Cache-Control", "no-cache");
    res.send("server-mockr: Scenario started");
  };

  /**
   * This handler stops a specific scenario.
   */
  private handleGetStopScenario = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!this.scenarioManager.getScenario(id)) {
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

    if (!this.scenarioManager.getScenario(id)) {
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

    const scenario = this.scenarioManager.getScenario(id);

    if (!scenario) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    const request = incomingMessageToRequestValue(req);
    const response = createResponseValue();

    response.headers["Cache-Control"] = "no-cache";
    response.body = "server-mockr: Scenario bootstrapped";

    await scenario.bootstrap(request, response);
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

    const scenario = this.scenarioManager.getScenario(id);

    if (!scenario) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    const request = incomingMessageToRequestValue(req);
    const state = queryParamToObject<StateValue>("state", request.query);
    const response = createResponseValue();

    await this.scenarioManager.startScenario(id, state);

    response.headers["Cache-Control"] = "no-cache";
    response.body = "server-mockr: Scenario bootstrapped";

    await scenario.bootstrap(request, response);
    await respondWithResponseValue(res, response);
  };
}
