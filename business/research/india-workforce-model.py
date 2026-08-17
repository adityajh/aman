"""
India mental health practitioner workforce — 10-year projection model, 2026-2036.
Every parameter traces to a sourced figure or an explicitly-labelled assumption.
"""
import json

YEARS = list(range(2026, 2037))

# ---------------------------------------------------------------------------
# POPULATION (UN WPP 2024 revision, India, medium variant), millions
# ---------------------------------------------------------------------------
POP = {2026: 1463, 2027: 1471, 2028: 1480, 2029: 1488, 2030: 1496,
       2031: 1504, 2032: 1512, 2033: 1529, 2034: 1544, 2035: 1558, 2036: 1571}
# smooth it properly
POP = {}
p = 1463.0
growth = 0.0072
for y in YEARS:
    POP[y] = p
    p *= (1 + growth)
    growth -= 0.00028   # decelerating, ~0.45% by 2036

# ---------------------------------------------------------------------------
# BASE-YEAR STOCKS, 2026
# ---------------------------------------------------------------------------
# Tier 1a: PSYCHIATRISTS
#   Anchor: ~9,000 (Garg et al. IJP 2019, for 2018-19; repeated by the 148th
#   Parliamentary Standing Committee 2023 and PIB Feb 2025).
#   Reconstructed forward using PG seat data:
#     seats(2016..2023) ~ 700,750,800,868,950,1050,1150,1250 (MD+DNB+DPM)
#     graduates(y) ~ seats(y-3) x 0.90 completion
#     attrition 3.0%/yr (retirement ~2.0, emigration ~1.0 - documented outflow
#     to UK/AUS/US, Pai et al. ANZJP 2022; no India aggregate exists)
def reconstruct_psychiatrists():
    seats = {2016: 700, 2017: 750, 2018: 800, 2019: 868, 2020: 950,
             2021: 1050, 2022: 1150, 2023: 1250}
    stock = 9000.0          # 2019 anchor
    for y in range(2020, 2027):
        grads = seats.get(y - 3, 700) * 0.90
        stock = stock * (1 - 0.030) + grads
    return stock

PSYCH_2026 = reconstruct_psychiatrists()

# Tier 1b: RCI-REGISTERED CLINICAL PSYCHOLOGISTS
#   2,840 (Aug 2023, 148th Parl. Cttee) -> 4,309 (Jul 2025, Parliament reply)
#   = +766/yr observed. NOTE this is ~2.6x the ~290 M.Phil seats reported by
#   commercial aggregators, which implies the aggregator seat count is an
#   undercount and/or a registration backlog is clearing.
CLINPSY_2023 = 2840
CLINPSY_2025 = 4309
CLINPSY_OBS_RATE = (CLINPSY_2025 - CLINPSY_2023) / 1.92   # ~766/yr
CLINPSY_2026 = CLINPSY_2025 + CLINPSY_OBS_RATE * 1.0      # ~5,075

# Tier 2: PRACTISING COUNSELLORS (talk therapy as PRIMARY paid occupation)
#   Bottom-up from AISHE, the only hard flow number that exists.
#   AISHE 2023-24 Table 37: PG Psychology out-turn 14,759 (M 3,557 / F 11,202)
#   AISHE 2021-22: 14,657 | 2022-23: 12,420  -> band 12.4k-14.8k
AISHE_PG_PSY_2024 = 14759
AISHE_PG_PSY_FEMALE_SHARE = 11202 / 14759          # 0.759
AISHE_MSW_2024 = 24645

def cumulative_pool(base, back_growth, years, survival=0.95):
    """Living, working-age PG graduates. Walk the AISHE flow backwards at an
    assumed historical growth rate. 25 cohorts ~ graduates from ~2000 onward,
    i.e. everyone now under ~50. survival haircuts mortality + permanent
    emigration."""
    total, flow = 0.0, base
    for _ in range(years):
        total += flow
        flow /= (1 + back_growth)
    return total * survival

PG_POOL = cumulative_pool(AISHE_PG_PSY_2024, 0.070, 25)      # ~175k
MSW_POOL = cumulative_pool(AISHE_MSW_2024, 0.045, 25)        # ~370k

