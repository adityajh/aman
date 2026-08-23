"use client";

import { useState, useEffect, useMemo } from "react";
import { computeNoteFlags } from "@/lib/riskFlags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2, AlertCircle, BarChart3, ClipboardList, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIST, istDateTimeToUTC } from "@/lib/tz";
import { useSession } from "next-auth/react";

interface ClinicalNoteEditorProps {
  session: any; // Full session object for initial times
  onSave?: () => void;
  onClose?: () => void;
}

// ── Stable module-level component ──────────────────────────────────────────
// Must live OUTSIDE ClinicalNoteEditor so React never remounts it mid-drag.
function ScoreSelector({ value, onChange, label, showNumbers, disabled }: {
  value: number | string;
  onChange: (v: number) => void;
  label: string;
  showNumbers: boolean;
  disabled?: boolean;
}) {
  // Drizzle returns numeric(5,1) columns as strings — coerce defensively.
  const num = typeof value === "number" ? value : parseFloat(value as string);
  const safe = Number.isFinite(num) ? num : 0;
  const pct = (safe / 10) * 100;
  const trackColor = !showNumbers ? "#e2e8f0" : (safe <= 3 ? "#ef4444" : safe <= 6 ? "#f59e0b" : "#84cc16");

  // While the number box is being typed in, we hold the raw keystrokes in a
  // local string buffer. A controlled numeric value would strip a trailing
  // "." (parseFloat("7.") === 7), making decimals like "7.5" impossible to
  // type. The canonical value pushed up via onChange stays a number, so the
  // save payload remains numeric — the DB column is numeric(5,1).
  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft !== null ? draft : (safe === 0 ? "" : String(safe));

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(null); // dragging the slider takes over from any typed buffer
    onChange(Math.round(parseFloat(e.target.value) * 10) / 10);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraft(raw);
    if (raw === "" || raw === ".") {
      onChange(0);
      return;
    }
    const v = parseFloat(raw);
    if (!isNaN(v) && v >= 0 && v <= 10) {
      onChange(Math.round(v * 10) / 10);
    }
  };

  // On blur, drop the buffer so the box re-syncs to the canonical 1-decimal value.
  const handleBlur = () => setDraft(null);

  return (
    <div className={cn("space-y-1.5", disabled && "opacity-40 pointer-events-none")}>
      <Label className="text-xs font-medium text-slate-500 leading-snug">{label}</Label>
      <div className="flex items-center gap-3">
        {/* Slider */}
        <div className="relative flex-1 h-5 flex items-center">
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={safe}
            onChange={handleSlider}
            disabled={disabled}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${trackColor} ${pct}%, #e2e8f0 ${pct}%)`,
            }}
          />
        </div>
        {/* Number input */}
        {showNumbers && (
          <>
            <Input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={displayValue}
              onChange={handleInput}
              onBlur={handleBlur}
              disabled={disabled}
              placeholder="0"
              className="w-16 h-8 text-center font-bold text-sm border-slate-200 bg-white p-1"
            />
            {/* Coloured readout */}
            <span className="text-xs font-bold w-10 text-right" style={{ color: trackColor }}>
              {safe > 0 ? safe.toFixed(1) : "—"}
            </span>
          </>
        )}
      </div>
      {/* Tick marks */}
      {showNumbers && (
        <div className="flex justify-between px-0.5">
          {[0, 2.5, 5, 7.5, 10].map(t => (
            <span key={t} className="text-[9px] text-slate-300 font-medium">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
// ───────────────────────────────────────────────────────────────────────────



export function ClinicalNoteEditor({ session, onSave, onClose }: ClinicalNoteEditorProps) {
  const sessionId = session.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const { data: sessionData } = useSession();
  const planTier = (sessionData?.user as any)?.planTier || "deepen";
  const hasClinicalMeasurement = true;

  // §7 — "Not Recorded" toggles (per ORS/SRS block). When on, that scale is
  // saved as null for this session rather than 0, so the chart bridges the gap
  // instead of plotting a misleading zero.
  const [orsNotRecorded, setOrsNotRecorded] = useState(false);
  const [srsNotRecorded, setSrsNotRecorded] = useState(false);

  // §7 — automated risk flagging. We auto-suggest "High Risk" from the
  // configurable practice-settings thresholds, but only until the counselor
  // touches the flag themselves (then we stop overriding). We never
  // auto-downgrade — auto only ever raises to high.
  const [settings, setSettings] = useState<any>(null);

  // Clinical context for this session (initial ORS baseline, previous SRS),
  // enriched by the sessions API onto the session object.
  const clinical = session._clinical ?? {};
  
  // Format dates for time input
  const scheduledStart = new Date(session.scheduledAt);
  const scheduledEnd = new Date(scheduledStart.getTime() + (session.durationMin || 60) * 60000);
  
  // Time inputs are interpreted as IST so the wall-clock the counselor sees
  // matches the wall-clock the system stores, regardless of browser TZ.
  const getSafeTimeStr = (dateVal: any, fallbackDate: Date) => {
    if (!dateVal) return formatIST(fallbackDate, "HH:mm");
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return formatIST(fallbackDate, "HH:mm");
    return formatIST(d, "HH:mm");
  };

  const [note, setNote] = useState({
    updates: "",
    subjective: "", 
    clientActions: "",
    myActions: "",
    agenda: "",
    feedback: "",
    // Time tracking
    actualStartTime: getSafeTimeStr(session.actualStartTime, scheduledStart),
    actualEndTime: getSafeTimeStr(session.actualEndTime, scheduledEnd),
    // ORS
    orsIndividual: 0,
    orsInterpersonal: 0,
    orsSocial: 0,
    orsOverall: 0,
    orsTotal: 0,
    // SRS
    srsRelationship: 9,
    srsGoals: 9,
    srsApproach: 9,
    srsOverall: 9,
    srsTotal: 36,
    riskFlag: "none",
  });

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/note`);
        const data = await res.json();
        if (data) {
          // Drizzle returns numeric(5,1) as string — coerce to number on the way in.
          const n = (v: unknown) => {
            const x = typeof v === "number" ? v : parseFloat(v as string);
            return Number.isFinite(x) ? x : 0;
          };
          setNote(prev => ({
            ...prev,
            updates: data.updates || "",
            subjective: data.subjective || "",
            clientActions: data.clientActions || "",
            myActions: data.myActions || "",
            agenda: data.agenda || "",
            feedback: data.feedback || "",
            orsIndividual: n(data.orsIndividual),
            orsInterpersonal: n(data.orsInterpersonal),
            orsSocial: n(data.orsSocial),
            orsOverall: n(data.orsOverall),
            orsTotal: n(data.orsTotal),
            srsRelationship: n(data.srsRelationship),
            srsGoals: n(data.srsGoals),
            srsApproach: n(data.srsApproach),
            srsOverall: n(data.srsOverall),
            srsTotal: n(data.srsTotal),
            riskFlag: data.riskFlag || "none",
          }));
          // A null total means the scale was deliberately "not recorded".
          setOrsNotRecorded(data.orsTotal == null);
          setSrsNotRecorded(data.srsTotal == null);
        }
      } catch (err) {
        toast.error("Failed to fetch existing note");
      } finally {
        setFetching(false);
      }
    };
    fetchNote();
  }, [sessionId]);

  // Load practice-settings thresholds for the auto risk-flag logic.
  useEffect(() => {
    fetch(`/api/settings`)
      .then((r) => r.json())
      .then((s) => s && setSettings(s))
      .catch(() => {});
  }, []);

  // Two automatic outcome flags derived from the scores (single source of
  // truth in @/lib/riskFlags). ORS flag = ORS dropped from baseline; SRS flag
  // = SRS below cutoff or dropped from last session. Recomputed live as the
  // counselor enters scores; also sent on save.
  const flags = useMemo(() => computeNoteFlags({
    orsRecorded: !orsNotRecorded,
    orsTotal: note.orsTotal,
    initialOrs: clinical.initialOrs != null ? Number(clinical.initialOrs) : null,
    srsRecorded: !srsNotRecorded,
    srsTotal: note.srsTotal,
    prevSrs: clinical.prevSrs != null ? Number(clinical.prevSrs) : null,
    orsDeterThreshold: settings?.orsDeteriorationThreshold ?? 5,
    srsDeclineThreshold: settings?.srsDeclineThreshold ?? 2,
    srsCutoff: settings?.srsCutoff ?? 36,
  }), [note.orsTotal, note.srsTotal, orsNotRecorded, srsNotRecorded, settings, clinical.initialOrs, clinical.prevSrs]);

  const num = (v: unknown) => {
    const x = typeof v === "number" ? v : parseFloat(v as string);
    return Number.isFinite(x) ? x : 0;
  };

  const updateOrs = (key: string, val: number) => {
    setNote(prev => {
      const newNote = { ...prev, [key]: val };
      newNote.orsTotal = num(newNote.orsIndividual) + num(newNote.orsInterpersonal) + num(newNote.orsSocial) + num(newNote.orsOverall);
      return newNote;
    });
  };

  const updateSrs = (key: string, val: number) => {
    setNote(prev => {
      const newNote = { ...prev, [key]: val };
      newNote.srsTotal = num(newNote.srsRelationship) + num(newNote.srsGoals) + num(newNote.srsApproach) + num(newNote.srsOverall);
      return newNote;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Wall-clock entries in the form are IST. Anchor them to the session's
      // IST calendar date so saving never drifts when the browser TZ differs.
      const actStart = istDateTimeToUTC(scheduledStart, note.actualStartTime);
      let actEnd = istDateTimeToUTC(scheduledStart, note.actualEndTime);

      if (actEnd < actStart) {
        // Session crosses midnight (IST) — push end to the next day.
        actEnd = new Date(actEnd.getTime() + 24 * 60 * 60 * 1000);
      }

      // §7 — a "not recorded" scale is persisted as null (not 0), so the chart
      // bridges the gap instead of plotting a misleading zero.
      const orsFields = orsNotRecorded
        ? { orsIndividual: null, orsInterpersonal: null, orsSocial: null, orsOverall: null, orsTotal: null }
        : {
            orsIndividual: note.orsIndividual, orsInterpersonal: note.orsInterpersonal,
            orsSocial: note.orsSocial, orsOverall: note.orsOverall, orsTotal: note.orsTotal,
          };
      const srsFields = srsNotRecorded
        ? { srsRelationship: null, srsGoals: null, srsApproach: null, srsOverall: null, srsTotal: null }
        : {
            srsRelationship: note.srsRelationship, srsGoals: note.srsGoals,
            srsApproach: note.srsApproach, srsOverall: note.srsOverall, srsTotal: note.srsTotal,
          };

      const payload = {
        ...note,
        ...orsFields,
        ...srsFields,
        orsFlag: flags.orsFlag,
        srsFlag: flags.srsFlag,
        actualStartTimeISO: actStart.toISOString(),
        actualEndTimeISO: actEnd.toISOString()
      };

      const res = await fetch(`/api/sessions/${sessionId}/note`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Clinical Note saved");
        if (onSave) onSave();
        if (onClose) onClose();
      } else {
        toast.error("Failed to save note");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Qualitative Notes */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="updates" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Updates (from last week)</Label>
          <Textarea 
            id="updates" 
            placeholder="Reviewing progress or changes since the last encounter..." 
            className="min-h-[100px] bg-white border-slate-200 focus:border-lime-500/50 resize-none text-sm text-slate-900"
            value={note.updates}
            onChange={(e) => setNote({ ...note, updates: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subjective" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Session Notes</Label>
          <Textarea 
            id="subjective" 
            placeholder="Key themes, breakthroughs, or significant moments from today..." 
            className="min-h-[100px] bg-white border-slate-200 focus:border-lime-500/50 resize-none text-sm text-slate-900"
            value={note.subjective}
            onChange={(e) => setNote({ ...note, subjective: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientActions" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Client Actions</Label>
          <Textarea 
            id="clientActions" 
            placeholder="Homework, reflection tasks, or commitments made by the client..." 
            className="min-h-[100px] bg-white border-slate-200 focus:border-lime-500/50 resize-none text-sm text-slate-900"
            value={note.clientActions}
            onChange={(e) => setNote({ ...note, clientActions: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="myActions" className="text-xs uppercase font-bold text-slate-500 tracking-wider">My Actions</Label>
          <Textarea 
            id="myActions" 
            placeholder="Resources to send, follow-ups, or notes for personal preparation..." 
            className="min-h-[100px] bg-white border-slate-200 focus:border-lime-500/50 resize-none text-sm text-slate-900"
            value={note.myActions}
            onChange={(e) => setNote({ ...note, myActions: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agenda" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Next Session Agenda</Label>
          <Textarea 
            id="agenda" 
            placeholder="Topics deferred or future focus areas identified today..." 
            className="min-h-[100px] bg-white border-slate-200 focus:border-lime-500/50 resize-none text-sm text-slate-900"
            value={note.agenda}
            onChange={(e) => setNote({ ...note, agenda: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Feedback on Session</Label>
          <Textarea 
            id="feedback" 
            placeholder="Reflections on the therapist-client dynamic or session efficacy..." 
            className="min-h-[100px] bg-white border-slate-200 focus:border-lime-500/50 resize-none text-sm text-slate-900"
            value={note.feedback}
            onChange={(e) => setNote({ ...note, feedback: e.target.value })}
          />
        </div>
      </div>

      {hasClinicalMeasurement && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ORS Section */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-lime-600" />
                  <h3 className="text-sm font-bold text-slate-900">ORS (Outcome Rating Scale)</h3>
                </div>
                <div className="flex items-center gap-3">
                  {showNumbers && !orsNotRecorded && (
                    <div className="px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
                      <span className="text-xs font-bold text-lime-600">Total: {note.orsTotal}/40</span>
                    </div>
                  )}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none" title="Save this scale as 'not recorded' (null) for this session">
                    <input type="checkbox" checked={orsNotRecorded} onChange={(e) => setOrsNotRecorded(e.target.checked)} className="h-3.5 w-3.5 accent-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Not recorded</span>
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <ScoreSelector label="Individually (Personal well-being)" value={note.orsIndividual} onChange={(v) => updateOrs('orsIndividual', v)} showNumbers={showNumbers} disabled={orsNotRecorded} />
                <ScoreSelector label="Interpersonally (Family, close relationships)" value={note.orsInterpersonal} onChange={(v) => updateOrs('orsInterpersonal', v)} showNumbers={showNumbers} disabled={orsNotRecorded} />
                <ScoreSelector label="Socially (Work, school, friendships)" value={note.orsSocial} onChange={(v) => updateOrs('orsSocial', v)} showNumbers={showNumbers} disabled={orsNotRecorded} />
                <ScoreSelector label="Overall (General sense of well-being)" value={note.orsOverall} onChange={(v) => updateOrs('orsOverall', v)} showNumbers={showNumbers} disabled={orsNotRecorded} />
              </div>
            </div>

            {/* SRS Section */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-lime-600" />
                  <h3 className="text-sm font-bold text-slate-900">SRS (Session Rating Scale)</h3>
                </div>
                <div className="flex items-center gap-3">
                  {showNumbers && !srsNotRecorded && (
                    <div className="px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
                      <span className="text-xs font-bold text-lime-600">Total: {note.srsTotal}/40</span>
                    </div>
                  )}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none" title="Save this scale as 'not recorded' (null) for this session">
                    <input type="checkbox" checked={srsNotRecorded} onChange={(e) => setSrsNotRecorded(e.target.checked)} className="h-3.5 w-3.5 accent-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Not recorded</span>
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <ScoreSelector label="Goals and Topics (We worked on what I wanted)" value={note.srsGoals} onChange={(v) => updateSrs('srsGoals', v)} showNumbers={showNumbers} disabled={srsNotRecorded} />
                <ScoreSelector label="Approach or Method (Fit with therapist's approach)" value={note.srsApproach} onChange={(v) => updateSrs('srsApproach', v)} showNumbers={showNumbers} disabled={srsNotRecorded} />
                <ScoreSelector label="Relationship (I felt heard, understood, and respected)" value={note.srsRelationship} onChange={(v) => updateSrs('srsRelationship', v)} showNumbers={showNumbers} disabled={srsNotRecorded} />
                <ScoreSelector label="Overall (Today's session was right for me)" value={note.srsOverall} onChange={(v) => updateSrs('srsOverall', v)} showNumbers={showNumbers} disabled={srsNotRecorded} />
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-4 relative z-10">
            <Button 
              type="button"
              variant="outline" 
              size="icon" 
              onClick={() => setShowNumbers(!showNumbers)}
              className="rounded-full bg-white shadow-sm border-slate-200 text-slate-500 hover:text-slate-900 h-10 w-10"
              title={showNumbers ? "Hide Scores (Blind Mode)" : "Show Scores (Precise Mode)"}
            >
              {showNumbers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </>
      )}

      {/* Time Tracking — kept at the bottom, next to ORS/SRS, so finalizing a
          note doesn't require scrolling back to the top. */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Actual Start Time</Label>
          <Input
            type="time"
            value={note.actualStartTime}
            onChange={(e) => setNote({ ...note, actualStartTime: e.target.value })}
            className="bg-white border-slate-200"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Actual End Time</Label>
          <Input
            type="time"
            value={note.actualEndTime}
            onChange={(e) => setNote({ ...note, actualEndTime: e.target.value })}
            className="bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div className="flex items-center gap-6">
          {hasClinicalMeasurement && (
            ([
              { label: "ORS", flag: flags.orsFlag, reason: flags.orsReason },
              { label: "SRS", flag: flags.srsFlag, reason: flags.srsReason },
            ] as const).map(({ label, flag, reason }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label} flag</span>
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset",
                    flag === true ? "bg-rose-50 text-rose-600 ring-rose-200"
                      : flag === false ? "bg-emerald-50 text-emerald-600 ring-emerald-200"
                      : "bg-slate-50 text-slate-400 ring-slate-200",
                  )}>
                    {flag === true ? <><AlertCircle className="h-3 w-3" /> YES</> : flag === false ? "NO" : "—"}
                  </span>
                </div>
                {flag === true && reason && <span className="text-[10px] text-rose-500 font-medium">{reason}</span>}
              </div>
            ))
          )}
        </div>

        <Button type="submit" disabled={loading} className="gap-2 bg-lime-500 text-slate-950 hover:bg-lime-600 font-bold px-8 h-12">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Finalize Session Note
        </Button>
      </div>
    </form>
  );
}
