import { ExpectationValue } from "../Values";

/*
 * TYPES
 */

export interface Action {
  execute(ctx: ExpectationValue): Promise<void>;
}
