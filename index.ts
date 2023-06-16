import { z } from "./deps.ts";

export type ParseFormParams = {
  schema: z.ZodType;
  data: Record<string, unknown> | FormData;
};

export type ParseFormResult<T extends z.ZodType> = {
  errors?: never;
  zodError?: never;
  validData: z.infer<T>;
} | {
  errors: Record<string, string>;
  zodError: z.ZodError<unknown>;
  validData?: never;
};

export function parseForm(
  params: ParseFormParams,
  options?: { stripEmptyStrings?: boolean },
): ParseFormResult<typeof params.schema> {
  const { schema, data } = params;

  let unknownData: Record<string, unknown>;

  if (data instanceof FormData) {
    unknownData = extractFormData(data);
  } else {
    unknownData = data;
  }

  if (options?.stripEmptyStrings) {
    Object.keys(unknownData).forEach((key) => {
      if (unknownData[key] === "") unknownData[key] = undefined;
    });
  }

  const parseResults = schema.safeParse(unknownData);

  if (parseResults.success) {
    return { validData: parseResults.data };
  }

  const zodError = parseResults.error;

  return { errors: flattenErrors(parseResults), zodError };
}

function flattenErrors(result: z.SafeParseError<unknown>) {
  return result.error.errors.reduce<Record<string, string>>(
    (prev: Record<string, string>, next) => {
      const result = { ...prev };
      const key = next.path.join(".");
      result[key] = next.message;

      // we'll cover more cases here as we need them
      switch (next.code) {
        case "invalid_union":
          next.unionErrors.forEach((unionError) => {
            unionError.errors.forEach((error) => {
              result[error.path.join(".")] = error.message;
            });
          });
          break;
        case "invalid_type":
        case "invalid_literal":
        case "custom":
        case "invalid_union_discriminator":
        case "invalid_enum_value":
        case "unrecognized_keys":
        case "invalid_arguments":
        case "invalid_return_type":
        case "invalid_date":
        case "invalid_string":
        case "too_small":
        case "too_big":
        case "invalid_intersection_types":
        case "not_multiple_of":
        case "not_finite":
        default:
          break;
      }

      return result;
    },
    {},
  );
}

function extractFormData(data: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of data.entries()) {
    result[key] = value;
  }
  return result;
}

export default parseForm;
