import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import ejs from "ejs";
import express, { Express, Request, Response } from "express";
import { Server } from "http";
import MarkdownIt from "markdown-it";
import path from "path";

import { Config } from "../lib/Config";
import { RequestLogManager } from "../lib/RequestLogManager";
import { ScenarioManager } from "../lib/ScenarioManager";
import {
  createResponseValue,
  hasResponse,
  incomingMessageToRequestValue,
  queryParamToObject,
  respondWithResponseValue
} from "../lib/valueHelpers";
import { ConfigValue, StateValue } from "../lib/Values";

/*
 * CONTROL SERVER
 */

export class ControlServer {
  private config: Config;
  private app: Express;
  private requestLogManager: RequestLogManager;
  private scenarioManager: ScenarioManager;
  private server?: Server;

  constructor(
    config: Config,
    requestLogManager: RequestLogManager,
    scenarioManager: ScenarioManager
  ) {
    this.config = config;
    this.requestLogManager = requestLogManager;
    this.scenarioManager = scenarioManager;
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
  }

  public start() {
    this.server = this.app.listen(this.config.controlServerPort, () => {
      // tslint:disable-next-line: no-console
      console.log(
        `server-mockr: Control server is running at http://localhost:${this.config.controlServerPort}/`
      );
    });
  }

  public stop() {
    if (this.server) {
      this.server.close();
    }
  }

  /**
   * This handler renders the UI
   */
  private handleGetRoot = async (_req: Request, res: Response) => {
    try {
      const scenarios = this.scenarioManager.getScenarios();

      const md = new MarkdownIt({
        html: true
      });

      const formattedScenarios = scenarios.map(x => {
        if (typeof x.description === "string") {
          let description = x.description.trim();

          for (const [key, value] of Object.entries(this.config.globals)) {
            description = description.replace(`{{globals.${key}}}`, value);
          }

          description = md.render(description);

          return { ...x, description };
        }
        return x;
      });

      const data = { scenarios: formattedScenarios };
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
    if (!this.scenarioManager.hasScenario(req.params.id)) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    const scenario = this.scenarioManager.getScenario(req.params.id);
    res.json(scenario);
  };

  /**
   * This handler starts a specific scenario.
   */
  private handleGetStartScenario = async (req: Request, res: Response) => {
    if (!this.scenarioManager.hasScenario(req.params.id)) {
      res.status(404).send("server-mockr: Scenario not found");
      return;
    }

    const id = req.params.id;
    const request = incomingMessageToRequestValue(req);
    const response = createResponseValue();
    const config = queryParamToObject<ConfigValue>("config", request.query);
    const state = queryParamToObject<StateValue>("state", request.query);

    await this.scenarioManager.startScenario(
      id,
      config,
      state,
      request,
      response
    );

    res.setHeader("Cache-Control", "no-cache");

    if (hasResponse(response)) {
      await respondWithResponseValue(res, response);
    } else {
      res.send("server-mockr: Scenario started");
    }
  };
}