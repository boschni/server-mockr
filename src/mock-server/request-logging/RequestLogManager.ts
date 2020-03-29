import { Config } from "../Config";
import { HAR, toHAR } from "./HAR";
import { RequestLog, RequestLogger } from "./RequestLogger";

/*
 * LOG MANAGER
 */

export class RequestLogManager {
  private logs: RequestLog[] = [];

  constructor(protected config: Config) {}

  log(logger: RequestLogger) {
    const log = logger.getJSON();
    this.logs.push(log);
  }

  clear() {
    this.logs = [];
  }

  getHAR(): HAR {
    return toHAR(this.logs);
  }

  getHARForScenario(id: string): HAR {
    const logs = this.logs.filter(log =>
      log.scenarioRunners.some(runner => runner.scenarioId === id)
    );
    return toHAR(logs);
  }

  getHARForMatchedScenario(id: string): HAR {
    const logs = this.logs.filter(log =>
      log.matchedScenarioRunners.some(runner => runner.scenarioId === id)
    );
    return toHAR(logs);
  }

  getHARForScenarioRunner(id: number): HAR {
    const logs = this.logs.filter(log =>
      log.scenarioRunners.some(runner => runner.id === id)
    );
    return toHAR(logs);
  }

  getHARForMatchedScenarioRunner(id: number): HAR {
    const logs = this.logs.filter(log =>
      log.matchedScenarioRunners.some(runner => runner.id === id)
    );
    return toHAR(logs);
  }
}
