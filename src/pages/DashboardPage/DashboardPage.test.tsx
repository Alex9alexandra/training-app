import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardPage from "./DashboardPage";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockService = {
  getAllClients: vi.fn(),
  getStatistics: vi.fn().mockResolvedValue({
    totalClients: 0,
    mostActiveClient: { name: "", workouts: 0 },
    averageWorkouts: 0,
    clientsActivity: [],
  }),
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

vi.mock("../../components/Table/ClientTable", () => ({
  default: ({ clients, onView, onPageChange }: any) => (
    <div data-testid="mock-client-table">
      {clients.data.map((client: any) => (
        <button key={client.id} onClick={() => onView(client.id)}>
          View {client.name}
        </button>
      ))}

      <button onClick={() => onPageChange(2)}>Next Page</button>
    </div>
  ),
}));

describe("DashboardPage", () => {
  const mockClients = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();

    mockService.getAllClients.mockResolvedValue({
      data: mockClients,
      totalPages: 2,
      page: 1,
    });
  });

  const renderPage = () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
  };

  it("renders the correct title", () => {
    renderPage();
    expect(screen.getByText("CLIENT'S TABLE")).toBeInTheDocument();
  });

  it("calls service on mount", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockService.getAllClients).toHaveBeenCalledTimes(1);
    });
  });


  it("renders clients after fetch", async () => {
    renderPage();

    expect(await screen.findByText("View Alice")).toBeInTheDocument();
    expect(screen.getByText("View Bob")).toBeInTheDocument();
  });


  it("navigates to client details", async () => {
    renderPage();

    const btn = await screen.findByText("View Alice");
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/client/1");
  });


  it("tracks page view on mount", async () => {
    renderPage();

    await waitFor(() => {
      expect(mockTracker.trackPage).toHaveBeenCalledWith("DashboardPage");
    });
  });


  it("loads next page when pagination triggers onPageChange", async () => {
    renderPage();

    const nextBtn = await screen.findByText("Next Page");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockService.getAllClients).toHaveBeenCalledWith(2, 5);
    });
  });

  it("opens dashboard modal when button is clicked", async () => {
    renderPage();

    const btn = await screen.findByText("View Global Statistics");
    fireEvent.click(btn);

    expect(await screen.findByText(/Global Dashboard Statistics/i)).toBeInTheDocument();
  });

  it("closes dashboard modal when close is clicked", async () => {
    renderPage();

    const btn = await screen.findByText("View Global Statistics");
    fireEvent.click(btn);

    const closeBtn = await screen.findByText("✕");
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Global Dashboard Statistics/i)).not.toBeInTheDocument();
    });
  });
});