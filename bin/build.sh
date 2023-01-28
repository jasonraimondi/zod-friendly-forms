#!/bin/bash

set -ex

deno run -A bin/build_npm.ts $1
cd npm
pnpm publish --access=publish
