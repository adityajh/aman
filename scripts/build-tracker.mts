// Turn docs/tracker/*.md into ONE standalone HTML page.
//
//   npm run build:tracker                   # docs/tracker -> docs/tracker/index.html
//   node --experimental-strip-types scripts/build-tracker.mts <dir>
//
// Copied from adityajh/le-outreach-crm scripts/build-orchestrator.mts (22 Nov
// 2026), the generator behind the Outreach Orchestrator page, so the two pages
// behave the same. Only the constants below differ.
//
// ── Why generate a page at all ──────────────────────────────────────────────
// docs/tracker/*.md is the source of truth for the status, architecture, decisions,
// roadmap, backlog and changelog of Deepen. Markdown is what people
// can actually edit and review in a diff. But the people who need to READ it are
// not all reading it in a repo: it is published as a web page, and it is opened
// straight off disk by whoever is on call. So the markdown is compiled into one
// self-contained index.html -- no build step, no server, no external script, one
// file that works from a URL and from file:// alike.
//
// The MARKDOWN STAYS THE SOURCE OF TRUTH. Nobody edits the HTML.
// scripts/smoke-tracker.mts re-runs this generator and fails if the
// committed index.html has drifted, so a doc edited without re-running the build
// is a failing test rather than a stale page shown to a customer.
//
// (scripts/build-handover.mts does the same job for the handover template, but
// emits a .ts module, because the APP reads that one at runtime inside a
// serverless bundle. Nothing in the app reads this page, so a plain .html file
// is the whole point rather than a compromise.)
//
// ── Why the parser throws instead of coping ─────────────────────────────────
// The markdown here is written by people who will never open this file. A parser
// that silently drops a line it does not understand loses content somebody wrote
// and nobody notices until a tenant asks about a row that is not there. A parser
// that passes the line through raw puts markdown source on a published page.
// Both failures are silent and both are discovered late.
//
// So: EVERY line is either a construct this parser knows, or an Error naming the
// file, the line number and the text. There is no fallback branch that emits.
// The supported subset is small on purpose and is listed in SUPPORTED below.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const SRC_DIR = "docs/tracker";
export const OUT_NAME = "index.html";
export const PAGE_TITLE = "Deepen: plan and tracker";
// A HUMAN BUMPS THESE TWO. Neither is derived from the git log, from a source
// file's mtime or from the clock: a page that re-dates itself on every build
// makes a diff out of nothing, and the revision is a claim about the CONTENT,
// which only the person who changed it can make.
export const REVISION = "rev 1";
export const REVISED_ON = "23 Nov 2026";
export const EYEBROW = `${REVISION} · ${REVISED_ON}`;
export const STANDFIRST =
  "Status, architecture, decisions, roadmap, backlog and changelog for Deepen, outcome tracking for solo counsellors.";

/** The whole contract, in one place, so a contributor can be told what is legal
 *  without reading the parser. Anything not on this list throws. */
export const SUPPORTED = {
  blocks: [
    "# Heading (exactly once, first non-blank line)",
    "## Heading",
    "### Heading",
    "paragraph (blank-line separated)",
    "- item (contiguous, one level)",
    "1. item (contiguous, one level)",
    "| table | with |---| separator row",
    "> quote (contiguous)",
    "``` fenced code, optional language word",
    "--- (rule)",
    ":::note ... :::",
    ":::warn ... :::",
  ],
  inline: ["`code`", "**bold**", "*italic*", "[text](url)", "[[status]]"],
  pills: ["done", "now", "wait", "blocked", "todo", "open"] as const,
} as const;

const PILLS = new Set<string>(SUPPORTED.pills);

// ───────────────────────────────────────────────────────────── errors & escaping

/** Every parse failure comes through here, so every message names the file and
 *  the line. The smoke suite asserts exactly that. */
function bad(file: string, line: number, why: string, text?: string): never {
  const tail = text === undefined ? "" : `: ${JSON.stringify(text)}`;
  throw new Error(`${file}:${line}: ${why}${tail}`);
}

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ──────────────────────────────────────────────────────────────────── inline

