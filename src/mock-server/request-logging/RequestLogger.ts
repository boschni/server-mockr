import { clone } from "../utils/clone";
import { isPassed } from "../value-matchers/MatchFn";
import { RequestValue, ResponseValue } from "../Values";
import {
  ExpectationRunnerRequestLog,
  RequestExpectationLogger,
} from "./RequestExpectationLogger";
import {
  RequestScenarioLogger,
  ScenarioRunnerRequestLog,
} from "./RequestScenarioLogger";

/*
 * TYPES
 */

export interface RequestLog {
  expectationRunners: ExpectationRunnerRequestLog[];
  id: number;
  matchedExpectationRunners: ExpectationRunnerRequestLog[];
  matchedScenarioRunners: ScenarioRunnerRequestLog[];
  requestValue: RequestValue;
  responseValue?: ResponseValue;
  scenarioRunners: ScenarioRunnerRequestLog[];
  startedDateTime: string;
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

  getJSON(): RequestLog {
    const expectationRunners = this.expectationLoggers.map((e) => e.getJSON());
    const matchedExpectationRunners = expectationRunners.filter((e) =>
      isPassed(e.matchResult)
    );

    const scenarioRunners = this.scenarioLoggers.map((s) => s.getJSON());
    const matchedScenarioRunners = scenarioRunners.filter((s) =>
      s.expectations.some((e) => isPassed(e.matchResult))
    );

    return {
      id: this.id,
      expectationRunners,
      matchedExpectationRunners,
      scenarioRunners,
      matchedScenarioRunners,
      requestValue: this.requestValue,
      responseValue: this.responseValue,
      startedDateTime: this.startedDateTime,
      time: this.time,
    };
  }
}
