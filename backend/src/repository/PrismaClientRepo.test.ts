

import { describe, it, expect, vi, beforeEach } from "vitest";


vi.mock("@prisma/client", () => {
  const mockPrisma = {
    client: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },

    workout: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },

    exercise: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },

    measurement: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  };

  return {
    PrismaClient: class {
      client = mockPrisma.client;
      workout = mockPrisma.workout;
      exercise = mockPrisma.exercise;
      measurement = mockPrisma.measurement;
    },

    __mockPrisma: mockPrisma,
  };
});

import { PrismaClientRepo } from "./PrismaClientRepo";
import * as prismaModule from "@prisma/client";

const mockPrisma = (prismaModule as any).__mockPrisma;


const makeDate = (str = "2024-01-15") => new Date(str);

const formattedDate = "15/01/2024";

const rawExercise = {
  id: 10,
  name: "Squat",
  sets: 3,
  reps: 12,
  weight: 80,
};

const rawWorkout = {
  id: 5,
  name: "Leg Day",
  exercises: [rawExercise],
};

const rawMeasurement = {
  id: 1,
  height: 180,
  weight: 75,
  muscularMassPercent: 40,
  fatMassPercent: 15,
  boneMassPercent: 5,
  leanBodyMassPercent: 80,
  date: makeDate(),
};

const rawClient = {
  id: 1,
  name: "Alice",
  age: 30,
  workouts: [rawWorkout],
  measurements: [rawMeasurement],
};

const mappedExercise = {
  id: 10,
  name: "Squat",
  sets: 3,
  reps: 12,
  weight: 80,
};

const mappedWorkout = {
  id: 5,
  name: "Leg Day",
  exercises: [mappedExercise],
};

const mappedMeasurement = {
  id: 1,
  height: 180,
  weight: 75,
  muscularMassPercent: 40,
  fatMassPercent: 15,
  boneMassPercent: 5,
  leanBodyMassPercent: 80,
  date: formattedDate,
};

const mappedClient = {
  id: 1,
  name: "Alice",
  age: 30,
  workouts: [mappedWorkout],
  measurements: [mappedMeasurement],
};


