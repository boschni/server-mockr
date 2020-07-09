// tslint:disable-next-line: no-circular-imports
import { ExpectationRunner } from "../ExpectationRunner";
import { clone } from "../utils/clone";
import { MatchResult } from "../value-matchers/MatchFn";

/*
 * TYPES
 */

export interface ExpectationRunnerRequestLog {
  id: string | number;
  matchResult?: MatchResult;
  verifyResult?: MatchResult;
}

/*
 * LOGGER
 */

export class RequestExpectationLogger {
  id: string | number;
  matchResult?: MatchResult;
  verifyResult?: MatchResult;

  constructor(runner: ExpectationRunner) {
    this.id = runner.getId();
  }

  logMatchResult(result: MatchResult) {
    this.matchResult = clone(result);
  }

  logVerifyResult(result: MatchResult) {
    this.verifyResult = clone(result);
  }

  getJSON(): ExpectationRunnerRequestLog {
    return {
      id: this.id,
      matchResult: this.matchResult,
      verifyResult: this.verifyResult,
    };
  }
}
