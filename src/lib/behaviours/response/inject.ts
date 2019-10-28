import {
  definitionToTransformer,
  TransformOperatorDefinition
} from "../../operators/adapters";
import { BehaviourFunction } from "../behaviour";

export interface InjectBehaviourItem {
  into?: "body" | "headers";
  placeholder: string;
  value: string | TransformOperatorDefinition;
}

export const inject = (
  items: InjectBehaviourItem[]
): BehaviourFunction => async ctx => {
  const { response } = ctx;

  for (const item of items) {
    const { placeholder, into, value } = item;

    let resolvedValue: any;

    if (typeof value === "object") {
      const transformer = definitionToTransformer(value);
      if (transformer) {
        resolvedValue = transformer(ctx);
      }
    } else {
      resolvedValue = value;
    }

    if (into === "body" && typeof response.body === "string") {
      response.body = response.body.replace(item.placeholder, resolvedValue);
    } else if (into === "headers") {
      for (const [headerName, headerValue] of Object.entries(
        response.headers
      )) {
        if (Array.isArray(headerValue)) {
          response.headers[headerName] = headerValue.map(x =>
            x.replace(placeholder, resolvedValue)
          );
        } else if (typeof headerValue === "string") {
          response.headers[headerName] = headerValue.replace(
            placeholder,
            resolvedValue
          );
        }
      }
    }
  }
};