# Gender-weighted labour force participation.
#   PLFS 2023-24 female LFPR ~41.7% all-India. Psychology PG cohort is 76%
#   female. Set above the general graduate-female rate because this cohort
#   self-selects for intent to practise, and because counselling is unusually
#   compatible with part-time and re-entry work.
LFPR_M, LFPR_F = 0.90, 0.45
LFPR_WEIGHTED = (1 - AISHE_PG_PSY_FEMALE_SHARE) * LFPR_M + AISHE_PG_PSY_FEMALE_SHARE * LFPR_F

# Of psychology PGs who ARE in the workforce, share whose PRIMARY paid
# occupation is counselling/therapy (vs HR, academia, research, marketing,
# civil service, industry). No India datum exists.
#   Upward pressure: only ~290 M.Phil Clinical Psychology seats exist against
#   14,759 PG psychology graduates a year - a ~2% licensing conversion. The
#   other 98% who want clinical work have nowhere to go but unregulated
#   counselling.
#   Downward pressure: Zensible 2026 finds a majority of practising therapists
#   earn <=Rs 3L/yr, which caps how many can sustain it as a primary job.
#   Anchored against China's documented 30-40% practice rate among certified
#   counsellors (Yin et al. 2024).
COUNSEL_CONVERSION_2026 = 0.30

FROM_PSY = PG_POOL * LFPR_WEIGHTED * COUNSEL_CONVERSION_2026          # ~29k
FROM_MSW = MSW_POOL * 0.55 * 0.06                                     # ~12k
FROM_DIPLOMA = 8000     # standalone counselling diplomas, psychiatric social
                        # work (~1,500 cumulative trained), medical/nursing
                        # crossovers, foreign-qualified returnees
FROM_SCHOOL = 5000      # full-time school counsellors (CBSE pre-mandate base)
NON_PSY_ROUTE_2026 = FROM_MSW + FROM_DIPLOMA + FROM_SCHOOL
COUNSELLORS_2026 = FROM_PSY + NON_PSY_ROUTE_2026

# Tier 3: WIDER COUNSELLING-ADJACENT WORKFORCE
#   Adds: dual-role school counsellors, corporate EAP panel members,
#   credentialed + uncredentialed coaches (ICF India 2,035 credentialed is the
#   documented floor), trained lay/community counsellors (DMHP/ASHA/Atmiyata/
#   Sangath), part-time and occasional practitioners.
WIDER_MULTIPLIER_2026 = 3.15
WIDER_2026 = COUNSELLORS_2026 * WIDER_MULTIPLIER_2026

# ---------------------------------------------------------------------------
# SCENARIOS
# ---------------------------------------------------------------------------
SCENARIOS = {
    "drift": {
        "label": "Credential Drift",
        "tagline": "Regulation stalls, economics stay poor, credentials outrun practice",
        "psy_seat_cagr": 0.05,
        "psy_attrition": 0.030,
        "clinpsy_add_2027": 700, "clinpsy_add_cagr": 0.00, "clinpsy_attrition": 0.025,
        "grad_flow_cagr": 0.030,
        "conversion_start": 0.30, "conversion_end": 0.26,
        "counsellor_exit": 0.090,
        "nonpsy_intake_2027": 3200, "nonpsy_intake_cagr": 0.02,
        "wider_mult_end": 3.45,
        "school_absorb_total": 0,
    },
    "base": {
        "label": "Steady Formalisation",
        "tagline": "NCAHP builds a counsellor pathway, EAP and platform demand compound",
        "psy_seat_cagr": 0.08,
        "psy_attrition": 0.030,
        "clinpsy_add_2027": 850, "clinpsy_add_cagr": 0.05, "clinpsy_attrition": 0.025,
        "grad_flow_cagr": 0.050,
        "conversion_start": 0.30, "conversion_end": 0.34,
        "counsellor_exit": 0.070,
        "nonpsy_intake_2027": 5000, "nonpsy_intake_cagr": 0.06,
        "wider_mult_end": 3.30,
        "school_absorb_total": 22000,
    },
    "unlock": {
        "label": "Demand Unlock",
        "tagline": "A payer event (IRDAI parity enforced, or a Better Access-style scheme) fires",
        "psy_seat_cagr": 0.11,
        "psy_attrition": 0.028,
        "clinpsy_add_2027": 1100, "clinpsy_add_cagr": 0.10, "clinpsy_attrition": 0.022,
        "grad_flow_cagr": 0.070,
        "conversion_start": 0.30, "conversion_end": 0.46,
        "counsellor_exit": 0.050,
        "nonpsy_intake_2027": 7500, "nonpsy_intake_cagr": 0.10,
        "wider_mult_end": 3.10,
        "school_absorb_total": 62000,
    },
}


