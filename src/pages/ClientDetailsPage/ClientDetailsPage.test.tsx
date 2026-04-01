import { render, screen, cleanup } from "@testing-library/react";
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

vi.mock("../../context/AppContext", () => ({ useAppContext: () => ({service:mockService, tracker:mockTracker}) }));

vi.mock("../../components/WorkoutComp/WokroutComp", () => ({
  default: ({ clientId }: { clientId: number }) => <div data-testid="workout-comp">Workout for {clientId}</div>,
}));
vi.mock("../../components/ViewMeasurementsComp/ViewMeasurementsComp", () => ({
  default: ({ clientId }: { clientId: number }) => <div data-testid="measurements-comp">Measurements for {clientId}</div>,
}));
vi.mock("../../components/AvailabilityComp/AvailabilityComp", () => ({
  default: ({ clientId }: { clientId: number }) => <div data-testid="availability-comp">Availability for {clientId}</div>,
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

  it("renders 'Client not found' when service returns null", () => {
    mockService.getClient.mockReturnValue(null);
    renderPage("999");

    expect(screen.getByText(/client not found/i)).toBeInTheDocument();
  });

  it("renders the page title and sub-components when client exists", () => {
  
    mockService.getClient.mockReturnValue({ id: 1, name: "John Doe" });
    
    renderPage("1");

    expect(screen.getByText("DETAILS")).toBeInTheDocument();

    expect(screen.getByTestId("workout-comp")).toHaveTextContent("Workout for 1");
    expect(screen.getByTestId("measurements-comp")).toHaveTextContent("Measurements for 1");
    expect(screen.getByTestId("availability-comp")).toHaveTextContent("Availability for 1");
  });

  it("correctly converts the URL string ID to a number for the service", () => {
    mockService.getClient.mockReturnValue({ id: 42, name: "Test" });
    
    renderPage("42");

    expect(mockService.getClient).toHaveBeenCalledWith(42);
  });
});