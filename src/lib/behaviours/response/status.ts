import { BehaviourFunction } from "../behaviour";

export const status = (code: number): BehaviourFunction => async ({
  response
}) => {
  response.status = code;
};
