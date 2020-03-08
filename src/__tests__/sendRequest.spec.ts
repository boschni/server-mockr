import "jest";

import { delay, sendRequest, ServerMockr, setState, state } from "..";
import { get, setup, waitFor } from "./utils";

describe("sendRequest()", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * RESPOND
   */

  describe("()", () => {
    test("should send a request", async () => {
      mockr
        .when("/test", state("called", undefined))
        .respond("notCalled")
        .afterRespond(setState("called", true));

      mockr.when("/test", state("called", true)).respond("called");

      mockr
        .when("/test-2")
        .respond("ok")
        .afterRespond(sendRequest("http://localhost:6273/test"));

      const res1 = await get("/test-2");
      const res2 = await get("/test");

      expect(await res1.text()).toEqual("ok");
      expect(await res2.text()).toEqual("called");
    });

    test("should be able to be delayed", async () => {
      mockr
        .when("/test", state("called", undefined))
        .respond("notCalled")
        .afterRespond(setState("called", true));

      mockr.when("/test", state("called", true)).respond("called");

      mockr
        .when("/test-2")
        .respond("ok")
        .afterRespond(delay(sendRequest("http://localhost:6273/test"), 400));

      const res1 = await get("/test-2");
      const res2 = await get("/test");
      await waitFor(400);
      const res3 = await get("/test");

      expect(await res1.text()).toEqual("ok");
      expect(await res2.text()).toEqual("notCalled");
      expect(await res3.text()).toEqual("called");
    });
  });
});
