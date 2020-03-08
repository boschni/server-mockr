/*
 * TYPES
 */

export type LogLevel = "info" | "error";

/*
 * LOGGER
 */

export class Logger {
  constructor(private level: LogLevel = "info") {}

  log(level: LogLevel, message: unknown) {
    if (this.level === "error" && level === "info") {
      return;
    }

    // tslint:disable-next-line
    console.log(message);
  }
}
