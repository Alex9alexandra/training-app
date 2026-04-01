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
    expect(freshRepo.getById(1)?.name).toBe("Ana");
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

  it("deletes a client and returns true", () => {
    const success = repo.delete(1);
    expect(success).toBe(true);
    expect(repo.getById(1)).toBeUndefined();
  });

  it("returns false when deleting non-existent client", () => {
    expect(repo.delete(999)).toBe(false);
  });

  it("generates correct date format in getPastDate (via initialization)", () => {
    const client = repo.getById(1);
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/; // DD/MM/YYYY
    expect(client?.measurements[0].date).toMatch(datePattern);
  });
});