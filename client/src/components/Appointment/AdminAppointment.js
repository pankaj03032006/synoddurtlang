import React, { useState } from 'react';
import styles from './Appointment.module.css';
import ErrorDialogueBox from '../MUIDialogueBox/ErrorDialogueBox';
import Box from '@mui/material/Box';
import MyCalendar from '../Datepicker/MyCalendar';
import axios from "axios";
import { BootstrapDialog, BootstrapDialogTitle } from "../MUIDialogueBox/BoostrapDialogueBox";
import DialogContent from '@mui/material/DialogContent';
import AppointmentForm from '../Forms/AppointmentForm';
import AppointmentTable from '../MUITable/AppointmentTable';
import useAppointments from '../../hooks/useAppointments';

function AdminAppointment() {
    const [clickedTimeSlot, setClickedTimeSlot] = useState('');
    const [openDialogueBox, setOpenDialogueBox] = useState(false);
    const [errorDialogueBoxOpen, setErrorDialogueBoxOpen] = useState(false);
    const [errorList, setErrorList] = useState([]);

    const {
        date,
        setDate,
        availableSlots,
        bookedAppointments,
        departmentList,
        doctorList,
        patientList,
        departmentSelected,
        setDepartmentSelected,
        doctorSelected,
        setDoctorSelected,
        getAvailableSlots,
        getBookedSlots,
        deleteBookedSlots,
        formatDateForDateInput,
        getformDate,
        loading
    } = useAppointments('admin');

    const handleErrorDialogueOpen = () => setErrorDialogueBoxOpen(true);
    const handleErrorDialogueClose = () => {
        setErrorList([]);
        setErrorDialogueBoxOpen(false);
    };

    const handleClickOpen = () => setOpenDialogueBox(true);
    const handleClose = () => setOpenDialogueBox(false);

    const handleDepartmentChange = (event) => {
        setDepartmentSelected(event.target.value);
        setDoctorSelected("");
    };

    const handleDoctorChange = (event) => {
        setDoctorSelected(event.target.value);
    };

    const addAppointmentFormSubmitted = async (event) => {
        event.preventDefault();
        const form = document.forms.addAppointment;
        let reqObj = {
            "appDate": form.appDate.value,
            "appTime": form.appTime.value,
            "doctorId": form.doctor.value,
            "patientId": form.patient.value
        };

        try {
            let response = await axios.put(`https://hospital-management-system-2-dni5.onrender.com/appointments/`, reqObj, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (response.data.message === "success") {
                await Promise.all([getAvailableSlots(), getBookedSlots()]);
            }
            handleClose();
        } catch (error) {
            console.error("Error creating appointment:", error);
            setErrorList([error.response?.data?.message || "Failed to create appointment"]);
            handleErrorDialogueOpen();
        }
    };

    const slotClicked = (slot) => {
        setClickedTimeSlot(slot);
        handleClickOpen();
    };

    const handleCreateSlotSubmit = async (event) => {
        event.preventDefault();
        const form = document.forms.createSlotForm;
        let timeSlots = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
            .map(input => input.value);
        
        if (!(timeSlots.length > 0)) {
            setErrorList(["Please choose a time slot"]);
            handleErrorDialogueOpen();
        } else {
            try {
                let response = await axios.post(`https://hospital-management-system-2-dni5.onrender.com/appointments/add`, {
                    'appDate': getformDate(form.appDate.value),
                    'timeSlots': timeSlots,
                    'doctorID': form.doctor.value
                }, {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });
                if (response.data.message === "success") {
                    await Promise.all([getAvailableSlots(), getBookedSlots()]);
                    form.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
                }
            } catch (error) {
                setErrorList(error.response?.data?.errors || ["An error occurred"]);
                handleErrorDialogueOpen();
            }
        }
    };

    const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"];

    return (
        <Box id={styles.appointmentMain} component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div>
                <h3 className={styles.pageTitle}>Appointments Management</h3>
            </div>

            <div id={styles.slotGrid}>
                <div id={styles.calendarDiv}>
                    <MyCalendar date={date} setDate={setDate} />
                </div>
                
                <div id={styles.slotCreationDiv}>
                    <form name='createSlotForm' id="createSlotForm" onSubmit={handleCreateSlotSubmit}>
                        <h4>Create New Slots</h4>
                        
                        <div className='my-4 row'>
                            <div className='col-12'>
                                <label htmlFor="department" className="col-sm-3 col-form-label">Department: </label>
                                <select 
                                    name="department" 
                                    id="department" 
                                    className="col-form-select col-sm-7" 
                                    aria-label="Default select example" 
                                    onChange={handleDepartmentChange}
                                    value={departmentSelected}
                                >
                                    <option value=''>All Departments</option>
                                    {departmentList.map(sp => (
                                        <option key={sp} value={sp}>{sp}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='my-4 row'>
                            <div className='col-12'>
                                <label htmlFor="doctor" className="col-sm-3 col-form-label">Doctor: </label>
                                <select 
                                    name="doctor" 
                                    id="doctor" 
                                    className="col-form-select col-sm-7" 
                                    aria-label="Default select example" 
                                    required
                                    onChange={handleDoctorChange}
                                    value={doctorSelected}
                                >
                                    <option value=''>Choose Doctor</option>
                                    {doctorList.map(doctor => (
                                        <option key={doctor._id} value={doctor._id}>
                                            Dr. {doctor.userId.firstName} {doctor.userId.lastName} - {doctor.department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className='my-4 row'>
                            <div className="col-12">
                                <label htmlFor="appDate" className="col-sm-3 col-form-label">Date: </label>
                                <input 
                                    id="appDate" 
                                    name="appDate" 
                                    type="date" 
                                    className="col-form-control col-sm-7"
                                    value={formatDateForDateInput(date)}
                                    onChange={(e) => setDate(getformDate(e.target.value))}
                                />
                            </div>
                        </div>

                        <h4>Select Time Slots</h4>
                        <div className='my-4 row'>
                            <label className="col-sm-3 col-form-label">Time slots: </label>
                            <span className='col-sm-9'>
                                {timeSlots.map((slot) => {
                                    if (!(availableSlots.includes(slot))) {
                                        return (
                                            <div key={slot} className="form-check form-check-inline px-3 py-1">
                                                <input className="form-check-input" type="checkbox" id={slot} value={slot} />
                                                <label className="form-check-label" htmlFor={slot}>{slot}</label>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </span>
                        </div>

                        <button type='submit' className='btn btn-success float-end py-2 px-4'>Create Slots</button>
                    </form>
                </div>
            </div>

            {availableSlots.length > 0 && (
                <div className={styles.availableSlotsHeader}>
                    <h4 className="mt-5">Available Slots</h4>
                    <p>Click on any slot to book an appointment for a patient</p>
                    <div className='d-flex flex-wrap'>
                        {availableSlots.map(slot => (
                            <div key={slot} onClick={() => slotClicked(slot)} className={styles.slotCard}>
                                {slot}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && <div className="text-center mt-5"><p>Loading...</p></div>}

            {bookedAppointments.length > 0 && (
                <div className={styles.availableSlotsHeader}>
                    <h4 className="mt-5">Booked Appointments</h4>
                    <AppointmentTable
                        bookedAppointments={bookedAppointments}
                        deleteBookedSlots={deleteBookedSlots}
                        doctorList={doctorList}
                        patientList={patientList}
                        availableSlots={availableSlots}
                        getAvailableSlots={getAvailableSlots}
                        getBookedSlots={getBookedSlots}
                    />
                </div>
            )}

            <ErrorDialogueBox
                open={errorDialogueBoxOpen}
                handleToClose={handleErrorDialogueClose}
                ErrorTitle="Error"
                ErrorList={errorList}
            />

            <BootstrapDialog onClose={handleClose} open={openDialogueBox} maxWidth="md" fullWidth>
                <BootstrapDialogTitle onClose={handleClose}>
                    Book Appointment
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <AppointmentForm
                        formName="addAppointment"
                        formOnSubmit={addAppointmentFormSubmitted}
                        appDate={formatDateForDateInput(date)}
                        appTime={clickedTimeSlot}
                        doctorList={doctorList}
                        doctorSelected={doctorSelected}
                        patientList={patientList}
                        availableSlots={availableSlots}
                    />
                </DialogContent>
            </BootstrapDialog>
        </Box>
    );
}

export default AdminAppointment;