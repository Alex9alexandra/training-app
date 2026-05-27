import { describe, it, expect, beforeEach } from "vitest";
import { LocalClientRepo, sharedRepo } from "./LocalClientRepo";

describe("LocalClientRepo", () => {
  let repo: LocalClientRepo;

  beforeEach(() => {
    repo = new LocalClientRepo();
  });

  it("returns empty array initially", () => {
    expect(repo.getAll()).toEqual([]);
  });

  it("adds a client", () => {
    repo.add({ id: 1, name: "Alice" } as any);

    expect(repo.getAll()).toEqual([{ id: 1, name: "Alice" }]);
  });

  it("updates existing client", () => {
    repo.add({ id: 1, name: "Alice" } as any);

    repo.update({ id: 1, name: "Alice Updated" } as any);

    expect(repo.getAll()).toEqual([
      { id: 1, name: "Alice Updated" },
    ]);
  });

  it("does nothing when updating non-existing client", () => {
    repo.update({ id: 999, name: "Ghost" } as any);

    expect(repo.getAll()).toEqual([]);
  });

  it("deletes client by id", () => {
    repo.add({ id: 1, name: "Alice" } as any);
    repo.add({ id: 2, name: "Bob" } as any);

    repo.delete(1);

    expect(repo.getAll()).toEqual([{ id: 2, name: "Bob" }]);
  });

  it("clear removes all clients", () => {
    repo.add({ id: 1, name: "Alice" } as any);

    repo.clear();

    expect(repo.getAll()).toEqual([]);
  });

  it("sharedRepo behaves as singleton state holder", () => {
    sharedRepo.clear();

    sharedRepo.add({ id: 1, name: "Shared" } as any);

    expect(sharedRepo.getAll()).toEqual([
      { id: 1, name: "Shared" },
    ]);
  });

  it("getAll returns reference (state mutation check)", () => {
    repo.add({ id: 1, name: "Alice" } as any);

    const result = repo.getAll();

    result.push({ id: 2, name: "Injected" } as any);

    expect(repo.getAll().length).toBe(2);
  });
});