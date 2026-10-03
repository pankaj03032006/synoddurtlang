import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import moment from "moment";

import ErrorDialogueBox from "../MUIDialogueBox/ErrorDialogueBox";
import PrescriptionTable from "../MUITable/PrescriptionTable";
import api from "../../utils/api";
import { getErrorMessages } from "../../utils/getErrorMessages";

// Appointment date + time as a timestamp (0 if missing or invalid)
const getAppointmentTime = ({ appointmentId }) => {
    if (!appointmentId?.appointmentDate) return 0;
    const day = moment.utc(appointmentId.appointmentDate).format("YYYY-MM-DD");
    const parsed = moment(`${day} ${appointmentId.appointmentTime}`, "YYYY-MM-DD h:mm A");
    return parsed.isValid() ? parsed.valueOf() : 0;
};

function PrescriptionList() {
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get("patientId");
    const doctorId = searchParams.get("doctorId");

    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorList, setErrorList] = useState([]);

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true);

        const body = {};
        if (patientId) body.patientId = patientId;
        if (doctorId) body.doctorId = doctorId;

        try {
            const { data } = await api.post("/prescriptions", body);

            if (data.message === "success") {
                const sorted = [...data.prescriptions].sort(
                    (a, b) => getAppointmentTime(b) - getAppointmentTime(a)
                );
                setPrescriptions(sorted);
            } else {
                setPrescriptions([]);
            }
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            setErrorList(getErrorMessages(error, "Failed to fetch prescriptions"));
            setPrescriptions([]);
        } finally {
            setLoading(false);
        }
    }, [patientId, doctorId]);

    useEffect(() => {
        fetchPrescriptions();
    }, [fetchPrescriptions]);

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div className="page-wrapper">
                <div className="content">
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Prescriptions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            View and pay for prescriptions issued to you.
                        </Typography>
                    </Box>

                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p>Loading prescriptions...</p>
                        </div>
                    ) : (
                        <PrescriptionTable
                            prescriptionList={prescriptions}
                            loading={loading}
                            onRefresh={fetchPrescriptions}
                        />
                    )}
                </div>

                <ErrorDialogueBox
                    open={errorList.length > 0}
                    handleToClose={() => setErrorList([])}
                    ErrorTitle="Error: Prescription Operation"
                    ErrorList={errorList}
                />
            </div>
        </Box>
    );
}

export default PrescriptionList;