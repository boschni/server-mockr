import { Config } from "./Config";
import { MatchResult } from "./operators/match/MatchOperator";
import { RequestValue, ResponseValue } from "./Values";

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
}

export interface ExpectationRequestLog {
  id: string | number;
  matchResult?: MatchResult;
  verifyResult?: MatchResult;
}

export class RequestLogManager {
  private static id = 0;

  protected config: Config;
  private logs: RequestLog[] = [];

  constructor(config: Config) {
    this.config = config;
  }

  public log(request: RequestValue): RequestLog {
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

  public getLogs(): RequestLog[] {
    return this.logs;
  }
}
