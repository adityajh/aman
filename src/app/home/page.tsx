import Link from "next/link";
import { ArrowRight, Check, Minus, TrendingUp, Zap } from "lucide-react";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">
      {/* Navigation */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-hairline">
        <div className="flex items-center gap-2">
          <Link href="/home">
            <Logo />
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-teal-action transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-teal-action transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-teal-action transition-colors">Log in</Link>
          <Link href="/signup" className="px-4 py-2 bg-teal-action text-paper rounded-md hover:bg-teal-ink transition-colors">
            Start free trial
          </Link>
        </nav>
      </header>

      <main>
        {/* §1 Hero */}
        <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-teal-ink tracking-tight mb-8 leading-tight">
            Your practice tools track your business.<br className="hidden md:block"/> Deepen tracks your clients.
          </h1>
          <p className="text-xl md:text-2xl text-ink/80 mb-12 max-w-3xl mx-auto font-serif">
            Most software shows you revenue and retention. Deepen tells you if the people you're seeing are actually getting better—and flags the ones sliding backwards before they leave.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-4">
            <Link href="/signup" className="w-full sm:w-auto px-10 py-4 bg-teal-action text-paper rounded-lg font-medium text-lg hover:bg-teal-ink transition-colors flex items-center justify-center shadow-lg shadow-teal-action/20">
              Start your 14-day trial
            </Link>
          </div>
          <p className="text-sm text-ink/50">No card charged until the trial ends. Export everything, any time.</p>

          {/* Hero Visual: Predicted Progress Concept */}
          <div className="mt-24 relative max-w-4xl mx-auto border border-hairline bg-white rounded-xl shadow-sm p-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-action to-teal-ink"></div>
            <div className="flex justify-between items-end mb-8 border-b border-hairline pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-teal-ink">Predicted Progress</h3>
                <p className="text-sm text-ink/70">Client ID: 8492 • Session 4</p>
              </div>
              <div className="flex items-center gap-2 text-[#B8860B] bg-[#B8860B]/10 px-3 py-1 rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-[#B8860B]"></span> Tracking
              </div>
            </div>
            {/* Abstract Chart Representation */}
            <div className="h-64 w-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1,2,3,4,5].map(i => <div key={i} className="w-full border-t border-hairline/50"></div>)}
              </div>
              {/* Cohort Band (#E4E1DA / #FBFAF7) */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M0,160 Q100,150 200,120 T400,80 T600,60 T800,50 L800,200 L0,200 Z" fill="#E4E1DA" fillOpacity="0.5" />
                <path d="M0,180 Q100,170 200,140 T400,100 T600,80 T800,70 L800,200 L0,200 Z" fill="#FBFAF7" fillOpacity="1" />
              </svg>
              {/* Client Line */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M0,140 L200,110 L400,70" stroke="#0F8A72" strokeWidth="3" fill="none" />
                <circle cx="0" cy="140" r="5" fill="#0F8A72" />
                <circle cx="200" cy="110" r="5" fill="#0F8A72" />
                <circle cx="400" cy="70" r="6" fill="#0F8A72" stroke="#FBFAF7" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </section>

        {/* §2 THE PROBLEM */}
        <section id="features" className="px-6 py-24 bg-white border-y border-hairline">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-teal-ink mb-6">Nobody can tell you if you're any good at this.</h2>
            <p className="text-xl text-ink/80 leading-relaxed mb-6 text-left max-w-3xl mx-auto">
              Your supervisor sees a fraction of your work. Clients tell you what they think you want to hear. Without measurement, deterioration is invisible until they stop replying to messages—leaving you guessing for a very long time.
            </p>
            <div className="inline-block px-8 py-6 bg-paper border border-hairline rounded-xl text-lg font-serif italic text-teal-ink shadow-sm">
              You don't need a research department. You need a few numbers each session and something that reads them properly.
            </div>
          </div>
        </section>

        {/* §3 DETERIORATION FLAGS */}
        <section className="px-6 py-24 max-w-5xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold text-teal-ink mb-6">You'll know by session three.</h2>
            <p className="text-lg text-ink/80 leading-relaxed mb-6">
              Deepen watches every score against that client's own starting point. When wellbeing drops past the threshold you set, the session note carries a flag and tells you why. It isn't a judgement about your work—it's a prompt to look at one client more closely, while there's still time to do something about it.
            </p>
            <div className="text-sm font-semibold text-teal-action uppercase tracking-wider">
              Your practice, your thresholds.
            </div>
          </div>
        </section>

        {/* §4 PREDICTED PROGRESS */}
        <section className="px-6 py-24 bg-paper border-y border-hairline">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-teal-ink mb-6">Are they on track? Or just not there yet?</h2>
            <p className="text-xl text-ink/80 leading-relaxed max-w-3xl mx-auto mb-10">
              Slow progress from a difficult starting point is not the same as stalled progress. Deepen compares your client against thousands who started in a similar place, so you know exactly which one you're looking at.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-lg border border-hairline shadow-sm">
                <p className="text-ink/80 text-sm leading-relaxed">
                  When there isn't enough history to say anything useful, Deepen says so. It won't guess.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-hairline shadow-sm">
                <p className="text-ink/80 text-sm leading-relaxed">
                  This isn't a new idea. Trajectory-based feedback has thirty years of research behind it. Deepen brings the same mechanism into the system where you already log your sessions and send your invoices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* §5 PRACTICE OUTCOMES */}
        <section className="px-6 py-24 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-teal-ink mb-6">A mirror for your practice. Finally.</h2>
            <p className="text-xl text-ink/80 max-w-3xl mx-auto mb-12">
              Across all the clients you've seen: how many improved, how many stayed flat, how many got worse? Most counsellors have never seen this data. With Deepen, you will.
            </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white border border-hairline p-8 rounded-xl shadow-sm">
              <div className="text-5xl font-serif font-bold text-teal-action mb-2">0.82</div>
              <div className="font-medium text-ink">Overall Progress</div>
              <p className="text-sm text-ink/60 mt-2">A measure of how much your clients are changing over time.</p>
            </div>
            <div className="bg-white border border-hairline p-8 rounded-xl shadow-sm">
              <div className="text-5xl font-serif font-bold text-teal-ink mb-2">68%</div>
              <div className="font-medium text-ink">Consistent Growth</div>
              <p className="text-sm text-ink/60 mt-2">Percentage of clients showing measurable, non-random improvement.</p>
            </div>
            <div className="bg-white border border-hairline p-8 rounded-xl shadow-sm">
              <div className="text-5xl font-serif font-bold text-[#B4472F] mb-2">12%</div>
              <div className="font-medium text-ink">Clients Slipping</div>
              <p className="text-sm text-ink/60 mt-2">Clients getting worse during treatment. Industry average is 8-10%.</p>
            </div>
          </div>
          <div className="text-sm font-medium text-ink/60 uppercase tracking-widest mt-8 border-t border-hairline pt-8 max-w-2xl mx-auto">
            These numbers describe a caseload, not a clinician. Harder caseloads produce harder numbers, and Deepen accounts for where your clients started.
          </div>
        </section>

        {/* §6 BILLING */}
        <section className="px-6 py-24 bg-teal-ink text-paper border-y border-teal-ink/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-6">And your month closes in ten minutes.</h2>
            <p className="text-xl text-paper/80 leading-relaxed max-w-3xl mx-auto mb-10">
              Log sessions as you go. One click generates every invoice, keeps rupee and dollar clients in separate batches, pro-rates the short sessions, applies your cancellation policy, and emails them out. Receipts, part-payments and credits handled the way an accountant would expect.
            </p>
            <div className="text-lg font-serif italic text-terracotta mb-16">
              It isn't why you'd come here. It's why you'd stay.
            </div>

            {/* Visuals Grid */}
            <div className="grid md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
              
              {/* Billing Visual */}
              <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-teal-action/20 text-left">
                <div className="bg-paper border-b border-hairline px-6 py-4 flex items-center justify-between">
                  <div className="text-ink font-serif font-bold text-lg">August 2026 Invoices</div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-teal-action bg-teal-action/10 px-2 py-1 rounded-full">14 Drafts</div>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-action/10 flex items-center justify-center text-teal-action font-bold text-xs">AK</div>
                        <span className="text-ink font-medium">Aarav K.</span>
                      </div>
                      <div className="text-ink font-medium text-right">₹6,000 <div className="text-ink/40 font-normal text-xs">4 sessions</div></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-action/10 flex items-center justify-center text-teal-action font-bold text-xs">SM</div>
                        <span className="text-ink font-medium">Sanya M.</span>
                      </div>
                      <div className="text-ink font-medium text-right">₹4,500 <div className="text-ink/40 font-normal text-xs">3 sessions</div></div>
                    </div>
                    <div className="flex justify-between items-center text-sm opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-bold text-xs">DJ</div>
                        <span className="text-ink font-medium">David J.</span>
                      </div>
                      <div className="text-ink font-medium text-right">$400 <div className="text-ink/40 font-normal text-xs">USD • 4 sessions</div></div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-hairline">
                    <button className="w-full bg-teal-action text-paper py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-teal-action/90 transition-colors shadow-lg shadow-teal-action/20">
                      <Check className="w-5 h-5" /> Generate 14 Invoices
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Ledger Visual */}
              <div className="w-full bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-teal-action/20 text-left mt-8 md:mt-12">
                <div className="bg-paper border-b border-hairline px-6 py-4 flex items-center justify-between">
                  <div className="text-ink font-serif font-bold text-lg">Outstanding Ledger</div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink/70 bg-ink/5 px-2 py-1 rounded-full">₹12,500 Due</div>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-paper/50 text-ink/60 border-b border-hairline">
                        <th className="font-medium px-6 py-3 text-left">Client</th>
                        <th className="font-medium px-6 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-hairline">
                        <td className="px-6 py-4 font-medium text-ink flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-teal-action"></div> Kavya T.</td>
                        <td className="px-6 py-4 text-right font-medium text-ink">₹8,000</td>
                      </tr>
                      <tr className="border-b border-hairline bg-terracotta/5">
                        <td className="px-6 py-4 font-medium text-ink flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-terracotta"></div> Rohan M.</td>
                        <td className="px-6 py-4 text-right font-medium text-terracotta">₹4,500 <div className="text-xs font-normal opacity-70">30 days overdue</div></td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-medium text-ink/60 flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-ink/20"></div> Priya S.</td>
                        <td className="px-6 py-4 text-right font-medium text-ink/60">₹0 <div className="text-xs font-normal opacity-70">Settled</div></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* §7 COMPARISON */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-teal-ink mb-4">Deepen vs. The Alternatives</h2>
              <p className="text-lg text-ink/80 max-w-2xl mx-auto">Honest version, compiled from public product pages.</p>
            </div>
            <div className="overflow-x-auto pb-4 shadow-xl shadow-black/5 rounded-2xl border border-hairline">
              <table className="w-full text-left border-collapse min-w-[800px] bg-paper/20">
                <thead>
                  <tr className="border-b-2 border-teal-ink/20 bg-white">
                    <th className="py-5 px-6 text-left font-serif font-bold text-ink">Capability</th>
                    <th className="py-5 px-6 font-serif text-xl font-bold bg-teal-ink text-paper shadow-inner border-b-4 border-teal-action">deepen. Pro<br/><span className="text-sm font-sans font-normal opacity-80">₹1,999/mo</span></th>
                    <th className="py-5 px-6 font-serif text-lg font-bold text-ink/70">Indian Clinical Tools<br/><span className="text-sm font-sans font-normal text-ink/60">₹1,000–3,000/mo</span></th>
                    <th className="py-5 px-6 font-serif text-lg font-bold text-ink/60">Global Platforms<br/><span className="text-sm font-sans font-normal text-ink/60">~₹4,500/mo</span></th>
                    <th className="py-5 px-6 font-serif text-lg font-bold text-ink/60">Generic Admin<br/><span className="text-sm font-sans font-normal text-ink/60">₹0/mo</span></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Tracks Client Progress", true, false, true, false],
                    ["Predicted Trajectories", true, false, false, false],
                    ["Clinical Deterioration Alerts", true, false, true, false],
                    ["Practice Analytics Dashboard", true, false, true, false],
                    ["GST-Compliant Invoicing", true, true, false, true],
                    ["Automated Payment Links", true, true, true, false],
                    ["Calendar & Scheduling", false, true, true, true],
                    ["Telehealth Video Integration", false, true, true, false],
                    ["Client Portal & Intake Forms", false, true, true, true],
                    ["Waitlist Management", false, true, true, false],
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-hairline hover:bg-white transition-colors">
                      <td className="py-4 px-6 font-medium text-ink bg-white">{row[0]}</td>
                      <td className="py-4 px-6 bg-teal-ink/5 border-l border-r border-teal-ink/10">{row[1] ? <Check className="w-6 h-6 text-teal-action" /> : <Minus className="w-5 h-5 text-ink/30" />}</td>
                      <td className="py-4 px-6 bg-white">{row[2] ? <Check className="w-5 h-5 text-ink/40" /> : <Minus className="w-5 h-5 text-ink/30" />}</td>
                      <td className="py-4 px-6 bg-white">{row[3] ? <Check className="w-5 h-5 text-ink/40" /> : <Minus className="w-5 h-5 text-ink/30" />}</td>
                      <td className="py-4 px-6 bg-white">{row[4] ? <Check className="w-5 h-5 text-ink/40" /> : <Minus className="w-5 h-5 text-ink/30" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-ink/70 mt-10 max-w-3xl mx-auto">
              Deepen does less than most of these, and some of what it does you can get free elsewhere. What it does instead is tell you whether the work is working — and it's the only one here that does that at all.
            </p>
          </div>
        </section>

        {/* §8 YOUR DATA */}
        <section className="px-6 py-24 bg-paper border-t border-hairline text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-teal-ink mb-6">Nobody else ever sees this.</h2>
            <p className="text-xl text-ink/80 mb-6 leading-relaxed">
              Your data belongs to you. Not your employer, not a platform, not us.
            </p>
            <p className="text-lg text-ink/70 mb-6 leading-relaxed">
              There is no supervisor view and no management dashboard. Your records are isolated, stored securely in India, and never used for AI training. Export everything—clients, sessions, and invoices—in one click, any time.
            </p>
            <div className="mt-12 bg-white p-6 border border-hairline rounded-lg text-left shadow-sm">
              <h4 className="font-bold text-ink mb-2">How the comparison works.</h4>
              <p className="text-sm text-ink/70">
                When you turn it on, three numbers leave your practice — where a client started, which session it is, and where they are now. No name, no date of birth, no notes, nothing identifying. Pooled with other practices, they're what makes the recovery band meaningful for everyone. It's off unless you switch it on, and you can switch it off whenever you like.
              </p>
            </div>
          </div>
        </section>

        {/* §9 PRICING */}
        <section id="pricing" className="px-6 py-24 bg-white border-t border-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif font-bold text-teal-ink mb-6">One tool. Two plans.</h2>
              <p className="text-xl text-ink/80 max-w-3xl mx-auto">
                A dedicated measurement platform costs around ₹2,100 a month and doesn't touch your billing. An Indian practice tool costs ₹1,199–1,499 and doesn't measure anything. Deepen Pro does both, plus trajectory prediction neither offers.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-10">
              <div className="bg-paper border border-hairline p-8 rounded-2xl flex flex-col">
                <h3 className="text-2xl font-serif font-bold text-teal-ink mb-2">Practice</h3>
                <p className="text-ink/60 mb-6 italic font-serif">Your clinical records and your billing, in one place.</p>
                <div className="text-4xl font-bold text-ink mb-8">₹999<span className="text-lg font-normal text-ink/60">/month</span><div className="text-sm font-normal text-ink/50 mt-1">₹9,990/year</div></div>
                <ul className="space-y-4 mb-12 flex-1">
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Clients and session logging</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Structured session notes and clinical history</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Batch monthly invoicing</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Rupee and dollar clients handled separately</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Receipts, part-payments, credits</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Pro-rata and cancellation fee logic</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Full export, any time</li>
                </ul>
                <Link href="/signup" className="w-full block text-center py-4 bg-white border border-hairline text-ink rounded-lg font-medium hover:bg-paper/50 transition-colors">
                  Start free trial
                </Link>
              </div>
              <div className="bg-white border-2 border-teal-ink p-8 rounded-2xl flex flex-col relative shadow-xl transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-ink text-paper px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap">
                  Most counsellors who measure choose this
                </div>
                <h3 className="text-2xl font-serif font-bold text-teal-ink mb-2">Pro</h3>
                <p className="text-ink/60 mb-6 italic font-serif">Everything above, plus the ability to know whether it's working.</p>
                <div className="text-4xl font-bold text-ink mb-8">₹1,999<span className="text-lg font-normal text-ink/60">/month</span><div className="text-sm font-normal text-ink/50 mt-1">₹19,990/year</div></div>
                <ul className="space-y-4 mb-12 flex-1">
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Everything in Practice</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Sessional outcome tracking</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Deterioration flags</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Per-client progress charts</li>
                  <li className="flex items-center gap-3 text-ink/80 font-bold"><Check className="w-5 h-5 text-teal-action" /> Predicted Progress</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> Practice outcomes dashboard</li>
                  <li className="flex items-center gap-3 text-ink/80"><Check className="w-5 h-5 text-teal-action" /> The Outcome Report</li>
                </ul>
                <Link href="/signup" className="w-full block text-center py-4 bg-teal-action text-paper rounded-lg font-medium hover:bg-teal-action/90 transition-colors shadow-lg shadow-teal-action/20">
                  Start free trial
                </Link>
              </div>
            </div>
            <p className="text-center text-sm text-ink/60 max-w-2xl mx-auto">
              14-day trial on either plan. No card charged until it ends. Cancel any time and take everything with you. Early subscribers keep their price for three years.
            </p>
          </div>
        </section>

        {/* §10 FAQ */}
        <section className="px-6 py-24 bg-paper border-t border-hairline">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-teal-ink mb-12 text-center">FAQ</h2>
            <div className="space-y-8">
              {[
                { q: "I don't measure outcomes at the moment. Is this for me?", a: "Start on Practice — you get your notes and billing sorted either way. Pro is there when you're curious. There's a free session on getting started with outcome measurement if you'd like to try before you decide." },
                { q: "Which measure do I use?", a: "Whichever you're licensed to use, or one of the built-in options. Deepen reads any brief sessional scale — you configure it once and forget about it." },
                { q: "Does this replace my calendar?", a: "No, deliberately. Keep using whatever you use." },
                { q: "Do you have scheduling, reminders, or a client booking page?", a: "No. If those are your main problem, PractiPal or PracFlow will serve you better than we will, and we'd rather say so now." },
                { q: "Can my employer or supervisor see my data?", a: "No. There is no mechanism for it and we don't sell to organisations. See above." },
                { q: "What happens if I stop paying?", a: "You export everything in one click. Nothing is held hostage." },
                { q: "Do my clients see any of this?", a: "Only if you choose to show them." },
                { q: "How is this different from the analytics in my current tool?", a: "Theirs measure your business — revenue, retention, cancellations. This measures your clients." },
              ].map((faq, i) => (
                <div key={i} className="border-b border-hairline pb-6">
                  <h4 className="font-bold text-lg text-ink mb-2">{faq.q}</h4>
                  <p className="text-ink/80 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* §11 CLOSING CTA */}
        <section className="px-6 py-24 bg-teal-ink text-paper text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-serif font-bold mb-6">Find out.</h2>
            <p className="text-xl text-paper/80 mb-10 max-w-2xl mx-auto">
              Fourteen days, no card, everything included. If it tells you something uncomfortable, that's the product working.
            </p>
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-paper text-teal-ink rounded-lg font-bold text-lg hover:bg-white transition-colors shadow-xl">
              Start your trial
            </Link>
          </div>
        </section>
      </main>

      {/* §12 FOOTER */}
      <footer className="bg-ink text-paper py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo variant="light" />
          <div className="flex gap-6 text-sm text-paper/60">
            <Link href="/pricing" className="hover:text-paper">Pricing</Link>
            <Link href="/privacy" className="hover:text-paper">Privacy</Link>
            <Link href="/terms" className="hover:text-paper">Terms</Link>
            <Link href="/contact" className="hover:text-paper">Contact</Link>
          </div>
          <div className="text-sm text-paper/40">
            &copy; 2026 Deepen Counseling Software
          </div>
        </div>
      </footer>
    </div>
  );
}
