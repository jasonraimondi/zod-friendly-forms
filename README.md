# Zod Friendly Forms

[![Deno Version](https://shield.deno.dev/x/zod_ff?style=flat-square)](https://deno.land/x/zod_ff)
[![Npmjs.org Version](https://img.shields.io/npm/v/zod-ff?style=flat-square)](https://www.npmjs.com/package/zod-ff)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/jasonraimondi/zod-friendly-forms/test.yml?branch=main&label=Unit%20Tests&style=flat-square)](https://github.com/jasonraimondi/zod-friendly-forms)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/jasonraimondi/zod-friendly-forms?style=flat-square)](https://codeclimate.com/github/jasonraimondi/zod-friendly-forms/test_coverage)
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

### Deno

```ts
import { parseForm } from "https://deno.land/x/zod_ff";
```

## Usage

Create a [zod] schema.

```ts
import { z } from "zod";
const schema = z.object({
  email: z.string().email(),
});
```

When you're ready to validate your input data, go ahead and run the `parseForm`
function. If there are any errors, they will be available by input key.

```ts
import { parseForm } from "zod-ff";

const data = {
  email: "invalid-email",
};
const { errors } = parseForm({ schema, data });

errors;
// {
//   email: "Invalid email",
// }
```

If errors are undefined, the input was valid. A returned `validData` object will
be typed with your response.

```ts
import { parseForm } from "zod-ff";

const data = {
  email: "bob@example.com",
};
const { errors, validData } = parseForm({ schema, data });

errors;
// undefined

validData;
// {
//   email: "bob@example.com",
// }
```

You can use the builtin `FormData` object.

```ts
const data = new FormData();
data.append("email", "invalid-email");

const { errors } = parseForm({ schema, data });

errors;
// {
//   email: "Invalid email",
// }
```

```ts
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

errors;
// {
//   "user.email": "Invalid Email Address",
// }
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
  });  
  
  const loginForm = {  
    email: "",  
    password: "",  
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
