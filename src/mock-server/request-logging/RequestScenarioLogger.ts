// tslint:disable-next-line: no-circular-imports
import { ScenarioRunner } from "../ScenarioRunner";
import { clone } from "../utils/clone";
import { ConfigValue, StateValue } from "../Values";
import {
  ExpectationRunnerRequestLog,
  RequestExpectationLogger
} from "./RequestExpectationLogger";

/*
 * TYPES
 */

export interface ScenarioRunnerRequestLog {
  config: ConfigValue;
  expectations: ExpectationRunnerRequestLog[];
  id: string | number;
  scenarioId: string | number;
  state: StateValue;
}

/*
 * LOGGER
 */

export class RequestScenarioLogger {
  private id: number;
  private scenarioId: string;
  private config: ConfigValue;
  private state: StateValue;
  private expectationLoggers: RequestExpectationLogger[] = [];

  constructor(runner: ScenarioRunner) {
    this.id = runner.getId();
    this.scenarioId = runner.getScenarioId();
    this.config = clone(runner.getConfig());
    this.state = clone(runner.getState());
  }

  addExpectationLogger(logger: RequestExpectationLogger) {
    this.expectationLoggers.push(logger);
  }

  getJSON(): ScenarioRunnerRequestLog {
    return {
      id: this.id,
      scenarioId: this.scenarioId,
      config: this.config,
      state: this.state,
      expectations: this.expectationLoggers.map(x => x.getJSON())
    };
  }
}
