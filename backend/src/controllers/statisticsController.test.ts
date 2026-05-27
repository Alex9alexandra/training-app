import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStatistics } from "../controllers/statisticsController";
import { clientService } from "../service/clientServiceInstance";

vi.mock("../service/clientServiceInstance", () => {
  return {
    clientService: {
      getStatistics: vi.fn(),
    },
  };
});

describe("Statistics Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {}; 
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it("returns 200 and statistics data when successful", async () => {
    const mockStats = {
      totalClients: 3,
      mostActiveClient: { name: "Andrei", workouts: 6 },
      averageWorkouts: 4,
      clientsActivity: [
        { name: "Andrei", workouts: 6 },
        { name: "Maria", workouts: 3 },
      ],
    };

    vi.mocked(clientService.getStatistics).mockResolvedValue(mockStats);

    await getStatistics(req, res);

    expect(clientService.getStatistics).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStats);
  });

  it("returns 500 when service throws an error", async () => {
    
    vi.mocked(clientService.getStatistics).mockRejectedValue(new Error("Database failure"));

   
    await getStatistics(req, res);

    
    expect(clientService.getStatistics).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Error computing statistics",
    });
  });
});