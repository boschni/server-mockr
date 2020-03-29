import { clone } from "../utils/clone";
import { isPassed } from "../value-matchers/MatchFn";
import { RequestValue, ResponseValue } from "../Values";
import {
  ExpectationRunnerRequestLog,
  RequestExpectationLogger
} from "./RequestExpectationLogger";
import {
  RequestScenarioLogger,
  ScenarioRunnerRequestLog
} from "./RequestScenarioLogger";

/*
 * TYPES
 */

export interface LogEntry {
  _expectationRunners: ExpectationRunnerRequestLog[];
  _id: number;
  _matchedExpectationRunners: ExpectationRunnerRequestLog[];
  _matchedScenarioRunners: ScenarioRunnerRequestLog[];
  _requestValue: RequestValue;
  _responseValue?: ResponseValue;
  _scenarioRunners: ScenarioRunnerRequestLog[];
  _url: string;
  cache: HARCache;
  request: HARRequest;
  response: HARResponse;
  /** Date and time stamp of the request start */
  startedDateTime: string;
  /** Total elapsed time of the request in milliseconds */
  time: number;
  timings: HARTimings;
}

export interface HARCache {}

export interface HARTimings {
  receive: number;
  send: number;
  wait: number;
}

export interface HARRequest {
  bodySize: number;
  cookies: HARCookie[];
  headers: HARHeader[];
  headersSize: number;
  httpVersion: string;
  method: string;
  postData?: HARRequestPostData;
  queryString: HARQuery[];
  url: string;
}

export interface HARCookie {
  expires: null | string;
  httpOnly: boolean;
  name: string;
  path?: string;
  domain?: string;
  secure: boolean;
  value: string;
}

export interface HARRequestPostData {
  mimeType: string;
  params?: HARRequestPostDataParam[];
  text?: string;
}

export interface HARRequestPostDataParam {
  name: string;
  value?: string;
  fileName?: string;
  contentType?: string;
}

export interface HARResponse {
  bodySize: number;
  content: HARResponseContent;
  cookies: HARCookie[];
  headers: HARHeader[];
  headersSize: number;
  httpVersion: string;
  redirectURL: string;
  status: number;
  statusText: string;
}

export interface HARResponseContent {
  size: number;
  mimeType: string;
  text: string;
}

export interface HARHeader {
  name: string;
  value: string;
}

export interface HARQuery {
  name: string;
  value: string;
}

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

  getJSON(): LogEntry {
    const expectationRunners = this.expectationLoggers.map(e => e.getJSON());
    const matchedExpectationRunners = expectationRunners.filter(e =>
      isPassed(e.matchResult)
    );

    const scenarioRunners = this.scenarioLoggers.map(s => s.getJSON());
    const matchedScenarioRunners = scenarioRunners.filter(s =>
      s.expectations.some(e => isPassed(e.matchResult))
    );

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
      timings: { receive: 0, send: 0, wait: 0 },
      request: requestValueToHARRequest(this.requestValue),
      response: responseValueToHARResponse(this.responseValue!),
      startedDateTime: this.startedDateTime,
      time: this.time
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