const INLINE =
  /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[\[([^[\]]*)\]\]|\[([^[\]]+)\]\(([^)\s]+)\)/g;

// Leftovers in the PLAIN segments that can only mean broken markup. A stray
// asterisk or bracket is left alone and escaped -- the brief says everything
// else is text -- but an unterminated code span, a half-written link and a
// half-written [[token]] are mistakes, not prose.
const INLINE_JUNK: Array<[RegExp, string]> = [
  [/`/, "unterminated `code` span"],
  [/\]\(/, "malformed [text](url) link"],
  [/\[\[/, "malformed [[status]] token"],
  [/\]\]/, "malformed [[status]] token"],
];

/** Render one line of inline markup. Everything not a known construct is
 *  HTML-escaped text; anything that is a BROKEN construct throws.
 *
 *  Bold, italic and a link's TEXT are rendered RECURSIVELY. `**the `foo` flag**`
 *  is what people write, and rendering the inner text with esc() alone put a
 *  literal backtick on a published page -- raw markdown in the HTML, which is
 *  the one outcome this generator exists to prevent. It also meant inner text
 *  skipped the broken-markup check below, so a malformed [[token]] inside bold
 *  was neither rendered nor reported.
 *
 *  A code span's content is never recursed into: inside a span, as inside a
 *  fence, markdown is just characters. Bold cannot nest inside bold because the
 *  inner pattern excludes asterisks, so this terminates. */
export function renderInline(src: string, file: string, line: number): string {
  let out = "";
  let at = 0;
  // matchAll rather than exec: this function recurses, and a shared global
  // regex's lastIndex would be clobbered by the inner call.
  for (const m of src.matchAll(INLINE)) {
    const start = m.index ?? 0;
    out += plain(src.slice(at, start), file, line);
    at = start + m[0].length;
    if (m[1] !== undefined) out += `<code>${esc(m[1])}</code>`;
    else if (m[2] !== undefined) out += `<strong>${renderInline(m[2], file, line)}</strong>`;
    else if (m[3] !== undefined) out += `<em>${renderInline(m[3], file, line)}</em>`;
    else if (m[4] !== undefined) {
      const name = m[4];
      if (!PILLS.has(name)) {
        bad(
          file,
          line,
          `[[${name}]] is not a status (only ${SUPPORTED.pills.join(", ")})`,
          m[0],
        );
      }
      out += `<span class="pill st-${name}">${esc(name)}</span>`;
    } else if (m[5] !== undefined && m[6] !== undefined) {
      out += `<a href="${esc(m[6])}" target="_blank" rel="noopener">${renderInline(m[5], file, line)}</a>`;
    }
  }
  return out + plain(src.slice(at), file, line);
}

function plain(seg: string, file: string, line: number): string {
  for (const [re, why] of INLINE_JUNK) if (re.test(seg)) bad(file, line, why, seg.trim());
  return esc(seg);
}

// ──────────────────────────────────────────────────────────────────── blocks

type Line = { n: number; text: string };

// A line that begins with one of these is STRUCTURAL: it opens a block, so a
// paragraph never swallows it, and if it is malformed it throws rather than
// becoming text.
const STRUCTURAL = /^(?:#|\||>|```|:::|---|- |\d+\. )/;

// Malformed openers, each with the thing the writer probably meant. Order
// matters only in that the first match wins.
const MALFORMED: Array<[RegExp, string]> = [
  [/^#/, "a heading must be '# ', '## ' or '### ' followed by one space"],
  [/^>/, "a quote line must be '> ' followed by one space"],
  [/^-/, "a bullet must be '- ' followed by one space, and '---' is the only rule form"],
  [/^\*(?:\s|\*\*)/, "lists use '- ' and rules use '---'"],
  [/^\+ /, "lists use '- '"],
  [/^\d+[.)]/, "an ordered item must be 'N. ' followed by one space"],
  [/^[=~]{2,}/, "setext headings and '~~~' fences are not supported"],
  [/^_/, "use '*italic*' and '**bold**'"],
  [/^</, "raw HTML is not supported"],
  [/^!\[/, "images are not supported (the page runs under a CSP that blocks them)"],
];

function isParagraphLine(text: string): boolean {
  if (text.trim() === "") return false;
  if (/^[ \t]/.test(text)) return false;
  if (STRUCTURAL.test(text)) return false;
  return !MALFORMED.some(([re]) => re.test(text));
}

type Ctx = { h1: number };

// Split a table row on its CELL pipes. A naive split("|") is the obvious bug
// here: `a|b` is a legal code span, and a pipe inside one is content, not a
// cell boundary. Splitting on it shifts every cell after it one column left and
// the row then trips the cell-count check -- a baffling error for a row that was
// written correctly. So the splitter tracks backticks.
function cellsOf(text: string): string[] {
  const t = text.trim();
  const parts: string[] = [];
  let cur = "";
  let code = false;
  for (const ch of t) {
    if (ch === "`") {
      code = !code;
      cur += ch;
    } else if (ch === "|" && !code) {
      parts.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  // The leading pipe leaves an empty first part and a trailing one an empty last
  // part; a cell that is genuinely empty is kept.
  if (parts.length > 1 && parts[0].trim() === "") parts.shift();
  if (parts.length > 1 && parts[parts.length - 1].trim() === "") parts.pop();
  return parts.map((c) => c.trim());
}

// A column is set in mono and tabular figures when every body cell in it is a
// number, a date, a percentage or a count -- the columns people scan down.
const NUMERIC = /^[0-9][0-9.,:/%+–—-]*$|^[₹$£€][0-9][0-9.,]*[kKmM]?$/;

function blocks(lines: Line[], file: string, ctx: Ctx, allowCallout: boolean): string {
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    const t = ln.text;

    if (t.trim() === "") {
      i++;
      continue;
    }
    if (/^[ \t]/.test(t)) {
      bad(file, ln.n, "unexpected indentation (nested blocks are not supported)", t);
    }

    // ``` fenced code, optional language word
    if (t.startsWith("```")) {
      const lang = t.slice(3).trim();
      if (lang !== "" && !/^[A-Za-z0-9_+#.-]+$/.test(lang)) {
        bad(file, ln.n, "a fence may carry only a single language word", t);
      }
      const body: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].text.trim() !== "```") {
        body.push(lines[j].text);
        j++;
      }
      if (j >= lines.length) bad(file, ln.n, "unclosed fenced code block", t);
      out.push(
        `<div class="codewrap"><pre class="code"><code>${esc(body.join("\n"))}</code></pre></div>`,
      );
      i = j + 1;
      continue;
    }

    // :::note / :::warn callouts
    if (t.startsWith(":::")) {
      if (t.trim() === ":::") {
        bad(file, ln.n, "':::' closes a callout that was never opened", t);
      }
      if (!allowCallout) bad(file, ln.n, "callouts do not nest", t);
      const kind = t.slice(3).trim();
      if (kind !== "note" && kind !== "warn") {
        bad(file, ln.n, "unknown callout (only ':::note' and ':::warn')", t);
      }
      const inner: Line[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].text.trim() !== ":::") {
        if (lines[j].text.startsWith(":::")) {
          bad(file, lines[j].n, "callouts do not nest", lines[j].text);
        }
        inner.push(lines[j]);
        j++;
      }
      if (j >= lines.length) bad(file, ln.n, "unclosed ':::' callout", t);
      out.push(`<div class="${kind}">${blocks(inner, file, ctx, false)}</div>`);
      i = j + 1;
      continue;
    }

    // --- rule
    if (t === "---") {
      out.push("<hr>");
      i++;
      continue;
    }

    // # / ## / ### headings
    const h = /^(#{1,3}) (.+)$/.exec(t);
    if (h !== null) {
      const level = h[1].length;
      if (level === 1) {
        if (ctx.h1 > 0) {
          bad(file, ln.n, "a second '# ' heading (one per file, on the first line)", t);
        }
        ctx.h1++;
      }
      out.push(`<h${level}>${renderInline(h[2], file, ln.n)}</h${level}>`);
      i++;
      continue;
    }

    // | tables
    if (t.startsWith("|")) {
      const sep = lines[i + 1];
      if (sep === undefined || !/^\|[\s:|-]*-[\s:|-]*$/.test(sep.text.trim())) {
        bad(file, ln.n, "a table's header row must be followed by a '|---|' separator row", t);
      }
      const head = cellsOf(t);
      if (cellsOf(sep.text).length !== head.length) {
        bad(
          file,
          sep.n,
          `the separator row has ${cellsOf(sep.text).length} cells, the header has ${head.length}`,
          sep.text,
        );
      }
      const body: Line[] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].text.startsWith("|")) {
        const row = cellsOf(lines[j].text);
        if (row.length !== head.length) {
          bad(
            file,
            lines[j].n,
            `this row has ${row.length} cells, the header has ${head.length}`,
            lines[j].text,
          );
        }
        body.push(lines[j]);
        j++;
      }
      const rows = body.map((b) => cellsOf(b.text));
      const numeric = head.map(
        (_, c) => rows.length > 0 && rows.every((r) => r[c] !== "" && NUMERIC.test(r[c])),
      );
      const cls = (c: number) => (numeric[c] ? ' class="num"' : "");
      const th = head
        .map((c, k) => `<th${cls(k)} scope="col">${renderInline(c, file, lines[i].n)}</th>`)
        .join("");
      const tb = body
        .map(
          (b, r) =>
            `<tr>${rows[r].map((c, k) => `<td${cls(k)}>${renderInline(c, file, b.n)}</td>`).join("")}</tr>`,
        )
        .join("");
      out.push(
        `<div class="tablewrap"><table><thead><tr>${th}</tr></thead>` +
          (tb === "" ? "" : `<tbody>${tb}</tbody>`) +
          `</table></div>`,
      );
      i = j;
      continue;
    }

    // - bullets
    if (/^- /.test(t)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^- /.test(lines[j].text)) {
        const m = /^- (.+)$/.exec(lines[j].text);
        if (m === null) bad(file, lines[j].n, "a bullet needs text after '- '", lines[j].text);
        items.push(`<li>${renderInline(m[1], file, lines[j].n)}</li>`);
        j++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      i = j;
      continue;
    }

    // 1. numbers
    if (/^\d+\. /.test(t)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\d+\. /.test(lines[j].text)) {
        const m = /^\d+\. (.+)$/.exec(lines[j].text);
        if (m === null) bad(file, lines[j].n, "an ordered item needs text after 'N. '", lines[j].text);
        items.push(`<li>${renderInline(m[1], file, lines[j].n)}</li>`);
        j++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      i = j;
      continue;
    }

    // > quotes. Joined BEFORE the inline pass, for the reason below.
    if (/^> /.test(t)) {
      const raw: string[] = [];
      let j = i;
      while (j < lines.length && /^> /.test(lines[j].text)) {
        const m = /^> (.+)$/.exec(lines[j].text);
        if (m === null) bad(file, lines[j].n, "a quote needs text after '> '", lines[j].text);
        raw.push(m[1].trim());
        j++;
      }
      out.push(`<blockquote><p>${renderInline(raw.join(" "), file, ln.n)}</p></blockquote>`);
      i = j;
      continue;
    }

    // Malformed openers: named, so the writer is told what was meant.
    for (const [re, why] of MALFORMED) if (re.test(t)) bad(file, ln.n, why, t);

    // Paragraph -- the ONLY remaining case, and it is a positive one: a line
    // with no structural sigil at all. Anything else has thrown by now.
    if (!isParagraphLine(t)) bad(file, ln.n, "unrecognised line", t);
    const raw: string[] = [];
    let j = i;
    while (j < lines.length && isParagraphLine(lines[j].text)) {
      raw.push(lines[j].text.trim());
      j++;
    }
    // The paragraph is REFLOWED FIRST and rendered once, not rendered line by
    // line and then joined. People wrap prose wherever the column runs out, so
    // an inline construct straddles the wrap all the time -- *"a quoted
    // phrase\n that ends on the next line"*. Rendering per line leaves the
    // opening asterisk as a literal character on the page, which is exactly the
    // raw-markdown leak this generator exists to stop. The cost is that an error
    // inside a wrapped paragraph is reported at the line the PARAGRAPH starts on
    // rather than the line the mistake is on; the message carries the offending
    // text, so it is still findable.
    out.push(`<p>${renderInline(raw.join(" "), file, ln.n)}</p>`);
    i = j;
  }
  return out.join("");
}

