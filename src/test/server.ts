import ServerMockr, { ExpectationDefinition } from "../index";

/*
 * CONTROL SERVER
 */

// tslint:disable
const serverMockr = new ServerMockr({
  controlServerPort: 6001,
  mockServerPort: 6002,
  globals: {
    mockServerUrl: "http://localhost:6002"
  },
  scenarios: [
    {
      id: "test-scenario",
      tags: ["something"],
      description: `
Here is some description.

Steps:
- Goto one
- Goto two

<a href="{{globals.mockServerUrl}}/redirect-to-app" target="_blank">Redirect to app</a>
      `,
      config: {
        locale: {
          type: "string",
          enum: ["nl-nl", "en-gb"],
          default: "en-gb"
        }
      },
      state: {
        todos: {
          type: "string",
          enum: ["saved"]
        }
      },
      expectations: (_config, _state) => {
        const expectations: ExpectationDefinition[] = [];

        expectations.push(createRedirectToAppExpectation());

        expectations.push(createCounterExpectation());

        expectations.push({
          match: {
            state: {
              pipe: [
                {
                  selectProperty: "todos"
                },
                {
                  equalTo: undefined
                }
              ]
            },
            request: {
              path: {
                startsWith: "/",
                equalTo: "/en-gb/todos"
              }
            }
          },
          verify: {
            request: {
              query: {
                matchObject: {
                  test: ["a", "b"]
                }
              }
            }
          },
          response: {
            headers: {
              "Set-Cookie": "SessionId=SomeSessionId; Path=/; HttpOnly"
            },
            jsonBody: {
              locale: "{{locale}}"
            },
            inject: [
              {
                into: "body",
                placeholder: "{{locale}}",
                value: {
                  selectJsonPointer: "/config/locale"
                }
              }
            ],
            delay: 1000
          },
          afterResponse: {
            setState: {
              todos: "saved"
            }
          }
        });

        expectations.push({
          match: {
            state: {
              matchObject: {
                todos: "saved"
              }
            },
            request: {
              path: {
                equalTo: "/en-gb/todos"
              }
            }
          },
          response: {
            body: "Saved"
          }
        });

        return expectations;
      }
    }
  ]
});

serverMockr.start();

function createRedirectToAppExpectation(): ExpectationDefinition {
  return {
    match: {
      request: {
        path: {
          equalTo: "/redirect-to-app"
        }
      }
    },
    response: {
      status: 301,
      headers: {
        Location: "{{mockServerUrl}}/{{locale}}/todos?test=a&test=b"
      },
      inject: [
        {
          into: "headers",
          placeholder: "{{mockServerUrl}}",
          value: {
            selectJsonPointer: "/globals/mockServerUrl"
          }
        },
        {
          into: "headers",
          placeholder: "{{locale}}",
          value: {
            selectJsonPointer: "/config/locale"
          }
        }
      ]
    }
  };
}

function createCounterExpectation(): ExpectationDefinition {
  let count = 0;

  return {
    id: "counter",
    match: {
      request: {
        path: {
          equalTo: "/count"
        }
      }
    },
    response: _ctx => {
      count++;
      return {
        jsonBody: {
          count
        }
      };
    }
  };
}
