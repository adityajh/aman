import Link from "next/link";
import { HomeHeader } from "@/components/home-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      <HomeHeader />

      <main>
        {/* §1 Hero */}
        <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-medium text-teal-ink tracking-tight mb-6 leading-[1.05]">
              Run your practice.<br />Know it&rsquo;s working.
            </h1>
            <p className="text-lg md:text-xl text-ink-2 mb-8 max-w-lg leading-relaxed">
              Complete your monthly invoicing in ten minutes. A short check-in before each session and a check-out after tell you how each client is doing, while there&rsquo;s still time to help. Built for solo counselors.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-teal-action text-paper rounded-lg font-semibold text-base hover:bg-teal-ink transition-colors text-center shadow-md shadow-teal-action/20"
              >
                Start my 7-day trial
              </Link>
              <a
                href="#how"
                className="px-6 py-3.5 border border-hairline text-teal-ink rounded-lg font-medium text-base hover:bg-white transition-colors text-center"
              >
                See how it works
              </a>
            </div>
            <p className="text-sm text-ink-muted">
              ₹999 a month. No card charged until day 7. Export everything, any time.
            </p>
          </div>

          {/* Hero demo card */}
          <div className="bg-white border border-hairline rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-baseline text-sm">
              <span className="font-semibold text-ink">Client A. · session 6</span>
              <span className="text-xs font-semibold text-ink-2 flex items-center gap-1.5">
                <svg viewBox="0 0 12 12" className="w-3 h-3 text-teal-action" aria-hidden="true">
                  <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Tracking
              </span>
            </div>

            <div className="relative w-full">
              <svg viewBox="0 0 520 210" className="w-full h-auto" role="img" aria-label="Demonstration chart: one client's wellbeing over six sessions, rising alongside clients who started in a similar place">
                <g stroke="#E4E1DA" strokeWidth="1">
                  <line x1="40" y1="20" x2="500" y2="20" />
                  <line x1="40" y1="65" x2="500" y2="65" />
                  <line x1="40" y1="110" x2="500" y2="110" />
                  <line x1="40" y1="155" x2="500" y2="155" />
                </g>
                {/* band: clients who started in a similar place */}
                <path
                  d="M60,150 C150,138 240,112 320,94 C400,78 460,66 500,60 L500,104 C460,110 400,122 320,136 C240,150 150,166 60,172 Z"
                  fill="#EEEBE4"
                />
                <text x="500" y="52" fontSize="11" fill="#878D93" textAnchor="end">
                  clients who started in a similar place
                </text>
                {/* this client, rising */}
                <polyline
                  points="60,158 148,146 236,128 324,116 412,98 500,84"
                  fill="none"
                  stroke="#0F8A72"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <g fill="#0F8A72" stroke="#fff" strokeWidth="2">
                  <circle cx="60" cy="158" r="4.5" />
                  <circle cx="148" cy="146" r="4.5" />
                  <circle cx="236" cy="128" r="4.5" />
                  <circle cx="324" cy="116" r="4.5" />
                  <circle cx="412" cy="98" r="4.5" />
                  <circle cx="500" cy="84" r="5" />
                </g>
                <text x="500" y="76" fontSize="11" fill="#0B4F43" textAnchor="end" fontWeight="600">
                  this client
                </text>
                <g fontSize="11" fill="#878D93">
                  <text x="60" y="196" textAnchor="middle">s1</text>
                  <text x="236" y="196" textAnchor="middle">s3</text>
                  <text x="412" y="196" textAnchor="middle">s5</text>
                  <text x="14" y="110" transform="rotate(-90 14 110)" textAnchor="middle">
                    wellbeing, higher is better
                  </text>
                </g>
              </svg>
            </div>

            {/* invoicing strip */}
            <div className="flex items-center justify-between gap-4 border-t border-hairline pt-3 text-xs text-ink-2">
              <span>
                <strong className="text-ink font-semibold">August invoices</strong> · 23 sessions · 11 clients · two currencies · one click
              </span>
              <span className="shrink-0 text-[11px] font-semibold text-teal-ink bg-teal-action/10 rounded-full px-2.5 py-0.5">Sent</span>
            </div>
            <p className="text-[10px] text-ink-muted text-right italic">Demonstration data.</p>
          </div>
        </section>

        {/* §2 Three layers */}
        <section id="how" className="py-16 bg-white border-y border-hairline">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-teal-ink mb-3">
              Three layers. Plan. Invoice. Measure.
            </h2>
            <p className="text-lg text-ink-2 mb-10 max-w-2xl">
              Built for solo counselors. Every layer is yours and nobody else&rsquo;s.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-paper border border-hairline rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-1.5 bg-teal-action/40 rounded mb-6"></div>
                  <h3 className="text-2xl font-serif text-teal-ink mb-2">Run the practice</h3>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    Sessions, notes, and one-click batch invoicing. Your month closes in ten minutes.
                  </p>
                </div>
                <div className="mt-6 text-xs text-ink-muted font-medium">In <b className="text-teal-ink">Deepen</b></div>
              </div>

              <div className="bg-paper border border-hairline rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-2.5 bg-teal-action rounded mb-6"></div>
                  <h3 className="text-2xl font-serif text-teal-ink mb-2">How is this client doing?</h3>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    A short check-in before the session, and a check-out after. A chart per client. A flag when someone slides.
                  </p>
                </div>
                <div className="mt-6 text-xs text-ink-muted font-medium">In <b className="text-teal-ink">Deepen</b></div>
              </div>

              <div className="bg-paper border border-hairline rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-3.5 bg-teal-ink rounded mb-6"></div>
                  <h3 className="text-2xl font-serif text-teal-ink mb-2">
                    How am I doing?
                    <span className="text-[10px] uppercase font-bold text-terracotta border border-terracotta px-1.5 py-0.5 rounded ml-2 align-middle">Coming</span>
                  </h3>
                  <p className="text-sm text-ink-2 leading-relaxed">
                    Your whole caseload on one page. Then the Outcome Report. When there isn&rsquo;t enough history to say something useful, it says so. It won&rsquo;t guess.
                  </p>
                </div>
                <div className="mt-6 text-xs text-ink-muted font-medium">In <b className="text-teal-ink">Deepen Pro</b></div>
              </div>
            </div>
          </div>
        </section>

        {/* §2c Month closes */}
        <section className="bg-teal-ink text-paper py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-paper mb-3">
              Complete your monthly invoicing in ten minutes.
            </h2>
            <p className="text-lg text-[#CFE3DD] max-w-2xl mb-10">
              Log sessions as you go. One click generates every invoice, keeps rupee and dollar clients apart, applies your cancellation policy, and emails them out. Receipts and part-payments handled the way an accountant expects.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white text-ink rounded-xl border border-hairline p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-medium text-ink">August 2026 invoices</h3>
                  <span className="text-[11px] font-semibold text-teal-ink bg-teal-action/10 rounded-full px-2.5 py-0.5">14 drafts</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-teal-action/10 text-teal-ink text-xs font-semibold flex items-center justify-center shrink-0">AK</span>
                    <span className="text-sm text-ink flex-1">Aarav K.</span>
                    <span className="text-sm text-ink-2 text-right">₹6,000 <span className="text-xs text-ink-muted">· 4 sessions</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-teal-action/10 text-teal-ink text-xs font-semibold flex items-center justify-center shrink-0">PS</span>
                    <span className="text-sm text-ink flex-1">Priya S.</span>
                    <span className="text-sm text-ink-2 text-right">₹4,500 <span className="text-xs text-ink-muted">· 3 sessions</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-teal-action/10 text-teal-ink text-xs font-semibold flex items-center justify-center shrink-0">RM</span>
                    <span className="text-sm text-ink flex-1">Rohan M.</span>
                    <span className="text-sm text-ink-2 text-right">$240 <span className="text-xs text-ink-muted">· 2 sessions</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-teal-action/10 text-teal-ink text-xs font-semibold flex items-center justify-center shrink-0">NI</span>
                    <span className="text-sm text-ink flex-1">Neha I.</span>
                    <span className="text-sm text-ink-2 text-right">₹3,000 <span className="text-xs text-ink-muted">· 2 sessions</span></span>
                  </div>
                </div>
                <div className="bg-teal-action text-paper rounded-lg text-center py-2.5 text-sm font-semibold">
                  Generate and send all
                </div>
              </div>

              <div className="bg-white text-ink rounded-xl border border-hairline p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-medium text-ink">Outstanding</h3>
                  <span className="text-[11px] font-semibold text-teal-ink bg-teal-action/10 rounded-full px-2.5 py-0.5">₹12,500 due</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-ink-muted text-left">
                      <th className="font-medium pb-2">Client</th>
                      <th className="font-medium pb-2">Due</th>
                      <th className="font-medium pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1.5 text-ink">Meera T.</td>
                      <td className="py-1.5 text-ink-2">₹8,000</td>
                      <td className="py-1.5 text-ink-2">Sent</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-ink">Kabir D.</td>
                      <td className="py-1.5 text-ink-2">₹4,500</td>
                      <td className="py-1.5 text-brick font-medium">30 days overdue</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-ink-muted">Sana P.</td>
                      <td className="py-1.5 text-ink-muted">₹0</td>
                      <td className="py-1.5 text-ink-muted">Settled</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-ink-muted">Reminders go out on the day you choose.</p>
              </div>
            </div>
            <p className="text-[10px] italic text-[#9FC9BE] mt-4">Demonstration data.</p>
          </div>
        </section>

        {/* §2b The problem */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-teal-ink mb-5">
                Session ends. You hope it helped.
              </h2>
              <p className="text-lg text-ink-2 leading-relaxed">
                A short check-in before the session, a check-out after &mdash; ninety seconds, and you can see exactly how each client is doing, session to session. While there&rsquo;s still time to adjust. <span className="font-serif italic text-teal-ink">That&rsquo;s what Deepen is for.</span>
              </p>
            </div>

            <div>
              <div className="mx-auto w-[260px] rounded-[2rem] border-[6px] border-ink bg-white shadow-xl p-5 space-y-4">
                <p className="text-xs text-ink-muted">Before today&rsquo;s session · 90 seconds</p>
                <p className="font-serif text-lg text-teal-ink">
                  Over the last week, how have you been feeling, overall?
                </p>
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                  <span className="w-5 h-5 rounded-full bg-teal-action"></span>
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                  <span className="w-5 h-5 rounded-full border border-hairline"></span>
                </div>
                <p className="text-xs text-ink-muted">1 of 4</p>
                <div className="bg-teal-action text-paper rounded-lg text-center py-2 text-sm font-semibold">
                  Next
                </div>
              </div>
              <p className="text-[10px] italic text-ink-muted text-center mt-2">Demonstration.</p>
            </div>
          </div>
        </section>

        {/* §3 You'll know by session three */}
        <section className="py-16 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-teal-ink mb-2">
              You&rsquo;ll know by session three.
            </h2>
            <p className="text-xs uppercase tracking-wider font-semibold text-teal-action mb-5">
              Your practice, your thresholds.
            </p>
            <p className="text-lg text-ink-2 mb-4 leading-relaxed">
              Every reading is compared with where that client started. Never with anyone else. When someone slides, the note carries a flag and says why.
            </p>
            <p className="text-lg text-ink-2 mb-4 leading-relaxed">
              Your evenings stop going to invoices, and you stop guessing about the client who worries you.
            </p>
            <p className="text-sm text-ink-muted">
              Not a judgement about your work. A prompt to look closer while there&rsquo;s still time.
            </p>
          </div>

          <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm space-y-3">
            <p className="text-xs text-ink-muted font-medium">Session note · Client R. · s6</p>
            <p className="text-sm text-ink leading-relaxed">
              Talked about the return to work. Sleep still poor. Bringing the manager conversation to next session.
            </p>
            <div className="flex gap-4 text-xs text-ink-2 pt-1">
              <span>Check-in <strong className="text-ink font-bold">17</strong> <span className="text-ink-muted">(started 21)</span></span>
              <span>Working relationship <strong className="text-ink font-bold">6.4</strong> <span className="text-ink-muted">(was 8.1)</span></span>
            </div>
            <div className="border-l-4 border-brick pl-3 py-1 text-xs text-ink-2">
              <strong className="text-ink font-semibold">Worth a closer look.</strong> Two readings below the start, and the relationship rating dropped this session.
            </div>
            <p className="text-[10px] text-ink-muted text-right italic">Demonstration data.</p>
          </div>
        </section>

        {/* §3b Things we will never build */}
        

        {/* §4 Privacy */}
        <section className="bg-teal-ink text-paper py-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-medium text-paper">
                Nobody else ever sees this.
              </h2>
              <p className="text-lg text-[#CFE3DD] leading-relaxed">
                Not your employer. Not a platform. Not us. Deepen is built for solo counselors and is never sold to organisations.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">One login per account</span>
                <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">Hosted in India</span>
                <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">Never used to train anything</span>
                <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">Export everything in one click</span>
                <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">Deleted 30 days after you leave</span>
              </div>
              <p className="text-sm text-[#9FC9BE]">
                <Link href="/privacy" className="underline underline-offset-4 hover:text-paper">Read the privacy note</Link>
              </p>
            </div>
            <div className="md:pl-8 md:border-l md:border-white/15">
              <h3 className="text-2xl font-serif font-medium text-paper mb-2">Things we will never build.</h3>
              <p className="text-sm text-[#9FC9BE] mb-5">Not later either. Each one would turn your numbers into someone else&rsquo;s business.</p>
              <ul className="space-y-4">
                <li className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5FC3AE] shrink-0" /><div><span className="font-semibold text-paper">Seats or a second login.</span> <span className="text-[#CFE3DD]">One counsellor, one account.</span></div></li>
                <li className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5FC3AE] shrink-0" /><div><span className="font-semibold text-paper">A supervisor or employer view.</span> <span className="text-[#CFE3DD]">Nobody sees your numbers but you.</span></div></li>
                <li className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#5FC3AE] shrink-0" /><div><span className="font-semibold text-paper">A directory, badges or scores.</span> <span className="text-[#CFE3DD]">Your results are not a listing, and you are not being graded.</span></div></li>
              </ul>
            </div>
          </div>
        </section>

        {/* §5 Pricing */}
        <section id="pricing" className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-teal-ink">
            One plan. Everything on.
          </h2>
          <p className="text-sm text-ink-muted">
            Monthly. No card charged until day 7. Cancel any time and take everything with you.
          </p>

          <div className="max-w-md mx-auto bg-white border-2 border-teal-ink rounded-2xl p-8 text-left space-y-6 shadow-xl">
            <div className="text-4xl font-bold text-ink tracking-tight">
              ₹999 <span className="text-sm font-normal text-ink-muted">/ month</span>
            </div>
            <ul className="space-y-3 text-sm text-ink-2">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-action mt-1.5 shrink-0" /> Clients, sessions and notes
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-action mt-1.5 shrink-0" /> Invoices, receipts and part-payments, in one click
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-action mt-1.5 shrink-0" /> Track every client&rsquo;s payment balance easily
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-action mt-1.5 shrink-0" /> A check-in and check-out each session, a chart per client, a flag when someone slides
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-action mt-1.5 shrink-0" /> Up to 40 active clients
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-action mt-1.5 shrink-0" /> No spreadsheets, no chasing payments
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-action mt-1.5 shrink-0" /> Full export, any time
              </li>
            </ul>

            <div className="text-xs text-ink-muted pt-2 border-t border-hairline leading-relaxed">
              For solo counselors. Up to 40 active clients &mdash; more than one person can carry. Groups and organisations, this isn&rsquo;t for you.
            </div>

            <div className="pt-2">
              <Link
                href="/signup"
                className="w-full block text-center py-3.5 bg-teal-action text-paper font-semibold rounded-lg hover:bg-teal-ink transition-colors shadow-md"
              >
                Start my 7-day trial
              </Link>
            </div>
          </div>

          <p className="text-sm text-ink-muted pt-2 max-w-md mx-auto leading-relaxed">
            Coming: Deepen Pro, ₹1,999. For when you&rsquo;re ready to ask &ldquo;how am I doing, across all of them?&rdquo; Nobody on Deepen loses anything when it arrives.
          </p>
        </section>

        {/* §6 FAQ */}
        <section className="py-16 px-6 max-w-4xl mx-auto border-t border-hairline">
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-teal-ink mb-8">
            Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                I don&rsquo;t measure outcomes at the moment. Is this for me?
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed">
                Yes. Your notes and billing get sorted either way, and the check-in is there when you&rsquo;re curious. Nobody sees it but you.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                Do you do scheduling, video or a booking page?
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed">
                No, on purpose. Deepen does the two things a solo counsellor can&rsquo;t get anywhere else and leaves the rest to tools built for it.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                How does the check-in work?
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed">
                Four short questions before the session, one after. Your client answers on their phone in about ninety seconds. The scores attach to your session note and the chart updates on its own.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                What if I stop paying?
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed">
                You export everything in one click. Nothing is held hostage.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                What if I only want Plan and Invoice?
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed">
                That&rsquo;s fine. Skip the check-in entirely &mdash; your client management, notes, and invoicing all work without it. When you&rsquo;re ready, Measure is already included. No extra cost, nothing to upgrade.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink mb-1">
                Is there a limit on clients?
              </h3>
              <p className="text-sm text-ink-2 leading-relaxed">
                Up to 40 active clients &mdash; more than a solo counselor can carry. Inactive clients don&rsquo;t count toward the limit, and their records stay as long as you need them.
              </p>
            </div>
          </div>
        </section>

        {/* §7 Closing */}
        <section className="py-20 text-center px-6 border-t border-hairline">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-teal-ink mb-4">
            See it working.
          </h2>
          <p className="text-base text-ink-2 mb-8 max-w-md mx-auto">
            Seven days. Everything on. No card charged until day seven.
          </p>
          <Link
            href="/signup"
            className="px-8 py-4 bg-teal-action text-paper rounded-lg font-semibold text-base hover:bg-teal-ink transition-colors inline-block shadow-lg"
          >
            Start my 7-day trial
          </Link>
        </section>
      </main>

      {/* §8 Footer */}
      <footer className="border-t border-hairline py-8 px-6 text-xs text-ink-muted">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-medium text-teal-ink">deepen<b className="text-terracotta">.</b></span>
            <span>outcome tracking for counsellors</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="#pricing" className="hover:text-teal-action transition-colors">
              Pricing
            </Link>
            <span>· <Link href="/privacy" className="hover:text-teal-action transition-colors">Privacy</Link> · <Link href="/terms" className="hover:text-teal-action transition-colors">Terms</Link> · <Link href="/refunds" className="hover:text-teal-action transition-colors">Refunds</Link> · <Link href="/contact" className="hover:text-teal-action transition-colors">Contact</Link> · © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
