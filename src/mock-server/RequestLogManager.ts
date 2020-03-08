import { Config } from "./Config";
import { LogEntry, RequestLogger } from "./loggers/RequestLogger";

/*
 * TYPES
 */

export interface HAR {
  log: Log;
}

export interface Log {
  version: string;
  creator: { name: string; version: string };
  entries: LogEntry[];
}

/*
 * LOG MANAGER
 */

export class RequestLogManager {
  private entries: LogEntry[] = [];

  constructor(protected config: Config) {}

  log(logger: RequestLogger) {
    const entry = logger.getJSON();
    this.entries.push(entry);
  }

  clear() {
    this.entries = [];
  }

  getHAR(): HAR {
    return this.toHAR(this.entries);
  }

  getHARForScenario(id: string): HAR {
    const entries = this.entries.filter(entry =>
      entry._scenarioRunners.some(runner => runner.scenarioId === id)
    );
    return this.toHAR(entries);
  }

  getHARForMatchedScenario(id: string): HAR {
    const entries = this.entries.filter(entry =>
      entry._matchedScenarioRunners.some(runner => runner.scenarioId === id)
    );
    return this.toHAR(entries);
  }

  getHARForScenarioRunner(id: number): HAR {
    const entries = this.entries.filter(entry =>
      entry._scenarioRunners.some(runner => runner.id === id)
    );
    return this.toHAR(entries);
  }

  getHARForMatchedScenarioRunner(id: number): HAR {
    const entries = this.entries.filter(entry =>
      entry._matchedScenarioRunners.some(runner => runner.id === id)
    );
    return this.toHAR(entries);
  }

  protected toHAR(entries: LogEntry[]): HAR {
    return {
      log: {
        creator: {
          name: "Server Mockr",
          version: "1.0.0"
        },
        version: "1.2",
        entries
      }
    };
  }
}
