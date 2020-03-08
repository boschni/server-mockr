import { ExpectationValue } from "../Values";
import { RespondAction } from "./RespondAction";

/*
 * TYPES
 */

export interface HeadersMap {
  [name: string]: string | string[] | undefined;
}

/*
 * ACTION
 */

export class SetHeadersAction implements RespondAction {
  constructor(private map: HeadersMap) {}

  async execute(ctx: ExpectationValue): Promise<void> {
    for (const name of Object.keys(this.map)) {
      const appendValue = this.map[name];

      if (appendValue === undefined) {
        continue;
      }

      const appendValues = Array.isArray(appendValue)
        ? appendValue
        : [appendValue];

      const value = ctx.res.headers[name] || [];
      const values = Array.isArray(value) ? value : [value];

      const newValues = values.concat(appendValues);
      const newValuesSanitized = newValues.map(x => String(x));

      ctx.res.headers[name] = newValuesSanitized;
    }
  }
}
