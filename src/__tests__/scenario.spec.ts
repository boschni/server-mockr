import "jest";

import { request, ServerMockr, setState, state } from "../";
import { get, setup } from "./utils";

describe("scenario()", () => {
  let mockr: ServerMockr;

  beforeAll(() => {
    mockr = setup();
  });

  afterAll(() => mockr.stop());

  beforeEach(() => {
    mockr.clear();
  });

  /*
   * scenario()
   */

  describe("()", () => {
    test("should match when started", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");
      mockr.startScenario("id");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match when not started", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });

    test("should not match when stopped", async () => {
      mockr
        .scenario("id")
        .when("/test")
        .respond("ok");
      mockr.startScenario("id");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
      mockr.stopScenario("id");
      const res2 = await get("/test");
      expect(res2.status).toEqual(404);
    });

    test("should match multiple expectations", async () => {
      const scenario = mockr.scenario("id");
      scenario.when("/test").respond("ok");
      scenario.when("/test-2").respond("ok");
      mockr.startScenario("id");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
      const res2 = await get("/test-2");
      expect(await res2.text()).toEqual("ok");
    });

    test("should be able to add expectations in onStart callback", async () => {
      mockr.scenario("id").onStart(({ scenario }) => {
        scenario.when("/test").respond("ok");
      });
      mockr.startScenario("id");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("expectations added in onStart not persist on restart", async () => {
      mockr.scenario("id").onStart(({ scenario }) => {
        scenario
          .when("/test")
          .afterRespond(ctx =>
            setState("count", ctx.state.count ? ctx.state.count + 1 : 1)
          )
          .next();
        scenario.when("/test", state("count", 2)).respond("ok");
      });
      mockr.startScenario("id");
      const res = await get("/test");
      expect(res.status).toEqual(404);
      mockr.stopScenario("id");
      mockr.startScenario("id");
      const res2 = await get("/test");
      expect(res2.status).toEqual(404);
    });

    test("should only have one active scenario if configured", async () => {
      await mockr.stop();
      mockr = setup({ multipleActiveScenarios: false });

      mockr
        .scenario("id1")
        .when("/test-1")
        .respond("ok1");

      mockr
        .scenario("id2")
        .when("/test-2")
        .respond("ok2");

      mockr.startScenario("id1");
      const res = await get("/test-1");
      expect(await res.text()).toEqual("ok1");
      mockr.startScenario("id2");
      const res2 = await get("/test-1");
      expect(res2.status).toEqual(404);
      const res3 = await get("/test-2");
      expect(await res3.text()).toEqual("ok2");

      await mockr.stop();
      mockr = setup();
    });

    test("should be able to run multiple scenarios at once", async () => {
      await mockr.stop();
      mockr = setup({ multipleActiveScenarios: true });

      mockr
        .scenario("no-money")
        .config("userId", { type: "string" })
        .onStart(({ config, scenario }) => {
          scenario
            .when(
              request()
                .get("/users/:id/wallet")
                .param("id", config.userId)
            )
            .respond({ amount: 0 });
        });

      mockr
        .scenario("has-money")
        .config("userId", { type: "string" })
        .onStart(({ config, scenario }) => {
          scenario
            .when(
              request()
                .get("/users/:id/wallet")
                .param("id", config.userId)
            )
            .respond({ amount: 100 });
        });

      const id1 = mockr.startScenario("no-money", { config: { userId: "1" } });
      const id2 = mockr.startScenario("no-money", { config: { userId: "2" } });
      mockr.startScenario("has-money", { config: { userId: "3" } });

      const res = await get("/users/1/wallet");
      expect(await res.json()).toEqual({ amount: 0 });

      const res2 = await get("/users/2/wallet");
      expect(await res2.json()).toEqual({ amount: 0 });

      const res3 = await get("/users/3/wallet");
      expect(await res3.json()).toEqual({ amount: 100 });

      mockr.stopScenarioRunner(id1);

      const res4 = await get("/users/1/wallet");
      expect(res4.status).toEqual(404);

      const res5 = await get("/users/2/wallet");
      expect(await res5.json()).toEqual({ amount: 0 });

      mockr.stopScenarioRunner(id2);

      const res6 = await get("/users/2/wallet");
      expect(res6.status).toEqual(404);

      const res7 = await get("/users/3/wallet");
      expect(await res7.json()).toEqual({ amount: 100 });

      await mockr.stop();
      mockr = setup();
    });
  });

  /*
   * state()
   */

  describe(".state()", () => {
    test("should set default state", async () => {
      mockr
        .scenario("id")
        .state("language", { type: "string", default: "nl" })
        .when("/test", state("language", "nl"))
        .respond("ok");
      mockr.startScenario("id");
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should not match if default state does not match", async () => {
      mockr
        .scenario("id")
        .state("language", { type: "string", default: "nl" })
        .when("/test", state("language", "en"))
        .respond("ok");
      mockr.startScenario("id");
      const res = await get("/test");
      expect(res.status).toEqual(404);
    });

    test("should set given state", async () => {
      mockr
        .scenario("id")
        .state("language", { type: "string", default: "nl" })
        .when("/test", state("language", "en"))
        .respond("ok");
      mockr.startScenario("id", { state: { language: "en" } });
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should set given state even though it is not defined", async () => {
      mockr
        .scenario("id")
        .when("/test", state("language", "nl"))
        .respond("ok");
      mockr.startScenario("id", { state: { language: "nl" } });
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
    });

    test("should not keep state when restarted", async () => {
      mockr
        .scenario("id")
        .state("language", { type: "string", default: "en" })
        .when("/test", state("language", "nl"))
        .respond("ok");
      mockr.startScenario("id", { state: { language: "nl" } });
      const res = await get("/test");
      expect(await res.text()).toEqual("ok");
      mockr.stopScenario("id");
      mockr.startScenario("id");
      const res2 = await get("/test");
      expect(res2.status).toEqual(404);
    });
  });
});
