import styles from './Dashboard.module.css';
import { useState, useEffect, useContext } from 'react';
import Box from '@mui/material/Box';
import { UserContext } from '../../Context/UserContext';
import axios from "axios";
import moment from "moment";
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import Button from '@mui/material/Button';
import { NavLink } from "react-router-dom";

export default function PatientDashboard() {
	const { currentUser } = useContext(UserContext);

	const [firstAppointmentInFuture, setFirstAppointmentInFuture] = useState({});
	const [prescriptions, setPrescription] = useState([]);

	// ================= DATE HELPERS =================
	const getAppMonth = (date) => {
		if (!date) return "";
		const month = new Date(date.slice(0, -1)).getMonth();
		const monthList = [
			"January","February","March","April","May","June",
			"July","August","September","October","November","December"
		];
		return monthList[month];
	};

	const getAppDate = (date) => {
		if (!date) return "";
		return new Date(date.slice(0, -1)).getDate();
	};

	const getAppYear = (date) => {
		if (!date) return "";
		return new Date(date.slice(0, -1)).getFullYear();
	};

	// ================= API: APPOINTMENTS =================
	const getBookedSlots = async () => {
		try {
			const response = await axios.post(
				`https://hospital-management-system-2-dni5.onrender.com/appointments`,
				{ isTimeSlotAvailable: false },
				{
					headers: {
						authorization: `Bearer ${localStorage.getItem("token")}`
					}
				}
			);

			if (response.data.message === "success") {
				const aptms = response.data.appointments || [];

				const futureAppointments = aptms.filter(app => {
					const date = new Date(app.appointmentDate.slice(0, -1));
					return date > new Date();
				});

				if (futureAppointments.length > 0) {
					const sorted = [...futureAppointments].sort(
						(a, b) =>
							new Date(a.appointmentDate.slice(0, -1)) -
							new Date(b.appointmentDate.slice(0, -1))
					);

					setFirstAppointmentInFuture(sorted[0]);
				}
			}
		} catch (err) {
			console.error("Appointment fetch error:", err);
		}
	};

	// ================= API: PRESCRIPTIONS =================
	const getPrescription = async () => {
		try {
			const response = await axios.post(
				`https://hospital-management-system-2-dni5.onrender.com/prescriptions`,
				{},
				{
					headers: {
						authorization: `Bearer ${localStorage.getItem("token")}`
					}
				}
			);

			if (response.data.message === "success") {
				const resp = response.data.prescriptions || [];

				const sorted = resp.sort((a, b) => {
					const timeA = new Date(
						`${moment(new Date(a.appointmentId.appointmentDate.slice(0, -1))).format('MM/DD/YYYY')} ${a.appointmentId.appointmentTime}`
					);
					const timeB = new Date(
						`${moment(new Date(b.appointmentId.appointmentDate.slice(0, -1))).format('MM/DD/YYYY')} ${b.appointmentId.appointmentTime}`
					);
					return timeB - timeA;
				});

				setPrescription(sorted);
			}
		} catch (err) {
			console.error("Prescription fetch error:", err);
		}
	};

	useEffect(() => {
		getBookedSlots();
		getPrescription();
	}, []);

	return (
		<Box className={styles.dashboardBody} component="main" sx={{ flexGrow: 1, p: 3 }}>

			{/* ================= WELCOME ================= */}
			<div id={styles.welcomeBanner}>
				<div className='text-white'>
					<h3>Welcome!</h3>
					<br />
					<h4>{currentUser?.firstName} {currentUser?.lastName}</h4>
					<br />
					<div className={styles.horizontalLine}></div>
					At Synod Hospital, we believe every patient deserves quality care.
				</div>
			</div>

			{/* ================= MAIN CONTENT ================= */}
			<div className='row mt-5 justify-content-center'>

				{/* UPCOMING APPOINTMENT */}
				<div className='col-md-6 col-sm-12'>
					<div className='customPatientApt mx-auto'>
						<div className='topicHeader'>
							<h3 className='text-center'>Upcoming Appointment</h3>
						</div>

						<div className='topicContent'>

							{firstAppointmentInFuture?.appointmentDate ? (
								<div className='contentCard'>
									<div className='apDate'>
										<p className='date'>{getAppDate(firstAppointmentInFuture.appointmentDate)}</p>
										<p>{getAppMonth(firstAppointmentInFuture.appointmentDate)}</p>
										<p>{getAppYear(firstAppointmentInFuture.appointmentDate)}</p>
									</div>

									<div className='apDetails'>
										<p><b>Doctor:</b>
											{firstAppointmentInFuture?.doctorId?.userId?.firstName}{" "}
											{firstAppointmentInFuture?.doctorId?.userId?.lastName}
										</p>

										<p><b>Department:</b>
											{firstAppointmentInFuture?.doctorId?.department}
										</p>

										<p><b>Time:</b>
											{firstAppointmentInFuture?.appointmentTime}
										</p>
									</div>
								</div>
							) : (
								<div className='contentCard-empty'>
									<p className='fw-bolder'>No upcoming appointments</p>
									<p>Book a new appointment?</p>

									<Button
										variant="contained"
										color="success"
										startIcon={<BookOnlineIcon />}
										component={NavLink}
										to="/appointments"
									>
										Book Now
									</Button>
								</div>
							)}

						</div>
					</div>
				</div>

				{/* PATIENT HISTORY */}
				<div className='col-md-6 col-sm-12'>
					<div className='customPatientApt mx-auto'>
						<div className='topicHeader'>
							<h3 className='text-center'>Patient History</h3>
						</div>

						<div className='topicContent'>

							{prescriptions?.[0]?.appointmentId ? (
								<div className='contentCard'>
									<div className='apDate'>
										<p className='date'>
											{getAppDate(prescriptions[0].appointmentId.appointmentDate)}
										</p>
										<p>
											{getAppMonth(prescriptions[0].appointmentId.appointmentDate)}
										</p>
										<p>
											{getAppYear(prescriptions[0].appointmentId.appointmentDate)}
										</p>
									</div>

									<div className='apDetails'>
										<p><b>Doctor:</b>
											{prescriptions[0]?.appointmentId?.doctorId?.userId?.firstName}{" "}
											{prescriptions[0]?.appointmentId?.doctorId?.userId?.lastName}
										</p>

										<p><b>Department:</b>
											{prescriptions[0]?.appointmentId?.doctorId?.department}
										</p>

										<p><b>Remarks:</b>
											{prescriptions[0]?.remarks}
										</p>
									</div>
								</div>
							) : (
								<div className='contentCard-empty'>
									<p className='fw-bolder'>No medical history found</p>
								</div>
							)}

						</div>
					</div>
				</div>

			</div>
		</Box>
	);
}