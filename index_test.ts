import { assertEquals } from "https://deno.land/std@0.173.0/testing/asserts.ts";

import { z } from "./deps.ts";

import { parseForm } from "./index.ts";

Deno.test("with Record<string, uknown> input", async (t) => {
  const TestingSchema = z.object({
    age: z.number().positive().max(150),
    email: z.string().email(),
    password: z.string().min(8),
    rememberMe: z.boolean(),
  });

  await t.step("returns undefined if no errors", () => {
    const data = {
      age: 99,
      email: "bob@example.com",
      password: "bobobobobbobo",
      rememberMe: true,
    };

    const { errors } = parseForm({ schema: TestingSchema, data });

    assertEquals(errors, undefined);
  });

  await t.step("returns a dict of errors", () => {
    const data = { age: 199, email: "jason" };

    const { errors } = parseForm({ schema: TestingSchema, data });

    assertEquals(errors, {
      age: "Number must be less than or equal to 150",
      email: "Invalid email",
      password: "Required",
      rememberMe: "Required",
    });
  });

  await t.step("ignores optional fields", () => {
    const data = {};
    const schema = z.object({ nickname: z.number().optional() });

    const { validData, errors } = parseForm({ schema, data });

    assertEquals(validData, {});
    assertEquals(errors, undefined);
  });

  await t.step("can use custom messages", () => {
    const data = {};
    const schema = z.object({
      quote: z.string({ required_error: "Quote is required" }),
    });

    const { errors } = parseForm({ schema, data });

    assertEquals(errors, { quote: "Quote is required" });
  });

  await t.step("supports objects", () => {
    const innerSchema = z.object({
      user: TestingSchema,
    });
    const data = {
      user: {},
    };

    const { errors } = parseForm({ schema: innerSchema, data });

    assertEquals(errors, {
      "user.age": "Required",
      "user.email": "Required",
      "user.password": "Required",
      "user.rememberMe": "Required",
    });
  });
});

Deno.test("with FormData data input", async (t) => {
  const schema = z.object({
    age: z.coerce.number().positive().max(150),
    email: z.string().email(),
    password: z.string().min(8),
    rememberMe: z.coerce.boolean(),
  });

  await t.step("returns undefined if no errors", () => {
    const data = new FormData();
    data.append("age", "99");
    data.append("email", "bob@example.com");
    data.append("password", "bobobobobbobo");
    data.append("rememberMe", "true");

    const { validData, errors } = parseForm({ schema, data });

    assertEquals(errors, undefined);
    assertEquals(validData, {
      age: 99,
      email: "bob@example.com",
      password: "bobobobobbobo",
      rememberMe: true,
    });
  });

  await t.step("returns a dict of errors", () => {
    const schema = z.object({
      age: z.coerce.number().positive().max(150),
      email: z.string().email(),
      password: z.string().min(8),
      rememberMe: z.coerce.boolean(),
    });
    const data = new FormData();
    data.append("age", "199");
    data.append("email", "jason");

    const { errors } = parseForm({ schema, data });

    assertEquals(errors, {
      age: "Number must be less than or equal to 150",
      email: "Invalid email",
      password: "Required",
      // @note booleans are marked false if missing when coerced
      // rememberMe: "Required",
    });
  });

  await t.step("ignores optional fields", () => {
    const data = new FormData();
    const schema = z.object({ nickname: z.number().optional() });

    const { errors } = parseForm({ schema, data });

    assertEquals(errors, undefined);
  });

  await t.step("can use custom messages", () => {
    const data = new FormData();
    const schema = z.object({
      quote: z.string({ required_error: "Quote is required" }),
    });

    const { errors } = parseForm({ schema, data });

    assertEquals(errors, { quote: "Quote is required" });
  });
});
