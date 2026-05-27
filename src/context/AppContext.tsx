import React, { createContext, useContext, useState, useEffect } from "react";
import { ClientService } from "../services/ClientService";
import ActivityTracker from "../cookies/ActivityTracker";
import { startInactivityTimer, stopInactivityTimer } from "../auth/inactivityTimer";
import { authStore } from "../auth/authStore";

const service = new ClientService();
const tracker = new ActivityTracker();

type LoggedUser = {
  id: number;
  username: string;
  role: string;
  permissions: string[];
  clientId: number | null;
};

interface AppContextType {
  service: ClientService;
  tracker: ActivityTracker;
  loggedUser: LoggedUser | null;
  setLoggedUser: (user: LoggedUser | null) => void;
}

const AppContext = createContext<AppContextType>({ service, tracker, loggedUser: null, setLoggedUser: () => {} });
export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<LoggedUser | null>(null);

  const handleSetLoggedUser = (user: LoggedUser | null) => {
    setLoggedUser(user);
    if (user) {
      startInactivityTimer();
    } else {
      stopInactivityTimer();
      authStore.clear();
    }
  };

  useEffect(() => {
    const handleLogout = () => {
      setLoggedUser(null);
      stopInactivityTimer();
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  return (
    <AppContext.Provider value={{ service, tracker, loggedUser, setLoggedUser: handleSetLoggedUser }}>
      {children}
    </AppContext.Provider>
  );
};