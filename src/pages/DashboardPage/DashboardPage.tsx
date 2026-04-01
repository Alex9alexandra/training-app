import React from "react";
import Title from "../../components/Title/Title";
import ClientTable from "../../components/Table/ClientTable";
import { useAppContext } from "../../context/AppContext";
import "./DashboardPage.css"
import {useNavigate} from "react-router-dom";

const DashboardPage: React.FC = () => {
  const {service,tracker}=useAppContext();
  const activity = tracker.getData();
  const clients = service.getAllClients();
  const navigate=useNavigate();
  const handleView = (id: number) => {
    navigate(`/client/${id}`);
  };
  React.useEffect(() => {
    tracker.trackPage("DashboardPage");
  }, []);

  return (
      <div className="content">

        <div className="title"><Title title="CLIENT'S TABLE" /></div>

        <div className="table"><ClientTable clients={clients} onView={handleView} /></div>

      </div>
  );
};

export default DashboardPage;