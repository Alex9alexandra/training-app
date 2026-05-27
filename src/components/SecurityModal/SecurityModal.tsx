import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import "./SecurityModal.css";

interface Props {
  onClose: () => void;
}

const SecurityModal: React.FC<Props> = ({ onClose }) => {
  const { service } = useAppContext();

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await service.getMonitoringAnalysis();
      setAnalysis(data);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <button className="close-btn" onClick={onClose}>✕</button>

        <h2>AI Security Monitoring</h2>

        {loading ? (
          <p>Analysing behaviour...</p>
        ) : (
          <>
            <p><b>IPs Analysed:</b> {analysis.totalIpsAnalysed}</p>

            <h3>AI Verdict</h3>

            <div style={{
              background: "#111",
              padding: "10px",
              borderRadius: "5px",
              whiteSpace: "pre-wrap",
              fontSize: "12px"
            }}>
              {analysis.aiAnalysis}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default SecurityModal;