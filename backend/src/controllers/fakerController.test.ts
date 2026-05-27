import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../service/generatorService", () => ({
  startGenerator: vi.fn(),
  stopGenerator: vi.fn(),
}));

vi.mock("../service/clientServiceInstance", () => ({
  repo: {},
}));

vi.mock("../service/websocket", () => ({
  broadcast: vi.fn(),
}));

import { startGenerator, stopGenerator } from "../service/generatorService";
import { repo } from "../service/clientServiceInstance";
import { broadcast } from "../service/websocket";

import app from "../app";

describe("Generator Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /generator/start calls startGenerator with repo and broadcast, responds with 'Generator started'", async () => {
    const res = await request(app).post("/generator/start");

    expect(startGenerator).toHaveBeenCalledTimes(1);
    expect(startGenerator).toHaveBeenCalledWith(repo, broadcast);
    expect(res.status).toBe(200);
    expect(res.text).toBe("Generator started");
  });

  it("POST /generator/stop calls stopGenerator and responds with 'Generator stopped'", async () => {
    const res = await request(app).post("/generator/stop");

    expect(stopGenerator).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.text).toBe("Generator stopped");
  });
});
