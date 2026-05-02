import React from "react";
import "./ViewMeasurementsComp.css";
import  Button from "../Button/Button"
import Title from "../Title/Title";
import { useNavigate } from "react-router-dom";
type ViewMeasurementsCompProps = {
  clientId: number;
};

const ViewMeasurementsComp: React.FC<ViewMeasurementsCompProps> = ({ clientId }) => {
  
  const navigate = useNavigate();

  const handleViewMeasurements = () => {
    navigate(`/client/${clientId}/measurements`);
  };
  
  return (
    <div className="view-measurements-container">

      <div className="title">
        <Title title="View Measurements" />
      </div>

      <div className="view-measurements-content">
        <div><Button text="Table View" onClick={handleViewMeasurements}/></div>
      </div>
    </div>
  );
};

export default ViewMeasurementsComp;