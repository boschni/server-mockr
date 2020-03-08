import { ExpectationValue } from "../Values";
import { RespondAction } from "./RespondAction";

/*
 * ACTION
 */

export class SetStatusAction implements RespondAction {
  constructor(private code?: number) {}

  async execute(ctx: ExpectationValue): Promise<void> {
    if (typeof this.code === "number") {
      ctx.res.status = this.code;
    }
  }
}
