import cookie, { CookieSerializeOptions } from "cookie";

import { ExpectationValue } from "../Values";
import { ResponseAction } from "./ResponseAction";

/*
 * TYPES
 */

export interface CookiesMapObject {
  value: string;
  options: CookieSerializeOptions;
}

export interface CookiesMap {
  [name: string]: string | CookiesMapObject;
}

/*
 * ACTION
 */

export class SetCookiesAction implements ResponseAction {
  private _map: CookiesMap;

  constructor(map: CookiesMap) {
    this._map = map;
  }

  async execute(ctx: ExpectationValue): Promise<void> {
    const headerValue = ctx.res.headers["Set-Cookie"] || [];
    const headersValues = Array.isArray(headerValue)
      ? headerValue
      : [headerValue];

    const additionalHeaderValues = Object.keys(this._map).map(name => {
      const mapValue = this._map[name];
      const value = typeof mapValue === "string" ? mapValue : mapValue.value;
      const options =
        typeof mapValue === "string" ? undefined : mapValue.options;
      return cookie.serialize(name, value, options);
    });

    const newHeaderValues = headersValues
      .concat(additionalHeaderValues)
      .map(x => String(x));

    ctx.res.headers["Set-Cookie"] = newHeaderValues;
  }
}
