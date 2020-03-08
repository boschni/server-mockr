import { ExpectationValue } from "../Values";
import { RespondAction } from "./RespondAction";

/*
 * ACTION
 */

export class SetStatusTextAction implements RespondAction {
  constructor(private text?: string) {}

  async execute(ctx: ExpectationValue): Promise<void> {
    if (typeof this.text === "string") {
      ctx.res.statusText = this.text;
    }
  }
}