/** The markdown -> HTML renderer. `file` is used only in error messages. */
export function renderMarkdown(src: string, file: string): string {
  const lines: Line[] = src.split(/\r?\n/).map((text, k) => ({ n: k + 1, text }));
  const first = lines.find((l) => l.text.trim() !== "");
  if (first === undefined) {
    bad(file, 1, "the file is empty; the first non-blank line must be '# Tab Label'");
  }
  if (!/^# (.+)$/.test(first.text)) {
    bad(file, first.n, "the first non-blank line must be '# Tab Label'", first.text);
  }
  return blocks(lines, file, { h1: 0 }, true);
}

/** The `# Heading` text, as plain escaped text, for the tab label. */
export function labelOf(src: string, file: string): string {
  const lines = src.split(/\r?\n/);
  for (let k = 0; k < lines.length; k++) {
    if (lines[k].trim() === "") continue;
    const m = /^# (.+)$/.exec(lines[k]);
    if (m === null) bad(file, k + 1, "the first non-blank line must be '# Tab Label'", lines[k]);
    return renderInline(m[1], file, k + 1).replace(/<[^>]+>/g, "");
  }
  return bad(file, 1, "the file is empty; the first non-blank line must be '# Tab Label'");
}

// ───────────────────────────────────────────────────────────── docs and tabs

