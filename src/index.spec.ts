import { it, describe, expect } from "vitest";
import { z } from "zod";

import { parseForm } from "./index.js";

describe("with POJO data input", () => {
  const schema = z.object({
    age: z.number().positive().max(150),
    email: z.string().email(),
    password: z.string().min(8),
    rememberMe: z.boolean(),
  });

  it("returns undefined if no errors", async () => {
    const data = {
      age: 99,
      email: "bob@example.com",
      password: "bobobobobbobo",
      rememberMe: true,
    };

    const { errors } = parseForm({ schema, data });

    expect(errors).toBeUndefined();
  });

  it("returns a dict of errors", async () => {
    const data = { age: 199, email: "jason" };

    const { errors } = parseForm({ schema, data });

    expect(errors).toStrictEqual({
      age: "Number must be less than or equal to 150",
      email: "Invalid email",
      password: "Required",
      rememberMe: "Required",
    });
  });

  it("ignores optional fields", async () => {
    const data = {};
    const schema = z.object({ nickname: z.number().optional() });

    const { data: outputData, errors } = parseForm({ schema, data });

    expect(outputData).toStrictEqual({});
    expect(errors).toBeUndefined();
  });

  it("can use custom messages", async () => {
    const data = {};
    const schema = z.object({
      quote: z.string({ required_error: "Quote is required" }),
    });

    const { errors } = parseForm({ schema, data });

    expect(errors).toStrictEqual({ quote: "Quote is required" });
  });

  it("supports objects", async () => {
    const schema = z.object({
      age: z.number().positive().max(150),
      email: z.string().email(),
      password: z.string().min(8),
      rememberMe: z.boolean(),
    });
    const innerSchema = z.object({
      user: schema,
    });
    const data = {
      user: {
        age: 99,
        password: "bobloblaw",
        rememberMe: true,
      },
    };

    const { errors } = parseForm({ schema: innerSchema, data });

    expect(errors).toStrictEqual({
      user: {
        email: "Required",
      },
    });
  });

  it("supports objects with flatResult", async () => {
    const innerSchema = z.object({
      user: schema,
    });
    const data = {
      user: {
        age: 99,
        email: "jason",
      },
    };

    const { errors } = parseForm({ schema: innerSchema, data }, { flatResult: true });

    expect(errors).toStrictEqual({
      "user.email": "Invalid email",
      "user.password": "Required",
      "user.rememberMe": "Required",
    });
  });
});

describe("with FormData data input", () => {
  const schema = z.object({
    age: z.coerce.number().positive().max(150),
    email: z.string().email(),
    password: z.string().min(8),
    rememberMe: z.coerce.boolean(),
  });

  it("returns undefined if no errors", async () => {
    const data = new FormData();
    data.append("age", "99");
    data.append("email", "bob@example.com");
    data.append("password", "bobobobobbobo");
    data.append("rememberMe", "true");

    const { data: formData, errors } = parseForm({ schema, data });

    expect(errors).toBeUndefined();
    expect(formData).toStrictEqual({
      age: 99,
      email: "bob@example.com",
      password: "bobobobobbobo",
      rememberMe: true,
    });
  });

  it("returns a dict of errors", async () => {
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

    expect(errors).toStrictEqual({
      age: "Number must be less than or equal to 150",
      email: "Invalid email",
      password: "Required",
      // @note booleans are marked false if missing when coerced
      // rememberMe: "Required",
    });
  });

  it("ignores optional fields", async () => {
    const data = new FormData();
    const schema = z.object({ nickname: z.number().optional() });

    const { errors } = parseForm({ schema, data });

    expect(errors).toBeUndefined();
  });

  it("can use custom messages", async () => {
    const data = new FormData();
    const schema = z.object({
      quote: z.string({ required_error: "Quote is required" }),
    });

    const { errors } = parseForm({ schema, data });

    expect(errors).toStrictEqual({ quote: "Quote is required" });
  });
});
