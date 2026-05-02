import React, { useEffect, useState } from "react";

import "./ClientDashboardPage.css";

import { useAppContext } from "../../context/AppContext";

import Title from "../../components/Title/Title";

import type { Workout } from "../../domain/Workout";
import type { Measurement } from "../../domain/Measurement";
import type { Client } from "../../domain/Client";
import WorkoutDetailsModal from "../../components/WorkoutDetailsModal/WorkoutDetailsModal";
import AddMeasurementModal from "../../components/AddMeasurementModal/AddMeasurementModal";

const ClientDashboardPage: React.FC = () => {

    const { service, tracker } = useAppContext();

    /*
        TEMPORARY:
        later this comes from login
    */
    const clientId = 1;

    const [client, setClient] = useState<Client | null>(null);

    const [workouts, setWorkouts] = useState<Workout[]>([]);

    const [measurements, setMeasurements] = useState<Measurement[]>([]);

    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    const [showAddMeasurement, setShowAddMeasurement] = useState(false);

    useEffect(() => {

        const loadData = async () => {

            const clientData = await service.getClient(clientId);

            setClient(clientData);

            const workoutsData = await service.getWorkouts(
                clientId,
                1,
                50
            );

            setWorkouts(workoutsData.data);

            const measurementsData =
                await service.getMeasurements(clientId);

            setMeasurements(measurementsData);
        };

        loadData();

    }, [clientId,service]);

    useEffect(() => {
        tracker.trackPage("ClientDashboardPage");
    }, []);

    if (!client) {
        return <div>Loading...</div>;
    }

    return (
        <>

            <div className="client-dashboard-page">

                <Title title={`${client.name} Dashboard`} />

                {/* WORKOUTS */}

                <div className="client-section">

                    <h2 className="section-title">
                        Assigned Workouts
                    </h2>

                    <div className="workouts-list">

                        {workouts.map(workout => (

                            <div
                                key={workout.id}
                                className="workout-card"
                                onClick={()=>setSelectedWorkout(workout)}
                            >
                                {workout.name}
                            </div>

                        ))}

                    </div>

                </div>

                {/* MEASUREMENTS */}

                <div className="client-section">

                    <h2 className="section-title">
                        Measurements
                    </h2>

                    <table className="measurements-table">

                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Height</th>
                                <th>Weight</th>
                                <th>Muscle %</th>
                                <th>Fat %</th>
                                <th>Bone %</th>
                                <th>Lean %</th>
                            </tr>
                        </thead>

                        <tbody>

                            {measurements.map(m => (

                                <tr key={m.id}>

                                    <td>{m.date}</td>

                                    <td>{m.height}</td>

                                    <td>{m.weight}</td>

                                    <td>{m.muscularMassPercent}</td>

                                    <td>{m.fatMassPercent}</td>

                                    <td>{m.boneMassPercent}</td>

                                    <td>{m.leanBodyMassPercent}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                    <button
                        className="statisticsBTN"
                        onClick={() => setShowAddMeasurement(true)}
                    >
                        Add Measurement
                    </button>
                </div>
            </div>

            {showAddMeasurement && (
                <AddMeasurementModal
                    clientId={clientId}
                    onClose={() => setShowAddMeasurement(false)}
                    onSave={async (m) => {
                        const saved = await service.addMeasurement(clientId, m);
                        setMeasurements(prev => [saved, ...prev]);
                    }}
                />
            )}

            <WorkoutDetailsModal
                workout={selectedWorkout}
                onClose={() => setSelectedWorkout(null)}
            />
        </>
    );
};

export default ClientDashboardPage;