import { ExpectationValue } from "../Values";
import { ResponseAction } from "./ResponseAction";

/*
 * TYPES
 */

export interface HeadersMap {
  [name: string]: string | string[] | undefined;
}

/*
 * ACTION
 */

export class SetHeadersAction implements ResponseAction {
  private _map: HeadersMap;

  constructor(map: HeadersMap) {
    this._map = map;
  }

  async execute(ctx: ExpectationValue): Promise<void> {
    for (const name of Object.keys(this._map)) {
      const appendValue = this._map[name];

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
