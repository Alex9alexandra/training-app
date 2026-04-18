import React, { createContext, useContext } from "react";
import { ClientService } from "../services/ClientService";
import ActivityTracker from "../cookies/ActivityTracker"; 

const service = new ClientService();

const tracker = new ActivityTracker();
interface AppContextType {
  service: ClientService;
  tracker: ActivityTracker;
}

const AppContext = createContext<AppContextType>({ service, tracker });
export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppContext.Provider value={{service,tracker}}>
      {children}
    </AppContext.Provider>
  );
};