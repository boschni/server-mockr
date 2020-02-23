import { ContextMatcherInput } from "../Expectation";
import {
  OnBootstrapCallback,
  OnStartCallback,
  ScenarioConfig
} from "../Scenario";
import { JSONSchemaDefinition } from "../Values";
import { ExpectationConfigBuilder } from "./expectation";

/*
 * FACTORY
 */

export function scenario(id: string) {
  return new ScenarioConfigBuilder(id);
}

/*
 * BUILDER
 */

export class ScenarioConfigBuilder {
  private _config: ScenarioConfig = {
    description: "",
    expectationBuilders: [],
    id: "",
    stateParams: [],
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

  stateParam(name: string, schema: JSONSchemaDefinition) {
    this._config.stateParams.push({ name, schema });
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
    const builder = new ExpectationConfigBuilder(...matchers);
    this._config.expectationBuilders.push(builder);
    return builder;
  }

  getConfig() {
    return this._config;
  }
}
