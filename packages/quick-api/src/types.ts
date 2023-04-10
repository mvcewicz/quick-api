import { NextRequest } from "next/server";
import { z } from "zod";
import {
  EndpointCallbackError,
  EndpointInputSchemaError,
  EndpointOutputSchemaError,
} from "./helpers/errors";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

export type EndpointContext = {
  params?: Record<string, string>;
};

export type MaybePromise<T> = T | Promise<T>;

export type Middleware = (
  req: NextRequest,
  ctx: EndpointContext
) => Record<PropertyKey, unknown>;

export type InferMiddlewares<TMiddlewares extends Middleware[]> = Prettify<
  UnionToIntersection<Awaited<ReturnType<TMiddlewares[number]>>>
>;

export type EndpointControllerConfig = {
  onSchemaError: (
    error: EndpointInputSchemaError | EndpointOutputSchemaError
  ) => Response;
  onCallbackError: (error: EndpointCallbackError) => Response;
};

/**
 * Endpoint configuration
 * @param TController - Endpoint controller configuration
 * @param TMiddleware - Endpoint middlewares
 * @param TInputSchema - Endpoint input schema
 * @param TOutputSchema - Endpoint output schema
 * @returns Endpoint
 */
export type Endpoint<
  TController extends EndpointControllerConfig,
  TMiddleware extends Middleware[] | [] = [],
  TInputSchema extends z.ZodTypeAny = z.ZodNever,
  TOutputSchema extends z.ZodTypeAny | undefined = undefined
> = {
  controller: TController;
  callback: (data: {
    input: z.infer<TInputSchema>;
    ctx: InferMiddlewares<TMiddleware>;
  }) => MaybePromise<
    TOutputSchema extends z.ZodTypeAny ? z.infer<TOutputSchema> : Response
  >;
  input?: TInputSchema;
  middlewares?: TMiddleware;
  output?: TOutputSchema;
};
