import { Endpoint, EndpointControllerConfig, Middleware } from "../types";
import { z } from "zod";
import { endpoint } from "../helpers/endpoint";

export const defaultEndpointController: EndpointControllerConfig = {
  onSchemaError: (error) => {
    return new Response(error.context.toString(), {
      status: 400,
    });
  },
  onCallbackError: (error) => {
    return new Response(error.message, {
      status: 500,
    });
  },
};

export const QuickApi = (
  controller: EndpointControllerConfig = defaultEndpointController
) => {
  return {
    endpoint: <
      TMiddleware extends Middleware[] | [] = [],
      TInputSchema extends z.ZodTypeAny = z.ZodNever,
      TOutputSchema extends z.ZodTypeAny | undefined = undefined
    >(
      config: Omit<
        Endpoint<typeof controller, TMiddleware, TInputSchema, TOutputSchema>,
        "controller"
      >
    ) =>
      endpoint({
        ...config,
        controller: controller,
      }),
  };
};
