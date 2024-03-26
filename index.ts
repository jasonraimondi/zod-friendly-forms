import { z } from "./deps.ts";

/**
 * Parameters for parsing a form.
 * @property schema - The Zod schema to validate the form data.
 * @property data - The form data to parse.
 */
export type ParseFormParams = {
  schema: z.ZodType;
  data: Record<string, unknown> | FormData | URLSearchParams;
};

/**
 * The result of parsing a form. Either the form data is valid or there are errors.
 * @property errors - A key-value dictionary of errors.
 * @property zodError - The Zod error object.
 * @property validData - The valid form data.
 */
export type ParseFormResult<T extends z.ZodType> = {
  errors?: never;
  zodError?: never;
  validData: z.infer<T>;
} | {
  errors: Record<string, string>;
  zodError: z.ZodError<unknown>;
  validData?: never;
};

/**
 * Parse form data using a Zod schema and return a friendly key-value dict of errors
 * @param params - The parameters for the form parsing.
 * @param options - Additional options for the form parsing.
 * @returns The result of the form parsing.
 * @example """
 *   const schema = z.object({
 *    email: z.string().email(),
 *    password: z.string().min(8),
 *   });
 *   const data = { email: "jason", password: "12345678" };
 *   const { validData, errors } = parseForm({ schema, data });
 * """
 */
export function parseForm(
  params: ParseFormParams,
  options?: { stripEmptyStrings?: boolean },
): ParseFormResult<typeof params.schema> {
  const { schema, data } = params;

  let unknownData: Record<string, unknown>;

  if (data instanceof FormData || data instanceof URLSearchParams) {
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

function extractFormData(data: FormData | URLSearchParams): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of data) {
    result[key] = value;
  }
  return result;
}

export default parseForm;
