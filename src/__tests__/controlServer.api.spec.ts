import "jest";

import { config, response, ServerMockr, state } from "..";
import { controlUrl, get, mockUrl, post, setup } from "./utils";

describe("controlServer", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * POST /api/scenarios/:id/scenario-runners
   */

  describe("POST /api/scenarios/:id/scenario-runners", () => {
    test("should start a scenario", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");

      const controlRes = await post(
        controlUrl("/api/scenarios/id/scenario-runners")
      );
      expect(await controlRes.json()).toMatchObject({
        id: 1,
        scenarioId: "id",
        status: "STARTED"
      });

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should be able to set config", async () => {
      mockr
        .scenario("id")
        .config("language", { type: "string", default: "en" })
        .when("/test", config("language", "nl"))
        .respond("ok");

      await post(
        controlUrl("/api/scenarios/id/scenario-runners?config[language]=nl")
      );

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should be able to set state", async () => {
      mockr
        .scenario("id")
        .state("language", { type: "string", default: "en" })
        .when("/test", state("language", "nl"))
        .respond("ok");

      await post(
        controlUrl("/api/scenarios/id/scenario-runners?state[language]=nl")
      );

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });
  });

  /*
   * GET /api/scenarios/:id/scenario-runners/create-and-bootstrap
   */

  describe("GET /api/scenarios/:id/scenario-runners/create-and-bootstrap", () => {
    test("should start a scenario", async () => {
      mockr
        .scenario("id")
        .onBootstrap(() => response().redirect(mockUrl("/redirected")))
        .when("/redirected")
        .respond("redirected");

      const controlRes = await get(
        controlUrl("/api/scenarios/id/scenario-runners/create-and-bootstrap")
      );

      expect(await controlRes.text()).toEqual("redirected");
    });

    test("should be able to set config", async () => {
      mockr
        .scenario("id")
        .config("language", { type: "string", default: "en" })
        .when("/test", config("language", "nl"))
        .respond("ok");

      await get(
        controlUrl(
          "/api/scenarios/id/scenario-runners/create-and-bootstrap?config[language]=nl"
        )
      );

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should be able to set state", async () => {
      mockr
        .scenario("id")
        .state("language", { type: "string", default: "en" })
        .when("/test", state("language", "nl"))
        .respond("ok");

      await get(
        controlUrl(
          "/api/scenarios/id/scenario-runners/create-and-bootstrap?state[language]=nl"
        )
      );

      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });
  });

  /*
   * GET /api/scenarios/:id/scenario-runners/stop
   */

  describe("GET /api/scenarios/:id/scenario-runners/stop", () => {
    test("should stop a scenario", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");

      await post(controlUrl("/api/scenarios/id/scenario-runners"));
      await post(controlUrl("/api/scenarios/id/scenario-runners/stop"));
      const mockRes = await get("/test");
      expect(mockRes.status).toEqual(404);
    });
  });
});
