import { EndpointContext, InferMiddlewares, Middleware } from "../types";
import { NextRequest } from "next/server";

export function middleware<T extends Record<PropertyKey, unknown>>(
  cb: (req: NextRequest, ctx: EndpointContext) => T
) {
  return (req: NextRequest, ctx: EndpointContext) => {
    return cb(req, ctx);
  };
}

export const getMiddlewareContext = async <TMiddlewares extends Middleware[]>(
  req: NextRequest,
  ctx: EndpointContext,
  middlewares?: TMiddlewares
) => {
  if (!middlewares?.length) {
    return null as never;
  }

  const context = {} as InferMiddlewares<TMiddlewares>;

  for (const middleware of middlewares) {
    const result = await middleware(req, ctx);
    Object.assign(context, result);
  }

  return context;
};
