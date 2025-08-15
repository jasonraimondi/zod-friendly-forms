# Zod Friendly Forms

[![JSR](https://jsr.io/badges/@jmondi/zod-friendly-forms)](https://jsr.io/@jmondi/zod-friendly-forms)
[![JSR Score](https://jsr.io/badges/@jmondi/zod-friendly-forms/score)](https://jsr.io/@jmondi/zod-friendly-forms)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/jasonraimondi/zod-friendly-forms/test.yml?branch=main&label=Unit%20Tests&style=flat-square)](https://github.com/jasonraimondi/zod-friendly-forms)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/jasonraimondi/zod-friendly-forms?style=flat-square)](https://codeclimate.com/github/jasonraimondi/zod-friendly-forms/test_coverage)

**Transform Zod validation errors into user-friendly form error messages.**

## The Problem

Zod gives you great validation, but its error messages aren't ready for end users:

```ts
// Zod's raw error output
{
  "email": [
    {
      "code": "invalid_string",
      "message": "Invalid email",
      "path": ["email"]
    }
  ]
}
```

## The Solution

Get clean, user-ready error messages that you can display directly in your forms:

```ts
import { parseForm } from "@jmondi/zod-friendly-forms";

const { errors } = parseForm({ schema, data });

// Clean, user-friendly output
{
  "email": "Invalid email"
}
```

## Quick Start

```ts
import { z } from "zod";
import { parseForm } from "@jmondi/zod-friendly-forms";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const formData = {
  email: "invalid-email",
  password: "123"
};

const { errors, validData } = parseForm({ schema, data: formData });

if (errors) {
  console.log(errors);
  // {
  //   email: "Invalid email",
  //   password: "String must contain at least 8 character(s)"
  // }
} else {
  console.log(validData); // Fully typed and validated data
}
```

## Features

- ✅ **User-friendly error messages** - Ready to display to end users
- ✅ **Type-safe validation** - Fully typed validated data
- ✅ **Framework agnostic** - Works with React, Vue, Svelte, vanilla JS
- ✅ **FormData support** - Handles web forms, URLSearchParams, and plain objects
- ✅ **Nested object errors** - Flattened dot-notation keys (e.g., `user.email`)
- ✅ **Server & client** - Use anywhere JavaScript runs

## Version Compatibility

- **zod-friendly-forms v4.0+**: Supports Zod v4.x
- **zod-friendly-forms v2.0**: Use this version for Zod v3.x compatibility

## Installation

### npm/pnpm
```bash
pnpm add zod
pnpm dlx jsr add @jmondi/zod-friendly-forms
```

### Deno
```bash
deno add @jmondi/zod-friendly-forms
```

## Usage

### Basic Usage

```ts
import { z } from "zod";
import { parseForm } from "@jmondi/zod-friendly-forms";

const schema = z.object({
  email: z.string().email(),
});

const { errors, validData } = parseForm({ 
  schema, 
  data: { email: "bob@example.com" } 
});

if (!errors) {
  // validData is fully typed as { email: string }
  console.log(validData.email); // TypeScript knows this is a string
}
```

### With FormData

Works seamlessly with HTML forms:

```ts
const formData = new FormData();
formData.append("email", "invalid-email");

const { errors } = parseForm({ schema, data: formData });
// { email: "Invalid email" }
```

### Nested Objects

Handles complex nested validation with flattened error keys:

```ts
const schema = z.object({
  user: z.object({
    email: z.string().email(),
    profile: z.object({
      name: z.string().min(2)
    })
  })
});

const { errors } = parseForm({ 
  schema, 
  data: { 
    user: { 
      email: "invalid", 
      profile: { name: "x" } 
    } 
  } 
});

console.log(errors);
// {
//   "user.email": "Invalid email",
//   "user.profile.name": "String must contain at least 2 character(s)"
// }
```

### Options

```ts
const { errors, validData } = parseForm(
  { schema, data },
  { stripEmptyStrings: true } // Convert empty strings to undefined
);
```

## Framework Examples

### React

```tsx
import { useState } from "react";
import { z } from "zod";
import { parseForm } from "@jmondi/zod-friendly-forms";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { errors, validData } = parseForm({ 
      schema: LoginSchema, 
      data: formData 
    });
    
    if (errors) {
      setErrors(errors);
    } else {
      // Handle successful login with validData
      await login(validData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <input 
        type="password" 
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      {errors.password && <span className="error">{errors.password}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

### Svelte

```svelte
<script lang="ts">
  import { z } from "zod";
  import { parseForm } from "@jmondi/zod-friendly-forms";

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  let formData = { email: "", password: "" };
  let errors = {};

  async function handleSubmit() {
    const result = parseForm({ schema, data: formData });
    if (result.errors) {
      errors = result.errors;
    } else {
      await login(result.validData);
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input bind:value={formData.email} type="email" />
  {#if errors.email}<span class="error">{errors.email}</span>{/if}
  
  <input bind:value={formData.password} type="password" />
  {#if errors.password}<span class="error">{errors.password}</span>{/if}
  
  <button type="submit">Login</button>
</form>
```

### Vue

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formData.email" type="email" />
    <span v-if="errors.email" class="error">{{ errors.email }}</span>
    
    <input v-model="formData.password" type="password" />
    <span v-if="errors.password" class="error">{{ errors.password }}</span>
    
    <button type="submit">Login</button>
  </form>
</template>

<script>
import { z } from 'zod';
import { parseForm } from '@jmondi/zod-friendly-forms';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default {
  data() {
    return {
      formData: { email: "", password: "" },
      errors: {}
    };
  },
  methods: {
    async handleSubmit() {
      const { errors, validData } = parseForm({ 
        schema, 
        data: this.formData 
      });
      
      if (errors) {
        this.errors = errors;
      } else {
        await this.login(validData);
      }
    }
  }
};
</script>
```

## API Reference

### `parseForm(params, options?)`

**Parameters:**
- `params.schema` - Zod schema for validation
- `params.data` - Form data (object, FormData, or URLSearchParams)
- `options.stripEmptyStrings` - Convert empty strings to undefined (optional)

**Returns:**
- Success: `{ validData: T, errors: undefined }`
- Failure: `{ errors: Record<string, string>, validData: undefined }`

## License

MIT