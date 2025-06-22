/**
 * API routes for the Document Text Extractor application
 * 
 * Handles:
 * - File upload and processing
 * - Text extraction from PDFs and images
 * - Age calculation from date of birth
 * - Document storage and retrieval
 */

import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { uploadSchema } from "@shared/schema";
import multer from "multer";
import Tesseract from "tesseract.js";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { z } from "zod";

/**
 * Configure multer middleware for handling file uploads
 * - Stores files in memory for processing
 * - Limits file size to 10MB
 * - Only allows PDF files and images (JPG, PNG)
 */
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory for immediate processing
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB maximum file size
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Only allow specific file types for security and compatibility
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only PDF and images (JPG, PNG) are allowed.'));
    }
  },
});

/**
 * Calculate a person's age based on their date of birth
 * Accounts for whether their birthday has occurred this year
 * 
 * @param dateOfBirth - Date string in YYYY-MM-DD format
 * @returns Age in years as an integer
 */
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Start with the difference in years
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Subtract a year if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Extract text content from uploaded files using appropriate parsing libraries
 * Supports PDF files and images (JPG, PNG)
 * 
 * @param file - Multer file object containing file data and metadata
 * @returns Promise resolving to extracted text content
 * @throws Error if file type is unsupported or extraction fails
 */
async function extractTextFromFile(file: any): Promise<string> {
  try {
    if (file.mimetype === 'application/pdf') {
      // Use pdf-parse library to extract text from PDF files
      const pdfData = await pdfParse(file.buffer);
      return pdfData.text;
    } else if (file.mimetype.startsWith('image/')) {
      // Use Tesseract.js OCR to extract text from images
      const result = await Tesseract.recognize(file.buffer, 'eng');
      return result.data.text;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error: any) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

/**
 * Register all API routes with the Express application
 * Sets up endpoints for file upload, processing, and document retrieval
 * 
 * @param app - Express application instance
 * @returns HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * POST /api/upload
   * Handles file upload, text extraction, and user data processing
   * 
   * Request body (multipart/form-data):
   * - file: PDF or image file
   * - firstName: User's first name
   * - lastName: User's last name
   * - dateOfBirth: Date in YYYY-MM-DD format
   * 
   * Response: JSON object with extracted data and metadata
   */
  app.post('/api/upload', upload.single('file'), async (req: Request & { file?: any }, res: Response) => {
    try {
      // Validate that a file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Validate user input using Zod schema
      const validatedData = uploadSchema.parse(req.body);
      
      // Extract text content from the uploaded file
      const extractedText = await extractTextFromFile(req.file);
      
      // Calculate user's current age from date of birth
      const age = calculateAge(validatedData.dateOfBirth);
      
      // Combine first and last name
      const fullName = `${validatedData.firstName} ${validatedData.lastName}`;
      
      // Save processed document to storage
      const document = await storage.createDocument({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        dateOfBirth: validatedData.dateOfBirth,
        fullName,
        age,
        extractedText,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
      });
      
      // Return processed results to client
      res.json({
        id: document.id,
        fullName: document.fullName,
        age: document.age,
        extractedText: document.extractedText,
        fileName: document.fileName,
        fileType: document.fileType,
      });
      
    } catch (error: any) {
      // Handle validation errors from Zod
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid form data',
          errors: error.errors 
        });
      }
      
      // Log error for debugging and return generic error message
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to process document' 
      });
    }
  });

  /**
   * GET /api/document/:id
   * Retrieve a previously processed document by its unique ID
   * 
   * Parameters:
   * - id: Document ID (integer)
   * 
   * Response: Complete document object or error message
   */
  app.get('/api/document/:id', async (req: Request, res: Response) => {
    try {
      // Parse and validate document ID from URL parameter
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid document ID' });
      }
      
      // Attempt to retrieve document from storage
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Return the complete document data
      res.json(document);
    } catch (error: any) {
      console.error('Get document error:', error);
      res.status(500).json({ message: 'Failed to retrieve document' });
    }
  });

  // Create and return HTTP server instance
  const httpServer = createServer(app);
  return httpServer;
}
