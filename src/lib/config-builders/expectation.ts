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
    afterRespondActions: [],
    next: false,
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

  verifyFailedRespond(input: RespondInput) {
    this._config.verifyFailedRespondInput = input;
    return this;
  }

  respond(input: RespondInput) {
    this._config.respondInput = input;
    return this;
  }

  afterRespond(...actions: ActionInput[]) {
    this._config.afterRespondActions = actions;
    return this;
  }

  next() {
    this._config.next = true;
    return this;
  }

  getConfig() {
    return this._config;
  }
}
