import { OutgoingRequestBuilder } from "../OutgoingRequestBuilder";
import { executeOutgoingRequest } from "../valueHelpers";
import { ExpectationValue } from "../Values";
import { ActionBuilder } from "./Action";

/*
 * FACTORY
 */

export function sendRequest(url: string): SendRequestAction {
  return new SendRequestAction(url);
}

/*
 * ACTION
 */

export class SendRequestAction extends OutgoingRequestBuilder
  implements ActionBuilder {
  async execute(_ctx: ExpectationValue): Promise<void> {
    const outgoingRequest = this._build();
    await executeOutgoingRequest(outgoingRequest);
  }
}
