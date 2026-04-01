import type { Client } from "../domain/Client";

export interface IClientRepo {
  getAll(): Client[];
  getById(id: number): Client | undefined;
  add(client: Client): void;
  update(client: Client): boolean;
  delete(id: number): boolean;
}