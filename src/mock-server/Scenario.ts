import MarkdownIt from "markdown-it";

import { ContextMatcherInput, Expectation } from "./Expectation";
import { Response } from "./Response";
import {
  ConfigDefinition,
  ConfigValue,
  GlobalsValue,
  JSONSchemaDefinition,
  RequestValue,
  ResponseValue,
  StateDefinition,
  StateValue
} from "./Values";

/*
 * TYPES
 */

export type OnStartCallback = (ctx: OnStartScenarioContext) => void;

export interface OnStartScenarioContext {
  config: ConfigValue;
  globals: GlobalsValue;
  scenario: Scenario;
  state: StateValue;
}

export type OnBootstrapCallback = (
  ctx: OnBootstrapScenarioContext
) => Response | void;

export interface OnBootstrapScenarioContext {
  config: ConfigValue;
  globals: GlobalsValue;
  req: RequestValue;
  res: ResponseValue;
  state: StateValue;
}

/*
 * HELPERS
 */

const md = new MarkdownIt({
  html: true
});

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
  private _configDefinitions: ConfigDefinition[] = [];
  private _description = "";
  private _expectations: Expectation[] = [];
  private _id: string;
  private _onBootstrap?: OnBootstrapCallback;
  private _onStart?: OnStartCallback;
  private _stateDefinitions: StateDefinition[] = [];
  private _tags: string[] = [];

  /*
   * SETTERS
   */

  constructor(id: string) {
    this._id = id;
  }

  description(description: string): this {
    this._description = description;
    return this;
  }

  tag(tag: string): this {
    this._tags.push(tag);
    return this;
  }

  tags(tags: string[]): this {
    this._tags = tags;
    return this;
  }

  config(name: string, schema?: JSONSchemaDefinition): this {
    schema = schema ?? { type: "string" };
    this._configDefinitions.push({ name, schema });
    return this;
  }

  state(name: string, schema?: JSONSchemaDefinition): this {
    schema = schema ?? { type: "string" };
    this._stateDefinitions.push({ name, schema });
    return this;
  }

  onBootstrap(cb: OnBootstrapCallback): this {
    this._onBootstrap = cb;
    return this;
  }

  onStart(cb: OnStartCallback): this {
    this._onStart = cb;
    return this;
  }

  when(...matchers: ContextMatcherInput[]): Expectation {
    const expectation = new Expectation(...matchers);
    this._expectations.push(expectation);
    return expectation;
  }

  /*
   * GETTERS
   */

  getId(): string {
    return this._id;
  }

  getTags(): string[] {
    return this._tags;
  }

  getFormattedDescription(): string {
    return md.render(this._description.trim());
  }

  getConfigParams(): ConfigDefinition[] {
    return this._configDefinitions;
  }

  getStateParams(): StateDefinition[] {
    return this._stateDefinitions;
  }

  getVisibleConfigParams(): ConfigDefinition[] {
    return this._configDefinitions.filter(x => !x.schema.hidden);
  }

  getVisibleStateParams(): StateDefinition[] {
    return this._stateDefinitions.filter(x => !x.schema.hidden);
  }

  getExpectations(): Expectation[] {
    return this._expectations;
  }

  getOnStartCallback(): OnStartCallback | undefined {
    return this._onStart;
  }

  getOnBootstrapCallback(): OnBootstrapCallback | undefined {
    return this._onBootstrap;
  }
}
