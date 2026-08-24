import { Client } from '../types';
import { INITIAL_CLIENTS } from '../mock/clients';

const STORAGE_KEY = 'saas_clients_data';

class ClientService {
  private getStored(): Client[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return INITIAL_CLIENTS;
  }

  private saveStored(clients: Client[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch {
      // ignore
    }
  }

  async getClients(filter?: { search?: string; status?: string }): Promise<Client[]> {
    await new Promise((res) => setTimeout(res, 80));
    let list = this.getStored();

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    if (filter?.status && filter.status !== 'all') {
      list = list.filter((c) => c.status === filter.status);
    }

    return list;
  }

  async getClientById(id: string): Promise<Client | null> {
    await new Promise((res) => setTimeout(res, 50));
    const list = this.getStored();
    return list.find((c) => c.id === id) || null;
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'totalBilled' | 'amountPaid' | 'balance'>): Promise<Client> {
    await new Promise((res) => setTimeout(res, 120));
    const list = this.getStored();
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now().toString(36)}`,
      totalBilled: 0,
      amountPaid: 0,
      balance: 0,
      createdAt: new Date().toISOString(),
      recentDocuments: [],
    };
    list.unshift(newClient);
    this.saveStored(list);
    return newClient;
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    await new Promise((res) => setTimeout(res, 100));
    const list = this.getStored();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Client not found');
    list[index] = { ...list[index], ...updates };
    this.saveStored(list);
    return list[index];
  }

  async deleteClient(id: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, 100));
    let list = this.getStored();
    list = list.filter((c) => c.id !== id);
    this.saveStored(list);
    return true;
  }
}

export const clientService = new ClientService();
