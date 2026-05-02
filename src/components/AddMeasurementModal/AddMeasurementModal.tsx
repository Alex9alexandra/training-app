import React, { useState } from "react";
import "./AddMeasurementModal.css";

import type { Measurement } from "../../domain/Measurement";
import { useAppContext } from "../../context/AppContext";

type Props = {
    clientId: number;
    onClose: () => void;
    onSave: (m: Measurement) => void;
};

const AddMeasurementModal: React.FC<Props> = ({
    clientId,
    onClose,
    onSave
}) => {

    const { service } = useAppContext?.() ?? { service: null };

    const [form, setForm] = useState({
        height: "",
        weight: "",
        muscularMassPercent: "",
        fatMassPercent: "",
        boneMassPercent: "",
        leanBodyMassPercent: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {

        if (!service) return;

        const newMeasurement: Measurement = {
            id: Date.now(),
            height: Number(form.height),
            weight: Number(form.weight),
            muscularMassPercent: Number(form.muscularMassPercent),
            fatMassPercent: Number(form.fatMassPercent),
            boneMassPercent: Number(form.boneMassPercent),
            leanBodyMassPercent: Number(form.leanBodyMassPercent),
            date: new Date().toISOString().split("T")[0]
        };

        await service.addMeasurement?.(clientId, newMeasurement);

        onSave(newMeasurement);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>

            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <h2>Add Measurement</h2>

                <div className="form-grid">

                    <input name="height" placeholder="Height" onChange={handleChange} />
                    <input name="weight" placeholder="Weight" onChange={handleChange} />

                    <input name="muscularMassPercent" placeholder="Muscle %" onChange={handleChange} />
                    <input name="fatMassPercent" placeholder="Fat %" onChange={handleChange} />

                    <input name="boneMassPercent" placeholder="Bone %" onChange={handleChange} />
                    <input name="leanBodyMassPercent" placeholder="Lean %" onChange={handleChange} />

                </div>

                <div className="modal-actions">

                    <button onClick={handleSubmit} className="save-btn">
                        Save
                    </button>

                    <button onClick={onClose} className="cancel-btn">
                        Cancel
                    </button>

                </div>

            </div>

        </div>
    );
};

export default AddMeasurementModal;