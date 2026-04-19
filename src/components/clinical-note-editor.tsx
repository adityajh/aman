"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2, AlertCircle, BarChart3, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClinicalNoteEditorProps {
  sessionId: string;
  onSave?: () => void;
  onClose?: () => void;
}

// ── Stable module-level component ──────────────────────────────────────────
// Must live OUTSIDE ClinicalNoteEditor so React never remounts it mid-drag.
function ScoreSelector({ value, onChange, label }: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const pct = (value / 10) * 100;
  const trackColor = value <= 3 ? "#ef4444" : value <= 6 ? "#f59e0b" : "#84cc16";

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Math.round(parseFloat(e.target.value) * 10) / 10);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v >= 0 && v <= 10) {
      onChange(Math.round(v * 10) / 10);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-500 leading-snug">{label}</Label>
      <div className="flex items-center gap-3">
        {/* Slider */}
        <div className="relative flex-1 h-5 flex items-center">
          <input
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={value}
            onChange={handleSlider}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${trackColor} ${pct}%, #e2e8f0 ${pct}%)`,
            }}
          />
        </div>
        {/* Number input */}
        <Input
          type="number"
          min={0}
          max={10}
          step={0.1}
          value={value === 0 ? "" : value}
          onChange={handleInput}
          placeholder="0"
          className="w-16 h-8 text-center font-bold text-sm border-slate-200 bg-white p-1"
        />
        {/* Coloured readout */}
        <span className="text-xs font-bold w-10 text-right" style={{ color: trackColor }}>
          {value > 0 ? value.toFixed(1) : "—"}
        </span>
      </div>
      {/* Tick marks */}
      <div className="flex justify-between px-0.5">
        {[0, 2.5, 5, 7.5, 10].map(t => (
          <span key={t} className="text-[9px] text-slate-300 font-medium">{t}</span>
        ))}
      </div>
    </div>
  );
}
// ───────────────────────────────────────────────────────────────────────────



export function ClinicalNoteEditor({ sessionId, onSave, onClose }: ClinicalNoteEditorProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [note, setNote] = useState({
    updates: "",
    subjective: "", // Used for main "Session Notes"
    clientActions: "",
    myActions: "",
    agenda: "",
    feedback: "",
    // ORS
    orsIndividual: 0,
    orsInterpersonal: 0,
    orsSocial: 0,
    orsOverall: 0,
    orsTotal: 0,
    // SRS
    srsRelationship: 0,
    srsGoals: 0,
    srsApproach: 0,
    srsOverall: 0,
    srsTotal: 0,
    riskFlag: "none",
  });

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/note`);
        const data = await res.json();
        if (data) {
          setNote({
            updates: data.updates || "",
            subjective: data.subjective || "",
            clientActions: data.clientActions || "",
            myActions: data.myActions || "",
            agenda: data.agenda || "",
            feedback: data.feedback || "",
            orsIndividual: data.orsIndividual || 0,
            orsInterpersonal: data.orsInterpersonal || 0,
            orsSocial: data.orsSocial || 0,
            orsOverall: data.orsOverall || 0,
            orsTotal: data.orsTotal || 0,
            srsRelationship: data.srsRelationship || 0,
            srsGoals: data.srsGoals || 0,
            srsApproach: data.srsApproach || 0,
            srsOverall: data.srsOverall || 0,
            srsTotal: data.srsTotal || 0,
            riskFlag: data.riskFlag || "none",
          });
        }
      } catch (err) {
        toast.error("Failed to fetch existing note");
      } finally {
        setFetching(false);
      }
    };
    fetchNote();
  }, [sessionId]);

  const updateOrs = (key: string, val: number) => {
    setNote(prev => {
      const newNote = { ...prev, [key]: val };
      newNote.orsTotal = (newNote.orsIndividual || 0) + (newNote.orsInterpersonal || 0) + (newNote.orsSocial || 0) + (newNote.orsOverall || 0);
      return newNote;
    });
  };

  const updateSrs = (key: string, val: number) => {
    setNote(prev => {
      const newNote = { ...prev, [key]: val };
      newNote.srsTotal = (newNote.srsRelationship || 0) + (newNote.srsGoals || 0) + (newNote.srsApproach || 0) + (newNote.srsOverall || 0);
      return newNote;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/note`, {
        method: "POST",
        body: JSON.stringify(note),
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ORS Section */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-lime-600" />
              <h3 className="text-sm font-bold text-slate-900">ORS (Outcome Rating Scale)</h3>
            </div>
            <div className="px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
              <span className="text-xs font-bold text-lime-600">Total: {note.orsTotal}/40</span>
            </div>
          </div>
          <div className="space-y-4">
            <ScoreSelector label="Individually (Personal well-being)" value={note.orsIndividual} onChange={(v) => updateOrs('orsIndividual', v)} />
            <ScoreSelector label="Interpersonally (Family, close relationships)" value={note.orsInterpersonal} onChange={(v) => updateOrs('orsInterpersonal', v)} />
            <ScoreSelector label="Socially (Work, school, friendships)" value={note.orsSocial} onChange={(v) => updateOrs('orsSocial', v)} />
            <ScoreSelector label="Overall (General sense of well-being)" value={note.orsOverall} onChange={(v) => updateOrs('orsOverall', v)} />
          </div>
        </div>

        {/* SRS Section */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-lime-600" />
              <h3 className="text-sm font-bold text-slate-900">SRS (Session Rating Scale)</h3>
            </div>
            <div className="px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
              <span className="text-xs font-bold text-lime-600">Total: {note.srsTotal}/40</span>
            </div>
          </div>
          <div className="space-y-4">
            <ScoreSelector label="Relationship (I felt heard, understood, and respected)" value={note.srsRelationship} onChange={(v) => updateSrs('srsRelationship', v)} />
            <ScoreSelector label="Goals and Topics (We worked on what I wanted)" value={note.srsGoals} onChange={(v) => updateSrs('srsGoals', v)} />
            <ScoreSelector label="Approach or Method (Fit with therapist's approach)" value={note.srsApproach} onChange={(v) => updateSrs('srsApproach', v)} />
            <ScoreSelector label="Overall (Today's session was right for me)" value={note.srsOverall} onChange={(v) => updateSrs('srsOverall', v)} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium text-slate-600">Risk Flag:</Label>
          <Select 
            value={note.riskFlag}
            onValueChange={(val: any) => setNote({ ...note, riskFlag: val })}
          >
            <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
          {note.riskFlag !== "none" && (
            <AlertCircle className={cn("h-5 w-5", note.riskFlag === 'high' ? 'text-red-500' : 'text-orange-500')} />
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
