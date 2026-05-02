import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MeasurementsTablePage.css";

import { useAppContext } from "../../context/AppContext";

import Title from "../../components/Title/Title";

import type { Client } from "../../domain/Client";
import type { Measurement } from "../../domain/Measurement";

const MeasurementsTable: React.FC = () => {

    const { id } = useParams();

    const clientId = Number(id);

    const { service, tracker } = useAppContext();

    const [client, setClient] = useState<Client | null>(null);

    const [measurements, setMeasurements] = useState<Measurement[]>([]);

    useEffect(() => {

        const loadData = async () => {

            const clientData = await service.getClient(clientId);

            setClient(clientData);

            const measurementsData = await service.getMeasurements(clientId);

            setMeasurements(measurementsData ?? []);
        };

        loadData();

    }, [clientId]);

    React.useEffect(() => {
        tracker.trackPage("MeasurementsTable");
    }, []);

    if (client === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="measurements-table-page">

            <Title title={`${client.name} Measurements`} />

            <table className="measurements-table">

                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Height</th>
                        <th>Weight</th>
                        <th>Muscular Mass %</th>
                        <th>Fat Mass %</th>
                        <th>Bone Mass %</th>
                        <th>Lean Body Mass %</th>
                    </tr>
                </thead>

                <tbody>

                    {measurements.map((measurement, index) => (

                        <tr key={index}>

                            <td>{measurement.date}</td>

                            <td>{measurement.height}</td>

                            <td>{measurement.weight}</td>

                            <td>{measurement.muscularMassPercent}</td>

                            <td>{measurement.fatMassPercent}</td>

                            <td>{measurement.boneMassPercent}</td>

                            <td>{measurement.leanBodyMassPercent}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
};

export default MeasurementsTable;