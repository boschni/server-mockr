import { ExpectationValue } from "../Values";
import { RespondAction } from "./RespondAction";

/*
 * ACTION
 */

export class SetStatusAction implements RespondAction {
  constructor(private code = 200) {}

  async execute(ctx: ExpectationValue): Promise<void> {
    ctx.res.status = this.code;
  }
}
