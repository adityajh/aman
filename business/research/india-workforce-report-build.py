import json

D = json.load(open("india-workforce-projections.json"))

BENCH = [
    ("Argentina",       322.46, 14.52, 2020, 13970),
    ("Norway",          247.19, 22.77, 2020, 89889),
    ("Germany",         223.76, 14.22, 2020, 56104),
    ("Finland",         222.17, 20.19, 2020, 53156),
    ("Australia",       205.68, 13.37, 2020, 64610),
    ("United Kingdom",  201.14, 13.76, 2020, 53341),
    ("Brazil",          164.29,  3.69, 2020, 10311),
    ("Japan",           111.92, 12.55, 2020, 33797),
    ("South Korea",      45.00,  7.91, 2020, 36239),
    ("Iran",             22.97,  2.48, 2020,  5190),
    ("Kenya",            15.32,  0.22, 2020,  2133),
    ("China",             8.60,  2.55, 2020, 13293),
    ("Vietnam",           4.16,  0.99, 2020,  4717),
    ("Indonesia",         3.01,  0.41, 2020,  4925),
    ("Philippines",       1.68,  0.22, 2020,  3985),
    ("Bangladesh",        1.10,  0.17, 2020,  2593),
    ("Pakistan",          0.55,  0.14, 2020,  1479),
]
INDIA_WHO   = ("India — as WHO counts it",   1.93, 0.29, 2017, 2592)
INDIA_MODEL = ("India — incl. informal layer", 4.94, 0.89, 2026, 2592)

DATA = {
    "years": D["years"],
    "base2026": D["base_2026"],
    "scenarios": D["scenarios"],
    "tam": D["tam"],
    "bench": [{"c": c, "tot": t, "psy": p, "yr": y, "gdp": g} for c, t, p, y, g in BENCH],
    "indiaWho":   {"c": INDIA_WHO[0],   "tot": INDIA_WHO[1],   "psy": INDIA_WHO[2],   "yr": INDIA_WHO[3],   "gdp": INDIA_WHO[4]},
    "indiaModel": {"c": INDIA_MODEL[0], "tot": INDIA_MODEL[1], "psy": INDIA_MODEL[2], "yr": INDIA_MODEL[3], "gdp": INDIA_MODEL[4]},
}

HTML = r"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>India's counselling workforce, 2026&ndash;2036</title>
<style>
:root{
  color-scheme:light;
  --page:#f9f9f7; --surface:#fcfcfb;
  --ink:#0b0b0b; --ink2:#52514e; --muted:#898781;
  --grid:#e1e0d9; --axis:#c3c2b7; --border:rgba(11,11,11,.10);
  --s1:#2a78d6; --s2:#eb6834; --s3:#1baf7a;
  --o1:#86b6ef; --o2:#3987e5; --o3:#1c5cab; --o4:#0d366b;
  --warn:#fab219; --crit:#d03b3b; --good:#0ca30c;
  --chip:rgba(11,11,11,.045);
}
:root[data-theme="dark"]{
  color-scheme:dark;
  --page:#0d0d0d; --surface:#1a1a19;
  --ink:#fff; --ink2:#c3c2b7; --muted:#898781;
  --grid:#2c2c2a; --axis:#383835; --border:rgba(255,255,255,.10);
  --s1:#3987e5; --s2:#d95926; --s3:#199e70;
  --o1:#184f95; --o2:#2a78d6; --o3:#6da7ec; --o4:#b7d3f6;
  --chip:rgba(255,255,255,.06);
}
@media (prefers-color-scheme:dark){
  :root:where(:not([data-theme="light"])){
    color-scheme:dark;
    --page:#0d0d0d; --surface:#1a1a19;
    --ink:#fff; --ink2:#c3c2b7; --muted:#898781;
    --grid:#2c2c2a; --axis:#383835; --border:rgba(255,255,255,.10);
    --s1:#3987e5; --s2:#d95926; --s3:#199e70;
    --o1:#184f95; --o2:#2a78d6; --o3:#6da7ec; --o4:#b7d3f6;
    --chip:rgba(255,255,255,.06);
  }
}
*{box-sizing:border-box}
body{margin:0;background:var(--page);color:var(--ink);
 font:16px/1.62 system-ui,-apple-system,"Segoe UI",sans-serif;
 -webkit-font-smoothing:antialiased}
.wrap{max-width:1000px;margin:0 auto;padding:0 24px 96px}
header{padding:56px 0 20px;border-bottom:1px solid var(--border);margin-bottom:44px}
.eyebrow{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600}
h1{font-size:clamp(30px,4.4vw,46px);line-height:1.1;margin:14px 0 12px;letter-spacing:-.022em;font-weight:680}
.sub{font-size:19px;color:var(--ink2);max-width:66ch;margin:0}
.meta{margin-top:20px;font-size:13px;color:var(--muted);display:flex;gap:18px;flex-wrap:wrap}
h2{font-size:15px;letter-spacing:.075em;text-transform:uppercase;color:var(--muted);
   font-weight:650;margin:64px 0 6px;padding-top:26px;border-top:1px solid var(--border)}
h3{font-size:25px;line-height:1.22;margin:6px 0 16px;letter-spacing:-.014em;font-weight:660;max-width:42ch}
h4{font-size:16px;margin:30px 0 8px;font-weight:650}
p{margin:0 0 15px;max-width:70ch}
p.lead{font-size:18px;color:var(--ink2)}
a{color:var(--s1)}
small{font-size:13px;color:var(--muted)}
strong{font-weight:640}
.callout{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--warn);
  border-radius:8px;padding:16px 18px;margin:22px 0;font-size:15px;color:var(--ink2)}
.callout.crit{border-left-color:var(--crit)}
.callout.good{border-left-color:var(--good)}
.callout b{color:var(--ink)}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:26px 0}
.tile{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 17px}
.tile .k{font-size:12px;color:var(--muted);font-weight:600;letter-spacing:.03em;text-transform:uppercase}
.tile .v{font-size:31px;font-weight:670;letter-spacing:-.02em;margin:6px 0 2px;line-height:1.05}
.tile .n{font-size:13px;color:var(--ink2);line-height:1.42}
figure{margin:30px 0;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px 20px 14px}
figcaption{font-size:13px;color:var(--muted);margin-top:12px;line-height:1.5;padding-top:11px;border-top:1px solid var(--border)}
.figtitle{font-size:17px;font-weight:640;margin:0 0 3px}
.figsub{font-size:14px;color:var(--ink2);margin:0 0 16px}
svg{display:block;width:100%;overflow:visible}
.tick{font-size:11px;fill:var(--muted)}
.dlabel{font-size:12px;font-weight:640}
.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--ink2);margin:0 0 14px}
.legend i{width:11px;height:11px;border-radius:3px;display:inline-block;margin-right:6px;vertical-align:-1px}
.seg{display:inline-flex;background:var(--chip);border-radius:8px;padding:3px;gap:2px;margin:0 0 16px;flex-wrap:wrap}
.seg button{border:0;background:transparent;color:var(--ink2);font:inherit;font-size:13.5px;font-weight:580;
 padding:7px 14px;border-radius:6px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 3px rgba(0,0,0,.10)}
