# India's counselling workforce, 2026–2036

*Research memo · 12 August 2026 · base year 2026, horizon 2036*

Companion files in this folder:

- `india-counselling-workforce-2036.html` — the readable report, with charts and a scenario toggle
- `india-counselling-workforce-2036.pdf` — printable A4, 14 pages, vector charts
- `india-workforce-model.py` — the projection model; every parameter documented inline
- `india-workforce-projections.json` — model output, all three scenarios, all years
- `india-workforce-report-build.py` — builds the HTML from the JSON

Rerun with `python3 india-workforce-model.py && python3 india-workforce-report-build.py`.
The HTML carries its own print stylesheet — printing it from any browser gives the same
A4 layout as the PDF, with all three scenario charts and tables expanded (the on-screen
scenario toggles collapse to full sets in print).

---

## 1. Why this exists

Aman's addressable market is solo counsellors in India. Nobody knows how many there are.
There is no register, no census, no reliable estimate, and the figures in public circulation
are worse than they look. This memo reconstructs the number from the supply pipeline,
benchmarks it against countries that count properly, and projects it forward.

**The one-line answer: roughly 54,000 people in India do talk therapy as their primary paid
occupation in 2026. By 2036 that is 66,000 / 122,000 / 226,000 depending on whether a payer
appears.**

---

## 2. The counting problem

### 2.1 "0.75 psychiatrists per 100,000" is not a government statistic