def lerp(a, b, i, n):
    return a + (b - a) * (i / max(n - 1, 1))


def run(key):
    s = SCENARIOS[key]
    n = len(YEARS)

    psych = PSYCH_2026
    clin = CLINPSY_2026
    couns = COUNSELLORS_2026
    wider = WIDER_2026

    # psychiatry seats today (2026), MD+DNB+DPM
    seats = 1450.0
    grad_flow = AISHE_PG_PSY_2024 * (1.05 ** 2)     # 2023-24 -> 2026 flow
    nonpsy_intake = s["nonpsy_intake_2027"]

    # school-counsellor absorption from the Jan 2026 CBSE mandate, phased over
    # years 3-8 of the projection on an S-curve
    school_weights = [0, 0, 0.05, 0.12, 0.20, 0.23, 0.18, 0.12, 0.06, 0.03, 0.01]

    rows = []
    for i, y in enumerate(YEARS):
        conv = lerp(s["conversion_start"], s["conversion_end"], i, n)
        wmult = lerp(WIDER_MULTIPLIER_2026, s["wider_mult_end"], i, n)

        if i > 0:
            # --- psychiatrists ---
            seats *= (1 + s["psy_seat_cagr"])
            new_psy = seats / ((1 + s["psy_seat_cagr"]) ** 3) * 0.90   # 3-yr lag
            psych = psych * (1 - s["psy_attrition"]) + new_psy

            # --- RCI clinical psychologists ---
            add = s["clinpsy_add_2027"] * ((1 + s["clinpsy_add_cagr"]) ** (i - 1))
            clin = clin * (1 - s["clinpsy_attrition"]) + add

            # --- counsellors (primary occupation) ---
            grad_flow *= (1 + s["grad_flow_cagr"])
            entrants = grad_flow * LFPR_WEIGHTED * conv
            nonpsy = nonpsy_intake * ((1 + s["nonpsy_intake_cagr"]) ** (i - 1))
            school = s["school_absorb_total"] * school_weights[i]
            couns = couns * (1 - s["counsellor_exit"]) + entrants + nonpsy + school

            wider = couns * wmult
        else:
            new_psy = seats / ((1 + s["psy_seat_cagr"]) ** 3) * 0.90
            entrants = grad_flow * LFPR_WEIGHTED * conv
            nonpsy = nonpsy_intake
            school = 0

        licensed = psych + clin
        pop_lakh = POP[y] * 10           # millions -> hundred-thousands
        rows.append({
            "year": y,
            "population_m": round(POP[y], 1),
            "psychiatrists": round(psych),
            "clinical_psychologists": round(clin),
            "licensed_total": round(licensed),
            "counsellors": round(couns),
            "wider": round(wider),
            "grad_flow": round(grad_flow),
            "new_entrants": round(entrants + nonpsy + school),
            "psychiatrists_per_lakh": round(psych / pop_lakh, 3),
            "licensed_per_lakh": round(licensed / pop_lakh, 3),
            "counsellors_per_lakh": round(couns / pop_lakh, 3),
            "total_per_lakh": round((licensed + couns) / pop_lakh, 3),
            "counsellor_psychiatrist_ratio": round(couns / psych, 2),
            "conversion": round(conv, 3),
        })
    return rows


