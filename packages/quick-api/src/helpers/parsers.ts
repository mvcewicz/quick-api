import { z } from "zod";
import { NextRequest } from "next/server";
import { tryCatch } from "./common";

export const extractQueryFromUrl = (url: string) => {
  const query = new URL(url).searchParams;
  return Object.fromEntries(query.entries());
};

export const zodSafeParseInline = <TData>(
  data: TData,
  schema: z.ZodTypeAny | undefined
): [TData | null, z.ZodError | null] => {
  if (!schema) {
    return [data, null];
  }

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return [null, parsed.error];
  }

  return [parsed.data, null];
};
