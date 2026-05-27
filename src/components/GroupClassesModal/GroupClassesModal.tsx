import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import "./GroupClassesModal.css";

interface Props {
  onClose: () => void;
}

const GroupClassesModal: React.FC<Props> = ({ onClose }) => {
  const { service } = useAppContext();

  const [naive, setNaive] = useState<any>(null);
  const [optimized, setOptimized] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const naiveData = await service.getGroupClassesNaive();
      const optData = await service.getGroupClassesOptimized();

      setNaive(naiveData);
      setOptimized(optData);

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">Loading...</div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>Group Classes Performance</h2>

        <p><b>Naive Duration:</b> {naive.durationMs} ms</p>
        <p><b>Optimized Duration:</b> {optimized.durationMs} ms</p>
        <p><b>Cache Used:</b> {optimized.fromCache ? "YES" : "NO"}</p>

        <hr />

        <h3>Top Classes</h3>

        {optimized.data.slice(0, 10).map((c: any) => (
          <div key={c.classId} style={{ marginBottom: "10px" }}>
            <b>{c.className}</b>
            <div>Enrolled: {c.enrolledCount}</div>
            <div>Avg Age: {c.averageClientAge}</div>
            <div>Total Workouts: {c.totalWorkoutsAmongClients}</div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default GroupClassesModal;