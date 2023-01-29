# Zod Friendly Forms

[![Deno Version](https://shield.deno.dev/x/zod_ff?style=flat-square)](https://deno.land/x/zod_ff)
[![Npmjs.org Version](https://img.shields.io/npm/v/zod-ff?style=flat-square)](https://www.npmjs.com/package/zod-ff)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/allmyfutures/zod-friendly-forms/test.yml?branch=main&label=Unit%20Tests&style=flat-square)](https://github.com/allmyfutures/zod-friendly-forms)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/allmyfutures/zod-friendly-forms?style=flat-square)](https://codeclimate.com/github/allmyfutures/zod-friendly-forms/test_coverage)
[![NPM Downloads](https://img.shields.io/npm/dt/zod-ff?label=npm%20downloads&style=flat-square)](https://www.npmjs.com/package/zod-ff)

Returns an object containing `errors` and `validData`. The `errors` object
contains user-friendly error messages, making it easy to display validation
errors to the user, while the `validData` object contains the typed and valid
data from the schema. This library can be used in any framework, both on the
server or client side and it allows for easy validation and handling of form
submissions.

## Install (npm)

```bash
pnpm add zod-ff zod
```

## Import

### Deno [[link]](https://deno.land/x/zod_ff)

```ts
import { parseForm } from "https://deno.land/x/zod_ff";
import { parseForm } from "https://deno.land/x/zod_ff";
```

### NPM [[link]](https://www.npmjs.com/package/zod-ff)

```ts
import { parseForm } from "zod-ff";
```

## Usage

Create a [zod] schema.

```typescript
import { z } from "zod";
const RegisterSchema = z.object({
  age: z.number().positive().max(150),
  email: z.string().email(),
  password: z.string().min(8),
});
```

When you're ready to validate your input data, go ahead and run the `parseForm`
function. If there are any errors, they will be available by input key.

```typescript
import { parseForm } from "zod-ff";

const data = {
  email: "invalid-email",
};
const { errors } = parseForm({ schema: RegisterSchema, data });

expect(errors).toStrictEqual({
  age: "Number must be less than or equal to 150",
  email: "Invalid email",
  password: "Required",
});
```

If errors are undefined, the input was valid. A returned `validData` object will
be typed with your response.

```typescript
import { parseForm } from "zod-ff";

const data = {
  age: 99,
  email: "bob@example.com",
  password: "bobobobobobob",
};
const { errors, validData } = parseForm<typeof RegisterSchema>({
  schema: RegisterSchema,
  data,
});

expect(errors).toBeUndefined();
expect(validData).toStrictEqual(data);
```

### Nested Objects

If you use nested objects, by default, your results will be flattened.

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

const { errors } = parseForm({ schema: RegisterSchema, data }, options);

expect(errors).toStrictEqual({
  "user.email": "Invalid Email Address",
});
```

## Examples

This library will work on the server or client, in any framework.

### Svelte Examples

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

### React Example

```ts
import React, { useState } from "react";
import { z } from "zod";
import { parseForm } from "zod-ff";
import { handleLogin } from "./my-login-function";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean(),
});

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    let { data, errors } = await parseForm({
      schema: LoginSchema,
      data: formData,
    });
    if (!errors) await handleLogin(data);
    setErrors(errors);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">
        Email
        {errors.email && <span className="error">{errors.email}</span>}
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </label>

      <label htmlFor="password">
        Password
        {errors.password && <span className="error">{errors.password}</span>}
        <input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })}
        />
      </label>
      <label htmlFor="rememberMe">
        Remember Me
        <input
          id="rememberMe"
          type="checkbox"
          checked={formData.rememberMe}
          onChange={(e) =>
            setFormData({ ...formData, rememberMe: e.target.checked })}
        />
      </label>

      <footer className="form-submit">
        <button type="submit">Submit</button>
      </footer>
    </form>
  );
};
```

### Vue 3 Example

```html
<template>  
  <form @submit.prevent="submit">  
    <label for="email">Email
      <span class="error" v-if="errors.email">{{ errors.email }}</span>
      <input
        id="email"
        name="email"
        type="email"
        required
        v-model="formData.email"
      />
    </label>

    <label for="password">Password
      <span class="error" v-if="errors.password">{{ errors.password }}</span>
      <input
        id="password"
        name="password"
        type="password"
        required
        v-model="formData.password"
      />
    </label>
    <label for="rememberMe">Remember Me
      <input
        id="rememberMe"
        type="checkbox"
        v-model="formData.rememberMe"
      />
    </label>

    <footer class="form-submit">
      <button type="submit">Submit</button>  
    </footer>  
  </form>  
</template>

<script>
import { z } from 'zod';
import { parseForm } from 'zod-ff';
import { handleLogin } from './my-login-function';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean(),  
});  
  
export default {  
  data() {  
    return {  
      formData: {  
        email: "",  
        password: "",  
        rememberMe: false,  
      },  
      errors: {}  
    };  
  },  
  methods: {  
    async submit() {  
      let { data, errors } = await parseForm({ schema: LoginSchema, data: this.formData });  
      if (!errors) await handleLogin(data);  
      this.errors = errors;  
    }  
  }  
};  
</script>
```

[deno-package]: https://deno.land/x/zod_ff
[npm-package]: https://www.npmjs.com/package/zod-ff
[zod]: https://github.com/colinhacks/zod
