import "jest";

import { globals, ServerMockr, setState, state, times } from "../";
import { get, setup } from "./utils";

describe("mockr.when()", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * WHEN
   */

  describe("when()", () => {
    test("should match when a custom context match function matches", async () => {
      mockr.when(({ req }) => req.path === "/test").respond("ok");
      const res = await get("/test");
      expect(res.text).toEqual("ok");
    });

    test("should not match when a custom context match function not matches", async () => {
      mockr.when(({ req }) => req.path === "/test").respond("ok");
      const res = await get("/invalid");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * GLOBAL PARAM
   */

  describe("globals()", () => {
    test("should match when a globals context matcher matches", async () => {
      mockr.when(globals("testValue", "something")).respond("ok");
      const res = await get("/test");
      expect(res.text).toEqual("ok");
    });

    test("should not match when a globals context matcher not matches", async () => {
      mockr.when(globals("testValue", "invalid")).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });
  });

  /*
   * STATE
   */

  describe("state()", () => {
    test("should match when a state context matcher matches", async () => {
      mockr.when("/test", state("a", "b")).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);

      mockr
        .when("/test")
        .afterRespond(setState("a", "b"))
        .respond("ok");
      const res2 = await get("/test");
      expect(res2.text).toEqual("ok");

      mockr.when("/test", state("a", "b")).respond("ok");
      const res3 = await get("/test");
      expect(res3.text).toEqual("ok");
    });

    test("should not retain state after clear", async () => {
      mockr.when("/test", state("a", "b")).respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });

    test("should be able to test on absence of state param", async () => {
      mockr.when("/test", state("absent", undefined)).respond("ok");
      const res = await get("/test");
      expect(res.text).toEqual("ok");
    });
  });

  /*
   * TIMES
   */

  describe("times()", () => {
    test("should respond only one time", async () => {
      mockr.when("/test", times(1)).respond("ok");
      const res = await get("/test");
      expect(res.text).toEqual("ok");
      const res2 = await get("/test");
      expect(res2.status).toEqual(404);
    });

    test("should respond two times", async () => {
      mockr.when("/test", times(2)).respond("ok");
      const res = await get("/test");
      expect(res.text).toEqual("ok");
      const res2 = await get("/test");
      expect(res2.text).toEqual("ok");
      const res3 = await get("/test");
      expect(res3.status).toEqual(404);
    });

    test("should continue to the next expectation", async () => {
      mockr.when("/test", times(1)).respond("ok");
      mockr.when("/test", times(1)).respond("ok2");
      const res = await get("/test");
      expect(res.text).toEqual("ok");
      const res2 = await get("/test");
      expect(res2.text).toEqual("ok2");
      const res3 = await get("/test");
      expect(res3.status).toEqual(404);
    });
  });
});
