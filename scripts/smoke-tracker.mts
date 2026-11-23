// What docs/tracker/*.md is allowed to say, and what the page it becomes
// must look like.
//
// scripts/build-tracker.mts is PURE apart from its last few lines, so this
// file RUNS it rather than pattern-matching its source: a parser is either fed
// the shapes it will really meet or it is not tested at all.
//
// The checks that matter most are in section 4, the ones that assert the parser
// THROWS. A renderer that quietly drops a line it does not understand loses
// content somebody wrote, and one that passes the line through puts raw markdown
// on a published page. Both are silent. A suite that only proved good input
// renders would pass while that was happening, so every construct that can be
// written wrongly has a case here naming the file and the line it must report.
//
// Section 8 (theming), 9 (the CSP) and 10 (every emitted class has a rule) are
// asserted against the GENERATED HTML, not against the generator's source --
// the page is the artefact, and a token or a class is only correct in the file
// that ships.
//
// Run with: npm run check:tracker

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  EYEBROW,
  OUT_NAME,
  PAGE_TITLE,
  SRC_DIR,
  SUPPORTED,
  buildFromDir,
  buildPage,
  buildTabs,
  parseDoc,
  parseFileName,
  readDocs,
  renderInline,
  renderMarkdown,
  sourceFiles,
} from "./build-tracker.mts";

let failed = 0;
let ran = 0;
function check(what: string, got: unknown, want: unknown): void {
  ran++;
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  if (a === b) {
    console.log(`ok   ${what}`);
  } else {
    failed++;
    console.log(`FAIL ${what}\n  got      ${a}\n  expected ${b}`);
  }
}

const FX = "fx.md";
/** Render a fragment, with the mandatory `# ` heading added and then removed,
 *  so a block construct can be asserted on its own. */
const body = (...lines: string[]) =>
  renderMarkdown(["# T", "", ...lines].join("\n"), FX).replace("<h1>T</h1>", "");
const inline = (s: string) => renderInline(s, FX, 1);

/** One check: the call must throw, and the message must name file:line. The
 *  message itself is printed when it does not, because a parse error nobody can
 *  place is barely better than no error. */
