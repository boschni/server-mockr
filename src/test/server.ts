import ServerMockr, {
  isEqualTo,
  request,
  response,
  setStateParam,
  stateParam,
  times
} from "../index";
import { anyOf, isGreaterThanOrEqual } from "../lib/value-matchers";

/*
 * CONTROL SERVER
 */

const mockr = new ServerMockr({
  controlServerPort: 6001,
  mockServerPort: 6002,
  globals: {
    mockServerUrl: "http://localhost:6002"
  }
});

mockr.start();

mockr.when(request("/test")).respond(response("test"));

mockr
  .scenario("test-scenario")
  .tags(["something"])
  .description(
    `Here is some description.

Steps:
- Goto one
- Goto two`
  )
  .stateParam("locale", {
    type: "string",
    enum: ["nl-nl", "en-gb"],
    default: "en-gb"
  })
  .stateParam("todos", {
    type: "string",
    enum: ["saved"],
    hidden: true
  })
  .onBootstrap(({ globals, state }) =>
    response().redirect(
      `${globals.mockServerUrl}/${state.locale}/todos?test=a&test=b`
    )
  )
  .onStart(({ when }) => {
    let count = 0;

    when(request("/count"))
      .respond(() => response(count))
      .afterResponse(() => {
        count++;
      });

    when(request("/times"), times(1)).respond(response(1));
    when(request("/times"), times(1)).respond(response(2));
    when(request("/times"), times(isGreaterThanOrEqual(0))).respond(
      response(3)
    );

    when(request(anyOf(isEqualTo("/any-1"), isEqualTo("/any-2")))).respond(
      response("any")
    );

    when(
      request("/en-gb/todos/:id")
        .method("GET")
        .pathParam("id", "1")
        .pathParam("id", isEqualTo("1")),
      times(2)
    ).respond(({ req }) => response().json({ id: req.params.id }));

    when(request("/en-gb/todos"), stateParam("todos", undefined))
      .verify(request().query("test", ["a", "b"]))
      .respond(({ state }) =>
        response()
          .header("Set-Cookie", "SessionId=SomeSessionId; Path=/; HttpOnly")
          .delay(1000)
          .json({ locale: state.locale })
      )
      .afterResponse(setStateParam("todos", "saved"));
  });
