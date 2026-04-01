import React from "react"
import { useParams } from "react-router-dom";
import "./ClientDetailsPage.css"
import { useAppContext } from "../../context/AppContext";
import Title from "../../components/Title/Title";
import WorkoutComp from "../../components/WorkoutComp/WokroutComp";
import ViewMeasurementsComp from "../../components/ViewMeasurementsComp/ViewMeasurementsComp";
import AvailabilityComp from "../../components/AvailabilityComp/AvailabilityComp";

const ClientDetailsPage: React.FC=()=>{
    const {id}=useParams();
    const {service,tracker}=useAppContext();
    const clientId=Number(id);
    const client=service.getClient(clientId);

    React.useEffect(() => {
    tracker.trackPage("ClientDetailsPage");
  }, []);
    
    if(!client){
        return <div>Client not found</div>;
    }
    return (
        <div className="client-details-page">
            
            <Title title="DETAILS"/>
            
            <WorkoutComp clientId={clientId}/>

            <ViewMeasurementsComp clientId={clientId}/>
            
            <AvailabilityComp clientId={clientId}/>
            
        </div>
    );
};

export default ClientDetailsPage;