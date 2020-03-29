import { RequestValue, ResponseValue } from "../Values";
import { ExpectationRunnerRequestLog } from "./RequestExpectationLogger";
import { RequestLog } from "./RequestLogger";
import { ScenarioRunnerRequestLog } from "./RequestScenarioLogger";

/*
 * TYPES
 */

export interface HAR {
  log: HARLog;
}

export interface HARLog {
  version: string;
  creator: { name: string; version: string };
  entries: HARLogEntry[];
}

export interface HARLogEntry {
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
 * HELPERS
 */

export function toHAR(logs: RequestLog[]): HAR {
  return {
    log: {
      creator: {
        name: "Server Mockr",
        version: "1.0.0"
      },
      version: "1.2",
      entries: logs.map(requestLogToEntry)
    }
  };
}

function requestLogToEntry(log: RequestLog): HARLogEntry {
  const timings: HARTimings = { receive: 1, send: log.time, wait: 1 };
  return {
    _id: log.id,
    _expectationRunners: log.expectationRunners,
    _matchedExpectationRunners: log.matchedExpectationRunners,
    _scenarioRunners: log.scenarioRunners,
    _matchedScenarioRunners: log.matchedScenarioRunners,
    _requestValue: log.requestValue,
    _responseValue: log.responseValue,
    _url: log.requestValue.url,
    cache: {},
    timings,
    request: requestValueToHARRequest(log.requestValue),
    response: responseValueToHARResponse(log.responseValue!),
    startedDateTime: log.startedDateTime,
    time: timings.receive + timings.send + timings.wait
  };
}

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
  const contentType = getFirstHeaderValue(req.headers["content-type"]) || "";

  if (contentType.startsWith("application/x-www-form-urlencoded")) {
    const params: HARRequestPostDataParam[] = [];

    postData = {
      mimeType: "application/x-www-form-urlencoded",
      params
    };

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
  } else if (contentType.startsWith("multipart/form-data")) {
    const params: HARRequestPostDataParam[] = [];

    postData = {
      mimeType: "multipart/form-data",
      params
    };

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
  } else if (contentType.startsWith("application/json")) {
    postData = {
      mimeType: contentType,
      text: JSON.stringify(req.body)
    };
  } else if (typeof req.body === "string") {
    postData = {
      mimeType: contentType,
      text: req.body
    };
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

  const location = getFirstHeaderValue(res.headers.Location) || "";
  const contentType = getFirstHeaderValue(res.headers["Content-Type"]) || "";

  const content: HARResponseContent = {
    mimeType: contentType,
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

function getFirstHeaderValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
