import { OutgoingRequestBuilder } from "../OutgoingRequestBuilder";
import {
  executeOutgoingRequest,
  incomingRequestValueToOutgoingRequestValue,
  mergeOutgoingRequestValues
} from "../valueHelpers";
import { ExpectationValue } from "../Values";
import { RespondAction } from "./RespondAction";

/*
 * ACTION
 */

export class ProxyAction implements RespondAction {
  constructor(private builder: OutgoingRequestBuilder) {}

  async execute(ctx: ExpectationValue): Promise<void> {
    const outgoingRequestValueCtx = incomingRequestValueToOutgoingRequestValue(
      ctx.req
    );

    const outgoingRequestValueProxy = this.builder._build();

    const outgoingRequestValue = mergeOutgoingRequestValues(
      outgoingRequestValueCtx,
      outgoingRequestValueProxy
    );

    const path = outgoingRequestValueProxy.path ?? ctx.req.path;
    outgoingRequestValue.url = `${outgoingRequestValueProxy.url}${path}`;

    const responseValue = await executeOutgoingRequest(outgoingRequestValue);

    for (const [key, value] of Object.entries(responseValue)) {
      (ctx.res as any)[key] = value;
    }
  }
}
