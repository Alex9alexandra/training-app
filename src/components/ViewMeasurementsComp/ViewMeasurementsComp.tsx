import React from "react";
import "./ViewMeasurementsComp.css";
import  Button from "../Button/Button"
import Title from "../Title/Title";
type ViewMeasurementsCompProps = {
  clientId: number;
};

const ViewMeasurementsComp: React.FC<ViewMeasurementsCompProps> = ({ clientId }) => {
  return (
    <div className="view-measurements-container">
      <div className="title">
        <Title title="View Measurements" />
      </div>
      <div className="view-measurements-content">
        <div><Button text="Table View"/></div>
        <div><Button text="Chart View"/></div>
      </div>
    </div>
  );
};

export default ViewMeasurementsComp;