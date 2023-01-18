import { z } from "zod";

export type Options = { flatResult?: boolean };

export type Errors = Record<string, string | Record<string, string>>;

export type ParseFormParams<TSchema extends z.ZodType> = {
  schema: TSchema;
  data: Record<string, unknown> | FormData;
};

export function parseForm<TSchema extends z.ZodType>(
  { data, schema }: ParseFormParams<TSchema>,
  options: Options = {},
) {
  type PassResult = { errors?: never; data: z.infer<TSchema> };
  type FailResult = { errors: Errors; data?: never };

  if (data instanceof FormData) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of data.entries()) {
      result[key] = value;
    }
    data = result;
  }

  const result = schema.safeParse(data);

  if (result.success) {
    return { data: result.data } as PassResult;
  }

  const errors = result.error.errors.reduce<Errors>((prev, next) => {
    let result = { ...prev };

    if (options?.flatResult) {
      const key = next.path.join(".");
      result[key] = next.message;
    } else {
      const inner = next.path.reduceRight((innerPrev, innerNext, idx) => {
        const isLastElement = idx === next.path.length - 1;
        if (isLastElement) return { [innerNext]: next.message };
        return { [innerNext]: innerPrev };
      }, {});
      result = { ...result, ...inner };
    }

    return result;
  }, {});

  return { errors } as FailResult;
}

export default parseForm;
