import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Check, User, FileText, Upload, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";

interface ProcessingResult {
  id: number;
  fullName: string;
  age: number;
  extractedText: string;
  fileName: string;
  fileType: string;
}

export default function ResultsPage() {
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const storedResult = sessionStorage.getItem("processingResult");
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
      } catch (error) {
        console.error("Failed to parse stored result:", error);
        setLocation("/");
      }
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  const handleProcessAnother = () => {
    sessionStorage.removeItem("processingResult");
    setLocation("/");
  };

  const handleCopyText = async () => {
    if (result?.extractedText) {
      try {
        await navigator.clipboard.writeText(result.extractedText);
        toast({
          title: "Text copied",
          description: "Extracted text has been copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Failed to copy text to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownloadResults = () => {
    if (!result) return;

    const content = `Document Processing Results
================================

Personal Information:
- Full Name: ${result.fullName}
- Age: ${result.age} years old
- Document: ${result.fileName}

Extracted Text:
${result.extractedText}

Generated on: ${new Date().toLocaleString()}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document-results-${result.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Results file has been downloaded.",
    });
  };

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Check className="text-emerald-600 text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Processing Complete</h2>
          <p className="text-slate-600">Your document has been successfully processed. Here are the results:</p>
        </div>

        <div className="space-y-6">
          {/* Personal Information Results */}
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <User className="mr-3 text-primary-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-500">Full Name</label>
                  <p className="text-lg font-semibold text-slate-800">{result.fullName}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-500">Calculated Age</label>
                  <p className="text-lg font-semibold text-slate-800">{result.age} years old</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Text Results */}
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <FileText className="mr-3 text-primary-500" />
                Extracted Text Content
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {result.extractedText || "No text could be extracted from the document."}
                </pre>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>{result.extractedText.length} characters extracted</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyText}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copy Text
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleProcessAnother}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 h-auto"
            >
              <Upload className="mr-2 h-5 w-5" />
              Process Another Document
            </Button>
            <Button
              onClick={handleDownloadResults}
              variant="outline"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 h-auto border-slate-300"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
