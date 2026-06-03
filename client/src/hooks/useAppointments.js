import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';

const useAppointments = (role, doctorId = null) => {
    const [date, setDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [doctorList, setDoctorList] = useState([]);
    const [patientList, setPatientList] = useState([]);
    const [departmentSelected, setDepartmentSelected] = useState("");
    const [doctorSelected, setDoctorSelected] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getformDate = (mydate) => {
        if (!mydate) return new Date();
        const parts = mydate.split('-');
        return new Date(+parts[0], parts[1] - 1, +parts[2], 12);
    };

    const formatDateForDateInput = (dateOfJoining) => {
        if (!dateOfJoining) return '';
        return moment(new Date(dateOfJoining)).format('YYYY-MM-DD');
    };

    const getAvailableSlots = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const requestBody = {
                'isTimeSlotAvailable': true,
                'appDate': formatDateForDateInput(date)
            };
            
            if (role !== 'doctor' && doctorSelected) {
                requestBody.doctorID = doctorSelected;
            } else if (role === 'doctor' && doctorId) {
                requestBody.doctorID = doctorId;
            } else if (!doctorSelected && role !== 'doctor') {
                setAvailableSlots([]);
                setLoading(false);
                return;
            }

            const response = await axios.post(`https://hospital-management-system-2-dni5.onrender.com/appointments`, requestBody, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            
            if (response.data.message === "success") {
                let slots = response.data.appointments.map(apt => apt.appointmentTime);
                slots.sort((a, b) => {
                    const timeA = new Date(`01/01/2000 ${a}`);
                    const timeB = new Date(`01/01/2000 ${b}`);
                    return timeA - timeB;
                });
                setAvailableSlots(slots);
            } else {
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error("Error fetching available slots:", error);
            setError(error.response?.data?.message || error.message || "Failed to fetch available slots");
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    }, [date, doctorSelected, role, doctorId]);

    const getBookedSlots = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const requestBody = {
                'isTimeSlotAvailable': false,
                'appDate': formatDateForDateInput(date)
            };
            
            if (role !== 'doctor' && doctorSelected) {
                requestBody.doctorID = doctorSelected;
            } else if (role === 'doctor' && doctorId) {
                requestBody.doctorID = doctorId;
            } else if (!doctorSelected && role !== 'doctor') {
                setBookedSlots([]);
                setBookedAppointments([]);
                setLoading(false);
                return;
            }

            const response = await axios.post(`https://hospital-management-system-2-dni5.onrender.com/appointments`, requestBody, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            
            if (response.data.message === "success") {
                let aptms = response.data.appointments;
                let sortedAptms = aptms.sort((a, b) => {
                    const timeA = new Date(`01/01/2000 ${a.appointmentTime}`);
                    const timeB = new Date(`01/01/2000 ${b.appointmentTime}`);
                    return timeA - timeB;
                });
                setBookedAppointments(sortedAptms);
                
                let slots = aptms.map(apt => apt.appointmentTime);
                slots.sort((a, b) => {
                    const timeA = new Date(`01/01/2000 ${a}`);
                    const timeB = new Date(`01/01/2000 ${b}`);
                    return timeA - timeB;
                });
                setBookedSlots(slots);
            } else {
                setBookedSlots([]);
                setBookedAppointments([]);
            }
        } catch (error) {
            console.error("Error fetching booked slots:", error);
            setError(error.response?.data?.message || error.message || "Failed to fetch booked slots");
            setBookedSlots([]);
            setBookedAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [date, doctorSelected, role, doctorId]);

    const deleteBookedSlots = async (appId) => {
        if (!appId) {
            setError("No appointment ID provided for deletion");
            return false;
        }

        try {
            const response = await axios.delete(`https://hospital-management-system-2-dni5.onrender.com/appointments/`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                data: {
                    appointmentId: appId,
                },
            });
            if (response.data.message === "success") {
                await Promise.all([getAvailableSlots(), getBookedSlots()]);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error deleting appointment:", error);
            setError(error.response?.data?.message || error.message || "Failed to delete appointment");
            return false;
        }
    };

    const getDoctorList = useCallback(async () => {
        try {
            const response = await axios.get(`https://hospital-management-system-2-dni5.onrender.com/doctors`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            let doctors = response.data;
            if (doctors && doctors.length > 0) {
                if (!departmentSelected) {
                    setDoctorList(doctors);
                } else {
                    let filteredDocs = doctors.filter((doc) => {
                        return doc.department === departmentSelected;
                    });
                    setDoctorList(filteredDocs);
                }
            } else {
                setDoctorList([]);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setError(error.response?.data?.message || error.message || "Failed to fetch doctors");
            setDoctorList([]);
        }
    }, [departmentSelected]);

    const getDepartmentList = useCallback(async () => {
        try {
            const response = await axios.get(`https://hospital-management-system-2-dni5.onrender.com/departments`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            let departments = response.data.departments;
            if (departments && departments.length > 0) {
                setDepartmentList(departments);
            } else {
                setDepartmentList([]);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
            setError(error.response?.data?.message || error.message || "Failed to fetch departments");
            setDepartmentList([]);
        }
    }, []);

    const getPatients = useCallback(async () => {
        try {
            const response = await axios.get("https://hospital-management-system-2-dni5.onrender.com/patients", {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setPatientList(response.data || []);
        } catch (error) {
            console.error("Error fetching patients:", error);
            setError(error.response?.data?.message || error.message || "Failed to fetch patients");
            setPatientList([]);
        }
    }, []);

    useEffect(() => {
        getDepartmentList();
        getDoctorList();
        getPatients();
    }, [getDepartmentList, getDoctorList, getPatients]);

    useEffect(() => {
        if (role === 'doctor' && doctorId) {
            getAvailableSlots();
            getBookedSlots();
        } else if (role !== 'doctor' && doctorSelected) {
            getAvailableSlots();
            getBookedSlots();
        }
    }, [date, doctorSelected, getAvailableSlots, getBookedSlots, role, doctorId]);

    return {
        date,
        setDate,
        availableSlots,
        bookedSlots,
        bookedAppointments,
        departmentList,
        doctorList,
        patientList,
        departmentSelected,
        setDepartmentSelected,
        doctorSelected,
        setDoctorSelected,
        loading,
        error,
        getAvailableSlots,
        getBookedSlots,
        deleteBookedSlots,
        getDoctorList,
        getDepartmentList,
        getPatients,
        formatDateForDateInput,
        getformDate
    };
};

export default useAppointments;