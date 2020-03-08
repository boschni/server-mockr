import { ExpectationValue } from "../Values";

/*
 * TYPES
 */

export interface ActionBuilder {
  execute(ctx: ExpectationValue): Promise<void>;
}

export type ActionFn = (ctx: ExpectationValue) => Promise<void>;

export type Action = ActionFn | ActionBuilder;

/*
 * HELPERS
 */

export function executeAction(
  action: Action,
  ctx: ExpectationValue
): Promise<void> {
  if (typeof action === "function") {
    return action(ctx);
  } else {
    return action.execute(ctx);
  }
}
