import { QuickApi } from "../lib";
import { describe, expect, it } from "vitest";
import { z } from "zod";

const q = QuickApi();

const testEndpointContext = [
  { url: "http://localhost:8080" } as any,
  {} as any,
] as const;

describe("QuickApi", () => {
  it("should be defined", () => {
    expect(q).toBeTruthy();
  });

  it("should return response instance", async () => {
    const endpoint = q.endpoint({
      callback: () => new Response(),
    });

    const endpointResponse = await endpoint(...testEndpointContext);

    expect(endpointResponse).toBeInstanceOf(Response);
  });

  it("should return correct body and status code in response", async () => {
    const endpoint = q.endpoint({
      callback: () => new Response("test body"),
    });

    const endpointResponse = await endpoint(...testEndpointContext);

    expect(await endpointResponse.text()).toEqual("test body");

    expect(endpointResponse.status).toEqual(200);
  });

  it("should handle input schema errors", async () => {
    const endpoint = q.endpoint({
      input: z.object({
        id: z.string(),
      }),
      callback: () => new Response("test body"),
    });

    const endpointResponse = await endpoint(...testEndpointContext);

    expect(JSON.parse(await endpointResponse.text())).toEqual([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["id"],
        message: "Required",
      },
    ]);
  });

  it("should handle output schema errors", async () => {
    const endpoint = q.endpoint({
      output: z.object({
        id: z.string(),
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      callback: () => new Response("test body"),
    });

    const endpointResponse = await endpoint(...testEndpointContext);

    expect(JSON.parse(await endpointResponse.text())).toEqual([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["id"],
        message: "Required",
      },
    ]);
  });
});
