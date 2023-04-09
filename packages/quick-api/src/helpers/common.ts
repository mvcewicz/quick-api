export const isNativeResponse = (result: unknown): result is Response => {
  return result instanceof Response;
};

export const tryCatch = async <T>(
  cb: () => Promise<T>
): Promise<[T, unknown]> => {
  try {
    return [await cb(), null];
  } catch (error) {
    return [null as never, error];
  }
};
