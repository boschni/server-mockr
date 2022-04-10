import bodyParser from "body-parser";
import express from "express";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import multer from "multer";

import { Config } from "./Config";
import {
  ExpectationManager,
  ExpectationManagerRequestContext,
} from "./ExpectationManager";
import { Logger } from "./Logger";
import { RequestLogger } from "./request-logging/RequestLogger";
import { RequestLogManager } from "./request-logging/RequestLogManager";
import {
  ScenarioManager,
  ScenarioManagerRequestContext,
} from "./ScenarioManager";
import {
  createNotFoundResponseValue,
  createResponseValue,
  incomingMessageToRequestValue,
  respondWithResponseValue,
} from "./valueHelpers";
import { ResponseValue } from "./Values";

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

    // Parses "application/json" requests (req.body)
    app.use(bodyParser.json());

    // Parses "application/x-www-form-urlencoded" requests (req.body)
    app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );

    // Parses "multipart/form-data" requests (req.body + req.files)
    const upload = multer({ storage: multer.memoryStorage() });
    app.use(upload.any());

    // Parses other requests as text (req.body)
    app.use(
      bodyParser.text({
        type: (req) =>
          req.headers["content-type"]
            ? !req.headers["content-type"].startsWith("multipart/form-data")
            : true,
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
      const promise = new Promise((resolve) => {
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

    const globalExpectationManagerRequestCtx: ExpectationManagerRequestContext =
      {
        request,
        requestLogger,
        response,
      };

    let handled = await this.globalExpectationManager.onRequest(
      globalExpectationManagerRequestCtx
    );

    if (!handled) {
      const scenarioManagerRequestCtx: ScenarioManagerRequestContext = {
        request,
        requestLogger,
        response,
      };

      handled = await this.scenarioManager.onRequest(scenarioManagerRequestCtx);
    }

    const finalResponse: ResponseValue = handled
      ? response
      : createNotFoundResponseValue();

    await respondWithResponseValue(res, finalResponse);

    requestLogger.logResponse(finalResponse);

    this.requestLogManager.log(requestLogger);
  };
}
