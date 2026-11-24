<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deepen: read this before anything else

1. **Current state lives in the plan and tracker:** `docs/tracker/`, published at https://claude.ai/artifact/9NbbELEvkoykr1EUz1KKxp. Status, architecture, decisions, roadmap, backlog, changelog, and a map of every document. Read its Overview and Status tabs first.
2. **Then `PROJECT-INSTRUCTIONS.md`:** the thesis, hard rules, never-build list and engineering guardrails.
3. **There is one database, and it is production.** Local runs and Vercel previews write to real practices' data. Ask Adi before any schema change, data write, push or merge to `main`.
4. **Keep the tracker true.** When you change something it describes, edit `docs/tracker/*.md` in the same commit, then run `npm run build:tracker` and commit `docs/tracker/index.html`. `npm run check:tracker` fails if they drift. The Changelog tab is `CHANGELOG.md` itself, so editing that file needs the rebuild too.