export type Doc = { file: string; order: string; slug: string; label: string; html: string };

export function parseFileName(file: string): { order: string; slug: string } {
  const m = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/.exec(file);
  if (m === null) {
    throw new Error(`${file}:1: a source file must be named NN-slug.md (two digits, a dash, a lowercase slug)`);
  }
  return { order: m[1], slug: m[2] };
}

export function parseDoc(file: string, src: string): Doc {
  const { order, slug } = parseFileName(file);
  return { file, order, slug, label: labelOf(src, file), html: renderMarkdown(src, file) };
}

/** Source files in tab order: filename sort order, which is why they are NN-. */
export function sourceFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => /^\d{2}-.+\.md$/.test(f))
    .sort();
}

export function readDocs(dir: string): Doc[] {
  return sourceFiles(dir).map((f) => parseDoc(f, readFileSync(join(dir, f), "utf8")));
}

/** The tab-list builder. Buttons, not links: the hash is written by the click
 *  handler so that a tab is reachable by URL without the page being a set of
 *  anchors that scroll. */
export function buildTabs(docs: Doc[]): string {
  const seen = new Set<string>();
  const buttons = docs.map((d, k) => {
    if (seen.has(d.slug)) throw new Error(`${d.file}:1: duplicate tab slug "${d.slug}"`);
    seen.add(d.slug);
    const on = k === 0;
    return (
      `<button class="tab" type="button" role="tab" id="tab-${d.slug}" data-slug="${d.slug}"` +
      ` aria-controls="sec-${d.slug}" aria-selected="${on ? "true" : "false"}"` +
      ` tabindex="${on ? "0" : "-1"}">${d.label}</button>`
    );
  });
  return `<nav class="tabs" role="tablist" aria-label="Sections">${buttons.join("")}</nav>`;
}

