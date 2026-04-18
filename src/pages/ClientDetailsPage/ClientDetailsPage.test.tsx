import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ClientDetailsPage from "./ClientDetailsPage";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockService = {
  getClient: vi.fn(),
};

const mockTracker = {
  getData: vi.fn().mockReturnValue({}),
  trackPage: vi.fn(),
  trackAction: vi.fn(),
};

vi.mock("../../context/AppContext", () => ({
  useAppContext: () => ({
    service: mockService,
    tracker: mockTracker,
  }),
}));

vi.mock("../../components/WorkoutComp/WokroutComp", () => ({
  default: ({ clientId }: { clientId: number }) => (
    <div data-testid="workout-comp">Workout for {clientId}</div>
  ),
}));

vi.mock("../../components/ViewMeasurementsComp/ViewMeasurementsComp", () => ({
  default: ({ clientId }: { clientId: number }) => (
    <div data-testid="measurements-comp">Measurements for {clientId}</div>
  ),
}));

vi.mock("../../components/AvailabilityComp/AvailabilityComp", () => ({
  default: ({ clientId }: { clientId: number }) => (
    <div data-testid="availability-comp">Availability for {clientId}</div>
  ),
}));

describe("ClientDetailsPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const renderPage = (clientId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/client/${clientId}`]}>
        <Routes>
          <Route path="/client/:id" element={<ClientDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // 🔴 LOADING BRANCH

  it("shows loading state before client loads", () => {
    mockService.getClient.mockResolvedValue(null);

    renderPage("1");

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });


  it("renders 'Client not found' when service returns null", async () => {
    mockService.getClient.mockResolvedValue(null);

    renderPage("999");

    await waitFor(() => {
      expect(screen.getByText(/client not found/i)).toBeInTheDocument();
    });
  });

  it("renders page and subcomponents when client exists", async () => {
    mockService.getClient.mockResolvedValue({
      id: 1,
      name: "John Doe",
    });

    renderPage("1");

    await waitFor(() => {
      expect(screen.getByText("DETAILS")).toBeInTheDocument();
    });

    expect(screen.getByTestId("workout-comp")).toHaveTextContent(
      "Workout for 1"
    );
    expect(screen.getByTestId("measurements-comp")).toHaveTextContent(
      "Measurements for 1"
    );
    expect(screen.getByTestId("availability-comp")).toHaveTextContent(
      "Availability for 1"
    );
  });


  it("converts URL param to number correctly", async () => {
    mockService.getClient.mockResolvedValue({
      id: 42,
      name: "Test",
    });

    renderPage("42");

    await waitFor(() => {
      expect(mockService.getClient).toHaveBeenCalledWith(42);
    });
  });

  it("tracks page view on mount", async () => {
    mockService.getClient.mockResolvedValue({
      id: 1,
      name: "John",
    });

    renderPage("1");

    await waitFor(() => {
      expect(mockTracker.trackPage).toHaveBeenCalledWith(
        "ClientDetailsPage"
      );
    });
  });
});