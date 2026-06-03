import styles from './Dashboard.module.css';
import React, { useState, useEffect, useContext } from 'react';
import Box from '@mui/material/Box';
import { UserContext } from '../../Context/UserContext';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from "axios";
import moment from "moment";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

export default function DoctorDashboard() {

  const { currentUser } = useContext(UserContext);

  const navigate = useNavigate();

  const [appsTodayCount, setAppsTodayCount] = useState(0);
  const [pendingAppsTodayCount, setPendingAppsTodayCount] = useState(0);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [patientsTreatedCount, setPatientsTreatedCount] = useState(0);
  const [prescriptions, setPrescription] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // AUTH CHECK
  // =========================

  useEffect(() => {

    const storedToken = localStorage.getItem("token");

    if (!storedToken || !currentUser?.userType) {
      navigate('/login');
      return;
    }

    if (currentUser.userType !== 'Doctor') {
      navigate('/login');
      return;
    }

    setLoading(false);

  }, [currentUser, navigate]);

  // =========================
  // GET APPOINTMENT COUNT
  // =========================

  const getAppointmentCount = async () => {

    try {

      const response = await axios.get(
        `https://hospital-management-system-2-dni5.onrender.com/count/appointments`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response?.data?.totalAppointments) {
        setAppsTodayCount(response?.data?.totalAppointments);
      }

      if (response?.data?.pendingAppointments) {
        setPendingAppsTodayCount(response?.data?.pendingAppointments);
      }

    } catch (error) {
      console.error("Error fetching appointment count:", error);
    }
  };

  // =========================
  // GET PATIENT COUNT
  // =========================

  const getPatientsTreatedCount = async () => {

    try {

      const response = await axios.get(
        `https://hospital-management-system-2-dni5.onrender.com/count/patients/treated`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response?.data?.treatedPatients) {
        setPatientsTreatedCount(response?.data?.treatedPatients);
      }

    } catch (error) {
      console.error("Error fetching patients count:", error);
    }
  };

  // =========================
  // GET TODAY APPOINTMENTS
  // =========================

  const getBookedSlots = async () => {

    try {

      let response = await axios.post(
        `https://hospital-management-system-2-dni5.onrender.com/appointments`,
        {
          isTimeSlotAvailable: false,
          appDate: moment(new Date()).format('YYYY-MM-DD')
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.message === "success") {

        let aptms = response.data.appointments;

        setBookedAppointments(aptms);
      }

    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  // =========================
  // GET PRESCRIPTIONS
  // =========================

  const getPrescription = async () => {

    try {

      let response = await axios.post(
        `https://hospital-management-system-2-dni5.onrender.com/prescriptions`,
        {},
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.message === "success") {

        let respPrescription = response.data.prescriptions;

        let newResp = respPrescription.sort((a, b) => {

          const timeA = new Date(
            `${moment(
              new Date(a.appointmentId.appointmentDate.slice(0, -1))
            ).format('MM/DD/YYYY')} ${a.appointmentId.appointmentTime}`
          );

          const timeB = new Date(
            `${moment(
              new Date(b.appointmentId.appointmentDate.slice(0, -1))
            ).format('MM/DD/YYYY')} ${b.appointmentId.appointmentTime}`
          );

          return timeB - timeA;
        });

        setPrescription(newResp);
      }

    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    if (!loading && currentUser?.userType) {

      getAppointmentCount();

      getBookedSlots();

      getPatientsTreatedCount();

      getPrescription();
    }

  }, [loading, currentUser]);

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // =========================
  // NOT LOGGED IN
  // =========================

  if (!currentUser?.userType) {

    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Please login to access the dashboard
        </Alert>
      </Box>
    );
  }

  // =========================
  // UI
  // =========================

  return (

    <Box
      className={styles.dashboardBody}
      component="main"
      sx={{ flexGrow: 1, p: 3 }}
    >

      {/* WELCOME */}

      <div id={styles.welcomeBanner}>

        <div className='text-white'>

          <h3>Welcome!</h3>

          <br />

          <h4>
            Dr. {currentUser?.firstName || ''} {currentUser?.lastName || ''}
          </h4>

          <br />

          <div className={styles.horizontalLine}></div>

          At Synod Hospital, we believe that every patient deserves the highest
          quality care possible.

          <br />

          Our commitment to excellence in healthcare is matched only by our
          compassion for those we serve.

        </div>

      </div>

      {/* CARDS */}

      <div className={styles.statCardGridDoctor}>

        <div className={styles.statCard}>

          <div className={styles.dashWidget}>

            <span className={styles.dashWidgetBg2}>
              <i className="fa fa-user-o" aria-hidden="true"></i>
            </span>

            <div className={styles.dashWidgetInfo}>

              <h3 className={styles.dashWidgetInfoH3}>
                {patientsTreatedCount}
              </h3>

              <span className={styles.widgetTitle2}>
                Total Patients Treated
              </span>

            </div>

          </div>

        </div>

        <div className={styles.statCard}>

          <div className={styles.dashWidget}>

            <span className={styles.dashWidgetBg3}>
              <i className="fa fa-calendar" aria-hidden="true"></i>
            </span>

            <div className={styles.dashWidgetInfo}>

              <h3 className={styles.dashWidgetInfoH3}>
                {appsTodayCount}
              </h3>

              <span className={styles.widgetTitle3}>
                Appointments Today
              </span>

            </div>

          </div>

        </div>

        <div className={styles.statCard}>

          <div className={styles.dashWidget}>

            <span className={styles.dashWidgetBg4}>
              <i className="fa fa-heartbeat" aria-hidden="true"></i>
            </span>

            <div className={styles.dashWidgetInfo}>

              <h3 className={styles.dashWidgetInfoH3}>
                {pendingAppsTodayCount}
              </h3>

              <span className={styles.widgetTitle4}>
                Pending Appointments
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* APPOINTMENTS */}

      <div className="row">

        <div className="col-12 col-lg-8 col-xl-8">

          <div className="card appointment-panel">

            <div className="card-header">

              <h4 className="card-title d-inline-block">
                Upcoming Appointments
              </h4>

              <NavLink
                to="/doctor/dashboard/appointments"
                className="btn btn-primary float-end"
              >
                View all
              </NavLink>

            </div>

            <div className="card-body">

              <div className="table-responsive">

                {bookedAppointments?.length > 0 ? (

                  <table className="table mb-0">

                    <tbody>

                      {bookedAppointments.map((apt) => (

                        <tr key={apt._id}>

                          <td className={styles.appointmentTableTd}>

                            <NavLink
                              className="avatar"
                              to={`/doctor/dashboard/patient/history/${apt?.patientId?._id}`}
                            >
                              {apt?.patientId?.userId?.firstName?.charAt(0)}
                            </NavLink>

                            <h2 className="ps-3">

                              <NavLink
                                to={`/doctor/dashboard/patient/history/${apt?.patientId?._id}`}
                              >
                                {apt?.patientId?.userId?.firstName}
                                {" "}
                                {apt?.patientId?.userId?.lastName}

                                <span>
                                  {apt?.patientId?.address}
                                </span>

                              </NavLink>

                            </h2>

                          </td>

                          <td>

                            <h5 className="time-title p-0">
                              Appointment With
                            </h5>

                            <p>
                              Dr. {apt?.doctorId?.userId?.firstName}
                              {" "}
                              {apt?.doctorId?.userId?.lastName}
                            </p>

                          </td>

                          <td>

                            <h5 className="time-title p-0">
                              Timing
                            </h5>

                            <p>{apt?.appointmentTime}</p>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                ) : (

                  <h3 className="mt-5 text-center">
                    You have no appointments today
                  </h3>

                )}

              </div>

            </div>

          </div>

        </div>

        {/* COMPLETED */}

        <div className="col-12 col-lg-4 col-xl-4">

          <div className="card member-panel">

            <div className="card-header bg-white">

              <h4 className="card-title mb-0">
                Completed Appointments
              </h4>

            </div>

            <div className="card-body">

              {prescriptions?.length > 0 ? (

                <ul className="contact-list">

                  {prescriptions.map((pre) => (

                    <li key={pre._id}>

                      <div className="contact-cont">

                        <div className="float-left user-img m-r-10"></div>

                        <div className="contact-info">

                          <span className="contact-name text-ellipsis">

                            {pre.appointmentId?.patientId?.userId?.firstName}
                            {" "}
                            {pre.appointmentId?.patientId?.userId?.lastName}

                          </span>

                          <span className="contact-date">
                            Remarks: {pre.remarks}
                          </span>

                        </div>

                      </div>

                    </li>

                  ))}

                </ul>

              ) : (

                <p className="text-center">
                  No completed appointments
                </p>

              )}

            </div>

            <div className="card-footer text-center bg-white">

              <NavLink
                to="/doctor/dashboard/appointments"
                className="text-muted"
              >
                View all
              </NavLink>

            </div>

          </div>

        </div>

      </div>

    </Box>
  );
}