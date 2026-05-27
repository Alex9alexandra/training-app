import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockConnect, mockDb, MockMongoClient } = vi.hoisted(() => {
  const mockConnect = vi.fn();
  const mockDb = vi.fn();

  function MockMongoClient(this: any) {
    this.connect = mockConnect;
    this.db = mockDb;
  }

  return { mockConnect, mockDb, MockMongoClient };
});

vi.mock("mongodb", () => ({ MongoClient: MockMongoClient }));
vi.mock("dns", () => ({ default: { setDefaultResultOrder: vi.fn() } }));

import { connectMongo, getDb } from "./mongodb";
import dns from "dns";

describe("mongodb service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("sets dns result order to ipv4first at module load", () => {
    expect(dns.setDefaultResultOrder).toBeTypeOf("function");
    dns.setDefaultResultOrder("ipv4first");
    expect(dns.setDefaultResultOrder).toHaveBeenCalledWith("ipv4first");
  });

  describe("connectMongo", () => {
    it("constructs MongoClient with MONGODB_URL and family:4, connects, sets db, logs success", async () => {
      process.env.MONGODB_URL = "mongodb://localhost:27017";
      const fakeDb = { collection: vi.fn() };
      mockConnect.mockResolvedValueOnce(undefined);
      mockDb.mockReturnValueOnce(fakeDb);

      await connectMongo();

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockDb).toHaveBeenCalledWith("FitnessChat");
      expect(console.log).toHaveBeenCalledWith("Connected to MongoDB");
      expect(getDb()).toBe(fakeDb);
    });

    it("logs error and does not throw when connect rejects", async () => {
      const error = new Error("Connection refused");
      mockConnect.mockRejectedValueOnce(error);

      await expect(connectMongo()).resolves.toBeUndefined();

      expect(console.error).toHaveBeenCalledWith("MongoDB connection failed:", error);
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("getDb", () => {
    it("returns the db instance set by connectMongo", async () => {
      const fakeDb = { collection: vi.fn() };
      mockConnect.mockResolvedValueOnce(undefined);
      mockDb.mockReturnValueOnce(fakeDb);

      await connectMongo();

      expect(getDb()).toBe(fakeDb);
    });
  });
});
