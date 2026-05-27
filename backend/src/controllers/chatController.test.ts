import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import { getMessages } from "./chatController";

vi.mock("../service/mongodb", () => ({
  getDb: vi.fn(),
}));

import { getDb } from "../service/mongodb";
const mockGetDb = vi.mocked(getDb);

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

const mockReq = () => ({} as Request);

const buildDbMock = (toArrayResult: unknown[] | Error) => {
  const toArray =
    toArrayResult instanceof Error
      ? vi.fn().mockRejectedValueOnce(toArrayResult)
      : vi.fn().mockResolvedValueOnce(toArrayResult);

  const limit = vi.fn().mockReturnValue({ toArray });
  const sort = vi.fn().mockReturnValue({ limit });
  const find = vi.fn().mockReturnValue({ sort });
  const collection = vi.fn().mockReturnValue({ find });

  return { collection, find, sort, limit, toArray };
};

describe("chatController - getMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns messages and calls the full chain with correct args", async () => {
    const fakeMessages = [
      { _id: "1", text: "Hello", timestamp: 1 },
      { _id: "2", text: "World", timestamp: 2 },
    ];
    const { collection, find, sort, limit, toArray } =
      buildDbMock(fakeMessages);
    mockGetDb.mockReturnValueOnce({ collection } as any);

    const res = mockRes();
    await getMessages(mockReq(), res);

    expect(mockGetDb).toHaveBeenCalledTimes(1);
    expect(collection).toHaveBeenCalledWith("messages");
    expect(find).toHaveBeenCalled();
    expect(sort).toHaveBeenCalledWith({ timestamp: 1 });
    expect(limit).toHaveBeenCalledWith(100);
    expect(toArray).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeMessages);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns an empty array when collection is empty", async () => {
    const { collection } = buildDbMock([]);
    mockGetDb.mockReturnValueOnce({ collection } as any);

    const res = mockRes();
    await getMessages(mockReq(), res);

    expect(res.json).toHaveBeenCalledWith([]);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 500 when toArray rejects", async () => {
    const { collection } = buildDbMock(new Error("DB error"));
    mockGetDb.mockReturnValueOnce({ collection } as any);

    const res = mockRes();
    await getMessages(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch messages" });
  });

  it("returns 500 when getDb itself throws", async () => {
    mockGetDb.mockImplementationOnce(() => {
      throw new Error("getDb failed");
    });

    const res = mockRes();
    await getMessages(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch messages" });
  });

  it("logs the db instance via console.log", async () => {
    const { collection } = buildDbMock([]);
    const fakeDb = { collection };
    mockGetDb.mockReturnValueOnce(fakeDb as any);

    await getMessages(mockReq(), mockRes());

    expect(console.log).toHaveBeenCalledWith("DB:", fakeDb);
  });

  it("logs the error via console.error on failure", async () => {
    const error = new Error("Something went wrong");
    const { collection } = buildDbMock(error);
    mockGetDb.mockReturnValueOnce({ collection } as any);

    await getMessages(mockReq(), mockRes());

    expect(console.error).toHaveBeenCalledWith("getMessages error:", error);
  });
});
