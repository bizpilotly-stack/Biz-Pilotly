import { BusinessDocument, DocumentType, DocumentStatus } from '../types';
import { INITIAL_DOCUMENTS } from '../mock/documents';

const STORAGE_KEY = 'saas_documents_data';

class DocumentService {
  private getStored(): BusinessDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return INITIAL_DOCUMENTS;
  }

  private saveStored(docs: BusinessDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch {
      // ignore
    }
  }

  async getDocuments(filter?: {
    type?: DocumentType | 'all';
    status?: DocumentStatus | 'all';
    search?: string;
  }): Promise<BusinessDocument[]> {
    await new Promise((res) => setTimeout(res, 80));
    let list = this.getStored();

    if (filter?.type && filter.type !== 'all') {
      list = list.filter((d) => d.type === filter.type);
    }

    if (filter?.status && filter.status !== 'all') {
      list = list.filter((d) => d.status === filter.status);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.documentNumber.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.client.name.toLowerCase().includes(q) ||
          (d.client.company && d.client.company.toLowerCase().includes(q))
      );
    }

    return list;
  }

  async getDocumentById(id: string): Promise<BusinessDocument | null> {
    await new Promise((res) => setTimeout(res, 50));
    const list = this.getStored();
    return list.find((d) => d.id === id) || null;
  }

  async saveDocument(doc: BusinessDocument): Promise<BusinessDocument> {
    await new Promise((res) => setTimeout(res, 120));
    const list = this.getStored();
    const index = list.findIndex((d) => d.id === doc.id);
    const updated = {
      ...doc,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }

    this.saveStored(list);
    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 100));
    let list = this.getStored();
    list = list.filter((d) => d.id !== id);
    this.saveStored(list);
    return true;
  }

  async updateStatus(id: string, status: DocumentStatus): Promise<BusinessDocument> {
    await new Promise((res) => setTimeout(res, 80));
    const list = this.getStored();
    const doc = list.find((d) => d.id === id);
    if (!doc) throw new Error('Document not found');
    doc.status = status;
    doc.updatedAt = new Date().toISOString();
    this.saveStored(list);
    return doc;
  }
}

export const documentService = new DocumentService();
