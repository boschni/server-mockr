import { waitFor, WaitForConfig } from "../utils/promise";
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

  async execute(): Promise<void> {
    return waitFor(this.config);
  }
}