function buildPanes(docs: Doc[]): string {
  return docs
    .map(
      (d, k) =>
        `<section class="pane" role="tabpanel" id="sec-${d.slug}"` +
        ` aria-labelledby="tab-${d.slug}" tabindex="0"${k === 0 ? "" : " hidden"}>${d.html}</section>`,
    )
    .join("");
}

// ────────────────────────────────────────────────────────────────────── style
//
// EVERY colour is a token on bare :root with its light value, and the same token
// names are redefined twice for dark -- once behind prefers-color-scheme for the
// viewers who have no data-theme attribute at all (which is nearly all of them),
// once behind an explicit [data-theme="dark"]. No colour is only defined inside a
// media query, and no component rule carries a literal colour. The smoke suite
// asserts all three.

const LIGHT = `--bg:#f6f7fb;--bg-soft:#ecedf5;--bg-raise:#ffffff;
  --fg:#1a1e29;--fg-dim:#4b5366;--fg-faint:#6a7285;
  --rule:#d2d7e4;--rule-soft:#e4e7f1;
  --accent:#3550c8;--accent-soft:#e6eafa;--focus:#3550c8;
  --code-bg:#eceff8;--code-fg:#1f2433;
  --note-bd:#3550c8;--note-bg:#e9edfb;--warn-bd:#a6630c;--warn-bg:#fbf1e1;
  --done-fg:#1a5c35;--done-bg:#dcf0e4;--now-fg:#2a3f9e;--now-bg:#e1e7fb;
  --wait-fg:#7c5106;--wait-bg:#faeedb;--blocked-fg:#95242a;--blocked-bg:#fbe3e4;
  --todo-fg:#495062;--todo-bg:#e6e9f1;--open-fg:#0f5b63;--open-bg:#d8eff1`;

