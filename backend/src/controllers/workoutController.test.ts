import { describe, it, expect, vi, beforeEach } from "vitest";


vi.mock("../service/clientServiceInstance", () => {
  return {
    clientService: {
      getWorkouts: vi.fn(),
      addWorkout: vi.fn(),
      deleteWorkout: vi.fn(),
    }
  };
});


vi.mock("../validators/idValidators", () => ({
  validateId: vi.fn(),
}));

vi.mock("../validators/workoutValidators", () => ({
  validateWorkout: vi.fn(),
}));

import {
  getWorkouts,
  addWorkout,
  deleteWorkout,
} from "../controllers/workoutController";

import { validateId } from "../validators/idValidators";
import { validateWorkout } from "../validators/workoutValidators";
import { clientService } from "../service/clientServiceInstance";

const mockService = clientService as any;
describe("Workout Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {},
      query: {},
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  // ---------------- GET WORKOUTS ----------------

  it("returns 400 if clientId invalid", () => {
    req.params = { clientId: "abc" };
    (validateId as any).mockReturnValue("invalid id");

    getWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if page invalid", () => {
    req.params = { clientId: "1" };
    req.query = { page: "-1", limit: "5" };

    (validateId as any).mockReturnValue(null);

    getWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if limit invalid", () => {
    req.params = { clientId: "1" };
    req.query = { page: "1", limit: "0" };

    (validateId as any).mockReturnValue(null);

    getWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 if workouts not found", () => {
    req.params = { clientId: "1" };
    req.query = { page: "1", limit: "5" };

    (validateId as any).mockReturnValue(null);
    mockService.getWorkouts.mockReturnValue(null);

    getWorkouts(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns paginated workouts (success path)", () => {
    req.params = { clientId: "1" };
    req.query = { page: "1", limit: "2" };

    (validateId as any).mockReturnValue(null);

    const workouts = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ];

    mockService.getWorkouts.mockReturnValue(workouts);

    getWorkouts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: workouts.slice(0, 2),
      total: 3,
      page: 1,
      totalPages: 2,
    });
  });

  // ---------------- ADD WORKOUT ----------------

  it("returns 400 if clientId invalid", () => {
    req.params = { clientId: "abc" };
    (validateId as any).mockReturnValue("bad id");

    addWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if workout invalid", () => {
    req.params = { clientId: "1" };
    req.body = {};

    (validateId as any).mockReturnValue(null);
    (validateWorkout as any).mockReturnValue("invalid workout");

    addWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 if service fails to add workout", () => {
    req.params = { clientId: "1" };
    req.body = { name: "W1" };

    (validateId as any).mockReturnValue(null);
    (validateWorkout as any).mockReturnValue(null);
    mockService.addWorkout.mockReturnValue(null);

    addWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 201 when workout added", () => {
    req.params = { clientId: "1" };
    req.body = { name: "W1" };

    const workout = { id: 10, name: "W1" };

    (validateId as any).mockReturnValue(null);
    (validateWorkout as any).mockReturnValue(null);
    mockService.addWorkout.mockReturnValue(workout);

    addWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(workout);
  });

  // ---------------- DELETE WORKOUT ----------------

  it("returns 400 if clientId invalid", () => {
    req.params = { clientId: "abc", workoutId: "1" };
    (validateId as any).mockReturnValue("bad");

    deleteWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if workoutId invalid", () => {
    req.params = { clientId: "1", workoutId: "abc" };

    (validateId as any)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("bad workout");

    deleteWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 if delete fails", () => {
    req.params = { clientId: "1", workoutId: "10" };

    (validateId as any).mockReturnValue(null);
    mockService.deleteWorkout.mockReturnValue(null);

    deleteWorkout(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 200 when delete succeeds", () => {
    req.params = { clientId: "1", workoutId: "10" };

    const deleted = { id: 10, name: "W1" };

    (validateId as any).mockReturnValue(null);
    mockService.deleteWorkout.mockReturnValue(deleted);

    deleteWorkout(req, res );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });
});