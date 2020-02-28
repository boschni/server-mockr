import { ExpectationValue } from "../Values";
import { ResponseAction } from "./ResponseAction";

/*
 * TYPES
 */

export interface DelayConfig {
  exact?: number;
  max?: number;
  min?: number;
}

/*
 * ACTION
 */

export class DelayAction implements ResponseAction {
  constructor(private config: DelayConfig) {}

  async execute(_ctx: ExpectationValue): Promise<void> {
    const { exact, max, min } = this.config;

    let ms = 0;

    if (typeof exact === "number") {
      ms = exact;
    } else if (typeof min === "number" && typeof max === "number") {
      ms = Math.floor(min + Math.random() * (max - min));
    }

    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
