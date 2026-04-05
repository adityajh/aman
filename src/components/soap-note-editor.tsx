"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Loader2, AlertCircle } from "lucide-react";

interface SoapNoteEditorProps {
  sessionId: string;
  onSave?: () => void;
}

export function SoapNoteEditor({ sessionId, onSave }: SoapNoteEditorProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [note, setNote] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    riskFlag: "none",
  });

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/note`);
        const data = await res.json();
        if (data) {
          setNote({
            subjective: data.subjective || "",
            objective: data.objective || "",
            assessment: data.assessment || "",
            plan: data.plan || "",
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
        toast.success("SOAP Note saved and session completed");
        if (onSave) onSave();
      } else {
        toast.error("Failed to save note");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="subjective" className="text-xs uppercase font-bold text-slate-500 tracking-wider">S: Subjective</Label>
          <Textarea 
            id="subjective" 
            placeholder="Client's self-reported feelings, complaints, and mood..." 
            className="min-h-[120px] resize-none"
            value={note.subjective}
            onChange={(e) => setNote({ ...note, subjective: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="objective" className="text-xs uppercase font-bold text-slate-500 tracking-wider">O: Objective</Label>
          <Textarea 
            id="objective" 
            placeholder="Counselor's clinical observations (affect, speech, behavior)..." 
            className="min-h-[120px] resize-none"
            value={note.objective}
            onChange={(e) => setNote({ ...note, objective: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assessment" className="text-xs uppercase font-bold text-slate-500 tracking-wider">A: Assessment</Label>
          <Textarea 
            id="assessment" 
            placeholder="Clinical interpretation, patterns, and progress overview..." 
            className="min-h-[120px] resize-none"
            value={note.assessment}
            onChange={(e) => setNote({ ...note, assessment: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="plan" className="text-xs uppercase font-bold text-slate-500 tracking-wider">P: Plan</Label>
          <Textarea 
            id="plan" 
            placeholder="Next steps, homework, and goals for the next session..." 
            className="min-h-[120px] resize-none"
            value={note.plan}
            onChange={(e) => setNote({ ...note, plan: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">Risk Flag:</Label>
          <Select 
            value={note.riskFlag}
            onValueChange={(val: any) => setNote({ ...note, riskFlag: val })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
          {note.riskFlag !== "none" && (
            <AlertCircle className={`h-5 w-5 ${note.riskFlag === 'high' ? 'text-red-500' : 'text-orange-500'}`} />
          )}
        </div>
        
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save & Complete Session
        </Button>
      </div>
    </form>
  );
}
