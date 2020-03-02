import { ExpectationValue, StateValue } from "../Values";
import { ActionBuilder } from "./Action";

/*
 * FACTORY
 */

export function setState(name: string, value: unknown): SetStateAction {
  return new SetStateAction(name, value);
}

/*
 * ACTION
 */

export class SetStateAction implements ActionBuilder {
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
