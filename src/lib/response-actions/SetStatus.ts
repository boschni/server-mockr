import { ExpectationValue } from "../Values";
import { ResponseAction } from "./ResponseAction";

/*
 * ACTION
 */

export class SetStatusAction implements ResponseAction {
  private _code = 200;

  constructor(code?: number) {
    if (typeof code === "number") {
      this._code = code;
    }
  }

  async execute(ctx: ExpectationValue): Promise<void> {
    ctx.res.status = this._code;
  }
}
