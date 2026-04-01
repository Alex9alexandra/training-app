import { render, screen, fireEvent, cleanup } from "@testing-library/react";
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
};

const mockTracker = {

  getData: vi.fn().mockReturnValue({}),
  trackPage: vi.fn(),
  trackAction: vi.fn(),
};



vi.mock("../../context/AppContext", () => ({ useAppContext: () => ({service:mockService, tracker:mockTracker}) }));

vi.mock("../../components/Table/ClientTable", () => ({
  default: ({ clients, onView }: { clients: any[], onView: (id: number) => void }) => (
    <div data-testid="mock-client-table">
      {clients.map(client => (
        <button key={client.id} onClick={() => onView(client.id)}>
          View {client.name}
        </button>
      ))}
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
    mockService.getAllClients.mockReturnValue(mockClients);
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

  it("calls the service to fetch all clients on render", () => {
    renderPage();
    expect(mockService.getAllClients).toHaveBeenCalledTimes(1);
  });

  it("renders the ClientTable with the fetched clients", () => {
    renderPage();
    expect(screen.getByText("View Alice")).toBeInTheDocument();
    expect(screen.getByText("View Bob")).toBeInTheDocument();
  });

  it("navigates to the client details page when a client is viewed", () => {
    renderPage();
    
    const viewButton = screen.getByText("View Alice");
    fireEvent.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith("/client/1");
  });
});