import { z } from "zod";

export type Errors = Record<string, string | Record<string, string>>;

export type ParseFormParams<TSchema extends z.ZodType> = {
  schema: TSchema;
  data: Record<string, unknown> | FormData;
};

export function parseForm<TSchema extends z.ZodType>(params: ParseFormParams<TSchema>) {
  const { schema, data } = params;

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

  const errors = flattenErrors(parseResults);

  return { errors } as FailResult;
}

function flattenErrors(result: z.SafeParseError<any>) {
  return result.error.errors.reduce<Errors>((prev, next) => {
    let result = { ...prev };
    const key = next.path.join(".");
    result[key] = next.message;
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
