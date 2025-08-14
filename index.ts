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
 *    email: z.email(),
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

function flattenErrors(result: z.ZodSafeParseError<unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  result.error.issues.forEach((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "";

    if (issue.code === "invalid_union") {
      errors[path] = issue.message;

      const unionIssue = issue as any;
      if (unionIssue.errors && Array.isArray(unionIssue.errors)) {
        unionIssue.errors.forEach((unionErrorArray: any) => {
          if (Array.isArray(unionErrorArray)) {
            unionErrorArray.forEach((subIssue: any) => {
              const subPath = path.length > 0
                ? `${path}.${subIssue.path.join(".")}`
                : subIssue.path.join(".");
              if (subPath && !errors[subPath]) {
                errors[subPath] = subIssue.message;
              }
            });
          }
        });
      }
    } else {
      if (path) {
        errors[path] = issue.message;
      } else {
        errors[""] = issue.message;
      }
    }
  });

  return errors;
}

function extractFormData(data: FormData | URLSearchParams): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of data) {
    result[key] = value;
  }
  return result;
}

export default parseForm;
