/**
 * Upload page component for the Document Text Extractor application
 * 
 * Features:
 * - Drag and drop file upload interface
 * - Form validation for user personal information
 * - File type and size validation
 * - Real-time processing feedback
 * - Navigation to results page upon completion
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CloudUpload, FolderOpen, X, FileText, Image, Loader2 } from "lucide-react";
import { uploadSchema, type UploadData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";

/**
 * Interface for the API response after successful document processing
 */
interface ProcessingResult {
  id: number;
  fullName: string;
  age: number;
  extractedText: string;
  fileName: string;
  fileType: string;
}

/**
 * Main upload page component
 * Handles file selection, form validation, and document processing
 */
export default function UploadPage() {
  // Component state management
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Currently selected file
  const [isDragOver, setIsDragOver] = useState(false); // Drag and drop visual feedback
  const [, setLocation] = useLocation(); // Navigation hook
  const { toast } = useToast(); // Toast notification system

  // Form setup with validation schema
  const form = useForm<UploadData>({
    resolver: zodResolver(uploadSchema), // Zod validation integration
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
  });

  /**
   * React Query mutation for handling file upload and processing
   * Handles the API request and response state management
   */
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadData & { file: File }) => {
      // Create FormData for multipart file upload
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("dateOfBirth", data.dateOfBirth);

      // Send request to backend API
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json() as Promise<ProcessingResult>;
    },
    // Success handler - navigate to results page
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: "Document processed successfully!",
      });
      // Store result in sessionStorage for the results page
      sessionStorage.setItem("processingResult", JSON.stringify(result));
      setLocation("/results");
    },
    // Error handler - show error notification
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process document",
        variant: "destructive",
      });
    },
  });

  /**
   * Handle file selection with validation
   * Checks file type and size before accepting
   */
  const handleFileSelect = (file: File) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files and images (PNG, JPG, JPEG) are supported.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // File is valid, update state
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const onSubmit = (data: UploadData) => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to process.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ ...data, file: selectedFile });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <FileText className="text-red-500 text-xl" />;
    }
    return <Image className="text-blue-500 text-xl" />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Extract Text from Documents</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Upload a PDF or image file and provide your information to extract text content and calculate your age.
          </p>
        </div>

        {uploadMutation.isPending ? (
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Loader2 className="animate-spin w-12 h-12 text-primary-500 mx-auto" />
                <h3 className="text-lg font-semibold text-slate-800">Processing Document...</h3>
                <p className="text-slate-600">Extracting text content from your file. This may take a few moments.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Document File</Label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                      isDragOver
                        ? "border-primary-400 bg-primary-50"
                        : "border-slate-300 hover:border-primary-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <CloudUpload className="text-slate-500 text-2xl" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-slate-700">Drop your file here or click to browse</p>
                        <p className="text-sm text-slate-500 mt-1">Supports PDF files and images (PNG, JPG, JPEG)</p>
                      </div>
                      <Button type="button" variant="outline" className="bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileInputChange}
                    />
                  </div>

                  {/* File Preview Section */}
                  {selectedFile && (
                    <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(selectedFile.type)}
                        <div>
                          <p className="font-medium text-slate-800">{selectedFile.name}</p>
                          <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Personal Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      {...form.register("firstName")}
                      className="focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      {...form.register("lastName")}
                      className="focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                    className="focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {form.formState.errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{form.formState.errors.dateOfBirth.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 h-auto"
                    disabled={uploadMutation.isPending}
                  >
                    <CloudUpload className="mr-2 h-5 w-5" />
                    Process Document
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
