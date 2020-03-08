import { waitFor, WaitForConfig } from "../utils/promise";
import { ExpectationValue } from "../Values";
import { RespondAction } from "./RespondAction";

/*
 * TYPES
 */

export interface DelayConfig extends WaitForConfig {}

/*
 * ACTION
 */

export class DelayAction implements RespondAction {
  constructor(private config: WaitForConfig) {}

  async execute(_ctx: ExpectationValue): Promise<void> {
    return waitFor(this.config);
  }
}
