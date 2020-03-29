import { clone } from "../utils/clone";
import { isPassed } from "../value-matchers/MatchFn";
import { RequestValue, ResponseValue } from "../Values";
import {
  HARCookie,
  HARHeader,
  HARLogEntry,
  HARQuery,
  HARRequest,
  HARRequestPostData,
  HARRequestPostDataParam,
  HARResponse,
  HARResponseContent,
  HARTimings
} from "./HAR";
import { RequestExpectationLogger } from "./RequestExpectationLogger";
import { RequestScenarioLogger } from "./RequestScenarioLogger";

/*
 * LOGGER
 */

export class RequestLogger {
  private static id = 0;

  private id: number;
  private startedDateTime: string;
  private endedDateTime?: string;
  private expectationLoggers: RequestExpectationLogger[] = [];
  private scenarioLoggers: RequestScenarioLogger[] = [];
  private time = 0;
  private requestValue: RequestValue;
  private responseValue?: ResponseValue;

  constructor(requestValue: RequestValue) {
    this.id = ++RequestLogger.id;
    this.requestValue = clone(requestValue);
    this.startedDateTime = new Date().toISOString();
  }

  addExpectationLogger(logger: RequestExpectationLogger) {
    this.expectationLoggers.push(logger);
  }

  addScenarioLogger(logger: RequestScenarioLogger) {
    this.scenarioLoggers.push(logger);
  }

  logResponse(responseValue: ResponseValue) {
    this.responseValue = clone(responseValue);
    this.endedDateTime = new Date().toISOString();
    this.time =
      new Date(this.endedDateTime).getTime() -
      new Date(this.startedDateTime).getTime();
  }

  getJSON(): HARLogEntry {
    const expectationRunners = this.expectationLoggers.map(e => e.getJSON());
    const matchedExpectationRunners = expectationRunners.filter(e =>
      isPassed(e.matchResult)
    );

    const scenarioRunners = this.scenarioLoggers.map(s => s.getJSON());
    const matchedScenarioRunners = scenarioRunners.filter(s =>
      s.expectations.some(e => isPassed(e.matchResult))
    );

    const timings: HARTimings = { receive: 1, send: this.time, wait: 1 };

    return {
      _id: this.id,
      _expectationRunners: expectationRunners,
      _matchedExpectationRunners: matchedExpectationRunners,
      _scenarioRunners: scenarioRunners,
      _matchedScenarioRunners: matchedScenarioRunners,
      _requestValue: this.requestValue,
      _responseValue: this.responseValue,
      _url: this.requestValue.url,
      cache: {},
      timings,
      request: requestValueToHARRequest(this.requestValue),
      response: responseValueToHARResponse(this.responseValue!),
      startedDateTime: this.startedDateTime,
      time: timings.receive + timings.send + timings.wait
    };
  }
}

/*
 * HELPERS
 */

function requestValueToHARRequest(req: RequestValue): HARRequest {
  const cookies: HARCookie[] = [];

  for (const [name, value] of Object.entries(req.cookies)) {
    cookies.push({
      name,
      value,
      expires: null,
      httpOnly: false,
      secure: false
    });
  }

  const headers: HARHeader[] = [];

  for (const [name, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const arrayValue of value) {
        headers.push({
          name,
          value: arrayValue
        });
      }
    } else if (typeof value === "string") {
      headers.push({
        name,
        value
      });
    }
  }

  const queryString: HARQuery[] = [];

  for (const [name, value] of Object.entries(req.query)) {
    if (Array.isArray(value)) {
      for (const arrayValue of value) {
        queryString.push({
          name,
          value: arrayValue
        });
      }
    } else if (typeof value === "string") {
      queryString.push({
        name,
        value
      });
    }
  }

  let postData: HARRequestPostData | undefined;
  const contentTypeHeader = req.headers["content-type"];
  const contentType = contentTypeHeader ? (contentTypeHeader as string) : "";

  if (
    contentType.startsWith("application/x-www-form-urlencoded") ||
    contentType.startsWith("multipart/form-data")
  ) {
    const params: HARRequestPostDataParam[] = [];

    postData = {
      mimeType: contentType,
      params
    };

    if (contentType.startsWith("application/x-www-form-urlencoded")) {
      postData.mimeType = "application/x-www-form-urlencoded";

      for (const [name, value] of Object.entries(req.body)) {
        if (Array.isArray(value)) {
          for (const arrayValue of value) {
            params.push({
              name,
              value: arrayValue
            });
          }
        } else if (typeof value === "string") {
          params.push({
            name,
            value
          });
        }
      }
    }

    if (contentType.startsWith("multipart/form-data")) {
      for (const [name, value] of Object.entries(req.body)) {
        if (Array.isArray(value)) {
          for (const arrayValue of value) {
            params.push({
              name,
              value: arrayValue
            });
          }
        } else if (typeof value === "string") {
          params.push({
            name,
            value
          });
        }
      }
    }

    for (const [name, value] of Object.entries(req.files)) {
      if (Array.isArray(value)) {
        for (const arrayValue of value) {
          params.push({
            contentType: arrayValue.mimeType,
            fileName: arrayValue.fileName,
            name
          });
        }
      } else if (value) {
        params.push({
          contentType: value.mimeType,
          fileName: value.fileName,
          name
        });
      }
    }
  }

  return {
    bodySize: -1,
    cookies,
    headers,
    headersSize: -1,
    httpVersion: "HTTP/1.1",
    method: req.method,
    postData,
    queryString,
    url: req.url
  };
}

function responseValueToHARResponse(res: ResponseValue): HARResponse {
  const cookies: HARCookie[] = [];

  const headers: HARHeader[] = [];

  for (const [name, value] of Object.entries(res.headers)) {
    if (Array.isArray(value)) {
      for (const arrayValue of value) {
        headers.push({
          name,
          value: arrayValue
        });
      }
    } else if (typeof value === "string") {
      headers.push({
        name,
        value
      });
    }
  }

  const locationHeader = res.headers.Location;
  const location = locationHeader ? locationHeader[0] : "";

  const contentTypeHeader = res.headers["Content-Type"];
  const mimeType = contentTypeHeader ? contentTypeHeader[0] : "";

  const content: HARResponseContent = {
    mimeType,
    size: Buffer.byteLength(res.body || ""),
    text: res.body ?? ""
  };

  return {
    bodySize: content.size,
    content,
    cookies,
    headers,
    headersSize: 0,
    httpVersion: "HTTP/1.1",
    redirectURL: location || "",
    status: res.status || 200,
    statusText: res.statusText || ""
  };
}
