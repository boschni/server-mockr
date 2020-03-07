import "jest";

import { response, ServerMockr } from "../";
import { get, setup } from "./utils";

describe("expectation.next()", () => {
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
    test("should fallthrough to the next expectation", async () => {
      mockr.when("/test").next();
      mockr.when("/test").respond("ok");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should be able to set partial response", async () => {
      mockr
        .when("*")
        .respond(response().header("Access-Control-Allow-Origin", "*"))
        .next();
      mockr.when("/test").respond("ok");
      const res = await get("/test");
      expect(res.headers.get("access-control-allow-origin")).toEqual("*");
    });

    test("values set in a next expectation should override the previous ones", async () => {
      mockr
        .when("/test")
        .respond("ok1")
        .next();
      mockr.when("/test").respond("ok2");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok2");
    });
  });
});
