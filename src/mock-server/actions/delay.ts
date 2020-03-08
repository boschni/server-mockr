import { waitFor, WaitForConfig } from "../utils/promise";
import { ExpectationValue } from "../Values";
import { Action, ActionBuilder, executeAction } from "./Action";

/*
 * FACTORY
 */

export function delay(
  action: ActionBuilder,
  min: number,
  max?: number
): DelayAction {
  if (typeof max === "number") {
    return new DelayAction(action, { min, max });
  } else {
    return new DelayAction(action, { exact: min });
  }
}

/*
 * ACTION
 */

export class DelayAction implements ActionBuilder {
  constructor(private action: Action, private config: WaitForConfig) {}

  async execute(ctx: ExpectationValue): Promise<void> {
    await waitFor(this.config);
    return executeAction(this.action, ctx);
  }
}
