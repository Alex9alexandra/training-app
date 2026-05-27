import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../service/clientServiceInstance", () => ({
  clientService: {
    addExercise: vi.fn(),
    deleteExercise: vi.fn(),
  },
}));

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
    req = { params: {}, body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  // ── addExercise ────────────────────────────────────────────────────────────
  it("addExercise: returns 400 if clientId invalid", async () => {
    req.params = { clientId: "abc", workoutId: "1" };
    (validateId as any).mockReturnValue("invalid clientId");

    await addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid clientId" });
  });

  it("addExercise: returns 400 if workoutId invalid", async () => {
    req.params = { clientId: "1", workoutId: "abc" };
    (validateId as any)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("invalid workoutId");

    await addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("addExercise: returns 400 if exercise invalid", async () => {
    req.params = { clientId: "1", workoutId: "2" };
    req.body = { name: "" };
    (validateId as any).mockReturnValue(null);
    (validateExercise as any).mockReturnValue("invalid exercise");

    await addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "invalid exercise" });
  });

  it("addExercise: returns 404 if service cannot add exercise", async () => {
    req.params = { clientId: "1", workoutId: "2" };
    req.body = { name: "Pushup" };
    (validateId as any).mockReturnValue(null);
    (validateExercise as any).mockReturnValue(null);
    mockService.addExercise.mockResolvedValueOnce(null);

    await addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Client or workout not found" });
  });

  it("addExercise: returns 201 when exercise added successfully", async () => {
    req.params = { clientId: "1", workoutId: "2" };
    req.body = { name: "Pushup" };
    const exercise = { id: 10, name: "Pushup" };
    (validateId as any).mockReturnValue(null);
    (validateExercise as any).mockReturnValue(null);
    mockService.addExercise.mockResolvedValueOnce(exercise);

    await addExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(exercise);
  });

  // ── deleteExercise ─────────────────────────────────────────────────────────
  it("deleteExercise: returns 400 if clientId invalid", async () => {
    req.params = { clientId: "abc", workoutId: "1", exerciseId: "2" };
    (validateId as any).mockReturnValue("bad id");

    await deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deleteExercise: returns 400 if workoutId invalid", async () => {
    req.params = { clientId: "1", workoutId: "abc", exerciseId: "2" };
    (validateId as any)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("bad workout");

    await deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deleteExercise: returns 400 if exerciseId invalid", async () => {
    req.params = { clientId: "1", workoutId: "2", exerciseId: "abc" };
    (validateId as any)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("bad exercise");

    await deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("deleteExercise: returns 404 if delete fails", async () => {
    req.params = { clientId: "1", workoutId: "2", exerciseId: "3" };
    (validateId as any).mockReturnValue(null);
    mockService.deleteExercise.mockResolvedValueOnce(null);

    await deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Client, workout or exercise not found" });
  });

  it("deleteExercise: returns 200 when delete succeeds", async () => {
    req.params = { clientId: "1", workoutId: "2", exerciseId: "3" };
    const deleted = { id: 3, name: "Pushup" };
    (validateId as any).mockReturnValue(null);
    mockService.deleteExercise.mockResolvedValueOnce(deleted);

    await deleteExercise(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });
});
