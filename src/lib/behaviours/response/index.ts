import { BehaviourFactoryMap } from "../behaviour";
import { body } from "./body";
import { cookies } from "./cookies";
import { delay } from "./delay";
import { headers } from "./headers";
import { inject } from "./inject";
import { jsonBody } from "./jsonBody";
import { status } from "./status";

export interface ResponseBehaviourDefinition {
  body?: Parameters<typeof body>[0];
  cookies?: Parameters<typeof cookies>[0];
  delay?: Parameters<typeof delay>[0];
  headers?: Parameters<typeof headers>[0];
  inject?: Parameters<typeof inject>[0];
  jsonBody?: Parameters<typeof jsonBody>[0];
  status?: Parameters<typeof status>[0];
}

export const responseBehaviourMap: BehaviourFactoryMap = {
  body,
  cookies,
  delay,
  headers,
  inject,
  jsonBody,
  status
};

export const responseBehaviourOrder: Array<
  keyof ResponseBehaviourDefinition
> = ["headers", "cookies", "body", "jsonBody", "inject", "status", "delay"];
