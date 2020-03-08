import "jest";

import { ServerMockr } from "..";
import { get, setup } from "./utils";

describe("expectation.times()", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * TIMES
   */

  describe("()", () => {
    test("should respond only one time", async () => {
      mockr
        .when("/test")
        .times(1)
        .respond("ok");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
      const res2 = await get("/test");
      expect(res2.status).toEqual(404);
    });

    test("should respond two times", async () => {
      mockr
        .when("/test")
        .times(2)
        .respond("ok");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
      const res2 = await get("/test");
      expect(await res2.text()).toEqual("ok");
      const res3 = await get("/test");
      expect(res3.status).toEqual(404);
    });

    test("should continue to the next expectation", async () => {
      mockr
        .when("/test")
        .times(1)
        .respond("ok");
      mockr
        .when("/test")
        .times(1)
        .respond("ok2");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
      const res2 = await get("/test");
      expect(await res2.text()).toEqual("ok2");
      const res3 = await get("/test");
      expect(res3.status).toEqual(404);
    });
  });
});
