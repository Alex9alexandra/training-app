import type { Client } from "../domain/Client";
export class LocalClientRepo {
  private clients: Client[] = [];

  getAll() {
    return this.clients;
  }

  add(client: Client) {
    this.clients.push(client);
  }

  update(client: Client) {
    const index = this.clients.findIndex(c => c.id === client.id);
    if (index !== -1) this.clients[index] = client;
  }

  delete(id: number) {
    this.clients = this.clients.filter(c => c.id !== id);
  }

  clear() {
    this.clients = [];
  }
}

export const sharedRepo = new LocalClientRepo();