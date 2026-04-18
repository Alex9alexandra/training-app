import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientService } from "./ClientService";

describe("Frontend ClientService", () => {
  let service: ClientService;

  beforeEach(() => {
    service = new ClientService();
    vi.clearAllMocks();
  });

  // 🔹 CLIENTS

  it("getAllClients calls correct endpoint and returns data", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: [], totalPages: 1, page: 1 }),
      })
    ) as any;

    const result = await service.getAllClients(1, 5);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients?page=1&limit=5"
    );
    expect(result).toEqual({ data: [], totalPages: 1, page: 1 });
  });

  it("getClient calls correct endpoint and returns client", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1 }),
      })
    ) as any;

    const result = await service.getClient(1);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients/1"
    );
    expect(result.id).toBe(1);
  });

  it("addClient sends POST with headers and body", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1 }),
      })
    ) as any;

    const client = { id: 1, name: "Test" } as any;

    const result = await service.addClient(client);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      }
    );

    expect(result.id).toBe(1);
  });

  it("updateClient sends PUT with headers and body", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      })
    ) as any;

    const client = { id: 1, name: "Updated" } as any;

    const result = await service.updateClient(client);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients/1",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      }
    );

    expect(result.success).toBe(true);
  });

  it("deleteClient sends DELETE and does not call json", async () => {
    const mockFetch = vi.fn(() => Promise.resolve({}));
    global.fetch = mockFetch as any;

    await service.deleteClient(1);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients/1",
      { method: "DELETE" }
    );
  });

  // 🔹 WORKOUTS

  it("addWorkout sends POST and returns workout", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 10 }),
      })
    ) as any;

    const workout = { id: 10, name: "W" } as any;

    const result = await service.addWorkout(1, workout);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients/1/workouts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workout),
      }
    );

    expect(result.id).toBe(10);
  });

  it("getWorkouts calls correct endpoint and returns data", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: [], totalPages: 1, page: 1 }),
      })
    ) as any;

    const result = await service.getWorkouts(1, 1, 5);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients/1/workouts?page=1&limit=5"
    );

    expect(result).toEqual({ data: [], totalPages: 1, page: 1 });
  });

  it("deleteWorkout sends DELETE request", async () => {
    global.fetch = vi.fn(() => Promise.resolve({})) as any;

    await service.deleteWorkout(1, 10);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients/1/workouts/10",
      { method: "DELETE" }
    );
  });

  // 🔹 EXERCISES

  it("addExercise sends POST and returns exercise", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 100 }),
      })
    ) as any;

    const exercise = { id: 100 } as any;

    const result = await service.addExercise(1, 10, exercise);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients/1/workouts/10/exercises",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exercise),
      }
    );

    expect(result.id).toBe(100);
  });

  it("deleteExercise sends DELETE request", async () => {
    global.fetch = vi.fn(() => Promise.resolve({})) as any;

    await service.deleteExercise(1, 10, 100);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/clients/1/workouts/10/exercises/100",
      { method: "DELETE" }
    );
  });

  // 🔹 EXTRA: ensure multiple calls don’t interfere

  it("handles multiple sequential calls correctly", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1 }),
      })
    ) as any;

    await service.getClient(1);
    await service.getClient(2);

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3000/clients/1"
    );

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/clients/2"
    );
  });
});