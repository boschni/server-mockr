import cookie, { CookieSerializeOptions } from "cookie";

import { BehaviourFunction } from "../behaviour";

export interface CookiesMapObject {
  value: string;
  options: CookieSerializeOptions;
}

export interface CookiesMap {
  [name: string]: string | CookiesMapObject;
}

export const cookies = (map: CookiesMap): BehaviourFunction => async ({
  response
}) => {
  const headerValue = response.headers["Set-Cookie"] || [];
  const headersValues = Array.isArray(headerValue)
    ? headerValue
    : [headerValue];

  const additionalHeaderValues = Object.keys(map).map(name => {
    const mapValue = map[name];
    const value = typeof mapValue === "string" ? mapValue : mapValue.value;
    const options = typeof mapValue === "string" ? undefined : mapValue.options;
    return cookie.serialize(name, value, options);
  });

  const newHeaderValues = headersValues
    .concat(additionalHeaderValues)
    .map(x => String(x));

  response.headers["Set-Cookie"] = newHeaderValues;
};
