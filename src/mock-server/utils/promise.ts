/*
 * TYPES
 */

export interface WaitForConfig {
  exact?: number;
  max?: number;
  min?: number;
}

/*
 * DELAY
 */

export async function waitFor(min: number): Promise<void>;
export async function waitFor(min: number, max: number): Promise<void>;
export async function waitFor(config: WaitForConfig): Promise<void>;
export async function waitFor(
  minOrConfig: number | WaitForConfig,
  max?: number
): Promise<void> {
  let ms = 0;

  let exact;
  let min;

  if (typeof minOrConfig === "object") {
    exact = minOrConfig.exact;
    min = minOrConfig.min;
    max = minOrConfig.max;
  } else {
    min = minOrConfig;
  }

  if (typeof exact === "number") {
    ms = exact;
  } else if (typeof min === "number" && typeof max === "number") {
    ms = Math.floor(min + Math.random() * (max - min));
  }

  await new Promise((resolve) => setTimeout(resolve, ms));
}
