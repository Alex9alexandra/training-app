import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import "./ClientDetailsPage.css"
import { useAppContext } from "../../context/AppContext";
import Title from "../../components/Title/Title";
import WorkoutComp from "../../components/WorkoutComp/WokroutComp";
import ViewMeasurementsComp from "../../components/ViewMeasurementsComp/ViewMeasurementsComp";
import AvailabilityComp from "../../components/AvailabilityComp/AvailabilityComp";
import type {Client} from "../../domain/Client";
const ClientDetailsPage: React.FC=()=>{
    const {id}=useParams();
    const {service,tracker}=useAppContext();
    const clientId=Number(id);
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClient = async () => {
            setLoading(true);
            const data = await service.getClient(clientId);
            setClient(data);
            setLoading(false);
        };
        loadClient();
        }, [clientId]);

        React.useEffect(() => {
        tracker.trackPage("ClientDetailsPage");
    }, []);
    
    if (loading) return <div>Loading...</div>;

    if (!client) return <div>Client not found</div>;
    return (
        <div className="client-details-page">
            
            <Title title="DETAILS"/>
            
            <WorkoutComp clientId={clientId}/>

            
            <ViewMeasurementsComp clientId={clientId}/>
            {/*
            <AvailabilityComp clientId={clientId}/>
            */}
        </div>
    );
};

export default ClientDetailsPage;