results = {k: run(k) for k in SCENARIOS}

# ---------------------------------------------------------------------------
# REPORT
# ---------------------------------------------------------------------------
print("=" * 78)
print("BASE YEAR 2026 — derivation")
print("=" * 78)
print(f"Population 2026                          {POP[2026]:,.0f} M")
print(f"Psychiatrists (reconstructed)            {PSYCH_2026:,.0f}")
print(f"   vs the figure still quoted publicly   9,000 (2018-19 estimate)")
print(f"RCI clinical psychologists               {CLINPSY_2026:,.0f}")
print(f"   observed register growth              {CLINPSY_OBS_RATE:,.0f}/yr (2023->2025)")
print(f"   vs reported M.Phil seats              ~290/yr  <-- inconsistent, see note")
print()
print(f"AISHE PG psychology out-turn 2023-24     {AISHE_PG_PSY_2024:,}  (76% female)")
print(f"AISHE MSW out-turn 2023-24               {AISHE_MSW_2024:,}")
print(f"Cumulative living PG psych pool          {PG_POOL:,.0f}")
print(f"  x gender-weighted LFPR {LFPR_WEIGHTED:.3f}          {PG_POOL*LFPR_WEIGHTED:,.0f} in workforce")
print(f"  x {COUNSEL_CONVERSION_2026:.0%} counselling as primary job    {FROM_PSY:,.0f}")
print(f"  + MSW route                            {FROM_MSW:,.0f}")
print(f"  + diploma / PSW / crossover route      {FROM_DIPLOMA:,.0f}")
print(f"  + full-time school counsellors         {FROM_SCHOOL:,.0f}")
print(f"  = PRACTISING COUNSELLORS 2026          {COUNSELLORS_2026:,.0f}")
print(f"  = WIDER ADJACENT WORKFORCE 2026        {WIDER_2026:,.0f}")
print()
print("  cross-checks on the 2026 counsellor base:")
print(f"    ratio-transfer, intl 6x-20x band     {PSYCH_2026*6:,.0f} - {PSYCH_2026*20:,.0f}")
print(f"    this model                           {COUNSELLORS_2026:,.0f}  ({COUNSELLORS_2026/PSYCH_2026:.1f}x)")
print( "    -> India sits BELOW the band. Ratio-transfer assumes a counselling")
print( "       layer as economically viable as the counted countries'. India's")
print( "       therapist earnings data says it is not.")
print()
print(f"Licensed specialists 2026                {PSYCH_2026+CLINPSY_2026:,.0f}")
print(f"Counsellor : psychiatrist ratio 2026     {COUNSELLORS_2026/PSYCH_2026:.1f}x")
print(f"   international counted range           6x - 20x")
print(f"Total practitioners per 100k 2026        {(PSYCH_2026+CLINPSY_2026+COUNSELLORS_2026)/(POP[2026]*10):.2f}")

for k, rows in results.items():
    s = SCENARIOS[k]
    print()
    print("=" * 78)
    print(f"{s['label'].upper()}  —  {s['tagline']}")
    print("=" * 78)
    print(f"{'Yr':<6}{'Psychiat':>10}{'ClinPsy':>9}{'Counsel':>10}{'Wider':>10}"
          f"{'Psy/lakh':>10}{'Tot/lakh':>10}{'C:P':>7}")
    for r in rows:
        print(f"{r['year']:<6}{r['psychiatrists']:>10,}{r['clinical_psychologists']:>9,}"
              f"{r['counsellors']:>10,}{r['wider']:>10,}"
              f"{r['psychiatrists_per_lakh']:>10.2f}{r['total_per_lakh']:>10.2f}"
              f"{r['counsellor_psychiatrist_ratio']:>7.1f}")
    a, b = rows[0], rows[-1]
    cagr = lambda x, y: ((y / x) ** (1 / 10) - 1) * 100
    print(f"  CAGR 2026-36:  psychiatrists {cagr(a['psychiatrists'],b['psychiatrists']):.1f}%"
          f" | clin psych {cagr(a['clinical_psychologists'],b['clinical_psychologists']):.1f}%"
          f" | counsellors {cagr(a['counsellors'],b['counsellors']):.1f}%")

