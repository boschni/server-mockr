import "jest";
import fetch from "node-fetch";

import { ServerMockr } from "../";

interface HeadersMap {
  [key: string]: string;
}

function url(path: string) {
  return `http://localhost:6273${path}`;
}

export function get(path: string, headers?: HeadersMap) {
  return fetch(url(path), {
    method: "GET",
    headers
  });
}

export function post(path: string, body?: any, headers?: HeadersMap) {
  headers = { ...headers };

  if (body && !(body instanceof URLSearchParams)) {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }

  return fetch(url(path), {
    method: "POST",
    headers,
    body
  });
}

export function del(path: string, headers?: HeadersMap) {
  return fetch(url(path), {
    method: "DELETE",
    headers
  });
}

export async function waitFor(ms: number) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

export function setup() {
  const mockr = new ServerMockr({
    controlServerPort: 6272,
    mockServerPort: 6273,
    globals: {
      testValue: "something"
    },
    logLevel: "error"
  });

  mockr.start();

  return mockr;
}
