import { z } from "zod";

export class EndpointInputSchemaError extends Error {
  public context: z.ZodError;
  constructor(context: z.ZodError) {
    super("Endpoint input schema error");
    this.name = "EndpointInputSchemaError";
    this.context = context;
  }
}

export class EndpointOutputSchemaError extends Error {
  public context: z.ZodError;
  constructor(context: z.ZodError) {
    super("Endpoint output schema error");
    this.name = "EndpointOutputSchemaError";
    this.context = context;
  }
}

export class EndpointCallbackError extends Error {
  public context: string;
  constructor(message: string, context: string) {
    super(message);
    this.name = "EndpointCallbackError";
    this.context = context;
  }
}
