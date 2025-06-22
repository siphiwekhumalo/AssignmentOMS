import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { uploadSchema } from "@shared/schema";
import multer from "multer";
import Tesseract from "tesseract.js";
import pdfParse from "pdf-parse";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images (JPG, PNG) are allowed.'));
    }
  },
});

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  try {
    if (file.mimetype === 'application/pdf') {
      // Extract text from PDF
      const pdfData = await pdfParse(file.buffer);
      return pdfData.text;
    } else if (file.mimetype.startsWith('image/')) {
      // Extract text from image using Tesseract
      const result = await Tesseract.recognize(file.buffer, 'eng');
      return result.data.text;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Validate form data
      const validatedData = uploadSchema.parse(req.body);
      
      // Extract text from the uploaded file
      const extractedText = await extractTextFromFile(req.file);
      
      // Calculate age
      const age = calculateAge(validatedData.dateOfBirth);
      
      // Create full name
      const fullName = `${validatedData.firstName} ${validatedData.lastName}`;
      
      // Save to storage
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
      
      // Return the results
      res.json({
        id: document.id,
        fullName: document.fullName,
        age: document.age,
        extractedText: document.extractedText,
        fileName: document.fileName,
        fileType: document.fileType,
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Invalid form data',
          errors: error.errors 
        });
      }
      
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to process document' 
      });
    }
  });

  app.get('/api/document/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid document ID' });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      res.json(document);
    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({ message: 'Failed to retrieve document' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
