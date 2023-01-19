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
  type PassResult = { errors?: never; validData: z.infer<TSchema> };
  type FailResult = { errors: Errors; validData?: never };

  let unknownData: Record<string, unknown>;

  if (data instanceof FormData) {
    unknownData = extractFormData(data);
  } else {
    unknownData = data;
  }

  const parseResults = schema.safeParse(unknownData);

  if (parseResults.success) {
    return { validData: parseResults.data } as PassResult;
  }

  const errors = flattenErrors(parseResults, options?.flatResult);

  return { errors } as FailResult;
}

function flattenErrors(result: z.SafeParseError<any>, flatResult = false) {
  return result.error.errors.reduce<Errors>((prev, next) => {
    let result = { ...prev };

    if (flatResult) {
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
}

function extractFormData(data: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of data.entries()) {
    result[key] = value;
  }
  return result;
}

export default parseForm;
