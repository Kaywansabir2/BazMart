# BazMart — Agent Operational Rules & Invariants

## ⚠️ STRICT RULE: NEVER USE LOCALHOST:3000 (RESERVED FOR OTHER PROJECT)

### 1. Rule Statement
The agent MUST NEVER use, bind to, proxy, inspect, query, or kill `localhost:3000` (or `127.0.0.1:3000` / `0.0.0.0:3000`) under any circumstance.

### 2. Context & Justification
Port `3000` is permanently reserved for another independent project running on the user's machine. Any interaction with port `3000` will disrupt the user's other workspace.

### 3. Designated Port Allocations for BazMart
- **`http://localhost:4000`**: Flutter Customer Mobile Web App (served via node static server).
- **`http://localhost:4001`**: Laravel 13 Enterprise Backend API (`/backend-laravel`) & ERP Sync Engine.
- **`http://localhost:4002`**: Next.js Admin & Operations Dashboard / Driver Dispatch Portal.
- **Option C QA Testing**: All Playwright tests, curl/Invoke-RestMethod requests, and browser interactions must strictly target ports `4000`, `4001`, and `4002` only.

### 4. Enforcement Guidelines
- Never configure any service, dev server, Next.js, Vite, NestJS, Express, or test script to listen on port 3000.
- When running Next.js (`npm run dev` or `npm run start`), always pass `-p 4002` explicitly.
- When checking ports via PowerShell (`netstat` / `Get-NetTCPConnection`), NEVER terminate or inspect any process listening on port 3000.
- All configuration files, CI scripts, and environment variables must strictly reference ports 4000, 4001, and 4002.

## ⚠️ STRICT RULE: ZERO BACKGROUND TASKS IN IDE RUNNER (ABSOLUTE & UNCONDITIONAL)

### 1. Rule Statement
The agent MUST ALWAYS terminate all background tasks, background daemons (`IsDaemon: true`), watchers, and dev servers before finishing ANY turn or prompt. At the end of every response, the IDE background runner MUST report EXACTLY: `manage_task(Action='list')` -> **No background tasks are currently running.**

### 2. No Exceptions Policy
- NEVER leave dev servers, test runners, or watchers in the IDE background task queue, EVEN IF a prompt or workflow states to keep servers running.
- Persistent background tasks consume system RAM, cause Out-Of-Memory / pagefile crashes, and clutter the user's IDE interface.
- To allow the user to view the app in their browser, the agent provides independent external scripts (`.\start-all-servers.bat` / `.\start-all-servers.ps1`). The IDE background runner must ALWAYS be cleaned up to 0 tasks.

### 3. Protocol
- Servers on ports 4000, 4001, and 4002 must only run temporarily and on-demand while actively executing automated tests.
- Immediately upon completing the test or task, the agent MUST run `manage_task(Action='kill')` on every active task.
- Port 3000 must NEVER be touched under any circumstances during cleanup.

## 🚀 LARAVEL FOR AGENTS & LARAVEL BOOST INTEGRATION

### 1. Framework Standard
The backend is an enterprise-grade **Laravel 13** application (`/backend-laravel`) adhering to the official Laravel for Agents playbook (`https://laravel.com/for/agents`).

### 2. Laravel Boost & AI Guidelines
- **Installed Package:** `laravel/boost` (v2.10+) provides Laravel-specific context, MCP tools, database schema reflection, and rules.
- **Skills Directory:** Domain skills are installed at `backend-laravel/.claude/skills/`:
  - `laravel-best-practices` (Eloquent, migrations, routing, validation, advanced queries, caching, db-performance)
  - `testing-best-practices` (PHPUnit, feature tests, assertions, isolation)
  - `infer-conventions`
  - `deploying-to-cloud`
- **Guidelines Source:** `backend-laravel/CLAUDE.md` contains active guidelines for version-accurate Laravel code generation.
- **Artisan Boost Commands:** `php artisan boost:list-skills`, `php artisan boost:index-rules`, `php artisan boost:update`.

## ✍️ STRICT RULE: KURDISH SORANI (RTL) TYPOGRAPHY, DIRECTIONALITY & PUNCTUATION STANDARD

### 1. Directionality & RTL Flow
Whenever communicating or generating text in Kurdish Sorani (کوردیی سۆرانی):
- **Strict Right-to-Left (RTL):** All Kurdish Sorani text must strictly adhere to RTL directionality.
- **Web & Markdown Rendering:** Use `<div dir="rtl">` or proper RTL wrappers when presenting structured text, lists, or explanations in Kurdish so that IDE webviews and Markdown renderers align lines from right to left, keep margins natural, and eliminate BiDi (bidirectional) rendering bugs.

### 2. Punctuation & Symbols Standard
- **Native Kurdish Punctuation:**
  - Question Mark: Strictly use `؟` (U+061F), NEVER English `?`.
  - Comma: Strictly use `،` (U+060C), NEVER English `,`.
  - Semicolon: Strictly use `؛` (U+061B), NEVER English `;`.
  - Quotation: Use `« »` or correctly bounded quotes.
- **Punctuation Placement & Trailing Points:** Periods (`.`), colons (`:`), and exclamation marks (`!`) must terminate sentences logically on the left (the end of an RTL sentence), never leaking to the right or flipping.

### 3. Parentheses, Brackets & Technical Terms
- When mixing Kurdish text with English terms, code, numbers, or URLs, ensure proper bidirectional isolation (using RTL formatting or boundaries) so that parentheses `( )`, brackets `[ ]`, and braces `{ }` never invert, jump, or disrupt the reading flow.

### 4. Numbers & Ordered Lists
- In Kurdish text, format numbers and ordered lists cleanly in RTL (`١.`, `٢.`, `٣.` or properly bounded `1.`, `2.`) so that numbers precede the text on the right and periods/dashes align correctly in RTL order.



