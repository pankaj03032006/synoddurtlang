import React, { useEffect, useState, useCallback, useMemo } from 'react'; // Removed unused useContext
import axios from "axios";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import PrescriptionTable from '../MUITable/PrescriptionTable';
// Removed unused UserContext
import moment from 'moment';

function PrescriptionList() {
    const params = useMemo(() => new URLSearchParams(window.location.search), []);

    const [prescriptions, setPrescription] = useState([]);
    const [loading, setLoading] = useState(false);

    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);
    
    const handleDialogueOpen = () => {
        setErrorDialogueBoxOpen(true)
    };
    
    const handleDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false)
    };

    const getPatients = useCallback(async () => {
        try {
            await axios.get("https://hospital-management-system-2-dni5.onrender.com/patients", {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            // Patient list data is not being used, so we don't need to store it
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch patients";
            setErrorList([errorMessage]);
            handleDialogueOpen();
        }
    }, []);

    const getDoctors = useCallback(async () => {
        try {
            await axios.get("https://hospital-management-system-2-dni5.onrender.com/doctors", {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            // Doctor list data is not being used, so we don't need to store it
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch doctors";
            setErrorList([errorMessage]);
            handleDialogueOpen();
        }
    }, []);

    const getPrescription = useCallback(async () => {
        const patientId = params.get('patientId');
        const doctorId = params.get('doctorId');

        let reqObj = {};
        
        if (doctorId) {
            reqObj.doctorId = doctorId;
        }

        if (patientId) {
            reqObj.patientId = patientId;
        }
        
        setLoading(true);
        
        try {
            const response = await axios.post(`https://hospital-management-system-2-dni5.onrender.com/prescriptions`, reqObj,
                {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            
            if (response.data.message === "success") {
                let respPrescription = response.data.prescriptions;
                let newResp = respPrescription.sort((a, b) => {
                    const timeA = new Date(`${moment(new Date(a.appointmentId.appointmentDate.slice(0, -1))).format('MM/DD/YYYY')} ${a.appointmentId.appointmentTime}`);
                    const timeB = new Date(`${moment(new Date(b.appointmentId.appointmentDate.slice(0, -1))).format('MM/DD/YYYY')} ${b.appointmentId.appointmentTime}`);
                    return timeB - timeA;
                });
                setPrescription(newResp);
            } else {
                setPrescription([]);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch prescriptions";
            setErrorList([errorMessage]);
            handleDialogueOpen();
            setPrescription([]);
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => {
        getPrescription();
        getPatients();
        getDoctors();
    }, [getPrescription, getPatients, getDoctors]);

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div className="page-wrapper">
                <div className="content">
                    <h4 className="page-title">Prescription</h4>
                    
                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                            <p>Loading prescriptions...</p>
                        </div>
                    ) : (
                        <PrescriptionTable prescriptionList={prescriptions} />
                    )}
                </div>
                <ErrorDialogueBox
                    open={errorDialogueBoxOpen}
                    handleToClose={handleDialogueClose}
                    ErrorTitle="Error: Prescription Operation"
                    ErrorList={errorList}
                />
            </div>
        </Box>
    )
}

export default PrescriptionList;