function throwsAt(what: string, line: number, fn: () => unknown, bit?: RegExp): void {
  let msg = "";
  try {
    fn();
  } catch (e) {
    msg = e instanceof Error ? e.message : String(e);
  }
  const named = msg.startsWith(`${FX}:${line}:`) && (bit === undefined || bit.test(msg));
  check(what, msg === "" ? "(did not throw)" : named ? `names ${FX}:${line}` : msg, `names ${FX}:${line}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Every block construct, through the real renderer
// ═══════════════════════════════════════════════════════════════════════════
check("block: the '# ' first line is the section heading",
  renderMarkdown("# Tab Label\n", FX), "<h1>Tab Label</h1>");
check("block: '## ' and '### '", [body("## Two"), body("### Three")],
  ["<h2>Two</h2>", "<h3>Three</h3>"]);
check("block: contiguous lines are ONE paragraph, a blank line starts the next",
  body("one", "two", "", "three"), "<p>one two</p><p>three</p>");
check("block: contiguous '- ' lines are one <ul>, and a blank line starts another",
  body("- a", "- b", "", "- c"), "<ul><li>a</li><li>b</li></ul><ul><li>c</li></ul>");
check("block: contiguous '1. ' lines are one <ol>, whatever the numbers say",
  body("1. a", "2. b", "7. c"), "<ol><li>a</li><li>b</li><li>c</li></ol>");
check("block: a table -- first row is the header, separator is dropped, body rows follow",
  body("| H1 | H2 |", "| --- | --- |", "| a | b |"),
  '<div class="tablewrap"><table><thead><tr><th scope="col">H1</th><th scope="col">H2</th></tr>' +
    "</thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table></div>");
check("block: a wholly numeric column is marked, so it can be set in mono and tabular figures",
  body("| Name | Count |", "|---|---|", "| a | 14 |", "| b | 9 |"),
  '<div class="tablewrap"><table><thead><tr><th scope="col">Name</th><th class="num" scope="col">Count</th>' +
    '</tr></thead><tbody><tr><td>a</td><td class="num">14</td></tr>' +
    '<tr><td>b</td><td class="num">9</td></tr></tbody></table></div>');
check("block: a pipe inside `code` is CONTENT, not a cell boundary",
  body("| Call | Note |", "| --- | --- |", "| `a || b` | two cells, not three |"),
  '<div class="tablewrap"><table><thead><tr><th scope="col">Call</th><th scope="col">Note</th></tr>' +
    "</thead><tbody><tr><td><code>a || b</code></td><td>two cells, not three</td></tr></tbody></table></div>");
check("block: ...and an empty cell survives being empty",
  body("| A | B |", "| --- | --- |", "|  | b |"),
  '<div class="tablewrap"><table><thead><tr><th scope="col">A</th><th scope="col">B</th></tr>' +
    "</thead><tbody><tr><td></td><td>b</td></tr></tbody></table></div>");
check("block: a header-only table emits no empty <tbody>",
  body("| H |", "| --- |"),
  '<div class="tablewrap"><table><thead><tr><th scope="col">H</th></tr></thead></table></div>');
check("block: contiguous '> ' lines are one <blockquote>",
  body("> a", "> b"), "<blockquote><p>a b</p></blockquote>");
check("block: a fence, with the language word accepted and ignored",
  body("```ts", "const x = 1;", "```"),
  '<div class="codewrap"><pre class="code"><code>const x = 1;</code></pre></div>');
check("block: ...and a fence with no language word at all",
  body("```", "plain", "```"),
  '<div class="codewrap"><pre class="code"><code>plain</code></pre></div>');
check("block: fenced content is escaped and NOT parsed as markdown",
  body("```", "**not bold** & <b> `x`", "```"),
  '<div class="codewrap"><pre class="code"><code>**not bold** &amp; &lt;b&gt; `x`</code></pre></div>');
check("block: '---' alone is a rule", body("---"), "<hr>");
check("block: ':::note' and ':::warn' become callouts",
  [body(":::note", "text", ":::"), body(":::warn", "text", ":::")],
  ['<div class="note"><p>text</p></div>', '<div class="warn"><p>text</p></div>']);
check("block: blocks INSIDE a callout are parsed normally -- a callout holds a paragraph and a list",
  body(":::note", "para", "", "- a", "- b", ":::"),
  '<div class="note"><p>para</p><ul><li>a</li><li>b</li></ul></div>');

// ═══════════════════════════════════════════════════════════════════════════
// 2. Every inline construct
// ═══════════════════════════════════════════════════════════════════════════
check("inline: `code`", inline("a `b` c"), "a <code>b</code> c");
check("inline: **bold**", inline("a **b** c"), "a <strong>b</strong> c");
check("inline: *italic*", inline("a *b* c"), "a <em>b</em> c");
check("inline: [text](url) opens in a new tab and cannot reach back",
  inline("see [the docs](https://example.com/x)"),
  'see <a href="https://example.com/x" target="_blank" rel="noopener">the docs</a>');
check("inline: all six status pills, and only those six",
  SUPPORTED.pills.map((p) => inline(`[[${p}]]`)),
  SUPPORTED.pills.map((p) => `<span class="pill st-${p}">${p}</span>`));
check("inline: a pill inside a table cell, which is where they really appear",
  body("| Thing | State |", "| --- | --- |", "| Board | [[done]] |").includes(
    '<td><span class="pill st-done">done</span></td>'), true);

// ── Escaping. Fed the two things that must never reach a page raw.
check("escape: a script tag and an ampersand come out as text",
  inline('a & b <script>alert(1)</script> "q"'),
  'a &amp; b &lt;script&gt;alert(1)&lt;/script&gt; &quot;q&quot;');
check("escape: ...inside a code span too",
  inline("`<script>x & y</script>`"), "<code>&lt;script&gt;x &amp; y&lt;/script&gt;</code>");
check("escape: ...inside bold and italic",
  [inline("**a & b**"), inline("*<i>*")], ["<strong>a &amp; b</strong>", "<em>&lt;i&gt;</em>"]);
check("escape: ...in a link's text AND in its href, so neither can close the attribute",
  inline('[a & "b"](https://x.test/?p=1&q="2")'),
  '<a href="https://x.test/?p=1&amp;q=&quot;2&quot;" target="_blank" rel="noopener">a &amp; &quot;b&quot;</a>');
check("escape: a paragraph of raw HTML-looking text is text",
  body("a < b and 5 > 4 & so on"), "<p>a &lt; b and 5 &gt; 4 &amp; so on</p>");

// ── The three shapes the author of docs/tracker/*.md says they used ──
check("real: a cell holding a pill FOLLOWED BY PROSE keeps both",
  body("| Item | State |", "| --- | --- |", "| Kill switch | [[blocked]] needs a person |"),
  '<div class="tablewrap"><table><thead><tr><th scope="col">Item</th><th scope="col">State</th></tr>' +
    '</thead><tbody><tr><td>Kill switch</td><td><span class="pill st-blocked">blocked</span> needs a person</td>' +
    "</tr></tbody></table></div>");
check("real: ...and a pill alongside inline code in one cell",
  body("| A | B |", "| --- | --- |", "| `OUTREACH_EMAIL_LIVE` | [[open]] latent |").includes(
    '<td><code>OUTREACH_EMAIL_LIVE</code></td><td><span class="pill st-open">open</span> latent</td>'), true);
check("real: a callout with TWO paragraphs, a bulleted list and inline bold",
  body(":::warn", "First **paragraph**.", "", "Second one.", "", "- a bullet", "- another", ":::"),
  '<div class="warn"><p>First <strong>paragraph</strong>.</p><p>Second one.</p>' +
    "<ul><li>a bullet</li><li>another</li></ul></div>");
// ── Nesting and line wrapping: both leaked raw markdown onto the page ──
// Both of these were found by looking at the generated page, not by reading the
// parser, and both had put literal markdown characters in front of a reader.
check("real: a code span INSIDE bold is rendered, not left as literal backticks",
  inline("**Confirm the agent `SEND_MAX_PER_DAY` matches.**"),
  "<strong>Confirm the agent <code>SEND_MAX_PER_DAY</code> matches.</strong>");
check("real: ...inside italic, and inside a link's text, too",
  [inline("*an `italic` one*"), inline("[the `lib/` rules](https://x.test/a)")],
  ["<em>an <code>italic</code> one</em>",
    '<a href="https://x.test/a" target="_blank" rel="noopener">the <code>lib/</code> rules</a>']);
check("real: ...and a pill inside bold, which is how the backlog is written",
  inline("**[[todo]] unset**"),
  '<strong><span class="pill st-todo">todo</span> unset</strong>');
check("real: a paragraph is REFLOWED before the inline pass, so a construct may straddle the wrap",
  body("which appends *\"Sent with Hostinger", "Mail\"* to webmail messages."),
  "<p>which appends <em>&quot;Sent with Hostinger Mail&quot;</em> to webmail messages.</p>");
check("real: ...and the same inside a blockquote",
  body("> a **bold phrase that", "> ends on the next line**"),
  "<blockquote><p>a <strong>bold phrase that ends on the next line</strong></p></blockquote>");
throwsAt("real: broken markup inside bold is REPORTED, not silently escaped as it once was", 3,
  () => body("**half [[done and more**"), /malformed \[\[status\]\] token/);
throwsAt("real: a mistake in a wrapped paragraph is reported at the line the paragraph starts on", 3,
  () => body("a long line that wraps", "and carries [[shipped]] on its second line"), /not a status/);

check("real: a fenced block of TypeScript keeps ${...} template syntax verbatim",
  body("```ts", "const q = `where tenant = ${id}`;", "```"),
  '<div class="codewrap"><pre class="code"><code>const q = `where tenant = ${id}`;</code></pre></div>');

// ═══════════════════════════════════════════════════════════════════════════
// 3. Tabs, order and slugs
// ═══════════════════════════════════════════════════════════════════════════
const ARCH = ["# Architecture", "", "One app, one `tenant_id`."].join("\n");
const ROAD = ["# Roadmap", "", "- domains [[now]]"].join("\n");
const DOCS = [parseDoc("01-architecture.md", ARCH), parseDoc("02-roadmap.md", ROAD)];

check("tabs: a source file's name gives its order and its slug",
  parseFileName("03-per-tenant-status.md"), { order: "03", slug: "per-tenant-status" });
check("tabs: the '# ' heading is the tab label and the section heading, both",
  [DOCS[0].label, DOCS[0].html.startsWith("<h1>Architecture</h1>")], ["Architecture", true]);
check("tabs: the first tab is the selected one, and the only one in the tab order",
  buildTabs(DOCS),
  '<nav class="tabs" role="tablist" aria-label="Sections">' +
    '<button class="tab" type="button" role="tab" id="tab-architecture" data-slug="architecture"' +
    ' aria-controls="sec-architecture" aria-selected="true" tabindex="0">Architecture</button>' +
    '<button class="tab" type="button" role="tab" id="tab-roadmap" data-slug="roadmap"' +
    ' aria-controls="sec-roadmap" aria-selected="false" tabindex="-1">Roadmap</button></nav>');

// Tab order is filename sort order. Written out of order on purpose.
const tmp = mkdtempSync(join(tmpdir(), "orch-"));
try {
  writeFileSync(join(tmp, "02-roadmap.md"), ROAD);
  writeFileSync(join(tmp, "01-architecture.md"), ARCH);
  writeFileSync(join(tmp, "notes.txt"), "ignored");
  writeFileSync(join(tmp, OUT_NAME), "ignored");
  check("tabs: sources are the NN-slug.md files only, in filename order",
    sourceFiles(tmp), ["01-architecture.md", "02-roadmap.md"]);
  check("tabs: ...so tab order is filename order, not the order they were written",
    readDocs(tmp).map((d) => d.slug), ["architecture", "roadmap"]);
  const page = buildFromDir(tmp);
  check("tabs: a directory of sources builds one page with one pane per file",
    [page.docs.length, (page.html.match(/role="tabpanel"/g) ?? []).length], [2, 2]);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. THE THROWING. One case per construct class, and the point of the design.
//
// A line this parser does not understand is never dropped and never passed
// through raw. It is an Error naming the file and the line, at build time,
// where it is cheap -- because the person writing the markdown is not the
// person who will read this parser.
// ═══════════════════════════════════════════════════════════════════════════
throwsAt("throw: an unknown line -- raw HTML", 3,
  () => body("<div>raw</div>"), /raw HTML/);
throwsAt("throw: an unknown line -- an indented continuation, i.e. a nested list", 3,
  () => body("  - nested"), /indentation/);
throwsAt("throw: an unknown line -- an asterisk bullet", 3, () => body("* item"), /lists use '- '/);
throwsAt("throw: an unknown line -- '+' bullet", 3, () => body("+ item"), /lists use '- '/);
throwsAt("throw: an unknown line -- underscore emphasis", 3, () => body("_italic_"), /\*italic\*/);
throwsAt("throw: an unknown line -- a setext underline", 4, () => body("Title", "==="), /setext/);
throwsAt("throw: an unknown line -- a '####' heading, which this subset does not have", 3,
  () => body("#### Deep"), /heading must be/);
throwsAt("throw: an unknown line -- an image, which the page's CSP would block anyway", 3,
  () => body("![alt](https://x.test/a.png)"), /images are not supported/);
throwsAt("throw: a bullet with no space after the dash", 3, () => body("-item"), /one space/);
throwsAt("throw: an ordered item with no space after the dot", 3, () => body("1.item"), /one space/);
throwsAt("throw: a quote with no space after the '>'", 3, () => body(">quoted"), /one space/);
throwsAt("throw: a '[[token]]' that is not one of the six statuses", 3,
  () => body("Status [[shipped]] here"), /\[\[shipped\]\] is not a status/);
throwsAt("throw: ...including inside a table cell, reported on the cell's own row", 5,
  () => body("| A | B |", "| --- | --- |", "| x | [[nearly]] |"), /not a status/);
throwsAt("throw: a table whose header row has no '|---|' separator under it", 3,
  () => body("| a | b |", "| 1 | 2 |"), /separator row/);
throwsAt("throw: ...or a separator row with the wrong number of cells", 4,
  () => body("| a | b |", "| --- |"), /separator row has 1 cells, the header has 2/);
throwsAt("throw: ...or a body row with the wrong number of cells", 5,
  () => body("| a | b |", "| --- | --- |", "| 1 |"), /this row has 1 cells/);
throwsAt("throw: an unclosed fence, named at the line that opened it", 3,
  () => body("```ts", "const x = 1;"), /unclosed fenced code block/);
throwsAt("throw: a fence carrying more than a language word", 3,
  () => body("``` ts and prose", "x", "```"), /single language word/);
throwsAt("throw: an unclosed ':::' callout, named at the line that opened it", 3,
  () => body(":::note", "text"), /unclosed ':::' callout/);
throwsAt("throw: a callout inside a callout", 5,
  () => body(":::note", "text", ":::warn", "x", ":::"), /do not nest/);
throwsAt("throw: an unknown callout name", 3,
  () => body(":::tip", "x", ":::"), /only ':::note' and ':::warn'/);
throwsAt("throw: a ':::' that closes nothing", 3, () => body(":::"), /never opened/);
throwsAt("throw: a file whose first non-blank line is not '# '", 1,
  () => renderMarkdown("Not a heading\n\ntext", FX), /first non-blank line must be '# Tab Label'/);
throwsAt("throw: ...and an empty file, which has no label to put on a tab", 1,
  () => renderMarkdown("\n   \n", FX), /the file is empty/);
throwsAt("throw: two '# ' headings in one file -- the label would be ambiguous", 3,
  () => body("# Second"), /a second '# ' heading/);
throwsAt("throw: an unterminated `code` span, which would otherwise print a backtick", 3,
  () => body("run `npm test to be sure"), /unterminated/);
throwsAt("throw: a malformed [text](url) link", 3,
  () => body("see the docs](https://x.test)"), /malformed \[text\]\(url\) link/);
throwsAt("throw: a malformed [[status]] token", 3,
  () => body("half [[done here"), /malformed \[\[status\]\] token/);

// Two that are about the file, not a line inside it.
check("throw: a source file not named NN-slug.md is refused, and says what the name must be",
  (() => {
    try {
      parseFileName("roadmap.md");
      return "(did not throw)";
    } catch (e) {
      return e instanceof Error && /^roadmap\.md:1: .*NN-slug\.md/.test(e.message)
        ? "named and explained"
        : String(e);
    }
  })(), "named and explained");
check("throw: two files cannot claim one slug -- the hash route would be ambiguous",
  (() => {
    try {
      buildTabs([parseDoc("01-a.md", "# A"), parseDoc("02-a.md", "# A2")].map((d, i) =>
        i === 1 ? { ...d, slug: "a" } : d));
      return "(did not throw)";
    } catch (e) {
      return e instanceof Error && /duplicate tab slug "a"/.test(e.message) ? "refused" : String(e);
    }
  })(), "refused");

// And the reason there is no fallback branch at all.
const GEN = "scripts/build-tracker.mts";
const gen = readFileSync(GEN, "utf8");
check("throw: the generator has no 'emit the line as-is' fallback anywhere",
  /out\.push\((?:line|t|ln\.text)\)/.test(gen), false);
check("throw: ...and the CLI is behind an entry-point guard, so importing this module writes nothing",
  /import\.meta\.url === ENTRY/.test(gen), true);

// ═══════════════════════════════════════════════════════════════════════════
// 5. The page itself
// ═══════════════════════════════════════════════════════════════════════════
// One fixture exercising EVERY construct, so sections 7-9 are asserted against
// a page that really contains all of them.
const EVERYTHING = [
  "# Architecture",
  "",
  "The CRM is one app with a `tenant_id` on **every** row, and *nothing*",
  "crosses that line. See [the handover](https://example.com/h?a=1&b=2).",
  "",
  "## Surfaces",
  "",
  "### Owned by Adi",
  "",
  "- the draft queue",
  "- the dashboard",
  "",
  "1. claim a row",
  "2. check the cap",
  "",
  "| Surface | Owner | Routes | State |",
  "| --- | --- | ---: | --- |",
  "| Board | Ankita | 14 | [[done]] |",
  "| Queue | Adi | 9 | [[now]] |",
  "| Dash | Adi | 6 | [[wait]] |",
  "| Bot | nobody | 21 | [[blocked]] |",
  "| Tags | Ankita | 3 | [[todo]] |",
  "| Inbound | Adi | 4 | [[open]] |",
  "",
  "> The tenant boundary is the only invariant worth a 3am page.",
  "> It has never been relaxed.",
  "",
  ":::note",
  "A subject like `<script>alert(1)</script>` must reach the page as text.",
  "",
  "- a list inside a callout is parsed normally",
  ":::",
  "",
  ":::warn",
  "Never read a repo file at runtime.",
  ":::",
  "",
  "---",
  "",
  "```sql",
  "select tenant_id, count(*) from crm_sends group by 1;",
  "```",
].join("\n");
const PAGE = buildPage([parseDoc("01-architecture.md", EVERYTHING), parseDoc("02-roadmap.md", ROAD)]);

check("page: one complete standalone document, which is what the publisher requires",
  [PAGE.startsWith("<!DOCTYPE html>\n<html lang=\"en\">"), PAGE.trimEnd().endsWith("</html>")],
  [true, true]);
check("page: charset, viewport and the title the page is published under",
  ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${PAGE_TITLE}</title>`].map((s) => PAGE.includes(s)), [true, true, true]);
check("page: the title is exactly 'Deepen: plan and tracker'", PAGE_TITLE, "Deepen: plan and tracker");
check("page: the eyebrow reads exactly 'rev 1 · 23 Nov 2026', in mono and letter-spaced",
  [EYEBROW, PAGE.includes(`<p class="eyebrow">${EYEBROW}</p>`),
    /\.eyebrow\{font-family:var\(--font-mono\);[^}]*text-transform:uppercase;[^}]*letter-spacing/.test(PAGE)],
  ["rev 1 · 23 Nov 2026", true, true]);
check("page: eyebrow, then title, then a one-line standfirst, in that order",
  [PAGE.indexOf('class="eyebrow"') < PAGE.indexOf('class="pagetitle"'),
    PAGE.indexOf('class="pagetitle"') < PAGE.indexOf('class="standfirst"')], [true, true]);
check("page: a single centred column of 880px", /\.wrap\{max-width:880px;margin-inline:auto/.test(PAGE), true);
check("page: both font families are declared with real fallback stacks after them",
  [/--font-sans:"IBM Plex Sans",ui-sans-serif,system-ui/.test(PAGE),
    /--font-mono:"IBM Plex Mono",ui-monospace,SFMono-Regular/.test(PAGE)], [true, true]);
check("page: one Google Fonts stylesheet, with display=swap",
  (PAGE.match(/https:\/\/fonts\.googleapis\.com[^"]*/g) ?? []).map((u) => u.includes("display=swap")), [true]);
// Counted in the MARKUP only -- the stylesheet names the selected state too.
const markup = PAGE.slice(PAGE.indexOf("</style>"));
check("page: exactly one tab is selected on load, and only the other pane is hidden",
  [(markup.match(/aria-selected="true"/g) ?? []).length, (markup.match(/ hidden>/g) ?? []).length], [1, 1]);
check("page: tabs are buttons that toggle el.hidden -- never inline style.display",
  [/pane\.hidden = !on/.test(PAGE), /style\.display/.test(PAGE)], [true, false]);
check("page: a tab is a real button with aria-selected and a roving tab index",
  /<button class="tab" type="button" role="tab" id="tab-roadmap" data-slug="roadmap" aria-controls="sec-roadmap" aria-selected="false" tabindex="-1">/.test(PAGE),
  true);
check("page: arrow keys, Home and End move between tabs",
  ["ArrowRight", "ArrowLeft", "Home", "End"].map((k) => PAGE.includes(`'${k}'`)), [true, true, true, true]);
check("page: there is a visible focus ring, not an outline:none",
  [/\.tab:focus-visible[^{]*\{outline:2px solid var\(--focus\)/.test(PAGE), /outline:\s*none/.test(PAGE)],
  [true, false]);
check("page: the visible tab is routed on location.hash, read on load AND on hashchange",
  [/addEventListener\('hashchange'/.test(PAGE), /show\(fromHash\(\), false\);\n\}\)\(\)/.test(PAGE)],
  [true, true]);
check("page: only a plain #name routes -- '#/path' and a query string fall back to the first tab",
  /\/\^\[a-z0-9-\]\+\$\/\.test\(h\)/.test(PAGE), true);
check("page: table cells use tabular figures", /font-variant-numeric:tabular-nums/.test(PAGE), true);
check("page: anything wide -- tables and code -- sits in its own overflow-x:auto box",
  [/\.tablewrap\{overflow-x:auto;min-width:0/.test(PAGE), /\.codewrap\{overflow-x:auto;min-width:0/.test(PAGE)],
  [true, true]);
check("page: sibling groups are laid out with gap, and every text-bearing child has min-width:0",
  [/\.wrap\{[^}]*display:flex;flex-direction:column;gap:/.test(PAGE),
    (PAGE.match(/min-width:0/g) ?? []).length >= 8], [true, true]);
check("page: a side gutter of at least 16px at 400px wide",
  [/\.wrap\{[^}]*padding:44px 16px/.test(PAGE), /@media \(max-width:520px\)\{\n  \.wrap\{padding:30px 16px/.test(PAGE)],
  [true, true]);
check("page: nothing is given a min-width that could be wider than the screen",
  /min-width:\s*(?!0)/.test(PAGE), false);
check("page: reduced motion is respected", /@media \(prefers-reduced-motion: reduce\)/.test(PAGE), true);
check("page: the page says where it came from and how to rebuild it",
  PAGE.includes("npm run build:tracker"), true);

// ═══════════════════════════════════════════════════════════════════════════
// 6. The tab script, RUN against a DOM stub
//
// Asserting that the source says `pane.hidden = !on` proves the string is
// there, not that a tab works. The script is the one part of this page with
// behaviour, so it is executed: hash on load, hashchange, a junk hash, a
// click, the arrow keys. A tab rail that shows two panes at once, or none,
// is the sort of thing a reader meets and a grep does not.
// ═══════════════════════════════════════════════════════════════════════════
type Ev = { key: string; preventDefault: () => void };
type TabStub = {
  attrs: Record<string, string>;
  tabIndex: number;
  focused: boolean;
  listeners: Record<string, Array<(e: Ev) => void>>;
  getAttribute: (k: string) => string | undefined;
  setAttribute: (k: string, v: string) => void;
  focus: () => void;
  addEventListener: (k: string, fn: (e: Ev) => void) => void;
};
// Four tabs, because wrapping past the last one needs more than two.
const TABBED = buildPage(
  ["01-architecture", "02-roadmap", "03-backlog", "04-changelog"].map((f) =>
    parseDoc(`${f}.md`, `# ${f.slice(3)}\n\nbody text.`)),
);
const SLUGS = [...TABBED.matchAll(/data-slug="([a-z0-9-]+)"/g)].map((m) => m[1]);
const panes: Record<string, { id: string; hidden: boolean }> = {};
const stubs: TabStub[] = SLUGS.map((slug, k): TabStub => {
  panes[`sec-${slug}`] = { id: `sec-${slug}`, hidden: k !== 0 };
  return {
    attrs: { "aria-selected": k === 0 ? "true" : "false", "aria-controls": `sec-${slug}`, "data-slug": slug },
    tabIndex: k === 0 ? 0 : -1,
    focused: false,
    listeners: {},
    getAttribute(key) { return this.attrs[key]; },
    setAttribute(key, v) { this.attrs[key] = v; },
    focus() { this.focused = true; },
    addEventListener(key, fn) { (this.listeners[key] ??= []).push(fn); },
  };
});
const winListeners: Record<string, Array<() => void>> = {};
const loc = { hash: `#${SLUGS[1]}` };
const sandbox = {
  document: {
    querySelectorAll: () => stubs,
    getElementById: (id: string) => panes[id] ?? null,
  },
  location: loc,
  window: { addEventListener: (k: string, fn: () => void) => void ((winListeners[k] ??= []).push(fn)) },
  Array,
};
const vm = await import("node:vm");
vm.createContext(sandbox);
vm.runInContext(TABBED.slice(TABBED.indexOf("<script>") + 8, TABBED.indexOf("</script>")), sandbox);
const seen = () => ({
  selected: stubs.filter((t) => t.attrs["aria-selected"] === "true").map((t) => t.attrs["data-slug"]),
  shown: Object.values(panes).filter((pn) => !pn.hidden).map((pn) => pn.id),
  tabbable: stubs.filter((t) => t.tabIndex === 0).map((t) => t.attrs["data-slug"]),
});
const hashTo = (h: string) => {
  loc.hash = h;
  (winListeners.hashchange ?? []).forEach((fn) => fn());
};

check("run: the hash decides the visible tab ON LOAD, and exactly one pane is shown",
  seen(), { selected: [SLUGS[1]], shown: [`sec-${SLUGS[1]}`], tabbable: [SLUGS[1]] });
check("run: a later hashchange moves it", (hashTo(`#${SLUGS[0]}`), seen().selected), [SLUGS[0]]);
check("run: '#/a-path', a query string and an unknown slug all fall back to the FIRST tab",
  [`#/${SLUGS[1]}`, `#${SLUGS[1]}?x=1`, "#nope", ""].map((h) => (hashTo(h), seen().selected[0])),
  [SLUGS[0], SLUGS[0], SLUGS[0], SLUGS[0]]);
check("run: a click selects that tab, hides the others and writes the hash",
  (stubs[2].listeners.click[0]({ key: "", preventDefault() {} }), [seen(), loc.hash.replace(/^#/, "")]),
  [{ selected: [SLUGS[2]], shown: [`sec-${SLUGS[2]}`], tabbable: [SLUGS[2]] }, SLUGS[2]]);
check("run: ArrowRight moves to the next tab AND takes focus with it",
  (stubs[2].listeners.keydown[0]({ key: "ArrowRight", preventDefault() {} }),
    [seen().selected, stubs[3].focused]), [[SLUGS[3]], true]);
check("run: End goes to the last tab, and ArrowRight from there wraps to the first",
  (stubs[3].listeners.keydown[0]({ key: "End", preventDefault() {} }),
    [seen().selected, (stubs[SLUGS.length - 1].listeners.keydown[0]({ key: "ArrowRight", preventDefault() {} }),
      seen().selected)]),
  [[SLUGS[SLUGS.length - 1]], [SLUGS[0]]]);
check("run: a pane is hidden with the hidden PROPERTY -- nothing ever touched an inline style",
  Object.values(panes).every((pn) => typeof pn.hidden === "boolean"), true);

// ═══════════════════════════════════════════════════════════════════════════
// 7. Drift -- the check that stops the committed page going stale
// ═══════════════════════════════════════════════════════════════════════════
const sha = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const OUT = join(SRC_DIR, OUT_NAME);
if (!existsSync(SRC_DIR) || sourceFiles(SRC_DIR).length === 0) {
  // Deliberately a SKIP and deliberately loud: there is nothing to compare
  // against until the markdown exists. Once one NN-slug.md lands this becomes
  // a real check, and it fails rather than skips.
  console.log(
    `SKIP drift: ${SRC_DIR} has no NN-slug.md sources yet, so there is no page to compare. ` +
      `This SKIP turns into a check the moment one lands.`,
  );
} else {
  const fresh = buildFromDir(SRC_DIR).html;
  const have = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (have !== fresh) {
    const a = have.split("\n");
    const b = fresh.split("\n");
    let k = 0;
    while (k < Math.min(a.length, b.length) && a[k] === b[k]) k++;
    console.log(`       first difference at line ${k + 1} of ${OUT}`);
  }
  check(`drift: ${OUT} is byte-identical to a fresh build -- if this FAILS, run npm run build:tracker`,
    sha(have), sha(fresh));
  // The same selector check as section 10, but against the page that really
  // ships, in case the real markdown reaches a class the fixture does not.
  const live = [...new Set([...fresh.slice(fresh.indexOf("</style>")).matchAll(/class="([^"]+)"/g)]
    .flatMap((m) => m[1].trim().split(/\s+/)))].sort();
  check("drift: every class the REAL page emits has a rule in the stylesheet it ships with",
    live.filter((c) => !new RegExp(`\\.${c}[^\\w-]`).test(fresh.slice(fresh.indexOf("<style>")))), []);
  check("drift: the real page is built from all eight sources, one tab each",
    [sourceFiles(SRC_DIR).length, (fresh.match(/role="tabpanel"/g) ?? []).length],
    [sourceFiles(SRC_DIR).length, sourceFiles(SRC_DIR).length]);
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. Theming, asserted against the generated page
// ═══════════════════════════════════════════════════════════════════════════
const css = PAGE.slice(PAGE.indexOf("<style>") + 8, PAGE.indexOf("</style>"));
const rootBlock = /\n:root\{([^}]*)\}/.exec(css);
const mediaBlock = /@media \(prefers-color-scheme: dark\)\{:root:not\(\[data-theme="light"\]\)\{([^}]*)\}\}/.exec(css);
const attrBlock = /\n:root\[data-theme="dark"\]\{([^}]*)\}/.exec(css);
const names = (s: string) => [...s.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]).sort();
const defined = rootBlock === null ? [] : names(rootBlock[1]);
const used = [...new Set([...css.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]))].sort();

check("theme: every colour is a token on bare ':root' with its light value",
  [rootBlock !== null, defined.length >= 25], [true, true]);
check("theme: EVERY --token used anywhere is defined on bare ':root'",
  used.filter((t) => !defined.includes(t)), []);
check("theme: ...and no token is defined and then never used",
  defined.filter((t) => !used.includes(t)), []);
check("theme: the two dark blocks exist, with the exact guarded selectors",
  [mediaBlock !== null, attrBlock !== null], [true, true]);
check("theme: ...they redefine the SAME token set, so neither theme can drift from the other",
  [mediaBlock === null ? [] : names(mediaBlock[1]), attrBlock === null ? [] : names(attrBlock[1])],
  [attrBlock === null ? [] : names(attrBlock[1]), attrBlock === null ? [] : names(attrBlock[1])]);
check("theme: ...and every token they redefine is one bare ':root' already defines",
  (attrBlock === null ? [] : names(attrBlock[1])).filter((t) => !defined.includes(t)), []);
check("theme: both dark blocks set color-scheme:dark",
  [mediaBlock !== null && /color-scheme:dark/.test(mediaBlock[1]),
    attrBlock !== null && /color-scheme:dark/.test(attrBlock[1])], [true, true]);
check("theme: body sets an explicit background from a token",
  /body\{[^}]*background:var\(--bg\)/.test(css), true);
// prefers-color-scheme is what decides for the viewers with no data-theme
// attribute, which is nearly all of them -- so a colour defined only inside a
// media query or only under [data-theme] is a colour half the readers never see.
const components = css.slice(css.indexOf("html{"));
check("theme: the token blocks all come before the component rules",
  [rootBlock !== null && css.indexOf(":root{") < css.indexOf("html{"),
    css.indexOf('[data-theme="dark"]') < css.indexOf("html{")], [true, true]);
check("theme: NO component rule carries a literal colour that would read in one theme only",
  [...components.matchAll(
    /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|lch)\(|(?<![\w-])(?:white|black|silver|navy|maroon|olive|teal|fuchsia|aqua|red|green|blue|gray|grey|yellow|orange|purple|pink|brown)(?![\w-])/g,
  )].map((m) => m[0]), []);
check("theme: the six pill colours are their own tokens, separate from the accent",
  SUPPORTED.pills.flatMap((p) => [`--${p}-fg`, `--${p}-bg`]).filter((t) => !defined.includes(t)), []);
check("theme: ...and each pill class uses them",
  SUPPORTED.pills.map((p) => components.includes(`.st-${p}{color:var(--${p}-fg);background:var(--${p}-bg)}`)),
  SUPPORTED.pills.map(() => true));

// ═══════════════════════════════════════════════════════════════════════════
// 9. The CSP -- a remote image or a CDN script fails SILENTLY once published
// ═══════════════════════════════════════════════════════════════════════════
const FONT_HOSTS = /^https:\/\/fonts\.(?:googleapis|gstatic)\.com(?:\/|$)/;
check("csp: no remote subresource of any kind is referenced",
  [/<img\b/i, /<iframe\b/i, /<object\b/i, /<embed\b/i, /<script[^>]+\bsrc=/i, /@import/i]
    .filter((re) => re.test(PAGE)).map(String), []);
check("csp: no url() in the stylesheet at all, so no font or image can be fetched sideways",
  (css.match(/url\(/g) ?? []).length, 0);
check("csp: every <link> points at a font host and nothing else",
  [...PAGE.matchAll(/<link\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1]).filter((u) => !FONT_HOSTS.test(u)), []);
check("csp: no src= anywhere references a remote host",
  [...PAGE.matchAll(/\bsrc="([^"]+)"/g)].map((m) => m[1]), []);
// Deliberately scoped to LOADS, not navigations: an <a href> to an external
// site is a link somebody clicks, which the CSP has no opinion about, and the
// markdown exists partly to link things out.
check("csp: the only https:// outside an <a href> is a font host",
  [...PAGE.replace(/<a href="[^"]*"/g, "<a>").matchAll(/https:\/\/[^"')\s]+/g)]
    .map((m) => m[0]).filter((u) => !/^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(u)), []);
check("csp: ...and an external link in the markdown still survives, with rel=noopener",
  PAGE.includes('<a href="https://example.com/h?a=1&amp;b=2" target="_blank" rel="noopener">the handover</a>'), true);

// ═══════════════════════════════════════════════════════════════════════════
// 10. Every class the renderer emits has a rule, and every rule has a class
//
// This repo's signature failure is a selector that does not match where it is
// used -- twelve times so far. A class emitted with no rule is invisible
// breakage: the page looks nearly right and nobody can see what is missing.
// ═══════════════════════════════════════════════════════════════════════════
const emitted = [...new Set(
  [...PAGE.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].trim().split(/\s+/)),
)].sort();
const styled = [...new Set([...components.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)].map((m) => m[1]))].sort();
check("css: every class the renderer emits has a rule in the stylesheet",
  emitted.filter((c) => !styled.includes(c)), []);
check("css: every class rule in the stylesheet matches something the renderer emits",
  styled.filter((c) => !emitted.includes(c)), []);
check("css: ...and the set is the whole component vocabulary, not an accident of one fixture",
  emitted,
  ["code", "codewrap", "eyebrow", "foot", "masthead", "note", "num", "pagetitle", "pane", "pill",
    "st-blocked", "st-done", "st-now", "st-open", "st-todo", "st-wait", "standfirst", "tab",
    "tablewrap", "tabs", "warn", "wrap"]);

console.log(`\n${failed === 0 ? "ALL PASS" : `${failed} FAILED`} -- ${ran} checks`);
if (failed > 0) process.exit(1);
