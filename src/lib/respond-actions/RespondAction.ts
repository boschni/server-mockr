import { ExpectationValue } from "../Values";

/*
 * TYPES
 */

export interface RespondAction {
  execute(ctx: ExpectationValue): Promise<void>;
}
