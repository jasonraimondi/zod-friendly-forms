import { z } from "./deps.ts";

export type ParseFormParams = {
  schema: z.ZodType;
  data: Record<string, unknown> | FormData;
};

export type ParseFormResult<T extends z.ZodType> = {
  errors?: never;
  validData: z.infer<T>;
} | {
  errors: Record<string, string>;
  validData?: never;
};

export function parseForm(
  params: ParseFormParams,
): ParseFormResult<typeof params.schema> {
  const { schema, data } = params;

  let unknownData: Record<string, unknown>;

  if (data instanceof FormData) {
    unknownData = extractFormData(data);
  } else {
    unknownData = data;
  }

  const parseResults = schema.safeParse(unknownData);

  if (parseResults.success) {
    return { validData: parseResults.data };
  }

  return { errors: flattenErrors(parseResults) };
}

function flattenErrors(result: z.SafeParseError<unknown>) {
  return result.error.errors.reduce<Record<string, string>>((prev, next) => {
    const result = { ...prev };
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
