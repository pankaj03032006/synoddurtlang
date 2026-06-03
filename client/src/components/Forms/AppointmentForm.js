import React, { useContext, useState, useEffect, useMemo } from "react";
import { UserContext } from '../../Context/UserContext';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import PropTypes from 'prop-types';

function AppointmentForm(props) {
    const { currentUser } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(props.doctorSelected || '');
    const [selectedPatient, setSelectedPatient] = useState(props.patientSelected || '');

    // Validate form before submission
    const validateForm = () => {
        if (!selectedDoctor) {
            setError('Please select a doctor');
            return false;
        }
        if (!selectedPatient && currentUser?.userType !== "Patient") {
            setError('Please select a patient');
            return false;
        }
        if (!props.appTime) {
            setError('Please select an appointment time');
            return false;
        }
        return true;
    };

    // Handle form submission with loading state
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        console.log("Form submitted - Validating...");
        
        if (!validateForm()) {
            console.log("Validation failed");
            return;
        }
        
        console.log("Validation passed, calling parent onSubmit");
        setLoading(true);
        setError(null);
        
        try {
            await props.formOnSubmit(event);
            console.log("Parent onSubmit completed successfully");
            if (props.onSuccess) {
                props.onSuccess();
            }
        } catch (err) {
            console.error("Error in form submission:", err);
            setError(err.message || 'An error occurred while submitting the form');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel button click
    const handleCancel = () => {
        if (props.onCancel) {
            props.onCancel();
        } else {
            window.location.reload();
        }
    };

    // Reset selected values when props change
    useEffect(() => {
        setSelectedDoctor(props.doctorSelected || '');
        setSelectedPatient(props.patientSelected || '');
    }, [props.doctorSelected, props.patientSelected]);

    // Memoize doctor options for better performance
    const doctorOptions = useMemo(() => {
        if (!props.doctorList) return null;
        
        return props.doctorList.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.userId?.firstName} {doctor.userId?.lastName} - {doctor.department}
            </option>
        ));
    }, [props.doctorList]);

    // Memoize patient options
    const patientOptions = useMemo(() => {
        if (!props.patientList) return null;
        
        return props.patientList.map((patient) => (
            <option key={patient._id} value={patient._id}>
                {patient.userId?.firstName} {patient.userId?.lastName}
            </option>
        ));
    }, [props.patientList]);

    // Generate time slot options
    const timeSlotOptions = useMemo(() => {
        if (!props.availableSlots) return null;
        
        return props.availableSlots.map((slot, index) => (
            <option key={index} value={slot}>
                {slot} {props.appTime === slot ? "(Selected)" : ""}
            </option>
        ));
    }, [props.availableSlots, props.appTime]);

    return (
        <form name={props.formName} onSubmit={handleSubmit}>
            {/* Display error message if any */}
            {error && (
                <Alert severity="error" className="mb-3 mx-3" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <div className="form-row">
                {/* Appointment Date */}
                <div className="form-group col-11 mx-auto mb-3">
                    <label htmlFor="appDate" className="fw-bold mb-2">
                        Appointment Date <span className="text-danger">*</span>
                    </label>
                    <input 
                        type="date" 
                        name="appDate" 
                        id="appDate"
                        className="form-control bg-light" 
                        disabled 
                        defaultValue={props.appDate} 
                        required 
                    />
                    <small className="text-muted">Date is automatically selected from calendar</small>
                </div>

                {/* Appointment Time */}
                <div className="form-group col-11 mx-auto mb-3">
                    <label htmlFor="appTime" className="fw-bold mb-2">
                        Appointment Time <span className="text-danger">*</span>
                    </label>
                    <select 
                        name="appTime" 
                        id="appTime" 
                        className="form-control" 
                        aria-label="Select appointment time" 
                        required
                        defaultValue={props.appTime}
                    >
                        <option value="">Select a time slot</option>
                        {timeSlotOptions}
                    </select>
                    <small className="text-muted">Select your preferred time slot</small>
                </div>

                {/* Doctor Selection */}
                <div className="form-group col-11 mx-auto mb-3">
                    <label htmlFor="doctor" className="fw-bold mb-2">
                        Select Doctor <span className="text-danger">*</span>
                    </label>
                    <select 
                        name="doctor" 
                        id="doctor" 
                        className="form-control" 
                        aria-label="Select doctor" 
                        required 
                        disabled={!!props.doctorSelected}
                        value={selectedDoctor}
                        onChange={(e) => {
                            setSelectedDoctor(e.target.value);
                            setError(null);
                        }}
                    >
                        <option value=''>Choose Doctor</option>
                        {doctorOptions}
                    </select>
                    {props.doctorSelected && (
                        <small className="text-success">
                            <i className="fa fa-check-circle"></i> Doctor selected
                        </small>
                    )}
                </div>

                {/* Patient Selection - Conditional based on user type */}
                <div className="form-group col-11 mx-auto mb-3">
                    <label htmlFor="patient" className="fw-bold mb-2">
                        {currentUser?.userType === "Patient" ? "Your Name" : "Select Patient"} 
                        <span className="text-danger">*</span>
                    </label>
                    
                    {currentUser?.userType === "Patient" ? (
                        <input
                            type="text"
                            name="patient"
                            id="patient"
                            className="form-control bg-light"
                            value={`${currentUser?.firstName} ${currentUser?.lastName}`}
                            disabled
                            readOnly
                        />
                    ) : (
                        <select 
                            name="patient" 
                            id="patient"
                            className="form-control" 
                            value={selectedPatient}
                            onChange={(e) => {
                                setSelectedPatient(e.target.value);
                                setError(null);
                            }}
                            required
                        >
                            <option value=''>Select Patient</option>
                            {patientOptions}
                        </select>
                    )}
                    
                    {currentUser?.userType === "Patient" && (
                        <small className="text-muted">Booking appointment for yourself</small>
                    )}
                </div>

                {/* Additional Info Section */}
                <div className="form-group col-11 mx-auto mb-3">
                    <div className="alert alert-info">
                        <i className="fa fa-info-circle"></i> 
                        <strong> Appointment Information:</strong>
                        <ul className="mb-0 mt-2">
                            <li>Please arrive 15 minutes before your scheduled time</li>
                            <li>Bring your previous medical reports if any</li>
                            <li>Carry your ID proof for verification</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Hidden field for appointment ID */}
            {props.appointmentId && (
                <input type="hidden" name="id" defaultValue={props.appointmentId} />
            )}

            {/* Submit Button */}
            <div className="text-center mt-4">
                <button 
                    type="submit" 
                    className="btn btn-primary px-5 py-2" 
                    id="customBtn" 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <CircularProgress size={20} color="inherit" />
                            <span className="ms-2">Processing...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa fa-check-circle me-2"></i>
                            Confirm Appointment
                        </>
                    )}
                </button>
                <button 
                    type="button" 
                    className="btn btn-secondary px-5 py-2 ms-2" 
                    onClick={handleCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

// PropTypes for better documentation and type checking
AppointmentForm.propTypes = {
    formName: PropTypes.string,
    doctorSelected: PropTypes.string,
    patientSelected: PropTypes.string,
    appDate: PropTypes.string.isRequired,
    appTime: PropTypes.string,
    availableSlots: PropTypes.arrayOf(PropTypes.string),
    doctorList: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        userId: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string
        }),
        department: PropTypes.string
    })),
    patientList: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string.isRequired,
        userId: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string
        })
    })),
    formOnSubmit: PropTypes.func.isRequired,
    appointmentId: PropTypes.string,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func
};

// Default props
AppointmentForm.defaultProps = {
    formName: 'appointmentForm',
    doctorSelected: '',
    patientSelected: '',
    appTime: '',
    availableSlots: [],
    doctorList: [],
    patientList: [],
    appointmentId: '',
    onCancel: null,
    onSuccess: null
};

export default AppointmentForm;