describe("PrismaClientRepo", () => {
  let repo: PrismaClientRepo;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaClientRepo();
  });

  it("getAll throws", () => {
    expect(() => repo.getAll()).toThrow("Use getAllAsync");
  });

  it("getById throws", () => {
    expect(() => repo.getById(1)).toThrow("Use getByIdAsync");
  });

  it("add throws", () => {
    expect(() => repo.add({} as any)).toThrow("Use addAsync");
  });

  it("update throws", () => {
    expect(() => repo.update({} as any)).toThrow("Use updateAsync");
  });

  it("delete throws", () => {
    expect(() => repo.delete(1)).toThrow("Use deleteAsync");
  });


  it("getAllAsync returns all clients", async () => {
    mockPrisma.client.findMany.mockResolvedValueOnce([rawClient]);

    const result = await repo.getAllAsync();

    expect(result).toEqual([mappedClient]);
  });

  it("getAllAsync uses search filter", async () => {
    mockPrisma.client.findMany.mockResolvedValueOnce([]);

    await repo.getAllAsync("Alice");

    expect(mockPrisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          name: {
            contains: "Alice",
          },
        },
      })
    );
  });

  it("getAllAsync returns empty array", async () => {
    mockPrisma.client.findMany.mockResolvedValueOnce([]);

    const result = await repo.getAllAsync();

    expect(result).toEqual([]);
  });


  it("getByIdAsync returns mapped client", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce(rawClient);

    const result = await repo.getByIdAsync(1);

    expect(result).toEqual(mappedClient);
  });

  it("getByIdAsync returns undefined", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce(null);

    const result = await repo.getByIdAsync(999);

    expect(result).toBeUndefined();
  });

  it("addAsync creates client", async () => {
    mockPrisma.client.create.mockResolvedValueOnce(rawClient);

    const result = await repo.addAsync({
      id: 0,
      name: "Alice",
      age: 30,
      workouts: [],
      measurements: [],
    } as any);

    expect(result).toEqual(mappedClient);
  });


  it("updateAsync returns true", async () => {
    mockPrisma.client.update.mockResolvedValueOnce({});

    const result = await repo.updateAsync({
      id: 1,
      name: "Alice",
      age: 30,
    } as any);

    expect(result).toBe(true);
  });

  it("updateAsync returns false", async () => {
    mockPrisma.client.update.mockRejectedValueOnce(new Error());

    const result = await repo.updateAsync({
      id: 999,
    } as any);

    expect(result).toBe(false);
  });


  it("deleteAsync deletes client", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce(rawClient);

    mockPrisma.client.delete.mockResolvedValueOnce({});

    const result = await repo.deleteAsync(1);

    expect(result).toEqual(mappedClient);
  });

  it("deleteAsync returns null", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce(null);

    const result = await repo.deleteAsync(999);

    expect(result).toBeNull();
  });


  it("getWorkoutsAsync returns workouts", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce({
      id: 1,
    });

    mockPrisma.workout.findMany.mockResolvedValueOnce([
      rawWorkout,
    ]);

    const result = await repo.getWorkoutsAsync(1);

    expect(result).toEqual([mappedWorkout]);
  });

  it("getWorkoutsAsync returns null", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce(null);

    const result = await repo.getWorkoutsAsync(999);

    expect(result).toBeNull();
  });


  it("addWorkoutAsync creates workout", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce({
      id: 1,
    });

    mockPrisma.workout.create.mockResolvedValueOnce(
      rawWorkout
    );

    const result = await repo.addWorkoutAsync(
      1,
      {
        id: 0,
        name: "Leg Day",
        exercises: [rawExercise],
      } as any
    );

    expect(result).toEqual(mappedWorkout);
  });

  it("addWorkoutAsync returns null", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce(null);

    const result = await repo.addWorkoutAsync(
      999,
      {
        id: 0,
        name: "X",
        exercises: [],
      } as any
    );

    expect(result).toBeNull();
  });


  it("deleteWorkoutAsync deletes workout", async () => {
    mockPrisma.workout.findFirst.mockResolvedValueOnce(
      rawWorkout
    );

    mockPrisma.workout.delete.mockResolvedValueOnce({});

    const result = await repo.deleteWorkoutAsync(1, 5);

    expect(result).toEqual(mappedWorkout);
  });

  it("deleteWorkoutAsync returns null", async () => {
    mockPrisma.workout.findFirst.mockResolvedValueOnce(null);

    const result = await repo.deleteWorkoutAsync(
      1,
      999
    );

    expect(result).toBeNull();
  });

  it("addExerciseAsync creates exercise", async () => {
    mockPrisma.workout.findFirst.mockResolvedValueOnce(
      rawWorkout
    );

    mockPrisma.exercise.create.mockResolvedValueOnce(
      rawExercise
    );

    const result = await repo.addExerciseAsync(
      1,
      5,
      rawExercise as any
    );

    expect(result).toEqual(mappedExercise);
  });

  it("addExerciseAsync returns null", async () => {
    mockPrisma.workout.findFirst.mockResolvedValueOnce(null);

    const result = await repo.addExerciseAsync(
      1,
      999,
      rawExercise as any
    );

    expect(result).toBeNull();
  });

  it("deleteExerciseAsync deletes exercise", async () => {
    mockPrisma.workout.findFirst.mockResolvedValueOnce(
      rawWorkout
    );

    mockPrisma.exercise.findFirst.mockResolvedValueOnce(
      rawExercise
    );

    mockPrisma.exercise.delete.mockResolvedValueOnce({});

    const result = await repo.deleteExerciseAsync(
      1,
      5,
      10
    );

    expect(result).toEqual(mappedExercise);
  });

  it("deleteExerciseAsync returns null if workout missing", async () => {
    mockPrisma.workout.findFirst.mockResolvedValueOnce(null);

    const result = await repo.deleteExerciseAsync(
      1,
      5,
      10
    );

    expect(result).toBeNull();
  });

  it("deleteExerciseAsync returns null if exercise missing", async () => {
    mockPrisma.workout.findFirst.mockResolvedValueOnce(
      rawWorkout
    );

    mockPrisma.exercise.findFirst.mockResolvedValueOnce(
      null
    );

    const result = await repo.deleteExerciseAsync(
      1,
      5,
      10
    );

    expect(result).toBeNull();
  });


  it("getMeasurementsAsync returns measurements", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce({
      id: 1,
    });

    mockPrisma.measurement.findMany.mockResolvedValueOnce([
      rawMeasurement,
    ]);

    const result = await repo.getMeasurementsAsync(1);

    expect(result).toEqual([mappedMeasurement]);
  });

  it("getMeasurementsAsync returns null", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce(null);

    const result = await repo.getMeasurementsAsync(999);

    expect(result).toBeNull();
  });


  it("addMeasurementAsync creates measurement", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce({
      id: 1,
    });

    mockPrisma.measurement.create.mockResolvedValueOnce(
      rawMeasurement
    );

    const result = await repo.addMeasurementAsync(
      1,
      {
        ...mappedMeasurement,
        date: "2024-01-15",
      } as any
    );

    expect(result).toEqual(mappedMeasurement);
  });

  it("addMeasurementAsync returns null", async () => {
    mockPrisma.client.findUnique.mockResolvedValueOnce(null);

    const result = await repo.addMeasurementAsync(
      999,
      mappedMeasurement as any
    );

    expect(result).toBeNull();
  });


  it("deleteMeasurementAsync deletes measurement", async () => {
    mockPrisma.measurement.findFirst.mockResolvedValueOnce(
      rawMeasurement
    );

    mockPrisma.measurement.delete.mockResolvedValueOnce({});

    const result = await repo.deleteMeasurementAsync(
      1,
      1
    );

    expect(result).toEqual(mappedMeasurement);
  });

  it("deleteMeasurementAsync returns null", async () => {
    mockPrisma.measurement.findFirst.mockResolvedValueOnce(
      null
    );

    const result = await repo.deleteMeasurementAsync(
      1,
      999
    );

    expect(result).toBeNull();
  });


  it("getStatisticsAsync returns statistics", async () => {
    mockPrisma.client.findMany.mockResolvedValueOnce([
      {
        name: "Alice",
        workouts: [{ id: 1 }, { id: 2 }],
      },
      {
        name: "Bob",
        workouts: [{ id: 3 }],
      },
    ]);

    const result = await repo.getStatisticsAsync();

    expect(result).toEqual({
      totalClients: 2,
      mostActiveClient: {
        name: "Alice",
        workouts: 2,
      },
      averageWorkouts: 1.5,
      clientsActivity: [
        {
          name: "Alice",
          workouts: 2,
        },
        {
          name: "Bob",
          workouts: 1,
        },
      ],
    });
  });

  it("getStatisticsAsync handles empty array", async () => {
    mockPrisma.client.findMany.mockResolvedValueOnce([]);

    const result = await repo.getStatisticsAsync();

    expect(result).toEqual({
      totalClients: 0,
      mostActiveClient: {
        name: "",
        workouts: 0,
      },
      averageWorkouts: 0,
      clientsActivity: [],
    });
  });
});