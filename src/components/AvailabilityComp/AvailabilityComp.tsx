import React from "react";
import "./AvailabilityComp.css"
import Title from "../Title/Title"
import Button from "../Button/Button";
type AvailabilityCompProps={
    clientId:number;
}

const AvailabilityComp: React.FC<AvailabilityCompProps>=({clientId})=>{
    return(
        <div className="availability-container">
            <div className="title">
                <Title title="Availability"/>
            </div>
            <Button text="Calendar"/>
        </div>
    );
};

export default AvailabilityComp;