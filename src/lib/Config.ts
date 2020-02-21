// tslint:disable-next-line
import { ExpectationConfigBuilder } from "./builders/expectation";
// tslint:disable-next-line
import { ScenarioConfigBuilder } from "./builders/scenario";
import { GlobalsValue } from "./Values";

/*
 * CONFIG
 */

export interface Config {
  controlServerPort: number;
  expectations: ExpectationConfigBuilder[];
  globals: GlobalsValue;
  logLevel: "info" | "error";
  mockServerPort: number;
  multipleActiveScenarios: boolean;
  scenarios: ScenarioConfigBuilder[];
}

export interface InitialConfig extends Partial<Config> {}

interface ConfigDefaults extends Config {}

const configDefaults: ConfigDefaults = {
  controlServerPort: 3001,
  expectations: [],
  globals: {},
  logLevel: "info",
  mockServerPort: 3002,
  multipleActiveScenarios: false,
  scenarios: []
};

export function createConfig(initialConfig?: InitialConfig): Config {
  return {
    ...configDefaults,
    ...initialConfig
  };
}
