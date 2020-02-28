# Server Mockr

Mock HTTP APIs for rapid development and reliable testing.

**Table of Contents**

<!-- toc -->

- [How does it work?](#how-does-it-work)
- [Install](#install)
- [Usage](#usage)
  - [Specifying requests](#specifying-requests)
    - [Request path](#request-path)
    - [Request params](#request-params)
    - [Request method](#request-method)
    - [Request body](#request-body)
    - [Request query string](#request-query-string)
    - [Request headers](#request-headers)
    - [Request cookies](#request-cookies)
    - [Request url](#request-url)
  - [Specifying responses](#specifying-responses)
    - [Response status](#response-status)
    - [Response body](#response-body)
    - [Response headers](#response-headers)
    - [Response cookies](#response-cookies)
    - [Response delay](#response-delay)
    - [Response redirect](#response-redirect)
  - [Specifying times](#specifying-times)
  - [Specifying data for all responses](#specifying-data-for-all-responses)
  - [Verifying requests](#verifying-requests)
  - [Scenarios](#scenarios)
    - [Starting scenarios](#starting-scenarios)
    - [Scenario bootstrapping](#scenario-bootstrapping)
  - [Matchers](#matchers)
    - [allOf](#allOf)
    - [anyOf](#anyOf)
    - [endsWith](#endsWith)
    - [includes](#includes)
    - [isEqualTo](#isEqualTo)
    - [isGreatherThan](#isGreaterThan)
    - [isGreatherThanOrEqual](#isGreaterThanOrEqual)
    - [isLowerThan](#isLowerThan)
    - [isLowerThanOrEqual](#isLowerThanOrEqual)
    - [matchesObject](#matchesObject)
    - [matchesRegex](#matchesRegex)
    - [not](#not)
    - [oneOf](#oneOf)
    - [pointer](#pointer)
    - [prop](#prop)
    - [startsWith](#startsWith)

<!-- tocstop -->

## How does it work?

When Server Mockr receives a request it matches the request against all active scenarios and expectations that have been configured. It will verify the request if needed and respond as configured in the expectation. When no matching expectation is found, the mock server will return a 404.

Server Mockr will spin up two servers on startup: the mock server and the control server. The control server has a GUI and a REST API that can be used to control the mock server. It can be used to view, start and stop scenarios or retrieve request logs.

## Install

```sh
$ npm install server-mockr --save-dev
```

## Usage

You can setup a mock server like this:

```js
const { ServerMockr } = require("server-mockr");

const mockr = new ServerMockr();
mockr.when("/todos/1").respond({ id: 1, completed: true });
mockr.start();
```

This setup says that we will match every HTTP call to `/todos/1` and respond with a status 200 JSON response.

By default the mock server is available at http://localhost:3001 and the control server at http://localhost:3002.

### Specifying requests

#### Request path

Using a string:

```js
mockr.when("/resource").respond("ok");
```

Using a string with parameters:

```js
mockr.when("/resources/:id").respond("ok");
```

Using a regular expression:

```js
mockr.when(/\.html$/).respond("ok");
```

Using a request matcher:

```js
mockr.when(request("/resource")).respond("ok");
```

Using the path method on a request matcher:

```js
mockr.when(request().path("/resource")).respond("ok");
```

Using the path method on a request matcher with a value matcher:

```js
mockr.when(request().path(startsWith("/res"))).respond("ok");
```

Using the path method on a request matcher with a custom value matcher:

```js
mockr.when(request().path(path => path.includes("todos"))).respond("ok");
```

#### Request params

Request path parameters can be matched by using the `param` method:

```js
mockr.when(request("/resources/:id").param("id", "1")).respond("ok");
```

#### Request method

The request method can be specified by using the `method` method or the with the `get,post,put,delete` shortcut methods.

Using the `method` method:

```js
mockr.when(request("/resource").method("POST")).respond("ok");
```

Using a shortcut method:

```js
mockr.when(request().post("/resource")).respond("ok");
```

#### Request body

The request body can be specified by using the `body` method.

Body with exact matcher:

```js
mockr
  .when(
    request()
      .post("/resources")
      .body({ firstName: "First", lastName: "Last" })
  )
  .respond({ id: 1, firstName: "First", lastName: "Last" });
```

Body with partial matcher:

```js
mockr
  .when(
    request()
      .post("/resources")
      .body(matchesObject({ firstName: "First" }))
  )
  .respond({ id: 1, firstName: "First", lastName: "Last" });
```

Body with property matcher:

```js
mockr
  .when(
    request()
      .post("/resources")
      .body(prop("firstName", startsWith("F")))
  )
  .respond({ id: 1, firstName: "First", lastName: "Last" });
```

Body with multiple matchers:

```js
mockr
  .when(
    request()
      .post("/resources")
      .body(prop("firstName", startsWith("F")))
      .body(prop("lastName", startsWith("L")))
  )
  .respond({ id: 1, firstName: "First", lastName: "Last" });
```

Body with custom matcher:

```js
mockr
  .when(
    request()
      .post("/resources")
      .body(body => body.firstName.startsWith("F"))
  )
  .respond({ id: 1, firstName: "First", lastName: "Last" });
```

#### Request query string

The request query string can be specified by using the `query` method.

Query string with single parameter (`/resources?limit=100`):

```js
mockr
  .when(
    request()
      .get("/resources")
      .query("limit", "100")
  )
  .respond("ok");
```

Query string with array parameter (`/resources?id=1&id=2`):

```js
mockr
  .when(
    request()
      .get("/resources")
      .query("id", ["1", "2"])
  )
  .respond("ok");
```

Query string with multiple parameters (`/resources?limit=100&order=asc`):

```js
mockr
  .when(
    request()
      .get("/resources")
      .query("limit", "100")
      .query("order", "asc")
  )
  .respond("ok");
```

Query string with multiple paramters and matchers (`/resources?limit=99&order=asc`):

```js
mockr
  .when(
    request()
      .get("/resources")
      .query("limit", matchesRegex(/[0-9]+/))
      .query("order", anyOf("asc", "desc"))
  )
  .respond("ok");
```

Query string with custom matcher:

```js
mockr
  .when(
    request()
      .get("/resources")
      .query(query => query.limit === "100")
  )
  .respond("ok");
```

#### Request headers

Request headers can be specified by using the `header` method.

Single header:

```js
mockr
  .when(
    request()
      .get("/resources")
      .header("Authorization", "token")
  )
  .respond("ok");
```

Multiple headers:

```js
mockr
  .when(
    request()
      .get("/resources")
      .header("Authorization", "token")
      .header("Accept-Language", includes("nl-NL"))
  )
  .respond("ok");
```

#### Request cookies

Cookies can be specified by using the `cookie` method.

```js
mockr
  .when(
    request()
      .get("/resources")
      .cookie("sessionId", "id")
  )
  .respond("ok");
```

#### Request url

The `url` method allows you to match on the exact url:

```js
mockr.when(request().url("/resources?limit=100&order=asc")).respond("ok");
```

### Specifying responses

#### Response status

Using the `respond` method to specify the response status code:

```js
mockr.when("/resource").respond(404);
```

Using the `respond` method to specify the response status code and body:

```js
mockr.when("/resource").respond(404, "Not Found");
```

Use the `status` method to specify the response status code:

```js
mockr.when("/resource").respond(response().status(404));
```

#### Response body

Using a string, will respond with a status 200 text response:

```js
mockr.when("/resource").respond("ok");
```

Using an object, will respond with a status 200 JSON response:

```js
mockr.when("/resource").respond({ id: 1 });
```

Using a response builder, will respond with a status 200 text response:

```js
mockr.when("/resource").respond(response("match"));
```

Using a response builder with the `body` method:

```js
mockr.when("/resource").respond(response().body("match"));
```

Using a custom function, this can be useful to inject request values:

```js
mockr
  .when("/resources/:id")
  .respond(({ req }) => response({ id: req.params.id });
```

Using a promise:

```js
mockr
  .when("/resources/:id")
  .respond(({ req }) => {
    const resource = await fetchResource(req.params.id);
    return response(resource);
  });
```

#### Response headers

Use the `header` method to specify response headers:

```js
mockr
  .when("/resource")
  .respond(response("ok").header("Cache-Control", "no-cache"));
```

#### Response cookies

Use the `cookie` method to specify response cookies:

```js
mockr.when("/resource").respond(response("ok").cookie("sessionId", "ID"));
```

Cookie options can be set with an additional argument:

```js
mockr
  .when("/resource")
  .respond(response("ok").cookie("sessionId", "ID", { httpOnly: true }));
```

#### Response delay

Use the `delay` method to delay a response in miliseconds:

```js
mockr.when("/resource").respond(response("ok").delay(1000));
```

Use the second argument to specify a minimum and maximum delay:

```js
mockr.when("/resource").respond(response("ok").delay(1000, 2000));
```

#### Response redirect

Use the `redirect` method specify a 302 redirect:

```js
mockr.when("/resource").respond(response().redirect("/new-resource"));
```

### Specifying times

Use the `times` matcher to specify how many times an expectation should match:

```js
mockr.when("/resource", times(1)).respond("First time");
mockr.when("/resource", times(1)).respond("Second time");
```

### Specifying data for all responses

It is possible to set response data for all responses using the `next` method.

When calling the `next` method, the expectation will not respond.
Instead, it will set the specified response data and proceed to the next matching expectation.

```js
mockr
  .when("*")
  .respond(response().header("Access-Control-Allow-Origin", "*"))
  .next();

mockr.when("/resource").respond("match with cors");
```

### Verifying requests

Using the `verify` method, it is possible to verify if a matched request, matches certain conditions.
By default, the mock server will return a status 400 JSON response containing the validation error.
It is possible to override the default response with the `verifyFailedRespond` method.

Default verify, will respond with a status 400 JSON response containing the verification error:

```js
mockr
  .when(request().post("/resources"))
  .verify(request().body({ firstName: "First" }))
  .respond("ok");
```

Verify with custom response:

```js
mockr
  .when(request().post("/resources"))
  .verify(request().body({ firstName: "First" }))
  .verifyFailedRespond(response("Server Error").status(500))
  .respond("ok");
```

### Scenarios

Scenarios can be used to group expectations together.
They can be started and stopped programmatically, with the GUI or with the REST API.
Scenarios can also contain state, which is useful when simulating stateful web services.

```js
const scenario = mockr.scenario("todo-scenario");

// Respond with empty todos list
scenario.when(request().get("/todos"), state("todos", undefined)).respond([]);

// Set todos to "saved"
scenario
  .when(request().post("/todos"))
  .respond({ id: 1 })
  .afterRespond(setState("todos", "saved"));

// Respond with todos list
scenario
  .when(request().get("/todos"), state("todos", "saved"))
  .respond([{ id: 1 }]);
```

#### Starting scenarios

A scenario can be started in a few different ways.

Using the GUI:

Open a browser and navigate to the control server (by default http://localhost:3001).
Click on the start button to start a scenario.

Using the REST API:

```
POST http://localhost:3001/api/scenarios/{scenarioID}/start
```

Using the REST API with default state:

```
POST http://localhost:3001/api/scenarios/{scenarioID}/start?state[todos]=saved
```

Using the JavaScript API:

```js
mockr
  .scenario("todo-scenario")
  .when(request().get("/todos"))
  .respond([]);

mockr.startScenario("todos");
```

Using the JavaScript API with default state:

```js
mockr
  .scenario("todo-scenario")
  .when(request().get("/todos"), state("todos", "saved"))
  .respond([{ id: 1 }]);

mockr.startScenario("todos", { todos: "saved" });
```

#### Scenario bootstrapping

Bootstrapping can be used to bootstrap a client.

This can be useful if you for example want to redirect a client to the application under test with certain parameters:

```js
mockr
  .scenario("todo-scenario")
  .onBootstrap(ctx =>
    response().redirect(`https://example.com/${ctx.state.locale}/todos`)
  )
  .when(request().get("/todos"))
  .respond([{ id: 1 }]);
```

The client can then be bootstrapped by navigating with the client to the following address:

```
GET http://localhost:3001/api/scenarios/{scenarioID}/start-and-bootstrap?state[locale]=nl-nl
```

### Matchers

Matchers are functions which can be used to match values.

#### allOf

The `allOf` matcher can be used to check if some value matches all given matchers:

```js
mockr
  .when(request().path(allOf(startsWith("/static"), endsWith(".png"))))
  .respond("ok");
```

#### anyOf

The `anyOf` matcher can be used to check if some value matches any given matcher:

```js
mockr
  .when(request().path(anyOf(endsWith(".jpg"), endsWith(".png"))))
  .respond("ok");
```

Or when given values:

```js
mockr.when(request().query("order", anyOf("asc", "desc"))).respond("ok");
```

#### endsWith

The `endsWith` matcher can be used to check if a string ends with some suffix:

```js
mockr.when(request().path(endsWith(".html"))).respond("ok");
```

#### includes

The `includes` matcher can be used to check if a string includes some other string:

```js
mockr.when(request().path(includes("todo"))).respond("ok");
```

#### isEqualTo

The `isEqualTo` matcher can be used to check if a value is equal to some other value:

```js
mockr.when(request().path(isEqualTo("/todos"))).respond("ok");
```

#### isGreaterThan

The `isGreaterThan` matcher can be used to check if a number is greater than some other number:

```js
mockr.when(request().body(prop("count", isGreaterThan(5)))).respond("ok");
```

#### isGreaterThanOrEqual

The `isGreaterThanOrEqual` matcher can be used to check if a number is greater than or equal to some other number:

```js
mockr
  .when(request().body(prop("count", isGreaterThanOrEqual(5))))
  .respond("ok");
```

#### isLowerThan

The `isLowerThan` matcher can be used to check if a number is lower than some other number:

```js
mockr.when(request().body(prop("count", isLowerThan(5)))).respond("ok");
```

#### isLowerThanOrEqual

The `isLowerThanOrEqual` matcher can be used to check if a number is lower than or equal to some other number:

```js
mockr.when(request().body(prop("count", isLowerThanOrEqual(5)))).respond("ok");
```

#### matchesObject

The `matchesObject` matcher can be used to check if an object partially matches some other object:

```js
mockr.when(request().body(matchesObject({ id: 1 }))).respond("ok");
```

#### matchesRegex

The `matchesRegex` matcher can be used to check if a string matches some regex:

```js
mockr
  .when(request().header("Authorization", matchesRegex(/[a-z0-9]+/)))
  .respond("ok");
```

#### not

The `not` matcher can be used to negate other matchers:

```js
mockr.when(request().path(not(startsWith("/res")))).respond("ok");
```

When given a value, it will check if the value is not equal to:

```js
mockr.when(request().path(not("/res"))).respond("ok");
```

#### oneOf

The `oneOf` matcher can be used to check if some value matches exactly one of the given matchers:

```js
mockr
  .when(request().path(oneOf(startsWith("/static"), endsWith(".png"))))
  .respond("ok");
```

#### pointer

The `pointer` matcher can be used to check if the value referenced by the pointer matches some matcher:

```js
mockr
  .when(request().body(pointer("/addresses/0/street", includes("Street"))))
  .respond("ok");
```

#### prop

The `prop` matcher can be used to check if a property value matches some matcher:

```js
mockr.when(request().body(prop("firstName", startsWith("F")))).respond("ok");
```

#### startsWith

The `startsWith` matcher can be used to check if a string starts with some prefix:

```js
mockr.when(request().path(startsWith("/res"))).respond("ok");
```