table{border-collapse:collapse;width:100%;font-size:13.5px;margin:18px 0;font-variant-numeric:tabular-nums}
th,td{text-align:right;padding:8px 9px;border-bottom:1px solid var(--border)}
th:first-child,td:first-child{text-align:left;font-variant-numeric:normal}
thead th{font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);font-weight:640}
tbody tr:hover{background:var(--chip)}
td.hi{font-weight:660}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin:22px 0}
.card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:17px 18px}
.card h5{margin:0 0 4px;font-size:16px;font-weight:660}
.card .tag{font-size:11.5px;font-weight:640;letter-spacing:.05em;text-transform:uppercase;margin-bottom:9px}
.card p{font-size:14px;color:var(--ink2);margin:0 0 10px}
.card ul{margin:0;padding-left:17px;font-size:13.5px;color:var(--ink2)}
.card li{margin-bottom:3px}
.waterfall{margin:22px 0}
.wf{display:flex;align-items:center;gap:14px;padding:9px 0;border-bottom:1px solid var(--border)}
.wf:last-child{border-bottom:0}
.wf .bar{height:26px;border-radius:4px;background:var(--o2);flex-shrink:0;min-width:3px;max-width:58%}
.wf .lab{font-size:14px;color:var(--ink2);flex:1;min-width:150px}
.wf .num{font-size:15px;font-weight:650;font-variant-numeric:tabular-nums;min-width:78px;text-align:right}
.wf.total{border-top:2px solid var(--axis);margin-top:5px;padding-top:12px}
.wf.total .num{font-size:19px}
.wf.total .bar{background:var(--o4)}
.srcs{font-size:13.5px;color:var(--ink2)}
.srcs li{margin-bottom:7px}
.tooltip{position:fixed;pointer-events:none;background:var(--surface);border:1px solid var(--border);
 border-radius:8px;padding:9px 11px;font-size:12.5px;box-shadow:0 6px 22px rgba(0,0,0,.16);
 opacity:0;transition:opacity .1s;z-index:50;font-variant-numeric:tabular-nums;max-width:250px}
.tooltip .tt{font-weight:660;margin-bottom:4px;font-size:13px}
.tooltip .tr{display:flex;justify-content:space-between;gap:14px}
.tooltip .tr span:last-child{font-weight:640}
.themebtn{position:fixed;top:16px;right:16px;background:var(--surface);border:1px solid var(--border);
 border-radius:8px;width:34px;height:34px;cursor:pointer;color:var(--ink2);font-size:15px;z-index:60}
.conf{display:inline-block;font-size:10.5px;font-weight:680;letter-spacing:.04em;padding:2px 6px;
 border-radius:4px;vertical-align:2px;margin-left:5px;text-transform:uppercase}
