import { ExpectationValue } from "../Values";
import { ResponseAction } from "./ResponseAction";

/*
 * ACTION
 */

export class DelayAction implements ResponseAction {
  private _ms: number;

  constructor(ms: number) {
    this._ms = ms;
  }

  async execute(_ctx: ExpectationValue): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this._ms));
  }
}
