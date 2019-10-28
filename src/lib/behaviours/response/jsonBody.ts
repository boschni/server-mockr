import { BehaviourFunction } from "../behaviour";

export const jsonBody = (json: any): BehaviourFunction => async ({
  response
}) => {
  response.body = JSON.stringify(json);
  response.headers["Content-Type"] = "application/json";
};
