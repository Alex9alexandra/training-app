import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../service/statisticsServiceInstance", () => {
  return {
    statisticsService: {
      getStatistics: vi.fn(),
    },
  };
});

import { getStatistics } from "../controllers/statisticsController";
import { statisticsService } from "../service/statisticsServiceInstance";

const mockService = statisticsService as any;

describe("Statistics Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {};

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  it("returns 200 and statistics data", () => {
    const mockStats = {
      totalClients: 3,
      mostActiveClient: {
        name: "Andrei",
        workouts: 6,
      },
      averageWorkouts: 4,
      clientsActivity: [
        { name: "Andrei", workouts: 6 },
        { name: "Maria", workouts: 3 },
      ],
    };

    mockService.getStatistics.mockReturnValue(mockStats);

    getStatistics(req, res);

    expect(mockService.getStatistics).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStats);
  });

  it("returns 500 when service throws error", () => {
    mockService.getStatistics.mockImplementation(() => {
      throw new Error("service failure");
    });

    getStatistics(req, res);

    expect(mockService.getStatistics).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error computing statistics",
    });
  });
});