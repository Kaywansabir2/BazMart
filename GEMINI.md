# BazMart — Workspace Guidelines & Rules

## ⚠️ MANDATORY RULE: NEVER USE LOCALHOST:3000 (RESERVED FOR OTHER PROJECT)

### Rule
NEVER bind to, listen on, test against, query, inspect, or kill `localhost:3000` (or `127.0.0.1:3000` / `0.0.0.0:3000`).

### Reason
Port `3000` is reserved for another project on this machine.

### BazMart Port Map
- **Customer Web App:** `http://localhost:4000`
- **Backend API:** `http://localhost:4001`
- **Admin & Fleet Dashboard:** `http://localhost:4002`

Always pass explicit `-p 4002` to Next.js commands to prevent fallback to port 3000.

## ⚠️ MANDATORY RULE: ZERO BACKGROUND TASKS IN IDE RUNNER (ABSOLUTE)
- NEVER leave dev servers, daemon tasks (`IsDaemon: true`), or background scripts running in the IDE task queue at the end of any response — NO EXCEPTIONS.
- Always check `manage_task(Action='list')` and terminate lingering tasks using `manage_task(Action='kill')`.
- Start servers on-demand during active tests only, and immediately shut them down when testing concludes.
- Preserves RAM, prevents OOM crashes, and completely eliminates IDE task bar clutter.
- Provide external startup scripts (`start-all-servers.bat` / `start-all-servers.ps1`) for user-driven manual browser testing.
- NEVER touch port 3000 under any circumstances.

## ✍️ MANDATORY RULE: KURDISH SORANI (RTL) TYPOGRAPHY & DIRECTIONALITY
- **RTL Direction:** Whenever writing in Kurdish Sorani, strictly enforce Right-to-Left (RTL) directionality across all text, paragraphs, lists, and numbers.
- **RTL HTML/Markdown Wrappers:** Use `<div dir="rtl">` for Kurdish responses so that the IDE webview, Markdown viewers, and browsers properly align text, points, and punctuation to the right.
- **Punctuation Standard:** Strictly use Kurdish/Arabic punctuation:
  - Question mark: `؟` (never `?`)
  - Comma: `،` (never `,`)
  - Semicolon: `؛` (never `;`)
  - Quotations: `« »`
- **Brackets & Numbers:** Ensure numbers, brackets `( )`, and punctuation marks logically follow the RTL flow without BiDi reversal or misplaced trailing points.


