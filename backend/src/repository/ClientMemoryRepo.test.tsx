import { describe, it, expect, beforeEach } from "vitest";
import { ClientMemoryRepo } from "./ClientMemoryRepo";
import { type Client } from "../domain/Client";

describe("ClientMemoryRepo", () => {
  let repo: ClientMemoryRepo;

  beforeEach(() => {
    // Start with empty to test initialization or pass specific data
    repo = new ClientMemoryRepo([]);
  });

  it("initializes with default data when no initial clients provided", () => {
    const freshRepo = new ClientMemoryRepo();
    expect(freshRepo.getAll().length).toBeGreaterThan(0);
    expect(freshRepo.getById(1)?.name).toBe("Client 1");
  });

  it("adds and retrieves a client", () => {
    const newClient: Client = { id: 99, name: "Test", age: 30, workouts: [], measurements: [] };
    repo.add(newClient);
    expect(repo.getById(99)).toEqual(newClient);
  });

  it("updates an existing client and returns true", () => {
    const client: Client = { id: 1, name: "Updated", age: 25, workouts: [], measurements: [] };
    const success = repo.update(client);
    expect(success).toBe(true);
    expect(repo.getById(1)?.name).toBe("Updated");
  });

  it("returns false when updating non-existent client", () => {
    const client: Client = { id: 999, name: "Ghost", age: 0, workouts: [], measurements: [] };
    expect(repo.update(client)).toBe(false);
  });

  it("deletes a client and returns the deleted client", () => {
    const deleted = repo.delete(1);

    expect(deleted).not.toBeNull();
    expect(deleted!.id).toBe(1);
    expect(repo.getById(1)).toBeUndefined();
  });

  it("returns null when deleting non-existent client", () => {
    expect(repo.delete(999)).toBeNull();
  });

  it("generates correct date format in getPastDate (via initialization)", () => {
    const client = repo.getById(1);
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY
    expect(client?.measurements[0]!.date).toMatch(datePattern);
  });

  it("initializes with provided clients when given", () => {
    const initial: Client[] = [
      { id: 1, name: "Custom", age: 20, workouts: [], measurements: [] }
    ];

    const customRepo = new ClientMemoryRepo(initial);

    expect(customRepo.getAll()).toEqual(initial);
  });

  it("returns all clients", () => {
    const clients = repo.getAll();
    expect(Array.isArray(clients)).toBe(true);
  });

  it("returns undefined when client not found", () => {
    expect(repo.getById(999)).toBeUndefined();
  });

  it("generates different past dates", () => {
    const repo = new ClientMemoryRepo();
    const client = repo.getById(1)!;

    const d1 = client.measurements[0]!.date;
    const d2 = client.measurements[1]!.date;

    expect(d1).not.toEqual(d2);
  });

  it("initializes repository with correct structure", () => {
    const repo = new ClientMemoryRepo();

    const clients = repo.getAll();
    expect(clients.length).toBe(6);

    const client = clients[0];
    expect(client!.workouts.length).toBe(6);

    const workout = client!.workouts[0];
    expect(workout!.exercises.length).toBe(2);
  });

  it("replaces client completely on update", () => {
    const client: Client = { id: 1, name: "New", age: 99, workouts: [], measurements: [] };
    repo.update(client);

    const updated = repo.getById(1)!;
    expect(updated).toEqual(client);
  });
});