import { StateValue } from "../../Values";
import { BehaviourFunction } from "../behaviour";

export const setState = (newState: StateValue): BehaviourFunction => async ({
  state
}) => {
  for (const key of Object.keys(newState)) {
    state[key] = newState[key];
  }
};
