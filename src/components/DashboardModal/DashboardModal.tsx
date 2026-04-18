import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import "./modal.css";

interface Stats {
    totalClients: number;
    mostActiveClient: {
        name: string;
        workouts: number;
    };
    averageWorkouts: number;
    clientsActivity: {
        name: string;
        workouts: number;
    }[];
}

interface Props {
    onClose: () => void;
}

const DashboardModal: React.FC<Props> = ({ onClose }) => {
    const { service } = useAppContext();

    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            const data = await service.getStatistics();
            setStats(data);
            setLoading(false);
        };

        loadStats();
    }, []);

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    const max = Math.max(...stats!.clientsActivity.map(c => c.workouts));

    return (
        <div className="modal-overlay">
            <div className="modal-content">

                <button className="close-btn" onClick={onClose}>
                    ✕
                </button>

                <h2>Global Dashboard Statistics</h2>

                {loading || !stats ? (
                    <p>Loading...</p>
                ) : (
                    
                    <div>
                        <p><b>Total Clients:</b> {stats.totalClients}</p>

                        <p>
                            <b>Most Active Client:</b>{" "}
                            {stats.mostActiveClient.name} ({stats.mostActiveClient.workouts})
                        </p>

                        <p>
                            <b>Average Workouts:</b>{" "}
                            {stats.averageWorkouts.toFixed(2)}
                        </p>

                        <h4>Client Activity</h4>
                        <div className="bar-container">
                            {stats.clientsActivity.map((c, i) => (
                                <div key={i} className="bar-row">
                                
                                <span className="bar-label">{c.name}</span>

                                <div className="bar-wrapper">
                                    <div
                                    className="bar-fill"
                                    style={{ width: `${(c.workouts /max)*100}%` }}
                                    />
                                </div>

                                <span className="bar-value">{c.workouts}</span>

                                </div>
                            ))}
                            </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardModal;