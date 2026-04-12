"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2, AlertCircle, BarChart3, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClinicalNoteEditorProps {
  sessionId: string;
  onSave?: () => void;
}

const SCORE_LABELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function ClinicalNoteEditor({ sessionId, onSave }: ClinicalNoteEditorProps) {
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

  const ScoreSelector = ({ value, onChange, label }: { value: number, onChange: (v: number) => void, label: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-xs font-medium text-slate-400">{label}</Label>
        <span className="text-xs font-bold text-lime-400">{value > 0 ? value : "-"}</span>
      </div>
      <div className="flex gap-1 justify-between">
        {SCORE_LABELS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "flex-1 h-7 rounded text-[10px] font-bold transition-all border",
              value === s 
                ? "bg-lime-500 border-lime-400 text-slate-950 shadow-[0_0_10px_rgba(132,204,22,0.3)]" 
                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Qualitative Notes */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="updates" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Updates (from last week)</Label>
          <Textarea 
            id="updates" 
            placeholder="Reviewing progress or changes since the last encounter..." 
            className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-lime-500/50 resize-none text-sm"
            value={note.updates}
            onChange={(e) => setNote({ ...note, updates: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subjective" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Session Notes</Label>
          <Textarea 
            id="subjective" 
            placeholder="Key themes, breakthroughs, or significant moments from today..." 
            className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-lime-500/50 resize-none text-sm"
            value={note.subjective}
            onChange={(e) => setNote({ ...note, subjective: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientActions" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Client Actions</Label>
          <Textarea 
            id="clientActions" 
            placeholder="Homework, reflection tasks, or commitments made by the client..." 
            className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-lime-500/50 resize-none text-sm"
            value={note.clientActions}
            onChange={(e) => setNote({ ...note, clientActions: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="myActions" className="text-xs uppercase font-bold text-slate-500 tracking-wider">My Actions</Label>
          <Textarea 
            id="myActions" 
            placeholder="Resources to send, follow-ups, or notes for personal preparation..." 
            className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-lime-500/50 resize-none text-sm"
            value={note.myActions}
            onChange={(e) => setNote({ ...note, myActions: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agenda" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Next Session Agenda</Label>
          <Textarea 
            id="agenda" 
            placeholder="Topics deferred or future focus areas identified today..." 
            className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-lime-500/50 resize-none text-sm"
            value={note.agenda}
            onChange={(e) => setNote({ ...note, agenda: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback" className="text-xs uppercase font-bold text-slate-500 tracking-wider">Feedback on Session</Label>
          <Textarea 
            id="feedback" 
            placeholder="Reflections on the therapist-client dynamic or session efficacy..." 
            className="min-h-[100px] bg-slate-800/50 border-slate-700 focus:border-lime-500/50 resize-none text-sm"
            value={note.feedback}
            onChange={(e) => setNote({ ...note, feedback: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ORS Section */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-lime-400" />
              <h3 className="text-sm font-bold text-slate-200">ORS (Outcome Rating Scale)</h3>
            </div>
            <div className="px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
              <span className="text-xs font-bold text-lime-400">Total: {note.orsTotal}/40</span>
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
        <div className="space-y-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-lime-400" />
              <h3 className="text-sm font-bold text-slate-200">SRS (Session Rating Scale)</h3>
            </div>
            <div className="px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/20">
              <span className="text-xs font-bold text-lime-400">Total: {note.srsTotal}/40</span>
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

      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium text-slate-300">Risk Flag:</Label>
          <Select 
            value={note.riskFlag}
            onValueChange={(val: any) => setNote({ ...note, riskFlag: val })}
          >
            <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-300">
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
