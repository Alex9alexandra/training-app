import React, { useEffect, useState } from "react";
import Title from "../../components/Title/Title";
import ClientTable from "../../components/Table/ClientTable";
import { useAppContext } from "../../context/AppContext";
import "./DashboardPage.css"
import {useNavigate} from "react-router-dom";
import type {Client} from "../../domain/Client";
import DashboardModal from "../../components/DashboardModal/DashboardModal";
const DashboardPage: React.FC = () => {
  const {service,tracker}=useAppContext();
  const activity = tracker.getData();
  const [showStats, setShowStats] = useState(false);
  const [clients, setClients] = useState({
    data: [] as Client[],
    totalPages: 1,
    page: 1
  });
  const navigate=useNavigate();
  const handleView = (id: number) => {
    navigate(`/client/${id}`);
  };

  const loadClients = async (pageNumber: number) => {
    const data = await service.getAllClients(pageNumber,5);
    setClients(data);
  };
  useEffect(() => {
    loadClients(clients.page);
  }, [clients.page]);

  React.useEffect(() => {
    tracker.trackPage("DashboardPage");
  }, []);

  
  return (
      <div className="content">

        <div className="title"><Title title="CLIENT'S TABLE" /></div>

        <div className="table"><ClientTable clients={clients} onView={handleView} onPageChange={(newPage)=>loadClients(newPage)} page={clients.page} /></div>

        <button className="statisticsBTN" onClick={() => setShowStats(true)}>
          View Global Statistics
        </button>

        {showStats && (
          <DashboardModal
            onClose={() => setShowStats(false)}
          />
        )}

      </div>
  );
};

export default DashboardPage;