import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { AppProvider, useAppContext } from "./AppContext";
import { ClientService } from "../services/ClientService";

const ConsumerComponent = () => {
  const { service, tracker } = useAppContext();

  return (
    <div>
      <span>
        {service instanceof ClientService ? "Service Received" : "Service Missing"}
      </span>
      <span>
        {tracker ? "Tracker Received" : "Tracker Missing"}
      </span>
    </div>
  );
};

describe("AppContext", () => {
  beforeEach(() => {
    cleanup();
  });

  it("provides service and tracker via AppProvider", () => {
    render(
      <AppProvider>
        <ConsumerComponent />
      </AppProvider>
    );

    expect(screen.getByText("Service Received")).toBeInTheDocument();
    expect(screen.getByText("Tracker Received")).toBeInTheDocument();
  });

  it("provides default service and tracker without provider", () => {
    render(<ConsumerComponent />);

    expect(screen.getByText("Service Received")).toBeInTheDocument();
    expect(screen.getByText("Tracker Received")).toBeInTheDocument();
  });

  it("renders children inside AppProvider", () => {
    render(
      <AppProvider>
        <div>Child Content</div>
      </AppProvider>
    );

    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("provides the same service instance across renders", () => {
    let firstService: any;
    let secondService: any;

    const TestComponent = () => {
      const { service } = useAppContext();

      if (!firstService) firstService = service;
      else secondService = service;

      return null;
    };

    render(
      <AppProvider>
        <TestComponent />
        <TestComponent />
      </AppProvider>
    );

    expect(firstService).toBe(secondService);
  });
});