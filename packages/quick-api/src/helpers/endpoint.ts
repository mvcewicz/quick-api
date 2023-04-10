import { z } from "zod";
import { NextRequest } from "next/server";
import {
  Endpoint,
  EndpointContext,
  EndpointControllerConfig,
  Middleware,
} from "../types";
import { extractQueryFromUrl, zodSafeParseInline } from "./parsers";
import {
  EndpointCallbackError,
  EndpointInputSchemaError,
  EndpointOutputSchemaError,
} from "./errors";
import { isNativeResponse, tryCatch } from "./common";
import { getMiddlewareContext } from "./middleware";

const getRequestBody = async (req: NextRequest) => {
  const [parsedRequestBody, parsedRequestBodyError] = await tryCatch(async () =>
    req.json()
  );
  return parsedRequestBodyError ? req.body : parsedRequestBody;
};

export function endpoint<
  TController extends EndpointControllerConfig,
  TInputSchema extends z.ZodTypeAny = z.ZodNever,
  TOutputSchema extends z.ZodTypeAny | undefined = undefined
>(
  cfg: Endpoint<TController, never, TInputSchema, TOutputSchema>
): (req: NextRequest, ctx: EndpointContext) => Promise<Response>;

export function endpoint<
  TController extends EndpointControllerConfig,
  TMiddleware extends Middleware[] | [] = [],
  TInputSchema extends z.ZodTypeAny = z.ZodNever,
  TOutputSchema extends z.ZodTypeAny | undefined = undefined
>(
  cfg: Endpoint<TController, TMiddleware, TInputSchema, TOutputSchema>
): (req: NextRequest, ctx: EndpointContext) => Promise<Response>;

export function endpoint<
  TController extends EndpointControllerConfig,
  TMiddleware extends Middleware[] | [] = [],
  TInputSchema extends z.ZodTypeAny = z.ZodNever,
  TOutputSchema extends z.ZodTypeAny | undefined = undefined
>(config: Endpoint<TController, TMiddleware, TInputSchema, TOutputSchema>) {
  return async (req: NextRequest, ctx: EndpointContext) => {
    const { input, callback, middlewares, controller, output } = config;
    const query = extractQueryFromUrl(req.url);
    const params = ctx.params;

    const requestBody = await getRequestBody(req);

    const requestInput = input
      ? { ...req, query, params, body: requestBody }
      : undefined;

    const [inputParsed, inputParsedError] = zodSafeParseInline(
      requestInput,
      input
    );

    if (inputParsedError) {
      return controller.onSchemaError(
        new EndpointInputSchemaError(inputParsedError)
      );
    }

    const middlewareContext = await getMiddlewareContext(req, ctx, middlewares);

    const [callbackResult, callbackError] = await tryCatch(async () =>
      callback({
        input: inputParsed as TInputSchema extends z.ZodTypeAny
          ? z.infer<TInputSchema>
          : never,
        ctx: middlewareContext,
      })
    );

    if (callbackError) {
      return controller.onCallbackError(
        new EndpointCallbackError(
          callbackError instanceof Error
            ? callbackError.message
            : "Unhandled callback error",
          callbackError?.toString()
        )
      );
    }

    if (output) {
      const [outputParsed, outputParsedError] = zodSafeParseInline(
        callbackResult,
        output
      );

      if (outputParsedError) {
        return controller.onSchemaError(
          new EndpointOutputSchemaError(outputParsedError)
        );
      }

      return new Response(JSON.stringify(outputParsed));
    }

    if (isNativeResponse(callbackResult)) {
      return callbackResult;
    }

    return new Response(JSON.stringify(callbackResult));
  };
}