.conf.hard{background:rgba(12,163,12,.14);color:var(--good)}
.conf.est{background:rgba(250,178,25,.16);color:#8a6000}
.conf.weak{background:rgba(208,59,59,.13);color:var(--crit)}
:root[data-theme="dark"] .conf.est{color:var(--warn)}
@media (prefers-color-scheme:dark){:root:where(:not([data-theme="light"])) .conf.est{color:var(--warn)}}
@media (max-width:620px){.wrap{padding:0 16px 64px}.wf .lab{min-width:110px;font-size:13px}}
.print-only{display:none}

/* ---------------------------------------------------------------- print */
@page{ size:A4; margin:16mm 14mm 18mm; }
@media print{
  :root, :root[data-theme="dark"], :root[data-theme="light"]{
    color-scheme:light;
    --page:#fff; --surface:#fff;
    --ink:#000; --ink2:#333; --muted:#666;
    --grid:#dcdcd6; --axis:#aaa; --border:rgba(0,0,0,.18);
    --s1:#2a78d6; --s2:#eb6834; --s3:#1baf7a;
    --o1:#86b6ef; --o2:#3987e5; --o3:#1c5cab; --o4:#0d366b;
    --chip:#f2f2ef;
  }
  html,body{background:#fff !important}
  body{font-size:9.6pt;line-height:1.5}
  .wrap{max-width:none;padding:0}
  .themebtn,.tooltip,.seg,.screen-only{display:none !important}
  .print-only{display:block}

  /* page architecture */
  header{padding:0 0 12pt;margin:0 0 16pt}
  h1{font-size:26pt;margin:10pt 0 8pt}
  .sub{font-size:12pt}
  h2{break-before:page;margin:0 0 4pt;padding-top:0;border-top:0;
     font-size:8.5pt;letter-spacing:.1em}
  h3{font-size:16pt;margin:2pt 0 10pt;break-after:avoid}
  h4{font-size:11pt;margin:14pt 0 5pt;break-after:avoid}
  p{margin:0 0 8pt;max-width:none;orphans:3;widows:3}
  p.lead{font-size:11pt}
  a{color:#1c5cab;text-decoration:none}

  /* keep blocks whole */
  figure,.card,.callout,.tiles,.tile,.waterfall,.wf,.grid2{break-inside:avoid}
  figure{margin:12pt 0;padding:10pt 10pt 8pt;border:1px solid var(--border);
         box-shadow:none;background:#fff}
  .figtitle{font-size:11pt}.figsub{font-size:9pt;margin-bottom:8pt}
  figcaption{font-size:8.2pt;margin-top:8pt;padding-top:7pt}
  .tile .v{font-size:20pt}.tile .k{font-size:7.5pt}.tile .n{font-size:8.2pt}
  .tiles{grid-template-columns:repeat(4,1fr);gap:7pt}
  .grid2{grid-template-columns:repeat(3,1fr);gap:8pt}
  .card{padding:10pt}.card h5{font-size:11pt}.card p{font-size:8.6pt}
  .card ul{font-size:8.2pt}.card .tag{font-size:7.5pt}
  .callout{padding:9pt 11pt;font-size:9pt;background:#fafaf8}
  .wf{padding:5pt 0}.wf .lab{font-size:8.6pt}.wf .num{font-size:9pt}
  .wf .bar{height:15pt}
  .srcs{font-size:8.6pt}.srcs li{margin-bottom:4pt}

  /* tables */
  table{font-size:8pt;margin:9pt 0;break-inside:auto}
  thead{display:table-header-group}
  tr{break-inside:avoid;break-after:auto}
  th,td{padding:4pt 5pt}
  thead th{font-size:7pt}
  tbody tr:hover{background:transparent}
  .conf{font-size:6.8pt;padding:1px 4px}

  /* print-only scenario blocks */
  .pblock{break-inside:avoid;margin:0 0 14pt}
  .pblock h5{font-size:10.5pt;margin:0 0 6pt;font-weight:660;
             padding-bottom:4pt;border-bottom:1px solid var(--border)}
  .pblock:first-child{margin-top:4pt}
  .plegend{font-size:8pt;color:var(--ink2);margin:0 0 8pt;display:flex;gap:14pt;flex-wrap:wrap}
  .plegend i{width:9px;height:9px;border-radius:2px;display:inline-block;margin-right:5px}
  .pfoot{margin-top:16pt;padding-top:10pt;border-top:1px solid var(--border);
         font-size:8pt;color:var(--muted)}
}
</style></head><body>
<button class="themebtn" id="tbtn" title="Toggle theme">&#9681;</button>
<div class="wrap">

<header>
  <div class="eyebrow">Market research &middot; India</div>
  <h1>How many people in India actually do counselling for a living?</h1>
  <p class="sub">Nobody knows. There is no register, no census and no reliable estimate.
  This reconstructs the number from the one hard flow figure that exists, benchmarks it
  against countries that do count, and projects it to 2036 under three scenarios.</p>
  <div class="meta">
    <span>12 August 2026</span><span>&middot;</span>
    <span>Base year 2026 &middot; horizon 2036</span><span>&middot;</span>
    <span>Prepared for the Aman market section</span>
  </div>
</header>

<p class="lead">Every number you have read about India's mental health workforce is either
a decade old, a single journal letter repeated until it sounded official, or a consultancy
figure measuring psychiatric pharmaceuticals. The counselling layer &mdash; the people who
would actually use practice software &mdash; has never been counted at all.</p>

<p>That is not a gap you can close by searching harder; it is structural. &ldquo;Counsellor&rdquo;
is not a protected title in India. The Rehabilitation Council of India Act 1992 names
<em>Clinical Psychologist</em> as one of seventeen registrable categories and does not
name counselling psychologist at all, so there is no register to count against. What
follows builds the number from the supply pipeline instead, then stress-tests it against
international ratios.</p>

<div class="tiles">
  <div class="tile"><div class="k">Practising counsellors, 2026</div><div class="v" id="t-c26">&mdash;</div>
    <div class="n">Talk therapy as primary paid occupation. Reconstructed, not observed.</div></div>
  <div class="tile"><div class="k">Licensed specialists, 2026</div><div class="v" id="t-l26">&mdash;</div>
    <div class="n">Psychiatrists plus RCI-registered clinical psychologists.</div></div>
  <div class="tile"><div class="k">Psychology PGs per year</div><div class="v">14,759</div>
    <div class="n">AISHE 2023&ndash;24, verified against the primary table. The feeder.</div></div>
  <div class="tile"><div class="k">Clinical psych. seats per year</div><div class="v">~290</div>
    <div class="n">2&percnt; of the graduate flow can ever be licensed. The other 98&percnt; go unregulated.</div></div>
</div>

<h2>01 &mdash; The counting problem</h2>
<h3>The figures in circulation are worse than you think</h3>

<p><strong>&ldquo;0.75 psychiatrists per 100,000&rdquo;</strong> is the most-quoted statistic about
Indian mental health. It comes from a single one-page letter in the <em>Indian Journal of
Psychiatry</em> in 2019, whose authors triangulated &ldquo;about 9,000 and counting&rdquo;
psychiatrists from a professional-society directory, a human-rights-commission report and
a pharmaceutical company's conference attendance data, then divided by population. The
Ministry of Health's own February 2025 press release attributes the figure to
&ldquo;the Indian Journal of Psychiatry&rdquo; rather than to any government count. India's
last official submission to the WHO Mental Health Atlas, in 2016, said 0.29.</p>

<div class="callout"><b>India has no WHO Mental Health Atlas country profile for either the
2020 or the 2024 round.</b> India responded to the 2024 questionnaire &mdash; it is listed as a
contributing country &mdash; but no India-specific profile was published. Any current-sounding
figure claiming a WHO source is repeating 2016 data, or repeating the 2019 letter under a
WHO label it does not carry.</div>

<p>The second problem is that the stale figure is now materially wrong. Psychiatry PG seats
have grown roughly fivefold since 2010 (266 seats across 112 institutions then; about 1,450
MD, DNB and DPM places now). Rolling the 2019 anchor forward through actual seat growth,
a three-year training lag, 90&percnt; completion and 3&percnt; annual attrition puts India at
roughly <strong>13,000 psychiatrists in 2026</strong>, not 9,000. The public conversation is
running on a number that was already an estimate and is now seven years out of date.</p>

<p>A third inconsistency is more revealing. RCI's clinical psychologist register went from
2,840 in 2023 to 4,309 in July 2025 &mdash; roughly 765 additions a year. But the M.Phil
Clinical Psychology programmes that feed it are widely reported to offer only about 290
seats. The register is growing at 2.6&times; its stated intake, which means either the
published seat count is a serious undercount, or a large registration backlog is clearing.
Both are worth knowing; neither is in any published source.</p>

<h2>02 &mdash; Sizing the informal layer</h2>
<h3>One hard number anchors everything else</h3>

<p>The All India Survey on Higher Education publishes discipline-level postgraduate out-turn.
For 2023&ndash;24 it records <strong>14,759 M.A./M.Sc. Psychology graduates</strong>
(3,557 men, 11,202 women) against 54,484 enrolled. This is a real government table, verified
directly against the primary PDF, and it is the only hard flow figure in the entire sector.
Note what it implies: with roughly 290 clinical psychology seats a year, about
<strong>2&percnt; of psychology postgraduates can ever become licensed clinicians</strong>.
The remaining 98&percnt; who want clinical work have nowhere to go but unregulated counselling.
India's informal layer is not a regulatory failure at the edges &mdash; it is the main channel.</p>

<div class="waterfall" id="wf"></div>

<div class="callout"><b>Why not just apply the international ratio?</b> In countries that count
both, counsellors outnumber psychiatrists by 6&times; to 20&times;. Applied to India's ~13,000
psychiatrists that would give 78,000&ndash;260,000. This model lands at 4.2&times;, below the
band &mdash; deliberately. Ratio transfer assumes India's counselling layer is as economically
viable as the counted countries'. A 2026 survey of Indian therapists found a majority earning
&#8377;3 lakh a year or less while carrying 10&ndash;15 clients a week. A market that cannot
pay its practitioners a living wage does not sustain a US-sized counsellor-to-psychiatrist ratio.</div>

<h2>03 &mdash; International benchmark</h2>
<h3>India is not merely behind rich countries. It is behind its own peer group.</h3>

<figure>
  <p class="figtitle">Mental health workers per 100,000 population</p>
  <p class="figsub">WHO Mental Health Atlas 2020 country profiles, except India. Log scale &mdash;
  the spread is three orders of magnitude.</p>
  <div id="c-bench"></div>
  <figcaption>India appears twice: as its own government last reported to WHO in 2016
  (1.93), and as this model counts it once the unregulated counselling layer is included
  (4.94). Even the generous reading leaves India below China and roughly 40&times; below the
  UK; the official reading puts it below Indonesia and the Philippines. The USA and Nigeria
  reported no workforce data to WHO at all and are excluded.</figcaption>
</figure>

<p>The income relationship is real but not deterministic. Across the countries above, log GDP
per capita correlates with workforce density at r&nbsp;=&nbsp;0.72, rising to 0.90 once
Argentina, Brazil and Israel are excluded as cultural outliers. Argentina, at roughly
India's income five times over but nothing like a rich country, has 286 psychologists per
100,000 &mdash; the highest density on earth, a function of a psychoanalytic culture rather
than of money. Policy and culture can override income. That is the whole case for the
optimistic scenario below.</p>

<figure>
  <p class="figtitle">Income explains most of it &mdash; but not all of it</p>
  <p class="figsub">GDP per capita (2024 US&dollar;) against total mental health workers per
  100,000. Both axes logarithmic.</p>
  <div id="c-gdp"></div>
  <figcaption>Countries above the trend spend more attention on mental health than their
  income predicts; countries below spend less. India sits below trend even on the generous
  count &mdash; there is room to move that does not require India to get richer first.</figcaption>
</figure>

<h4>The cautionary tale nobody in Indian policy discussion cites</h4>
<p>China ran the experiment India is drifting toward. From 2002 its labour ministry issued a
national psychological counsellor certification. By 2016 roughly <strong>897,000 people held
it</strong> &mdash; about 180&times; the number of accredited clinical psychologists. Only
30&ndash;40&percnt; ever did any counselling work, and most of those part-time or as a
hobby. In 2017 the government abolished the exam outright, having concluded the credential
had become window dressing. On paper China had a 20&times; counsellor-to-psychiatrist ratio;
in practice roughly 1&times;.</p>

<p>The lesson is not that certification is bad. It is that <em>credential counts are not
capacity</em>. India's Budget pledge to train 100,000 allied health professionals including
mental health counsellors, and NIMHANS Digital Academy's cumulative trainee figures
(reported as both 42,000 and 176,454 by two credible government-adjacent sources, an
unreconciled discrepancy), measure the same thing China was measuring. A projection that
counts them as practitioners would be wrong by an order of magnitude.</p>

<h2>04 &mdash; Ten-year projections</h2>
<h3>Three scenarios, separated by whether anyone pays</h3>

<p>The scenarios do not differ mainly on training capacity. They differ on whether a
<em>payer</em> appears. India already produces far more psychology postgraduates than the
market absorbs into practice; the binding constraint is that a counsellor cannot reliably
earn a living, so entrants churn out. Every historical episode of fast workforce
growth &mdash; UK IAPT from 2008, Australia's Better Access from 2006, the US post-parity
decade &mdash; was triggered by a payer, not by a training expansion.</p>

<div class="grid2">
  <div class="card"><div class="tag" style="color:var(--s1)">Scenario A</div>
    <h5>Credential Drift</h5>
    <p>The NCAHP behavioural-health council never builds a working counsellor pathway.
    Insurance parity stays unenforced. Practice economics stay poor, so churn stays high and
    the credentialed pool grows faster than practice does.</p>
    <ul><li>Psychiatry seats +5&percnt;/yr</li><li>Graduate flow +3&percnt;/yr</li>
    <li>Practice conversion falls 30&percnt; &rarr; 26&percnt;</li>
    <li>Annual exit from practice 9&percnt;</li><li>CBSE school mandate goes unenforced</li></ul></div>
  <div class="card"><div class="tag" style="color:var(--s2)">Scenario B &middot; base</div>
    <h5>Steady Formalisation</h5>
    <p>NCAHP registers counsellors over three to five years. Corporate EAP demand keeps
    compounding from a real base. The platform sector consolidates and grows. The CBSE
    counsellor mandate is partially enforced.</p>
    <ul><li>Psychiatry seats +8&percnt;/yr</li><li>Graduate flow +5&percnt;/yr</li>
    <li>Practice conversion rises 30&percnt; &rarr; 34&percnt;</li>
    <li>Annual exit 7&percnt;</li><li>22,000 school posts absorbed by 2036</li></ul></div>
  <div class="card"><div class="tag" style="color:var(--s3)">Scenario C</div>
    <h5>Demand Unlock</h5>
    <p>A payer event fires: IRDAI outpatient parity actually enforced, or a Better
    Access&ndash;style subsidised session scheme, or Tele-MANAS converted from triage into
    a delivery channel that pays panel counsellors.</p>
    <ul><li>Psychiatry seats +11&percnt;/yr</li><li>Graduate flow +7&percnt;/yr</li>
    <li>Practice conversion rises 30&percnt; &rarr; 46&percnt;</li>
    <li>Annual exit falls to 5&percnt;</li><li>62,000 school posts absorbed</li></ul></div>
</div>

<figure>
  <p class="figtitle">Practising counsellors, 2026&ndash;2036</p>
  <p class="figsub">People whose primary paid occupation is talk therapy or counselling.</p>
  <div id="c-scen"></div>
  <figcaption>The fan is wide because the parameter that matters most &mdash; what share of
  psychology graduates can sustain counselling as a primary job &mdash; is unmeasured in
  India and modelled from China's documented 30&ndash;40&percnt; practice rate. By 2036 the
  scenarios differ by 3.4&times;.</figcaption>
</figure>

<figure class="screen-only">
  <p class="figtitle">Workforce composition</p>
  <p class="figsub">All four practitioner tiers on a logarithmic scale &mdash; they span two
  orders of magnitude, so a linear axis buries the licensed tiers entirely. Switch scenario
  to see how the gap between them moves.</p>
  <div class="seg" id="seg-comp" role="group" aria-label="Scenario">
    <button data-s="drift" aria-pressed="false">Credential Drift</button>
    <button data-s="base" aria-pressed="true">Steady Formalisation</button>
    <button data-s="unlock" aria-pressed="false">Demand Unlock</button>
  </div>
  <div class="legend">
    <span><i style="background:var(--o4)"></i>Psychiatrists</span>
    <span><i style="background:var(--o3)"></i>RCI clinical psychologists</span>
    <span><i style="background:var(--o2)"></i>Counsellors (primary occupation)</span>
    <span><i style="background:var(--o1)"></i>Wider counselling-adjacent</span>
  </div>
  <div id="c-comp"></div>
  <figcaption>The tiers are nested, not additive: every counsellor is inside the wider
  layer. Note what the log scale reveals &mdash; under Credential Drift the counsellor line
  flattens while the licensed lines keep climbing, so the gap between regulated and
  unregulated practice actually <em>narrows</em>. Under Demand Unlock it widens sharply. The
  wider tier adds dual-role school counsellors, corporate EAP panel members,
  coaches, trained lay and community counsellors, and part-time practitioners. It is the
  loosest definition and the least defensible number in this model &mdash; treat it as an
  upper bound on &ldquo;anyone doing paid talk-based helping work&rdquo;, not as a
  professional count.</figcaption>
</figure>

<div class="print-only">
  <h4 style="margin-top:0">Workforce composition, all three scenarios</h4>
  <p style="font-size:9pt">All four practitioner tiers on a logarithmic scale &mdash; they span
  two orders of magnitude, so a linear axis buries the licensed tiers entirely. The tiers are
  nested, not additive: every counsellor is inside the wider layer. Note that under Credential
  Drift the counsellor line flattens while the licensed lines keep climbing, so the gap between
  regulated and unregulated practice actually <em>narrows</em>; under Demand Unlock it widens
  sharply.</p>
  <div class="plegend">
    <span><i style="background:#0d366b"></i>Psychiatrists</span>
    <span><i style="background:#1c5cab"></i>RCI clinical psychologists</span>
    <span><i style="background:#3987e5"></i>Counsellors (primary occupation)</span>
    <span><i style="background:#86b6ef"></i>Wider counselling-adjacent</span>
  </div>
  <div id="p-comp"></div>
</div>

<h4 class="screen-only">The full numbers</h4>
<div class="seg screen-only" id="seg-tab" role="group" aria-label="Scenario">
  <button data-s="drift" aria-pressed="false">Credential Drift</button>
  <button data-s="base" aria-pressed="true">Steady Formalisation</button>
  <button data-s="unlock" aria-pressed="false">Demand Unlock</button>
</div>
<div class="screen-only" style="overflow-x:auto"><table id="tbl"><thead><tr>
  <th>Year</th><th>Psychiatrists</th><th>Clinical psych.</th><th>Counsellors</th>
  <th>Wider layer</th><th>Psych./lakh</th><th>All/lakh</th><th>C : P ratio</th>
</tr></thead><tbody></tbody></table></div>

<div class="print-only ptables">
  <h4 style="margin-top:0">The full numbers, all three scenarios</h4>
  <div id="p-tables"></div>
</div>

<h2>05 &mdash; What this means commercially</h2>
<h3>The workforce grows. The addressable market stays small.</h3>

<p>Aman sells to solo counsellors and never to organisations, so every institution-employed
practitioner &mdash; hospital, school, NGO, government, EAP panel &mdash; leaves the universe
entirely rather than being discounted within it. What remains is solo private practice,
digitally reachable, self-serve, paying in rupees.</p>

<figure>
  <p class="figtitle">Serviceable market at full penetration</p>
  <p class="figsub">Solo private-practice counsellors &times; digitally reachable &times; able to
  pay, at &#8377;999 and &#8377;1,999 per month. This is a ceiling, not a forecast.</p>
  <div id="c-sam"></div>
  <figcaption>For scale: the combined disclosed FY24 revenue of India's ten best-known
  digital mental health platforms &mdash; Wysa, Amaha, YourDOST and seven others &mdash; was
  roughly &#8377;103 crore. Any market-size claim materially above that is a claim about a
  market that does not yet transact.</figcaption>
</figure>

<div class="callout crit"><b>The affordability wall is the finding that matters most.</b>
Pro at &#8377;1,999/month is &#8377;24,000 a year. A counsellor earning &#8377;3 lakh
gross &mdash; the majority, per the 2026 practitioner survey &mdash; would be spending
<strong>8&percnt; of gross revenue</strong> on practice software. That is not a pricing
objection to negotiate past; it is a structural ceiling on how much of the workforce can
ever be a Pro customer, and it does not move until practitioner earnings move. Which is
another way of saying: the thing that grows Aman's market is the same payer event that
defines Scenario C.</div>

<p>Three implications follow, and they are uncomfortable in a useful way.</p>

<p><strong>The India-only solo-counsellor SaaS ceiling is low.</strong> Under the base
scenario, capturing every paying-able solo counsellor in India in 2036 is roughly
&#8377;54 crore of annual revenue. That is a real business and a poor venture story on its
own. The investable thesis cannot be &ldquo;practice management for Indian therapists&rdquo;;
it has to be what the practice data compounds into.</p>

<p><strong>Timing is against a pure wedge play and for the data asset.</strong> The admin
layer has no pricing power &mdash; Zoho gives an equivalent away free, and PractiPal already
undercuts at &#8377;1,499. The scarce thing is longitudinal outcome data across many
practices, which is exactly what nobody in India holds and what cannot be bought later. The
benchmark pool is the only asset in the roadmap that gets harder to replicate over time.</p>

<p><strong>The 98&percnt; is the customer.</strong> The 14,759 psychology postgraduates a
year who cannot get one of ~290 clinical psychology seats are the population that becomes
unregulated counsellors, has no supervisor, no institutional quality signal and no way to
know whether they are any good. That is precisely the person for whom private evidence of
their own effectiveness is worth paying for. The regulatory gap that makes this market
hard to count is the same gap that creates the need.</p>

<div class="callout"><b>Honest state, carried into any investor conversation.</b>
Aman has zero revenue and one free tenant. There is no payment collection, no trial
enforcement, no onboarding and no data import. Automated measure delivery does not exist
&mdash; counsellors type scores by hand. The Outcome Report does not exist. Pricing is
inferred from this analysis, not validated with a single paying customer. Every number in
section 05 is a model output, not a result.</div>

<h2>06 &mdash; Method, confidence and what is missing</h2>

<h4>What each number is worth</h4>
<table><thead><tr><th>Input</th><th style="text-align:left">Value</th><th style="text-align:left">Basis</th></tr></thead>
<tbody>
<tr><td>PG psychology out-turn</td><td style="text-align:left">14,759/yr (2023&ndash;24)</td>
  <td style="text-align:left">AISHE Table 37, primary PDF, independently re-verified<span class="conf hard">Hard</span></td></tr>
<tr><td>PG psychology enrolment</td><td style="text-align:left">54,484</td>
  <td style="text-align:left">AISHE Table 13, primary PDF, re-verified<span class="conf hard">Hard</span></td></tr>
<tr><td>MSW out-turn</td><td style="text-align:left">24,645/yr</td>
  <td style="text-align:left">AISHE Table 37, primary PDF, re-verified<span class="conf hard">Hard</span></td></tr>
<tr><td>Female LFPR</td><td style="text-align:left">41.7&percnt;</td>
  <td style="text-align:left">PLFS 2023&ndash;24 via Economic Survey 2025&ndash;26<span class="conf hard">Hard</span></td></tr>
<tr><td>WHO Atlas benchmarks</td><td style="text-align:left">18 countries</td>
  <td style="text-align:left">Primary country-profile PDFs; self-reported by governments<span class="conf hard">Hard</span></td></tr>
<tr><td>Therapist earnings</td><td style="text-align:left">Majority &le;&#8377;3L/yr</td>
  <td style="text-align:left">Zensible 2026, n=285, 84&percnt; metro &mdash; small and metro-skewed<span class="conf est">Fair</span></td></tr>
<tr><td>Psychiatrists 2026</td><td style="text-align:left">~13,000</td>
  <td style="text-align:left">Reconstructed here from a 2019 estimate plus seat data<span class="conf est">Fair</span></td></tr>
<tr><td>RCI clinical psychologists</td><td style="text-align:left">4,309 (Jul 2025)</td>
  <td style="text-align:left">Parliament reply, but re-verification could not reach the primary<span class="conf est">Fair</span></td></tr>
<tr><td>MD Psychiatry seats</td><td style="text-align:left">1,292 (2024&ndash;25)</td>
  <td style="text-align:left">NMC seat matrix via secondary report; primary unreachable<span class="conf est">Fair</span></td></tr>
<tr><td>M.Phil clin. psych. seats</td><td style="text-align:left">~290/yr</td>
  <td style="text-align:left">Commercial aggregators only; contradicted by register growth<span class="conf weak">Weak</span></td></tr>
<tr><td>Practice conversion rate</td><td style="text-align:left">30&percnt;</td>
  <td style="text-align:left">No India datum exists; anchored on China's 30&ndash;40&percnt;<span class="conf weak">Weak</span></td></tr>
<tr><td>CBSE counsellor mandate</td><td style="text-align:left">1 per 500 students</td>
  <td style="text-align:left">Circular not located on CBSE's own index; treat as unconfirmed<span class="conf weak">Weak</span></td></tr>
<tr><td>Platform FY24 revenue</td><td style="text-align:left">~&#8377;103 cr</td>
  <td style="text-align:left">Aggregator of MCA filings; primary filings not checked<span class="conf weak">Weak</span></td></tr>
<tr><td>Wider adjacent layer</td><td style="text-align:left">~171,000 (2026)</td>
  <td style="text-align:left">Multiplier assumption; the least defensible figure here<span class="conf weak">Weak</span></td></tr>
</tbody></table>

<h4>What would change the answer</h4>
<p><strong>NMHS-2 reports on 10 October 2026.</strong> India's second National Mental Health
Survey has completed fieldwork in 24 states with over 250,000 interviews. Every prevalence
and treatment-gap figure in circulation today is from 2015&ndash;16. If NMHS-2 shows
materially higher prevalence with a similar treatment gap, the demand ceiling re-rates and
the binding constraint could flip from demand to supply inside the decade. This model should
be rebuilt the week it publishes.</p>

<p><strong>The M.Phil to M.Clin.Psy transition.</strong> RCI resolved in April 2026 to replace
the M.Phil nomenclature with a Master of Clinical Psychology. Detailed regulations were still
pending as of August 2026. If the transition expands capacity, the licensed tier changes; if
it merely renames, the 2&percnt; licensing bottleneck persists and the informal layer stays
the whole story.</p>

<p><strong>NCAHP implementation.</strong> All ten professional councils were notified in March
2025, including a Community Care and Behavioural Health council. Whether it builds a real
registration pathway for counsellors is the single largest fork in these projections.</p>

<h4>Known gaps</h4>
<p>AISHE does not disaggregate psychology at undergraduate level &mdash; it reports Social
Science as one lumped row &mdash; so the UG feeder is unquantifiable from official data. No
India-specific study exists on how many qualified psychiatrists or psychologists emigrate,
leave the field or never practise. Tele-MANAS does not disclose its counsellor headcount. No
national DMHP vacancy rate is published. No credible aggregated psychiatrist consultation-fee
data exists. Every major teletherapy platform except three declines to publish practitioner
counts.</p>

<h4>Principal sources</h4>
<ul class="srcs">
<li><a href="https://aishe.gov.in/aishe-final-report/">AISHE 2023&ndash;24 (14th edition)</a>,
  Ministry of Education &mdash; Tables 13 and 37. The load-bearing source.</li>
<li><a href="https://cdn.who.int/media/docs/default-source/mental-health/mental-health-atlas-2017-country-profiles/ind.pdf">WHO Mental Health Atlas 2017 &mdash; India</a>
  and the 2020 country profiles for all comparators.</li>
<li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6341936/">Garg, Kumar &amp; Chandra,
  <em>Indian Journal of Psychiatry</em> 2019</a> &mdash; origin of the 0.75/100,000 figure.</li>
<li><a href="https://indianmhs.nimhans.ac.in/">National Mental Health Survey</a>, NIMHANS
  &mdash; 2015&ndash;16 results; NMHS-2 pending.</li>
<li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11064725/">Yin et al., scoping review of
  China's mental health workforce</a> &mdash; the certification-boom evidence.</li>
<li><a href="https://www.bls.gov/ooh/community-and-social-service/substance-abuse-behavioral-disorder-and-mental-health-counselors.htm">US Bureau of Labor Statistics</a>
  &mdash; 483,500 counsellors, +17&percnt; projected 2024&ndash;34.</li>
<li><a href="https://www.zensible.in/whitepapers/financial-status-of-indian-therapists">Zensible,
  Financial State of Therapy Practice in India 2026</a> &mdash; practitioner earnings.</li>
<li><a href="https://www.indiabudget.gov.in/economicsurvey/doc/eschapter/echap12.pdf">Economic
  Survey 2025&ndash;26, ch. 12</a> &mdash; PLFS labour force participation.</li>
<li><a href="https://cmhlp.org/wp-content/uploads/2026/03/IMHO-Budget-Brief-2026-Final.pdf">CMHLP
  India Mental Health Observatory Budget Brief 2026</a> &mdash; DMHP and Tele-MANAS funding.</li>
</ul>

<p style="margin-top:36px"><small>Model, assumptions and scenario parameters are reproducible;
every parameter is documented inline in the source model. Figures marked Fair or Weak above
should not be quoted without the qualifier attached.</small></p>

</div>
<div class="tooltip" id="tip"></div>
<script>
const D = __DATA__;
const $ = s => document.querySelector(s);
const fmt = n => n.toLocaleString('en-IN');
const tip = $('#tip');
function showTip(e, html){ tip.innerHTML = html; tip.style.opacity = 1;
  const r = tip.getBoundingClientRect();
  let x = e.clientX + 14, y = e.clientY - 10;
  if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14;
  if (y + r.height > innerHeight - 8) y = innerHeight - r.height - 8;
  tip.style.left = x + 'px'; tip.style.top = Math.max(8, y) + 'px'; }
function hideTip(){ tip.style.opacity = 0; }

const SC = ['drift','base','unlock'];
const SCOL = {drift:'var(--s1)', base:'var(--s2)', unlock:'var(--s3)'};
const SNAME = {drift:'Credential Drift', base:'Steady Formalisation', unlock:'Demand Unlock'};

/* ---- hero tiles ---- */
$('#t-c26').textContent = '~' + fmt(Math.round(D.base2026.counsellors/1000)*1000);
$('#t-l26').textContent = '~' + fmt(Math.round((D.base2026.psychiatrists+D.base2026.clinical_psychologists)/1000)*1000);

/* ---- derivation waterfall ---- */
(function(){
  const b = D.base2026;
  const psyPool = b.pg_pool, inWork = Math.round(psyPool*b.lfpr_weighted);
  const fromPsy = Math.round(inWork*0.30);
  const rows = [
    ['Living PG psychology graduates, ~25 cohorts', psyPool, 'AISHE flow walked back at 7%/yr, 5% survival haircut'],
    ['&hellip; in the labour force', inWork, '76% of the cohort is female; gender-weighted LFPR 55.8%'],
    ['&hellip; counselling as primary occupation', fromPsy, '30% conversion, anchored on China\'s documented rate'],
    ['+ MSW route into counselling', 11972, '~370k living MSW graduates, 55% in work, 6% converting'],
    ['+ diploma, psychiatric social work, crossovers', 8000, 'Standalone counselling diplomas and foreign-qualified returnees'],
    ['+ full-time school counsellors', 5000, 'Pre-mandate base'],
  ];
  const total = Math.round(b.counsellors);
  const max = psyPool;
  let h = '';
  rows.forEach(r => {
    h += `<div class="wf" data-n="${r[2]}"><div class="lab">${r[0]}</div>
      <div class="bar" style="width:${Math.max(1,(r[1]/max)*58)}%"></div>
      <div class="num">${fmt(Math.round(r[1]))}</div></div>`;
  });
  h += `<div class="wf total" data-n="Talk therapy as primary paid occupation, 2026"><div class="lab"><b>Practising counsellors, 2026</b></div>
    <div class="bar" style="width:${(total/max)*58}%"></div>
    <div class="num">${fmt(total)}</div></div>`;
  const el = $('#wf'); el.innerHTML = h;
  el.querySelectorAll('.wf').forEach(n => {
    n.addEventListener('mousemove', e => showTip(e, `<div class="tt">${n.querySelector('.num').textContent}</div><div style="color:var(--ink2)">${n.dataset.n}</div>`));
    n.addEventListener('mouseleave', hideTip);
  });
})();

const NS = 'http://www.w3.org/2000/svg';
function svg(w,h){ const s=document.createElementNS(NS,'svg');
  s.setAttribute('viewBox',`0 0 ${w} ${h}`); s.setAttribute('role','img'); return s; }
function el(t,a){ const n=document.createElementNS(NS,t);
  for(const k in a) n.setAttribute(k,a[k]); return n; }

/* ---- 1. benchmark bars (log) ---- */
(function(){
  const rows = D.bench.concat([D.indiaWho, D.indiaModel])
    .sort((a,b)=>b.tot-a.tot);
  const W=760, rowH=25, PAD_L=182, PAD_R=54, H=rows.length*rowH+34;
  const s = svg(W,H);
  const lo=0.4, hi=400;
  const lx = v => PAD_L + (Math.log10(Math.max(v,lo))-Math.log10(lo))/(Math.log10(hi)-Math.log10(lo))*(W-PAD_L-PAD_R);
  [1,10,100].forEach(t=>{
    s.appendChild(el('line',{x1:lx(t),x2:lx(t),y1:16,y2:H-18,stroke:'var(--grid)','stroke-width':1}));
    const g=el('text',{x:lx(t),y:H-5,'text-anchor':'middle',class:'tick'}); g.textContent=t; s.appendChild(g);
  });
  rows.forEach((r,i)=>{
    const y=22+i*rowH, isIndia=r.c.startsWith('India');
    const col = isIndia ? 'var(--s2)' : 'var(--o2)';
    const bw = Math.max(2, lx(r.tot)-PAD_L);
    const g = el('g',{});
    g.appendChild(el('rect',{x:PAD_L,y:y,width:bw,height:15,rx:4,fill:col,
      opacity:isIndia?1:0.82}));
    const t=el('text',{x:PAD_L-9,y:y+12,'text-anchor':'end',class:'tick',
      fill:isIndia?'var(--ink)':'var(--ink2)','font-weight':isIndia?700:400,'font-size':11.5});
    t.textContent=r.c; g.appendChild(t);
    const v=el('text',{x:PAD_L+bw+7,y:y+12,class:'dlabel',
      fill:isIndia?'var(--ink)':'var(--ink2)','font-size':11.5}); v.textContent=r.tot.toFixed(r.tot<10?2:0);
    g.appendChild(v);
    g.appendChild(el('rect',{x:0,y:y-4,width:W,height:rowH,fill:'transparent'}));
    g.addEventListener('mousemove',e=>showTip(e,
      `<div class="tt">${r.c}</div>
       <div class="tr"><span>All MH workers /100k</span><span>${r.tot}</span></div>
       <div class="tr"><span>Psychiatrists /100k</span><span>${r.psy}</span></div>
       <div class="tr"><span>Data year</span><span>${r.yr}</span></div>`));
    g.addEventListener('mouseleave',hideTip);
    s.appendChild(g);
  });
  $('#c-bench').appendChild(s);
})();

/* ---- 2. GDP scatter ---- */
(function(){
  const pts = D.bench.concat([D.indiaModel]);
  const W=760,H=400,PL=48,PR=88,PT=34,PB=46;
  const s=svg(W,H);
  const LABELS={'Argentina':[0,-14],'Norway':[0,-14],'China':[10,4],'Pakistan':[10,4],
                'Brazil':[0,-14],'United Kingdom':[-10,-13]};
  const gx = v => PL+(Math.log10(v)-Math.log10(1200))/(Math.log10(100000)-Math.log10(1200))*(W-PL-PR);
  const gy = v => H-PB-(Math.log10(Math.max(v,0.4))-Math.log10(0.4))/(Math.log10(400)-Math.log10(0.4))*(H-PT-PB);
  [1,10,100].forEach(t=>{
    s.appendChild(el('line',{x1:PL,x2:W-PR,y1:gy(t),y2:gy(t),stroke:'var(--grid)','stroke-width':1}));
    const g=el('text',{x:PL-8,y:gy(t)+4,'text-anchor':'end',class:'tick'}); g.textContent=t; s.appendChild(g);
  });
  [2000,10000,50000].forEach(t=>{
    const g=el('text',{x:gx(t),y:H-PB+18,'text-anchor':'middle',class:'tick'});
    g.textContent='$'+(t/1000)+'k'; s.appendChild(g);
  });
  s.appendChild(el('line',{x1:PL,x2:W-PR,y1:H-PB,y2:H-PB,stroke:'var(--axis)','stroke-width':1}));
  // trend line through non-outliers
  const keep = pts.filter(p=>!['Argentina','Brazil'].includes(p.c) && !p.c.startsWith('India'));
  const xs=keep.map(p=>Math.log10(p.gdp)), ys=keep.map(p=>Math.log10(Math.max(p.tot,0.4)));
  const mx=xs.reduce((a,b)=>a+b)/xs.length, my=ys.reduce((a,b)=>a+b)/ys.length;
  const sl=xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0)/xs.reduce((a,x)=>a+(x-mx)**2,0);
  const f=x=>Math.pow(10,my+sl*(Math.log10(x)-mx));
  s.appendChild(el('line',{x1:gx(1200),y1:gy(f(1200)),x2:gx(100000),y2:gy(f(100000)),
    stroke:'var(--axis)','stroke-width':1.5,'stroke-dasharray':'5 4'}));
  pts.forEach(p=>{
    const isIndia=p.c.startsWith('India');
    const g=el('g',{});
    g.appendChild(el('circle',{cx:gx(p.gdp),cy:gy(p.tot),r:isIndia?7:5.5,
      fill:isIndia?'var(--s2)':'var(--o2)',stroke:'var(--surface)','stroke-width':2}));
    const off = isIndia ? [10,4] : LABELS[p.c];
    if(off){
      const t=el('text',{x:gx(p.gdp)+off[0],y:gy(p.tot)+off[1],
        'text-anchor':off[0]<0?'end':(off[1]<-8?'middle':'start'),class:'dlabel',
        fill:isIndia?'var(--ink)':'var(--ink2)','font-size':11.5});
      t.textContent=isIndia?'India (incl. informal)':p.c; g.appendChild(t);
    }
    g.addEventListener('mousemove',e=>showTip(e,
      `<div class="tt">${p.c}</div>
       <div class="tr"><span>GDP per capita</span><span>$${fmt(p.gdp)}</span></div>
       <div class="tr"><span>MH workers /100k</span><span>${p.tot}</span></div>`));
    g.addEventListener('mouseleave',hideTip);
    s.appendChild(g);
  });
  const n=el('text',{x:PL,y:PT-14,class:'tick','font-size':11.5});
  n.textContent='MH workers per 100,000  ·  dashed line: log-log trend, Argentina & Brazil excluded (r = 0.90)';
  s.appendChild(n);
  $('#c-gdp').appendChild(s);
})();

/* ---- 3. scenario lines ---- */
(function(){
  const W=760,H=390,PL=58,PR=132,PT=18,PB=40;
  const s=svg(W,H);
  const yrs=D.years, maxV=235000;
  const x=i=>PL+i/(yrs.length-1)*(W-PL-PR);
  const y=v=>H-PB-(v/maxV)*(H-PT-PB);
  [0,50000,100000,150000,200000].forEach(t=>{
    s.appendChild(el('line',{x1:PL,x2:W-PR,y1:y(t),y2:y(t),stroke:t?'var(--grid)':'var(--axis)','stroke-width':1}));
    const g=el('text',{x:PL-8,y:y(t)+4,'text-anchor':'end',class:'tick'});
    g.textContent=t?(t/1000)+'k':'0'; s.appendChild(g);
  });
  yrs.forEach((yr,i)=>{ if(i%2) return;
    const g=el('text',{x:x(i),y:H-PB+18,'text-anchor':'middle',class:'tick'});
    g.textContent=yr; s.appendChild(g); });
  SC.forEach(k=>{
    const rows=D.scenarios[k].rows;
    const d=rows.map((r,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(r.counsellors).toFixed(1)}`).join(' ');
    s.appendChild(el('path',{d,fill:'none',stroke:SCOL[k],'stroke-width':2.5,
      'stroke-linecap':'round','stroke-linejoin':'round'}));
    const last=rows[rows.length-1];
    s.appendChild(el('circle',{cx:x(yrs.length-1),cy:y(last.counsellors),r:4.5,
      fill:SCOL[k],stroke:'var(--surface)','stroke-width':2}));
    const t=el('text',{x:x(yrs.length-1)+11,y:y(last.counsellors)+4,class:'dlabel',fill:SCOL[k],'font-size':12.5});
    t.textContent=fmt(Math.round(last.counsellors/1000))+'k'; s.appendChild(t);
    const n=el('text',{x:x(yrs.length-1)+11,y:y(last.counsellors)+19,class:'tick','font-size':11});
    n.textContent=SNAME[k]; s.appendChild(n);
  });
  // hover crosshair
  const cross=el('line',{y1:PT,y2:H-PB,stroke:'var(--axis)','stroke-width':1,opacity:0}); s.appendChild(cross);
  const hit=el('rect',{x:PL,y:PT,width:W-PL-PR,height:H-PT-PB,fill:'transparent'});
  hit.addEventListener('mousemove',e=>{
    const r=s.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width*W;
    let i=Math.round((px-PL)/((W-PL-PR)/(yrs.length-1)));
    i=Math.max(0,Math.min(yrs.length-1,i));
    cross.setAttribute('x1',x(i)); cross.setAttribute('x2',x(i)); cross.setAttribute('opacity',1);
    let h=`<div class="tt">${yrs[i]}</div>`;
    SC.forEach(k=>{ h+=`<div class="tr"><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${SCOL[k]};margin-right:5px"></i>${SNAME[k]}</span><span>${fmt(D.scenarios[k].rows[i].counsellors)}</span></div>`; });
    showTip(e,h);
  });
  hit.addEventListener('mouseleave',()=>{hideTip();cross.setAttribute('opacity',0)});
  s.appendChild(hit);
  $('#c-scen').appendChild(s);
})();

/* ---- 4. composition stacked area ---- */
const TIERS=[['psychiatrists','Psychiatrists','var(--o4)'],
             ['clinical_psychologists','RCI clinical psychologists','var(--o3)'],
             ['counsellors','Counsellors (primary occupation)','var(--o2)'],
             ['wider','Wider counselling-adjacent','var(--o1)']];
function drawComp(k, hostSel, interactive){
  hostSel = hostSel || '#c-comp';
  if (interactive === undefined) interactive = true;
  const host=$(hostSel); host.innerHTML='';
  const W=760,H=360,PL=52,PR=138,PT=20,PB=40;
  const s=svg(W,H);
  const rows=D.scenarios[k].rows, yrs=D.years;
  const lo=4000, hi=800000;
  const x=i=>PL+i/(yrs.length-1)*(W-PL-PR);
  const y=v=>H-PB-(Math.log10(v)-Math.log10(lo))/(Math.log10(hi)-Math.log10(lo))*(H-PT-PB);
  [10000,100000,1000000].forEach(t=>{ if(t>hi) return;
    s.appendChild(el('line',{x1:PL,x2:W-PR,y1:y(t),y2:y(t),stroke:'var(--grid)','stroke-width':1}));
    const g=el('text',{x:PL-8,y:y(t)+4,'text-anchor':'end',class:'tick'});
    g.textContent=(t/1000)+'k'; s.appendChild(g);
  });
  s.appendChild(el('line',{x1:PL,x2:W-PR,y1:H-PB,y2:H-PB,stroke:'var(--axis)','stroke-width':1}));
  yrs.forEach((yr,i)=>{ if(i%2) return;
    const g=el('text',{x:x(i),y:H-PB+18,'text-anchor':'middle',class:'tick'});
    g.textContent=yr; s.appendChild(g); });
  const LAB={wider:'Wider adjacent', counsellors:'Counsellors',
             clinical_psychologists:'Clinical psych.', psychiatrists:'Psychiatrists'};
  [['wider','var(--o1)'],['counsellors','var(--o2)'],
   ['clinical_psychologists','var(--o3)'],['psychiatrists','var(--o4)']].forEach(([kk,col])=>{
    const d=rows.map((r,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(r[kk]).toFixed(1)}`).join(' ');
    s.appendChild(el('path',{d,fill:'none',stroke:col,'stroke-width':2.5,
      'stroke-linecap':'round','stroke-linejoin':'round'}));
    const last=rows[rows.length-1];
    s.appendChild(el('circle',{cx:x(yrs.length-1),cy:y(last[kk]),r:4,
      fill:col,stroke:'var(--surface)','stroke-width':2}));
    const t=el('text',{x:x(yrs.length-1)+10,y:y(last[kk])+1,class:'dlabel','font-size':12,fill:'var(--ink)'});
    t.textContent=fmt(Math.round(last[kk]/1000))+'k'; s.appendChild(t);
    const n=el('text',{x:x(yrs.length-1)+10,y:y(last[kk])+15,class:'tick','font-size':10.5});
    n.textContent=LAB[kk]; s.appendChild(n);
  });
  const ls=el('text',{x:PL,y:PT-6,class:'tick','font-size':11});
  ls.textContent='logarithmic scale'; s.appendChild(ls);
  if(!interactive){ host.appendChild(s); return; }
  const cross=el('line',{y1:PT,y2:H-PB,stroke:'var(--ink)','stroke-width':1,opacity:0}); s.appendChild(cross);
  const hit=el('rect',{x:PL,y:PT,width:W-PL-PR,height:H-PT-PB,fill:'transparent'});
  hit.addEventListener('mousemove',e=>{
    const r0=s.getBoundingClientRect();
    let i=Math.round(((e.clientX-r0.left)/r0.width*W-PL)/((W-PL-PR)/(yrs.length-1)));
    i=Math.max(0,Math.min(yrs.length-1,i));
    cross.setAttribute('x1',x(i)); cross.setAttribute('x2',x(i)); cross.setAttribute('opacity',.35);
    const r=rows[i];
    let h=`<div class="tt">${yrs[i]} &middot; ${SNAME[k]}</div>`;
    TIERS.forEach(([kk,nm,c])=>{ h+=`<div class="tr"><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${c};margin-right:5px"></i>${nm}</span><span>${fmt(r[kk])}</span></div>`; });
    h+=`<div class="tr" style="margin-top:5px;padding-top:5px;border-top:1px solid var(--border)"><span>All per 100k</span><span>${r.total_per_lakh}</span></div>`;
    showTip(e,h);
  });
  hit.addEventListener('mouseleave',()=>{hideTip();cross.setAttribute('opacity',0)});
  s.appendChild(hit);
  host.appendChild(s);
}

/* ---- 5. SAM grouped bars ---- */
(function(){
  const W=760,H=300,PL=58,PR=20,PT=22,PB=52;
  const s=svg(W,H);
  const yrs=[2026,2031,2036], maxV=150;
  const gw=(W-PL-PR)/yrs.length;
  const y=v=>H-PB-(v/maxV)*(H-PT-PB);
  [0,50,100].forEach(t=>{
    s.appendChild(el('line',{x1:PL,x2:W-PR,y1:y(t),y2:y(t),stroke:t?'var(--grid)':'var(--axis)','stroke-width':1}));
    const g=el('text',{x:PL-8,y:y(t)+4,'text-anchor':'end',class:'tick'});
    g.textContent='₹'+t+'cr'; s.appendChild(g);
  });
  yrs.forEach((yr,gi)=>{
    const gx0=PL+gi*gw;
    const g0=el('text',{x:gx0+gw/2,y:H-PB+20,'text-anchor':'middle',class:'tick','font-size':12.5,fill:'var(--ink2)'});
    g0.textContent=yr; s.appendChild(g0);
    SC.forEach((k,bi)=>{
      const rec=D.tam[k].find(r=>r.year===yr);
      const bw=gw/4.4, bx=gx0+gw*0.14+bi*(bw+5);
      const g=el('g',{});
      g.appendChild(el('rect',{x:bx,y:y(rec.sam_inr_cr),width:bw,
        height:Math.max(2,H-PB-y(rec.sam_inr_cr)),rx:4,fill:SCOL[k]}));
      const t=el('text',{x:bx+bw/2,y:y(rec.sam_inr_cr)-7,'text-anchor':'middle',
        class:'dlabel',fill:'var(--ink2)','font-size':11.5});
      t.textContent=Math.round(rec.sam_inr_cr); g.appendChild(t);
      g.addEventListener('mousemove',e=>showTip(e,
        `<div class="tt">${SNAME[k]} &middot; ${yr}</div>
         <div class="tr"><span>Solo private practice</span><span>${fmt(rec.solo)}</span></div>
         <div class="tr"><span>Digitally reachable</span><span>${fmt(rec.reachable)}</span></div>
         <div class="tr"><span>Able to pay Pro</span><span>${fmt(rec.pro_able)}</span></div>
         <div class="tr" style="margin-top:5px;padding-top:5px;border-top:1px solid var(--border)"><span>Ceiling revenue</span><span>₹${rec.sam_inr_cr} cr</span></div>`));
      g.addEventListener('mouseleave',hideTip);
      s.appendChild(g);
    });
  });
  let lx=PL;
  SC.forEach(k=>{
    s.appendChild(el('rect',{x:lx,y:PT-14,width:10,height:10,rx:2,fill:SCOL[k]}));
    const t=el('text',{x:lx+15,y:PT-5,class:'tick','font-size':11.5,fill:'var(--ink2)'});
    t.textContent=SNAME[k]; s.appendChild(t); lx+=SNAME[k].length*6.6+34;
  });
  $('#c-sam').appendChild(s);
})();

/* ---- table ---- */
function drawTable(k, tb){
  tb = tb || $('#tbl tbody'); tb.innerHTML='';
  D.scenarios[k].rows.forEach(r=>{
    const hi=(r.year===2026||r.year===2036)?' class="hi"':'';
    tb.insertAdjacentHTML('beforeend',
      `<tr><td${hi}>${r.year}</td><td${hi}>${fmt(r.psychiatrists)}</td>
       <td${hi}>${fmt(r.clinical_psychologists)}</td><td${hi}>${fmt(r.counsellors)}</td>
       <td${hi}>${fmt(r.wider)}</td><td${hi}>${r.psychiatrists_per_lakh.toFixed(2)}</td>
       <td${hi}>${r.total_per_lakh.toFixed(2)}</td>
       <td${hi}>${r.counsellor_psychiatrist_ratio.toFixed(1)}&times;</td></tr>`);
  });
}
function wireSeg(sel, fn){
  const g=$(sel);
  g.addEventListener('click', e=>{
    const b=e.target.closest('button'); if(!b) return;
    g.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed', x===b));
    fn(b.dataset.s);
  });
}
wireSeg('#seg-comp', k => drawComp(k));
wireSeg('#seg-tab', k => drawTable(k));
drawComp('base'); drawTable('base');

/* ---- print-only: all three scenarios ---- */
(function(){
  const ch=$('#p-comp'), tb=$('#p-tables');
  SC.forEach(k=>{
    const d=document.createElement('div'); d.className='pblock';
    d.innerHTML=`<h5>${SNAME[k]}</h5><div id="pc-${k}"></div>`;
    ch.appendChild(d);
    drawComp(k, '#pc-'+k, false);

    const t=document.createElement('div'); t.className='pblock';
    t.innerHTML=`<h5>${SNAME[k]}</h5><table><thead><tr>
      <th>Year</th><th>Psychiatrists</th><th>Clinical psych.</th><th>Counsellors</th>
      <th>Wider layer</th><th>Psych./lakh</th><th>All/lakh</th><th>C : P ratio</th>
      </tr></thead><tbody></tbody></table>`;
    tb.appendChild(t);
    drawTable(k, t.querySelector('tbody'));
  });
})();

/* ---- theme ---- */
$('#tbtn').addEventListener('click',()=>{
  const cur=document.documentElement.getAttribute('data-theme');
  const sysDark=matchMedia('(prefers-color-scheme:dark)').matches;
  const next = cur ? (cur==='dark'?'light':'dark') : (sysDark?'light':'dark');
  document.documentElement.setAttribute('data-theme',next);
});
</script>
</body></html>
"""

out = HTML.replace("__DATA__", json.dumps(DATA, separators=(",", ":")))
open("india-counselling-workforce-2036.html", "w").write(out)
print("bytes:", len(out))
