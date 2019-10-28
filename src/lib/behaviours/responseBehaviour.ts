import { ExpectationValue } from "../Values";
import { applyBehaviours } from "./behaviour";
import {
  ResponseBehaviourDefinition,
  responseBehaviourMap,
  responseBehaviourOrder
} from "./response";

export const applyResponseBehaviours = async (
  def: ResponseBehaviourDefinition | ResponseBehaviourDefinitionFactory,
  ctx: ExpectationValue
): Promise<void> => {
  try {
    await applyBehaviours(
      responseBehaviourMap,
      responseBehaviourOrder,
      ctx,
      def
    );
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.error(err);
    ctx.response.status = 500;
    ctx.response.body = String(err);
  }
};

type ResponseBehaviourDefinitionFactory = (
  ctx: ExpectationValue
) => ResponseBehaviourDefinition;
