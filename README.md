# Zod Friendly Forms

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/allmyfutures/zod-friendly-forms/test.yml?branch=main&label=Unit%20Tests&style=flat-square)](https://github.com/allmyfutures/zod-friendly-forms)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/allmyfutures/zod-friendly-forms?style=flat-square)](https://codeclimate.com/github/allmyfutures/zod-friendly-forms/test_coverage)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/allmyfutures/zod-friendly-forms?style=flat-square)](https://github.com/allmyfutures/zod-friendly-forms/releases/latest)
[![NPM Downloads](https://img.shields.io/npm/dt/zod-friendly-forms?label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/zod-friendly-forms)

Return a key value object of form errors using `zod`.

## Install

```bash
pnpm add zod-ff zod
```

## Usage

This library will work on the server or client, in any framework. Here is an example in Svelte:

```html
<script lang="ts">
  import { z } from "zod";
  import { parseForm } from "zod-ff";

  import { handleLogin } from "./my-login-function";

  let errors;

  const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    rememberMe: z.boolean(),
  });

  const loginForm = {
    email: "",
    password: "",
    rememberMe: false,
  };

  async function submit() {
    let { data, errors } = await parseForm<typeof LoginSchema>({ schema: LoginSchema, data: loginForm });
    if (!errors) await handleLogin(data);
  }
</script>

<form on:submit|preventDefault="{submit}">
  <label for="email">Email
    {#if errors?.email}<span class="error">{errors.email}</span>{/if}
    <input
      id="email"
      name="email"
      type="email"
      required="required"
      style="margin-bottom: 0;"
      bind:value="{loginForm.email}"
    />
  </label>

  <label for="password">Password
    {#if errors?.password}<span class="error">{errors.password}</span>{/if}
    <input
      id="password"
      name="password"
      type="password"
      required="required"
      bind:value="{loginForm.password}"
    />
  </label>
  <label for="rememberMe">Remember Me
    <input id="rememberMe" type="checkbox" bind:checked="{loginForm.rememberMe}" />
  </label>

  <footer class="form-submit">
    <button type="submit">Submit</button>
  </footer>
</form>
```

### Advanced Output

You can return a typed response 

```ts
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean(),
});

let loginInput: Record<string, unknown> = // some unknown input;

const { data, errors } = parseForm<typeof LoginSchema>({ schema, data: loginInput });

if (errors) {
  return console.log(errors);
  // {
  //   email: "Invalid email",
  //   password: "Required",
  //   rememberMe: "Required",
  // }
}

// data here is a valid LoginSchema
console.log(data);
```

```ts
// data = null
// errors = {
//   email: "Invalid email",
//   password: "Required",
//   rememberMe: "Required",
// }
// data = null
// errors = {
//   email: "Invalid email",
//   password: "Required",
//   rememberMe: "Required",
// }
```

### Misc Examples

```typescript
import { z } from "zod";
import { parseForm } from "zod-ff";

const RegisterSchema = z.object({
  age: z.number().positive().max(150),
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean(),
});
```

```typescript
const data = {};
const { errors } = parseForm({ schema: RegisterSchema, data });
expect(errors).toStrictEqual({
  age: "Number must be less than or equal to 150",
  email: "Invalid email",
  password: "Required",
  rememberMe: "Required",
});
```

```typescript
const data = {
  age: 99,
  email: "bob@example.com",
  password: "bobobobobobob",
  rememberMe: true,
};
const { errors } = parseForm({ schema: RegisterSchema, data });
expect(errors).toBeUndefined();
```

```typescript
const data = {
  age: 99,
  email: "bob",
  password: "bobobobobobob",
  rememberMe: true,
};
const { errors } = parseForm({ schema: RegisterSchema, data });
expect(errors).toStrictEqual({
  email: "Invalid Email Address",
});
```

#### Deep Objects

```typescript
const data = {
  user: {
    email: "bob",
  },
};
const { errors } = parseForm({ schema: RegisterSchema, data });
expect(errors).toStrictEqual({
  user: {
    email: "Invalid Email Address",
  },
});
```

```typescript
const schema = z.object({
  user: z.object({
    email: z.string().email(),
  }),
});
const data = {
  user: {
    email: "bob",
  },
};
const options = { flatResult: true };
const { errors } = parseForm({ schema: RegisterSchema, data }, options);
expect(errors).toStrictEqual({
  "user.email": "Invalid Email Address",
});
```
