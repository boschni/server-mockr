import { ContextMatcherInput, Expectation } from "./Expectation";
import { Response } from "./Response";
import {
  GlobalsValue,
  JSONSchemaDefinition,
  RequestValue,
  ResponseValue,
  StateConfig,
  StateValue
} from "./Values";

/*
 * TYPES
 */

export interface ScenarioConfig {
  description: string;
  expectations: Expectation[];
  id: string;
  onBootstrap?: OnBootstrapCallback;
  onStart?: OnStartCallback;
  stateConfigs: StateConfig[];
  tags: string[];
}

export type OnStartCallback = (ctx: OnStartScenarioContext) => void;

export interface OnStartScenarioContext {
  globals: GlobalsValue;
  scenario: Scenario;
  state: StateValue;
}

export type OnBootstrapCallback = (
  ctx: OnBootstrapScenarioContext
) => Response | void;

export interface OnBootstrapScenarioContext {
  globals: GlobalsValue;
  req: RequestValue;
  res: ResponseValue;
  state: StateValue;
}

/*
 * FACTORY
 */

export function scenario(id: string) {
  return new Scenario(id);
}

/*
 * SCENARIO
 */

export class Scenario {
  private _config: ScenarioConfig = {
    description: "",
    expectations: [],
    id: "",
    stateConfigs: [],
    tags: []
  };

  constructor(id: string) {
    this._config.id = id;
  }

  description(description: string) {
    this._config.description = description;
    return this;
  }

  tags(tags: string[]) {
    this._config.tags = tags;
    return this;
  }

  state(name: string, schema: JSONSchemaDefinition) {
    this._config.stateConfigs.push({ name, schema });
    return this;
  }

  onBootstrap(cb: OnBootstrapCallback) {
    this._config.onBootstrap = cb;
    return this;
  }

  onStart(cb: OnStartCallback) {
    this._config.onStart = cb;
    return this;
  }

  when(...matchers: ContextMatcherInput[]) {
    const expectation = new Expectation(...matchers);
    this._config.expectations.push(expectation);
    return expectation;
  }

  getConfig() {
    return this._config;
  }
}
