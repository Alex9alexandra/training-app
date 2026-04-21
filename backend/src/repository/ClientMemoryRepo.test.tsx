import { describe, it, expect, beforeEach } from "vitest";
import { ClientMemoryRepo } from "./ClientMemoryRepo";
import type { Client } from "../domain/Client";

describe("ClientMemoryRepo", () => {
  let repo: ClientMemoryRepo;

  beforeEach(() => {
    repo = new ClientMemoryRepo([]);
  });


  it("initializes with default data when no initial clients provided", () => {
    const freshRepo = new ClientMemoryRepo();

    expect(freshRepo.getAll().length).toBe(6);

    const client = freshRepo.getById(1);
    expect(client).not.toBeUndefined();
    expect(client!.name).toBe("Andrei Popescu");
  });

  it("initializes with provided clients when given", () => {
    const initial: Client[] = [
      {
        id: 1,
        name: "Custom Client",
        age: 25,
        workouts: [],
        measurements: []
      }
    ];

    const customRepo = new ClientMemoryRepo(initial);

    expect(customRepo.getAll()).toEqual(initial);
  });


  it("returns all clients", () => {
    const clients = repo.getAll();
    expect(clients.length).toBe(6);
  });

  it("returns client by id", () => {
    const client = repo.getById(1);
    expect(client).not.toBeUndefined();
    expect(client!.id).toBe(1);
  });

  it("returns undefined when client not found", () => {
    expect(repo.getById(999)).toBeUndefined();
  });


  it("adds and retrieves a client", () => {
    const newClient: Client = {
      id: 99,
      name: "Test Client",
      age: 30,
      workouts: [],
      measurements: []
    };

    repo.add(newClient);

    expect(repo.getById(99)).toEqual(newClient);
    expect(repo.getAll().length).toBe(7);
  });

  it("updates an existing client and returns true", () => {
    const client = repo.getById(1)!;

    const updated: Client = {
      ...client,
      name: "Updated Name"
    };

    const result = repo.update(updated);

    expect(result).toBe(true);
    expect(repo.getById(1)!.name).toBe("Updated Name");
  });

  it("returns false when updating non-existent client", () => {
    const client: Client = {
      id: 999,
      name: "Ghost",
      age: 40,
      workouts: [],
      measurements: []
    };

    expect(repo.update(client)).toBe(false);
  });

  it("replaces client completely on update", () => {
    const updated: Client = {
      id: 1,
      name: "Completely New",
      age: 99,
      workouts: [],
      measurements: []
    };

    repo.update(updated);

    expect(repo.getById(1)).toEqual(updated);
  });


  it("deletes a client and returns deleted client", () => {
    const deleted = repo.delete(1);

    expect(deleted).not.toBeNull();
    expect(deleted!.id).toBe(1);
    expect(repo.getById(1)).toBeUndefined();
  });

  it("returns null when deleting non-existent client", () => {
    expect(repo.delete(999)).toBeNull();
  });


  it("initial client has workouts and measurements", () => {
    const client = repo.getById(1)!;

    expect(client.workouts.length).toBeGreaterThan(0);
    expect(client.measurements.length).toBe(3);
  });

  it("workouts contain exercises", () => {
    const client = repo.getById(1)!;

    const workout = client.workouts[0];
    expect(workout).toBeDefined();
    expect(workout!.exercises.length).toBeGreaterThan(0);
  });

  it("measurement dates follow DD/MM/YYYY format", () => {
    const client = repo.getById(1)!;

    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;

    expect(client.measurements[0]!.date).toMatch(datePattern);
  });

  it("all clients have realistic ages (25–30)", () => {
    const clients = repo.getAll();

    clients.forEach(c => {
      expect(c.age).toBeGreaterThanOrEqual(25);
      expect(c.age).toBeLessThanOrEqual(30);
    });
  });
});