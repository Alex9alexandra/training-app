import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { AppProvider, useAppContext } from "./AppContext";
import { ClientService } from "../service/ClientService";
import React from "react";

// The ConsumerComponent must now destructure 'service' from 'useAppContext'
const ConsumerComponent = () => {
  const { service } = useAppContext(); 
  return (
    <div>
      {service instanceof ClientService ? "Service Received" : "Service Missing"}
    </div>
  );
};

describe("AppContext", () => {
  beforeEach(() => {
    cleanup();
  });

  it("provides the ClientService to children via AppProvider", () => {
    render(
      <AppProvider>
        <ConsumerComponent />
      </AppProvider>
    );
    
    // We check for "Service Received" to ensure the provider successfully 
    // passed down the ClientService instance
    expect(screen.getByText("Service Received")).toBeInTheDocument();
  });

  it("returns the default service instance even without a provider", () => {
    // This tests the 'defaultValue' passed to React.createContext
    render(<ConsumerComponent />);
    expect(screen.getByText("Service Received")).toBeInTheDocument();
  });
});