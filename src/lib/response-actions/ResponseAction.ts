import { ExpectationValue } from "../Values";

/*
 * TYPES
 */

export interface ResponseAction {
  execute(ctx: ExpectationValue): Promise<void>;
}