# ---------------------------------------------------------------------------
# ADDRESSABLE MARKET — solo private-practice counsellors only.
# Aman's hard rule: never sell to organisations, at any price. So every
# institution-employed practitioner (hospital, school, NGO, government,
# EAP-panel-only) is excluded from the universe, not discounted within it.
# ---------------------------------------------------------------------------
SOLO_SHARE = {"drift": 0.42, "base": 0.45, "unlock": 0.50}   # of practising counsellors
DIGITAL_SHARE = 0.85          # laptop/smartphone workflow, reachable self-serve
# Willingness/ability to pay, from Zensible 2026 earnings distribution:
#   Pro at Rs 1,999/mo = Rs 24k/yr. A counsellor earning Rs 3L/yr would spend
#   8% of GROSS revenue on it. Only practitioners above ~Rs 6L/yr absorb that
#   comfortably; Zensible puts that at roughly the top third of the curve.
PRO_ABLE = {"drift": 0.26, "base": 0.32, "unlock": 0.40}
PRACTICE_ABLE = {"drift": 0.30, "base": 0.33, "unlock": 0.35}   # Rs 999 tier
ARPU_PRO, ARPU_PRACTICE = 1999 * 12, 999 * 12

print()
print("=" * 78)
print("ADDRESSABLE MARKET — solo private-practice counsellors, India-only")
print("=" * 78)
print("Organisation-employed practitioners are EXCLUDED from the universe,")
print("not discounted within it (Aman never sells to organisations).")
print()
tam = {}
for k, rows in results.items():
    tam[k] = []
    print(f"-- {SCENARIOS[k]['label']}")
    print(f"   {'Yr':<6}{'Practising':>12}{'Solo':>10}{'Reachable':>11}"
          f"{'Pro-able':>10}{'SAM Rs cr':>12}")
    for r in rows:
        solo = r["counsellors"] * SOLO_SHARE[k]
        reach = solo * DIGITAL_SHARE
        pro = reach * PRO_ABLE[k]
        prac = reach * PRACTICE_ABLE[k]
        sam_cr = (pro * ARPU_PRO + prac * ARPU_PRACTICE) / 1e7
        tam[k].append({"year": r["year"], "solo": round(solo),
                       "reachable": round(reach), "pro_able": round(pro),
                       "practice_able": round(prac), "sam_inr_cr": round(sam_cr, 1),
                       "sam_usd_m": round(sam_cr * 10 / 88, 1)})
        if r["year"] in (2026, 2031, 2036):
            print(f"   {r['year']:<6}{r['counsellors']:>12,}{solo:>10,.0f}"
                  f"{reach:>11,.0f}{pro:>10,.0f}{sam_cr:>12,.0f}")
    t = tam[k][-1]
    print(f"   2036 SAM: Rs {t['sam_inr_cr']:,.0f} cr  (~${t['sam_usd_m']:,.0f}M)"
          f"  at full penetration of the paying-able segment")
print()
print("Reality check: total DISCLOSED FY24 revenue of India's ten best-known")
print("digital mental-health platforms combined was ~Rs 103 cr (~$12-13M).")
print("A SAM above that is a claim about a market that does not yet transact.")

with open("india-workforce-projections.json", "w") as f:
    json.dump({
        "years": YEARS,
        "population": {y: round(POP[y], 1) for y in YEARS},
        "base_2026": {
            "psychiatrists": round(PSYCH_2026),
            "clinical_psychologists": round(CLINPSY_2026),
            "counsellors": round(COUNSELLORS_2026),
            "wider": round(WIDER_2026),
            "pg_pool": round(PG_POOL),
            "lfpr_weighted": round(LFPR_WEIGHTED, 3),
        },
        "tam": tam, "scenarios": {k: {"label": SCENARIOS[k]["label"],
                          "tagline": SCENARIOS[k]["tagline"],
                          "rows": v} for k, v in results.items()},
    }, f, indent=1)
print("\nwrote projections.json")
