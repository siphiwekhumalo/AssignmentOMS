import { processedDocuments, type ProcessedDocument, type InsertDocument } from "@shared/schema";

export interface IStorage {
  createDocument(document: InsertDocument): Promise<ProcessedDocument>;
  getDocument(id: number): Promise<ProcessedDocument | undefined>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, ProcessedDocument>;
  private currentId: number;

  constructor() {
    this.documents = new Map();
    this.currentId = 1;
  }

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

  async getDocument(id: number): Promise<ProcessedDocument | undefined> {
    return this.documents.get(id);
  }
}

export const storage = new MemStorage();
