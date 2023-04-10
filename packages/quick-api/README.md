# @mvcwcz/quick-api

---

**Works only with Next.js 13+, with experimental API routes enabled.**

Designed to be a quick and easy way to create a REST API for your Next.js project with zero setup.

This package is **not** a replacement for Next.js API routes, it's just a wrapper around them.

Highly inspired by **[tRPC](https://github.com/trpc/trpc)**, if you need more advanced features, check it out.

**WARNING: This package is still in development and it's API might change in the future.**

## Installation

```bash
npm install @mvcwcz/quick-api
# or
yarn add @mvcwcz/quick-api
# or
pnpm add @mvcwcz/quick-api
```

## Features

- [x] Zero setup
- [x] Schema based endpoint
- [x] Middlewares
- [x] Error handlers

## Documentation

- [Quick start](#quick-start)
- [Basic usage](#basic-usage)
- [Schema based endpoint](#schema-based-endpoint)
- [Middlewares](#middlewares)

### Quick start

```ts
import { QuickApi } from "@mvcwcz/quick-api";

export const qApi = QuickApi();
```

---

### Basic usage

Simple endpoint that will return "Hello world"

```ts
import { QuickApi } from "@mvcwcz/quick-api";

export const qApi = QuickApi();

export const GET = qApi.endpoint({
  callback: () => new Response("Hello world"),
});
```

---

## Schema based endpoint

Endpoint that will validate input and output

```ts
import { QuickApi } from "@mvcwcz/quick-api";

export const qApi = QuickApi();

export const GET = qApi.endpoint({
  input: z.object({
    query: z.object({
      id: z.string(),
    }),
  }),
  output: z.object({
    id: z.string(),
    email: z.string(),
  }),
  callback: ({ input }) => {
    return {
      id: input.id,
      name: "some name",
    };
  },
});
```

---

### Middlewares

Simple middleware that will add `prisma` to the context

```ts
import { QuickApi } from "@mvcwcz/quick-api";

export const qApi = QuickApi();

const sessionMiddleware = middleware((req) => {
  const session = null;
  return {
    session,
  };
});

export const GET = qApi.endpoint({
  input: z.object({
    query: z.object({
      id: z.string(),
    }),
  }),
  output: z.object({
    id: z.string(),
    email: z.string(),
  }),
  middlewares: [sessionMiddleware],
  callback: async ({ input, ctx }) => {
    const item = await ctx.prisma.findOne({
      where: {
        id: input.id,
      },
    });

    if (!item) {
      throw new Error(`Item with ${input.id} not found`);
    }

    return item;
  },
});
```

---

### Error handlers

Although it's zero setup, you can still customize error handling

```ts
import { QuickApi, EndpointControllerConfig } from "@mvcwcz/quick-api";

const controllerConfig: EndpointControllerConfig = {
  onSchemaError: (error) => {
    return new Response(error.message, {
      status: 400,
    });
  },
  onCallbackError: (error) => {
    return new Response(error.message, {
      status: 500,
    });
  },
};

export const qApi = QuickApi(controllerConfig);
```

---

### Why

I wanted to create a simple way to create REST API endpoints for my Next.js projects without having to setup a whole
framework. I also wanted to have a way to validate input and output of the endpoints.
