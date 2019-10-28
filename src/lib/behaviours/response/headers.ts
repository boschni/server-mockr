import { BehaviourFunction } from "../behaviour";

export interface HeadersMap {
  [name: string]: string | string[];
}

export const headers = (map: HeadersMap): BehaviourFunction => async ({
  response
}) => {
  for (const name of Object.keys(map)) {
    const value = response.headers[name] || [];
    const values = Array.isArray(value) ? value : [value];

    const appendValue = map[name];
    const appendValues = Array.isArray(appendValue)
      ? appendValue
      : [appendValue];

    const newValues = values.concat(appendValues);
    const newValuesSanitized = newValues.map(x => String(x));

    response.headers[name] = newValuesSanitized;
  }
};
