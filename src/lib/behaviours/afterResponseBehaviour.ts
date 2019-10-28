import { ExpectationValue } from "../Values";
import {
  AfterResponseBehaviourDefinition,
  afterResponseBehaviourMap,
  afterResponseBehaviourOrder
} from "./afterResponse";
import { applyBehaviours } from "./behaviour";

export const applyAfterResponseBehaviours = async (
  def:
    | AfterResponseBehaviourDefinition
    | AfterResponseBehaviourDefinitionFactory,
  ctx: ExpectationValue
): Promise<void> => {
  try {
    await applyBehaviours(
      afterResponseBehaviourMap,
      afterResponseBehaviourOrder,
      ctx,
      def
    );
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.error(err);
  }
};

type AfterResponseBehaviourDefinitionFactory = (
  ctx: ExpectationValue
) => AfterResponseBehaviourDefinition;