const DARK = `--bg:#12151c;--bg-soft:#1a1e28;--bg-raise:#191d26;
  --fg:#e6e9f2;--fg-dim:#a7afc2;--fg-faint:#8a92a6;
  --rule:#2d3340;--rule-soft:#232935;
  --accent:#93a7ff;--accent-soft:#1e2436;--focus:#93a7ff;
  --code-bg:#1d222d;--code-fg:#dee3f0;
  --note-bd:#6b82e8;--note-bg:#1a2033;--warn-bd:#d79a3f;--warn-bg:#2a2114;
  --done-fg:#8ddfae;--done-bg:#16301f;--now-fg:#aeb9ff;--now-bg:#1d2340;
  --wait-fg:#e8c279;--wait-bg:#30250f;--blocked-fg:#f3a3a5;--blocked-bg:#371a1c;
  --todo-fg:#b6bdce;--todo-bg:#242934;--open-fg:#7fd6de;--open-bg:#102b2e`;

const CSS = `*,*::before,*::after{box-sizing:border-box}
:root{
  --font-sans:"IBM Plex Sans",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
  ${LIGHT};
  color-scheme:light
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  ${DARK};
  color-scheme:dark
}}
:root[data-theme="dark"]{
  ${DARK};
  color-scheme:dark
}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--font-sans);
  font-size:16px;line-height:1.62;overflow-wrap:break-word}
.wrap{max-width:880px;margin-inline:auto;padding:44px 16px 96px;
  display:flex;flex-direction:column;gap:26px;min-width:0}
.eyebrow{font-family:var(--font-mono);font-size:.7rem;text-transform:uppercase;
  letter-spacing:.16em;color:var(--fg-faint);margin:0}
.masthead{display:flex;flex-direction:column;gap:8px;min-width:0}
.pagetitle{margin:0;font-size:clamp(1.65rem,5vw,2.3rem);line-height:1.15;
  letter-spacing:-.02em;font-weight:600}
.standfirst{margin:0;color:var(--fg-dim);font-size:1.02rem;max-width:62ch}
.tabs{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:12px;
  border-bottom:1px solid var(--rule);min-width:0}
.tab{font-family:var(--font-mono);font-size:.76rem;text-transform:uppercase;
  letter-spacing:.08em;color:var(--fg-dim);background:transparent;
  border:1px solid var(--rule-soft);border-radius:7px;padding:7px 11px;
  cursor:pointer;transition:background .14s ease,color .14s ease}
.tab:hover{color:var(--fg);background:var(--accent-soft)}
.tab[aria-selected="true"]{color:var(--bg-raise);background:var(--accent);
  border-color:var(--accent)}
.tab:focus-visible,.pane:focus-visible,a:focus-visible{outline:2px solid var(--focus);
  outline-offset:2px;border-radius:4px}
.pane{display:flex;flex-direction:column;gap:16px;min-width:0}
.pane[hidden]{display:none}
h1,h2,h3{margin:0;line-height:1.22;letter-spacing:-.01em;font-weight:600;min-width:0}
h1{font-size:1.5rem;padding-bottom:10px;border-bottom:1px solid var(--rule-soft)}
h2{font-size:1.16rem;margin-top:10px}
h3{font-size:.98rem;color:var(--fg-dim)}
p{margin:0;min-width:0}
a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}
strong{font-weight:600}
em{font-style:italic}
ul,ol{margin:0;padding-left:1.4em;display:flex;flex-direction:column;gap:5px;min-width:0}
li{min-width:0}
blockquote{margin:0;padding:2px 0 2px 16px;border-left:3px solid var(--rule);
  color:var(--fg-dim);font-style:italic;min-width:0}
hr{border:0;border-top:1px solid var(--rule-soft);width:100%;margin:4px 0}
code{font-family:var(--font-mono);font-size:.86em;background:var(--code-bg);
  color:var(--code-fg);padding:.12em .26em;border-radius:4px}
.codewrap{overflow-x:auto;min-width:0;background:var(--bg-soft);
  border:1px solid var(--rule-soft);border-radius:9px}
.code{margin:0;padding:13px 15px;min-width:0}
.code code{background:transparent;padding:0;font-size:.82rem;line-height:1.55;
  white-space:pre;color:var(--fg)}
.tablewrap{overflow-x:auto;min-width:0;border:1px solid var(--rule-soft);border-radius:9px}
table{border-collapse:collapse;width:100%;font-size:.91rem}
th,td{text-align:left;padding:9px 13px;border-bottom:1px solid var(--rule-soft);
  font-variant-numeric:tabular-nums;vertical-align:top}
th{font-family:var(--font-mono);font-size:.72rem;text-transform:uppercase;
  letter-spacing:.07em;color:var(--fg-faint);background:var(--bg-soft);font-weight:400;
  white-space:nowrap}
tbody tr:last-child td{border-bottom:0}
.num{font-family:var(--font-mono);font-size:.84rem;white-space:nowrap}
.note,.warn{display:flex;flex-direction:column;gap:10px;min-width:0;
  padding:13px 16px;border-radius:9px;border-left:3px solid var(--rule)}
.note{background:var(--note-bg);border-left-color:var(--note-bd)}
.warn{background:var(--warn-bg);border-left-color:var(--warn-bd)}
.pill{display:inline-block;font-family:var(--font-mono);font-size:.68rem;
  text-transform:uppercase;letter-spacing:.07em;padding:.2em .5em;border-radius:5px;
  white-space:nowrap;border:1px solid;border-color:color-mix(in srgb,currentColor 32%,transparent)}
.st-done{color:var(--done-fg);background:var(--done-bg)}
.st-now{color:var(--now-fg);background:var(--now-bg)}
.st-wait{color:var(--wait-fg);background:var(--wait-bg)}
.st-blocked{color:var(--blocked-fg);background:var(--blocked-bg)}
.st-todo{color:var(--todo-fg);background:var(--todo-bg)}
.st-open{color:var(--open-fg);background:var(--open-bg)}
.foot{font-family:var(--font-mono);font-size:.7rem;color:var(--fg-faint);
  border-top:1px solid var(--rule-soft);padding-top:14px;margin:0}
@media (max-width:520px){
  .wrap{padding:30px 16px 64px;gap:20px}
  th,td{padding:8px 10px}
}
@media (prefers-reduced-motion: reduce){
  *{transition:none!important;animation:none!important;scroll-behavior:auto!important}
}`;

