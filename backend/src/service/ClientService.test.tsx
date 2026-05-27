import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClientService } from "./ClientService";
import type { PrismaClientRepo } from "../repository/PrismaClientRepo";

const mockRepo = {
  getAllAsync: vi.fn(),
  getByIdAsync: vi.fn(),
  addAsync: vi.fn(),
  updateAsync: vi.fn(),
  deleteAsync: vi.fn(),
  getWorkoutsAsync: vi.fn(),
  addWorkoutAsync: vi.fn(),
  deleteWorkoutAsync: vi.fn(),
  addExerciseAsync: vi.fn(),
  deleteExerciseAsync: vi.fn(),
  getMeasurementsAsync: vi.fn(),
  addMeasurementAsync: vi.fn(),
  deleteMeasurementAsync: vi.fn(),
  getStatisticsAsync: vi.fn(),
} as unknown as PrismaClientRepo;

describe("ClientService", () => {
  let service: ClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ClientService(mockRepo);
  });

  describe("getAllClients", () => {
    it("calls repo.getAllAsync with no search term by default", async () => {
      mockRepo.getAllAsync = vi.fn().mockResolvedValueOnce([]);
      await service.getAllClients();
      expect(mockRepo.getAllAsync).toHaveBeenCalledWith("");
    });

    it("calls repo.getAllAsync with provided search term", async () => {
      mockRepo.getAllAsync = vi.fn().mockResolvedValueOnce([]);
      await service.getAllClients("Alice");
      expect(mockRepo.getAllAsync).toHaveBeenCalledWith("Alice");
    });

    it("returns the result from the repo", async () => {
      const clients = [{ id: 1, name: "Alice" }];
      mockRepo.getAllAsync = vi.fn().mockResolvedValueOnce(clients);
      expect(await service.getAllClients()).toBe(clients);
    });
  });

  describe("getClient", () => {
    it("calls repo.getByIdAsync with the given id", async () => {
      mockRepo.getByIdAsync = vi.fn().mockResolvedValueOnce({ id: 1 });
      await service.getClient(1);
      expect(mockRepo.getByIdAsync).toHaveBeenCalledWith(1);
    });

    it("returns the result from the repo", async () => {
      const client = { id: 1, name: "Alice" };
      mockRepo.getByIdAsync = vi.fn().mockResolvedValueOnce(client);
      expect(await service.getClient(1)).toBe(client);
    });
  });

  describe("addClient", () => {
    it("calls repo.addAsync with the given client", async () => {
      const client = { id: 0, name: "Bob" } as any;
      mockRepo.addAsync = vi.fn().mockResolvedValueOnce({ id: 1, name: "Bob" });
      await service.addClient(client);
      expect(mockRepo.addAsync).toHaveBeenCalledWith(client);
    });

    it("returns the created client from the repo", async () => {
      const created = { id: 1, name: "Bob" };
      mockRepo.addAsync = vi.fn().mockResolvedValueOnce(created);
      expect(await service.addClient({} as any)).toBe(created);
    });
  });

  describe("updateClient", () => {
    it("calls repo.updateAsync with the given client", async () => {
      const client = { id: 1, name: "Alice Updated" } as any;
      mockRepo.updateAsync = vi.fn().mockResolvedValueOnce(true);
      await service.updateClient(client);
      expect(mockRepo.updateAsync).toHaveBeenCalledWith(client);
    });

    it("returns the result from the repo", async () => {
      mockRepo.updateAsync = vi.fn().mockResolvedValueOnce(false);
      expect(await service.updateClient({} as any)).toBe(false);
    });
  });

  describe("deleteClient", () => {
    it("calls repo.deleteAsync with the given id", async () => {
      mockRepo.deleteAsync = vi.fn().mockResolvedValueOnce({ id: 1 });
      await service.deleteClient(1);
      expect(mockRepo.deleteAsync).toHaveBeenCalledWith(1);
    });

    it("returns the deleted client from the repo", async () => {
      const deleted = { id: 1 };
      mockRepo.deleteAsync = vi.fn().mockResolvedValueOnce(deleted);
      expect(await service.deleteClient(1)).toBe(deleted);
    });
  });

  describe("getWorkouts", () => {
    it("calls repo.getWorkoutsAsync with the given clientId", async () => {
      mockRepo.getWorkoutsAsync = vi.fn().mockResolvedValueOnce([]);
      await service.getWorkouts(1);
      expect(mockRepo.getWorkoutsAsync).toHaveBeenCalledWith(1);
    });

    it("returns the result from the repo", async () => {
      const workouts = [{ id: 10 }];
      mockRepo.getWorkoutsAsync = vi.fn().mockResolvedValueOnce(workouts);
      expect(await service.getWorkouts(1)).toBe(workouts);
    });
  });

  describe("addWorkout", () => {
    it("calls repo.addWorkoutAsync with clientId and workout", async () => {
      const workout = { id: 0, name: "Leg Day", exercises: [] } as any;
      mockRepo.addWorkoutAsync = vi.fn().mockResolvedValueOnce({ id: 10 });
      await service.addWorkout(1, workout);
      expect(mockRepo.addWorkoutAsync).toHaveBeenCalledWith(1, workout);
    });

    it("returns the result from the repo", async () => {
      const created = { id: 10, name: "Leg Day" };
      mockRepo.addWorkoutAsync = vi.fn().mockResolvedValueOnce(created);
      expect(await service.addWorkout(1, {} as any)).toBe(created);
    });
  });

  describe("deleteWorkout", () => {
    it("calls repo.deleteWorkoutAsync with clientId and workoutId", async () => {
      mockRepo.deleteWorkoutAsync = vi.fn().mockResolvedValueOnce({ id: 10 });
      await service.deleteWorkout(1, 10);
      expect(mockRepo.deleteWorkoutAsync).toHaveBeenCalledWith(1, 10);
    });

    it("returns the result from the repo", async () => {
      mockRepo.deleteWorkoutAsync = vi.fn().mockResolvedValueOnce(null);
      expect(await service.deleteWorkout(1, 99)).toBeNull();
    });
  });

  describe("addExercise", () => {
    it("calls repo.addExerciseAsync with clientId, workoutId and exercise", async () => {
      const exercise = { id: 0, name: "Squat", sets: 3, reps: 10, weight: 80 };
      mockRepo.addExerciseAsync = vi.fn().mockResolvedValueOnce({ id: 101 });
      await service.addExercise(1, 10, exercise);
      expect(mockRepo.addExerciseAsync).toHaveBeenCalledWith(1, 10, exercise);
    });

    it("returns the result from the repo", async () => {
      const created = { id: 101, name: "Squat" };
      mockRepo.addExerciseAsync = vi.fn().mockResolvedValueOnce(created);
      expect(await service.addExercise(1, 10, {} as any)).toBe(created);
    });
  });

  describe("deleteExercise", () => {
    it("calls repo.deleteExerciseAsync with clientId, workoutId and exerciseId", async () => {
      mockRepo.deleteExerciseAsync = vi.fn().mockResolvedValueOnce({ id: 101 });
      await service.deleteExercise(1, 10, 101);
      expect(mockRepo.deleteExerciseAsync).toHaveBeenCalledWith(1, 10, 101);
    });

    it("returns the result from the repo", async () => {
      mockRepo.deleteExerciseAsync = vi.fn().mockResolvedValueOnce(null);
      expect(await service.deleteExercise(1, 10, 999)).toBeNull();
    });
  });

  describe("getMeasurements", () => {
    it("calls repo.getMeasurementsAsync with the given clientId", async () => {
      mockRepo.getMeasurementsAsync = vi.fn().mockResolvedValueOnce([]);
      await service.getMeasurements(1);
      expect(mockRepo.getMeasurementsAsync).toHaveBeenCalledWith(1);
    });

    it("returns the result from the repo", async () => {
      const measurements = [{ id: 1 }];
      mockRepo.getMeasurementsAsync = vi.fn().mockResolvedValueOnce(measurements);
      expect(await service.getMeasurements(1)).toBe(measurements);
    });
  });

  describe("addMeasurement", () => {
    it("calls repo.addMeasurementAsync with clientId and measurement", async () => {
      const measurement = { id: 0, height: 180, weight: 75 } as any;
      mockRepo.addMeasurementAsync = vi.fn().mockResolvedValueOnce({ id: 1 });
      await service.addMeasurement(1, measurement);
      expect(mockRepo.addMeasurementAsync).toHaveBeenCalledWith(1, measurement);
    });

    it("returns the result from the repo", async () => {
      const created = { id: 1, height: 180 };
      mockRepo.addMeasurementAsync = vi.fn().mockResolvedValueOnce(created);
      expect(await service.addMeasurement(1, {} as any)).toBe(created);
    });
  });

  describe("deleteMeasurement", () => {
    it("calls repo.deleteMeasurementAsync with clientId and measurementId", async () => {
      mockRepo.deleteMeasurementAsync = vi.fn().mockResolvedValueOnce({ id: 1 });
      await service.deleteMeasurement(1, 1);
      expect(mockRepo.deleteMeasurementAsync).toHaveBeenCalledWith(1, 1);
    });

    it("returns the result from the repo", async () => {
      mockRepo.deleteMeasurementAsync = vi.fn().mockResolvedValueOnce(null);
      expect(await service.deleteMeasurement(1, 99)).toBeNull();
    });
  });

  describe("getStatistics", () => {
    it("calls repo.getStatisticsAsync", async () => {
      mockRepo.getStatisticsAsync = vi.fn().mockResolvedValueOnce({});
      await service.getStatistics();
      expect(mockRepo.getStatisticsAsync).toHaveBeenCalledTimes(1);
    });

    it("returns the result from the repo", async () => {
      const stats = { totalClients: 5, averageWorkouts: 2 };
      mockRepo.getStatisticsAsync = vi.fn().mockResolvedValueOnce(stats);
      expect(await service.getStatistics()).toBe(stats);
    });
  });
});
