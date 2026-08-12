# Regenerating the PDF

`Deepen-business-plan.pdf` is rendered from `one-page-plan.html`. Edit the HTML, then
re-render. Do not hand-edit the PDF.

## What the build does

1. **Embeds the fonts.** Downloads the Newsreader and Inter woff2 files from Google Fonts,
   base64-encodes them, and inlines them as `@font-face` rules. This is why the PDF renders
   correctly on a machine with no network and no fonts installed. Latin subset only.
2. **Adds print CSS.** A4 with 13/11/15/11mm margins, `print-color-adjust: exact` so the
   backgrounds survive, and `break-inside: avoid` on every card, table, grid and callout so
   nothing splits across a page.
3. **Forces one page break**, before Competition. Without it the market section's two
   conclusions get orphaned onto the next page.
4. **Renders through headless Chromium** at **scale 0.74**, which is the value that lands the
   document on three full pages. Higher pushes it to four with a half-empty page.
5. **Adds a running footer** with page numbers, and sets the PDF metadata title.

## Rebuilding

Chromium is at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, driven by Playwright.
The steps: fetch and inline the two font families, inject the print stylesheet, add the
`pagebreak` class to the Competition heading, then `page.pdf()` with `format: A4`,
`scale: 0.74`, `print_background: true`, `display_header_footer: true` and the footer
template. Finish by writing the metadata with pypdf.

## Checking it

Always look at the result rather than trusting it. Render each page to PNG with
`pdftoppm -png -r 68` and inspect. The two failure modes are a nearly empty page from a
badly placed break, and a section heading stranded at the foot of a page.

## If the page count changes

Content grew or shrank. Adjust the scale in small steps rather than adding page breaks.
Breaks are a last resort and each one risks dead space.
