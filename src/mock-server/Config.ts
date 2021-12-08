import { Expectation } from "./Expectation";
import { Scenario } from "./Scenario";
import { GlobalsValue, ResponseValue } from "./Values";

/*
 * CONFIG
 */

export interface Config {
  controlServerPort: number;
  expectations: Expectation[];
  globals: GlobalsValue;
  logLevel: "info" | "error";
  mockServerPort: number;
  multipleScenarioRunners: boolean;
  scenarios: Scenario[];
  notFoundResponse?: ResponseValue;
}

export interface InitialConfig extends Partial<Config> {}

interface ConfigDefaults extends Config {}

const configDefaults: ConfigDefaults = {
  controlServerPort: 3001,
  expectations: [],
  globals: {},
  logLevel: "info",
  mockServerPort: 3002,
  multipleScenarioRunners: false,
  scenarios: [],
};

export function createConfig(initialConfig?: InitialConfig): Config {
  return {
    ...configDefaults,
    ...initialConfig,
  };
}
