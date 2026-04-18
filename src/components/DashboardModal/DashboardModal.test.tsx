import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DashboardModal from "./DashboardModal";
import { useAppContext } from "../../context/AppContext";

// mock context
vi.mock("../../context/AppContext", () => ({
    useAppContext: vi.fn()
}));

describe("DashboardModal", () => {
    let mockService: any;
    const onClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockService = {
            getStatistics: vi.fn()
        };

        (useAppContext as any).mockReturnValue({
            service: mockService
        });
    });

    // ---------------- LOADING STATE ----------------

    it("shows loading initially", () => {
        let resolveFn: any;

        mockService.getStatistics.mockReturnValue(
            new Promise((resolve) => {
                resolveFn = resolve;
            })
        );

        render(<DashboardModal onClose={onClose} />);

        // loading should exist immediately on first render
        expect(screen.getByText(/loading/i)).toBeTruthy();

        // cleanup resolve
        resolveFn({
            totalClients: 0,
            mostActiveClient: { name: "", workouts: 0 },
            averageWorkouts: 0,
            clientsActivity: []
        });
    });

    // ---------------- SUCCESS RENDER ----------------

    it("renders statistics correctly", async () => {
        mockService.getStatistics.mockResolvedValue({
            totalClients: 2,
            mostActiveClient: { name: "Andrei", workouts: 5 },
            averageWorkouts: 3.5,
            clientsActivity: [
                { name: "Andrei", workouts: 5 },
                { name: "Maria", workouts: 3 }
            ]
        });

        render(<DashboardModal onClose={onClose} />);

        await waitFor(() => {
            expect(screen.getByText(/Total Clients/i)).toBeTruthy();
        });

        expect(screen.getByText("Andrei")).toBeTruthy();
        expect(screen.getByText("Maria")).toBeTruthy();
        expect(screen.getByText(/Most Active Client/i)).toBeTruthy();
        expect(screen.getByText(/Average Workouts/i)).toBeTruthy();
    });

    // ---------------- BAR RENDERING ----------------

    it("renders activity bars based on data", async () => {
        mockService.getStatistics.mockResolvedValue({
            totalClients: 2,
            mostActiveClient: { name: "A", workouts: 10 },
            averageWorkouts: 5,
            clientsActivity: [
                { name: "A", workouts: 10 },
                { name: "B", workouts: 5 }
            ]
        });

        const { container } = render(<DashboardModal onClose={onClose} />);

        await waitFor(() => {
            const bars = container.querySelectorAll(".bar-fill");
            expect(bars.length).toBe(2);
        });
    });

    // ---------------- CLOSE BUTTON ----------------

    it("calls onClose when close button is clicked", async () => {
        mockService.getStatistics.mockResolvedValue({
            totalClients: 0,
            mostActiveClient: { name: "", workouts: 0 },
            averageWorkouts: 0,
            clientsActivity: []
        });

        render(<DashboardModal onClose={onClose} />);

        const btn = await screen.findByText("✕");

        fireEvent.click(btn);

        expect(onClose).toHaveBeenCalled();
    });

    // ---------------- EDGE CASE (MAX SAFE) ----------------

    it("handles single client correctly", async () => {
        mockService.getStatistics.mockResolvedValue({
            totalClients: 1,
            mostActiveClient: { name: "Solo", workouts: 7 },
            averageWorkouts: 7,
            clientsActivity: [
                { name: "Solo", workouts: 7 }
            ]
        });

        render(<DashboardModal onClose={onClose} />);

        await waitFor(() => {
            expect(screen.getByText("Solo")).toBeTruthy();
        });

        const bar = document.querySelector(".bar-fill") as HTMLElement;
        expect(bar).not.toBeNull();
    });
});