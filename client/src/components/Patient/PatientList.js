import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import PatientTable from '../MUITable/PatientTable';

function PatientList() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const navigate = useNavigate();

    const [patients, setPatient] = useState([]);
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
        setLoading(true);
        try {
            const response = await axios.get("https://hospital-management-system-2-dni5.onrender.com/patients", {
                params: {
                    name: name
                }
            });
            setPatient(response.data);
            setErrorList([]);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch patients";
            setErrorList([errorMessage]);
            handleDialogueOpen();
        } finally {
            setLoading(false);
        }
    }, [name]);

    useEffect(() => {
        getPatients();
    }, [getPatients]);

    const deletePatient = async (id) => {
        try {
            await axios.delete(`https://hospital-management-system-2-dni5.onrender.com/patients/${id}`);
            await getPatients();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete patient";
            setErrorList([errorMessage]);
            handleDialogueOpen();
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const searchName = formData.get('name');
        if (searchName) {
            navigate(`/patients?name=${searchName}`);
        } else {
            navigate(`/patients`);
        }
    };

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div className="page-wrapper">
                <div className="content">
                    <div className="row">
                        <div className="col-sm-4 col-3">
                            <h4 className="page-title">Patient</h4>
                        </div>
                        <div className="col-sm-8 col-9 text-right m-b-20">
                            <Link to="/patients/add" className="btn btn-primary float-right btn-rounded">
                                <i className="fa fa-plus"></i> Add Patient
                            </Link>
                        </div>
                    </div>
                    <form onSubmit={handleSearch} name="userFilter">
                        <div className="row filter-row">
                            <div className="col-sm-4 col-md-4">
                                <div className="form-floating">
                                    <input 
                                        type="text" 
                                        name="name" 
                                        className="form-control" 
                                        placeholder='Patient Name'
                                        defaultValue={name || ''}
                                    />
                                    <label className="focus-label">Patient Name</label>
                                </div>
                            </div>
                            <div className="col-sm-4 col-md-4">
                                <button type="submit" className="btn btn-primary btn-block"> Search </button>
                            </div>
                        </div>
                    </form>
                    
                    {loading ? (
                        <div className="text-center p-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <PatientTable patientList={patients} deletePatient={deletePatient} />
                    )}
                </div>
                <ErrorDialogueBox
                    open={errorDialogueBoxOpen}
                    handleToClose={handleDialogueClose}
                    ErrorTitle="Error: Patient Operation"
                    ErrorList={errorList}
                />
            </div>
        </Box>
    )
}

export default PatientList;