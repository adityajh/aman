"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, UploadCloud, Check, Loader2, AlertTriangle, FileUp } from "lucide-react";
import * as XLSX from "xlsx";
import { TZ_OPTIONS, IST } from "@/lib/tz";

type MappingFields = {
  name: string;
  email: string;
  phone: string;
  defaultFee: string;
  timezone: string;
};

export default function ImportClientsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  
  const [mapping, setMapping] = useState<MappingFields>({
    name: "",
    email: "",
    phone: "",
    defaultFee: "",
    timezone: "",
  });

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      if (data.length < 2) {
        toast.error("File appears to be empty or has no data rows.");
        return;
      }

      // Filter out empty headers
      const extractedHeaders = (data[0] || []).map((h: any) => h ? String(h).trim() : "").filter(Boolean);
      
      // Auto-map if possible
      const autoMap = { name: "", email: "", phone: "", defaultFee: "", timezone: "" };
      extractedHeaders.forEach(h => {
        const lower = h.toLowerCase();
        if (lower.includes("name") && !autoMap.name) autoMap.name = h;
        else if (lower.includes("email") && !autoMap.email) autoMap.email = h;
        else if (lower.includes("phone") && !autoMap.phone) autoMap.phone = h;
        else if ((lower.includes("fee") || lower.includes("price")) && !autoMap.defaultFee) autoMap.defaultFee = h;
        else if (lower.includes("timezone") || lower.includes("tz")) autoMap.timezone = h;
      });

      const rowObjects = XLSX.utils.sheet_to_json(ws);
      setHeaders(extractedHeaders);
      setRawData(rowObjects);
      setMapping(autoMap);
      setStep(2);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleMappingNext = () => {
    if (!mapping.name) {
      toast.error("You must map at least the Name column.");
      return;
    }

    // Generate preview
    const mapped = rawData.map(row => {
      return {
        name: mapping.name ? row[mapping.name] : "",
        email: mapping.email ? row[mapping.email] : "",
        phone: mapping.phone ? row[mapping.phone] : "",
        defaultFee: mapping.defaultFee ? row[mapping.defaultFee] : "",
        timezone: mapping.timezone ? row[mapping.timezone] : "Asia/Kolkata",
      };
    }).filter(row => row.name); // only keep rows that have a name

    setPreviewData(mapped);
    setStep(3);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newClients: previewData }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.errors && data.errors.length > 0) {
          toast.warning(\`Imported \${data.inserted} clients, with \${data.errors.length} errors.\`);
        } else {
          toast.success(\`Successfully imported \${data.inserted} clients.\`);
        }
        router.push("/dashboard/clients");
      } else {
        toast.error(data.message || data.error || "Failed to import clients.");
      }
    } catch (err) {
      toast.error("An error occurred during import.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/clients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Import Clients</h1>
          <p className="text-slate-500">Upload an Excel or CSV file to quickly add multiple clients.</p>
        </div>
      </div>

      {step === 1 && (
        <Card className="mt-8 border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-slate-100 p-4 mb-4">
              <FileUp className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Upload your file</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6 mt-1">
              Select an .xlsx, .xls, or .csv file containing your client roster. The first row should contain column headers.
            </p>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
              <UploadCloud className="h-4 w-4" /> Choose File
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Map Columns</CardTitle>
            <CardDescription>
              Match the columns from your uploaded file to the client fields in Deepen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 max-w-lg">
              {(["name", "email", "phone", "defaultFee", "timezone"] as (keyof MappingFields)[]).map(field => (
                <div key={field} className="grid grid-cols-2 items-center gap-4">
                  <Label className="capitalize font-medium text-slate-700">
                    {field === "defaultFee" ? "Default Fee" : field}
                    {field === "name" && <span className="text-rose-500 ml-1">*</span>}
                  </Label>
                  <Select 
                    value={mapping[field]} 
                    onValueChange={(val) => setMapping(prev => ({ ...prev, [field]: val === "none" ? "" : val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Skip --</SelectItem>
                      {headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleMappingNext}>Preview Import</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Import</CardTitle>
            <CardDescription>
              We found {previewData.length} valid client rows. Review the data below before confirming.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md max-h-[500px] overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Default Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 50).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{row.email || "-"}</TableCell>
                      <TableCell>{row.phone || "-"}</TableCell>
                      <TableCell>{row.defaultFee || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {previewData.length > 50 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                        ...and {previewData.length - 50} more rows
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleImport} disabled={importing} className="gap-2">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Import {previewData.length} Clients
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
