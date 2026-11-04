# Port 3000 Protection Rule

**Severity:** MANDATORY / CRITICAL INVARIANT

## Rule
The agent is strictly prohibited from using, binding, inspecting, testing, or terminating `localhost:3000` (or `127.0.0.1:3000`).

## Details
1. Port `3000` is reserved for another project on this machine.
2. BazMart services must only run on:
   - `4000`: Flutter Customer Web App
   - `4001`: NestJS Backend API & ERP Engine
   - `4002`: Next.js Admin & Operations Dashboard
3. Any command running Next.js or other dev servers must explicitly pass `-p 4002` or equivalent flag to avoid default port 3000.

