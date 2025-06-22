import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const processedDocuments = pgTable("processed_documents", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  extractedText: text("extracted_text").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const uploadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ProcessedDocument = typeof processedDocuments.$inferSelect;
export type UploadData = z.infer<typeof uploadSchema>;
