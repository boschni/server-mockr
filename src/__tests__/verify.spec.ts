import "jest";

import { ServerMockr } from "../";
import { get, setup } from "./utils";

describe("verify()", () => {
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
      expect(res.text).toEqual("ok");
    });

    test("should not match when verify not matches", async () => {
      mockr
        .when("/test")
        .verify("/test-2")
        .respond("ok");
      const res = await get("/test");
      expect(res.body.message).toEqual("matches request");
      expect(res.status).toEqual(400);
    });
  });
});
