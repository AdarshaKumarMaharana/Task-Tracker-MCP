import { describe, it, expect } from "vitest";
import { create_taskHandler } from "../src/tools/create_task";

describe("create_task", () => {
  it("returns a content array", async () => {
    const result = await create_taskHandler({} as any);
    expect(result).toBeTruthy();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
  });
});

