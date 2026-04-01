// src/components/ActivitySummary/ActivitySummary.tsx
import React from "react";
import { useAppContext } from "../../context/AppContext";
import "./ActivitySummary.css";
import {useLocation} from "react-router-dom";

const ActivitySummary: React.FC = () => {
    const { tracker } = useAppContext();
    const activity = tracker.getData();
    const location=useLocation();
    const getPageName = (pathname: string): string => {
        if (pathname === "/") return "DashboardPage";
        if (pathname.startsWith("/client")) return "ClientDetailsPage";
        if (pathname.includes("/workout/add")) return "AddWorkoutPage";
        if (pathname.includes("/exercise/add")) return "AddExercisePage";
        if (pathname.includes("/add-exercise")) return "AddExercisePage";
        if (pathname.includes("/workout/update")) return "UpdateWorkoutPage";
        if (pathname.includes("/workout/")) return "AddWorkoutPage";

        return "UnknownPage";
    };
    
    const pageName=getPageName(location.pathname);
    return (
        <div className="activity-summary">
        <p>Activity summary:</p>

        <p>
            Last action:{" "}
            {activity.lastAction
            ? `${activity.lastAction.type} - ${activity.lastAction.item}`
            : "No actions yet"}
        </p>

        <p>
            Page visits: {activity.pageVisits?.[pageName] ?? 0}
        </p>
        </div>
    );
};

export default ActivitySummary;