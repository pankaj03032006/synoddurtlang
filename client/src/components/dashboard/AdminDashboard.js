import styles from './Dashboard.module.css';
import {  useState, useEffect, useContext } from 'react';
import Box from '@mui/material/Box';
import axios from "axios";
import { NavLink } from 'react-router-dom';
import moment from "moment";
import { UserContext } from '../../Context/UserContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
    const [doctorCount, setDoctorCount] = useState(0);
    const [patientCount, setPatientCount] = useState(0);
    const [appsTodayCount, setAppsTodayCount] = useState(0);
    const [pendingAppsTodayCount, setPendingAppsTodayCount] = useState(0);
    const [bookedAppointments, setBookedAppointments] = useState([]);
    const [doctors, setdoctor] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [medicineCount, setMedicineCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const { currentUser } = useContext(UserContext);

    const authHeaders = () => ({
        authorization: `Bearer ${localStorage.getItem("token")}`
    });

    // -------- COUNTS --------
    const getUserCountByRole = async (userType) => {
        try {
            const response = await axios.post(
                `${API}/count/users`,
                { userType },
                { headers: authHeaders() }
            );
            const count = response.data.count;
            if (count != null) {
                if (userType === "Doctor") setDoctorCount(count);
                else if (userType === "Patient") setPatientCount(count);
            }
        } catch (error) {
            console.error(`Error fetching ${userType} count:`, error);
        }
    };

    const getAppointmentCount = async () => {
        try {
            const response = await axios.get(
                `${API}/count/appointments`,
                { headers: authHeaders() }
            );
            if (response?.data?.totalAppointments != null) {
                setAppsTodayCount(response.data.totalAppointments);
            }
            if (response?.data?.pendingAppointments != null) {
                setPendingAppsTodayCount(response.data.pendingAppointments);
            }
        } catch (error) {
            console.error("Error fetching appointment count:", error);
        }
    };

    const getBookedSlots = async () => {
        try {
            const response = await axios.post(
                `${API}/appointments`,
                {
                    isTimeSlotAvailable: false,
                    appDate: moment(new Date()).format('YYYY-MM-DD')
                },
                { headers: authHeaders() }
            );
            if (response.data.message === "success") {
                setBookedAppointments(response.data.appointments || []);
            } else {
                setBookedAppointments([]);
            }
        } catch (error) {
            console.error("Error fetching booked slots:", error);
            setBookedAppointments([]);
        }
    };

    const getdoctors = async () => {
        try {
            const response = await axios.get(`${API}/doctors`);
            setdoctor(response.data || []);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setdoctor([]);
        }
    };

    // -------- PRESCRIPTIONS (POST, not GET) --------
    const getRecentPrescriptions = async () => {
        try {
            const response = await axios.post(
                `${API}/prescriptions`,
                {},
                { headers: authHeaders() }
            );

            // Backend returns { message: "success", prescriptions: [...], count: N }
            const list = response.data.prescriptions || [];

            // Backend already sorts newest first; take the top 5
            setPrescriptions(list.slice(0, 5));
        } catch (error) {
            console.error("Error fetching prescriptions:", error);
            setPrescriptions([]);
        }
    };

    const getMedicineStats = async () => {
        try {
            const response = await axios.get(
                `${API}/medicines`,
                { headers: authHeaders() }
            );
            const medicines = Array.isArray(response.data)
                ? response.data
                : response.data.medicines || [];

            setMedicineCount(medicines.length);
            const lowStock = medicines.filter(
                (med) => med.quantity < 10 && med.quantity > 0
            ).length;
            setLowStockCount(lowStock);
        } catch (error) {
            console.error("Error fetching medicines:", error);
        }
    };

    useEffect(() => {
        getUserCountByRole("Doctor");
        getUserCountByRole("Patient");
        getAppointmentCount();
        getBookedSlots();
        getdoctors();
        getRecentPrescriptions();
        getMedicineStats();
    }, []);

    return (
        <Box className={styles.dashboardBody} component="main" sx={{ flexGrow: 1, p: 3 }}>
            <div id={styles.welcomeBanner}>
                <div className='text-white'>
                    <h3>Welcome!</h3>
                    <br />
                    <h4>{currentUser?.firstName} {currentUser?.lastName}</h4>
                    <br />
                    <div className={styles.horizontalLine}></div>
                    At Synod Hospital, we believe that every patient deserves the highest quality care possible.
                    <br />
                    Our commitment to excellence in healthcare is matched only by our compassion for those we serve.
                </div>
            </div>

            {/* Statistics Cards */}
            <div className={styles.statCardGrid}>
                <div className={styles.statCard}>
                    <div className={styles.dashWidget}>
                        <span className={styles.dashWidgetBg1}><i className="fa fa-stethoscope" aria-hidden="true"></i></span>
                        <div className={styles.dashWidgetInfo}>
                            <h3 className={styles.dashWidgetInfoH3}>{doctorCount}</h3>
                            <span className={styles.widgetTitle1}>Doctors <i className="fa fa-check" aria-hidden="true"></i></span>
                        </div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.dashWidget}>
                        <span className={styles.dashWidgetBg2}><i className="fa fa-user-o" aria-hidden="true"></i></span>
                        <div className={styles.dashWidgetInfo}>
                            <h3 className={styles.dashWidgetInfoH3}>{patientCount}</h3>
                            <span className={styles.widgetTitle2}>Patients <i className="fa fa-check" aria-hidden="true"></i></span>
                        </div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.dashWidget}>
                        <span className={styles.dashWidgetBg3}><i className="fa fa-calendar" aria-hidden="true"></i></span>
                        <div className={styles.dashWidgetInfo}>
                            <h3 className={styles.dashWidgetInfoH3}>{appsTodayCount}</h3>
                            <span className={styles.widgetTitle3}>Appointments Today <i className="fa fa-check" aria-hidden="true"></i></span>
                        </div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.dashWidget}>
                        <span className={styles.dashWidgetBg4}><i className="fa fa-heartbeat" aria-hidden="true"></i></span>
                        <div className={styles.dashWidgetInfo}>
                            <h3 className={styles.dashWidgetInfoH3}>{pendingAppsTodayCount}</h3>
                            <span className={styles.widgetTitle4}>Pending Appointments <i className="fa fa-check" aria-hidden="true"></i></span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Upcoming Appointments */}
                <div className="col-12 col-lg-8 col-xl-8">
                    <div className="card appointment-panel">
                        <div className="card-header">
                            <h4 className="card-title d-inline-block">Upcoming Appointments</h4>
                            <NavLink to="/admin/dashboard/appointments" className="btn btn-primary float-end">View all</NavLink>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead className="d-none">
                                        <tr>
                                            <th>Patient Name</th>
                                            <th>Doctor Name</th>
                                            <th>Timing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookedAppointments?.map((apt, index) => (
                                            <tr key={index}>
                                                <td className={styles.appointmentTableTd}>
                                                    <span className="avatar">
                                                        {apt?.patientId?.userId?.firstName?.charAt(0) || '?'}
                                                    </span>
                                                    <h2 className='ps-3'>
                                                        <span>
                                                            {apt?.patientId?.userId?.firstName} {apt?.patientId?.userId?.lastName}
                                                            {' '}
                                                            <span>{apt?.patientId?.address}</span>
                                                        </span>
                                                    </h2>
                                                </td>
                                                <td>
                                                    <h5 className="time-title p-0">Appointment With</h5>
                                                    <p>Dr. {apt?.doctorId?.userId?.firstName} {apt?.doctorId?.userId?.lastName}</p>
                                                </td>
                                                <td>
                                                    <h5 className="time-title p-0">Timing</h5>
                                                    <p>{apt?.appointmentTime}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!bookedAppointments || bookedAppointments.length === 0) && (
                                    <h3 className='mt-5 text-center'>You have no appointments today</h3>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctors */}
                <div className="col-12 col-lg-4 col-xl-4">
                    <div className="card member-panel">
                        <div className="card-header bg-white">
                            <h4 className="card-title mb-0">Doctors</h4>
                        </div>
                        <div className="card-body">
                            <ul className="contact-list">
                                {doctors?.map((doc, index) => (
                                    <li key={index}>
                                        <div className="contact-cont">
                                            <div className="float-left user-img m-r-10">
                                                <span className="status online"></span>
                                            </div>
                                            <div className="contact-info">
                                                <span className="contact-name text-ellipsis">
                                                    {doc.userId?.firstName} {doc.userId?.lastName}
                                                </span>
                                                <span className="contact-date">{doc.department}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="card-footer text-center bg-white">
                            <NavLink to="/admin/dashboard/doctors" className="text-muted">View all Doctors</NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title d-inline-block">Recent Prescriptions</h4>
                            <NavLink to="/admin/dashboard/prescriptions" className="btn btn-primary float-end">
                                View all Prescriptions
                            </NavLink>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Patient Name</th>
                                            <th>Doctor Name</th>
                                            <th>Medicines</th>
                                            <th>Date</th>
                                            <th>Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prescriptions.length > 0 ? (
                                            prescriptions.map((prescription) => {
                                                const apt = prescription.appointmentId || {};
                                                const patient = apt.patientId?.userId || {};
                                                const doctor = apt.doctorId?.userId || {};
                                                const meds = prescription.prescribedMed || [];

                                                return (
                                                    <tr key={prescription._id}>
                                                        <td>
                                                            {patient.firstName} {patient.lastName}
                                                        </td>
                                                        <td>
                                                            Dr. {doctor.firstName} {doctor.lastName}
                                                        </td>
                                                        <td>
                                                            {meds.length === 0 ? (
                                                                <span className="text-muted">—</span>
                                                            ) : (
                                                                <ul className="mb-0">
                                                                    {meds.slice(0, 2).map((med, i) => (
                                                                        <li key={i}>
                                                                            {med.medicineId?.name || 'Medicine'}
                                                                            {' '}
                                                                            ({med.qty})
                                                                        </li>
                                                                    ))}
                                                                    {meds.length > 2 && (
                                                                        <li className="text-muted">
                                                                            +{meds.length - 2} more
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {prescription.createdAt
                                                                ? moment(prescription.createdAt).format('DD MMM YYYY')
                                                                : '—'}
                                                        </td>
                                                        <td>
                                                            <span className={`badge bg-${prescription.paid ? 'success' : 'warning'}`}>
                                                                {prescription.paid ? 'Paid' : 'Pending'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4">
                                                    No prescriptions found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medicine Stock Summary */}
            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Medicine Inventory Summary</h4>
                            <NavLink to="/admin/dashboard/medicines" className="btn btn-primary float-end">
                                Manage Medicines
                            </NavLink>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-6 text-center">
                                    <h3>{medicineCount}</h3>
                                    <p className="text-muted">Total Medicines</p>
                                </div>
                                <div className="col-6 text-center">
                                    <h3 className="text-warning">{lowStockCount}</h3>
                                    <p className="text-muted">Low Stock Items</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Quick Actions</h4>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                <NavLink to="/admin/dashboard/medicines/add" className="btn btn-success">
                                    <i className="fa fa-plus"></i> Add New Medicine
                                </NavLink>
                                <NavLink to="/admin/dashboard/prescriptions/new" className="btn btn-info">
                                    <i className="fa fa-file-prescription"></i> Create Prescription
                                </NavLink>
                                <NavLink to="/admin/dashboard/appointments" className="btn btn-primary">
                                    <i className="fa fa-calendar"></i> Schedule Appointment
                                </NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Box>
    );
}