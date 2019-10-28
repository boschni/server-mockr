import {
  ExpectationsDefinition,
  ScenarioDefinition
} from "./ScenarioDefinition";
import { GlobalsValue } from "./Values";

export interface Config {
  controlServerPort: number;
  expectations: ExpectationsDefinition;
  globals: GlobalsValue;
  mockServerPort: number;
  scenarios: ScenarioDefinition[];
}

export interface InitialConfig extends Partial<Config> {}

interface ConfigDefaults extends Config {}

const configDefaults: ConfigDefaults = {
  controlServerPort: 3001,
  expectations: [],
  globals: {},
  mockServerPort: 3002,
  scenarios: []
};

export function createConfig(initialConfig?: InitialConfig): Config {
  return {
    ...configDefaults,
    ...initialConfig
  };
}
