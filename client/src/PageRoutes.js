import { Routes, Route } from 'react-router-dom';
import React, { useContext } from 'react';

import LoginPage from './components/Login/Login';
import SignupPage from './components/SignUp/SignupPage';
import ForgotPassword from './components/Login/ForgotPassword';  // ADD THIS IMPORT

import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import PatientDashboard from './components/dashboard/PatientDashboard';

import AddUser from './components/User/AddUser3';
import UserList from "./components/User/UserList3";
import EditUser from "./components/User/EditUser3";
import User from './components/User/User';

import AddPatient from './components/Patient/AddPatient';
import PatientList from "./components/Patient/PatientList";
import EditPatient from "./components/Patient/EditPatient";
import Patient from './components/Patient/Patient';

import AddDoctor from './components/Doctor/AddDoctor';
import DoctorList from "./components/Doctor/DoctorList";
import EditDoctor from "./components/Doctor/EditDoctor";
import Doctor from './components/Doctor/Doctor';

import AddMedicine from './components/Medicine/AddMedicine';
import MedicineList from "./components/Medicine/MedicineList";
import EditMedicine from "./components/Medicine/EditMedicine";
import Medicine from './components/Medicine/Medicine';

import PrescriptionList from "./components/Prescription/PrescriptionList";
import Prescription from './components/Prescription/Prescription';

import Success from './components/Prescription/Success';
import Cancel from './components/Prescription/Cancel';

import { UserContext } from './Context/UserContext';

import AdminAppointment from './components/Appointment/AdminAppointment';
import PatientAppointment from './components/Appointment/PatientAppointment';
import DoctorAppointment from './components/Appointment/DoctorAppointment';

import DoctorProfile from './components/Profile/DoctorProfile';
import PatientProfile from './components/Profile/PatientProfile';
import AdminProfile from './components/Profile/AdminProfile';

import PatientHistory from './components/Patient/PatientHistory';
import MyPatients from './components/Doctor/MyPatients';
import Settings from './components/Common/Settings';
import HelpSupport from './components/Common/HelpSupport';

const NotFound = () => (
  <h2 style={{ margin: '70px', textAlign: 'center' }}>
    404 - This Path is not available
  </h2>
);

// Protected Admin Route
function ProtectedAdminRoute({ children }) {
  const { currentUser } = useContext(UserContext);
  if (currentUser?.userType === "Admin") {
    return children;
  }
  return <NotFound />;
}

// Protected Doctor Route
function ProtectedDoctorRoute({ children }) {
  const { currentUser } = useContext(UserContext);
  if (currentUser?.userType === "Doctor") {
    return children;
  }
  return <NotFound />;
}

// Protected Patient Route
function ProtectedPatientRoute({ children }) {
  const { currentUser } = useContext(UserContext);
  if (currentUser?.userType === "Patient") {
    return children;
  }
  return <NotFound />;
}

// Protected Staff Route (Admin or Doctor)
function ProtectedStaffRoute({ children }) {
  const { currentUser } = useContext(UserContext);
  if (currentUser?.userType === "Admin" || currentUser?.userType === "Doctor") {
    return children;
  }
  return <NotFound />;
}

// Role Based Appointments
function RoleBasedAppointments() {
  const { currentUser } = useContext(UserContext);
  if (currentUser?.userType === "Admin") {
    return <AdminAppointment />;
  }
  if (currentUser?.userType === "Doctor") {
    return <DoctorAppointment />;
  }
  if (currentUser?.userType === "Patient") {
    return <PatientAppointment />;
  }
  return <NotFound />;
}

// Role Based Profile
function RoleBasedProfile() {
  const { currentUser } = useContext(UserContext);
  if (currentUser?.userType === "Admin") {
    return <AdminProfile />;
  }
  if (currentUser?.userType === "Doctor") {
    return <DoctorProfile />;
  }
  if (currentUser?.userType === "Patient") {
    return <PatientProfile />;
  }
  return <NotFound />;
}