It comes from a single one-page letter — Garg, Kumar & Chandra, *Indian Journal of
Psychiatry* 2019 ([PMC6341936](https://pmc.ncbi.nlm.nih.gov/articles/PMC6341936/)) — whose
authors triangulated "about 9,000 and counting" psychiatrists from the Indian Psychiatric
Society directory, an NHRC report, and a pharmaceutical company's CME attendance data, then
divided by population.

MoHFW's own PIB release of 7 Feb 2025 attributes the figure to "the Indian Journal of
Psychiatry" rather than to any government count. The 2023 Parliamentary Standing Committee
(148th Report) picked up the same number.

India's last official submission to WHO — Mental Health Atlas 2017, using 2016 data — said
**0.29**, less than half. Both numbers get quoted as current.

### 2.2 India has no WHO Atlas country profile after 2016

Confirmed by direct URL testing against WHO's standard profile pattern for both the 2020 and
2024 rounds; dozens of other countries have profiles at the same paths, India does not. India
*did* respond to the 2024 questionnaire (it is listed as a contributing country, with named
DGHS/NIMHANS officials), but no India-specific profile was published.

**Consequence:** any current-sounding Indian workforce figure claiming a WHO source is either
repeating 2016 data or repeating the 2019 letter under a WHO label it does not carry.

### 2.3 The psychiatrist count is now materially stale

Psychiatry PG seats grew roughly fivefold since 2010 — 266 seats across 112 institutions
(2010) → 868 MD+DNB+DPM across 221 institutes (Dec 2019) → ~1,450 (2024–25, of which 1,292
MD and 31 DPM per the NMC seat matrix).

Rolling the 2019 anchor of 9,000 forward through actual seat growth, a three-year training
lag, 90% completion and 3% annual attrition (retirement ~2%, documented emigration ~1%) gives
**~12,900 psychiatrists in 2026**. Band 11,000–15,000.

### 2.4 An unexplained inconsistency in the RCI register

| Date | RCI-registered clinical psychologists | Source |
|---|---|---|
| Aug 2023 | 2,840 | 148th Parliamentary Standing Committee |
| Jul 2025 | 4,309 | Parliament reply |

That is **~765 additions a year** against M.Phil Clinical Psychology programmes widely
reported to offer only **~290 seats**. The register is growing at 2.6× its stated intake.

Either the published seat count (which comes only from commercial aggregators, never from RCI
itself) is a serious undercount, or a large registration backlog is clearing. RCI publishes no
aggregate register statistics by category. Both possibilities matter and neither is in any
published source.

### 2.5 What cannot be counted at all

- **Psychiatric social workers** have no registration body. Recognised as "mental health
  professionals" under the Mental Healthcare Act 2017 but registrable under neither RCI nor
  NCAHP. Only figure available: ~1,500 cumulatively trained (M.Phil PSW, all-time, as of 2022).
- **Counsellors** — "counsellor", "therapist" and "psychotherapist" are not protected titles.
  RCI Act 1992 §19 names 17 registrable categories; *counselling psychologist* is not among
  them. Anyone may use the title.
- **Tele-MANAS counsellor headcount** — never disclosed, despite 53 cells and 34.34 lakh
  cumulative calls (Mar 2026).
- **DMHP vacancy rates** — no national figure published. Best proxy: <38% of allocated DMHP
  funds utilised, with ~50% of that budget earmarked for salaries.
- **Attrition and emigration** — no India-specific study exists. The phenomenon is documented
  qualitatively (Pai et al., *ANZJP* 2022, on Indian psychiatrists in Australia) but never
  quantified.

---

## 3. The AISHE anchor

The All India Survey on Higher Education is the only source in the sector that publishes a
hard, government-collected flow number for psychology.

**AISHE 2023–24 (14th edition, released 8 July 2026):**

| Metric | Value | Table |
|---|---|---|
| PG Psychology out-turn | **14,759** (M 3,557 / F 11,202) | Table 37 |
| PG Psychology enrolment | 54,484 (M 14,984 / F 39,500) | Table 13 |
| M.Phil Psychology out-turn | 172 | Table 37 |
| Ph.D. Psychology out-turn | 285 | Table 37 |
| MSW out-turn | 24,645 | Table 37 |

Three-year series for PG Psychology out-turn: **14,657** (2021–22) → **12,420** (2022–23) →
**14,759** (2023–24). The dip reflects response-rate variance ("Based on Actual Response"),
not a real contraction. Defensible range: 12,400–14,800/yr.

Verified twice against the primary PDF:
`https://cdnbbsr.s3waas.gov.in/s392049debbe566ca5782a3045cf300a3c/uploads/2026/07/202607131602421770.pdf`

**Known limit:** AISHE does not disaggregate psychology at UG level — "Social Science" appears
as one lumped row (UG Social Science out-turn 2023–24: 268,732, covering psychology, sociology,
economics, history, political science, philosophy and geography combined). The UG feeder is
unquantifiable from official data. This is a structural gap in AISHE's methodology, not a
search failure.

### 3.1 The 2% bottleneck — the structural fact that matters most

~290 M.Phil Clinical Psychology seats a year against 14,759 psychology postgraduates means
**about 2% of psychology PGs can ever become licensed clinicians**. The other 98% who want
clinical work have nowhere to go but unregulated counselling.

India's informal layer is not a regulatory failure at the edges. It is the main channel.

---

## 4. Base-year derivation, 2026

```
Living PG psychology graduates (~25 cohorts, AISHE flow walked
  back at 7%/yr, 5% survival haircut)                          174,833
  × gender-weighted LFPR 0.558                                  97,557
      (cohort is 75.9% female; PLFS 2023–24 female LFPR 41.7%,
       set to 0.45 here as this cohort self-selects for intent
       to practise and counselling suits part-time/re-entry)
  × 30% counselling as primary occupation                       29,267
      (no India datum; anchored on China's documented 30–40%
       practice rate among certified counsellors)
+ MSW route (~370k living MSW graduates × 55% in work × 6%)     11,972
+ diploma / psychiatric social work / crossovers                 8,000
+ full-time school counsellors (pre-mandate base)                5,000
────────────────────────────────────────────────────────────────────────
= PRACTISING COUNSELLORS, 2026                                  54,263
= WIDER COUNSELLING-ADJACENT LAYER (×3.15)                     170,928
```

| Tier | 2026 | Definition |
|---|---|---|
| Psychiatrists | ~12,900 | Reconstructed from seat data |
| RCI clinical psychologists | ~5,100 | Register, extrapolated one year from Jul 2025 |
| **Licensed specialists** | **~18,000** | The only tier with a statutory register |
| **Practising counsellors** | **~54,300** | Talk therapy as primary paid occupation |
| Wider adjacent layer | ~171,000 | Upper bound on "anyone doing paid talk-based helping work" |

Total practitioners per 100,000 population: **4.94** (vs WHO's official 1.93 for India, which
counts only government-reported specialists).

### 4.1 Why not just use the international ratio

In countries that count both, counsellors outnumber psychiatrists by **6×–20×**. Applied to
India's ~12,900 psychiatrists that gives 78,000–258,000 — well above this model's 54,263
(**4.2×**).

The gap is deliberate. Ratio transfer assumes India's counselling layer is as economically
viable as the counted countries'. The [Zensible 2026 practitioner
survey](https://www.zensible.in/whitepapers/financial-status-of-indian-therapists) (n=285,
83.5% metro) finds a **majority earning ≤₹3 lakh/year while carrying 10–15 clients a week**.
A market that cannot pay its practitioners a living wage does not sustain a US-sized
counsellor-to-psychiatrist ratio.

India sitting below the band is the finding, not a modelling error.

---

## 5. International benchmark

Mental health workers per 100,000, WHO Mental Health Atlas 2020 country profiles:

| Country | All MH workers /100k | Psychiatrists /100k | Year |
|---|---|---|---|
| Argentina | 322.46 | 14.52 | 2020 |
| Norway | 247.19 | 22.77 | 2020 |
| Germany | 223.76 | 14.22 | 2020 |
| Finland | 222.17 | 20.19 | 2020 |
| Australia | 205.68 | 13.37 | 2020 |
| United Kingdom | 201.14 | 13.76 | 2020 |
| Brazil | 164.29 | 3.69 | 2020 |
| Japan | 111.92 | 12.55 | 2020 |
| South Korea | 45.00 | 7.91 | 2020 |
| Iran | 22.97 | 2.48 | 2020 |
| Kenya | 15.32 | 0.22 | 2020 |
| China | 8.60 | 2.55 | 2020 |
| **India — this model** | **4.94** | **0.89** | **2026** |
| Vietnam | 4.16 | 0.99 | 2020 |
| Indonesia | 3.01 | 0.41 | 2020 |
| **India — as WHO counts it** | **1.93** | **0.29** | **2017** |
| Philippines | 1.68 | 0.22 | 2020 |
| Bangladesh | 1.10 | 0.17 | 2020 |
| Pakistan | 0.55 | 0.14 | 2020 |

**USA and Nigeria reported no workforce data to WHO in 2020** — every field blank. Netherlands
and Israel have no 2020 profile either. WHO's own round-to-round consistency is poor: Norway's
reported psychiatrist density more than halved between rounds (48.04 → 22.77/100k), almost
certainly a reporting artefact. China's self-report (36,610 psychiatrists) is 23% below an
academic reconstruction from China's own Health Yearbooks (44,943).

**Income relationship:** log GDP per capita vs workforce density gives r = 0.72 across all 20
data points, r = 0.90 excluding Argentina, Brazil and Israel. Argentina at ~$14k GDP/capita
has the world's highest psychologist density (286/100k) on psychoanalytic culture alone.
Policy and culture can override income — which is the entire case for the optimistic scenario.

### 5.1 Counsellor-to-psychiatrist ratios where both are counted

| Country | Psychiatrists | Counsellor layer | Ratio | Basis |
|---|---|---|---|---|
| USA | 28,600 (2022) | 459,400 | **16.1×** | BLS: 388,200 MH/substance counselors + 71,200 MFTs |
| USA incl. psychologists | 28,600 | 526,900 | 18.4× | adds 67,500 clinical/counseling psychologists |
| UK | 9,295 (2020) | 86,000 | **9.3×** | 75,000 BACP + 11,000 UKCP (voluntary registers) |
| Australia | 3,369 (2020) | ~21,000 | **6.2×** | 18,000 ACA + 3,000 PACFA (not AHPRA-registered) |
| Australia incl. psychologists | 3,369 | ~69,000 | 20.5× | adds 48,370 AHPRA psychologists (Sep 2024) |
| China — certified | ~40,800 | 897,000 | ~22× | people who passed the abolished national exam |
| China — actually practising | ~40,800 | ~35,000 | **~0.9×** | same pool, filtered to real practitioners |
| **India — this model** | **12,942** | **54,263** | **4.2×** | 2026 |

US absolute counts, latest (BLS Occupational Outlook Handbook, 2024 base):

- Substance Abuse, Behavioral Disorder & Mental Health Counselors: **483,500**, projected
  **+17%** 2024–34, ~48,300 openings/yr
- Marriage and Family Therapists: **77,800**, projected **+13%**
- Psychologists (all): **204,300**, projected **+6%**

### 5.2 The China cautionary tale

The single most relevant precedent, and absent from Indian policy discussion.

- 2001–02: China's labour ministry launched a national psychological counsellor certification
- By 2016: **~897,000 certified** — roughly 180× the ~5,000 accredited clinical psychologists
- **Only 30–40% ever did counselling work**, most part-time or as a hobby
- 2017: the exam was **abolished outright, without replacement** — the government concluded the
  credential had become "window dressing", a "speedy assembly line" producing unqualified
  practitioners
- Meanwhile the formal workforce grew steadily and separately: psychiatrists 18,846 (2002) →
  44,943 (2020), +139%, 7.3%/yr average

**On paper China had a 20× counsellor-to-psychiatrist ratio. In practice roughly 1×.**

Source: [Yin et al., scoping review, PMC11064725](https://pmc.ncbi.nlm.nih.gov/articles/PMC11064725/),
built from China Health Yearbooks 2000–2021.

**Read across to India:** the Budget pledge to train 100,000 allied health professionals
including mental health counsellors, and NIMHANS Digital Academy's cumulative trainee figures
(reported as both **42,000** and **176,454** by two credible government-adjacent sources — an
unreconciled discrepancy), are measuring exactly what China was measuring. Credential counts
are not capacity. A projection that treats them as practitioners would be wrong by an order
of magnitude.

---

## 6. Regulation and pipeline

### 6.1 Training throughput

| Qualification | Seats/graduates per year | Year | Confidence |
|---|---|---|---|
| MD Psychiatry | 1,292 | 2024–25 | Fair — NMC seat matrix via secondary report |
| DPM | 31 | 2024–25 | Fair |
| DNB Psychiatry | ~34 (likely undercounted) | 2023–25 | Weak |
| M.Phil Clinical Psychology | ~274 across 29 institutions, +22 from 3 newly recognised (2025) ≈ **296** | 2024–25 | Weak — commercial aggregators only |
| M.Phil Psychiatric Social Work | not published | — | — |
| MSc/Diploma Psychiatric Nursing | not broken out (13,971 MSc Nursing total, all specialisations, 2021) | — | — |
| MA/MSc Psychology | **14,759** | 2023–24 | **Hard — AISHE** |
| MSW | **24,645** | 2023–24 | **Hard — AISHE** |

**The arithmetic that caps everything:** India's statutorily credentialed specialist pipeline
runs at roughly **1,600–1,700 new licensed practitioners a year nationally** (~1,350–1,400
psychiatrists + ~290 clinical psychologists). That is one newly licensed clinical psychologist
per ~4.9 million Indians per year. Meanwhile the unregulated counselling tier has no seat cap,
no faculty constraint and no licence requirement at all.

### 6.2 Regulatory state, August 2026

- **RCI Act 1992** — 17 registrable categories under §19. *Clinical Psychologist* and
  *Rehabilitation Psychologist* are covered; *counselling psychologist* is not. Unregistered
  practice under a covered title carries up to 1 year imprisonment (§13(3)).
- **Mental Healthcare Act 2017** — §2(r) defines "mental health professional"; §55(1)(d)
  obliges State Mental Health Authorities to register clinical psychologists, mental health
  nurses and psychiatric social workers. Counsellors are not an eligible category.
- **NCAHP Act 2021** — in force 25 May 2021. All **10 professional councils notified 26 March
  2025**, including a *Community Care, Behavioural Health & Other Professionals* council. This
  is where psychology-adjacent titles sit — but as behaviour analyst, disease counsellor,
  integrated behaviour health counsellor, not as "psychologist" or "counselling psychologist".
  A March 2026 report still flags "implementation challenges in registration pathways,
  university alignment, and clinical training infrastructure". **Not yet a functioning
  licensing regime for counsellors.**
- **M.Phil → M.Clin.Psy transition** — UGC discontinued M.Phil nationally (Nov 2022);
  admissions to M.Phil Clinical Psychology and M.Phil PSW permitted only through 2025–26; RCI
  General Council resolved **13 April 2026** to replace the nomenclature with **M.Clin.Psy**,
  detailed regulations still pending as of August 2026. Capacity has been **frozen at ~290
  seats throughout the three-year transition** with no evidence of expansion.
- **Telemedicine Practice Guidelines 2020** — apply only to NMC-registered medical
  practitioners. Non-medical mental health professionals doing online counselling fall outside
  their scope entirely. A regulatory vacuum over the fastest-growing delivery channel.
- No standalone Psychology/Counselling Practice Bill was found pending before Parliament.

### 6.3 Government programmes

- **Tele-MANAS** (launched 10 Oct 2022): 53 cells, 30+ states/UTs, 20 languages. Cumulative
  calls 34.34 lakh (Mar 2026), up from ~10 lakh (May 2024). Only 2,065 video consultations as
  of Feb 2026 — voice triage, not delivery. Referrals: 47,487 non-emergency in-person, 19,135
  connected to a professional, 5,083 urgent psychiatric. **Counsellor headcount never
  disclosed.** Budget falling: FY25–26 BE ₹80 cr → RE ₹45 cr; FY26–27 BE ₹51 cr.
- **DMHP**: 767 districts approved. Staffing norm 1 psychiatrist + 1 clinical psychologist +
  1 PSW + 1 nurse + support per district. <38% of allocated funds utilised (Andhra Pradesh 78%
  vs Telangana 5%). Moved from Central Sector to Centrally Sponsored Scheme, Aug 2025.
- **Ayushman Arogya Mandirs**: 1.75 lakh+ SHCs/PHCs upgraded with mental health services; 22
  mental health procedures cashless under PM-JAY.
- Overall MoHFW mental health budget: **₹1,004 crore FY2024–25, ~1% of the health ministry's
  total.**

---

## 7. Demand side

### 7.1 Prevalence — all of it a decade old

NMHS 2015–16 (12 states, ~34,802 households) remains the only completed national survey:

- Lifetime mental morbidity 13.7%; current 10.6%
- Severe mental disorders 1.9% lifetime / 0.8% current
- Urban 13.5% vs rural 6.9%
- Adolescents 13–17: 7.3%
- ~150 million in current need of active intervention
- **Treatment gap 70–92%** overall (84.5% aggregate; >85% for common mental disorders; 86% for
  alcohol use disorders, the highest)

GBD 2017 (India-specific, *Lancet Psychiatry* 2019): 45.7M with depressive disorders, 44.9M
with anxiety disorders. Mental disorders' share of total DALYs rose 2.5% (1990) → 4.7% (2017).

NCRB suicide data: 1,70,924 (2022, rate 12.4) → 1,71,418 (2023, 12.3) → **1,70,746 (2024,
12.2)** — flat to marginally declining, not the rising-crisis narrative. Ages 18–45 are 65.6%
of 2024 suicides. **66% of 2023 suicides were in the ≤₹1 lakh/yr income bracket** — a
population priced entirely out of the private counselling market.

> **NMHS-2 reports 10 October 2026.** Fieldwork complete in 24 states, >250,000 interviews as
> of March 2026, now covering all 28 states + 8 UTs plus adolescents. Nothing published yet.
> Any claim citing "the new National Mental Health Survey" today is premature.

### 7.2 Demand friction is the binding constraint, not therapist scarcity

- **Insurance is non-functional for outpatient therapy.** MHCA 2017 requires parity; IRDAI set
  a final compliance deadline of 31 Oct 2022. A 2024 study found only **37.5% of policies
  actually cover mental illness**, 51% none at all. Only **~17% of insured individuals have
  access to outpatient therapy** through their policy; ~36.6% of insurers offer any OPD mental
  health rider. Where riders exist, caps run ₹5,000/yr or 10 sessions — two sessions at metro
  rates. Out-of-pocket annual spend on regular therapy: ₹72,000–₹2,40,000.
- **Employer benefits outrun usage.** 83% of Indian companies now offer mental health support
  (Corporate Health Study 2026, n>300). But utilisation "rarely crosses 10%"; ekincare's
  analysis of 6,000+ sessions shows **26.6% no-show** and **58% attending only one session**.
  Counselling utilisation is up 44% since 2023 — and +203% among 20–25s — but engagement is
  shallow.
- **Practitioner economics are broken even at full caseload.** Zensible 2026: early-career
  ₹1L–3.5L, mid-level ₹3.5L–7L, senior ₹4.2L–17L; a majority ≤₹3L despite 10–15 clients/week.
  Modal session price ₹1,000–1,500 (range ₹500–3,000+). The problem is retention and pricing
  power, not client scarcity.

### 7.3 Market size — treat consultancy figures as unusable

| Source | 2025 base | Forecast | What it actually measures |
|---|---|---|---|
| IMARC | $20.82B | $27.36B (2034) | Named players are Sun Pharma, Dr. Reddy's, Lupin, Torrent — this is **psychiatric pharmaceuticals**, not therapy |
| DataM | $2.81B | $6.59B (2033) | Closer conceptually (psychotherapy 42.4%) but no disclosed methodology |

**The bottom-up check is far more useful.** Disclosed FY24 revenue of India's ten best-known
digital mental health platforms, from ROC filings via PrivateCircle:

| Company | FY24 revenue |
|---|---|
| Wysa | ₹40.12 cr |
| Amaha | ₹22.76 cr |
| YourDOST | ₹19.46 cr |
| United We Care | ₹6.62 cr |
| KahaMind | ₹4.94 cr |
| Manah Wellness | ₹3.20 cr |
| Lissun | ₹2.84 cr |
| Heart It Out | ₹2.01 cr |
| Now&Me | ₹0.43 cr |
| No Worry No Tension | ₹0.28 cr |
| **Total** | **~₹102.7 cr (~$12–13M)** |

The entire disclosed revenue base of the sector is three orders of magnitude below the
headline "market". Amaha raised ₹50 cr at ~₹300 cr valuation in March 2026 (2× prior) on FY25
revenue of ₹27.57 cr and losses of ₹29.80 cr. Rocket Health is bootstrapped and profitable.
YourDOST and Mindpeers have raised nothing since 2021–22.

### 7.4 Practice-management software for Indian therapists

Indian therapy practices "presently rely on Excel, Google Sheets & WhatsApp groups" for
scheduling, Excel for billing, paper registers for attendance (TheraFlow's own competitive
copy — self-interested but specific, and consistent with Zensible finding integrated systems
essentially absent).

| Tool | Target | Pricing |
|---|---|---|
| PractiPal | Solo Indian therapists | Free ≤5 clients; **₹1,499/mo** unlimited; ₹1,899 multi-therapist |
| TheraFlow | Therapy *centres* | from ₹7,999/mo |
| Therasoft India | Therapists, general | contact for quote |
| Zoho One | Horizontal SMB suite marketed at therapists | — |

**No evidence of meaningful Indian user bases for SimplePractice, TherapyNotes, Jane, Zanda,
Halaxy or Carepatron.** All are priced in USD/AUD/GBP and built around CPT codes, Medicare/NDIS
and insurance claims, which do not map onto India's cash-pay market. The gap is being filled
by small India-native tools, not by localisation of Western incumbents.

---

## 8. Scenarios

The scenarios do not differ mainly on training capacity. **They differ on whether a payer
appears.** India already produces far more psychology postgraduates than the market absorbs
into practice; the binding constraint is that a counsellor cannot reliably earn a living, so
entrants churn out. Every historical episode of fast workforce growth was triggered by a payer:

- **UK, NHS Talking Therapies (IAPT), from 2008** — 10,325 → 14,299 WTE staff, Jun 2019 → Mar
  2022, **+38% in under 3 years** (+13%, +18%, +4% year on year)
- **Australia, Medicare Better Access, from 2006** — population accessing subsidised MH
  services 5.7% → 10.7% over 2006–07 to 2019–20. AHPRA psychologist density 104.4 → 172/100k,
  2020 → 2024 (**+65% in under 4 years**). Note counsellors are *excluded* from Better Access
  rebates, and the unregulated ACA counsellor body still grew 26% in 2024 alone
- **USA, post-parity/ACA** — MH counsellors 120,010 (2013) → 388,200 (2022) → 483,500 (2024)

### 8.1 Parameters

| Parameter | A · Credential Drift | B · Steady Formalisation | C · Demand Unlock |
|---|---|---|---|
| Psychiatry seat CAGR | 5% | 8% | 11% |
| Psychiatrist attrition | 3.0% | 3.0% | 2.8% |
| Clinical psych. additions (2027, CAGR) | 700, 0% | 850, 5% | 1,100, 10% |
| Graduate flow CAGR | 3% | 5% | 7% |
| Practice conversion (2026 → 2036) | 30% → 26% | 30% → 34% | 30% → 46% |
| Annual exit from practice | 9% | 7% | 5% |
| Non-psychology intake (2027, CAGR) | 3,200, 2% | 5,000, 6% | 7,500, 10% |
| CBSE school posts absorbed by 2036 | 0 | 22,000 | 62,000 |

**A · Credential Drift** — NCAHP's behavioural-health council never builds a working counsellor
pathway. Insurance parity stays unenforced. Practice economics stay poor, churn stays high, the
credentialed pool grows faster than practice does. This is the China-post-2017 outcome.

**B · Steady Formalisation** — NCAHP registers counsellors over three to five years. Corporate
EAP demand keeps compounding from a real base. The platform sector consolidates and grows. The
CBSE counsellor mandate is partially enforced.

**C · Demand Unlock** — a payer event fires: IRDAI outpatient parity actually enforced, or a
Better Access–style subsidised session scheme, or Tele-MANAS converted from triage into a
delivery channel that pays panel counsellors.

### 8.2 Results

Practising counsellors (primary occupation):

| Year | A · Drift | B · Base | C · Unlock |
|---|---|---|---|
| 2026 | 54,263 | 54,263 | 54,263 |
| 2028 | 56,447 | 63,765 | 73,820 |
| 2030 | 58,676 | 79,728 | 112,710 |
| 2031 | 59,809 | 89,231 | 137,159 |
| 2033 | 62,112 | 104,677 | 177,731 |
| 2036 | **65,664** | **121,827** | **225,575** |
| CAGR | 1.9% | 8.4% | 15.3% |

All tiers at 2036:

| Tier | A · Drift | B · Base | C · Unlock |
|---|---|---|---|
| Psychiatrists | 22,734 | 24,002 | 25,758 |
| RCI clinical psychologists | 10,202 | 13,602 | 20,230 |
| Practising counsellors | 65,664 | 121,827 | 225,575 |
| Wider adjacent layer | 226,540 | 402,030 | 699,283 |
| All practitioners /100k | 6.35 | 10.27 | 17.50 |
| Counsellor : psychiatrist ratio | 2.9× | 5.1× | 8.8× |

**Note the direction of travel under Drift:** the counsellor line flattens while the licensed
lines keep climbing, so the counsellor-to-psychiatrist ratio *falls* from 4.2× to 2.9×. Even
under Demand Unlock, India in 2036 (17.50/100k) is still roughly twice China's 2020 level and
an order of magnitude below the UK's.

---

## 9. What this means for Aman

Aman never sells to organisations. So every institution-employed practitioner — hospital,
school, NGO, government, EAP panel — leaves the universe entirely rather than being discounted
within it. What remains: solo private practice, digitally reachable, self-serve, paying in
rupees.

Filters: solo share 42/45/50% by scenario · digitally reachable 85% · able to pay Pro
26/32/40%, Practice 30/33/35% (from the Zensible earnings distribution).

| | A · Drift | B · Base | C · Unlock |
|---|---|---|---|
| Solo private practice, 2036 | 27,579 | 54,822 | 112,788 |
| Digitally reachable, 2036 | 23,442 | 46,599 | 95,869 |
| Able to pay Pro, 2036 | 6,095 | 14,912 | 38,348 |
| **SAM 2026** | ₹19 cr | ₹24 cr | ₹32 cr |
| **SAM 2031** | ₹21 cr | ₹40 cr | ₹80 cr |
| **SAM 2036** | **₹23 cr** | **₹54 cr** | **₹132 cr** |

At full penetration of the paying-able segment. This is a ceiling, not a forecast.

### 9.1 The affordability wall

**Pro at ₹1,999/month is ₹24,000 a year. A counsellor earning ₹3 lakh gross — the majority —
would be spending 8% of gross revenue on practice software.**

That is not a pricing objection to negotiate past. It is a structural ceiling on how much of
the workforce can ever be a Pro customer, and it does not move until practitioner earnings
move. The thing that grows Aman's market is the same payer event that defines Scenario C.

For reference: PractiPal already sits at ₹1,499/mo unlimited, and Zoho gives an equivalent
admin layer away.

### 9.2 Three implications

**The India-only solo-counsellor SaaS ceiling is low.** Capturing every paying-able solo
counsellor in India in 2036 is ~₹54 cr of annual revenue in the base case. A real business and
a poor venture story on its own. The investable thesis cannot be "practice management for
Indian therapists" — it has to be what the practice data compounds into.

**Timing favours the data asset over the wedge.** The admin layer has no pricing power. The
scarce thing is longitudinal outcome data across many practices, which nobody in India holds
and which cannot be bought later. The benchmark pool is the only asset in the roadmap that
gets harder to replicate over time.

**The 98% is the customer.** The 14,759 psychology postgraduates a year who cannot get one of
~290 clinical psychology seats become unregulated counsellors with no supervisor, no
institutional quality signal and no way to know whether they are any good. That is precisely
the person for whom private evidence of their own effectiveness is worth paying for. The
regulatory gap that makes this market hard to count is the same gap that creates the need.

### 9.3 Honest state

Aman has zero revenue and one free tenant. No payment collection, no trial enforcement, no
onboarding, no data import. Automated measure delivery does not exist — counsellors type
scores by hand. The Outcome Report does not exist. Pricing is inferred from this analysis, not
validated with a single paying customer. Everything in §9 is a model output, not a result.

---

## 10. Confidence grading

| Input | Value | Basis | Grade |
|---|---|---|---|
| PG psychology out-turn | 14,759/yr | AISHE Table 37, primary PDF, re-verified | **Hard** |
| PG psychology enrolment | 54,484 | AISHE Table 13, re-verified | **Hard** |
| MSW out-turn | 24,645/yr | AISHE Table 37, re-verified | **Hard** |
| Female LFPR | 41.7% | PLFS 2023–24 via Economic Survey 2025–26 | **Hard** |
| WHO Atlas benchmarks | 18 countries | Primary country-profile PDFs (government self-reported) | **Hard** |
| BLS US counts | 483,500 / +17% | bls.gov OOH, verified | **Hard** |
| Argentina 286.33/100k | — | WHO Atlas 2020 Argentina PDF, verified exactly | **Hard** |
| Therapist earnings | majority ≤₹3L | Zensible 2026, n=285, 84% metro | Fair |
| Psychiatrists 2026 | ~12,900 | Reconstructed here from a 2019 estimate + seat data | Fair |
| RCI clinical psychologists | 4,309 | Parliament reply; re-verification could not reach primary | Fair |
| MD Psychiatry seats | 1,292 | NMC seat matrix via secondary; primary unreachable | Fair |
| India population | 1,463M (2026) | UN WPP 2024 medium variant via secondary aggregators | Fair |
| M.Phil clin. psych. seats | ~290/yr | Commercial aggregators; contradicted by register growth | **Weak** |
| Practice conversion rate | 30% | No India datum; anchored on China's 30–40% | **Weak** |
| CBSE counsellor mandate | 1 per 500 students | Circular not located on CBSE's own index | **Weak** |
| Platform FY24 revenue | ~₹103 cr | Aggregator of MCA filings; primary filings not checked | **Weak** |
| Wider adjacent layer | ~171,000 | Multiplier assumption; least defensible figure here | **Weak** |

Figures graded Fair or Weak should not be quoted without the qualifier attached.

---

## 11. What would change the answer

**NMHS-2, 10 October 2026.** Every prevalence and treatment-gap figure in circulation is from
2015–16. If NMHS-2 shows materially higher prevalence with a similar treatment gap, the demand
ceiling re-rates and the binding constraint could flip from demand to supply inside the decade.
Rebuild §7 the week it publishes.

**The M.Clin.Psy regulations.** If the transition expands capacity, the licensed tier changes;
if it merely renames, the 2% bottleneck persists and the informal layer stays the whole story.

**NCAHP implementation.** Whether the Community Care & Behavioural Health council builds a real
registration pathway for counsellors is the single largest fork in these projections.

**IRDAI enforcement.** The only lever that plausibly moves practitioner earnings, and therefore
the only lever that moves the affordability wall in §9.1.

---

## 12. Known gaps

- UG psychology enrolment and graduates — structurally absent from AISHE
- Attrition, emigration and non-practice rates for Indian psychiatrists and psychologists —
  no study exists
- Tele-MANAS counsellor headcount — never disclosed
- National DMHP vacancy rate — never published
- Aggregated psychiatrist consultation fees — no credible source, only unsourced blogs
- Practitioner counts for most teletherapy platforms — Wysa, Mindpeers, TalktoAngel, BetterLYF,
  Lissun, Manastha, Manoshala, Optum India, Silver Oak Health, Truworth Wellness all publish
  nothing
- Cumulative lay counsellors trained by Sangath, VISHRAM, Atmiyata — they publish reach, not
  headcount
- Life coaches and NLP practitioners — no estimate from any government, industry or academic
  source; ICF India's 2,035 credentialed coaches is the documented floor
- CBSE compliance with the counsellor mandate — no percentage published anywhere
- Post-COVID change in prevalence or help-seeking — no clean citable figure surfaced

---

## 13. Principal sources

- [AISHE 2023–24 (14th edn)](https://aishe.gov.in/aishe-final-report/), Ministry of Education —
  Tables 13 and 37. **The load-bearing source.**
- [WHO Mental Health Atlas 2017 — India](https://cdn.who.int/media/docs/default-source/mental-health/mental-health-atlas-2017-country-profiles/ind.pdf)
  and the 2020 country profiles for all comparators
- [Garg, Kumar & Chandra, *Indian Journal of Psychiatry* 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6341936/)
  — origin of the 0.75/100,000 figure
- [National Mental Health Survey](https://indianmhs.nimhans.ac.in/), NIMHANS — 2015–16 results;
  NMHS-2 pending
- [Yin et al., scoping review of China's mental health workforce](https://pmc.ncbi.nlm.nih.gov/articles/PMC11064725/)
- [US Bureau of Labor Statistics OOH](https://www.bls.gov/ooh/community-and-social-service/substance-abuse-behavioral-disorder-and-mental-health-counselors.htm)
- [Zensible, Financial State of Therapy Practice in India 2026](https://www.zensible.in/whitepapers/financial-status-of-indian-therapists)
- [Economic Survey 2025–26, ch. 12](https://www.indiabudget.gov.in/economicsurvey/doc/eschapter/echap12.pdf) — PLFS LFPR
- [CMHLP IMHO Budget Brief 2026](https://cmhlp.org/wp-content/uploads/2026/03/IMHO-Budget-Brief-2026-Final.pdf) — DMHP and Tele-MANAS funding
- [Pillai & Juvva, *IJPM* 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9125473/) — the psychiatric social work registration gap
- [Sathyanath et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC10826870/) — NMHS state-level synthesis
- [HEE NHS Talking Therapies Workforce Census 2022](https://www.hee.nhs.uk/sites/default/files/documents/HEE%20NHS%20Talking%20Therapies%20for%20Anxiety%20and%20Depression%20Workforce%20Census%202022%20-%20National%20Report.pdf)
- [Psychology Board of Australia, Nov 2024 newsletter](https://www.psychologyboard.gov.au/News/Newsletters/November-2024.aspx) — AHPRA registrations
- [PrivateCircle, FY24 Indian mental health startup revenues](https://blog.privatecircle.co/india-fy24-mental-health-therapy-startups/)
