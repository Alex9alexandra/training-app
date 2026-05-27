import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../service/clientServiceInstance", () => ({
  clientService: {
    getWorkouts: vi.fn(),
    addWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
  },
}));

vi.mock("../validators/idValidators", () => ({
  validateId: vi.fn(),
}));

vi.mock("../validators/workoutValidators", () => ({
  validateWorkout: vi.fn(),
}));

import { getWorkouts, addWorkout, deleteWorkout } from "../controllers/workoutController";
import { validateId } from "../validators/idValidators";
import { validateWorkout } from "../validators/workoutValidators";
import { clientService } from "../service/clientServiceInstance";

const mockService = clientService as any;

describe("Workout Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { params: {}, query: {}, body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it("getWorkouts: returns 400 if clientId invalid", async () => {
    req.params = { clientId: "abc" };
    (validateId as any).mockReturnValue("invalid id");

    await getWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getWorkouts: returns 400 if page invalid", async () => {
    req.params = { clientId: "1" };
    req.query = { page: "-1", limit: "5" };
    (validateId as any).mockReturnValue(null);

    await getWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getWorkouts: returns 400 if limit invalid", async () => {
    req.params = { clientId: "1" };
    req.query = { page: "1", limit: "0" };
    (validateId as any).mockReturnValue(null);

    await getWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("getWorkouts: returns 404 if client not found", async () => {
    req.params = { clientId: "1" };
    req.query = { page: "1", limit: "5" };
    (validateId as any).mockReturnValue(null);
    mockService.getWorkouts.mockResolvedValueOnce(null);

    await getWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("getWorkouts: returns paginated workouts", async () => {
    req.params = { clientId: "1" };
    req.query = { page: "1", limit: "2" };
    (validateId as any).mockReturnValue(null);

    const workouts = [{ id: 1 }, { id: 2 }, { id: 3 }];
    mockService.getWorkouts.mockResolvedValueOnce(workouts);

    await getWorkouts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: 1 }, { id: 2 }],
      total: 3,
      page: 1,
      totalPages: 2,
    });
  });

  it("addWorkout: returns 400 if clientId invalid", async () => {
    req.params = { clientId: "abc" };
    (validateId as any).mockReturnValue("bad id");

    await addWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("addWorkout: returns 400 if workout invalid", async () => {
    req.params = { clientId: "1" };
    req.body = {};
    (validateId as any).mockReturnValue(null);
    (validateWorkout as any).mockReturnValue("invalid workout");

    await addWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("addWorkout: returns 404 if service returns null", async () => {
    req.params = { clientId: "1" };
    req.body = { name: "W1" };
    (validateId as any).mockReturnValue(null);
    (validateWorkout as any).mockReturnValue(null);
    mockService.addWorkout.mockResolvedValueOnce(null);

    await addWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("addWorkout: returns 201 with added workout", async () => {
    req.params = { clientId: "1" };
    req.body = { name: "W1" };
    const workout = { id: 10, name: "W1" };
    (validateId as any).mockReturnValue(null);
    (validateWorkout as any).mockReturnValue(null);
    mockService.addWorkout.mockResolvedValueOnce(workout);

    await addWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(workout);
  });

  it("deleteWorkout: returns 400 if clientId invalid", async () => {
    req.params = { clientId: "abc", workoutId: "1" };
    (validateId as any).mockReturnValue("bad");

    await deleteWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deleteWorkout: returns 400 if workoutId invalid", async () => {
    req.params = { clientId: "1", workoutId: "abc" };
    (validateId as any)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("bad workout");

    await deleteWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deleteWorkout: returns 404 if service returns null", async () => {
    req.params = { clientId: "1", workoutId: "10" };
    (validateId as any).mockReturnValue(null);
    mockService.deleteWorkout.mockResolvedValueOnce(null);

    await deleteWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("deleteWorkout: returns 200 with deleted workout", async () => {
    req.params = { clientId: "1", workoutId: "10" };
    const deleted = { id: 10, name: "W1" };
    (validateId as any).mockReturnValue(null);
    mockService.deleteWorkout.mockResolvedValueOnce(deleted);

    await deleteWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });
});
