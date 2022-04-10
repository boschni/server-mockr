import { OutgoingRequestBuilder } from "../OutgoingRequestBuilder";
import { executeOutgoingRequest } from "../valueHelpers";
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

export class SendRequestAction
  extends OutgoingRequestBuilder
  implements ActionBuilder
{
  async execute(): Promise<void> {
    const outgoingRequest = this._build();
    await executeOutgoingRequest(outgoingRequest);
  }
}
