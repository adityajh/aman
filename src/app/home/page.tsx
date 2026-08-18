import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Logo } from "@/components/logo";
import { Brandmark } from "@/components/brandmark";
import { HomeHeader } from "@/components/home-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Navigation */}
      <HomeHeader />

      <main>
        {/* §1 Hero */}
        <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif font-medium text-teal-ink tracking-tight mb-6 leading-tight">
              Run your solo practice.<br />Know your clients are getting better.
            </h1>
            <p className="text-lg md:text-xl text-ink/80 mb-8 max-w-lg font-sans leading-relaxed">
              Close your monthly billing in ten minutes. Use a quiet, 90-second check-in to catch sliding clients before it's too late. Built for one counsellor, in India.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-teal-action text-paper rounded-lg font-semibold text-base hover:bg-teal-ink transition-colors text-center shadow-md shadow-teal-action/20"
              >
                Start your 14-day trial
              </Link>
              <a
                href="#how"
                className="px-6 py-3.5 border border-hairline text-teal-ink rounded-lg font-medium text-base hover:bg-white transition-colors text-center"
              >
                See how it works
              </a>
            </div>
            <p className="text-xs text-muted font-medium">
              14 days free. Cancel in one click. Export your data anytime.
            </p>
          </div>

          {/* Hero Demo Card */}
          <div className="bg-white border border-hairline rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-baseline text-sm">
              <span className="font-semibold text-slate-800">Client R. · session 6</span>
              <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-pulse"></span>
                Worth a closer look
              </span>
            </div>
            
            <div className="relative h-44 w-full border-b border-hairline pt-2">
              <svg viewBox="0 0 520 180" className="w-full h-full">
                <g stroke="#E4E1DA" strokeWidth="1">
                  <line x1="40" y1="20" x2="500" y2="20" />
                  <line x1="40" y1="60" x2="500" y2="60" />
                  <line x1="40" y1="100" x2="500" y2="100" />
                  <line x1="40" y1="140" x2="500" y2="140" />
                </g>
                <polyline
                  points="60,140 148,130 236,122 324,132 412,143 500,155"
                  fill="none"
                  stroke="#0F8A72"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <g fill="#0F8A72" stroke="#fff" strokeWidth="2">
                  <circle cx="60" cy="140" r="4.5" />
                  <circle cx="148" cy="130" r="4.5" />
                  <circle cx="236" cy="122" r="4.5" />
                  <circle cx="324" cy="132" r="4.5" />
                  <circle cx="412" cy="143" r="4.5" />
                </g>
                <circle cx="500" cy="155" r="5" fill="#B4472F" stroke="#fff" strokeWidth="2" />
                <text x="500" y="172" fontSize="11" fill="#B4472F" textAnchor="end" fontWeight="600">
                  this client
                </text>
                <g fontSize="11" fill="#878D93">
                  <text x="60" y="175" textAnchor="middle">s1</text>
                  <text x="236" y="175" textAnchor="middle">s3</text>
                  <text x="412" y="175" textAnchor="middle">s5</text>
                  <text x="34" y="24" textAnchor="end">40</text>
                  <text x="34" y="104" textAnchor="end">20</text>
                </g>
              </svg>
            </div>

            <div className="border-l-4 border-rose-600 pl-3 py-1 text-xs text-slate-600">
              <strong className="text-slate-900 font-semibold">Something to look at.</strong> Two readings below where this client started. The note says why.
            </div>
            <p className="text-[10px] text-muted text-right italic">Demonstration data.</p>
          </div>
        </section>

        {/* §2 How it works / Three Layers */}
        <section id="how" className="py-16 bg-white border-y border-hairline">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-teal-ink mb-10">
              Everything a solo counselor needs.
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-paper border border-hairline rounded-xl p-6 relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-1.5 bg-teal/40 rounded mb-6"></div>
                  <h3 className="text-2xl font-serif text-teal-ink mb-2">Seamless Admin</h3>
                  <p className="text-sm text-ink/80 leading-relaxed">
                    Sessions, clinical notes, and one-click batch invoicing. Your month closes in ten minutes.
                  </p>
                </div>
                <div className="mt-6 text-xs text-muted font-medium">In <b className="text-teal-ink">Deepen</b></div>
              </div>

              <div className="bg-paper border border-hairline rounded-xl p-6 relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-2 bg-teal rounded mb-6"></div>
                  <h3 className="text-2xl font-serif text-teal-ink mb-2">Quiet Insights</h3>
                  <p className="text-sm text-ink/80 leading-relaxed">
                    A short check-in on their phone before each session. A chart per client. A flag when someone slides.
                  </p>
                </div>
                <div className="mt-6 text-xs text-muted font-medium">In <b className="text-teal-ink">Deepen</b></div>
              </div>

              <div className="bg-paper border border-hairline rounded-xl p-6 relative flex flex-col justify-between">
                <div>
                  <div className="w-12 h-3 bg-teal-ink rounded mb-6"></div>
                  <h3 className="text-2xl font-serif text-teal-ink mb-2">
                    Total Privacy <span className="text-[10px] uppercase font-bold text-terracotta border border-terracotta px-1.5 py-0.5 rounded ml-2">Coming</span>
                  </h3>
                  <p className="text-sm text-ink/80 leading-relaxed">
                    Your whole caseload on one page. Then the Outcome Report.
                  </p>
                </div>
                <div className="mt-6 text-xs text-muted font-medium">In <b className="text-teal-ink">Deepen Pro</b></div>
              </div>
            </div>
          </div>
        </section>

        {/* §3 You'll know by session three */}
        <section className="py-16 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-teal-ink mb-4">
              You'll know by session three.
            </h2>
            <p className="text-lg text-ink/80 mb-4 leading-relaxed">
              Every reading is compared with where that client started. Never with anyone else. When someone slides, the note carries a flag and says why.
            </p>
            <p className="text-sm text-muted">
              Not a judgement about your work. A prompt to look closer while there's still time.
            </p>
          </div>

          <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm space-y-3">
            <p className="text-xs text-muted font-medium">Session note · Client R. · s6</p>
            <p className="text-sm text-slate-800 leading-relaxed">
              Talked about the return to work. Sleep still poor. Bringing the manager conversation to next session.
            </p>
            <div className="flex gap-4 text-xs text-slate-600 pt-1">
              <span>Check-in <strong className="text-slate-900 font-bold">17</strong> <span className="text-slate-400">(started 21)</span></span>
              <span>Working relationship <strong className="text-slate-900 font-bold">6.4</strong> <span className="text-slate-400">(was 8.1)</span></span>
            </div>
            <div className="border-l-4 border-rose-600 pl-3 py-1 text-xs text-slate-600">
              <strong className="text-slate-900 font-semibold">Worth a closer look.</strong> Two readings below the start, and the relationship rating dropped this session.
            </div>
            <p className="text-[10px] text-muted text-right italic">Demonstration data.</p>
          </div>
        </section>

        {/* §4 Privacy Band */}
        <section className="bg-teal-ink text-paper py-16 px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-paper">
              Nobody else ever sees this.
            </h2>
            <p className="text-lg text-[#CFE3DD] leading-relaxed">
              Not your employer. Not a platform. Not us. Deepen is built for one counsellor and is never sold to organisations.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">One login per account</span>
              <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">Hosted in India</span>
              <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">Never used to train anything</span>
              <span className="border border-white/20 rounded-full px-4 py-1.5 text-xs text-paper">Export everything in one click</span>
            </div>
          </div>
        </section>

        {/* §5 Pricing */}
        <section id="pricing" className="py-20 px-6 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-teal-ink">
            One plan. Everything on.
          </h2>
          <p className="text-sm text-muted">
            Monthly. No card until day 14. Cancel any time and take everything with you.
          </p>

          <div className="max-w-md mx-auto bg-white border-2 border-teal-ink rounded-2xl p-8 text-left space-y-6 shadow-xl">
            <div className="text-4xl font-bold text-slate-900 tracking-tight">
              ₹999 <span className="text-sm font-normal text-slate-500">/ month</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal mt-1.5 shrink-0" /> Clients, sessions and notes
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal mt-1.5 shrink-0" /> Invoices, receipts and part-payments, in one click
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal mt-1.5 shrink-0" /> A check-in each session, a chart per client, a flag when someone slides
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-teal mt-1.5 shrink-0" /> Full export, any time
              </li>
            </ul>

            <div className="text-xs text-slate-500 pt-2 border-t border-hairline leading-relaxed">
              <strong>Built exclusively for solo practitioners.</strong> Up to 30 active clients. Closed client records are kept forever and never count toward your limit. If you run a group clinic or agency, Deepen is not for you.
            </div>

            <div className="pt-2">
              <Link
                href="/signup"
                className="w-full block text-center py-3.5 bg-teal-action text-paper font-semibold rounded-lg hover:bg-teal-ink transition-colors shadow-md"
              >
                Start your 14-day trial
              </Link>
            </div>
          </div>

          <p className="text-xs text-muted pt-2 max-w-md mx-auto">
            Deepen Pro, ₹1,999, arrives with the Outcome Report. Nobody on Deepen loses anything when it does.
          </p>
        </section>

        {/* §6 FAQ */}
        <section className="py-16 px-6 max-w-4xl mx-auto border-t border-hairline">
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-teal-ink mb-8">
            Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                I don't measure outcomes at the moment. Is this for me?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. Your notes and billing get sorted either way, and the check-in is there when you're curious. Nobody sees it but you.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Do you do scheduling, video or a booking page?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No, on purpose. If those are your main problem, PractiPal or PracFlow will serve you better, and we'd rather say so.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Which measure do I use?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Whichever you're licensed to use, or a built-in one. Set it once and forget it.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                What if I stop paying?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You export everything in one click. Nothing is held hostage.
              </p>
            </div>
          </div>
        </section>

        {/* §7 Closing CTA */}
        <section className="py-20 text-center px-6 border-t border-hairline">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-teal-ink mb-4">
            Fourteen days, everything on.
          </h2>
          <p className="text-base text-slate-600 mb-8 max-w-md mx-auto">
            See what a truly private, measurement-first practice feels like.
          </p>
          <Link
            href="/signup"
            className="px-8 py-4 bg-teal-action text-paper rounded-lg font-semibold text-base hover:bg-teal-ink transition-colors inline-block shadow-lg"
          >
            Start your 14-day trial
          </Link>
        </section>
      </main>

      {/* §8 Footer */}
      <footer className="border-t border-hairline py-8 px-6 text-xs text-muted">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-medium text-teal-ink">deepen<b>.</b></span>
            <span>&nbsp; outcome tracking for counsellors</span>
          </div>
          <div>Pricing · Privacy · Terms · Contact · © 2026</div>
        </div>
      </footer>
    </div>
  );
}
