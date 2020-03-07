import ServerMockr, {
  isEqualTo,
  request,
  response,
  setState,
  state
} from "../index";
import { anyOf } from "../lib/value-matchers";

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
  .state("locale", {
    type: "string",
    enum: ["nl-nl", "en-gb"],
    default: "en-gb"
  })
  .state("todos", {
    type: "string",
    enum: ["saved"],
    hidden: true
  })
  .onBootstrap(ctx =>
    response().redirect(
      `${ctx.globals.mockServerUrl}/${ctx.state.locale}/todos?test=a&test=b`
    )
  )
  .onStart(({ scenario }) => {
    let count = 0;

    scenario
      .when(request("/count"))
      .respond(() => response(count))
      .afterRespond(() => {
        count++;
      });

    scenario
      .when(request("/times"))
      .times(1)
      .respond(response(1));

    scenario
      .when(request("/times"))
      .times(1)
      .respond(response(2));

    scenario
      .when(request("/times"))
      .times(1)
      .respond(response(3));

    scenario
      .when(request(anyOf(isEqualTo("/any-1"), isEqualTo("/any-2"))))
      .respond(response("any"));

    scenario
      .when(
        request("/en-gb/todos/:id")
          .method("GET")
          .param("id", "1")
          .param("id", isEqualTo("1"))
      )
      .times(2)
      .respond(({ req }) => response().json({ id: req.params.id }));

    scenario
      .when(request("/en-gb/todos"), state("todos", undefined))
      .verify(request().query("test", ["a", "b"]))
      .respond(ctx =>
        response()
          .header("Set-Cookie", "SessionId=SomeSessionId; Path=/; HttpOnly")
          .delay(1000)
          .json({ locale: ctx.state.locale })
      )
      .afterRespond(setState("todos", "saved"));
  });
