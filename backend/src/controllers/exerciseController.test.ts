import { describe, it, expect, vi, beforeEach } from "vitest";


vi.mock("../service/clientServiceInstance", () => {
  return {
    clientService: {
      addExercise: vi.fn(),
      deleteExercise: vi.fn(),
    }
  };
});

vi.mock("../validators/idValidators", () => ({
  validateId: vi.fn(),
}));

vi.mock("../validators/exerciseValidators", () => ({
  validateExercise: vi.fn(),
}));

import { addExercise, deleteExercise } from "../controllers/exerciseController";
import { validateId } from "../validators/idValidators";
import { validateExercise } from "../validators/exerciseValidators";
import { clientService } from "../service/clientServiceInstance";

const mockService = clientService as any;
describe("Exercise Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      params: {},
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });


  it("returns 400 if clientId invalid", () => {
    req.params = { clientId: "abc", workoutId: "1" };
    (validateId as any).mockReturnValue("invalid clientId");

    addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid clientId" });
  });

  it("returns 400 if workoutId invalid", () => {
    req.params = { clientId: "1", workoutId: "abc" };

    (validateId as any)
      .mockReturnValueOnce(null) 
      .mockReturnValueOnce("invalid workoutId");

    addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if exercise invalid", () => {
    req.params = { clientId: "1", workoutId: "2" };
    req.body = { name: "" };

    (validateId as any).mockReturnValue(null);
    (validateExercise as any).mockReturnValue("invalid exercise");

    addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid exercise" });
  });

  it("returns 404 if service cannot add exercise", () => {
    req.params = { clientId: "1", workoutId: "2" };
    req.body = { name: "Pushup" };

    (validateId as any).mockReturnValue(null);
    (validateExercise as any).mockReturnValue(null);
    mockService.addExercise.mockReturnValue(null);

    addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Client or workout not found",
    });
  });

  it("returns 201 when exercise added successfully", () => {
    req.params = { clientId: "1", workoutId: "2" };
    req.body = { name: "Pushup" };

    const exercise = { id: 10, name: "Pushup" };

    (validateId as any).mockReturnValue(null);
    (validateExercise as any).mockReturnValue(null);
    mockService.addExercise.mockReturnValue(exercise);

    addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(exercise);
  });


  it("returns 400 if clientId invalid", () => {
    req.params = { clientId: "abc", workoutId: "1", exerciseId: "2" };
    (validateId as any).mockReturnValue("bad id");

    deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if workoutId invalid", () => {
    req.params = { clientId: "1", workoutId: "abc", exerciseId: "2" };

    (validateId as any)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("bad workout");

    deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if exerciseId invalid", () => {
    req.params = { clientId: "1", workoutId: "2", exerciseId: "abc" };

    (validateId as any)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("bad exercise");

    deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 404 if delete fails", () => {
    req.params = { clientId: "1", workoutId: "2", exerciseId: "3" };

    (validateId as any).mockReturnValue(null);
    mockService.deleteExercise.mockReturnValue(null);

    deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Client, workout or exercise not found",
    });
  });

  it("returns 200 when delete succeeds", () => {
    req.params = { clientId: "1", workoutId: "2", exerciseId: "3" };

    const deleted = { id: 3, name: "Pushup" };

    (validateId as any).mockReturnValue(null);
    mockService.deleteExercise.mockReturnValue(deleted);

    deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });
});  