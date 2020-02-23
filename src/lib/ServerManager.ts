import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";

import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext
} from "./ExpectationManager";
import { Logger } from "./Logger";
import { RequestLogManager } from "./RequestLogManager";
import {
  ScenarioManager,
  ScenarioManagerRequestContext
} from "./ScenarioManager";
import {
  createResponseValue,
  incomingMessageToRequestValue,
  respondWithResponseValue
} from "./valueHelpers";

/*
 * SERVER MANAGER
 */

export class ServerManager {
  private servers: Server[] = [];

  constructor(
    protected config: Config,
    private logger: Logger,
    private requestLogManager: RequestLogManager,
    private globalExpectationManager: ExpectationManager,
    private scenarioManager: ScenarioManager
  ) {}

  startServer(port: number) {
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

    this.logger.log(
      "info",
      `server-mockr: Mocked server is running at http://localhost:${port}/`
    );

    this.servers.push(server);
  }

  stop() {
    const promises = [];

    for (const server of this.servers) {
      const promise = new Promise(resolve => {
        server.close(resolve);
      });
      promises.push(promise);
    }

    return Promise.all(promises);
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

    let handled = await this.globalExpectationManager.onRequest(
      globalExpectationManagerRequestCtx
    );

    if (!handled) {
      const scenarioManagerRequestCtx: ScenarioManagerRequestContext = {
        request,
        response,
        scenarioRequestLogs: log.scenarios
      };

      handled = await this.scenarioManager.onRequest(scenarioManagerRequestCtx);
    }

    if (handled) {
      log.response = response;
    }

    await respondWithResponseValue(res, response);
  };
}
