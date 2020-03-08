import "jest";
import fetch from "node-fetch";

import { ServerMockr } from "../";
import { InitialConfig } from "../lib/Config";

interface HeadersMap {
  [key: string]: string;
}

export function controlUrl(path: string) {
  return `http://localhost:6272${path}`;
}

export function mockUrl(path: string) {
  return `http://localhost:6273${path}`;
}

export function get(path: string, headers?: HeadersMap) {
  const url = path.startsWith("http") ? path : mockUrl(path);

  return fetch(url, {
    method: "GET",
    headers
  });
}

export function post(path: string, body?: any, headers?: HeadersMap) {
  const url = path.startsWith("http") ? path : mockUrl(path);

  headers = { ...headers };

  if (body && !(body instanceof URLSearchParams)) {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, {
    method: "POST",
    headers,
    body
  });
}

export function del(path: string, headers?: HeadersMap) {
  const url = path.startsWith("http") ? path : mockUrl(path);

  return fetch(url, {
    method: "DELETE",
    headers
  });
}

export async function waitFor(ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

export function setup(config?: InitialConfig) {
  const mockr = new ServerMockr({
    controlServerPort: 6272,
    mockServerPort: 6273,
    globals: {
      testValue: "something"
    },
    logLevel: "error",
    ...config
  });

  mockr.start();

  return mockr;
}
