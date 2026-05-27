import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClientService } from "./ClientService";
import { sharedRepo } from "../repository/LocalClientRepo";

const getMockClient = () => ({
  id: 1,
  name: "John",
  age: 25,
  workouts: [
    {
      id: 10,
      name: "Workout A",
      exercises: [
        { id: 100, name: "Pushups", sets: 3, reps: 10, weight: 20 }
      ]
    }
  ],
  measurements: []
});

describe("Frontend ClientService", () => {
  let service: ClientService;

  beforeEach(() => {
    vi.restoreAllMocks();
    sharedRepo.clear();
    service = new ClientService();
  });


  it("getAllClients returns data from server", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [], totalPages: 1, page: 1 }),
      })
    ) as any;

    const result = await service.getAllClients(1, 5);
    expect(result).toEqual({ data: [], totalPages: 1, page: 1 });
  });

  it("getAllClients falls back to local repo when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    const result = await service.getAllClients(1, 5);
    expect(result.data.length).toBe(1);
  });

  it("getAllClients falls back to local repo when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const result = await service.getAllClients(1, 5);
    expect(result.data.length).toBe(1);
  });

  it("getAllClients paginates correctly from local repo", async () => {
    sharedRepo.add(getMockClient());
    sharedRepo.add({ ...getMockClient(), id: 2, name: "Jane" });
    sharedRepo.add({ ...getMockClient(), id: 3, name: "Bob" });
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const result = await service.getAllClients(2, 2);
    expect(result.data.length).toBe(1);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(2);
  });


  it("getClient returns client from server", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(getMockClient()),
      })
    ) as any;

    const result = await service.getClient(1);
    expect(result.id).toBe(1);
  });

  it("getClient falls back to local repo when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    const result = await service.getClient(1);
    expect(result.name).toBe("John");
  });

  it("getClient falls back to local repo when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const result = await service.getClient(1);
    expect(result.id).toBe(1);
  });

  it("getClient throws when client not found in local repo", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.getClient(999)).rejects.toThrow("Client not found in local repo");
  });


  it("addClient returns server response on success", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 5 }) })
    ) as any;

    const res = await service.addClient({ id: 5 } as any);
    expect(res.id).toBe(5);
  });

  it("addClient saves locally and queues operation when server returns !ok", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    const client = { id: 99, name: "Offline User", workouts: [], measurements: [] } as any;
    const res = await service.addClient(client);

    expect(res.id).toBe(99);
    expect(sharedRepo.getAll().find(c => c.id === 99)).toBeDefined();
  });

  it("addClient saves locally and queues operation when offline", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const client = { id: 7, name: "Offline", workouts: [], measurements: [] } as any;
    const res = await service.addClient(client);

    expect(res.id).toBe(7);
    expect(sharedRepo.getAll().find(c => c.id === 7)).toBeDefined();
  });


  it("updateClient returns server response on success", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ name: "New" }) })
    ) as any;

    const res = await service.updateClient({ id: 1, name: "New" } as any);
    expect(res.name).toBe("New");
  });

  it("updateClient updates locally and queues operation when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    const updated = { ...getMockClient(), name: "Updated" } as any;
    const res = await service.updateClient(updated);

    expect(res.name).toBe("Updated");
  });

  it("updateClient updates locally and queues operation when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const updated = { ...getMockClient(), name: "Offline Updated" } as any;
    const res = await service.updateClient(updated);

    expect(res.name).toBe("Offline Updated");
  });


  it("deleteClient calls server on success", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as any;

    await service.deleteClient(1);
    expect(fetch).toHaveBeenCalled();
  });

  it("deleteClient deletes locally and queues operation when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    await service.deleteClient(1);
    expect(sharedRepo.getAll().find(c => c.id === 1)).toBeUndefined();
  });

  it("deleteClient deletes locally and queues operation when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await service.deleteClient(1);
    expect(sharedRepo.getAll().find(c => c.id === 1)).toBeUndefined();
  });


  it("addWorkout returns server response on success", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 20, name: "Legs", exercises: [] }) })
    ) as any;

    const res = await service.addWorkout(1, { id: 20, name: "Legs", exercises: [] } as any);
    expect(res.id).toBe(20);
  });

  it("addWorkout saves locally when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    const res = await service.addWorkout(1, { id: 20, name: "Legs", exercises: [] } as any);
    expect(res.id).toBe(20);
    expect(sharedRepo.getAll()[0].workouts.length).toBe(2);
  });

  it("addWorkout adds workout locally when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const result = await service.addWorkout(1, { id: 20, name: "Legs", exercises: [] } as any);
    expect(sharedRepo.getAll()[0].workouts.length).toBe(2);
    expect(result.id).toBe(20);
  });

  it("addWorkout throws when client not found in local repo offline", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.addWorkout(999, {} as any)).rejects.toThrow("Client not found in local repo");
  });


  it("getWorkouts returns data from server", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [], totalPages: 1, page: 1 }),
      })
    ) as any;

    const result = await service.getWorkouts(1, 1, 5);
    expect(result).toEqual({ data: [], totalPages: 1, page: 1 });
  });

  it("getWorkouts falls back to local repo when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    const result = await service.getWorkouts(1, 1, 5);
    expect(result.data.length).toBe(1);
  });

  it("getWorkouts falls back to local repo when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const result = await service.getWorkouts(1, 1, 5);
    expect(result.data.length).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("getWorkouts throws when client not found in local repo", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.getWorkouts(999, 1, 5)).rejects.toThrow("Client not found in local repo");
  });


  it("deleteWorkout calls server on success", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as any;

    await service.deleteWorkout(1, 10);
    expect(fetch).toHaveBeenCalled();
  });

  it("deleteWorkout removes workout locally when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    await service.deleteWorkout(1, 10);
    expect(sharedRepo.getAll()[0].workouts.length).toBe(0);
  });

  it("deleteWorkout removes workout locally when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await service.deleteWorkout(1, 10);
    expect(sharedRepo.getAll()[0].workouts.length).toBe(0);
  });

  it("deleteWorkout does nothing when client not found in local repo", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.deleteWorkout(999, 10)).resolves.toBeUndefined();
  });


  it("addExercise returns server response on success", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 200 }) })
    ) as any;

    const res = await service.addExercise(1, 10, { id: 200 } as any);
    expect(res.id).toBe(200);
  });

  it("addExercise falls back locally when server returns !ok with message", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Validation failed" }),
      })
    ) as any;

    const res = await service.addExercise(1, 10, { id: 200 } as any);
    expect(res.id).toBe(200);
    expect(sharedRepo.getAll()[0].workouts[0].exercises.length).toBe(2);
  });

  it("addExercise falls back locally when server returns !ok without message", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    ) as any;

    const res = await service.addExercise(1, 10, { id: 201 } as any);
    expect(res.id).toBe(201);
  });

  it("addExercise adds exercise locally when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await service.addExercise(1, 10, { id: 200 } as any);
    expect(sharedRepo.getAll()[0].workouts[0].exercises.length).toBe(2);
  });

  it("addExercise throws when client not found in local repo", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.addExercise(999, 10, {} as any)).rejects.toThrow("Client not found in local repo");
  });

  it("addExercise throws when workout not found in local repo", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.addExercise(1, 999, {} as any)).rejects.toThrow("Workout not found in local repo");
  });


  it("deleteExercise calls server on success", async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true })) as any;

    await service.deleteExercise(1, 10, 100);
    expect(fetch).toHaveBeenCalled();
  });

  it("deleteExercise removes exercise locally when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    await service.deleteExercise(1, 10, 100);
    expect(sharedRepo.getAll()[0].workouts[0].exercises.length).toBe(0);
  });

  it("deleteExercise removes exercise locally when offline", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await service.deleteExercise(1, 10, 100);
    expect(sharedRepo.getAll()[0].workouts[0].exercises.length).toBe(0);
  });

  it("deleteExercise does nothing when client not found in local repo", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.deleteExercise(999, 10, 100)).resolves.toBeUndefined();
  });

  it("deleteExercise does nothing when workout not found in local repo", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.deleteExercise(1, 999, 100)).resolves.toBeUndefined();
  });


  it("getStatistics returns data from server", async () => {
    const mockStats = { totalClients: 1, averageWorkouts: 5 };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats),
      })
    ) as any;

    const result = await service.getStatistics();
    expect(result.totalClients).toBe(1);
  });

  it("getStatistics falls back when server returns !ok", async () => {
    sharedRepo.add(getMockClient());
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    ) as any;

    const result = await service.getStatistics();
    expect(result.totalClients).toBe(1);
  });

  it("getStatistics calculates correctly when offline", async () => {
    sharedRepo.add(getMockClient()); 
    sharedRepo.add({
      id: 2, name: "Jane", workouts: [{ id: 11, exercises: [] }, { id: 12, exercises: [] }]
    } as any); 

    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const result = await service.getStatistics();

    expect(result.totalClients).toBe(2);
    expect(result.averageWorkouts).toBe(1.5); 
    expect(result.mostActiveClient.name).toBe("Jane");
    expect(result.clientsActivity.length).toBe(2);
  });

  it("getStatistics handles empty repo offline", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const result = await service.getStatistics();
    expect(result.totalClients).toBe(0);
    expect(result.averageWorkouts).toBe(0);
  });

  it("getMeasurements returns data from server", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, value: 70 }]),
      })
    ) as any;

    const res = await service.getMeasurements(1);

    expect(res).toEqual([{ id: 1, value: 70 }]);
  });

  it("getMeasurements falls back to local repo when server returns !ok", async () => {
    sharedRepo.add(getMockClient());

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: async () => ({}),
      })
    ) as any;

    const res = await service.getMeasurements(1);

    expect(res).toEqual([]);
  });

  it("getMeasurements falls back to local repo when offline", async () => {
    sharedRepo.add(getMockClient());

    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    const res = await service.getMeasurements(1);

    expect(res).toEqual([]);
  });

  it("getMeasurements throws when client not found locally", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(service.getMeasurements(999)).rejects.toThrow(
      "Client not found"
    );
  });

  it("addMeasurement returns server response on success", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, value: 80 }),
      })
    ) as any;

    const res = await service.addMeasurement(1, {
      id: 1,
      value: 80,
    } as any);

    expect(res.id).toBe(1);
  });

  it("addMeasurement throws when server returns !ok", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as any;

    await expect(
      service.addMeasurement(1, { id: 1 } as any)
    ).rejects.toThrow("Failed to add measurement");
  });

  it("addMeasurement fails when offline (no catch handling)", async () => {
    global.fetch = vi.fn(() => Promise.reject("offline")) as any;

    await expect(
      service.addMeasurement(1, { id: 1 } as any)
    ).rejects.toBeDefined();
  });
});
