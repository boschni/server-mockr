import { IncomingMessage, ServerResponse } from "http";
import url from "url";

import { ConfigDefinition, StateDefinition } from "./ScenarioDefinition";
import {
  ConfigValue,
  GlobalsValue,
  QueryValue,
  RequestValue,
  ResponseValue,
  StateValue
} from "./Values";

/*
 * HELPERS
 */

export const incomingMessageToRequestValue = (
  req: IncomingMessage
): RequestValue => {
  const parsedUrl = url.parse(req.url!, true);

  const request: RequestValue = {
    body: (req as any).body,
    cookies: (req as any).cookies,
    headers: req.headers,
    method: req.method as any,
    path: parsedUrl.pathname!,
    query: parsedUrl.query,
    url: req.url!
  };

  return request;
};

export const createResponseValue = (): ResponseValue => {
  const response: ResponseValue = {
    headers: {}
  };
  return response;
};

export const hasResponse = (response: ResponseValue): boolean => {
  return (
    response.status !== undefined ||
    response.body !== undefined ||
    Object.keys(response.headers).length > 0
  );
};

export const respondWithResponseValue = async (
  res: ServerResponse,
  response: ResponseValue
): Promise<void> => {
  return new Promise(resolve => {
    if (!hasResponse(response)) {
      res.statusCode = 404;
      res.end("server-mockr: Not Found", resolve);
      return res;
    }

    res.statusCode = response.status || 200;

    for (const [name, value] of Object.entries(response.headers)) {
      if (value !== undefined) {
        res.setHeader(name, value);
      }
    }

    res.end(response.body, resolve);
  });
};

export const createDefaultedGlobals = (providedGlobals?: GlobalsValue) => {
  const globalsDefaults: GlobalsValue = {};
  return { ...globalsDefaults, ...providedGlobals };
};

export const createDefaultedConfig = (
  providedConfig?: ConfigValue,
  configDef?: ConfigDefinition
) => {
  const configDefaults: ConfigValue = {};

  if (configDef) {
    for (const [name, schema] of Object.entries(configDef)) {
      configDefaults[name] = schema.default;
    }
  }

  return { ...configDefaults, ...providedConfig };
};

export const createDefaultedState = (
  providedState?: StateValue,
  stateDef?: StateDefinition
) => {
  const stateDefaults: StateValue = {};

  if (stateDef) {
    for (const [name, schema] of Object.entries(stateDef)) {
      stateDefaults[name] = schema.default;
    }
  }

  return { ...stateDefaults, ...providedState };
};

export const queryParamToObject = <T extends object>(
  param: string,
  query: QueryValue
): T => {
  const obj: any = {};

  for (const [key, value] of Object.entries(query)) {
    const match = key.match(`${param}\\[([a-zA-Z0-9]+)\\]`);
    if (match) {
      obj[match[1]] = value;
    }
  }

  return obj;
};
