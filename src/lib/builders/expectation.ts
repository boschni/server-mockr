import {
  ActionInput,
  ContextMatcherInput,
  ExpectationConfig,
  RespondInput
} from "../Expectation";

/*
 * FACTORY
 */

export function expect(...matchers: ContextMatcherInput[]) {
  return new ExpectationConfigBuilder(...matchers);
}

/*
 * BUILDER
 */

export class ExpectationConfigBuilder {
  private _config: ExpectationConfig = {
    afterResponseActions: [],
    verifyMatchers: [],
    whenMatchers: []
  };

  constructor(...matchers: ContextMatcherInput[]) {
    this._config.whenMatchers.push(...matchers);
  }

  id(id: string) {
    this._config.id = id;
    return this;
  }

  verify(...matchers: ContextMatcherInput[]) {
    this._config.verifyMatchers.push(...matchers);
    return this;
  }

  respond(input: RespondInput) {
    this._config.respondInput = input;
    return this;
  }

  afterResponse(...actions: ActionInput[]) {
    this._config.afterResponseActions = actions;
    return this;
  }

  build() {
    return this._config;
  }
}
