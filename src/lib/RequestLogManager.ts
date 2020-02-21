import { Config } from "./Config";
import { MatchResult } from "./value-matchers/MatchFn";
import { RequestValue, ResponseValue, StateValue } from "./Values";

export interface RequestLog {
  date: string;
  expectations: ExpectationRequestLog[];
  id: number;
  request: RequestValue;
  response?: ResponseValue;
  scenarios: ScenarioRequestLog[];
}

export interface ScenarioRequestLog {
  expectations: ExpectationRequestLog[];
  id: string | number;
  state: StateValue;
}

export interface ExpectationRequestLog {
  id: string | number;
  matchResult?: MatchResult;
  verifyResult?: MatchResult;
}

export class RequestLogManager {
  private static id = 0;

  private logs: RequestLog[] = [];

  constructor(protected config: Config) {}

  log(request: RequestValue): RequestLog {
    const log: RequestLog = {
      date: new Date().toISOString(),
      expectations: [],
      id: ++RequestLogManager.id,
      request,
      scenarios: []
    };

    this.logs.push(log);

    return log;
  }

  clear() {
    this.logs = [];
    RequestLogManager.id = 0;
  }

  getLogs(): RequestLog[] {
    return this.logs;
  }
}
