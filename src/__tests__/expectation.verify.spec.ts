import "jest";

import { request, response, ServerMockr } from "..";
import { get, post, setup } from "./utils";

describe("expectation.verify()", () => {
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

  describe("()", () => {
    test("should match when verify matches", async () => {
      mockr
        .when("/test")
        .verify("/test")
        .respond("ok");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when verify not matches", async () => {
      mockr
        .when("/test")
        .verify("/test-2")
        .respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(400);
      expect(await res.json()).toMatchObject({
        verifyResult: { message: "matches request" }
      });
    });

    test("should be able to do conditional validation", async () => {
      mockr
        .when("/test")
        .verify(({ req }) =>
          req.headers["no-validate"] ? true : request().body({ a: "b" })
        )
        .respond("ok");

      const res = await post("/test", { a: "c" }, { "no-validate": "true" });
      expect(res.status).toEqual(200);

      const res2 = await post("/test", { a: "c" });
      expect(res2.status).toEqual(400);
      expect(await res2.json()).toMatchObject({
        verifyResult: { message: "matches request" }
      });
    });

    test("should send custom verify failed response if defined", async () => {
      mockr
        .when("/test")
        .verify("/test-2")
        .verifyFailedRespond(response("Server Error").status(500))
        .respond("ok");
      const res = await get("/test");
      expect(await res.text()).toEqual("Server Error");
      expect(res.status).toEqual(500);
    });
  });
});