// The tab machinery. Plain buttons toggling el.hidden, the visible one routed by
// a plain #slug hash so a tab can be linked to. No framework, no fetch -- the
// page runs under a CSP that allows neither.
const JS = `(function(){
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;
  function show(slug, moveFocus){
    var hit = null;
    for (var k = 0; k < tabs.length; k++) if (tabs[k].getAttribute('data-slug') === slug) hit = tabs[k];
    if (!hit) hit = tabs[0];
    for (var i = 0; i < tabs.length; i++){
      var on = tabs[i] === hit;
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[i].tabIndex = on ? 0 : -1;
      var pane = document.getElementById(tabs[i].getAttribute('aria-controls'));
      if (pane) pane.hidden = !on;
    }
    if (moveFocus) hit.focus();
  }
  function fromHash(){
    var h = decodeURIComponent(String(location.hash).slice(1));
    return /^[a-z0-9-]+$/.test(h) ? h : '';
  }
  function go(slug, moveFocus){
    if (location.hash.slice(1) !== slug) location.hash = slug;
    show(slug, moveFocus);
  }
  tabs.forEach(function(tab, i){
    tab.addEventListener('click', function(){ go(tab.getAttribute('data-slug'), false); });
    tab.addEventListener('keydown', function(e){
      var j = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j < 0) return;
      e.preventDefault();
      go(tabs[j].getAttribute('data-slug'), true);
    });
  });
  window.addEventListener('hashchange', function(){ show(fromHash(), false); });
  show(fromHash(), false);
})();`;

