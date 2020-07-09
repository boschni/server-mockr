import cookie from "cookie";
import { IncomingMessage, ServerResponse } from "http";
import fetch, { Headers, RequestInit } from "node-fetch";

import {
  ConfigDefinition,
  ConfigValue,
  CookiesValue,
  FilesValue,
  FileValue,
  HeadersValue,
  MethodValue,
  OutgoingRequestValue,
  QueryValue,
  RequestValue,
  ResponseValue,
  StateDefinition,
  StateValue,
} from "./Values";

/*
 * HELPERS
 */

export const incomingMessageToRequestValue = (
  req: IncomingMessage
): RequestValue => {
  const url = new URL(req.url!, "http://localhost/");
  const query = urlSearchParamsToQueryValue(url.searchParams);
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  const reqBody = (req as any).body;
  const reqFiles = (req as any).files;
  let files: FilesValue = {};

  if (reqFiles) {
    for (const file of reqFiles) {
      files = appendValueToArrayValueMap<FileValue>(files, file.fieldname, {
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    }
  }

  const request: RequestValue = {
    body: reqBody,
    cookies,
    files,
    headers: req.headers,
    method: req.method as MethodValue,
    params: {},
    path: url.pathname!,
    query,
    url: req.url!,
  };

  return request;
};

export const createResponseValue = (): ResponseValue => {
  const response: ResponseValue = {
    headers: {},
  };
  return response;
};

export const createNotFoundResponseValue = (): ResponseValue => {
  return {
    headers: {
      "Content-Type": "text/plain",
    },
    status: 404,
    body: "server-mockr: Not Found",
  };
};

export const respondWithResponseValue = async (
  res: ServerResponse,
  response: ResponseValue
): Promise<void> => {
  return new Promise((resolve) => {
    res.statusCode = response.status || 200;

    for (const [name, value] of Object.entries(response.headers)) {
      if (value !== undefined) {
        res.setHeader(name, value);
      }
    }

    res.end(response.body, resolve);
  });
};

export const createDefaultedConfig = (
  providedConfig?: ConfigValue,
  definitions: ConfigDefinition[] = []
): ConfigValue => {
  const configDefaults: ConfigValue = {};

  for (const def of definitions) {
    configDefaults[def.name] = def.schema.default;
  }

  return { ...configDefaults, ...providedConfig };
};

export const createDefaultedState = (
  providedState?: StateValue,
  definitions: StateDefinition[] = []
): StateValue => {
  const stateDefaults: StateValue = {};

  for (const def of definitions) {
    stateDefaults[def.name] = def.schema.default;
  }

  return { ...stateDefaults, ...providedState };
};

export const cookiesValueToCookieHeader = (
  cookies: CookiesValue
): string | undefined => {
  const pairs: string[] = [];

  for (const [name, value] of Object.entries(cookies)) {
    pairs.push(cookie.serialize(name, value));
  }

  const header = pairs.join("; ");

  return header === "" ? undefined : header;
};

export const queryValueToURLSearchParams = (
  query: QueryValue
): URLSearchParams => {
  const result = new URLSearchParams();

  for (const [name, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const arrayValue of value) {
        result.append(name, arrayValue);
      }
    } else if (typeof value === "string") {
      result.append(name, value);
    }
  }

  return result;
};

export const urlSearchParamsToQueryValue = (
  searchParams: URLSearchParams
): QueryValue => {
  const result: QueryValue = {};

  for (const [name, value] of searchParams) {
    const currentValue = result[name];
    if (Array.isArray(currentValue)) {
      currentValue.push(value);
    } else if (typeof currentValue === "string") {
      result[name] = [currentValue, value];
    } else {
      result[name] = value;
    }
  }

  return result;
};

export const headersValueToHeaders = (headers: HeadersValue): Headers => {
  const result = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const arrayValue of value) {
        result.append(name, arrayValue);
      }
    } else if (typeof value === "string") {
      result.append(name, value);
    }
  }

  return result;
};

export const headersToHeadersValue = (headers: Headers): HeadersValue => {
  const result: HeadersValue = {};

  for (const [name, value] of headers) {
    result[name] = value.includes(", ") ? value.split(", ") : value;
  }

  return result;
};

export const incomingRequestValueToOutgoingRequestValue = (
  req: RequestValue
): OutgoingRequestValue => {
  let body;

  if (typeof req.body === "string") {
    body = req.body;
  } else {
    const jsonBody = JSON.stringify(req.body);

    if (jsonBody !== "{}") {
      body = jsonBody;
    }
  }

  return {
    body,
    cookies: req.cookies,
    headers: req.headers,
    method: req.method,
    query: req.query,
    url: req.path,
  };
};

interface ArrayValueMap<T> {
  [name: string]: T | T[] | undefined;
}

export function appendValueToArrayValueMap<T>(
  obj: ArrayValueMap<T>,
  name: string,
  value: T | T[] | undefined
): ArrayValueMap<T> {
  const result: ArrayValueMap<T> = { ...obj };

  const currentValue = obj[name];

  if (!currentValue) {
    result[name] = value;
  } else if (Array.isArray(currentValue)) {
    if (Array.isArray(value)) {
      result[name] = [...currentValue, ...value];
    } else if (value !== undefined) {
      result[name] = [...currentValue, value];
    }
  } else {
    if (Array.isArray(value)) {
      result[name] = [currentValue, ...value];
    } else if (value !== undefined) {
      result[name] = [currentValue, value];
    }
  }

  return result;
}

export function mergeArrayValueMaps<T>(
  map1: ArrayValueMap<T>,
  map2: ArrayValueMap<T>
): ArrayValueMap<T> {
  let result: ArrayValueMap<T> = { ...map1 };

  for (const [name, value] of Object.entries(map2)) {
    result = appendValueToArrayValueMap(result, name, value);
  }

  return result;
}

export const mergeOutgoingRequestValues = (
  req1: OutgoingRequestValue,
  req2: OutgoingRequestValue
): OutgoingRequestValue => {
  const result: OutgoingRequestValue = {
    body: req2.body ?? req1.body,
    cookies: { ...req1.cookies, ...req2.cookies },
    headers: req2.headers ?? req1.headers,
    method: req2.method ?? req1.method,
    query: req2.query ?? req1.query,
    url: req2.url ?? req1.url,
  };

  if (req1.headers && req2.headers) {
    result.headers = mergeArrayValueMaps(
      req1.headers,
      req2.headers
    ) as RequestValue["headers"];
  }

  if (req1.query && req2.query) {
    result.query = mergeArrayValueMaps(
      req1.query,
      req2.query
    ) as RequestValue["query"];
  }

  return result;
};

export const executeOutgoingRequest = async (
  req: OutgoingRequestValue
): Promise<ResponseValue> => {
  const url = new URL(req.url);

  const init: RequestInit = {};

  init.headers = req.headers
    ? headersValueToHeaders(req.headers)
    : new Headers();

  if (typeof req.method === "string") {
    init.method = req.method;
  }

  if (typeof req.body === "string") {
    init.body = req.body;
  }

  if (req.query) {
    const searchParams = queryValueToURLSearchParams(req.query);

    if (searchParams) {
      url.search = searchParams.toString();
    }
  }

  if (req.cookies) {
    const cookieHeader = cookiesValueToCookieHeader(req.cookies);

    if (cookieHeader) {
      init.headers.append("Cookie", cookieHeader);
    }
  }

  const res = await fetch(url.href, init);
  const body = await res.text();
  const headers = headersToHeadersValue(res.headers);
  const status = res.status;
  const statusText = res.statusText;

  return {
    body,
    headers,
    status,
    statusText,
  };
};
