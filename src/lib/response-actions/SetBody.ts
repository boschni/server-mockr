import { ExpectationValue } from "../Values";
import { ResponseAction } from "./ResponseAction";

/*
 * ACTION
 */

export class SetBodyAction implements ResponseAction {
  private _body?: string;

  constructor(body?: string) {
    this._body = body;
  }

  async execute(ctx: ExpectationValue): Promise<void> {
    if (typeof this._body === "string") {
      ctx.res.body = this._body;
    }
  }
}
