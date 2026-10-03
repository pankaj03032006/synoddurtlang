import React, { useContext, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import styles from "./Appointment.module.css";
import MyCalendar from "../Datepicker/MyCalendar";
import DoctorAppointmentTable from "../MUITable/DoctorAppointmentTable";
import PrescriptionForm from "../Forms/PrescriptionForm";
import { UserContext } from "../../Context/UserContext";
import useAppointments from "../../hooks/useAppointments";
import api from "../../utils/api";

const getPatientName = (appointment) => {
    const user = appointment?.patientId?.userId;
    if (!user) return "Unknown Patient";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown Patient";
};

function DoctorAppointment() {
    const { currentUser } = useContext(UserContext);
    const doctorId = currentUser?.doctorId || currentUser?._id;

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [prescriptionLoading, setPrescriptionLoading] = useState(false);

    const {
        date,
        setDate,
        availableSlots,
        bookedAppointments,
        patientList,
        doctorList,
        deleteBookedSlots,
        getAvailableSlots,
        getBookedSlots,
        formatDateForDateInput,
        getformDate,
        loading,
    } = useAppointments("doctor", doctorId);

    const closePrescriptionDialog = () => {
        if (!prescriptionLoading) setSelectedAppointment(null);
    };

    const handleSavePrescription = async (event, prescriptionData) => {
         console.log("🎯 handleSavePrescription CALLED", { prescriptionData }); 
        event?.preventDefault();
        setPrescriptionLoading(true);

        try {
            const { data } = await api.post("/prescription", prescriptionData);
            console.log("SAVE RESPONSE:", data); 
            if (data.message !== "success" || !data.prescription?._id) {
                throw new Error("Failed to save prescription");
            }

            setSelectedAppointment(null);
            await getBookedSlots(); // refresh the table
        } catch (error) {
            console.error("Error saving prescription:", error);
            throw error; // the form shows the error message
        } finally {
            setPrescriptionLoading(false);
        }
    };

    const renderSlots = () => {
        if (loading) return <p>Loading slots...</p>;

        if (availableSlots.length === 0) {
            return (
                <div className="alert alert-info mt-3">
                    <i className="fa fa-info-circle"></i> No available slots for the selected date.
                    Please check another date.
                </div>
            );
        }

        return (
            <div className="d-flex flex-wrap gap-2">
                {availableSlots.map((slot) => (
                    <div key={slot} className={styles.slotCardDisabled}>
                        {slot}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Box id={styles.appointmentMain} component="main" sx={{ flexGrow: 1, p: 3 }}>
            <h3 className={styles.pageTitle}>My Appointments Schedule</h3>

            <div id={styles.slotGrid}>
                <div id={styles.calendarDiv}>
                    <MyCalendar date={date} setDate={setDate} />
                </div>

                <div id={styles.slotCreationDiv}>
                    <div className="doctor-info-card">
                        <h4>
                            Welcome, Dr. {currentUser?.firstName} {currentUser?.lastName}
                        </h4>
                        <p>Manage your appointments and schedule below</p>
                    </div>

                    <div className="mt-4 row">
                        <div className="col-12">
                            <label htmlFor="appDate" className="col-sm-3 col-form-label fw-bold">
                                Select Date:
                            </label>
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

                    <div className="row mt-4">
                        <div className={styles.availableSlotsHeader}>
                            <h4 className="mt-3">
                                Available Slots for {formatDateForDateInput(date)}
                            </h4>
                            {renderSlots()}
                        </div>
                    </div>
                </div>
            </div>

            {bookedAppointments.length > 0 ? (
                <div className={styles.availableSlotsHeader}>
                    <h4 className="mt-5">My Scheduled Appointments</h4>
                    <DoctorAppointmentTable
                        bookedAppointments={bookedAppointments}
                        deleteBookedSlots={deleteBookedSlots}
                        doctorList={doctorList}
                        patientList={patientList}
                        availableSlots={availableSlots}
                        getAvailableSlots={getAvailableSlots}
                        getBookedSlots={getBookedSlots}
                        onWritePrescription={setSelectedAppointment}
                    />
                </div>
            ) : (
                !loading && (
                    <div className="text-center mt-5 p-5 bg-light rounded">
                        <i className="fa fa-calendar-check-o fa-3x text-success mb-3"></i>
                        <h5>No appointments scheduled for this date</h5>
                        <p className="text-muted">Select a different date to view your schedule</p>
                    </div>
                )
            )}

            <Dialog
                open={Boolean(selectedAppointment)}
                onClose={closePrescriptionDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Create Prescription for {getPatientName(selectedAppointment)}
                </DialogTitle>
                <DialogContent>
                    {selectedAppointment && (
                        <PrescriptionForm
                            formName="prescriptionForm"
                            appointmentId={selectedAppointment._id}
                            patientSelected={selectedAppointment.patientId?._id}
                            patientName={getPatientName(selectedAppointment)}
                            patientList={patientList}
                            doctorId={doctorId}
                            formOnSubmit={handleSavePrescription}
                            onCancel={closePrescriptionDialog}
                            onSuccess={() => {
                                setSelectedAppointment(null);
                                getBookedSlots();
                            }}
                            prescriptionLoading={prescriptionLoading}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Backdrop open={prescriptionLoading} sx={{ color: "#fff", zIndex: 9999 }}>
                <CircularProgress color="inherit" />
                <span style={{ marginLeft: 10 }}>Saving prescription...</span>
            </Backdrop>
        </Box>
    );
}

export default DoctorAppointment;