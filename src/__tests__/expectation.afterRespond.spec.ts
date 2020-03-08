import "jest";

import { delay, ServerMockr, setState, state } from "..";
import { get, setup, waitFor } from "./utils";

describe("expectation.afterRespond()", () => {
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
    test("should accept a custom function to execute", async () => {
      let ctxArgument;

      mockr
        .when("/test")
        .respond("ok")
        .afterRespond(ctx => {
          ctxArgument = ctx;
        });

      const res1 = await get("/test");

      expect(await res1.text()).toEqual("ok");
      expect(ctxArgument).toMatchObject({ req: { path: "/test" } });
    });

    test("should not block the response", async () => {
      mockr
        .when("/test", state("changed", undefined))
        .respond("notChanged")
        .afterRespond(delay(setState("changed", true), 200));

      mockr.when("/test", state("changed", true)).respond("changed");

      const res1 = await get("/test");
      const res2 = await get("/test");
      await waitFor(200);
      const res3 = await get("/test");

      expect(await res1.text()).toEqual("notChanged");
      expect(await res2.text()).toEqual("notChanged");
      expect(await res3.text()).toEqual("changed");
    });
  });
});
