import { ExpectationRunner } from "../ExpectationRunner";
import { ScenarioRunner } from "../ScenarioRunner";
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
  /** Date and time stamp of the request start */
  startedDateTime: string;
  /** Total elapsed time of the request in milliseconds */
  time: number;
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

  getExpectationLogger(runner: ExpectationRunner) {
    const expectationLogger = new RequestExpectationLogger(runner);
    this.expectationLoggers.push(expectationLogger);
    return expectationLogger;
  }

  getScenarioLogger(runner: ScenarioRunner) {
    const scenarioLogger = new RequestScenarioLogger(runner);
    this.scenarioLoggers.push(scenarioLogger);
    return scenarioLogger;
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
      startedDateTime: this.startedDateTime,
      time: this.time
    };
  }
}
