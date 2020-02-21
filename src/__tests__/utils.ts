import "jest";
import agent from "superagent";

import { ServerMockr } from "../";

function url(path: string) {
  return `http://localhost:6273${path}`;
}

export function get(path: string) {
  return agent.get(url(path)).ok(() => true);
}

export function post(path: string) {
  return agent.post(url(path)).ok(() => true);
}

export function del(path: string) {
  return agent.delete(url(path)).ok(() => true);
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
