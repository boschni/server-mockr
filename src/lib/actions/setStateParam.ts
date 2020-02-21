import { ExpectationValue, StateValue } from "../Values";
import { Action } from "./Action";

/*
 * FACTORY
 */

export function setStateParam(name: string, value: unknown) {
  return new SetStateParamAction(name, value);
}

/*
 * ACTION
 */

export class SetStateParamAction implements Action {
  private _state: StateValue;

  constructor(name: string, value: unknown) {
    this._state = { [name]: value };
  }

  async execute(ctx: ExpectationValue): Promise<void> {
    for (const key of Object.keys(this._state)) {
      ctx.state[key] = this._state[key];
    }
  }
}
