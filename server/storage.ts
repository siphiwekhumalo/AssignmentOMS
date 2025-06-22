/**
 * Storage layer for the Document Text Extractor application
 * 
 * Provides an abstraction layer for data persistence with multiple implementations:
 * - In-memory storage for development and testing
 * - Database storage interface for production use
 */

import { processedDocuments, type ProcessedDocument, type InsertDocument } from "@shared/schema";

/**
 * Storage interface defining the contract for data persistence operations
 * This allows for different storage implementations (memory, database, etc.)
 */
export interface IStorage {
  /**
   * Create a new document record in storage
   * @param document - Document data to store (without id and createdAt)
   * @returns Promise resolving to the created document with generated fields
   */
  createDocument(document: InsertDocument): Promise<ProcessedDocument>;
  
  /**
   * Retrieve a document by its unique identifier
   * @param id - Unique document identifier
   * @returns Promise resolving to the document or undefined if not found
   */
  getDocument(id: number): Promise<ProcessedDocument | undefined>;
}

/**
 * In-memory storage implementation for development and testing
 * Data is stored in memory and will be lost when the server restarts
 */
export class MemStorage implements IStorage {
  private documents: Map<number, ProcessedDocument>; // In-memory document store
  private currentId: number; // Auto-incrementing ID counter

  constructor() {
    this.documents = new Map();
    this.currentId = 1;
  }

  /**
   * Create and store a new document in memory
   * Generates a unique ID and creation timestamp
   */
  async createDocument(insertDocument: InsertDocument): Promise<ProcessedDocument> {
    const id = this.currentId++;
    const document: ProcessedDocument = {
      ...insertDocument,
      id,
      createdAt: new Date(),
    };
    this.documents.set(id, document);
    return document;
  }

  /**
   * Retrieve a document from memory by ID
   */
  async getDocument(id: number): Promise<ProcessedDocument | undefined> {
    return this.documents.get(id);
  }
}

// Global storage instance - using in-memory storage for simplicity
export const storage = new MemStorage();
