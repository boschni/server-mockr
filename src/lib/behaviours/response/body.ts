import { BehaviourFunction } from "../behaviour";

export const body = (text: string): BehaviourFunction => async ({
  response
}) => {
  response.body = String(text);
  response.headers["Content-Type"] = "text/plain";
};