/** The whole page, as one standalone document. */
export function buildPage(docs: Doc[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${PAGE_TITLE}</title>
<meta name="description" content="${esc(STANDFIRST)}">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&amp;family=IBM+Plex+Sans:wght@400;500;600&amp;display=swap">
<style>
${CSS}
</style>
</head>
<body>
<main class="wrap">
<p class="eyebrow">${esc(EYEBROW)}</p>
<header class="masthead">
<h1 class="pagetitle">${PAGE_TITLE}</h1>
<p class="standfirst">${esc(STANDFIRST)}</p>
</header>
${buildTabs(docs)}
${buildPanes(docs)}
<p class="foot">Generated from ${esc(SRC_DIR)}/*.md by scripts/build-tracker.mts — edit the markdown, then run npm run build:tracker.</p>
</main>
<script>
${JS}
</script>
</body>
</html>
`;
}

/** Read a directory of sources and return the finished page. */
export function buildFromDir(dir: string): { html: string; docs: Doc[] } {
  if (!existsSync(dir)) throw new Error(`${dir}: no such directory`);
  const docs = readDocs(dir);
  if (docs.length === 0) {
    throw new Error(
      `${dir}: no NN-slug.md sources found -- nothing to build (the markdown is the source of truth)`,
    );
  }
  return { html: buildPage(docs), docs };
}

// ───────────────────────────────────────────────────────────────────────── CLI
// Importing this module must not write anything, so the CLI runs only when this
// file IS the entry point.
const ENTRY = process.argv[1] === undefined ? "" : pathToFileURL(process.argv[1]).href;
if (import.meta.url === ENTRY) {
  const dir = process.argv[2] ?? SRC_DIR;
  const out = join(dir, OUT_NAME);
  const { html, docs } = buildFromDir(dir);
  writeFileSync(out, html);
  console.log(`${out} <- ${dir}/*.md (${docs.length} tabs, ${html.length} bytes)`);
  console.log(`  tabs: ${docs.map((d) => d.slug).join(", ")}`);
}
