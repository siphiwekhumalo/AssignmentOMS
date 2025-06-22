/**
 * Database schema and validation types for the Document Text Extractor application
 * 
 * This file defines:
 * - Database table structure for processed documents
 * - Validation schemas for API requests and data insertion
 * - TypeScript types for type safety across the application
 */

import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Database table definition for storing processed documents
 * Contains user information, document metadata, and extracted text
 */
export const processedDocuments = pgTable("processed_documents", {
  id: serial("id").primaryKey(), // Auto-incrementing unique identifier
  firstName: text("first_name").notNull(), // User's first name
  lastName: text("last_name").notNull(), // User's last name
  dateOfBirth: text("date_of_birth").notNull(), // User's date of birth (YYYY-MM-DD format)
  fullName: text("full_name").notNull(), // Concatenated first and last name
  age: integer("age").notNull(), // Calculated age from date of birth
  extractedText: text("extracted_text").notNull(), // Text content extracted from uploaded file
  fileName: text("file_name").notNull(), // Original name of uploaded file
  fileType: text("file_type").notNull(), // MIME type of uploaded file
  createdAt: timestamp("created_at").defaultNow(), // Timestamp when record was created
});

/**
 * Schema for validating data when inserting new documents
 * Excludes auto-generated fields like id and createdAt
 */
export const insertDocumentSchema = createInsertSchema(processedDocuments).pick({
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  fullName: true,
  age: true,
  extractedText: true,
  fileName: true,
  fileType: true,
});

/**
 * Schema for validating user input from the upload form
 * Only includes fields that users need to provide
 */
export const uploadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

// TypeScript types derived from schemas for type safety
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ProcessedDocument = typeof processedDocuments.$inferSelect;
export type UploadData = z.infer<typeof uploadSchema>;
