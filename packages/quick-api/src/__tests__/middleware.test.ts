import { QuickApi } from "../lib";
import { describe, expect, it, vi } from "vitest";

const q = QuickApi();

const testEndpointContext = [
  { url: "http://localhost:8080" } as any,
  {} as any,
] as const;

describe("QuickApi", () => {
  it("should trigger middleware", async () => {
    const myMiddleware = vi.fn();

    const endpoint = q.endpoint({
      middlewares: [myMiddleware],
      callback: () => new Response("Test"),
    });

    await endpoint(...testEndpointContext);

    expect(myMiddleware).toHaveBeenCalledWith(...testEndpointContext);
  });
});
