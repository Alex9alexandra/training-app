import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClientService } from "./ClientService";
import { type IClientRepo } from "../../src/repository/IClientRepo";

describe("ClientService", () => {
  let service: ClientService;
  let mockRepo: IClientRepo;

  beforeEach(() => {
    mockRepo = {
      getAll: vi.fn(),
      getById: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;
    service = new ClientService(mockRepo);
  });

  it("adds a workout to a client correctly", () => {
    const mockClient = { id: 1, workouts: [] };
    vi.mocked(mockRepo.getById).mockReturnValue(mockClient as any);

    const workout = { id: 10, name: "Morning Run", exercises: [] };
    const result = service.addWorkout(1, workout as any);

    expect(result).not.toBeNull();
    expect(mockClient.workouts).toContain(workout);
  });

  it("returns false when adding workout to non-existent client", () => {
    vi.mocked(mockRepo.getById).mockReturnValue(undefined);
    expect(service.addWorkout(999, {} as any)).toBeNull();
  });

  it("adds an exercise to a specific workout", () => {
    const mockClient = { 
      id: 1, 
      workouts: [{ id: 10, name: "W1", exercises: [] }] 
    };
    vi.mocked(mockRepo.getById).mockReturnValue(mockClient as any);

    const exercise = { id: 101, name: "Pushups", sets: 3, reps: 10, weight: 0 };
    const result = service.addExercise(1, 10, exercise);

    expect(result).not.toBeNull();
    expect(mockClient.workouts[0]!.exercises[0]).toEqual(exercise);
  });

  it("deletes an exercise correctly", () => {
    const exercise = { id: 101, name: "Pushups" };
    const mockClient = { 
      id: 1, 
      workouts: [{ id: 10, exercises: [exercise] }] 
    };
    vi.mocked(mockRepo.getById).mockReturnValue(mockClient as any);

    const result = service.deleteExercise(1, 10, 101);
    expect(result).not.toBeNull();
    expect(mockClient.workouts[0]!.exercises.length).toBe(0);
  });

  it("returns false if workout not found during exercise deletion", () => {
    vi.mocked(mockRepo.getById).mockReturnValue({ id: 1, workouts: [] } as any);
    expect(service.deleteExercise(1, 99, 101)).toBeNull();
  });
  
  it("deletes a workout correctly", () => {
    const mockClient = { id: 1, workouts: [{ id: 10 }] };
    vi.mocked(mockRepo.getById).mockReturnValue(mockClient as any);
    
    const result = service.deleteWorkout(1, 10);
    expect(result).not.toBeNull();
    expect(mockClient.workouts.length).toBe(0);
  });


  it("gets all clients from repository (Line 12)", () => {
    const mockClients = [{ id: 1, name: "Alice" }];
    vi.mocked(mockRepo.getAll).mockReturnValue(mockClients as any);

    const result = service.getAllClients();
    
    expect(result).toEqual(mockClients);
    expect(mockRepo.getAll).toHaveBeenCalled();
  });

  it("adds a new client (Line 13)", () => {
    const newClient = { id: 2, name: "Bob", workouts: [] };
    service.addClient(newClient as any);
    
    expect(mockRepo.add).toHaveBeenCalledWith(newClient);
  });

  it("updates an existing client (Line 15)", () => {
    const updatedClient = { id: 1, name: "Alice Updated" };
    service.updateClient(updatedClient as any);
    
    expect(mockRepo.update).toHaveBeenCalledWith(updatedClient);
  });

  it("deletes a client by id (Line 16)", () => {
    service.deleteClient(1);
    
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });

  it("returns false if client not found during workout deletion", () => {
    vi.mocked(mockRepo.getById).mockReturnValue(undefined);
    expect(service.deleteWorkout(1, 10)).toBeNull();
  });

  it("returns false if client not found during exercise addition", () => {
    vi.mocked(mockRepo.getById).mockReturnValue(undefined);
    expect(service.addExercise(1, 10, {} as any)).toBeNull();
  });

  it("returns null if exercise not found during deletion", () => {
    const mockClient = { 
      id: 1, 
      workouts: [{ id: 10, exercises: [] }] 
    };
    vi.mocked(mockRepo.getById).mockReturnValue(mockClient as any);

    const result = service.deleteExercise(1, 10, 999);
    expect(result).toBeNull();
  });

  it("returns null if workout not found during exercise addition", () => {
    const mockClient = { id: 1, workouts: [] };
    vi.mocked(mockRepo.getById).mockReturnValue(mockClient as any);

    const result = service.addExercise(1, 999, {} as any);
    expect(result).toBeNull();
  });

  it("gets workouts for a client", () => {
    const mockClient = { id: 1, workouts: [{ id: 10 }] };
    vi.mocked(mockRepo.getById).mockReturnValue(mockClient as any);

    const result = service.getWorkouts(1);
    expect(result).toEqual(mockClient.workouts);
  });

  it("returns undefined if client not found when getting workouts", () => {
    vi.mocked(mockRepo.getById).mockReturnValue(undefined);

    const result = service.getWorkouts(1);
    expect(result).toBeUndefined();
  });

  it("gets a client by id", () => {
    const client = { id: 1 };
    vi.mocked(mockRepo.getById).mockReturnValue(client as any);

    const result = service.getClient(1);
    expect(result).toEqual(client);
  });
});