export default function PageRoutes() {
  return (
    <Routes>
      {/* Public Routes - Login & Signup */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />  {/* ADD THIS ROUTE */}

      {/* ============ ADMIN DASHBOARD ROUTES ============ */}
      <Route path='/admin/dashboard' element={<Dashboard />}>
        <Route index element={<AdminDashboard />} />
        
        {/* Appointments */}
        <Route path='appointments' element={
          <ProtectedAdminRoute>
            <AdminAppointment />
          </ProtectedAdminRoute>
        } />
        
        {/* Users Management */}
        <Route path='users' element={
          <ProtectedAdminRoute>
            <User />
          </ProtectedAdminRoute>
        }>
          <Route index element={<UserList />} />
          <Route path='add' element={<AddUser />} />
          <Route path='edit/:id' element={<EditUser />} />
        </Route>

        {/* Patients Management */}
        <Route path='patients' element={
          <ProtectedAdminRoute>
            <Patient />
          </ProtectedAdminRoute>
        }>
          <Route index element={<PatientList />} />
          <Route path='add' element={<AddPatient />} />
          <Route path='edit/:id' element={<EditPatient />} />
        </Route>

        {/* Doctors Management */}
        <Route path='doctors' element={
          <ProtectedAdminRoute>
            <Doctor />
          </ProtectedAdminRoute>
        }>
          <Route index element={<DoctorList />} />
          <Route path='add' element={<AddDoctor />} />
          <Route path='edit/:id' element={<EditDoctor />} />
        </Route>

        {/* Medicines Management */}
        <Route path='medicines' element={
          <ProtectedAdminRoute>
            <Medicine />
          </ProtectedAdminRoute>
        }>
          <Route index element={<MedicineList />} />
          <Route path='add' element={<AddMedicine />} />
          <Route path='edit/:id' element={<EditMedicine />} />
        </Route>

        {/* Admin Prescriptions Routes */}
        <Route path='prescriptions' element={
          <ProtectedAdminRoute>
            <Prescription />
          </ProtectedAdminRoute>
        }>
          <Route index element={<PrescriptionList />} />
          <Route path='new' element={<Prescription />} />
          <Route path='success' element={<Success />} />
          <Route path='cancel' element={<Cancel />} />
        </Route>

        {/* Admin Profile */}
        <Route path='profile' element={
          <ProtectedAdminRoute>
            <AdminProfile />
          </ProtectedAdminRoute>
        } />
        
        {/* Admin Settings */}
        <Route path='settings' element={
          <ProtectedAdminRoute>
            <Settings />
          </ProtectedAdminRoute>
        } />
        
        {/* Admin Help & Support */}
        <Route path='help' element={
          <ProtectedAdminRoute>
            <HelpSupport />
          </ProtectedAdminRoute>
        } />
      </Route>

      {/* ============ DOCTOR DASHBOARD ROUTES ============ */}
      <Route path='/doctor/dashboard' element={<Dashboard />}>
        <Route index element={<DoctorDashboard />} />
        
        {/* Doctor Appointments */}
        <Route path='appointments' element={
          <ProtectedDoctorRoute>
            <DoctorAppointment />
          </ProtectedDoctorRoute>
        } />
        
        {/* Doctor My Patients */}
        <Route path='mypatients' element={
          <ProtectedDoctorRoute>
            <MyPatients />
          </ProtectedDoctorRoute>
        } />
        
        {/* Doctor Prescriptions */}
        <Route path='prescriptions' element={
          <ProtectedDoctorRoute>
            <Prescription />
          </ProtectedDoctorRoute>
        }>
          <Route index element={<PrescriptionList />} />
          <Route path='new' element={<Prescription />} />
          <Route path='success' element={<Success />} />
          <Route path='cancel' element={<Cancel />} />
        </Route>
        
        {/* Doctor Medicines */}
        <Route path='medicines' element={
          <ProtectedDoctorRoute>
            <MedicineList />
          </ProtectedDoctorRoute>
        } />
        
        {/* Doctor Profile */}
        <Route path='profile' element={
          <ProtectedDoctorRoute>
            <DoctorProfile />
          </ProtectedDoctorRoute>
        } />
        
        {/* Doctor Settings */}
        <Route path='settings' element={
          <ProtectedDoctorRoute>
            <Settings />
          </ProtectedDoctorRoute>
        } />
        
        {/* Doctor Help & Support */}
        <Route path='help' element={
          <ProtectedDoctorRoute>
            <HelpSupport />
          </ProtectedDoctorRoute>
        } />
        
        {/* Patient History (for Doctors) */}
        <Route path='patient/history/:id' element={
          <ProtectedStaffRoute>
            <PatientHistory />
          </ProtectedStaffRoute>
        } />
      </Route>

      {/* ============ PATIENT DASHBOARD ROUTES ============ */}
      <Route path='/patient/dashboard' element={<Dashboard />}>
        <Route index element={<PatientDashboard />} />
        
        {/* Patient Appointments */}
        <Route path='appointments' element={
          <ProtectedPatientRoute>
            <PatientAppointment />
          </ProtectedPatientRoute>
        } />
        
        {/* Patient Prescriptions */}
        <Route path='prescriptions' element={
          <ProtectedPatientRoute>
            <Prescription />
          </ProtectedPatientRoute>
        }>
          <Route index element={<PrescriptionList />} />
          <Route path='new' element={<Prescription />} />
          <Route path='success' element={<Success />} />
          <Route path='cancel' element={<Cancel />} />
        </Route>
        
        {/* Patient Profile */}
        <Route path='profile' element={
          <ProtectedPatientRoute>
            <PatientProfile />
          </ProtectedPatientRoute>
        } />
        
        {/* Patient Settings */}
        <Route path='settings' element={
          <ProtectedPatientRoute>
            <Settings />
          </ProtectedPatientRoute>
        } />
        
        {/* Patient Help & Support */}
        <Route path='help' element={
          <ProtectedPatientRoute>
            <HelpSupport />
          </ProtectedPatientRoute>
        } />
      </Route>

      {/* Role-based generic routes (can be accessed from any dashboard) */}
      <Route path='/appointments' element={<RoleBasedAppointments />} />
      <Route path='/profile' element={<RoleBasedProfile />} />

      {/* Default Route - Redirect to Login */}
      <Route path='/' element={<LoginPage />} />

      {/* 404 Not Found Route - Catch all unmatched routes */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}