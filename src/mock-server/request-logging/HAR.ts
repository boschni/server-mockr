import { RequestValue, ResponseValue } from "../Values";
import { ExpectationRunnerRequestLog } from "./RequestExpectationLogger";
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
