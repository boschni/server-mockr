import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";

import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext
} from "./ExpectationManager";
import { RequestLogManager } from "./RequestLogManager";
import {
  ScenarioManager,
  ScenarioManagerRequestContext
} from "./ScenarioManager";
import {
  createResponseValue,
  hasResponse,
  incomingMessageToRequestValue,
  respondWithResponseValue
} from "./valueHelpers";

export class ServerManager {
  protected config: Config;
  private servers: Server[] = [];
  private requestLogManager: RequestLogManager;
  private globalExpectationManager: ExpectationManager;
  private scenarioManager: ScenarioManager;

  constructor(
    config: Config,
    requestLogManager: RequestLogManager,
    globalExpectationManager: ExpectationManager,
    scenarioManager: ScenarioManager
  ) {
    this.config = config;
    this.requestLogManager = requestLogManager;
    this.globalExpectationManager = globalExpectationManager;
    this.scenarioManager = scenarioManager;
  }

  public startServer(port: number) {
    const app = express();
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );
    app.use(this.onRequest);

    const server = createServer(app);
    server.listen(port);

    // tslint:disable-next-line: no-console
    console.log(
      `server-mockr: Mocked server is running at http://localhost:${port}/`
    );

    this.servers.push(server);
  }

  public stop() {
    for (const server of this.servers) {
      server.close();
    }
  }

  private onRequest = async (req: IncomingMessage, res: ServerResponse) => {
    const request = incomingMessageToRequestValue(req);
    const response = createResponseValue();
    const log = this.requestLogManager.log(request);

    const globalExpectationManagerRequestCtx: ExpectationManagerRequestContext = {
      expectationRequestLogs: log.expectations,
      request,
      response
    };

    await this.globalExpectationManager.onRequest(
      globalExpectationManagerRequestCtx
    );

    if (!hasResponse(response)) {
      const scenarioManagerRequestCtx: ScenarioManagerRequestContext = {
        request,
        response,
        scenarioRequestLogs: log.scenarios
      };

      await this.scenarioManager.onRequest(scenarioManagerRequestCtx);
    }

    if (hasResponse(response)) {
      log.response = response;
    }

    await respondWithResponseValue(res, response);
  };
}
