import bodyParser from "body-parser";
import express from "express";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";

import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext
} from "./ExpectationManager";
import { Logger } from "./Logger";
import { RequestLogger } from "./request-logging/RequestLogger";
import { RequestLogManager } from "./request-logging/RequestLogManager";
import {
  ScenarioManager,
  ScenarioManagerRequestContext
} from "./ScenarioManager";
import {
  createResponseValue,
  incomingMessageToRequestValue,
  respondWithNotFound,
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
    const requestLogger = new RequestLogger(request);

    const globalExpectationManagerRequestCtx: ExpectationManagerRequestContext = {
      request,
      requestLogger,
      response
    };

    let handled = await this.globalExpectationManager.onRequest(
      globalExpectationManagerRequestCtx
    );

    if (!handled) {
      const scenarioManagerRequestCtx: ScenarioManagerRequestContext = {
        request,
        requestLogger,
        response
      };

      handled = await this.scenarioManager.onRequest(scenarioManagerRequestCtx);
    }

    if (!handled) {
      await respondWithNotFound(res);
      return;
    }

    await respondWithResponseValue(res, response);

    requestLogger.logResponse(response);

    this.requestLogManager.log(requestLogger);
  };
}
